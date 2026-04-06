import { getToken } from './token';
import axios from 'axios';

const host = process.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: host,
});

apiClient.interceptors.request.use(async (request) => {
  const token = getToken();
  if (token) {
    request.headers['Authorization'] = `Bearer ${token}`;
  }
  return request;
});

export default apiClient;
