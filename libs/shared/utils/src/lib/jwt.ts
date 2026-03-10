// utils/jwt.ts
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "gateway2025",
);

export interface JWTPayload {
  userId: string | number;
  userName?: string;
  role?: string;
  [key: string]: any;
}

export async function signJWT(payload: JWTPayload) {
  const alg = "HS256";

  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}
