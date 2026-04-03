import React, { useEffect, useState } from 'react';
import { Button, Modal, DatePicker, Input, App, Tooltip } from 'antd';
import { StopOutlined, PlayCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { apiClient } from '@gateway-workspace/shared/utils/client';

interface PauseStatus {
  paused: boolean;
  resumeAt?: string;
  note?: string | null;
  pausedAt?: string;
}

const PauseOrderButton: React.FC = () => {
  const { notification, modal } = App.useApp();
  const [status, setStatus] = useState<PauseStatus>({ paused: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeAt, setResumeAt] = useState<Dayjs | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [countdown, setCountdown] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await apiClient.get('/admin/orders/pause-status');
      setStatus(res.data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!status.paused || !status.resumeAt) { setCountdown(''); return; }
    const tick = () => {
      const diff = new Date(status.resumeAt!).getTime() - Date.now();
      if (diff <= 0) { setCountdown(''); fetchStatus(); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(h > 0 ? `${h}g ${m}p` : m > 0 ? `${m}p ${s}s` : `${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status]);

  const handlePause = async () => {
    if (!resumeAt) return;
    setSaving(true);
    try {
      await apiClient.post('/admin/orders/pause', {
        resumeAt: resumeAt.toISOString(),
        note: note.trim() || undefined,
      });
      notification.success({ message: 'Đã ngưng nhận đơn', placement: 'topRight' });
      setModalOpen(false);
      setResumeAt(null);
      setNote('');
      await fetchStatus();
    } catch (err: any) {
      notification.error({
        message: err?.response?.data?.message ?? 'Có lỗi xảy ra',
        placement: 'topRight',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResume = () => {
    modal.confirm({
      title: 'Mở lại nhận đơn?',
      content: 'Hệ thống sẽ nhận đơn trở lại ngay lập tức.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.delete('/admin/orders/pause');
          notification.success({ message: 'Đã mở lại nhận đơn', placement: 'topRight' });
          await fetchStatus();
        } catch {
          notification.error({ message: 'Có lỗi xảy ra', placement: 'topRight' });
        }
      },
    });
  };

  if (status.paused) {
    return (
      <Tooltip
        title={
          <div>
            <div>Mở lại lúc: <b>{dayjs(status.resumeAt).format('HH:mm DD/MM')}</b></div>
            {status.note && <div className="mt-1 text-gray-300">{status.note}</div>}
          </div>
        }
      >
        <button
          onClick={handleResume}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#7c3aed', border: '1px solid #7c3aed', color: '#fff',
            borderRadius: 6, padding: '4px 15px', fontSize: 14, cursor: 'pointer',
            lineHeight: '22px', height: 32,
          }}
        >
          <PlayCircleOutlined />
          <span>Đang ngưng</span>
          {countdown && (
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0 6px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }}>
              {countdown}
            </span>
          )}
        </button>
      </Tooltip>
    );
  }

  return (
    <>
      <Button
        icon={<StopOutlined />}
        onClick={() => setModalOpen(true)}
        style={{ borderColor: '#f97316', color: '#f97316' }}
      >
        Ngưng nhận đơn
      </Button>

      <Modal
        open={modalOpen}
        title={
          <div className="flex items-center gap-2">
            <StopOutlined style={{ color: '#f97316' }} />
            <span>Ngưng nhận đơn hàng</span>
          </div>
        }
        onCancel={() => { setModalOpen(false); setResumeAt(null); setNote(''); }}
        footer={null}
        width={420}
      >
        <div className="flex flex-col gap-4 pt-2">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">
              Mở lại nhận đơn vào lúc <span className="text-red-500">*</span>
            </p>
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn thời điểm mở lại"
              value={resumeAt}
              onChange={setResumeAt}
              disabledDate={(d) => d.isBefore(dayjs(), 'day')}
              disabledTime={() => ({
                disabledHours: () => {
                  if (!resumeAt || resumeAt.isSame(dayjs(), 'day')) {
                    return Array.from({ length: dayjs().hour() }, (_, i) => i);
                  }
                  return [];
                },
              })}
              className="w-full"
              size="large"
            />
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <ClockCircleOutlined />
              Đơn sẽ tự động mở lại khi đến mốc thời gian này
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">
              Ghi chú <span className="text-gray-400 font-normal">(tùy chọn)</span>
            </p>
            <Input.TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Hết nguyên liệu, đang dọn dẹp..."
              rows={3}
              maxLength={200}
              showCount
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              className="flex-1"
              onClick={() => { setModalOpen(false); setResumeAt(null); setNote(''); }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              danger
              className="flex-1"
              icon={<StopOutlined />}
              disabled={!resumeAt}
              loading={saving}
              onClick={handlePause}
            >
              Ngưng nhận đơn
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PauseOrderButton;
