import { ACCESS_TOKEN_KEY } from './constants/token.constant';

export function getToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
