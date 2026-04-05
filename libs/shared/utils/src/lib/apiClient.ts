import { ACCESS_TOKEN_KEY } from "./constants/token.constant";
import axios from "axios";
import { getCookie } from "./cookie";

const host = process.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: host,
  withCredentials: true,
});

apiClient.interceptors.request.use(async (request) => {
  const token = getCookie(ACCESS_TOKEN_KEY) || getCookie("staffToken");
  if (token) {
    request.headers["Authorization"] = `Bearer ${token}`;
  }
  return request;
});

export default apiClient;
