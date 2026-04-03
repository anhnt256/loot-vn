import React, { useState, useCallback, useEffect } from 'react';
import { Card, Input, Button, Typography, message, ConfigProvider, theme, Spin } from 'antd';
import { LaptopOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { setCookie } from 'cookies-next';
import { apiClient, ACCESS_TOKEN_KEY } from '@gateway-workspace/shared/utils/client';

const { Title, Text } = Typography;

const isDev = import.meta.env.DEV;

const Login: React.FC = () => {
  const [macAddress, setMacAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const navigate = useNavigate();

  const defaultTenantConfig = (typeof window !== 'undefined' && (window as any).__TENANT_CONFIG__) || {};
  const [tenantLogo, setTenantLogo] = useState<string | null>(defaultTenantConfig?.logo?.url || defaultTenantConfig?.logo || null);
  const [tenantColor, setTenantColor] = useState<string>(defaultTenantConfig?.primaryColor || '#ff721f');

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'expired') {
      message.error('Hệ thống đã hết hạn, vui lòng gia hạn để sử dụng');
    }
  }, []);

  const doLogin = useCallback(async (mac: string) => {
    setLoading(true);
    try {
      const result = await apiClient.post('/auth/login', {
        macAddress: mac,
        loginMethod: 'client',
      });

      if (result.data.statusCode === 200 || result.data.success) {
        const { token } = result.data;
        if (token) setCookie(ACCESS_TOKEN_KEY, token, { maxAge: 86400, path: '/' });
        message.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else {
        message.error(result.data.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 'Đã có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Production: tự động lấy MAC từ API và auto login
  useEffect(() => {
    if (isDev || autoLoginAttempted) return;
    setAutoLoginAttempted(true);

    const autoLogin = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/auth/detect-mac');
        const detectedMac = res.data?.macAddress;
        if (detectedMac) {
          await doLogin(detectedMac);
        } else {
          message.error('Không thể nhận diện máy tính. Vui lòng liên hệ quản trị viên.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Auto login failed:', err);
        message.error('Tự động đăng nhập thất bại. Vui lòng liên hệ quản trị viên.');
        setLoading(false);
      }
    };
    autoLogin();
  }, [isDev, autoLoginAttempted, doLogin]);

  // Production: hiển thị loading khi đang auto login
  if (!isDev && loading) {
    return (
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d1117] gap-4">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: tenantColor }} spin />} />
          <Text style={{ color: '#8b949e', fontSize: '16px' }}>Đang tự động đăng nhập...</Text>
        </div>
      </ConfigProvider>
    );
  }

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

              <div className="text-center space-y-2">
                <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 800, fontSize: '28px', letterSpacing: '-0.5px' }}>
                  Client App
                </Title>
                {isDev && (
                  <Text style={{ color: '#8b949e', fontSize: '12px' }}>Debug Mode</Text>
                )}
              </div>

              {isDev && (
                <div className="w-full space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#f0f6fc] ml-1 block">
                      MAC Address
                    </label>
                    <Input
                      size="large"
                      prefix={<LaptopOutlined className="text-slate-500 mr-2" />}
                      placeholder="VD: AA:BB:CC:DD:EE:FF"
                      value={macAddress}
                      onChange={(e) => setMacAddress(e.target.value)}
                      className="bg-[#0d1117] border-[#30363d] h-12 text-white hover:border-[#8b949e]"
                      onPressEnter={() => doLogin(macAddress.trim())}
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="primary"
                      size="large"
                      loading={loading}
                      onClick={() => doLogin(macAddress.trim())}
                      disabled={!macAddress.trim()}
                      className="w-full border-none h-12 text-base font-bold transition-all"
                      style={{ backgroundColor: tenantColor, boxShadow: `0 10px 15px -3px ${tenantColor}1A, 0 4px 6px -4px ${tenantColor}1A` }}
                    >
                      Đăng nhập
                    </Button>
                  </div>
                </div>
              )}

              {!isDev && (
                <div className="w-full text-center py-4">
                  <Text style={{ color: '#8b949e' }}>
                    Không thể tự động đăng nhập. Vui lòng liên hệ quản trị viên.
                  </Text>
                </div>
              )}
            </div>
          </Card>

          <div className="mt-8 text-center">
            <Text style={{ color: '#484f58', fontSize: '12px' }}>
              © 2026 Client App. All rights reserved.
            </Text>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Login;
