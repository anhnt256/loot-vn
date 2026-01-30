import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyJWT } from "@/lib/jwt";
import { db } from "@/lib/db";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check if store is disabled
  const STORE_DISABLED = process.env.NEXT_PUBLIC_STORE_DISABLED === "true";
  
  // Check if battle pass is disabled
  const BATTLE_PASS_DISABLED = process.env.NEXT_PUBLIC_GATEWAY_BATTLE_PASS_ENABLE !== "true";
  
  // Store-related API routes that should be blocked when store is disabled
  const storeApiRoutes = [
    "/api/reward",
    "/api/reward-exchange",
    "/api/gift-rounds",
  ];

  // Battle Pass-related API routes that should be blocked when battle pass is disabled
  const battlePassApiRoutes = [
    "/api/battle-pass/progress",
    "/api/battle-pass/sync-progress",
    "/api/battle-pass/update-progress",
    "/api/battle-pass/update-spending",
    "/api/battle-pass/claim-reward",
    "/api/battle-pass/purchase-vip",
    "/api/battle-pass/check-vip-status",
    "/api/battle-pass/current-season",
  ];

  // Block store API routes when store is disabled
  if (STORE_DISABLED && storeApiRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.json(
      { 
        error: "Service temporarily unavailable", 
        message: "Tính năng đổi thưởng đang tạm khóa để bảo trì. Vui lòng thử lại sau." 
      },
      { status: 503 }
    );
  }

  // Block battle pass API routes when battle pass is disabled
  if (BATTLE_PASS_DISABLED && battlePassApiRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.json(
      { 
        error: "Service temporarily unavailable", 
        message: "Tính năng Battle Pass đang tạm khóa. Vui lòng thử lại sau." 
      },
      { status: 503 }
    );
  }

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
    "/api/staff/verify-username",
    "/api/staff/update-password",
    "/api/staff/my-info",
    "/api/staff/time-tracking",
    "/api/staff/salary",
    "/api/staff/salary/history",
    "/api/staff/penalties",
    "/api/manager/my-info",
    "/api/manager/bonus",
    "/api/manager/penalty",
    "/admin-login",
    "/staff-login",
  ];

  // Check for dynamic staff update request route
  if (request.nextUrl.pathname.match(/^\/api\/staff\/\d+\/update-request$/)) {
    return response;
  }

  if (publicPaths.includes(request.nextUrl.pathname)) {
    return response;
  }

  // Verify token cho tất cả API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Tách biệt rõ ràng: staff/manager APIs chỉ dùng staffToken, admin APIs chỉ dùng token
    const isStaffOrManagerApi = 
      request.nextUrl.pathname.startsWith("/api/staff") || 
      request.nextUrl.pathname.startsWith("/api/manager");
    
    let token: string | undefined;
    if (isStaffOrManagerApi) {
      // Staff/Manager APIs: CHỈ check staffToken
      token = request.cookies.get("staffToken")?.value;
    } else {
      // Admin và các APIs khác: CHỈ check token
      token = request.cookies.get("token")?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 },
      );
    }

    const payload = await verifyJWT(token);

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

  // Lấy token từ cookie - tách biệt rõ ràng admin và staff
  const token = request.cookies.get("token")?.value;
  const staffToken = request.cookies.get("staffToken")?.value;

  // Kiểm tra nếu route bắt đầu bằng /staff
  if (request.nextUrl.pathname.startsWith("/staff")) {
    // Skip authentication check for staff login page
    if (request.nextUrl.pathname === "/staff-login") {
      return NextResponse.next();
    }

    // Nếu không có staffToken, chuyển hướng về trang staff-login
    if (!staffToken) {
      return NextResponse.redirect(new URL("/staff-login", request.url));
    }

    try {
      const payload = await verifyJWT(staffToken);

      if (!payload) {
        return NextResponse.redirect(new URL("/staff-login", request.url));
      }

      // Kiểm tra quyền staff
      if (payload.role !== "staff") {
        return NextResponse.redirect(new URL("/staff-login", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Nếu token không hợp lệ, chuyển hướng về trang staff-login
      return NextResponse.redirect(new URL("/staff-login", request.url));
    }
  }

  // Kiểm tra nếu route bắt đầu bằng /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {

    // Skip authentication check for admin login page
    if (request.nextUrl.pathname === "/admin-login") {
      return NextResponse.next();
    }

    // Kiểm tra quyền truy cập trang gift-rounds - cho phép tất cả admin
    // Bỏ logic giới hạn theo loginType vì không hợp lý
    // if (request.nextUrl.pathname === "/admin/gift-rounds") {
    //   const loginType = request.cookies.get("loginType")?.value;
    //   if (loginType !== "username") {
    //     console.log("Middleware - Unauthorized access to gift-rounds page");
    //     return NextResponse.redirect(new URL("/admin", request.url));
    //   }
    // }

    // Admin routes: CHỈ check token, không check staffToken
    if (!token) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }

    try {
      const payload = await verifyJWT(token);

      if (!payload) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Kiểm tra quyền admin/staff
      if (payload.role !== "admin" && payload.role !== "staff") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Nếu role là "staff", cho phép truy cập /staff và /manager route
      if (payload.role === "staff") {
        const currentPath = request.nextUrl.pathname;
        const branch = request.cookies.get("branch")?.value;
        const userName = payload.userName;

        // Kiểm tra staffType từ database để xác định quyền truy cập /manager
        let isManager = false;
        try {
          if (userName && branch) {
            const staff = await db.$queryRawUnsafe(
              `SELECT staffType FROM Staff WHERE userName = ? AND branch = ? AND isDeleted = false LIMIT 1`,
              userName,
              branch,
            ) as any[];

            if (staff.length > 0) {
              const staffType = staff[0].staffType;
              isManager = staffType === "MANAGER" || staffType === "SUPER_ADMIN" || staffType === "BRANCH_ADMIN";
            }
          }
        } catch (error) {
          console.error("Error checking staffType in middleware:", error);
          // Default to regular staff if error
        }

        // Cho phép tất cả staff truy cập /staff
        if (currentPath.startsWith("/staff")) {
          return NextResponse.next();
        }

        // Chỉ manager mới được truy cập /manager
        if (currentPath.startsWith("/manager")) {
          if (!isManager) {
            return NextResponse.redirect(new URL("/staff", request.url));
          }
          return NextResponse.next();
        }

        // Redirect staff về /staff nếu truy cập route khác
        return NextResponse.redirect(new URL("/staff", request.url));
      }

      // Kiểm tra quyền truy cập trang dựa trên loại đăng nhập
      const loginType = request.cookies.get("loginType")?.value;
      const currentPath = request.nextUrl.pathname;
      
      // Các trang chỉ admin (loginType === "username") mới được truy cập
      const adminOnlyPages = [
        "/admin/gift-rounds",
        "/admin/battle-pass-seasons", 
        "/admin/battle-pass-premium-packages",
        "/admin/feedback",
        "/admin/staff"
      ];
      
      // Nếu là trang chỉ dành cho admin và user không phải admin (loginType !== "username")
      if (adminOnlyPages.includes(currentPath) && loginType !== "username") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Nếu token không hợp lệ, chuyển hướng về trang login
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Block access to store page when store is disabled
  if (STORE_DISABLED && request.nextUrl.pathname === "/store") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Block access to battle pass page when battle pass is disabled
  if (BATTLE_PASS_DISABLED && request.nextUrl.pathname === "/battle-pass") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
