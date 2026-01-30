import { useMutation } from "@tanstack/react-query";
import { deleteCookie, setCookie, getCookie } from "cookies-next";
import { ACCESS_TOKEN_KEY, CURRENT_USER } from "@/constants/token.constant";
import dayjs from "@/lib/dayjs";
import isEmpty from "lodash/isEmpty";
import { clearUserData, clearAdminData, clearStaffData } from "@/lib/utils";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

interface LoginParams {
  userName: string;
  machineName?: string;
  isAdmin?: boolean;
  password?: string;
  loginMethod?: "mac" | "account";
  macAddress?: string;
  currentMacAddress?: string;
  branch?: string;
}

export const postLogin = async ({
  userName,
  machineName,
  isAdmin,
  password,
  loginMethod,
  macAddress,
  currentMacAddress,
  branch,
}: LoginParams): Promise<any> => {
  const result = await fetch("api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ userName, machineName, isAdmin, password, loginMethod, macAddress, currentMacAddress, branch }),
  });

  const resultText = await result.text();
  const statusCode = result.status;

  if (resultText.includes("Duplicate account")) {
    return {
      statusCode: 499,
      data: null,
      message:
        "Bạn có tài khoản tại 2 chi nhánh, để tránh nhầm lẫn, vui lòng liên hệ nhân viên để được xử lý chính xác. Xin cảm ơn.",
    };
  }

  if (statusCode >= 200 && statusCode < 300) {
    try {
      const data = JSON.parse(resultText);
      const { userId, userName } = data || {};
      
      if (isEmpty(userName) && !isAdmin) {
        return {
          statusCode: 700,
          data: null,
        };
      }
      
      // Ensure workShifts is included in the data
      console.log("[Login] Saving to localStorage, workShifts:", data.workShifts?.length || 0);
      localStorage.setItem(CURRENT_USER, JSON.stringify(data));
      
      // Verify it was saved correctly
      const saved = localStorage.getItem(CURRENT_USER);
      if (saved) {
        const savedData = JSON.parse(saved);
        console.log("[Login] Verified localStorage, workShifts:", savedData.workShifts?.length || 0);
      }
      
      return { statusCode: 200, data: data, message: "Login Success" };
    } catch (parseError) {
      return {
        statusCode: 500,
        data: null,
        message: "Lỗi khi xử lý dữ liệu từ server",
      };
    }
  }

  try {
    const errorData = JSON.parse(resultText);
    return {
      statusCode: statusCode,
      data: null,
      message: errorData.message || "Đã xảy ra lỗi",
    };
  } catch (parseError) {
    return {
      statusCode: statusCode,
      data: null,
      message: "Thông tin tài khoản hoặc chi nhánh không đúng. Vui lòng kiểm tra và thử lại!",
    };
  }
};

export const postLogout = async (): Promise<any> => {
  const result = await fetch("api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const resultText = await result.text();
  const statusCode = result.status;

  if (statusCode >= 200 && statusCode < 300) {
    // Xác định đang logout từ admin hay staff
    let redirectPath = "/staff-login"; // default
    let isAdminLogout = false;
    let isStaffLogout = false;
    
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath.includes("/admin")) {
        redirectPath = "/admin-login";
        isAdminLogout = true;
      } else if (currentPath.includes("/staff")) {
        redirectPath = "/staff-login";
        isStaffLogout = true;
      } else {
        // Nếu không xác định được từ pathname, dựa vào cookies
        const token = getCookie(ACCESS_TOKEN_KEY);
        const staffToken = getCookie("staffToken");
        if (token && !staffToken) {
          isAdminLogout = true;
          redirectPath = "/admin-login";
        } else if (staffToken && !token) {
          isStaffLogout = true;
          redirectPath = "/staff-login";
        }
      }
    }

    // Clear cookies và data tương ứng
    if (isAdminLogout) {
      // Admin logout: chỉ clear token và các thông tin liên quan
      deleteCookie(ACCESS_TOKEN_KEY);
      const loginType = getCookie("loginType");
      if (loginType === "username") {
        deleteCookie("loginType");
        deleteCookie("branch");
      } else {
        deleteCookie("loginType");
      }
      clearAdminData();
    } else if (isStaffLogout) {
      // Staff logout: chỉ clear staffToken và các thông tin liên quan
      deleteCookie("staffToken");
      const loginType = getCookie("loginType");
      if (loginType === "account") {
        deleteCookie("loginType");
        deleteCookie("branch");
      } else {
        deleteCookie("loginType");
      }
      clearStaffData();
    } else {
      // Fallback: clear tất cả (backward compatibility)
      deleteCookie(ACCESS_TOKEN_KEY);
      deleteCookie("staffToken");
      deleteCookie("loginType");
      deleteCookie("branch");
      clearUserData();
    }
    
    return { statusCode: 200, data: null, redirectPath };
  }

  try {
    const errorData = JSON.parse(resultText);
    return {
      statusCode: statusCode,
      data: null,
      message: errorData.message || "Đã xảy ra lỗi khi đăng xuất",
    };
  } catch (parseError) {
    return {
      statusCode: statusCode,
      data: null,
      message: "Đã xảy ra lỗi khi đăng xuất",
    };
  }
};

export const verifyStaffUsername = async (userName: string, branch: string): Promise<any> => {
  const result = await fetch("api/staff/verify-username", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ userName, branch }),
  });

  const resultText = await result.text();
  const statusCode = result.status;

  if (statusCode >= 200 && statusCode < 300) {
    try {
      const data = JSON.parse(resultText);
      return { statusCode: 200, data: data.data, message: data.message };
    } catch (parseError) {
      return {
        statusCode: 500,
        data: null,
        message: "Lỗi khi xử lý dữ liệu từ server",
      };
    }
  }

  try {
    const errorData = JSON.parse(resultText);
    return {
      statusCode: statusCode,
      data: null,
      message: errorData.message || "Đã xảy ra lỗi",
    };
  } catch (parseError) {
    return {
      statusCode: statusCode,
      data: null,
      message: "Lỗi khi xác minh tên đăng nhập",
    };
  }
};

export const updateStaffPassword = async (staffId: number, newPassword: string, branch: string): Promise<any> => {
  const result = await fetch("api/staff/update-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ staffId, newPassword, branch }),
  });

  const resultText = await result.text();
  const statusCode = result.status;

  if (statusCode >= 200 && statusCode < 300) {
    try {
      const data = JSON.parse(resultText);
      return { statusCode: 200, data: data.data, message: data.message };
    } catch (parseError) {
      return {
        statusCode: 500,
        data: null,
        message: "Lỗi khi xử lý dữ liệu từ server",
      };
    }
  }

  try {
    const errorData = JSON.parse(resultText);
    return {
      statusCode: statusCode,
      data: null,
      message: errorData.message || "Đã xảy ra lỗi",
    };
  } catch (parseError) {
    return {
      statusCode: statusCode,
      data: null,
      message: "Lỗi khi cập nhật mật khẩu",
    };
  }
};

export const useLogin = () => useMutation({ mutationFn: postLogin });
export const useLogout = () => useMutation({ mutationFn: postLogout });
