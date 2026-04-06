import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import { useUser } from '../contexts/UserContext';
import RewardList from '../components/store/RewardList';
import RewardHistory from '../components/store/RewardHistory';

const TABS = [
  {
    key: 'PLAY_TIME',
    label: 'Giờ chơi',
    emoji: '🎮',
    notice: 'Đổi sao lấy giờ chơi. Sau khi admin duyệt, số tiền sẽ được cộng trực tiếp vào tài khoản FNET của bạn.',
  },
  {
    key: 'FOOD',
    label: 'Đồ ăn',
    emoji: '🍜',
    notice: 'Đổi sao lấy đồ ăn. Chọn món bạn thích, nhân viên sẽ phục vụ sau khi duyệt yêu cầu.',
  },
  {
    key: 'DRINK',
    label: 'Đồ uống',
    emoji: '🧋',
    notice: 'Đổi sao lấy đồ uống. Chọn món bạn thích, nhân viên sẽ phục vụ sau khi duyệt yêu cầu.',
  },
  {
    key: 'VOUCHER',
    label: 'Voucher',
    emoji: '🎫',
    notice: 'Đổi sao lấy voucher giảm giá. Voucher sẽ được kích hoạt sau khi admin duyệt.',
  },
  {
    key: 'OTHER',
    label: 'Khác',
    emoji: '🎁',
    notice: 'Các phần thưởng đặc biệt khác. Liên hệ quầy để nhận sau khi đổi.',
  },
];

const Store: React.FC = () => {
  const { user } = useUser();
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('PLAY_TIME');

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/promotion-reward/available');
      setRewards(res.data || []);
    } catch {
      setRewards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRewards(); }, [fetchRewards]);

  const handleRewardSuccess = () => {
    setRefreshKey((k) => k + 1);
    fetchRewards();
  };

  const filteredRewards = useMemo(
    () => rewards.filter((r) => r.type === activeTab),
    [rewards, activeTab],
  );

  const currentTab = TABS.find((t) => t.key === activeTab) || TABS[0];

  // Count rewards per tab
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rewards) counts[r.type] = (counts[r.type] || 0) + 1;
    return counts;
  }, [rewards]);

  return (
    <div className="flex p-3 gap-3 h-screen">
      {/* Left - Reward Center */}
      <div className="flex-1 bg-gray-900/95 rounded-xl border border-gray-800 shadow-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">🎁</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100">Trung tâm quà tặng</h2>
              <p className="text-xs text-gray-500">Đổi sao lấy phần thưởng</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
            {TABS.map((tab) => {
              const count = tabCounts[tab.key] || 0;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-transparent'
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Reward Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-7 h-7 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Đang tải phần thưởng...</p>
              </div>
            </div>
          ) : (
            <RewardList rewards={filteredRewards} onRewardSuccess={handleRewardSuccess} />
          )}
        </div>
      </div>

      {/* Right - History */}
      <div className="w-80 bg-gray-900/95 rounded-xl border border-gray-800 shadow-lg overflow-hidden flex flex-col flex-shrink-0">
        {user ? (
          <RewardHistory refreshKey={refreshKey} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🔐</span>
              </div>
              <h3 className="text-base font-semibold text-gray-300 mb-1">Cần đăng nhập</h3>
              <p className="text-gray-500 text-sm">Vui lòng đăng nhập để xem lịch sử đổi thưởng</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Store;
