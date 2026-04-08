import React from 'react';

import RewardCard from './RewardCard';

interface Reward {
  id: number;
  name: string;
  description?: string;
  type: string;
  starsCost: number;
  walletType?: string;
  moneyAmount?: number;
  recipes?: { recipeId: number; recipeName: string; recipeImageUrl?: string }[];
}

interface RewardListProps {
  rewards: Reward[];
  onRewardSuccess: () => void;
}

const RewardList: React.FC<RewardListProps> = ({ rewards, onRewardSuccess }) => {
  if (!rewards || rewards.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-3">🎁</div>
          <p className="text-gray-400 text-lg">Không có phần thưởng nào</p>
          <p className="text-gray-500 text-sm">Vui lòng quay lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {rewards.map((reward) => (
        <RewardCard key={reward.id} data={reward} onRewardSuccess={onRewardSuccess} />
      ))}
    </div>
  );
};

export default RewardList;
