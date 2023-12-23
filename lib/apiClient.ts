import { ACCESS_TOKEN_KEY } from "@/constants/token.constant";
import axios, {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

const host = process.env.NEXT_PUBLIC_GATEWAY_GO_VAP_API;
const secretKey = process.env.NEXT_PUBLIC_GATEWAY_GO_VAP_SECRET_KEY;

const isServer = typeof window === "undefined";

const apiClient = axios.create({
  baseURL: host,
});

const logOnDev = (
  message: string,
  log?: AxiosResponse | InternalAxiosRequestConfig | AxiosError,
) => {
  if (process.env.NODE_ENV === "development") {
    console.log(message, log);
  }
};

apiClient.interceptors.request.use(async (request) => {
  if (isServer) {
    if (secretKey) {
      request.headers["Authorization"] = `Key ${secretKey}`;
    }
  } else {
    const { getCookie } = await import("cookies-next");
    const token = getCookie(ACCESS_TOKEN_KEY);
    if (token) {
      request.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  //#region StartDebug
  const { method, url } = request || {};
  logOnDev(`🚀 [${method?.toUpperCase()}] ${url} | Request`, request);
  //#endregion

  return request;
});

apiClient.interceptors.response.use(
  (response) => {
    //#region StartDebug
    // const { method, url } = response.config;
    // const { status } = response;
    // logOnDev(
    //   `✨ [${method?.toUpperCase()}] ${url} | Response ${status}`,
    //   response,
    // );
    //#endregion
    return response;
  },
  (error) => {
    //#region StartDebug
    // const { message } = error;
    // const { status, data } = error.response;
    // const { method, url } = error.config;
    //
    // logOnDev(
    //   `🚨 [${method?.toUpperCase()}] ${url} | Error ${status} ${
    //     data?.message || ""
    //   } | ${message}`,
    //   error,
    // );
    //#endregion

    return Promise.reject(error);
  },
);

export default apiClient;
