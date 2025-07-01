import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Utensils, Coffee, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

interface RewardCardProps {
  reward: Reward;
  isClaimed: boolean;
  isVip: boolean;
  onClaim: (rewardId: number) => Promise<void>;
}

export function RewardCard({ reward, isClaimed, isVip, onClaim }: RewardCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getRequirementIcon = () => {
    switch (reward.requirements.type) {
      case 'PLAY_TIME':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'FOOD_SPENDING':
        return <Utensils className="h-5 w-5 text-green-500" />;
      case 'DRINK_SPENDING':
        return <Coffee className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const formatRequirement = () => {
    switch (reward.requirements.type) {
      case 'PLAY_TIME':
        return `${reward.requirements.amount} minutes`;
      case 'FOOD_SPENDING':
      case 'DRINK_SPENDING':
        return `$${reward.requirements.amount}`;
      default:
        return '';
    }
  };

  const handleClaim = async () => {
    try {
      setIsLoading(true);
      await onClaim(reward.id);
    } catch (error) {
      console.error('Failed to claim reward:', error);
      toast.error('Failed to claim reward');
    } finally {
      setIsLoading(false);
    }
  };

  const isLocked = reward.isVipOnly && !isVip;

  return (
    <Card className={`relative ${isLocked ? 'opacity-75' : ''}`}>
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <Lock className="h-8 w-8 text-white" />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {getRequirementIcon()}
          {reward.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {reward.description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Requirement:</span>
            <span className="font-medium">{formatRequirement()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Reward:</span>
            <span className="font-medium">
              {reward.rewards.amount} {reward.rewards.type}
            </span>
          </div>
          {reward.isVipOnly && (
            <div className="text-sm text-yellow-500">
              VIP Exclusive
            </div>
          )}
        </div>
        <Button
          className="w-full mt-4"
          variant={isClaimed ? "secondary" : "default"}
          disabled={isClaimed || isLocked || isLoading}
          onClick={handleClaim}
        >
          {isClaimed ? 'Claimed' : isLoading ? 'Claiming...' : 'Claim Reward'}
        </Button>
      </CardContent>
    </Card>
  );
} 