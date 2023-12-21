import apiClient from "@/lib/apiClient";
import { postLoginParam } from "./authRepository.param";
import { AxiosResponse } from "axios";

export const postLogin = async ({
  login,
  password,
}: postLoginParam): Promise<AxiosResponse<any>> => {
  return await apiClient({
    method: "post",
    url: `/login/`,
    data: {
      login,
      password,
    },
  });
};
