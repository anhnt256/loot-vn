import { ACCESS_TOKEN_KEY } from "./constants/token.constant";
import axios, {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import { getCookie } from "cookies-next";

// Determine host from various environment variables injected by Vite / NextJS
// Vite uses import.meta.env, while Node uses process.env
const getEnvVar = (name: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
    return import.meta.env[name];
  }
  return '';
};

let host = getEnvVar('VITE_API_URL');
let secretKey = getEnvVar('VITE_GATEWAY_GO_VAP_SECRET_KEY');

const isServer = typeof window === "undefined";

const apiClient = axios.create({
  baseURL: host,
  withCredentials: true,
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
    const cookie = request.headers.Cookie;
    const tokenString = request.headers.Token;

    let token = null;
    if (tokenString) {
      token = JSON.parse(tokenString);
    }

    if (cookie && cookie.includes("TAN_PHU")) {
      secretKey = getEnvVar('VITE_GATEWAY_TAN_PHU_SECRET_KEY');
    } else {
      secretKey = getEnvVar('VITE_GATEWAY_GO_VAP_SECRET_KEY');
    }

    request.baseURL = host;

    if (token) {
      request.headers["Authorization"] = `Bearer ${token.token}`;
    } else if (secretKey) {
      request.headers["Authorization"] = `Key ${secretKey}`;
    }
  } else {
    // Check both token and staffToken
    const token = getCookie(ACCESS_TOKEN_KEY) || getCookie("staffToken");
    if (token) {
      request.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  //#region StartDebug
  // const { method, url } = request || {};
  // logOnDev(`🚀 [${method?.toUpperCase()}] ${url} | Request`, request);
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
