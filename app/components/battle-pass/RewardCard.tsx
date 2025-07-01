import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Coffee, Utensils, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface Reward {
  id: number;
  level: number;
  name: string;
  description: string | null;
  type: string; // "free" or "premium"
  rewardType: string; // "stars", "item", "voucher", etc.
  rewardValue: number | null;
  imageUrl: string | null;
}

interface RewardCardProps {
  reward: Reward;
  isClaimed: boolean;
  isVip: boolean;
  onClaim: (rewardId: number) => Promise<void>;
}

export function RewardCard({
  reward,
  isClaimed,
  isVip,
  onClaim,
}: RewardCardProps) {
  const [isClaiming, setIsClaiming] = useState(false);

  const getRewardTypeIcon = () => {
    switch (reward.rewardType) {
      case "stars":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "item":
        return <Utensils className="h-4 w-4 text-green-500" />;
      case "voucher":
        return <Coffee className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatRewardValue = () => {
    if (!reward.rewardValue) return "";
    return reward.rewardType === "stars"
      ? `${reward.rewardValue} stars`
      : reward.rewardValue.toString();
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
    <Card className={isClaimed ? "opacity-50" : ""}>
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
          <p className="text-sm font-medium">Reward:</p>
          <div className="flex items-center gap-2 text-sm">
            {getRewardTypeIcon()}
            <span>
              {reward.rewardType === "stars" && "Stars: "}
              {reward.rewardType === "item" && "Item: "}
              {reward.rewardType === "voucher" && "Voucher: "}
              {formatRewardValue()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`px-2 py-1 rounded text-xs ${
                reward.type === "premium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {reward.type === "premium" ? "Premium" : "Free"}
            </span>
          </div>
        </div>
        {!isClaimed && (
          <Button
            className="w-full mt-4"
            disabled={(reward.type === "premium" && !isVip) || isClaiming}
            onClick={handleClaim}
          >
            {isClaiming
              ? "Claiming..."
              : reward.type === "premium" && !isVip
                ? "Premium Required"
                : "Claim Reward"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
