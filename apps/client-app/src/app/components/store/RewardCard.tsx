import React, { useState, useRef, useCallback } from 'react';
import { App, Modal } from 'antd';
import { apiClient } from '@gateway-workspace/shared/utils/client';

import { useUser } from '../../contexts/UserContext';

interface Recipe {
  recipeId: number;
  recipeName: string;
  recipeImageUrl?: string;
  availableStock?: number;
}

interface RewardCardProps {
  data: {
    id: number;
    name: string;
    description?: string;
    type: string;
    starsCost: number;
    walletType?: string;
    moneyAmount?: number;
    recipes?: Recipe[];
    remainingQuantity?: number | null;
    totalQuantity?: number | null;
  };
  onRewardSuccess: () => void;
}

const ACCENTS: Record<string, { gradient: string; btn: string; shine: string }> = {
  PLAY_TIME: {
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
    btn: 'from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500',
    shine: 'rgba(129,140,248,0.15)',
  },
  FOOD: {
    gradient: 'linear-gradient(135deg, #451a03 0%, #78350f 40%, #b45309 100%)',
    btn: 'from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500',
    shine: 'rgba(251,191,36,0.15)',
  },
  DRINK: {
    gradient: 'linear-gradient(135deg, #042f2e 0%, #115e59 40%, #0d9488 100%)',
    btn: 'from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500',
    shine: 'rgba(34,211,238,0.15)',
  },
  VOUCHER: {
    gradient: 'linear-gradient(135deg, #4a0e2e 0%, #831843 40%, #be185d 100%)',
    btn: 'from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500',
    shine: 'rgba(244,114,182,0.15)',
  },
  OTHER: {
    gradient: 'linear-gradient(135deg, #1f2937 0%, #374151 40%, #4b5563 100%)',
    btn: 'from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500',
    shine: 'rgba(156,163,175,0.15)',
  },
};

