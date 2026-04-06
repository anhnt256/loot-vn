import React, { useState } from 'react';
import { Layout, Menu, Button, Select, ConfigProvider, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  GiftOutlined,
  PlaySquareOutlined,
  CoffeeOutlined,
  CrownOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  FileTextOutlined,
  SnippetsOutlined,
  WarningOutlined,
  LockOutlined,
  MessageOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HistoryOutlined,
  LogoutOutlined,
  InboxOutlined,
  BarChartOutlined,
  PrinterOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { apiClient, removeToken, getToken } from '@gateway-workspace/shared/utils/client';
import OrderDrawer from './OrderDrawer';
import ShiftButton from './ShiftButton';
import { usePrinterStore } from '../services/print';
import { useShiftEndWarning } from '../hooks/useShiftEndWarning';
import { ChatButton } from '@gateway-workspace/shared/chat';

function parseJwtPayload(token: string) {
  try {
    const base64 = token.split('.')[1];
    const bytes = atob(base64);
    const text = decodeURIComponent(
      bytes.split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [fundAmount, setFundAmount] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const printerReconnect = usePrinterStore((s) => s.reconnect);

  // Cảnh báo 15 phút trước khi hết giờ ca
  useShiftEndWarning();

  const fetchFund = async () => {
    try {
      const result = await apiClient.get('/game/fund').catch((err) => {
        console.error('API /game/fund failed:', err);
        return null;
      });
      if (result && result.data !== undefined && result.data !== null) {
        setFundAmount(Number(result.data) || 0);
      } else {
        setFundAmount(0);
      }
    } catch (err) {
      console.error('Failed to fetch fund amount', err);
      setFundAmount(0);
    }
  };

  React.useEffect(() => {
    fetchFund();
    const interval = setInterval(fetchFund, 90000);
    return () => clearInterval(interval);
  }, []);

  // Auto-reconnect USB printer on login (silent — no dialog, uses previously paired device)
  React.useEffect(() => {
    printerReconnect();
  }, []);

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const defaultTenantConfig = (typeof window !== 'undefined' && (window as any).__TENANT_CONFIG__) || {};
  let tenantLogo = defaultTenantConfig?.logo || null;
  if (typeof tenantLogo === 'object') {
    tenantLogo = tenantLogo?.url || null;
  }
  const primaryColor = defaultTenantConfig?.primaryColor || '#1677ff';
  const secondaryColor = defaultTenantConfig?.secondaryColor || '#f97316';

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/dashboard/order-management', icon: <ShoppingCartOutlined />, label: 'Quản lý Đơn hàng' },
    { key: '/dashboard/reward-exchange', icon: <SwapOutlined />, label: 'Quản lý đổi thưởng' },
    { key: '/dashboard/handover-reports', icon: <FileTextOutlined />, label: 'Báo cáo NVL' },
    { key: '/dashboard/reports', icon: <SnippetsOutlined />, label: 'Báo cáo bàn giao' },
    { key: '/dashboard/inventory-audit', icon: <AuditOutlined />, label: 'Báo cáo kết ca' },
    {
      key: 'management',
      icon: <AppstoreOutlined />,
      label: 'Quản lý',
      children: [
        { key: '/dashboard/menu-management', label: 'Quản lý Menu' },
        { key: '/dashboard/material-management', label: 'Danh mục nguyên liệu' },
        { key: '/dashboard/recipe-management', label: 'Công thức & Định mức (BOM)' },
        { key: '/dashboard/device-history', label: 'Quản lý lịch sử máy' },
        { key: '/dashboard/layout-manager', label: 'Quản lý sơ đồ phòng máy' },
        { key: '/dashboard/printer-management', label: 'Quản lý Máy In' },
        { key: '/dashboard/feedback', label: 'Quản lý Feedback' },
        { key: '/dashboard/system-config', label: 'Cấu hình hệ thống' },
      ],
    },
    {
      key: 'statistics',
      icon: <BarChartOutlined />,
      label: 'Thống kê',
      children: [
        { key: '/dashboard/statistics', label: 'Thống kê chung' },
        { key: '/dashboard/profit-analysis', label: 'Phân tích lợi nhuận' },
      ],
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryColor,
        },
        algorithm: theme.darkAlgorithm,
        components: {
          Layout: {
            headerBg: '#1f2937',
            siderBg: '#1f2937',
            bodyBg: '#111827'
          },
          Menu: {
            darkItemBg: '#1f2937',
            darkItemSelectedBg: primaryColor,
          }
        }
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          breakpoint="lg"
          collapsedWidth="0"
          width={260}
          className="border-r border-gray-700 h-screen overflow-y-auto"
          style={{ position: 'sticky', top: 0, left: 0, zIndex: 100 }}
        >
          <div className={`p-4 flex items-center transition-all ${collapsed ? 'justify-center' : 'justify-start gap-3 px-5'}`}>
            {tenantLogo ? (
              <img 
                src={tenantLogo} 
                alt="Logo" 
                className={`transition-all ${collapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded-full object-cover shadow-lg shrink-0`} 
              />
            ) : (
              <h2 className={`text-xl font-bold text-gray-100 transition-all m-0 shrink-0 ${collapsed ? 'block' : 'hidden'}`}>AP</h2>
            )}
            
            {!collapsed && (
              <div className="text-white font-bold text-base truncate flex-1">
                {defaultTenantConfig?.name || 'Admin Panel'}
              </div>
            )}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
          <div className="px-3 py-3 border-t border-gray-700">
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 w-full"
              style={{ textAlign: collapsed ? 'center' : 'left' }}
            >
              {!collapsed && 'Đăng xuất'}
            </Button>
          </div>
        </Sider>
        <Layout className="min-w-0 transition-all duration-200 relative">
          <Header className="flex items-center justify-between px-2 sm:px-6 border-b border-gray-700 bg-gray-800 sticky top-0 z-50">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="text-white lg:hidden shrink-0"
                style={{ fontSize: '18px', width: 40, height: 40 }}
              />
              <div className="hidden sm:block text-xl font-bold text-white"></div>
              {fundAmount !== null && (
                <div 
                  className="flex items-center px-4 py-1.5 rounded-lg border"
                  style={{ 
                    borderColor: 'var(--secondary-color, var(--primary-color, #b48d3d))', 
                    color: 'var(--secondary-color, var(--primary-color, #eab308))',
                    backgroundColor: 'color-mix(in srgb, var(--secondary-color, var(--primary-color, #3a3022)) 20%, transparent)'
                  }}
                >
                  <span className="font-bold text-sm">
                    Tổng quỹ: {fundAmount.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <ShiftButton />
              <OrderDrawer tenantId={apiClient.defaults.headers.common['x-tenant-id'] as string ?? ''} />
            </div>
          </Header>
          <Content id="main-content" className="p-4 sm:p-6 bg-gray-900 min-h-screen">
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      {/* Chat Button */}
      {(() => {
        const token = getToken() || '';
        const jwt = parseJwtPayload(token);
        return (
          <ChatButton
            serverUrl={apiClient.defaults.baseURL || ''}
            tenantId={apiClient.defaults.headers.common['x-tenant-id'] as string ?? ''}
            token={token}
            currentUser={{
              userId: jwt?.userId || jwt?.id || 0,
              userName: jwt?.fullName || jwt?.userName || 'ADMIN',
              loginType: 'username',
              machineName: jwt?.fullName || jwt?.userName || 'ADMIN',
              staffId: jwt?.staffId || jwt?.id || undefined,
              staffType: jwt?.staffType,
              isAdmin: true,
            }}
            title="Admin Chat"
          />
        );
      })()}
    </ConfigProvider>
  );
};

export default AdminLayout;
