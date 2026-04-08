import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, Input, Select, Tag, App, Tooltip } from 'antd';
import { ToolOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { apiClient } from '@gateway-workspace/shared/utils/client';

const { TextArea } = Input;

const DURATION_OPTIONS = [
  { value: 15, label: '15 phút' },
  { value: 30, label: '30 phút' },
  { value: 60, label: '1 giờ' },
  { value: 120, label: '2 giờ' },
  { value: 240, label: '4 giờ' },
  { value: 0, label: 'Không giới hạn' },
];

interface MaintenanceStatus {
  enabled: boolean;
  note: string;
  startedAt: string | null;
  scheduledEnd: string | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

function calcRemaining(endIso: string) {
  const diff = Math.max(0, Math.floor((new Date(endIso).getTime() - Date.now()) / 1000));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return { total: diff, text: h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}` };
}

const MaintenanceButton: React.FC = () => {
  const { notification, modal } = App.useApp();
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [countdown, setCountdown] = useState('');
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await apiClient.get('/maintenance/status');
      setStatus(res.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Countdown ticker
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);

    if (!status?.enabled || !status?.scheduledEnd) {
      setCountdown('');
      return;
    }

    const tick = () => {
      const r = calcRemaining(status.scheduledEnd!);
      if (r.total <= 0) {
        setCountdown('');
        fetchStatus(); // re-check, TTL may have expired
      } else {
        setCountdown(r.text);
      }
    };

    tick();
    tickRef.current = setInterval(tick, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [status?.enabled, status?.scheduledEnd]);

  const handleToggle = async (enable: boolean) => {
    if (enable) {
      setLoading(true);
      try {
        const res = await apiClient.post('/maintenance/toggle', {
          enabled: true,
          note,
          durationMinutes: duration || undefined,
        });
        setStatus(res.data);
        setOpen(false);
        notification.success({ title: 'Bảo trì đã được BẬT', description: 'Client sẽ không thể truy cập hệ thống.' });
      } catch (err: any) {
        notification.error({ title: 'Lỗi', description: err?.response?.data?.message || 'Không thể bật bảo trì' });
      } finally {
        setLoading(false);
      }
    } else {
      modal.confirm({
        title: 'Tắt chế độ bảo trì?',
        content: 'Client sẽ có thể truy cập lại hệ thống ngay lập tức.',
        okText: 'Tắt bảo trì',
        cancelText: 'Huỷ',
        onOk: async () => {
          try {
            const res = await apiClient.post('/maintenance/toggle', { enabled: false });
            setStatus(res.data);
            notification.success({ title: 'Bảo trì đã TẮT', description: 'Hệ thống hoạt động bình thường.' });
          } catch (err: any) {
            notification.error({ title: 'Lỗi', description: err?.response?.data?.message || 'Không thể tắt bảo trì' });
          }
        },
      });
    }
  };

  const isActive = status?.enabled === true;

  return (
    <>
      <Tooltip title={isActive && status?.note ? `Ghi chú: ${status.note}` : undefined}>
        <Button
          icon={<ToolOutlined />}
          type={isActive ? 'primary' : 'default'}
          danger={isActive}
          onClick={() => {
            if (isActive) {
              handleToggle(false);
            } else {
              setNote('');
              setDuration(30);
              setOpen(true);
            }
          }}
        >
          {isActive ? (
            <>
              Đang bảo trì
              {countdown && (
                <span className="ml-1.5 font-mono text-xs opacity-90">
                  <ClockCircleOutlined className="mr-1" />
                  {countdown}
                </span>
              )}
              {!countdown && status?.scheduledEnd === null && (
                <span className="ml-1.5 text-xs opacity-70">∞</span>
              )}
            </>
          ) : 'Bảo trì'}
        </Button>
      </Tooltip>

      <Modal
        title="Bật chế độ bảo trì"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => handleToggle(true)}
        okText="Bật bảo trì"
        cancelText="Huỷ"
        confirmLoading={loading}
        okButtonProps={{ danger: true }}
      >
        <div className="flex flex-col gap-4 py-2">
          <div>
            <div className="text-gray-400 mb-1 text-sm">Thời gian bảo trì</div>
            <Select
              value={duration}
              onChange={setDuration}
              options={DURATION_OPTIONS}
              className="w-full"
            />
          </div>
          <div>
            <div className="text-gray-400 mb-1 text-sm">Ghi chú (hiển thị cho người dùng)</div>
            <TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Hệ thống đang nâng cấp, vui lòng quay lại sau..."
              rows={3}
            />
          </div>
          <Tag color="red" className="text-center">
            Khi bật bảo trì, tất cả Client sẽ không thể truy cập hệ thống
          </Tag>
        </div>
      </Modal>
    </>
  );
};

export default MaintenanceButton;
