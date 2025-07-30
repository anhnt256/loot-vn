import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyJWT } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  console.log("Middleware - Request path:", request.nextUrl.pathname);

  const publicPaths = [
    "/",
    "/api/login",
    "/api/check-branch",
    "/api/user/check-existing",
    "/api/battle-pass/test-progress",
    "/api/battle-pass/test-sync",
    "/api/handover-reports/check-completion",
    "/api/handover-reports/get-report-data",
    "/api/handover-reports/submit-report",
    "/api/handover-reports/materials",
    "/api/staff",
    "/admin-login",
  ];

  if (publicPaths.includes(request.nextUrl.pathname)) {
    console.log("Middleware - Public path, allowing access");
    return response;
  }

  // Verify token cho tất cả API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const token = request.cookies.get("token")?.value;
    console.log(
      "Middleware - API route, token:",
      token ? "exists" : "not found",
    );

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 },
      );
    }

    const payload = await verifyJWT(token);
    console.log("Middleware - API route, payload:", payload);

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }

    // Thêm user info vào headers để có thể dùng trong API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("user", JSON.stringify(payload));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Lấy token từ cookie
  const token = request.cookies.get("token")?.value;
  console.log("Middleware - Token:", token ? "exists" : "not found");

  // Kiểm tra nếu route bắt đầu bằng /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    console.log("Middleware - Admin route detected");

    // Skip authentication check for admin login page
    if (request.nextUrl.pathname === "/admin-login") {
      return NextResponse.next();
    }

    // Kiểm tra quyền truy cập trang gift-rounds
    if (request.nextUrl.pathname === "/admin/gift-rounds") {
      const loginType = request.cookies.get("loginType")?.value;
      if (loginType !== "username") {
        console.log("Middleware - Unauthorized access to gift-rounds page");
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    // Nếu không có token, chuyển hướng về trang login
    if (!token) {
      console.log("Middleware - No token, redirecting to login");
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }

    try {
      const payload = await verifyJWT(token);
      console.log("Middleware - Admin route, payload:", payload);

      if (!payload) {
        console.log("Middleware - Invalid token, redirecting to login");
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Kiểm tra quyền admin
      if (payload.role !== "admin") {
        console.log("Middleware - Not admin role, redirecting to login");
        return NextResponse.redirect(new URL("/", request.url));
      }

      console.log("Middleware - Admin access granted");
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware - Token verification error:", error);
      // Nếu token không hợp lệ, chuyển hướng về trang login
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
    "/admin/:path*",
  ],
};
