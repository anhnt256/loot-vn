import axios, {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { ACCESS_TOKEN_KEY } from '@/constants/token.constant';

let host = process.env.NEXT_PUBLIC_GATEWAY_GO_VAP_API;
let secretKey = process.env.NEXT_PUBLIC_GATEWAY_GO_VAP_SECRET_KEY;

const apiClient = axios.create({
  baseURL: host,
  withCredentials: true,
});

apiClient.interceptors.request.use(async (request) => {
  const cookie = request.headers.Cookie;
  const tokenString = request.headers.Token;

  let token = null;
  if (tokenString) {
    token = JSON.parse(tokenString as string);
  }

  if (cookie && cookie === 'TAN_PHU') {
    host = process.env.NEXT_PUBLIC_GATEWAY_TAN_PHU_API;
    secretKey = process.env.NEXT_PUBLIC_GATEWAY_TAN_PHU_SECRET_KEY;
  } else {
    host = process.env.NEXT_PUBLIC_GATEWAY_GO_VAP_API;
    secretKey = process.env.NEXT_PUBLIC_GATEWAY_GO_VAP_SECRET_KEY;
  }

  request.baseURL = host;

  if (token) {
    request.headers['Authorization'] = `Bearer ${token.token}`;
  } else if (secretKey) {
    request.headers['Authorization'] = `Key ${secretKey}`;
  }
  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default apiClient;
