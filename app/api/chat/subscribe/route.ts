import { NextRequest } from "next/server";
import { redisService } from "@/lib/redis-service";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const machineName = searchParams.get("machineName");

    if (!machineName) {
      return new Response("Machine name is required", { status: 400 });
    }

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        // For ALL chat, always use global channels
        const branchChannel = 'chat:all';
        const onlineKey = 'chat:online:all';
        const userKey = `${machineName}:all`;

        // Add user to online set and broadcast online count
        redisService.sadd(onlineKey, userKey).then(async () => {
          try {
            // Get current online count and broadcast
            const onlineCount = await redisService.scard(onlineKey);
            
            const onlineData = `data: ${JSON.stringify({ 
              type: 'online_count', 
              count: onlineCount,
              branch: 'all'
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(onlineData));
            
            // Publish to channel to notify other users
            await redisService.publish(branchChannel, {
              type: 'online_count',
              count: onlineCount,
              branch: 'all'
            });
          } catch (error) {
            console.error('Error in SSE online count broadcast:', error);
          }
        }).catch(console.error);

        // Send initial connection message
        try {
          const initData = `data: ${JSON.stringify({ 
            type: 'connected', 
            message: 'Connected to ALL chat',
            branch: 'all'
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(initData));
        } catch (error) {
          console.error('Error sending initial SSE message:', error);
        }

        // Subscribe to branch group chat channel
        redisService.subscribe(branchChannel, (messageData) => {
          try {
            const data = `data: ${JSON.stringify(messageData)}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          } catch (error) {
            console.error('Error enqueueing message to SSE stream:', error);
          }
        }).catch(error => {
          console.error('Error subscribing to branch channel:', error);
        });

        // Handle client disconnect
        req.signal?.addEventListener('abort', async () => {
          // Remove user from online set and broadcast updated count
          try {
            await redisService.srem(onlineKey, userKey);
            
            // Get updated online count and broadcast to remaining users
            const onlineCount = await redisService.scard(onlineKey);
            
            const onlineData = `data: ${JSON.stringify({ 
              type: 'online_count', 
              count: onlineCount,
              branch: 'all'
            })}\n\n`;
            
            // Broadcast to all users in the branch
            await redisService.publish(branchChannel, {
              type: 'online_count',
              count: onlineCount,
              branch: 'all'
            });
          } catch (error) {
            console.error('SSE: Error during disconnect cleanup:', error);
          }
          
          redisService.unsubscribe(branchChannel).catch(console.error);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error('Error setting up SSE:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
