'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { BattlePassProgress } from '@/components/battle-pass/BattlePassProgress';
import { RewardCard } from '@/components/battle-pass/RewardCard';
import { toast } from 'sonner';

interface Season {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  rewards: Reward[];
}

interface Reward {
  id: number;
  name: string;
  description: string;
  requirements: {
    type: 'PLAY_TIME' | 'FOOD_SPENDING' | 'DRINK_SPENDING';
    amount: number;
  };
  rewards: {
    type: string;
    amount: number;
  };
  isVipOnly?: boolean;
}

interface UserProgress {
  id: number;
  userId: string;
  seasonId: number;
  totalPlayTime: number;
  totalFoodSpending: number;
  totalDrinkSpending: number;
  claimedRewards: number[];
  isVip: boolean;
}

export default function BattlePassPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

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
    enabled: !!session?.user,
  });

  const updatePlayTimeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/battle-pass/update-progress', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to update playtime');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
    onError: (error) => {
      toast.error('Failed to update playtime');
      console.error('Failed to update playtime:', error);
    },
  });

  const updateSpendingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/battle-pass/update-spending', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to update spending');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
    onError: (error) => {
      toast.error('Failed to update spending');
      console.error('Failed to update spending:', error);
    },
  });

  const checkVipStatusMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/battle-pass/check-vip-status', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to check VIP status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
    onError: (error) => {
      toast.error('Failed to check VIP status');
      console.error('Failed to check VIP status:', error);
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

  useEffect(() => {
    if (session?.user) {
      updatePlayTimeMutation.mutate();
      updateSpendingMutation.mutate();
      checkVipStatusMutation.mutate();
    }
  }, [session?.user]);

  if (isLoadingSeason || isLoadingProgress) {
    return <div>Loading...</div>;
  }

  if (!currentSeason) {
    return <div>No active season found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{currentSeason.name}</h1>
        <p className="text-muted-foreground">
          Season ends on {new Date(currentSeason.endDate).toLocaleDateString()}
        </p>
      </div>

      {userProgress && (
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <BattlePassProgress
                playTime={userProgress.totalPlayTime}
                foodSpending={userProgress.totalFoodSpending}
                drinkSpending={userProgress.totalDrinkSpending}
              />
            </CardContent>
          </Card>

          {userProgress.isVip && (
            <Card className="bg-yellow-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  VIP Status Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You have access to exclusive VIP rewards!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentSeason.rewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            isClaimed={userProgress?.claimedRewards.includes(reward.id) ?? false}
            isVip={userProgress?.isVip ?? false}
            onClaim={claimRewardMutation.mutate}
          />
        ))}
      </div>
    </div>
  );
} 