import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  Users, 
  Flag, 
  Building,
  Key, 
  Zap, 
  BarChart3, 
  LayoutGrid, 
  Settings, 
  Package, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { cn } from '../../lib/utils';

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

  const menuItems = [
    { category: 'Business', items: [
      { id: 'org', label: 'Organization Management', icon: Building, path: '/dashboard/organization' },
      { id: 'tenant', label: 'Tenant Management', icon: Users, path: '/dashboard/tenant' },
      { id: 'flags', label: 'Feature Flags', icon: Flag, path: '/dashboard/flags' },
      { id: 'access', label: 'Endpoint Access', icon: Key, path: '/dashboard/access' },
      { id: 'vertex', label: 'Vertex Usage', icon: Zap, path: '/dashboard/vertex' },
      { id: 'metrics', label: 'IDP Usage Metrics', icon: BarChart3, path: '/dashboard/metrics' },
    ]},
    { category: 'Administration', items: [
      { id: 'categories', label: 'Illustration Categories', icon: LayoutGrid, path: '/dashboard/illustration-categories' },
      { id: 'settings', label: 'Illustration Settings', icon: Settings, path: '/dashboard/illustration-settings' },
      { id: 'products', label: 'Illustration Products', icon: Package, path: '/dashboard/illustration-products' },
    ]}
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-white border-r border-[#e2e8f0] flex flex-col transition-all duration-300 relative",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-2">
          <img 
            src="https://covergo.ai/wp-content/uploads/2021/04/CoverGo-Logo-Dark.png" 
            alt="CoverGo" 
            className="h-8 object-contain"
            onError={(e) => {
               (e.target as HTMLImageElement).src = '/logo.png';
            }}
          />
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3">
          {menuItems.map((group) => (
            <React.Fragment key={group.category}>
              {!collapsed && <SidebarCategory label={group.category} />}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem 
                    key={item.id}
                    icon={item.icon}
                    label={collapsed ? "" : item.label}
                    active={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  />
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#f1f5f9]">
          <div className="mb-2 p-2 bg-[#f8fafc] rounded-lg">
             <div className="w-8 h-8 rounded-full bg-[#003594] border-2 border-white shadow-sm" />
          </div>
          <SidebarItem 
            icon={LogOut} 
            label={collapsed ? "" : "Log out"} 
            onClick={handleLogout}
          />
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center shadow-sm text-[#9ca3af] hover:text-[#4b5563]"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
