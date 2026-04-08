const BRANCH_COOKIE_KEY = 'master_app_branch';

export interface BranchInfo {
  id: string;
  name: string;
  domainPrefix: string;
  address?: string;
  isPrimary?: boolean;
}

const defaultMaxAgeDays = 365;

function setCookie(name: string, value: string, maxAgeDays: number = defaultMaxAgeDays) {
  const d = new Date();
  d.setTime(d.getTime() + maxAgeDays * 24 * 60 * 60 * 1000);
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const key = `${name  }=`;
  const parts = document.cookie.split(';');
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (part.indexOf(key) === 0) {
      try {
        return decodeURIComponent(part.slice(key.length));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export function getBranchFromCookie(): BranchInfo | null {
  const raw = getCookie(BRANCH_COOKIE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BranchInfo;
    if (parsed?.id && parsed?.name != null && parsed?.domainPrefix != null) return parsed;
  } catch {
    // ignore
  }
  return null;
}

export function setBranchCookie(branch: BranchInfo): void {
  setCookie(BRANCH_COOKIE_KEY, JSON.stringify(branch));
}

export function clearBranchCookie(): void {
  deleteCookie(BRANCH_COOKIE_KEY);
}
