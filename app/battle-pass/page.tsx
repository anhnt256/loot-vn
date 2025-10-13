"use client";

import { useEffect, useState, useRef } from "react";
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
  rewardsSummary?: {
    totalPremiumRewards: number;
    totalValue: number;
    mainAccountTopup: number;
    otherRewardsValue: number;
  };
  premiumPackage?: {
    id: number;
    basePrice: number;
    maxQuantity: number | null;
    sold: number;
    remaining: number | null;
  };
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
  hasPendingOrder: boolean;
  pendingOrder?: {
    id: number;
    createdAt: string;
    price: number;
  };
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
  const [showRewardDetails, setShowRewardDetails] = useState(false);
  const [shouldCloseRewardModal, setShouldCloseRewardModal] = useState(false);
  const syncCalledRef = useRef(false);

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

  const {
    data: currentSeason,
    isLoading: isLoadingSeason,
    error: seasonError,
  } = useQuery<Season>({
    queryKey: ["currentSeason"],
    queryFn: async () => {
      const response = await fetch("/api/battle-pass/current-season");
      if (!response.ok) throw new Error("Failed to fetch current season");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false, // Không refetch khi focus window
    refetchOnMount: false, // Không refetch khi mount lại
  });

  const { data: userProgress, isLoading: isLoadingProgress } =
    useQuery<UserProgress>({
      queryKey: ["userProgress"],
      queryFn: async () => {
        const response = await fetch("/api/battle-pass/progress");
        if (!response.ok) throw new Error("Failed to fetch user progress");
        return response.json();
      },
      enabled: !!currentSeason, // Only fetch if currentSeason exists
      staleTime: 30 * 1000, // 30 giây
      refetchOnWindowFocus: false,
      refetchOnMount: false,
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
      if (!currentSeason) throw new Error("No current season");

      const packageId = currentSeason.premiumPackage?.id;
      if (!packageId) throw new Error("No premium package available");

      const response = await fetch("/api/battle-pass/create-premium-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: packageId,
          seasonId: currentSeason.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
      toast.success("Đã tạo đơn hàng! Đang chờ xét duyệt.");
      console.log("Order created:", data);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Không thể tạo đơn hàng";
      toast.error(errorMessage);
      console.error("Purchase error:", error);
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

  // Auto sync progress when page loads (only if currentSeason exists)
  // Sử dụng ref để đảm bảo chỉ gọi 1 lần (tránh React strict mode call 2 lần)
  useEffect(() => {
    if (
      currentSeason &&
      !isLoadingSeason &&
      !seasonError &&
      !syncCalledRef.current
    ) {
      syncCalledRef.current = true;
      syncProgressMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSeason?.id]); // Chỉ phụ thuộc vào seasonId để tránh call nhiều lần

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
    setShowPremiumModal(true);
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

  if (isLoadingSeason) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <div className="text-white text-xl font-semibold">
            Đang tải Battle Pass...
          </div>
        </div>
      </div>
    );
  }

  if (seasonError || !currentSeason) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-5xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Không có Battle Pass đang hoạt động
          </h2>
          <p className="text-gray-400 mb-6">
            Hiện tại chưa có mùa Battle Pass nào đang diễn ra. Vui lòng quay lại
            sau hoặc liên hệ quản trị viên để biết thêm chi tiết.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleHome}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            >
              🏠 Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <div className="text-white text-xl font-semibold">
            Đang tải tiến độ...
          </div>
        </div>
      </div>
    );
  }

  if (!userProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-5xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Không thể tải tiến độ
          </h2>
          <p className="text-gray-400 mb-6">
            Đã có lỗi xảy ra khi tải tiến độ Battle Pass của bạn. Vui lòng thử
            lại sau hoặc quay về trang chủ để sử dụng các tính năng khác.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🔄 Thử Lại
            </button>
            <button
              onClick={handleHome}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            >
              🏠 Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
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
        hasPendingOrder={userProgress?.hasPendingOrder}
        pendingOrder={userProgress?.pendingOrder}
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPremiumModal(false);
              setShowRewardDetails(false);
            }
          }}
        >
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 border-2 border-yellow-500/30 rounded-2xl max-w-2xl w-full p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700 transition-all"
              onClick={() => {
                setShowPremiumModal(false);
                setShowRewardDetails(false);
              }}
              aria-label="Đóng"
            >
              ×
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl flex items-center justify-center transform hover:rotate-6 transition-transform shadow-xl">
                <span className="text-5xl">👑</span>
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Premium Battle Pass
              </h2>
            </div>

            {/* Total Rewards Summary */}
            <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/50 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-6 mb-4">
                {/* Cột trái: Hoàn tiền tài khoản chính */}
                <div className="text-center border-r border-yellow-500/30">
                  <div className="text-yellow-300 text-xs font-semibold mb-2 uppercase tracking-wide">
                    Hoàn lại
                  </div>
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {(
                      currentSeason?.rewardsSummary?.mainAccountTopup || 0
                    ).toLocaleString()}
                    đ
                  </div>
                  <div className="text-gray-400 text-xs">
                    Vào tài khoản chính
                  </div>
                </div>

                {/* Cột phải: Giá trị còn lại */}
                <div className="text-center">
                  <div className="text-yellow-300 text-xs font-semibold mb-2 uppercase tracking-wide">
                    Giá trị phần thưởng khác
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {(
                      currentSeason?.rewardsSummary?.otherRewardsValue || 0
                    ).toLocaleString()}
                    đ
                  </div>
                  <div className="text-gray-400 text-xs">
                    Stars, Items, Vouchers
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-yellow-500/30">
                <div className="text-gray-300 text-sm mb-3">
                  {currentSeason?.rewardsSummary?.totalPremiumRewards || 0} phần
                  thưởng Premium độc quyền
                </div>
                <button
                  onClick={() => setShowRewardDetails(!showRewardDetails)}
                  className="text-yellow-400 hover:text-yellow-300 font-semibold text-sm flex items-center gap-2 mx-auto transition-colors"
                >
                  <span>{showRewardDetails ? "▼" : "▶"}</span>
                  {showRewardDetails
                    ? "Ẩn chi tiết"
                    : "Xem chi tiết phần thưởng"}
                </button>
              </div>
            </div>

            {/* Reward Details Table */}
            {showRewardDetails && (
              <div className="bg-gray-800/50 rounded-xl overflow-hidden mb-6">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-900 z-10">
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left py-3 px-3 bg-gray-900">Cấp</th>
                        <th className="text-left py-3 px-3 bg-gray-900">
                          Phần thưởng
                        </th>
                        <th className="text-right py-3 px-3 bg-gray-900">
                          Giá trị
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSeason?.rewards
                        ?.filter((r) => r.type === "premium")
                        .map((reward) => {
                          const isMainAccountTopup =
                            reward.rewardType === "MAIN_ACCOUNT_TOPUP";
                          return (
                            <tr
                              key={reward.id}
                              className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                            >
                              <td className="py-3 px-3 text-yellow-400 font-semibold">
                                Lv.{reward.level}
                              </td>
                              <td
                                className={`py-3 px-3 ${isMainAccountTopup ? "text-orange-400 font-semibold" : "text-white"}`}
                              >
                                {reward.name}
                              </td>
                              <td
                                className={`py-3 px-3 text-right font-semibold ${isMainAccountTopup ? "text-orange-400" : "text-green-400"}`}
                              >
                                {(reward.rewardValue || 0).toLocaleString()}đ
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-900/20 to-transparent border border-yellow-500/20 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-2xl">🎁</span>
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    Phần Thưởng Premium
                  </div>
                  <div className="text-gray-400 text-sm">
                    Nhận tất cả phần thưởng Premium ở mỗi cấp độ
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-900/20 to-transparent border border-purple-500/20 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    Bonus Rewards
                  </div>
                  <div className="text-gray-400 text-sm">
                    Mở khóa phần thưởng Bonus đặc biệt
                  </div>
                </div>
              </div>
            </div>

            {/* Price Info */}
            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm mb-1">
                    Giá Premium Pass
                  </div>
                  <div className="text-white font-bold text-2xl">
                    {currentSeason?.premiumPackage?.basePrice
                      ? `${currentSeason.premiumPackage.basePrice.toLocaleString()}đ`
                      : "249.000đ"}
                    <span className="text-gray-400 text-sm font-normal ml-2">
                      /mùa
                    </span>
                  </div>
                </div>
                {currentSeason?.premiumPackage?.maxQuantity && (
                  <div className="text-right">
                    <div className="text-gray-400 text-sm mb-1">Còn lại</div>
                    <div className="text-yellow-400 font-bold text-xl">
                      {currentSeason.premiumPackage.remaining}/
                      {currentSeason.premiumPackage.maxQuantity}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowPremiumModal(false);
                  setShowRewardDetails(false);
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Để sau
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="flex-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:via-orange-600 hover:to-pink-600 text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-2xl"
              >
                Mua Ngay -{" "}
                {currentSeason?.premiumPackage?.basePrice
                  ? `${currentSeason.premiumPackage.basePrice.toLocaleString()}đ`
                  : "249.000đ"}
              </button>
            </div>

            <p className="text-gray-500 text-xs text-center mt-4">
              * Phần thưởng sẽ được áp dụng ngay sau khi mua thành công
            </p>
          </div>
        </div>
      )}
    </>
  );
}
