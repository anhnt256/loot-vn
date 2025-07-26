import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Lock, Star, Gift, Award } from "lucide-react";
import { DailyMissions } from "@/app/components/missions/DailyMissions";

interface BattlePassReward {
  id: number;
  level: number;
  name: string;
  description?: string;
  type: "free" | "premium";
  rewardType: string;
  rewardValue?: number;
  imageUrl?: string;
  isBonus?: boolean;
  experience: number;
}

interface BattlePassProgressProps {
  currentLevel: number;
  currentXP: number;
  maxXP: number;
  rewards: BattlePassReward[];
  claimedRewards: number[];
  isPremium: boolean;
  seasonName?: string;
  seasonEndDate?: string;
  userStars?: number;
  availableRewards: BattlePassReward[];
  onClaimReward: (rewardId: number) => void;
  onClaimAll?: (rewardIds: number[]) => void;
  onPurchasePremium: () => void;
  onBack?: () => void;
  onHome?: () => void;
  onCloseModal?: () => void;
  shouldCloseModal?: boolean;
}

export function BattlePassProgress({
  currentLevel,
  currentXP,
  maxXP,
  rewards,
  claimedRewards,
  isPremium,
  seasonName,
  seasonEndDate,
  userStars,
  availableRewards,
  onClaimReward,
  onClaimAll,
  onPurchasePremium,
  onBack,
  onHome,
  onCloseModal,
  shouldCloseModal,
}: BattlePassProgressProps) {
  const [selectedReward, setSelectedReward] = useState<BattlePassReward | null>(
    null,
  );
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [seasonTimeLeft, setSeasonTimeLeft] = useState("");

  // Debug log props
  console.log("BattlePassProgress props:", {
    currentXP,
    rewards,
    claimedRewards,
    isPremium,
    currentLevel,
  });

  // Close modal when shouldCloseModal is true
  useEffect(() => {
    if (shouldCloseModal && selectedReward) {
      setSelectedReward(null);
      if (onCloseModal) {
        onCloseModal();
      }
    }
  }, [shouldCloseModal, selectedReward, onCloseModal]);

  // Update countdown timer every minute
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0); // Next midnight

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${hours}h ${minutes}m`);
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Update season countdown
  useEffect(() => {
    const updateSeasonTimer = () => {
      if (!seasonEndDate) {
        setSeasonTimeLeft("--");
        return;
      }

      const now = new Date();
      const endDate = new Date(seasonEndDate);

      if (endDate <= now) {
        setSeasonTimeLeft("Đã kết thúc");
        return;
      }

      const diff = endDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );

      setSeasonTimeLeft(`${days} ngày ${hours}h`);
    };

    updateSeasonTimer(); // Initial call
    const interval = setInterval(updateSeasonTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [seasonEndDate]);

  const regularRewards = rewards.filter((r) => !r.isBonus).slice(0, 30);
  const bonusRewards = rewards.filter((r) => r.isBonus).slice(0, 3);

  // Check if season has ended
  const isSeasonEnded = seasonEndDate
    ? new Date() >= new Date(seasonEndDate)
    : false;

  const handleClaimReward = (rewardId: number) => {
    onClaimReward(rewardId);
    // Modal will be closed by the parent component after successful mutation
  };

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

  const RewardSlot = ({
    reward,
    isPremiumSlot = false,
  }: {
    reward?: BattlePassReward;
    isPremiumSlot?: boolean;
  }) => {
    const isLocked = isPremiumSlot && !isPremium;
    const isClaimed = reward ? claimedRewards.includes(reward.id) : false;
    const isLevelLocked = reward && currentXP < reward.experience;
    const canClaim =
      reward &&
      currentXP >= reward.experience &&
      !isClaimed &&
      (!isPremiumSlot || isPremium) &&
      !isSeasonEnded;

    // Xác định border style dựa trên trạng thái
    const getBorderStyle = () => {
      if (isPremiumSlot) {
        // Premium rewards
        if (isLocked) {
          return "bg-purple-900/30 border-orange-500 border-dashed"; // Premium chưa mua
        } else if (isLevelLocked) {
          return "bg-purple-900/30 border-orange-500 border-dashed"; // Premium chưa đủ level
        } else if (isClaimed) {
          return "bg-gradient-to-b from-yellow-400 to-orange-500 border-yellow-400"; // Premium đã nhận
        } else if (canClaim) {
          return "bg-gradient-to-b from-yellow-400 to-orange-500 border-yellow-400"; // Premium có thể nhận - bỏ dash
        } else {
          return "bg-gradient-to-b from-yellow-400 to-orange-500 border-yellow-400"; // Premium mặc định
        }
      } else {
        // Free rewards
        if (isLevelLocked) {
          return "bg-blue-900/30 border-red-500 border-dashed"; // Free chưa đủ level
        } else if (isClaimed) {
          return "bg-gradient-to-b from-blue-400 to-cyan-500 border-blue-400"; // Free đã nhận
        } else if (canClaim) {
          return "bg-gradient-to-b from-blue-400 to-cyan-500 border-blue-400"; // Free có thể nhận - bỏ dash
        } else {
          return "bg-gradient-to-b from-blue-400 to-cyan-500 border-blue-400"; // Free mặc định
        }
      }
    };

    return (
      <div
        className={`reward-slot relative w-full h-full rounded-lg border-2 ${getBorderStyle()} flex items-center justify-center cursor-pointer`}
        onClick={() => reward && setSelectedReward(reward)}
      >
        {reward && (
          <div className="text-center">
            <div className="text-xl">{getRewardIcon(reward.rewardType)}</div>
            <div className="text-xs text-white font-bold">
              {reward.rewardValue?.toLocaleString()}
            </div>
            {isLevelLocked && (
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
        {isClaimed && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
        {canClaim && !isClaimed && !isSeasonEnded && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        )}
        {isSeasonEnded && (
          <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-400 text-xs font-bold">Mùa Đã</div>
              <div className="text-red-400 text-xs font-bold">Kết Thúc</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const LevelColumn = ({ level }: { level: number }) => {
    const reward = regularRewards.find((r) => r.level === level);
    const isCurrentLevel = currentLevel === level;
    const isUnlocked = reward ? currentXP >= reward.experience : false;

    return (
      <div className="flex flex-col items-center min-w-[100px]">
        {/* Single Reward */}
        <div className="w-20 h-20">
          <RewardSlot
            reward={reward}
            isPremiumSlot={reward?.type === "premium"}
          />
        </div>
      </div>
    );
  };

  // Tính currentLevel và nextXP dựa trên XP thực tế
  const sortedRewards = rewards
    .filter((r) => !r.isBonus)
    .sort((a, b) => a.level - b.level);
  let computedLevel = 0;
  let nextXP = 0;
  for (let i = 0; i < sortedRewards.length; i++) {
    if (currentXP >= sortedRewards[i].experience) {
      computedLevel = sortedRewards[i].level;
    } else {
      nextXP = sortedRewards[i].experience;
      break;
    }
  }
  if (!nextXP && sortedRewards.length > 0) nextXP = currentXP; // max level

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 p-4 overflow-hidden">
      <div className="battle-pass-container h-full flex gap-6 lg:flex-row flex-col">
        {/* Main Battle Pass Section */}
        <div className="battle-pass-main-mobile flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white"
                onClick={onBack}
              >
                ←
              </Button>
              <h1 className="text-2xl font-bold text-white">
                {seasonName || "Hành Trình Chiến Đấu"}
              </h1>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-2" title="Stars">
                <span>{userStars?.toLocaleString() || 0}</span>
                <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
                  <span className="text-xs">⭐</span>
                </div>
              </div>
            </div>
          </div>

          {/* Season Info & Current Level */}
          <div className="bg-black/20 border border-gray-700/30 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              {/* Left side - Season End Time */}
              <div className="flex items-center gap-3 text-white">
                <Clock className="w-5 h-5" />
                <div>
                  <div className="text-sm opacity-80">Mùa Kết Thúc Sau:</div>
                  <div className="font-bold text-lg">{seasonTimeLeft}</div>
                </div>
              </div>

              {/* Right side - Level Info & Progress */}
              <div className="flex items-center gap-8 text-white">
                {/* Claimable Rewards Counter */}
                {(() => {
                  const claimableCount = rewards.filter(
                    (r) =>
                      !r.isBonus &&
                      currentXP >= r.experience &&
                      !claimedRewards.includes(r.id) &&
                      (r.type === "free" || isPremium) &&
                      !isSeasonEnded,
                  ).length;

                  return (
                    claimableCount > 0 &&
                    !isSeasonEnded && (
                      <div className="text-center">
                        <div className="text-sm opacity-80">
                          Phần Thưởng Có Thể Nhận
                        </div>
                        <div className="text-3xl font-bold text-green-400">
                          {claimableCount}
                        </div>
                      </div>
                    )
                  );
                })()}

                <div className="text-center">
                  <div className="text-sm opacity-80 flex items-center justify-center gap-2 mb-1">
                    Cấp Độ Hiện Tại
                    {isPremium && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                        PREMIUM
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold">{computedLevel}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-sm opacity-80 mb-1">Tiến Độ XP</div>
                    <div className="text-sm font-bold">
                      {currentXP}/{nextXP} XP
                    </div>
                  </div>
                  <div className="w-48 h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${nextXP > 0 ? Math.min((currentXP / nextXP) * 100, 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Claim All Button */}
              {(() => {
                const claimableRewards = rewards.filter(
                  (r) =>
                    !r.isBonus &&
                    currentXP >= r.experience &&
                    !claimedRewards.includes(r.id) &&
                    (r.type === "free" || isPremium) &&
                    !isSeasonEnded,
                );

                return (
                  claimableRewards.length > 0 &&
                  !isSeasonEnded && (
                    <Button
                      onClick={() => {
                        const rewardIds = claimableRewards.map((r) => r.id);
                        if (onClaimAll) {
                          onClaimAll(rewardIds);
                        } else {
                          claimableRewards.forEach((reward) => {
                            onClaimReward(reward.id);
                          });
                        }
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3"
                    >
                      🎁 Nhận Tất Cả ({claimableRewards.length})
                    </Button>
                  )
                );
              })()}

              {!isPremium && !isSeasonEnded && (
                <Button
                  onClick={onPurchasePremium}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-6 py-3"
                >
                  🌟 Nâng Cấp Premium
                </Button>
              )}

              {isSeasonEnded && (
                <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-6 py-3 rounded-lg font-bold">
                  🚫 Mùa Đã Kết Thúc - Không Thể Nhận Thưởng
                </div>
              )}
            </div>
          </div>

          {/* Pass Type Labels */}
          <div className="bg-black/20 border border-gray-700/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-6 text-white font-bold">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-blue-400" />
                  <span>PHẦN THƯỞNG MIỄN PHÍ</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span>PHẦN THƯỞNG PREMIUM</span>
                  {!isPremium && <Lock className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
            </div>
          </div>

          {/* Main Battle Pass Track - Không scroll dọc */}
          <div className="flex-1 flex flex-col">
            <div className="battle-pass-scroll flex gap-4 overflow-x-auto py-4 px-4 h-36 rounded-lg bg-black/20 border border-gray-700/30">
              {Array.from({ length: 30 }, (_, i) => (
                <LevelColumn key={i + 1} level={i + 1} />
              ))}
            </div>

            {/* Bonus Rewards Section */}
            {bonusRewards.length > 0 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-800/50 to-pink-800/50 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 text-white mb-4">
                  <Award className="w-6 h-6 text-purple-400" />
                  <span className="font-bold text-lg">PHẦN THƯỞNG BONUS</span>
                  <span className="text-sm opacity-80">
                    (Hoàn thành tất cả 30 cấp)
                  </span>
                </div>
                <div className="flex gap-6 justify-center">
                  {bonusRewards.map((reward) => {
                    const isClaimed = claimedRewards.includes(reward.id);
                    const canClaim =
                      currentLevel >= reward.level &&
                      !isClaimed &&
                      (reward.type === "free" || isPremium) &&
                      !isSeasonEnded;
                    const isLocked = currentLevel < reward.level;

                    return (
                      <div key={reward.id} className="text-center">
                        <div className="w-24 h-24">
                          <RewardSlot
                            reward={reward}
                            isPremiumSlot={reward.type === "premium"}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reward Detail Modal */}
          {selectedReward && (
            <div
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setSelectedReward(null);
              }}
            >
              <Card className="bg-gradient-to-b from-gray-900 to-gray-800 border-gray-600 max-w-lg w-full relative">
                <div className="p-6">
                  {/* Close button (X) */}
                  <button
                    className="absolute top-4 right-4 text-white text-2xl hover:text-red-400 focus:outline-none"
                    onClick={() => setSelectedReward(null)}
                    aria-label="Đóng"
                  >
                    ×
                  </button>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
                          selectedReward.isBonus
                            ? "bg-purple-500 text-white border-purple-400"
                            : currentLevel >= selectedReward.level
                              ? "bg-green-500 text-white border-green-400"
                              : "bg-gray-600 text-white border-gray-500"
                        }`}
                      >
                        {selectedReward.isBonus ? "★" : selectedReward.level}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {selectedReward.isBonus
                            ? selectedReward.name
                            : `Cấp ${selectedReward.level}`}
                        </h3>
                        {!selectedReward.isBonus && (
                          <p className="text-sm text-gray-400">
                            Phần Thưởng Hành Trình
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <div
                      className={`w-20 h-20 mx-auto mb-4 rounded-lg border-2 flex items-center justify-center ${
                        selectedReward.type === "premium"
                          ? "bg-gradient-to-b from-yellow-400 to-orange-500 border-yellow-400"
                          : selectedReward.isBonus
                            ? "bg-gradient-to-b from-purple-500 to-pink-500 border-purple-400"
                            : "bg-gradient-to-b from-blue-400 to-cyan-500 border-blue-400"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl">
                          {getRewardIcon(selectedReward.rewardType)}
                        </div>
                        <div className="text-xs text-white font-bold">
                          {selectedReward.rewardValue?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">
                      {selectedReward.name}
                    </h4>
                    <p className="text-gray-400">
                      {selectedReward.description}
                    </p>
                  </div>

                  {/* Reward Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300">
                        Giá Trị Phần Thưởng:
                      </span>
                      <span className="text-yellow-400 font-bold">
                        +{selectedReward.rewardValue?.toLocaleString()}{" "}
                        {selectedReward.rewardType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300">Loại:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          selectedReward.type === "premium"
                            ? "bg-yellow-400 text-black"
                            : selectedReward.isBonus
                              ? "bg-purple-500 text-white"
                              : "bg-blue-400 text-white"
                        }`}
                      >
                        {selectedReward.isBonus
                          ? "Bonus"
                          : selectedReward.type === "premium"
                            ? "Premium"
                            : "Miễn Phí"}
                      </span>
                    </div>

                    {/* EXP Requirement */}
                    {!selectedReward.isBonus && (
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <span className="text-gray-300">EXP Yêu Cầu:</span>
                        <div className="text-right">
                          <div className="text-cyan-400 font-bold">
                            {selectedReward.experience} EXP
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Progress to unlock */}
                    {!selectedReward.isBonus &&
                      currentXP < selectedReward.experience && (
                        <div className="p-3 bg-orange-900/30 rounded-lg border border-orange-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-orange-300 text-sm">
                              Tiến độ mở khóa:
                            </span>
                            <span className="text-orange-400 font-bold">
                              {Math.round(
                                (currentXP / selectedReward.experience) * 100,
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min((currentXP / selectedReward.experience) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Cần thêm {selectedReward.experience - currentXP} EXP
                            nữa
                          </div>
                        </div>
                      )}

                    {/* Bonus reward requirement */}
                    {selectedReward.isBonus && (
                      <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                        <div className="text-center">
                          <div className="text-purple-300 text-sm mb-1">
                            Yêu Cầu Mở Khóa:
                          </div>
                          <div className="text-purple-400 font-bold">
                            Hoàn thành tất cả 30 cấp Hành Trình
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {currentLevel >= 30
                              ? "✅ Đã đáp ứng yêu cầu!"
                              : `Còn lại ${30 - currentLevel} cấp`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button Centered */}
                  <div className="flex justify-center mt-8">
                    {selectedReward.type === "premium" && !isPremium ? (
                      <Button
                        onClick={onPurchasePremium}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-3 text-lg"
                      >
                        Nâng Cấp Premium
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleClaimReward(selectedReward.id)}
                        disabled={
                          claimedRewards.includes(selectedReward.id) ||
                          currentXP < selectedReward.experience ||
                          isSeasonEnded
                        }
                        className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 text-lg"
                      >
                        {claimedRewards.includes(selectedReward.id)
                          ? "Đã nhận"
                          : isSeasonEnded
                            ? "Mùa đã kết thúc"
                            : currentXP < selectedReward.experience
                              ? "Chưa đủ EXP"
                              : "Nhận thưởng"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Daily Missions Panel */}
        <div className="w-[432px] min-w-[21.5rem] max-w-full h-full flex-shrink-0 sm:w-[352px] sm:min-w-0">
          <DailyMissions className="h-full" />
        </div>
      </div>
    </div>
  );
}
