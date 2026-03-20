import { ACCESS_TOKEN_KEY } from "./constants/token.constant";
import axios from "axios";
import { getCookie } from "cookies-next";

// Determine host from various environment variables injected by Vite / NextJS
let host = process.env.VITE_API_URL || '';
let secretKey = process.env.VITE_GATEWAY_GO_VAP_SECRET_KEY;

const isServer = typeof window === "undefined";

const apiClient = axios.create({
  baseURL: host,
  withCredentials: true,
});

apiClient.interceptors.request.use(async (request) => {
  if (isServer) {
    const cookie = request.headers.Cookie;
    const tokenString = request.headers.Token;

    let token = null;
    if (tokenString) {
      token = JSON.parse(tokenString);
    }

    if (cookie && cookie.includes("TAN_PHU")) {
      secretKey = process.env.VITE_GATEWAY_TAN_PHU_SECRET_KEY;
    } else {
      secretKey = process.env.VITE_GATEWAY_GO_VAP_SECRET_KEY;
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
