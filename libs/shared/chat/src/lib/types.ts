export interface ChatMessage {
  id: number;
  content: string;
  userId: number | null;
  machineName: string;
  createdAt: string;
  staffId: number | null;
  userName: string | null;
  staffType: string | null;
}

export interface ChatUser {
  userId: number;
  userName?: string;
  machineName?: string;
  loginType?: string; // 'username' | 'mac' | 'admin' | 'account'
  staffId?: number;
  staffType?: string; // 'STAFF' | 'BRANCH_ADMIN' | 'SUPER_ADMIN' | 'MANAGER'
  isAdmin?: boolean;
}

export type MessageType = 'super-admin' | 'branch-admin' | 'staff' | 'current-user' | 'user' | 'system';
