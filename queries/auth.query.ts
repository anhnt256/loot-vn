import { useMutation } from "@tanstack/react-query";
import { setCookie } from "cookies-next";
import { ACCESS_TOKEN_KEY, CURRENT_USER } from "@/constants/token.constant";
import dayjs from "dayjs";
import { BRANCH } from "@/constants/enum.constant";

export interface postLoginParam {
  login: string;
  password: string;
  branch: BRANCH;
}

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();
export const postLogin = async (loginParam: postLoginParam): Promise<any> => {
  const { branch } = loginParam;
  setCookie("branch", branch, {
    expires: new Date(expirationDate),
  });
  const result = await fetch("api/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(loginParam),
  });

  const resultText = await result.text();

  if (resultText !== "Internal Error") {
    const data = JSON.parse(resultText);
    const { user, token } = data || {};

    const tokenFormat = {
      ...token,
      expiration_date: new Date(expirationDate),
    };
    setCookie(ACCESS_TOKEN_KEY, tokenFormat, {
      expires: new Date(expirationDate),
    });
    localStorage.setItem(CURRENT_USER, JSON.stringify(user));

    return { statusCode: 200, data: user.id, message: "Login Success" };
  }
  return {
    statusCode: 500,
    data: null,
    message:
      "Thông tin tài khoản hoặc chi nhánh không đúng. Vui lòng kiểm tra và thử lại!",
  };
};

export const useLogin = () => useMutation({ mutationFn: postLogin });
