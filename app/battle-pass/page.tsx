'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { BattlePassProgress } from '@/app/components/battle-pass/BattlePassProgress';
import { toast } from 'sonner';
import { useUserInfo } from '@/hooks/use-user-info';

interface Season {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxLevel: number;
  rewards: BattlePassReward[];
}

interface BattlePassReward {
  id: number;
  level: number;
  name: string;
  description?: string;
  type: 'free' | 'premium';
  rewardType: string;
  rewardValue?: number;
  imageUrl?: string;
  isBonus?: boolean;
}

interface UserProgress {
  seasonId: number;
  isPremium: boolean;
  level: number;
  experience: number;
  totalSpent: number;
  claimedRewards: number[];
  rewards: BattlePassReward[];
  availableRewards: BattlePassReward[];
  maxLevel: number;
}

export default function BattlePassPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { userData } = useUserInfo();
  const { stars } = userData || {};

  const { data: currentSeason, isLoading: isLoadingSeason } = useQuery<Season>({
    queryKey: ['currentSeason'],
    queryFn: async () => {
      const response = await fetch('/api/battle-pass/current-season');
      if (!response.ok) throw new Error('Failed to fetch current season');
      return response.json();
    },
  });

  const { data: userProgress, isLoading: isLoadingProgress } = useQuery<UserProgress>({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const response = await fetch('/api/battle-pass/progress');
      if (!response.ok) throw new Error('Failed to fetch user progress');
      return response.json();
    },
  });

  // Sync progress from database
  const syncProgressMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/battle-pass/sync-progress', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to sync progress');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
    onError: (error) => {
      console.error('Failed to sync progress:', error);
    },
  });

  const purchasePremiumMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/battle-pass/purchase-vip', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to purchase premium');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      toast.success('Premium pass purchased successfully!');
    },
    onError: (error) => {
      toast.error('Failed to purchase premium pass');
      console.error('Failed to purchase premium:', error);
    },
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      const response = await fetch(`/api/battle-pass/claim-reward/${rewardId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to claim reward');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      toast.success('Reward claimed successfully!');
    },
    onError: (error) => {
      toast.error('Failed to claim reward');
      console.error('Failed to claim reward:', error);
    },
  });

  // Auto sync progress when page loads
  useEffect(() => {
    if (currentSeason && !isLoadingSeason) {
      syncProgressMutation.mutate();
    }
  }, [currentSeason, isLoadingSeason]);

  const handleClaimReward = async (rewardId: number) => {
    if (currentSeason && new Date() >= new Date(currentSeason.endDate)) {
      toast.error('🚫 Mùa đã kết thúc - Không thể nhận thưởng');
      return;
    }
    claimRewardMutation.mutate(rewardId);
  };

  const handleClaimAll = async (rewardIds: number[]) => {
    if (currentSeason && new Date() >= new Date(currentSeason.endDate)) {
      toast.error('🚫 Mùa đã kết thúc - Không thể nhận thưởng');
      return;
    }
    const availableRewards = userProgress?.availableRewards || [];
    const claimableRewardIds = availableRewards
      .filter(reward => rewardIds.includes(reward.id))
      .map(reward => reward.id);
    if (claimableRewardIds.length > 0) {
      for (const rewardId of claimableRewardIds) {
        await claimRewardMutation.mutateAsync(rewardId);
      }
      const totalValue = availableRewards
        .filter(reward => claimableRewardIds.includes(reward.id))
        .reduce((sum, r) => sum + (r.rewardValue || 0), 0);
      toast.success(`🎉 Claimed ${claimableRewardIds.length} rewards! Total: +${totalValue.toLocaleString()} points`);
    }
  };

  const handlePurchasePremium = () => {
    if (currentSeason && new Date() >= new Date(currentSeason.endDate)) {
      toast.error('🚫 Mùa đã kết thúc - Không thể mua Premium');
      return;
    }
    purchasePremiumMutation.mutate();
  };

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push('/dashboard');
  };

  if (isLoadingSeason || isLoadingProgress) {
    return <div>Loading...</div>;
  }

  if (!currentSeason) {
    return <div>No active season found</div>;
  }

  if (!userProgress) {
    return <div>Failed to load user progress</div>;
  }

  // XP cho lên cấp (giả định 1000 XP mỗi cấp)
  const xpPerLevel = 1000;
  const currentXP = userProgress.experience % xpPerLevel;
  const maxXP = xpPerLevel;

  // Đặt lại tên cho bonus rewards nếu có
  const modifiedRewards = currentSeason.rewards.map((reward) => {
    if (reward.isBonus) {
      const bonusIndex = currentSeason.rewards.filter(r => r.isBonus).indexOf(reward);
      return {
        ...reward,
        name: `Siêu cấp ${bonusIndex + 1}`
      };
    }
    return reward;
  });

  return (
    <BattlePassProgress
      currentLevel={userProgress?.level || 0}
      currentXP={userProgress?.experience || 0}
      maxXP={currentSeason?.maxLevel || 0}
      rewards={userProgress?.rewards || []}
      availableRewards={userProgress?.availableRewards || []}
      claimedRewards={userProgress?.claimedRewards || []}
      isPremium={userProgress?.isPremium}
      seasonName={currentSeason?.name}
      seasonEndDate={currentSeason?.endDate}
      userStars={stars}
      onClaimReward={handleClaimReward}
      onClaimAll={handleClaimAll}
      onPurchasePremium={handlePurchasePremium}
      onBack={handleBack}
      onHome={handleHome}
    />
  );
} 