const RewardCard: React.FC<RewardCardProps> = ({ data, onRewardSuccess }) => {
  const { id, name, starsCost, type, walletType, recipes, remainingQuantity, totalQuantity } = data;
  const { user, refreshUser } = useUser();
  const { message } = App.useApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, sx: 50, sy: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmInfo, setConfirmInfo] = useState<{ recipeId?: number; recipeName?: string } | null>(null);

  const actualStars = user?.stars ?? 0;
  const canRedeem = actualStars >= starsCost;
  const accent = ACCENTS[type] || ACCENTS.OTHER;
  const hasMultipleRecipes = ['FOOD', 'DRINK'].includes(type) && recipes && recipes.length > 1;
  const recipeCount = recipes?.length || 0;
  const isOutOfQuota = remainingQuantity !== null && remainingQuantity !== undefined && remainingQuantity <= 0;

  let tag = '';
  if (type === 'PLAY_TIME') tag = walletType === 'MAIN' ? 'TK Chính' : 'TK Phụ';
  if (['FOOD', 'DRINK'].includes(type) && recipeCount > 0) tag = `${recipeCount} món`;

  // 3D tilt
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (y - 0.5) * -12, y: (x - 0.5) * 12, sx: x * 100, sy: y * 100 });
  }, []);

  const onRedeem = async (recipeId?: number) => {
    if (loading || !canRedeem) return;
    if (!user) { message.error('Vui lòng đăng nhập.'); return; }
    setLoading(true);
    try {
      await apiClient.post('/promotion-reward/redeem', { rewardId: id, chosenRecipeId: recipeId });
      message.success('Đổi thưởng thành công!');
      setModalOpen(false);
      await refreshUser();
      onRewardSuccess();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const confirmRedeem = (recipeId?: number, recipeName?: string) => {
    setConfirmInfo({ recipeId, recipeName });
  };

  // Check if single recipe is out of stock
  const singleRecipeOutOfStock = !hasMultipleRecipes && recipes?.[0]?.availableStock !== undefined && recipes[0].availableStock <= 0;
  const allRecipesOutOfStock = ['FOOD', 'DRINK'].includes(type) && recipes?.length
    ? recipes.every((r) => r.availableStock !== undefined && r.availableStock <= 0)
    : false;

  const handleClick = () => {
    if (!canRedeem || loading || isOutOfQuota || singleRecipeOutOfStock) return;
    if (hasMultipleRecipes) {
      setModalOpen(true);
    } else {
      confirmRedeem(recipes?.[0]?.recipeId, recipes?.[0]?.recipeName || name);
    }
  };

  return (
    <>
      <div style={{ perspective: '800px' }}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); setTilt({ x: 0, y: 0, sx: 50, sy: 50 }); }}
          style={{
            background: accent.gradient,
            transform: isHovered
              ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.03,1.03,1.03)`
              : 'rotateX(0) rotateY(0) scale3d(1,1,1)',
            transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
            transformStyle: 'preserve-3d',
          }}
          className="relative rounded-2xl overflow-hidden border border-white/[0.08]"
        >
          {/* Holographic shine */}
          <div
            style={{
              background: isHovered
                ? `radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, ${accent.shine} 0%, transparent 60%)`
                : 'none',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s',
            }}
            className="absolute inset-0 z-10 pointer-events-none"
          />
          {/* Rainbow edge */}
          <div
            style={{
              background: isHovered
                ? `linear-gradient(${tilt.y * 10 + 135}deg, rgba(255,0,128,0.08), rgba(0,200,255,0.08), rgba(128,0,255,0.08), rgba(255,200,0,0.08))`
                : 'none',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s',
            }}
            className="absolute inset-0 z-10 pointer-events-none"
          />
          <div className="absolute inset-0 rounded-2xl border border-white/[0.06] pointer-events-none z-10" />

          {/* Content */}
          <div className="relative z-20 p-5">
            {/* Title + Tag */}
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-[15px] font-bold text-white/90 flex-1 truncate drop-shadow-sm">{name}</h3>
              {tag && (
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/70 border border-white/10 backdrop-blur-sm whitespace-nowrap">
                  {tag}
                </span>
              )}
            </div>

            {/* Stars */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-300 text-lg drop-shadow-md">⭐</span>
              <span className="text-2xl font-black text-white tracking-tight drop-shadow-sm">
                {starsCost.toLocaleString()}
              </span>
            </div>

            {/* Remaining quantity & stock info */}
            <div className="mb-3 text-[11px] space-y-0.5">
              {remainingQuantity != null && (
                <p className={remainingQuantity <= 0 ? 'text-red-400' : remainingQuantity <= 5 ? 'text-amber-400' : 'text-white/50'}>
                  Còn lại: {remainingQuantity}/{totalQuantity} lượt
                </p>
              )}
              {['FOOD', 'DRINK'].includes(type) && recipes?.length === 1 && recipes[0].availableStock != null && (
                <p className={recipes[0].availableStock <= 0 ? 'text-red-400' : recipes[0].availableStock <= 5 ? 'text-amber-400' : 'text-white/50'}>
                  {recipes[0].availableStock <= 0 ? 'Hết tồn kho' : `Tồn kho: ${recipes[0].availableStock}`}
                </p>
              )}
            </div>

            {/* Button */}
            <button
              disabled={!canRedeem || loading || isOutOfQuota || singleRecipeOutOfStock || allRecipesOutOfStock}
              onClick={handleClick}
              className={`w-full py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${
                canRedeem && !loading && !isOutOfQuota && !singleRecipeOutOfStock && !allRecipesOutOfStock
                  ? `bg-gradient-to-r ${accent.btn} text-white shadow-lg shadow-black/30 cursor-pointer active:scale-[0.96]`
                  : 'bg-black/30 text-white/25 cursor-not-allowed border border-white/5'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                </span>
              ) : isOutOfQuota ? (
                'HẾT LƯỢT ĐỔI'
              ) : singleRecipeOutOfStock || allRecipesOutOfStock ? (
                'HẾT HÀNG'
              ) : !canRedeem ? (
                'KHÔNG ĐỦ SAO'
              ) : hasMultipleRecipes ? (
                'CHỌN MÓN'
              ) : (
                'ĐỔI NGAY'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recipe selection modal */}
      <Modal
        title={<span style={{ color: '#e5e7eb' }}>Chọn món — {name}</span>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          maxHeight: 420,
          overflow: 'auto',
          padding: '12px 0',
        }}>
          {recipes?.map((r) => {
            const outOfStock = r.availableStock !== undefined && r.availableStock <= 0;
            const disabled = loading || outOfStock;
            return (
            <div
              key={r.recipeId}
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                border: '1.5px solid rgba(75,85,99,0.5)',
                background: 'rgba(31,41,55,0.8)',
                transition: 'all 0.2s',
                opacity: outOfStock ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { if (!outOfStock) { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(75,85,99,0.5)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Image */}
              <div style={{ aspectRatio: '4/3', background: '#111827', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {r.recipeImageUrl ? (
                  <img
                    src={`${apiClient.defaults.baseURL ?? ''}${r.recipeImageUrl}`}
                    alt={r.recipeName}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ fontSize: 36, opacity: 0.3 }}>
                    {type === 'FOOD' ? '🍜' : '🧋'}
                  </span>
                )}
                {outOfStock && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 14 }}>HẾT HÀNG</span>
                  </div>
                )}
              </div>

              {/* Name + Stock + Button */}
              <div style={{ padding: '10px 12px' }}>
                <p style={{
                  color: '#e5e7eb',
                  fontWeight: 600,
                  fontSize: 13,
                  marginBottom: 4,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }} title={r.recipeName}>
                  {r.recipeName}
                </p>
                <p style={{
                  fontSize: 11,
                  marginBottom: 8,
                  color: outOfStock ? '#ef4444' : r.availableStock != null && r.availableStock <= 5 ? '#f59e0b' : '#9ca3af',
                }}>
                  {r.availableStock != null
                    ? outOfStock ? 'Hết tồn kho' : `Tồn kho: ${r.availableStock}`
                    : ''}
                </p>
                <button
                  disabled={disabled}
                  onClick={() => !disabled && confirmRedeem(r.recipeId, r.recipeName)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 10,
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: disabled ? '#374151' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: disabled ? '#6b7280' : '#fff',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? '...' : outOfStock ? 'HẾT HÀNG' : 'ĐỔI NGAY'}
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </Modal>

      {/* Confirm modal */}
      <Modal
        title={<span style={{ color: '#e5e7eb' }}>Xác nhận đổi thưởng</span>}
        open={!!confirmInfo}
        onCancel={() => setConfirmInfo(null)}
        footer={null}
        width={400}
        destroyOnClose
      >
        <div style={{ padding: '16px 0 8px', textAlign: 'center' }}>
          <p style={{ color: '#d1d5db', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
            Bạn đang đổi <strong style={{ color: '#fff' }}>1 {confirmInfo?.recipeName || name}</strong> với <strong style={{ color: '#eab308' }}>⭐ {starsCost.toLocaleString()} sao</strong>. Vui lòng xác nhận.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setConfirmInfo(null)}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #4b5563',
                background: 'transparent', color: '#9ca3af', fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Huỷ
            </button>
            <button
              disabled={loading}
              onClick={() => {
                if (confirmInfo) {
                  onRedeem(confirmInfo.recipeId);
                  setConfirmInfo(null);
                }
              }}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                background: loading ? '#374151' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: loading ? '#6b7280' : '#fff', fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Đang xử lý...' : 'Đồng ý'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RewardCard;
