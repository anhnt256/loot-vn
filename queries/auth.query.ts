import { useMutation } from "@tanstack/react-query";
import { deleteCookie, setCookie } from "cookies-next";
import { ACCESS_TOKEN_KEY, CURRENT_USER } from "@/constants/token.constant";
import dayjs from "@/lib/dayjs";
import isEmpty from "lodash/isEmpty";
import { clearUserData } from "@/lib/utils";

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
      
      localStorage.setItem(CURRENT_USER, JSON.stringify(data));
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
    deleteCookie(ACCESS_TOKEN_KEY);
    clearUserData();
    return { statusCode: 200, data: null };
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
