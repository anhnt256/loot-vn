import React, { useCallback, useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { apiClient, removeToken } from '@gateway-workspace/shared/utils/client';
import { Spin } from 'antd';

import { cn } from '../../lib/utils';
import { CartProvider } from '../contexts/CartContext';
import { UserProvider, useUser } from '../contexts/UserContext';

import ChatPanel from './ChatPanel';

const navLinks = [
  { href: '/dashboard/order', label: 'Dịch vụ ăn uống' },
  { href: '/dashboard/check-in', label: 'Điểm danh' },
  { href: '/dashboard/games', label: 'Trò chơi' },
  { href: '/dashboard/store', label: 'Đổi thưởng' },
  { href: '/dashboard/feedback', label: 'Gửi Phản Hồi' },
  { href: '/dashboard/support', label: 'Hỗ trợ kỹ thuật' },
  { href: '/dashboard/battle-pass', label: 'Battle Pass' },
  { href: '/dashboard/events', label: 'Sự kiện có quà' },
  { href: '/dashboard/voucher', label: 'Voucher của bạn' },
];

export interface DashboardOutletContext {
  menuVersion: number;
}

const DashboardContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const [menuVersion, setMenuVersion] = useState(0);
  const handleMenuUpdated = useCallback(() => setMenuVersion((v) => v + 1), []);

  // Poll maintenance status every 10s
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await apiClient.get('/maintenance/status');
        if (mounted && res.data?.enabled) {
          window.location.href = '/maintenance';
        }
      } catch {
        // ignore
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const handleLogout = async () => {
    try { await apiClient.delete('/dashboard/cart'); } catch { /* ignore */ }
    try { await apiClient.post('/auth/logout'); } catch { /* ignore */ }
    removeToken();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-200">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <CartProvider>
    <div className="flex h-screen bg-gray-200 overflow-hidden">
      {/* Left Sidebar */}
      <div className="bg-gray-800 text-white w-64 flex-shrink-0 py-7 px-2">
        <nav>
          {/* User info */}
          <div className="flex justify-between items-center mb-5 px-2">
            <span className="font-sans font-bold text-primary uppercase tracking-wider text-base truncate max-w-[110px]">
              {user?.userName ?? '---'}
            </span>
            <div className="flex items-center bg-gray-700 rounded-full px-3 py-1 gap-1">
              <span className="font-gaming font-bold text-yellow-400 text-base">
                {(user?.stars ?? 0).toLocaleString()}
              </span>
              <span className="text-yellow-400 text-sm">⭐</span>
            </div>
          </div>

          <div className="border-t border-gray-700 mb-3" />

          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              to={href}
              className={cn(
                'block py-2.5 px-4 rounded-lg transition duration-200 hover:bg-gray-700 text-gray-300 hover:text-white no-underline font-medium text-[15px] mb-0.5',
                location.pathname === href ? 'nav-active' : ''
              )}
            >
              {label}
            </Link>
          ))}

          <div className="border-t border-gray-700 mt-3 mb-3" />

          <div
            onClick={handleLogout}
            className="block py-2.5 px-4 rounded-lg transition duration-200 hover:bg-red-900/40 hover:text-red-400 cursor-pointer text-gray-400 font-medium text-[15px]"
          >
            Thoát
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <Outlet context={{ menuVersion } satisfies DashboardOutletContext} />
        </div>
      </div>

      {/* Right Chat Panel */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 shadow-lg flex-shrink-0">
        <ChatPanel
          machineName={user?.machineName}
          defaultTab={location.pathname.includes('order') ? 'cart' : 'chat'}
          onMenuUpdated={handleMenuUpdated}
        />
      </div>
    </div>
    </CartProvider>
  );
};

const DashboardLayout: React.FC = () => (
  <UserProvider>
    <DashboardContent />
  </UserProvider>
);

export default DashboardLayout;
