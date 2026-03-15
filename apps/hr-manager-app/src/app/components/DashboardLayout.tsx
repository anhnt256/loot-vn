import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  Users, 
  Calendar,
  FileText,
  DollarSign,
  LayoutGrid, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardList,
  ShieldAlert,
  Send,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { cn } from '@gateway-workspace/shared/utils';
import { Drawer, Grid } from 'antd';
import { getCookie, deleteCookie } from 'cookies-next';
import { ACCESS_TOKEN_KEY } from '@gateway-workspace/shared/utils';

const { useBreakpoint } = Grid;

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active?: boolean, 
  onClick?: () => void 
}) => (
  <div 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 group",
      active 
        ? "bg-[#e2eafc] text-[#003594] font-medium" 
        : "text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827]"
    )}
  >
    <Icon size={18} className={cn(active ? "text-[#003594]" : "text-[#9ca3af] group-hover:text-[#4b5563]")} />
    <span className="text-sm">{label}</span>
  </div>
);

const SidebarCategory = ({ label }: { label: string }) => (
  <div className="px-3 mt-6 mb-2">
    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">{label}</span>
  </div>
);

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  const menuItems = [
    { category: 'Hoạt động nhân sự', items: [
      { id: 'overview', label: 'Tổng quan', icon: LayoutGrid, path: '/dashboard/overview' },
      { id: 'staff', label: 'Danh mục nhân viên', icon: Users, path: '/dashboard/staff' },
      { id: 'attendance', label: 'Chấm công', icon: Calendar, path: '/dashboard/attendance' },
      { id: 'payroll', label: 'Bảng lương', icon: DollarSign, path: '/dashboard/payroll' },
    ]},
    { category: 'Quản lý', items: [
      { id: 'requests', label: 'Yêu cầu', icon: Send, path: '/dashboard/requests' },
    ]},
    { category: 'Cài đặt', items: [
      { id: 'work-shifts', label: 'Ca làm việc', icon: Clock, path: '/dashboard/settings/work-shifts' },
      { id: 'reward-punish', label: 'Quy tắc Thưởng/Phạt', icon: ShieldAlert, path: '/dashboard/settings/reward-punish' },
    ]}
  ];

  const handleLogout = () => {
    deleteCookie(ACCESS_TOKEN_KEY, { path: '/' });
    navigate('/login');
  };

  useEffect(() => {
    const token = getCookie(ACCESS_TOKEN_KEY);
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <img 
          src="/logo.png" 
          alt="HR Manager" 
          className="h-10 w-10 object-contain rounded-full"
          onError={(e) => {
             (e.target as HTMLImageElement).src = 'https://portal.thegateway.vn/logo.png';
          }}
        />
        {(!collapsed || isMobile) && <span className="font-bold text-[#003594] truncate">Cổng quản lý nhân sự</span>}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3">
        {menuItems.map((group) => (
          <React.Fragment key={group.category}>
            {(!collapsed || isMobile) && <SidebarCategory label={group.category} />}
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarItem 
                  key={item.id}
                  icon={item.icon}
                  label={(collapsed && !isMobile) ? "" : item.label}
                  active={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setMobileMenuOpen(false);
                  }}
                />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#f1f5f9]">
        <div className="mb-2 p-2 bg-[#f8fafc] rounded-lg">
           <div className="w-8 h-8 rounded-full bg-[#ff721f] border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold">HR</div>
        </div>
        <SidebarItem 
          icon={LogOut} 
          label={(collapsed && !isMobile) ? "" : "Đăng xuất"} 
          onClick={handleLogout}
        />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar for Desktop */}
      {!isMobile && (
        <div 
          className={cn(
            "bg-white border-r border-[#e2e8f0] flex flex-col transition-all duration-300 relative",
            collapsed ? "w-20" : "w-64"
          )}
        >
          <SidebarContent />

          {/* Toggle Button */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center shadow-sm text-[#9ca3af] hover:text-[#4b5563] z-10"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      )}

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: 0 } }}
        width={280}
        closable={false}
      >
        <div className="h-full relative">
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="absolute right-4 top-6 p-2 text-gray-400 hover:text-gray-600 z-10"
          >
            <X size={20} />
          </button>
          <SidebarContent />
        </div>
      </Drawer>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <header className="bg-white border-b border-[#e2e8f0] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <MenuIcon size={20} />
              </button>
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-8 w-8 object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://portal.thegateway.vn/logo.png';
                }}
              />
              <span className="font-bold text-[#003594] text-sm">Cổng quản lý nhân sự</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#ff721f] border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold">HR</div>
          </header>
        )}

        <main className={cn(
          "flex-1 overflow-y-auto bg-[#f8fafc]",
          isMobile ? "p-4" : "p-8"
        )}>
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
