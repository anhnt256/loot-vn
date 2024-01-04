import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_KEY } from "@/constants/token.constant";
import dayjs from "@/lib/dayjs";


export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith("/_next") || // exclude Next.js internals
    pathname.startsWith("/static") || // exclude static files
    pathname.startsWith("/api") // exclude API routes
  )
    return NextResponse.next();
  if (currentUser) {
    const { expiration_date } = currentUser;
    if (!dayjs().isSameOrAfter(expiration_date)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }
}
