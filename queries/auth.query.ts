import { useMutation } from "@tanstack/react-query";
import { setCookie } from "cookies-next";
import { ACCESS_TOKEN_KEY, CURRENT_USER } from "@/constants/token.constant";

export interface postLoginParam {
  login: string;
  password: string;
}
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
  setCookie(ACCESS_TOKEN_KEY, token.token);
  localStorage.setItem(CURRENT_USER, JSON.stringify(user));

  return data;
};

export const useLogin = () => useMutation({ mutationFn: postLogin });
