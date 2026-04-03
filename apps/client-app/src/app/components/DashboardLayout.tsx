import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { apiClient, ACCESS_TOKEN_KEY } from '@gateway-workspace/shared/utils/client';
import { deleteCookie } from 'cookies-next';
import { clearCurrentUser, getCurrentUser, setCurrentUser, CurrentUser } from '../constants';
import { cn } from '../../lib/utils';
import ChatPanel from './ChatPanel';
import { CartProvider } from '../contexts/CartContext';

const navLinks = [
  { href: '/dashboard/check-in', label: 'Điểm danh' },
  { href: '/dashboard/games', label: 'Trò chơi' },
  { href: '/dashboard/order', label: 'Đặt hàng' },
  { href: '/dashboard/store', label: 'Đổi thưởng' },
  { href: '/dashboard/feedback', label: 'Phản hồi đã gửi' },
  { href: '/dashboard/battle-pass', label: 'Battle Pass' },
  { href: '/dashboard/voucher', label: 'Voucher' },
];

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setUser] = useState<CurrentUser>(getCurrentUser()!);

  // Refresh user stats from server once on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    const userId = user.userId || user.id;
    if (!userId) return;

    apiClient
      .post('/dashboard/user-calculator', { listUsers: [userId] })
      .then((res) => {
        const fresh = Array.isArray(res.data?.data) ? res.data.data[0] : null;
        if (fresh) {
          const updated = { ...user, ...fresh };
          setCurrentUser(updated);
          setUser(updated);
        }
      })
      .catch(() => {/* silent */});
  }, []);

  const handleLogout = async () => {
    try { await apiClient.delete('/dashboard/cart'); } catch { /* ignore */ }
    try { await apiClient.post('/auth/logout'); } catch { /* ignore */ }
    clearCurrentUser();
    deleteCookie(ACCESS_TOKEN_KEY);
    navigate('/login');
  };

  return (
    <CartProvider>
    <div className="flex h-screen bg-gray-200 overflow-hidden">
      {/* Left Sidebar */}
      <div className="bg-gray-800 text-white w-64 flex-shrink-0 py-7 px-2">
        <nav>
          {/* User info */}
          <div className="flex justify-between items-center mb-5 px-2">
            <span className="font-sans font-bold text-primary uppercase tracking-wider text-base truncate max-w-[110px]">
              {currentUser.userName}
            </span>
            <div className="flex items-center bg-gray-700 rounded-full px-3 py-1 gap-1">
              <span className="font-gaming font-bold text-yellow-400 text-base">
                {(currentUser.stars ?? 0).toLocaleString()}
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
          <Outlet />
        </div>
      </div>

      {/* Right Chat Panel */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 shadow-lg flex-shrink-0">
        <ChatPanel
          machineName={currentUser.machineName}
          defaultTab={location.pathname.includes('order') ? 'cart' : 'chat'}
        />
      </div>
    </div>
    </CartProvider>
  );
};

export default DashboardLayout;
