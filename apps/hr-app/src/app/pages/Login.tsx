import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, Input, Button, Typography, ConfigProvider, theme, App, Alert, Modal, Tag } from 'antd';
import { UserOutlined, LockOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient, setToken } from '@gateway-workspace/shared/utils';

const { Title, Text } = Typography;

interface RegulationInfo {
  id: number;
  version: number;
  title: string;
  content: string;
  publishedAt: string;
}

const Login: React.FC = () => {
  const { message } = App.useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('error') === 'expired';

  const defaultTenantConfig = (typeof window !== 'undefined' && (window as any).__TENANT_CONFIG__) || {};
  const tenantLogo: string | null = defaultTenantConfig?.logo?.url || defaultTenantConfig?.logo || null;
  const tenantColor: string = defaultTenantConfig?.primaryColor || '#ff721f';
  const tenantName: string = defaultTenantConfig?.name || '';

  const [regulation, setRegulation] = useState<RegulationInfo | null>(defaultTenantConfig?.latestRegulation || null);
  const [regulationModalOpen, setRegulationModalOpen] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpired) {
      message.error({
        content: 'Hệ thống đã hết hạn, vui lòng gia hạn để sử dụng',
        duration: 10,
        key: 'expired-msg',
      });
    }
  }, [isExpired, message]);

  const openRegulationModal = () => {
    setScrolledToBottom(false);
    setRegulationModalOpen(true);
    setTimeout(() => {
      const el = contentRef.current;
      if (el && el.scrollHeight <= el.clientHeight) {
        setScrolledToBottom(true);
      }
    }, 100);
  };

  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setScrolledToBottom(true);
    }
  };

  const proceedToDashboard = useCallback(() => {
    message.success('Chào mừng đến với Portal!');
    navigate('/dashboard');
  }, [navigate]);

  const handleAgreeAndProceed = useCallback(async () => {
    if (!regulation) return;
    setRegulationModalOpen(false);
    try {
      await apiClient.post(`/hr-app/regulations/${regulation.id}/acknowledge`);
    } catch {
      // Không block nếu acknowledge fail
    }
    proceedToDashboard();
  }, [regulation, proceedToDashboard]);

  const handleLogin = useCallback(async () => {
    if (!username || !password) {
      message.error('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    setLoading(true);
    try {
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

        // Check xác nhận nội quy sau khi login
        try {
          const statusRes = await apiClient.get('/hr-app/regulations/status');
          if (statusRes.data?.success && statusRes.data?.data) {
            const { regulation: reg, acknowledged } = statusRes.data.data;
            if (reg && !acknowledged) {
              setRegulation(reg);
              openRegulationModal();
              return; // Chờ user đồng ý → handleAgreeAndProceed
            }
          }
        } catch {
          // Nếu check fail thì cho login bình thường
        }

        proceedToDashboard();
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
  }, [username, password, proceedToDashboard]);

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

                {regulation && (
                  <div className="pt-3 text-center">
                    <Text style={{ color: '#8b949e', fontSize: '12px', lineHeight: '18px' }}>
                      Bằng việc đăng nhập, tôi đồng ý với{' '}
                      <a
                        onClick={openRegulationModal}
                        style={{ color: tenantColor, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Nội quy
                      </a>
                      {' '}và chấp nhận các mức thưởng phạt được áp dụng khi làm việc tại{' '}
                      <strong style={{ color: '#f0f6fc' }}>{tenantName || 'công ty'}</strong>.
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="mt-8 text-center">
            <Text style={{ color: '#484f58', fontSize: '12px' }}>
              {tenantName ? `© 2026 ${tenantName}. All rights reserved.` : '© 2026. All rights reserved.'}
            </Text>
          </div>
        </div>

        {/* Modal đọc nội quy */}
        <Modal
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileTextOutlined /> {regulation?.title || 'Nội quy'}
            </span>
          }
          open={regulationModalOpen}
          onCancel={() => setRegulationModalOpen(false)}
          closable={false}
          maskClosable={false}
          width={640}
          footer={
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              {scrolledToBottom ? (
                <Button
                  type="primary"
                  size="large"
                  className="w-full border-none h-10 font-bold"
                  style={{ backgroundColor: tenantColor }}
                  onClick={handleAgreeAndProceed}
                >
                  Tôi đã đọc và đồng ý
                </Button>
              ) : (
                <Text style={{ color: '#8b949e', fontSize: 13 }}>
                  Vui lòng cuộn xuống cuối để đọc hết nội dung
                </Text>
              )}
            </div>
          }
        >
          {/* Thông tin phiên bản */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <Tag color="blue" style={{ fontWeight: 700, fontSize: 13 }}>Phiên bản {regulation?.version}</Tag>
            {regulation?.publishedAt && (
              <Text style={{ color: '#8b949e', fontSize: 12 }}>
                <CalendarOutlined /> Ban hành: {new Date(regulation.publishedAt).toLocaleString('vi-VN')}
              </Text>
            )}
          </div>

          <div
            ref={contentRef}
            onScroll={handleContentScroll}
            style={{
              maxHeight: '55vh',
              overflowY: 'auto',
              padding: '16px 0',
              whiteSpace: 'pre-wrap',
              fontSize: 13,
              lineHeight: '22px',
              color: '#c9d1d9',
              borderTop: '1px solid #30363d',
            }}
          >
            {regulation?.content}
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default Login;
