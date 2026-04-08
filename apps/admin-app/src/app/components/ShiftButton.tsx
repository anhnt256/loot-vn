import React, { useState } from 'react';
import { Button, App, Modal } from 'antd';
import {
  PlayCircleOutlined,
  PoweroffOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiClient, getToken } from '@gateway-workspace/shared/utils/client';
import { useNavigate } from 'react-router-dom';

import { useShift } from '../hooks/useShift';
import { useShiftGuard } from '../hooks/useShiftGuard';

import PauseOrderButton from './PauseOrderButton';

/** Map current hour to shift name */
function getCurrentShiftName(): string {
  const h = dayjs().hour();
  if (h >= 6 && h < 14) return 'SANG';
  if (h >= 14 && h < 22) return 'CHIEU';
  return 'TOI';
}

const ShiftButton: React.FC = () => {
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const { currentShift, hasShift, isShiftOwner, canStartShift, startShift } = useShift();
  const { confirmShiftStart } = useShiftGuard();
  const [loading, setLoading] = useState(false);

  // Report check modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportStatus, setReportStatus] = useState<{ bep: boolean; nuoc: boolean } | null>(null);

  const handleStart = async () => {
    const confirmed = await confirmShiftStart();
    if (!confirmed) return;

    // Check if handover reports (báo cáo đầu ca) are submitted
    setLoading(true);
    try {
      const shift = getCurrentShiftName();
      const today = dayjs().format('YYYY-MM-DD');
      const res = await apiClient.get('/admin/handover-reports/check-start-reports', {
        params: { date: today, shift },
      });
      const { allReady, bep, nuoc } = res.data;

      if (!allReady) {
        setReportStatus({ bep, nuoc });
        setReportModalOpen(true);
        setLoading(false);
        return;
      }
    } catch {
      // If check fails, still allow shift start (don't block on API error)
    }

    try {
      await startShift();
      notification.success({ title: 'Đã nhận ca!', placement: 'topRight' });
    } catch (err: any) {
      notification.error({
        message: err?.response?.data?.message ?? 'Không thể nhận ca',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const openEndGate = () => {
    window.dispatchEvent(new CustomEvent('shift:open-end-gate'));
  };

  // Đang có ca nhưng KHÔNG phải người nhận ca → chỉ hiển thị thông tin, khoá thao tác
  if (hasShift && !isShiftOwner) {
    return (
      <div className="flex items-center gap-2">
        <LockOutlined className="text-yellow-400" />
        <span className="text-xs text-yellow-400">
          {currentShift!.staffName} đang nhận ca ({dayjs(currentShift!.startedAt).format('HH:mm')})
        </span>
      </div>
    );
  }

  // Parse JWT for workShifts
  const jwtToken = getToken() || '';
  let jwtWorkShifts: any[] = [];
  try {
    const base64 = jwtToken.split('.')[1];
    const bytes = atob(base64);
    const text = decodeURIComponent(
      bytes.split('').map(c => `%${  c.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')
    );
    jwtWorkShifts = JSON.parse(text).workShifts || [];
  } catch { /* ignore */ }

  const defaultTenantConfig = (typeof window !== 'undefined' && (window as any).__TENANT_CONFIG__) || {};
  const primaryColor = defaultTenantConfig?.primaryColor || '#1677ff';

  // Đang có ca VÀ là shift owner → hiển thị controls
  if (hasShift && isShiftOwner) {
    return (
      <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:inline">
            {currentShift!.staffName} · {dayjs(currentShift!.startedAt).format('HH:mm')}
          </span>
          <PauseOrderButton />
          <Button
            icon={<PoweroffOutlined />}
            onClick={openEndGate}
            loading={loading}
            style={{ borderColor: '#ef4444', color: '#ef4444' }}
          >
            KẾT CA
          </Button>
        </div>
    );
  }

  // User không nằm trong ca làm việc → không hiện nút
  if (!canStartShift) {
    return null;
  }

  // Chưa có ca → nút nhận ca
  return (
    <>
      <Button
        type="primary"
        icon={<PlayCircleOutlined />}
        onClick={handleStart}
        loading={loading}
        style={{ background: '#22c55e', borderColor: '#22c55e' }}
      >
        NHẬN CA
      </Button>

      {/* Modal yêu cầu báo cáo đầu ca */}
      <Modal
        open={reportModalOpen}
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined style={{ color: '#f59e0b' }} />
            <span>Cần gửi báo cáo đầu ca</span>
          </div>
        }
        onCancel={() => setReportModalOpen(false)}
        footer={null}
        width={420}
      >
        <div className="flex flex-col gap-4 pt-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800 font-medium mb-1">
              Bạn cần gửi báo cáo NVL đầu ca trước khi nhận ca.
            </p>
            <p className="text-xs text-yellow-600">
              Vui lòng gửi đủ cả 2 báo cáo Bếp và Nước cho ca hiện tại.
            </p>
          </div>

          {reportStatus && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                {reportStatus.bep ? (
                  <CheckCircleOutlined style={{ color: '#22c55e' }} />
                ) : (
                  <CloseCircleOutlined style={{ color: '#ef4444' }} />
                )}
                <span className="text-sm">Báo cáo Bếp (đầu ca)</span>
                <span className={`ml-auto text-xs font-medium ${reportStatus.bep ? 'text-green-600' : 'text-red-500'}`}>
                  {reportStatus.bep ? 'Đã gửi' : 'Chưa gửi'}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                {reportStatus.nuoc ? (
                  <CheckCircleOutlined style={{ color: '#22c55e' }} />
                ) : (
                  <CloseCircleOutlined style={{ color: '#ef4444' }} />
                )}
                <span className="text-sm">Báo cáo Nước (đầu ca)</span>
                <span className={`ml-auto text-xs font-medium ${reportStatus.nuoc ? 'text-green-600' : 'text-red-500'}`}>
                  {reportStatus.nuoc ? 'Đã gửi' : 'Chưa gửi'}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button className="flex-1" onClick={() => setReportModalOpen(false)}>
              Để sau
            </Button>
            <Button
              type="primary"
              className="flex-1"
              icon={<FileTextOutlined />}
              onClick={() => {
                setReportModalOpen(false);
                navigate('/dashboard/handover-reports');
              }}
            >
              Đi báo cáo NVL
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ShiftButton;
