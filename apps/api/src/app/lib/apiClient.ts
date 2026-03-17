import axios, {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { ACCESS_TOKEN_KEY } from '@/constants/token.constant';

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

  if (cookie && cookie.includes('TAN_PHU')) {
    secretKey = getEnvVar('VITE_GATEWAY_TAN_PHU_SECRET_KEY');
  } else {
    secretKey = getEnvVar('VITE_GATEWAY_GO_VAP_SECRET_KEY');
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
