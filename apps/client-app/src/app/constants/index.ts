export const CURRENT_USER = 'currentUser';

export interface CurrentUser {
  userId: number;
  id?: number;
  userName: string;
  fullName?: string;
  machineName?: string;
  role?: string;
  stars: number;
  totalCheckIn: number; // milliseconds
  claimedCheckIn: number;
  availableCheckIn: number;
}

export function getCurrentUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(data: CurrentUser): void {
  localStorage.setItem(CURRENT_USER, JSON.stringify(data));
}

export function clearCurrentUser(): void {
  localStorage.removeItem(CURRENT_USER);
}
