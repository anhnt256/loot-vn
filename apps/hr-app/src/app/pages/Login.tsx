import React, { useState, useCallback, useEffect } from 'react';
import { Card, Input, Button, Typography, ConfigProvider, theme, App, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient, setToken } from '@gateway-workspace/shared/utils';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const { message } = App.useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('error') === 'expired';

  const defaultTenantConfig = (typeof window !== 'undefined' && (window as any).__TENANT_CONFIG__) || {};
  const [tenantLogo, setTenantLogo] = useState<string | null>(defaultTenantConfig?.logo?.url || defaultTenantConfig?.logo || null);
  const [tenantColor, setTenantColor] = useState<string>(defaultTenantConfig?.primaryColor || '#ff721f');

  useEffect(() => {
    if (isExpired) {
      message.error({
        content: 'Hệ thống đã hết hạn, vui lòng gia hạn để sử dụng',
        duration: 10,
        key: 'expired-msg',
      });
    }
  }, [isExpired, message]);

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const result = await apiClient.get('/auth/tenant-info');
        if (result.data?.success && result.data?.data) {
          const tenantData = result.data.data;
          let logo = tenantData.logo;
          if (typeof logo === 'object') {
            logo = logo?.url || null;
          }
          setTenantLogo(logo);
          if (tenantData.primaryColor) {
            setTenantColor(tenantData.primaryColor);
          }
        }
      } catch (err) {
        console.error('Failed to fetch tenant info:', err);
      }
    };
    fetchTenantInfo();
  }, []);

  const handleLogin = useCallback(async () => {
    if (!username || !password) {
      message.error('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      console.log('Login attempt:', { username });
      const result = await apiClient.post('/auth/login', {
        userName: username,
        password,
        loginMethod: 'staff',
      });

      if (result.data.success) {
        if (result.data.requirePasswordReset) {
          message.warning('Vui lòng đặt lại mật khẩu');
          return;
        }
        const { token } = result.data;
        setToken(token);
        message.success('Chào mừng đến với Portal!');
        navigate('/dashboard');
      } else {
        message.error(result.data.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.status === 403 && error.response?.data?.data?.requirePasswordReset) {
        message.warning('Vui lòng đặt lại mật khẩu');
        return;
      }
      const errorMsg = error.response?.data?.message || 'Đã có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [username, password, navigate]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: tenantColor,
          colorBgContainer: '#161b22',
          colorBorder: '#30363d',
          borderRadius: 8,
        },
      }}
    >
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d1117] p-4 font-sans">
        <div className="w-full max-w-[420px]">
          <Card 
            className="shadow-2xl border-[#30363d] bg-[#161b22]"
            styles={{ body: { padding: '48px 40px' } }}
          >
            <div className="flex flex-col items-center space-y-8">
              <div className="relative w-24 h-24">
                <img
                  src={tenantLogo || "/logo.png"}
                  alt="Logo"
                  className="rounded-full object-cover w-full h-full border-2"
                  style={{ borderColor: tenantColor, boxShadow: `0 0 20px ${tenantColor}33` }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://portal.thegateway.vn/logo.png';
                  }}
                />
              </div>

              {isExpired && (
                <Alert
                  message="Thông báo gia hạn"
                  description="Hệ thống của bạn đã hết hạn sử dụng. Vui lòng liên hệ quản trị viên để gia hạn dịch vụ."
                  type="warning"
                  showIcon
                  className="w-full"
                />
              )}

              <div className="text-center space-y-2">
                <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 800, fontSize: '28px', letterSpacing: '-0.5px' }}>
                  HR Management
                </Title>
              </div>

              <div className="w-full space-y-6">
                {/* Username */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#f0f6fc] ml-1 block">
                    Tên tài khoản
                  </label>
                  <Input
                    size="large"
                    prefix={<UserOutlined className="text-slate-500 mr-2" />}
                    placeholder="Vui lòng nhập Tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#0d1117] border-[#30363d] h-12 text-white hover:border-[#8b949e]"
                    onPressEnter={handleLogin}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#f0f6fc] ml-1 block">
                    Mật khẩu
                  </label>
                  <Input.Password
                    size="large"
                    prefix={<LockOutlined className="text-slate-500 mr-2" />}
                    placeholder="Vui lòng nhập Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#0d1117] border-[#30363d] h-12 text-white hover:border-[#8b949e]"
                    onPressEnter={handleLogin}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="primary"
                    size="large"
                    loading={loading}
                    onClick={handleLogin}
                    className="w-full border-none h-12 text-base font-bold transition-all"
                    style={{ backgroundColor: tenantColor, boxShadow: `0 10px 15px -3px ${tenantColor}1A, 0 4px 6px -4px ${tenantColor}1A` }}
                  >
                    Đăng nhập
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="mt-8 text-center">
            <Text style={{ color: '#484f58', fontSize: '12px' }}>
              © 2026 Loot VN. All rights reserved.
            </Text>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Login;
