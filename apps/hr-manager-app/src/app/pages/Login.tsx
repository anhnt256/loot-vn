import React, { useState, useCallback } from 'react';
import { Card, Input, Button, Typography, message, ConfigProvider, theme } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { setCookie } from 'cookies-next';
import { apiClient, ACCESS_TOKEN_KEY } from '@gateway-workspace/shared/utils';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = useCallback(async () => {
    if (!username || !password) {
      message.error('Vui lòng nhập tên tài khoản và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient.post('/api/auth/login', {
        userName: username,
        password: password,
        loginMethod: 'staff',
      });

      if (result.data.statusCode === 200 || result.data.success) {
        if (result.data.requirePasswordReset) {
          message.warning('Vui lòng đặt lại mật khẩu');
          return;
        }

        const { token } = result.data;
        if (token) {
          setCookie(ACCESS_TOKEN_KEY, token, { maxAge: 86400, path: '/' });
        }
        
        message.success('Đã đăng nhập thành công!');
        navigate('/dashboard/overview');
      } else {
        message.error(result.data.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 'Bạn không có quyền truy cập vào hệ thống này.';
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
          colorPrimary: '#ff721f',
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
                  src="/logo.png"
                  alt="Logo"
                  className="rounded-full object-cover w-full h-full shadow-[0_0_20px_rgba(255,114,31,0.2)] border-2 border-[#ff721f]/30"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://portal.thegateway.vn/logo.png';
                  }}
                />
              </div>

              <div className="text-center space-y-2">
                <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 800, fontSize: '28px', letterSpacing: '-0.5px' }}>
                  HR Manager Portal
                </Title>
              </div>

              <div className="w-full space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#f0f6fc] ml-1 block">
                    Tên tài khoản
                  </label>
                  <Input
                    size="large"
                    prefix={<UserOutlined className="text-slate-500 mr-2" />}
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#0d1117] border-[#30363d] h-12 text-white hover:border-[#8b949e]"
                    onPressEnter={handleLogin}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#f0f6fc] ml-1 block">
                    Mật khẩu
                  </label>
                  <Input.Password
                    size="large"
                    prefix={<LockOutlined className="text-slate-500 mr-2" />}
                    placeholder="Nhập mật khẩu"
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
                    className="w-full bg-[#ff721f] hover:bg-[#ff8a43] border-none h-12 text-base font-bold transition-all shadow-lg shadow-orange-600/20"
                  >
                    Đăng nhập
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="mt-8 text-center">
            <Text style={{ color: '#484f58', fontSize: '12px' }}>
              © 2026 HR Portal. All rights reserved.
            </Text>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Login;
