/**
 * Lightweight cookie utilities for Vite SPA (browser-only).
 * Replaces cookies-next which is designed for NextJS SSR.
 */

export function getCookie(name: string): string | undefined {
  const value = '; ' + document.cookie;
  const parts = value.split('; ' + name + '=');
  if (parts.length === 2) {
    return parts.pop()!.split(';').shift();
  }
  return undefined;
}

export function setCookie(
  name: string,
  value: string,
  options?: { maxAge?: number; path?: string },
): void {
  let cookie = name + '=' + value;
  if (options?.maxAge != null) cookie += '; max-age=' + options.maxAge;
  cookie += '; path=' + (options?.path ?? '/');
  document.cookie = cookie;
}

export function deleteCookie(name: string, path = '/'): void {
  document.cookie = name + '=; max-age=0; path=' + path;
}
