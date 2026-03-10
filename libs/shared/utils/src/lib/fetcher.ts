export const fetcher = (url: string, options?: RequestInit) =>
  fetch(url, {
    credentials: "include",
    ...options,
  }).then((res) => res.json());
