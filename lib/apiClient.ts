import { ACCESS_TOKEN_KEY } from "@/constants/token.contant";
import token from "@/lib/token";
import axios, {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

const host = process.env.NEXT_PUBLIC_GATEWAY_GO_VAP_API;
const secretKey = process.env.NEXT_PUBLIC_GATEWAY_GO_VAP_SECRET_KEY;

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

apiClient.interceptors.request.use((request) => {
  const jwtToken: string | null = token.getToken(ACCESS_TOKEN_KEY);
  const { method, url } = request;

  console.log("url", url);

  request.headers["Content-Type"] = "application/x-www-form-urlencoded";

  if (secretKey) {
    request.headers["Authorization"] = `Key ${secretKey}`;
  }

  if (jwtToken) {
    request.headers["Authorization"] = `Bearer ${jwtToken}`;
  }

  logOnDev(`🚀 [${method?.toUpperCase()}] ${url} | Request`, request);

  return request;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log("meo meo gau gau");
    const { method, url } = response.config;
    const { status } = response;

    logOnDev(
      `✨ [${method?.toUpperCase()}] ${url} | Response ${status}`,
      response,
    );

    return response;
  },
  (error) => {
    const { message } = error;
    const { status, data } = error.response;
    const { method, url } = error.config;

    logOnDev(
      `🚨 [${method?.toUpperCase()}] ${url} | Error ${status} ${
        data?.message || ""
      } | ${message}`,
      error,
    );

    return Promise.reject(error);
  },
);

export default apiClient;
