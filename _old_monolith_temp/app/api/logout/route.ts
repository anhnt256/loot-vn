import apiClient from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";
import { getCookie } from "cookies-next";
import { ACCESS_TOKEN_KEY } from "@/constants/token.constant";

export async function POST(req: NextRequest, res: Response): Promise<any> {
  try {
    const response = NextResponse.json({ success: true }, { status: 200 });

    // Xác định đang logout từ admin hay staff dựa trên cookies và referer
    const referer = req.headers.get("referer") || "";
    const token = req.cookies.get("token")?.value;
    const staffToken = req.cookies.get("staffToken")?.value;
    const loginType = req.cookies.get("loginType")?.value;

    // Xác định logout type:
    // 1. Nếu có cả 2 cookies, ưu tiên referer để xác định
    // 2. Nếu chỉ có 1 cookie, dựa vào cookie đó
    const isAdminLogout =
      referer.includes("/admin") ||
      (token && !staffToken) ||
      (token && staffToken && referer.includes("/admin"));

    const isStaffLogout =
      referer.includes("/staff") ||
      (staffToken && !token) ||
      (token && staffToken && referer.includes("/staff"));

    if (isAdminLogout) {
      // Admin logout: chỉ clear token và các thông tin liên quan đến admin
      response.cookies.delete("token");
      // Chỉ clear loginType và branch nếu loginType là "username" (admin login)
      // Nếu loginType là "mac" thì branch có thể được dùng chung với staff
      if (loginType === "username") {
        response.cookies.delete("loginType");
        response.cookies.delete("branch");
      }
    } else if (isStaffLogout) {
      // Staff logout: chỉ clear staffToken và các thông tin liên quan đến staff
      response.cookies.delete("staffToken");
      // Chỉ clear loginType và branch nếu loginType là "account" (staff login)
      if (loginType === "account") {
        response.cookies.delete("loginType");
        response.cookies.delete("branch");
      }
    } else {
      // Fallback: nếu không xác định được, clear cả 2 (backward compatibility)
      response.cookies.delete("token");
      response.cookies.delete("staffToken");
      response.cookies.delete("loginType");
      response.cookies.delete("branch");
    }

    return response;
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
