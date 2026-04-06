import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import dayjs from 'dayjs';

interface RewardHistoryItem {
  id: number;
  rewardName: string;
  starsCost: number;
  status: string;
  rewardType: string;
  recipeName?: string;
  recipeImageUrl?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

interface RewardHistoryProps {
  refreshKey: number;
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <span className="px-2 py-0.5 text-[10px] font-medium bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">Chờ xử lý</span>;
    case 'APPROVED':
      return <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">Đã duyệt</span>;
    case 'COMPLETED':
      return <span className="px-2 py-0.5 text-[10px] font-medium bg-green-500/20 text-green-400 rounded-full border border-green-500/30">Hoàn thành</span>;
    case 'REJECTED':
      return <span className="px-2 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">Từ chối</span>;
    default:
      return <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-500/20 text-gray-400 rounded-full">{status}</span>;
  }
};

const TYPE_META: Record<string, { icon: string; border: string }> = {
  PLAY_TIME: { icon: '🎮', border: 'border-violet-500/60' },
  FOOD:      { icon: '🍜', border: 'border-amber-500/60' },
  DRINK:     { icon: '🧋', border: 'border-cyan-500/60' },
  VOUCHER:   { icon: '🎫', border: 'border-pink-500/60' },
  OTHER:     { icon: '🎁', border: 'border-gray-500/60' },
};

const formatDate = (d: string) => dayjs(d).format('DD/MM HH:mm');

const RewardHistory: React.FC<RewardHistoryProps> = ({ refreshKey }) => {
  const [items, setItems] = useState<RewardHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/promotion-reward/my-history');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory, refreshKey]);

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-base font-semibold text-gray-200">Lịch sử đổi thưởng</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-200">Lịch sử đổi thưởng</h3>
            {items.length > 0 && (
              <p className="text-[11px] text-gray-500 mt-0.5">{items.length} giao dịch</p>
            )}
          </div>
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg text-white font-medium transition-colors cursor-pointer disabled:opacity-50"
            style={{ background: 'var(--primary-color, #eb2b90)' }}
          >
            {loading ? '...' : 'Cập nhật'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length > 0 ? (
          items.map((item) => {
            const hasImage = item.recipeImageUrl && ['FOOD', 'DRINK'].includes(item.rewardType);
            const meta = TYPE_META[item.rewardType] || TYPE_META.OTHER;
            return (
              <div key={item.id} className="bg-gray-800/60 border border-gray-700 rounded-lg p-2.5 hover:border-gray-600 transition-colors">
                <div className="flex gap-2.5">
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    {/* Row 1: Title */}
                    <p className="text-sm font-semibold truncate mb-0.5" style={{ color: 'var(--primary-color, #eb2b90)' }}>
                      {item.rewardName}
                    </p>

                    {/* Row 2: Recipe name */}
                    {item.recipeName && (
                      <p className="text-[11px] truncate mb-0.5 lowercase" style={{ color: 'var(--secondary-color, #23c3f3)' }}>
                        {item.recipeName}
                      </p>
                    )}

                    {/* Row 3: Stars + Date + Status */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-white">
                        ⭐ {item.starsCost.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {formatDate(item.createdAt)}
                      </span>
                      <span className="ml-auto">{statusBadge(item.status)}</span>
                    </div>
                  </div>

                  {/* Right: Image or Icon */}
                  <div className={`w-14 self-stretch rounded-lg overflow-hidden flex-shrink-0 bg-gray-900 flex items-center justify-center border-2 ${meta.border}`}>
                    {hasImage ? (
                      <img
                        src={`${apiClient.defaults.baseURL ?? ''}${item.recipeImageUrl}`}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xl">{meta.icon}</span>
                    )}
                  </div>
                </div>

                {item.note && (
                  <div className="mt-2 p-1.5 bg-gray-900/50 rounded border border-gray-700">
                    <p className="text-[10px] text-gray-400">{item.note}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-400 font-medium mb-1">Chưa có lịch sử</p>
              <p className="text-gray-500 text-sm">Hãy đổi thưởng đầu tiên</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardHistory;
