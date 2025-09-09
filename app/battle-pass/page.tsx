"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { BattlePassProgress } from "@/app/components/battle-pass/BattlePassProgress";
import { toast } from "sonner";
import { CURRENT_USER } from "@/constants/token.constant";

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
  type: "free" | "premium";
  rewardType: string;
  rewardValue?: number;
  imageUrl?: string;
  isBonus?: boolean;
  experience: number;
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
  const [userData, setUserData] = useState<any>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [shouldCloseRewardModal, setShouldCloseRewardModal] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userDataString = localStorage.getItem(CURRENT_USER);
      if (userDataString) {
        try {
          const parsedUserData = JSON.parse(userDataString);
          setUserData(parsedUserData);
        } catch (error) {
          // Error parsing user data
        }
      }
    }
  }, []);

  const { stars } = userData || {};

  const { data: currentSeason, isLoading: isLoadingSeason } = useQuery<Season>({
    queryKey: ["currentSeason"],
    queryFn: async () => {
      const response = await fetch("/api/battle-pass/current-season");
      if (!response.ok) throw new Error("Failed to fetch current season");
      return response.json();
    },
  });

  const { data: userProgress, isLoading: isLoadingProgress } =
    useQuery<UserProgress>({
      queryKey: ["userProgress"],
      queryFn: async () => {
        const response = await fetch("/api/battle-pass/progress");
        if (!response.ok) throw new Error("Failed to fetch user progress");
        return response.json();
      },
    });

  // Sync progress from database
  const syncProgressMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/battle-pass/sync-progress", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to sync progress");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
    onError: (error) => {
      // Failed to sync progress
    },
  });

  const purchasePremiumMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/battle-pass/purchase-vip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration: 30, // 30 days premium
        }),
      });
      if (!response.ok) throw new Error("Failed to purchase premium");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
      toast.success("Mua Premium Pass thành công!");
    },
    onError: (error) => {
      toast.error("Mua Premium Pass thất bại");
    },
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      const response = await fetch(
        `/api/battle-pass/claim-reward/${rewardId}`,
        {
          method: "POST",
        },
      );
      if (!response.ok) throw new Error("Failed to claim reward");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
      toast.success("Nhận thưởng thành công!");
      setShouldCloseRewardModal(true);
    },
    onError: (error) => {
      toast.error("Nhận thưởng thất bại");
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
      toast.error("🚫 Mùa đã kết thúc - Không thể nhận thưởng");
      return;
    }
    claimRewardMutation.mutate(rewardId);
  };

  const handleClaimAll = async (rewardIds: number[]) => {
    if (currentSeason && new Date() >= new Date(currentSeason.endDate)) {
      toast.error("🚫 Mùa đã kết thúc - Không thể nhận thưởng");
      return;
    }
    const availableRewards = userProgress?.availableRewards || [];
    const claimableRewardIds = availableRewards
      .filter((reward) => rewardIds.includes(reward.id))
      .map((reward) => reward.id);
    if (claimableRewardIds.length > 0) {
      for (const rewardId of claimableRewardIds) {
        await claimRewardMutation.mutateAsync(rewardId);
      }
      const totalValue = availableRewards
        .filter((reward) => claimableRewardIds.includes(reward.id))
        .reduce((sum, r) => sum + (r.rewardValue || 0), 0);
      toast.success(
        `🎉 Đã nhận ${claimableRewardIds.length} phần thưởng! Tổng: +${totalValue.toLocaleString()} điểm`,
      );
    }
  };

  const handlePurchasePremium = () => {
    if (currentSeason && new Date() >= new Date(currentSeason.endDate)) {
      toast.error("🚫 Mùa đã kết thúc - Không thể mua Premium");
      return;
    }
    // Hiển thị modal thông báo tính năng sẽ mở sau
    toast.info("🚧 Tính năng mua Premium Pass sẽ được mở trong thời gian tới!");
  };

  const handleConfirmPurchase = () => {
    purchasePremiumMutation.mutate();
    setShowPremiumModal(false);
  };

  const handleCloseModal = () => {
    setShouldCloseRewardModal(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push("/dashboard");
  };

  if (isLoadingSeason || isLoadingProgress) {
    return <div>Đang tải...</div>;
  }

  if (!currentSeason) {
    return <div>Không tìm thấy mùa hiện tại</div>;
  }

  if (!userProgress) {
    return <div>Tải tiến độ người dùng thất bại</div>;
  }

  // XP cho lên cấp (giả định 1000 XP mỗi cấp)
  const xpPerLevel = 1000;
  const currentXP = userProgress.experience % xpPerLevel;
  const maxXP = xpPerLevel;

  // Đặt lại tên cho bonus rewards nếu có
  const modifiedRewards = currentSeason.rewards.map((reward) => {
    if (reward.isBonus) {
      const bonusIndex = currentSeason.rewards
        .filter((r) => r.isBonus)
        .indexOf(reward);
      return {
        ...reward,
        name: `Siêu cấp ${bonusIndex + 1}`,
      };
    }
    return reward;
  });

  return (
    <>
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
        onCloseModal={handleCloseModal}
        shouldCloseModal={shouldCloseRewardModal}
      />

      {/* Premium Purchase Modal */}
      {showPremiumModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPremiumModal(false);
          }}
        >
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-600 rounded-lg max-w-lg w-full p-6">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white text-2xl hover:text-red-400 focus:outline-none"
              onClick={() => setShowPremiumModal(false)}
              aria-label="Đóng"
            >
              ×
            </button>

            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-3xl">🌟</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Nâng Cấp Premium Pass
              </h2>
              <p className="text-gray-400">
                Mở khóa tất cả phần thưởng Premium trong mùa này
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-sm">🎁</span>
                </div>
                <div>
                  <div className="text-white font-bold">
                    Phần Thưởng Premium
                  </div>
                  <div className="text-gray-400 text-sm">
                    Nhận tất cả phần thưởng Premium ở mỗi cấp độ
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-sm">⭐</span>
                </div>
                <div>
                  <div className="text-white font-bold">Bonus Rewards</div>
                  <div className="text-gray-400 text-sm">
                    Mở khóa phần thưởng Bonus đặc biệt
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-sm">⚡</span>
                </div>
                <div>
                  <div className="text-white font-bold">
                    Ưu Tiên Nhận Thưởng
                  </div>
                  <div className="text-gray-400 text-sm">
                    Nhận thưởng ngay lập tức khi đủ điều kiện
                  </div>
                </div>
              </div>
            </div>

            {/* Current Progress */}
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="text-center">
                <div className="text-blue-300 text-sm mb-2">
                  Tiến Độ Hiện Tại
                </div>
                <div className="text-white font-bold text-lg mb-2">
                  Cấp {userProgress?.level || 0}
                </div>
                <div className="text-gray-400 text-sm">
                  {userProgress?.claimedRewards?.length || 0} phần thưởng đã
                  nhận
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPremiumModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Mua Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
