import React, { useState } from 'react';
import { Button, App, Tag } from 'antd';
import { PlayCircleOutlined, PoweroffOutlined, LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useShift } from '../hooks/useShift';
import PauseOrderButton from './PauseOrderButton';

const ShiftButton: React.FC = () => {
  const { notification, modal } = App.useApp();
  const { currentShift, hasShift, isShiftOwner, startShift, endShift } = useShift();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await startShift();
      notification.success({ message: 'Đã nhận ca!', placement: 'topRight' });
    } catch (err: any) {
      notification.error({
        message: err?.response?.data?.message ?? 'Không thể nhận ca',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = () => {
    modal.confirm({
      title: 'Kết thúc ca làm việc?',
      content: 'Hệ thống sẽ chốt doanh số và ngưng nhận đơn. Bạn có chắc chắn?',
      okText: 'Xác nhận kết ca',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        setLoading(true);
        try {
          await endShift();
          notification.success({ message: 'Đã kết ca', placement: 'topRight' });
        } catch (err: any) {
          notification.error({
            message: err?.response?.data?.message ?? 'Không thể kết ca',
            placement: 'topRight',
          });
        } finally {
          setLoading(false);
        }
      },
    });
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
          onClick={handleEnd}
          loading={loading}
          style={{ borderColor: '#ef4444', color: '#ef4444' }}
        >
          KẾT CA
        </Button>
      </div>
    );
  }

  // Chưa có ca → nút nhận ca
  return (
    <Button
      type="primary"
      icon={<PlayCircleOutlined />}
      onClick={handleStart}
      loading={loading}
      style={{ background: '#22c55e', borderColor: '#22c55e' }}
    >
      NHẬN CA
    </Button>
  );
};

export default ShiftButton;
