import { BattlePassReward } from "./BattlePassProgress";

interface RewardSlotProps {
  reward?: BattlePassReward;
  isPremiumSlot?: boolean;
  currentXP: number;
  claimedRewards: number[];
  isPremium: boolean;
  isSeasonEnded: boolean;
  onRewardClick: (reward: BattlePassReward) => void;
}

export function RewardSlot({
  reward,
  isPremiumSlot = false,
  currentXP,
  claimedRewards,
  isPremium,
  isSeasonEnded,
  onRewardClick,
}: RewardSlotProps) {
  const isLocked = Boolean(isPremiumSlot && !isPremium);
  const isClaimed = Boolean(
    reward ? claimedRewards.includes(reward.id) : false,
  );
  const isLevelLocked = Boolean(reward && currentXP < reward.experience);
  const canClaim = Boolean(
    reward &&
      currentXP >= reward.experience &&
      !isClaimed &&
      (!isPremiumSlot || isPremium) &&
      !isSeasonEnded,
  );

  const getRewardIcon = (rewardType: string) => {
    switch (rewardType) {
      case "stars":
        return "⭐";
      case "coins":
        return "🪙";
      case "item":
        return "🎁";
      case "voucher":
        return "🎫";
      default:
        return "🎁";
    }
  };

  // Xác định border style dựa trên trạng thái
  const getBorderStyle = () => {
    if (isPremiumSlot) {
      // Premium rewards - luôn dùng border-solid (nét liền)
      if (isLocked) {
        return "bg-purple-900/30 border-orange-500 border-solid"; // Premium chưa mua
      } else if (isLevelLocked) {
        return "bg-purple-900/30 border-orange-500 border-solid"; // Premium chưa đủ level
      } else if (isClaimed) {
        return "bg-gradient-to-b from-yellow-400 to-orange-500 border-yellow-400 border-solid"; // Premium đã nhận
      } else if (canClaim) {
        return "bg-gradient-to-b from-yellow-400 to-orange-500 border-yellow-400 border-solid"; // Premium có thể nhận
      } else {
        return "bg-gradient-to-b from-yellow-400 to-orange-500 border-yellow-400 border-solid"; // Premium mặc định
      }
    } else {
      // Free rewards - luôn dùng border-dashed (nét đứt)
      if (isLevelLocked) {
        return "bg-blue-900/30 border-red-500 border-dashed"; // Free chưa đủ level
      } else if (isClaimed) {
        return "bg-gradient-to-b from-blue-400 to-cyan-500 border-blue-400 border-dashed"; // Free đã nhận
      } else if (canClaim) {
        return "bg-gradient-to-b from-blue-400 to-cyan-500 border-blue-400 border-dashed"; // Free có thể nhận
      } else {
        return "bg-gradient-to-b from-blue-400 to-cyan-500 border-blue-400 border-dashed"; // Free mặc định
      }
    }
  };

  return (
    <div
      className={`reward-slot relative w-full h-full rounded-lg border-2 ${getBorderStyle()} flex items-center justify-center cursor-pointer`}
      onClick={() => reward && onRewardClick(reward)}
    >
      {reward && (
        <div className="text-center">
          <div className="text-xl">{getRewardIcon(reward.rewardType)}</div>
          <div className="text-xs text-white font-bold">
            {reward.rewardValue?.toLocaleString()}
          </div>
          {Boolean(isLevelLocked) && (
            <div className="text-xs text-red-400 font-bold mt-1">
              Lv.{reward.level}
            </div>
          )}
        </div>
      )}
      {!reward && (
        <div className="w-full h-full bg-gray-600/50 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-xs">Trống</span>
        </div>
      )}
      {Boolean(isClaimed) && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
      {Boolean(canClaim && !isClaimed && !isSeasonEnded) && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      )}
      {Boolean(isSeasonEnded) && (
        <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-xs font-bold">Mùa Đã</div>
            <div className="text-red-400 text-xs font-bold">Kết Thúc</div>
          </div>
        </div>
      )}
    </div>
  );
}
