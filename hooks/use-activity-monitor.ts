import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLogout } from '@/queries/auth.query';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const FORCE_LOGOUT_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
const WARNING_TIMEOUT = 14 * 60 * 1000; // 14 minutes in milliseconds

export const useActivityMonitor = () => {
  const router = useRouter();
  const logoutMutation = useLogout();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    console.log('Executing logout...');
    try {
      // Cancel all ongoing queries
      queryClient.cancelQueries();
      
      // Clear all queries from cache
      queryClient.clear();
      
      await logoutMutation.mutateAsync();
      console.log('Logout successful');
      toast.info('Phiên làm việc đã hết hạn');
      router.push('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    console.log('Setting up activity monitor...');
    
    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      console.log('Warning timeout triggered');
      toast.warning('Phiên làm việc của bạn sẽ hết hạn sau 1 phút nữa');
    }, WARNING_TIMEOUT);

    // Set force logout timeout
    timeoutRef.current = setTimeout(() => {
      console.log('Logout timeout triggered');
      handleLogout();
    }, FORCE_LOGOUT_TIMEOUT);

    // Cleanup
    return () => {
      console.log('Cleaning up activity monitor...');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);
}; 