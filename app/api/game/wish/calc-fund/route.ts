import { NextResponse } from "next/server";
import Redis from "ioredis";

if (!process.env.NEXT_PUBLIC_REDIS_URL) {
  throw new Error("REDIS_URL is not defined");
}

const redis = new Redis(process.env.NEXT_PUBLIC_REDIS_URL || "");

const CACHE_TTL = 20; // 1 hour in seconds

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redis.on("connect", () => {
  console.log("Successfully connected to Redis");
});

export async function GET() {
  // await redis.del("test-cache");

  const cacheKey = `test-cache`;

  const test = new Date().getTime();

  const cachedUser = await redis.get(cacheKey);
  if (cachedUser) {
    return NextResponse.json(JSON.parse(cachedUser));
  }

  if (test) {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(test));
  }

  try {
    return NextResponse.json(test);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
