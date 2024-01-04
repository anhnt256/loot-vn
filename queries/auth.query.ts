import { useMutation } from "@tanstack/react-query";
import { setCookie } from "cookies-next";
import { ACCESS_TOKEN_KEY, CURRENT_USER } from "@/constants/token.constant";
import dayjs from "dayjs";

export interface postLoginParam {
  login: string;
  password: string;
}

const expirationDuration = 1;
export const postLogin = async (loginParam: postLoginParam): Promise<any> => {
  const result = await fetch("api/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginParam),
  });

  const data = JSON.parse(await result.text());
  const { user, token } = data || {};
  const expirationDate = dayjs().add(expirationDuration, "day").format();
  const tokenFormat = {
    ...token,
    expiration_date: new Date(expirationDate),
  };
  setCookie(ACCESS_TOKEN_KEY, tokenFormat, {
    expires: new Date(expirationDate),
  });
  localStorage.setItem(CURRENT_USER, JSON.stringify(user));

  return { statusCode: 200, data: user.id, message: "Login Success" };
};

export const useLogin = () => useMutation({ mutationFn: postLogin });
