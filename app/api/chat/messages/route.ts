import { NextRequest, NextResponse } from "next/server";
import { getChatMessages } from "@/lib/chat-utils";
import { cookies } from "next/headers";
import { validatePagination, validateMachineName } from "@/lib/chat-validation";
import { apiRateLimit } from "@/lib/chat-rate-limit";
import { chatCache } from "@/lib/chat-cache";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branchFromCookie = cookieStore.get("branch")?.value;

    // Branch is optional for ALL chat

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";
    const machineName = searchParams.get("machineName");
    const userId = searchParams.get("userId");
    const staffId = searchParams.get("staffId");

    // Validate pagination parameters
    const paginationValidation = validatePagination(page, limit);
    if (!paginationValidation.isValid) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Invalid pagination parameters",
          data: { errors: paginationValidation.errors },
        },
        { status: 400 },
      );
    }

    // Validate machine name if provided
    if (machineName) {
      const machineValidation = validateMachineName(machineName);
      if (!machineValidation.isValid) {
        return NextResponse.json(
          {
            statusCode: 400,
            message: "Invalid machine name",
            data: { errors: machineValidation.errors },
          },
          { status: 400 },
        );
      }
    }

    // Check rate limit
    const rateLimitKey = `messages:${branchFromCookie || "all"}`;
    const rateLimit = await apiRateLimit.checkLimit(rateLimitKey);

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
        { status: 429 },
      );
    }

    const numPage = parseInt(page, 10);
    const numLimit = parseInt(limit, 10);

    // For ALL chat, get all messages from all branches (no branch filter)
    const result = await getChatMessages(null, {
      page: numPage,
      limit: numLimit,
      // Don't filter by machineName for group chat
      userId: userId ? parseInt(userId, 10) : undefined,
      staffId: staffId ? parseInt(staffId, 10) : undefined,
    });

    const totalPages = Math.ceil(Number(result.total) / numLimit);

    return NextResponse.json(
      {
        statusCode: 200,
        message: "Messages retrieved successfully",
        data: {
          messages: result.messages,
          pagination: {
            page: numPage,
            limit: numLimit,
            total: Number(result.total),
            totalPages,
            hasNext: result.hasMore,
            hasPrev: numPage > 1,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: "Internal server error",
        data: null,
      },
      { status: 500 },
    );
  }
}
