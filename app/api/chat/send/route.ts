import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redisService } from "@/lib/redis-service";
import { cookies } from "next/headers";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";
import { saveChatMessage, getChatMessageById } from "@/lib/chat-utils";
import { messageRateLimit } from "@/lib/chat-rate-limit";
import { validateChatMessage, sanitizeMessage } from "@/lib/chat-validation";
import { chatCache } from "@/lib/chat-cache";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branchFromCookie = cookieStore.get("branch")?.value;

    // Branch is optional for ALL chat - use 'all' as default
    const branch = branchFromCookie || 'all';

    const { content, machineName, staffId } = await req.json();

    // Validate input data
    const validation = validateChatMessage({ content, machineName, userId: null, staffId });
    if (!validation.isValid) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Validation failed",
          data: { errors: validation.errors },
        },
        { status: 400 }
      );
    }

    // Sanitize content
    const sanitizedContent = sanitizeMessage(content);

    // Get user info from headers (set by middleware)
    const userHeader = req.headers.get("user");
    if (!userHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = JSON.parse(userHeader);
    // Handle userId as integer (admin uses -99)
    const userId = decoded.userId ? parseInt(decoded.userId.toString(), 10) : null;
    

    // Check rate limit
    const rateLimitKey = `${userId || 'anonymous'}:${machineName}`;
    const rateLimit = await messageRateLimit.checkLimit(rateLimitKey);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          statusCode: 429,
          message: "Rate limit exceeded",
          data: {
            remaining: rateLimit.remaining,
            resetTime: rateLimit.resetTime,
          },
        },
        { status: 429 }
      );
    }

    // Save message to database using utility function
    const messageId = await saveChatMessage({
      content: sanitizedContent,
      userId,
      machineName,
      branch: branch,
      staffId,
    });

    // Get the message with user info
    const message = await getChatMessageById(messageId, branch);

    if (!message) {
      return NextResponse.json(
        {
          statusCode: 500,
          message: "Failed to create message",
          data: null,
        },
        { status: 500 }
      );
    }

    // Publish message to global ALL chat channel
    const branchChannel = 'chat:all';
    
    const messageData = {
      id: message.id,
      content: message.content,
      userId: message.userId,
      machineName: message.machineName,
      branch: message.branch,
      createdAt: message.createdAt,
      staffId: message.staffId,
      userName: message.userName,
    };

    // Publish to branch group chat channel
    await redisService.publish(branchChannel, messageData);

    // Invalidate cache for this machine
    await chatCache.invalidateMachineCache(machineName, branch);

    return NextResponse.json(
      {
        statusCode: 200,
        message: "Message sent successfully",
        data: messageData,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        statusCode: 500,
        message: "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}
