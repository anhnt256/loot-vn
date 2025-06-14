import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Coffee, Utensils, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface Reward {
  id: number;
  level: number;
  name: string;
  description: string;
  requirements: {
    type: 'PLAY_TIME' | 'FOOD_SPENDING' | 'DRINK_SPENDING';
    amount: number;
  };
  rewards: {
    normal: { type: string; amount: number }[];
    vip: { type: string; amount: number }[];
  };
}

interface RewardCardProps {
  reward: Reward;
  isClaimed: boolean;
  isVip: boolean;
  onClaim: (rewardId: number) => Promise<void>;
}

export function RewardCard({ reward, isClaimed, isVip, onClaim }: RewardCardProps) {
  const [isClaiming, setIsClaiming] = useState(false);

  const getRequirementIcon = () => {
    switch (reward.requirements.type) {
      case 'PLAY_TIME':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'FOOD_SPENDING':
        return <Utensils className="h-4 w-4 text-green-500" />;
      case 'DRINK_SPENDING':
        return <Coffee className="h-4 w-4 text-orange-500" />;
    }
  };

  const formatRequirement = () => {
    const prefix = reward.requirements.type === 'PLAY_TIME' ? '' : '$';
    return `${prefix}${reward.requirements.amount}`;
  };

  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      await onClaim(reward.id);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Card className={isClaimed ? 'opacity-50' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Level {reward.level}</CardTitle>
          {isClaimed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        </div>
        <p className="text-sm text-muted-foreground">{reward.name}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{reward.description}</p>
        <div className="space-y-2">
          <p className="text-sm font-medium">Requirements:</p>
          <div className="flex items-center gap-2 text-sm">
            {getRequirementIcon()}
            <span>
              {reward.requirements.type === 'PLAY_TIME' && 'Play Time: '}
              {reward.requirements.type === 'FOOD_SPENDING' && 'Food Spending: '}
              {reward.requirements.type === 'DRINK_SPENDING' && 'Drink Spending: '}
              {formatRequirement()}
            </span>
          </div>
        </div>
        {!isClaimed && (
          <Button
            className="w-full mt-4"
            disabled={!isVip || isClaiming}
            onClick={handleClaim}
          >
            {isClaiming ? 'Claiming...' : 'Claim Reward'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 