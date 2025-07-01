import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Coffee, Utensils } from 'lucide-react';

interface ProgressItem {
  type: 'PLAY_TIME' | 'FOOD_SPENDING' | 'DRINK_SPENDING';
  current: number;
  target: number;
  icon: React.ReactNode;
  label: string;
  formatValue: (value: number) => string;
}

interface BattlePassProgressProps {
  playTime: number;
  foodSpending: number;
  drinkSpending: number;
  currentRewards: {
    playTime?: { amount: number };
    foodSpending?: { amount: number };
    drinkSpending?: { amount: number };
  };
}

export function BattlePassProgress({
  playTime,
  foodSpending,
  drinkSpending,
  currentRewards,
}: BattlePassProgressProps) {
  const progressItems: ProgressItem[] = [
    {
      type: 'PLAY_TIME',
      current: playTime,
      target: currentRewards.playTime?.amount || 0,
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      label: 'Play Time',
      formatValue: (value) => `${value} minutes`,
    },
    {
      type: 'FOOD_SPENDING',
      current: foodSpending,
      target: currentRewards.foodSpending?.amount || 0,
      icon: <Utensils className="h-5 w-5 text-green-500" />,
      label: 'Food Spending',
      formatValue: (value) => `$${value}`,
    },
    {
      type: 'DRINK_SPENDING',
      current: drinkSpending,
      target: currentRewards.drinkSpending?.amount || 0,
      icon: <Coffee className="h-5 w-5 text-orange-500" />,
      label: 'Drink Spending',
      formatValue: (value) => `$${value}`,
    },
  ];

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 100;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {progressItems.map((item) => (
        <Card key={item.type}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              {item.icon}
              <h3 className="font-semibold">{item.label}</h3>
            </div>
            <Progress
              value={calculateProgress(item.current, item.target)}
              className="h-2"
            />
            <div className="flex justify-between mt-2">
              <p className="text-sm text-muted-foreground">
                {item.formatValue(item.current)}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.formatValue(item.target)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 