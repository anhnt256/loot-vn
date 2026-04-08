import React, { useEffect, useState, useCallback } from 'react';
import { App } from 'antd';
import { apiClient } from '@gateway-workspace/shared/utils/client';

import { useUser } from '../contexts/UserContext';
import MeteorEffect from '../components/game/MeteorEffect';
import { WishResult } from '../components/game/WishResult';
import { Rules } from '../components/game/Rules';
import CircleSegments from '../components/game/CirclePrize';

interface Segment {
  id: number;
  title: string;
  background: string;
  textColor: string;
  value?: number;
}

function getUpRateAmount(): number {
  return Number((window as any).__TENANT_CONFIG__?.upRateAmount) || 500000;
}

const Game: React.FC = () => {
  const { message } = App.useApp();
  const { user, refreshUser } = useUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [showMeteor, setShowMeteor] = useState(false);
  const [meteorStar, setMeteorStar] = useState<number>(3);
  const [single, setSingle] = useState<boolean>(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [segments, setSegments] = useState<Segment[]>([]);
  const [round, setRound] = useState(0);
  const [giftRound, setGiftRound] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [selectedType, setSelectedType] = useState<'round' | 'giftRound'>('round');

  // Fetch game segments
  useEffect(() => {
    apiClient
      .get('/game/items')
      .then((res) => setSegments(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSegments([]));
  }, []);

  // Fetch game-specific user info
  const fetchGameInfo = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const res = await apiClient.get('/dashboard/me');
      const data = res.data;
      setRound(data.round || 0);
      setGiftRound(data.giftRound || 0);
      setTotalPayment(data.totalPayment || 0);
    } catch {
      // ignore
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchGameInfo();
  }, [fetchGameInfo]);

  const handleMeteorAnimation = (data: any[]) => {
    const ids = data.map((item: any) => item.id);
    const isSingle = ids.length === 1;
    setSingle(isSingle);

    let starLevel = 3;
    if (ids.includes(4) || ids.includes(5)) starLevel = 4;
    if (ids.includes(6) || ids.includes(7) || ids.includes(8)) starLevel = 5;
    setMeteorStar(starLevel);

    setShowMeteor(true);
    setIsAnimating(true);
  };

  const handleRoll = async (rolls: number) => {
    if (isRolling || isAnimating || !user?.userId) return;
    setIsRolling(true);
    try {
      const res = await apiClient.post('/game/result', {
        userId: Number(user.userId),
        rolls,
        type: selectedType === 'round' ? 'Wish' : 'Gift',
      });
      setIsRolling(false);
      handleMeteorAnimation(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err: any) {
      setIsRolling(false);
      message.error(
        err?.response?.data?.message || 'Không thể thực hiện quay. Vui lòng thử lại.',
      );
    }
  };

  // After meteor animation ends, refresh user info
  useEffect(() => {
    if (!showMeteor && !isAnimating) {
      fetchGameInfo();
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMeteor]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openRuleModal = () => setIsRuleModalOpen(true);
  const closeRuleModal = () => setIsRuleModalOpen(false);

  if (!user) return null;

  return (
    <div className="flex flex-col p-3 h-screen">
      <div className="flex-1 bg-gray-900/95 rounded-xl border border-gray-800 shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className="flex justify-between items-center p-3 flex-shrink-0"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          <h2 className="text-lg font-semibold text-white">Đền Nguyện Ước</h2>
          <div className="flex gap-2">
            <div className="bg-black/20 rounded px-2 py-1">
              <span className="text-white text-xs font-medium">
                Tổng nạp: {totalPayment?.toLocaleString() || 0}
              </span>
            </div>
            <div
              className={`flex items-center gap-1 rounded px-2 py-1 cursor-pointer transition-colors ${
                selectedType === 'round'
                  ? 'bg-white/90 border border-white/50'
                  : 'bg-black/20'
              }`}
              style={selectedType === 'round' ? { color: 'var(--primary-color)' } : {}}
              onClick={() => setSelectedType('round')}
            >
              <span className="text-xs font-medium">{round?.toLocaleString() || 0}</span>
              <img src="/rock.png" alt="wish" width="12" height="12" />
            </div>
            <div
              className={`flex items-center gap-1 rounded px-2 py-1 cursor-pointer transition-colors ${
                selectedType === 'giftRound'
                  ? 'bg-white/90 border border-white/50'
                  : 'bg-black/20'
              }`}
              style={selectedType === 'giftRound' ? { color: 'var(--primary-color)' } : {}}
              onClick={() => setSelectedType('giftRound')}
            >
              <span className="text-xs font-medium">{giftRound?.toLocaleString() || 0}</span>
              <span className="text-xs">🎁</span>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-900/30 border-b border-red-800/30 p-2 flex-shrink-0">
          <p className="text-red-300 text-xs leading-tight">
            Số lượt quay được tính theo tổng tiền nạp trong tuần, và reset vào 0h mỗi thứ 2 hàng
            tuần. Vui lòng sử dụng sớm để tránh mất lượt.
          </p>
          <p className="text-xs font-bold mt-1 leading-tight text-secondary">
            {`Tỉ lệ trúng Jackpot sẽ được cải thiện mạnh khi trên ${getUpRateAmount().toLocaleString()} VNĐ. Hãy để ý nhé`}
          </p>
        </div>

        {/* Game Wheel Section */}
        <div className="flex-1 flex justify-center items-center bg-gray-800/30 p-2 min-h-0">
          <div className="w-full h-full flex items-center justify-center">
            <CircleSegments segments={segments} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center bg-gray-800/50 p-4 flex-shrink-0 border-t border-gray-700/50">
          <div className="flex gap-3">
            <button
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer"
              onClick={openModal}
            >
              Lịch sử
            </button>
            <button
              className="text-white px-4 py-2 rounded text-sm font-medium transition-colors btn-secondary cursor-pointer"
              onClick={openRuleModal}
            >
              Thể lệ
            </button>
            <button
              className="text-white px-5 py-2 rounded text-sm font-medium flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-primary cursor-pointer"
              onClick={() => handleRoll(1)}
              disabled={
                isRolling ||
                isAnimating ||
                (selectedType === 'round' && round <= 0) ||
                (selectedType === 'giftRound' && giftRound <= 0)
              }
            >
              {selectedType === 'giftRound' ? (
                <span className="text-sm">🎁</span>
              ) : (
                <img src="/rock.png" alt="wish" width="14" height="14" />
              )}
              Ước
            </button>
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded text-sm font-medium flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              onClick={() => handleRoll(10)}
              disabled={
                isRolling ||
                isAnimating ||
                (selectedType === 'round' && round < 10) ||
                (selectedType === 'giftRound' && giftRound < 10)
              }
            >
              {selectedType === 'giftRound' ? (
                <span className="text-sm">🎁</span>
              ) : (
                <img src="/rock.png" alt="wish" width="14" height="14" />
              )}
              Ước x10
            </button>
          </div>
        </div>

        {/* Meteor Effect Overlay */}
        {showMeteor && (
          <MeteorEffect
            show={showMeteor}
            isSingle={single}
            rarity={meteorStar}
            setShowMeteor={(show) => {
              setShowMeteor(show);
              if (!show) setIsAnimating(false);
            }}
            openModal={openModal}
          />
        )}

        {/* Modals */}
        {isModalOpen && <WishResult isModalOpen={isModalOpen} closeModal={closeModal} />}
        {isRuleModalOpen && <Rules isModalOpen={isRuleModalOpen} closeModal={closeRuleModal} />}
      </div>
    </div>
  );
};

export default Game;
