import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '@gateway-workspace/shared/utils/client';

export interface UserData {
  userId: number;
  id?: number;
  userName: string;
  fullName?: string;
  machineName?: string;
  computerName?: string;
  role?: string;
  stars: number;
  totalCheckIn: number;
  claimedCheckIn: number;
  availableCheckIn: number;
}

interface UserContextValue {
  user: UserData | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await apiClient.get('/dashboard/me');
      const data = res.data;
      if (!data?.userId) {
        setUser(null);
        return;
      }

      setUser({
        userId: data.userId,
        id: data.userId,
        userName: data.userName,
        fullName: data.fullName,
        machineName: data.computerName,
        computerName: data.computerName,
        role: data.role,
        stars: data.stars ?? 0,
        totalCheckIn: data.totalCheckIn ?? 0,
        claimedCheckIn: data.claimedCheckIn ?? 0,
        availableCheckIn: data.availableCheckIn ?? 0,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};
