import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_KEY } from "@/constants/token.constant";

import dayjs from "@/lib/dayjs";
import { deleteCookie } from "cookies-next";

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
    const { expiration_date } = JSON.parse(currentUser);
    console.log("expiration_date", expiration_date);
    console.log("expiration_date", !dayjs().isSameOrAfter(expiration_date));
    if (dayjs().isSameOrAfter(expiration_date)) {
      deleteCookie(ACCESS_TOKEN_KEY);
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }
}
