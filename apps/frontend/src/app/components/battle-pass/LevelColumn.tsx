import { BattlePassReward } from "./BattlePassProgress";
import { RewardSlot } from "./RewardSlot";

interface LevelColumnProps {
  level: number;
  regularRewards: BattlePassReward[];
  currentXP: number;
  claimedRewards: number[];
  isPremium: boolean;
  isSeasonEnded: boolean;
  onRewardClick: (reward: BattlePassReward) => void;
}

export function LevelColumn({
  level,
  regularRewards,
  currentXP,
  claimedRewards,
  isPremium,
  isSeasonEnded,
  onRewardClick,
}: LevelColumnProps) {
  const reward = regularRewards.find((r) => r.level === level);
  const isCurrentLevel = currentXP >= (reward?.experience || 0);

  return (
    <div className="flex flex-col items-center min-w-[100px]">
      {/* Single Reward */}
      <div className="w-20 h-20">
        <RewardSlot
          reward={reward}
          isPremiumSlot={reward?.type === "premium"}
          currentXP={currentXP}
          claimedRewards={claimedRewards}
          isPremium={isPremium}
          isSeasonEnded={isSeasonEnded}
          onRewardClick={onRewardClick}
        />
      </div>
    </div>
  );
}
