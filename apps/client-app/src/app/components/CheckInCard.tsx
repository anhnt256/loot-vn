import React, { useCallback, useState } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { App, Spin } from 'antd';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import { getCurrentUser, setCurrentUser } from '../constants';

interface Props {
  onRefresh?: () => void;
}

const CheckInCard: React.FC<Props> = ({ onRefresh }) => {
  const { message } = App.useApp();
  const [isChecking, setIsChecking] = useState(false);

  const currentUser = getCurrentUser();
  const playTime = (currentUser?.totalCheckIn ?? 0) / 1000 / 3600 || 0;
  const claim = currentUser?.claimedCheckIn ?? 0;
  const rewards = currentUser?.availableCheckIn ?? 0;
  const userId = currentUser?.userId || currentUser?.id || 0;

  const handleCheckIn = useCallback(async () => {
    if (rewards <= 0) {
      message.warning('Bạn không có phần thưởng để nhận');
      return;
    }
    setIsChecking(true);
    try {
      await apiClient.post('/dashboard/check-in', { userId });
      message.success('Nhận thưởng thành công!');
      // Refresh user data
      const res = await apiClient.post('/dashboard/user-calculator', { listUsers: [userId] });
      const freshData = Array.isArray(res.data?.data) ? res.data.data[0] : null;
      if (freshData && currentUser) {
        setCurrentUser({ ...currentUser, ...freshData });
      }
      onRefresh?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi khi nhận thưởng!');
    } finally {
      setIsChecking(false);
    }
  }, [rewards, userId, currentUser, onRefresh]);

  const handleUpdate = useCallback(() => {
    onRefresh?.();
    window.location.reload();
  }, [onRefresh]);

  return (
    <div className="border-2 p-4 border-gray-400 shadow-card rounded-lg">
      {isChecking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Spin size="large" />
        </div>
      )}

      {/* Title with date */}
      <div className="text-center mb-4">
        <h2 className="font-sans font-bold text-primary text-xl tracking-wide uppercase">Điểm danh ngày</h2>
        <p className="font-sans font-bold text-secondary text-2xl">
          {dayjs().format('DD/MM/YYYY')}
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-3 py-2">
          <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-gray-400 text-xs">Tổng thời gian chơi</p>
            <p className="font-gaming font-bold text-white text-xl leading-tight">{playTime.toFixed(1)}h</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-3 py-2">
          <StarFilled style={{ color: '#FFD700', fontSize: 20 }} />
          <div>
            <p className="text-gray-400 text-xs">Đã nhận</p>
            <p className="font-gaming font-bold text-yellow-400 text-xl leading-tight">{claim.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-3 py-2">
          <StarOutlined style={{ color: '#FFD700', fontSize: 20 }} />
          <div>
            <p className="text-gray-400 text-xs">Có thể nhận</p>
            <p className="font-gaming font-bold text-yellow-300 text-xl leading-tight">{rewards.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleUpdate}
          className="btn-primary flex-1 flex items-center justify-center gap-1 text-base py-2 px-3 rounded-lg transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Cập nhật</span>
        </button>
        <button
          disabled={rewards <= 0 || isChecking}
          onClick={handleCheckIn}
          className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed text-base py-2 px-3 rounded-lg transition-all duration-200 font-bold"
        >
          Nhận thưởng
        </button>
      </div>
    </div>
  );
};

export default CheckInCard;
