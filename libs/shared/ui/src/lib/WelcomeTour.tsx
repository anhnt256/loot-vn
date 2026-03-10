"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@gateway-workspace/shared/ui";
import { Card, CardContent } from "@gateway-workspace/shared/ui";
import { FlipCard } from "@gateway-workspace/shared/ui";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Gift,
  Trophy,
  Calendar,
  Gamepad2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { fetcher } from "@gateway-workspace/shared/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WelcomeReward {
  id: number;
  name: string;
  description: string;
  type: string;
  config: any;
  maxQuantity?: number;
  used: number;
  maxPerUser?: number;
  validFrom?: string;
  validTo?: string;
  priority: number;
  isActive: boolean;
  canClaim: boolean;
  alreadyClaimed: boolean;
  depositRequired: number;
  userDeposit: number;
  isWithin14Days: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
}

interface WelcomeEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  branch: string;
}

interface WelcomeRewardsResponse {
  success: boolean;
  event: WelcomeEvent | null;
  rewards: WelcomeReward[];
}

interface WelcomeTourProps {
  isOpen: boolean;
  onComplete: () => void;
  userName?: string;
  isNewUser?: boolean;
  isReturnedUser?: boolean;
  daysSinceLastLogin?: number;
}

// Function để tạo slide đầu tiên dựa vào loại user
const getWelcomeSlide = (
  isNewUser: boolean,
  isReturnedUser: boolean,
  daysSinceLastLogin?: number,
) => {
  if (isReturnedUser) {
    return {
      id: 1,
      title: "Chào mừng trở lại! 🎊",
      subtitle: `Chúng tôi rất nhớ bạn${daysSinceLastLogin ? `, đã ${daysSinceLastLogin} ngày bạn không ghé thăm` : ""}`,
      content:
        "Trong suốt thời gian vừa qua, chúng tôi không ngừng cải thiện và nâng cấp hệ thống vì tin rằng bạn sẽ quay trở lại. The Gateway giờ đây có nhiều tính năng thú vị hơn, phần thưởng hấp dẫn hơn và trải nghiệm tuyệt vời hơn dành riêng cho bạn!",
      icon: "💝",
      bgColor: "from-pink-600 to-rose-700",
      features: [
        "Hệ thống phần thưởng đã được nâng cấp",
        "Nhiều sự kiện đặc biệt mới",
        "Phần thưởng chào mừng trở lại",
      ],
    };
  } else if (isNewUser) {
    return {
      id: 1,
      title: "Chào mừng đến với The Gateway! 🎉",
      subtitle: "Hành trình phiêu lưu và săn thưởng bắt đầu từ đây!",
      content:
        "Xin chào và chào mừng bạn đã tham gia cộng đồng The Gateway! Đây là nơi bạn sẽ khám phá vô vàn trải nghiệm thú vị, tích lũy điểm thưởng và nhận được những phần quà giá trị. Hãy cùng chúng tôi bắt đầu cuộc hành trình tuyệt vời này nhé!",
      icon: "🎊",
      bgColor: "from-blue-600 to-indigo-700",
      features: [
        "Tích điểm mỗi ngày và nhận thưởng",
        "Tham gia các sự kiện đặc biệt",
        "Đổi điểm lấy quà hấp dẫn",
      ],
    };
  } else {
    return {
      id: 1,
      title: "Chào mừng đến với The Gateway! 🎉",
      subtitle: "Hệ thống quản lý và phần thưởng thông minh",
      content:
        "Chào mừng bạn đến với hệ thống Gateway - nơi bạn có thể tích điểm, nhận thưởng và tham gia các hoạt động thú vị!",
      icon: "🎊",
      bgColor: "from-blue-600 to-indigo-700",
      features: [
        "Tích điểm mỗi ngày",
        "Nhận phần thưởng hấp dẫn",
        "Tham gia các sự kiện đặc biệt",
      ],
    };
  }
};

const getOtherSlides = () => [
  {
    id: 2,
    title: "Điểm danh hàng ngày 📅",
    subtitle: "Tích điểm và nhận thưởng mỗi ngày",
    content:
      "Điểm danh mỗi ngày để tích lũy điểm sao và nhận các phần thưởng đặc biệt. Càng điểm danh nhiều, phần thưởng càng lớn!",
    icon: "⭐",
    bgColor: "from-amber-600 to-orange-700",
    features: ["Điểm danh hàng ngày", "Tích lũy điểm sao", "Nhận streak bonus"],
  },
  {
    id: 3,
    title: "Vòng quay may mắn 🎰",
    subtitle: "Quay và nhận phần thưởng ngẫu nhiên",
    content:
      "Sử dụng điểm sao để quay vòng quay may mắn và có cơ hội nhận được những phần thưởng giá trị cao!",
    icon: "🎯",
    bgColor: "from-emerald-600 to-teal-700",
    features: [
      "Quay bằng điểm sao",
      "Phần thưởng ngẫu nhiên",
      "Cơ hội nhận vật phẩm hiếm",
    ],
  },
  {
    id: 4,
    title: "Battle Pass 🏆",
    subtitle: "Hoàn thành nhiệm vụ và nhận thưởng",
    content:
      "Tham gia Battle Pass để hoàn thành các nhiệm vụ và nhận được những phần thưởng độc quyền không thể có ở nơi khác!",
    icon: "⚔️",
    bgColor: "from-indigo-700 to-blue-800",
    features: [
      "Nhiệm vụ hàng ngày",
      "Phần thưởng độc quyền",
      "Tiến độ theo cấp độ",
    ],
  },
];

// Function để tạo slide phần thưởng dựa vào loại user
const getRewardSlide = (isNewUser: boolean, isReturnedUser: boolean) => {
  if (isReturnedUser) {
    return {
      id: 5,
      title: "Phần thưởng chào mừng trở lại! 🎁",
      subtitle: "Quà tặng đặc biệt dành cho bạn",
      content:
        "Cảm ơn bạn đã quay trở lại! Đây là món quà nhỏ từ chúng tôi để chào đón sự trở lại của bạn. Hãy nhận ngay các phần thưởng đặc biệt này nhé!",
      icon: "💝",
      bgColor: "from-violet-600 to-purple-700",
      isRewardPage: true,
      rewards: [],
    };
  } else if (isNewUser) {
    return {
      id: 5,
      title: "Phần thưởng chào mừng! 🎁",
      subtitle: "Nhận ngay phần thưởng cho user mới",
      content:
        "Chúc mừng! Bạn đã hoàn thành tour hướng dẫn. Hãy nhận phần thưởng chào mừng đặc biệt dành cho user mới!",
      icon: "🎊",
      bgColor: "from-violet-600 to-purple-700",
      isRewardPage: true,
      rewards: [],
    };
  } else {
    return {
      id: 5,
      title: "Phần thưởng chào mừng! 🎁",
      subtitle: "Nhận ngay phần thưởng cho user mới",
      content:
        "Chúc mừng! Bạn đã hoàn thành tour hướng dẫn. Hãy nhận phần thưởng chào mừng đặc biệt!",
      icon: "🎊",
      bgColor: "from-violet-600 to-purple-700",
      isRewardPage: true,
      rewards: [],
    };
  }
};

export default function WelcomeTour({
  isOpen,
  onComplete,
  userName,
  isNewUser = false,
  isReturnedUser = false,
  daysSinceLastLogin,
}: WelcomeTourProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [welcomeRewards, setWelcomeRewards] = useState<WelcomeReward[]>([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [isClaimingRewards, setIsClaimingRewards] = useState(false);

  // Refs để prevent duplicate API calls
  const hasFetchedRewards = useRef(false);
  const isClaimingRef = useRef(false);

  // Tạo tourSlides động dựa vào loại user
  const tourSlides = React.useMemo(() => {
    const welcomeSlide = getWelcomeSlide(
      isNewUser,
      isReturnedUser,
      daysSinceLastLogin,
    );
    const otherSlides = getOtherSlides();
    const rewardSlide = getRewardSlide(isNewUser, isReturnedUser);
    return [welcomeSlide, ...otherSlides, rewardSlide];
  }, [isNewUser, isReturnedUser, daysSinceLastLogin]);

  // Function để format countdown
  const formatCountdown = (days: number, hours: number, minutes: number) => {
    if (days > 0) {
      return `${days} ngày ${hours % 24} giờ`;
    } else if (hours > 0) {
      return `${hours} giờ ${minutes % 60} phút`;
    } else if (minutes > 0) {
      return `${minutes} phút`;
    } else {
      return "Hết hạn";
    }
  };

  // Fetch welcome rewards từ API - chỉ gọi 1 lần khi component mount
  useEffect(() => {
    const fetchWelcomeRewards = async () => {
      // Prevent duplicate calls
      if (hasFetchedRewards.current || !isOpen) return;

      hasFetchedRewards.current = true;
      setIsLoadingRewards(true);

      try {
        const response = await fetch("/api/welcome-rewards", {
          credentials: "include",
        });

        const data = await response.json();

        console.log("Welcome rewards response:", {
          status: response.status,
          data,
        });

        // API có thể trả về success: true hoặc success: false
        // Trong cả 2 trường hợp đều có rewards array (có thể rỗng)
        if (data.rewards) {
          setWelcomeRewards(data.rewards);

          // Chỉ show error nếu có error message và không phải trường hợp identity validation
          // (identity validation sẽ được handle khi user click claim)
          if (!response.ok && data.error && !data.requiresIdentityUpdate) {
            toast.error(data.error);
          }
        } else if (data.error) {
          // Trường hợp lỗi thực sự (không có rewards array)
          toast.error(data.error);
          setWelcomeRewards([]);
        } else {
          // Không có rewards và không có error - empty state
          setWelcomeRewards([]);
        }
      } catch (error) {
        console.error("Error fetching welcome rewards:", error);
        toast.error("Lỗi khi tải phần thưởng");
        setWelcomeRewards([]);
      } finally {
        setIsLoadingRewards(false);
      }
    };

    fetchWelcomeRewards();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const nextSlide = () => {
    if (currentSlide < tourSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleClaimRewards = async () => {
    // Prevent double click
    if (isClaimingRef.current) {
      console.log("Already claiming rewards, ignoring duplicate call");
      return;
    }

    isClaimingRef.current = true;
    setIsClaimingRewards(true);

    try {
      const response = await fetch("/api/welcome-rewards/claim", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      console.log("Claim response:", { status: response.status, data });

      if (response.ok && data.success) {
        toast.success("Nhận phần thưởng thành công! 🎉");
        console.log("Claimed rewards:", data.claimedRewards);

        // Delay một chút để user thấy toast rồi mới redirect
        setTimeout(() => {
          handleComplete();
        }, 1500);
      } else {
        // Handle errors - hiển thị message chính xác từ API
        const errorMessage =
          data.error || data.message || "Không thể nhận phần thưởng";
        toast.error(errorMessage);
        console.error("Failed to claim rewards:", {
          status: response.status,
          error: data.error,
          requiresIdentityUpdate: data.requiresIdentityUpdate,
        });

        // Không redirect khi lỗi - để user đọc message và tự quyết định
        // User có thể click "Sử dụng app" hoặc "Bỏ qua tour" để rời khỏi
      }
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast.error("Đã có lỗi xảy ra khi nhận thưởng. Vui lòng thử lại sau.");
    } finally {
      setIsClaimingRewards(false);
      isClaimingRef.current = false;
    }
  };

  const handleSkipToReward = () => {
    setCurrentSlide(tourSlides.length - 1);
  };

  const handleSkipToDashboard = () => {
    router.push("/dashboard");
  };

  const currentSlideData = tourSlides[currentSlide];
  const isLastSlide = currentSlide === tourSlides.length - 1;

  if (!isOpen || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-black/90 backdrop-blur-sm">
      {/* Overlay để prevent clicks khi đang claim rewards */}
      {isClaimingRewards && (
        <div className="absolute inset-0 z-[60] bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-800 font-semibold">Đang xử lý...</p>
            <p className="text-gray-500 text-sm mt-2">Vui lòng đợi</p>
          </div>
        </div>
      )}
      {/* Game-style background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated stars */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div
          className="absolute top-20 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-32 left-1/4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-40 right-1/3 w-1 h-1 bg-green-400 rounded-full animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-60 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Floating particles */}
        <div
          className="absolute bottom-20 left-20 w-3 h-3 bg-blue-500/30 rounded-full animate-bounce"
          style={{ animationDelay: "0.3s" }}
        ></div>
        <div
          className="absolute bottom-32 right-32 w-2 h-2 bg-purple-500/30 rounded-full animate-bounce"
          style={{ animationDelay: "0.8s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/2 w-2.5 h-2.5 bg-yellow-500/30 rounded-full animate-bounce"
          style={{ animationDelay: "1.2s" }}
        ></div>

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-purple-900/10"></div>

        {/* Moving light streaks */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-purple-400/50 to-transparent animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Corner glow effects */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative w-full max-w-4xl mx-4 z-10">
        <Card className="overflow-hidden shadow-2xl border-0">
          <CardContent className="p-0">
            {/* Background với gradient */}
            <div
              className={`relative bg-gradient-to-br ${currentSlideData.bgColor} min-h-[600px] flex flex-col`}
            >
              {/* Decorative elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-between p-8 text-center text-white">
                {/* Main content area */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  {/* Progress indicator */}
                  <div className="flex space-x-2 mb-8">
                    {tourSlides.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? "bg-white scale-125"
                            : index < currentSlide
                              ? "bg-white/70"
                              : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Icon */}
                  {"isRewardPage" in currentSlideData &&
                  currentSlideData.isRewardPage ? (
                    <div className="flex items-center justify-center mb-6">
                      <div className="text-6xl animate-bounce">🎊</div>
                    </div>
                  ) : (
                    <div className="text-8xl mb-6 animate-bounce">
                      {currentSlideData.icon}
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="text-4xl font-bold mb-4 drop-shadow-lg text-center">
                    {currentSlide === 0 && userName
                      ? `Chào ${userName}!`
                      : currentSlideData.title}
                  </h1>

                  {/* Subtitle */}
                  <h2 className="text-xl mb-6 opacity-90">
                    {currentSlideData.subtitle}
                  </h2>

                  {/* Content */}
                  <p className="text-lg mb-8 max-w-2xl leading-relaxed">
                    {currentSlideData.content}
                  </p>

                  {/* Features or Rewards */}
                  {"features" in currentSlideData &&
                    currentSlideData.features && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl">
                        {currentSlideData.features.map(
                          (feature: string, index: number) => (
                            <div
                              key={index}
                              className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30"
                            >
                              <div className="text-sm font-medium">
                                {feature}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                  {/* Rewards section */}
                  {"isRewardPage" in currentSlideData &&
                    currentSlideData.isRewardPage && (
                      <div className="mb-8 max-w-4xl w-full">
                        {isLoadingRewards ? (
                          <div className="flex justify-center items-center h-32">
                            <div className="text-white/70">
                              Đang tải phần thưởng...
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {welcomeRewards.map((reward, index) => {
                              // Map reward config thành display format
                              let icon = "🎁";
                              let displayName = reward.name;
                              let depositAmount = "50,000đ";

                              if (reward.config) {
                                if (reward.config.type === "GAME_TIME") {
                                  icon = "🎮";
                                  displayName = `${reward.config.value || 5}h FREE`;
                                } else if (reward.config.type === "DRINK") {
                                  icon = "🥤";
                                  displayName = `${reward.config.value || 1} nước pha chế`;
                                } else if (
                                  reward.config.type === "SPECIAL_GIFT"
                                ) {
                                  icon = "🎁";
                                  displayName = "Quà đặc biệt";
                                }

                                // Lấy minOrderAmount từ config (hoặc depositAmount cũ)
                                const minOrder =
                                  reward.config.minOrderAmount ||
                                  reward.config.depositAmount ||
                                  0;
                                if (minOrder > 0) {
                                  depositAmount = `${minOrder.toLocaleString()}đ`;
                                } else {
                                  depositAmount = "0đ";
                                }
                              }

                              return (
                                <FlipCard
                                  key={reward.id}
                                  disabled={reward.alreadyClaimed}
                                  frontContent={
                                    <div
                                      className={`${index === 0 ? "bg-gradient-to-br from-blue-500 to-blue-700" : index === 1 ? "bg-gradient-to-br from-emerald-500 to-emerald-700" : "bg-gradient-to-br from-orange-500 to-orange-700"} rounded-xl h-full flex flex-col items-center justify-center text-white p-4 shadow-lg overflow-hidden relative group ${reward.canClaim ? "ring-2 ring-green-400 ring-opacity-75" : ""} ${reward.alreadyClaimed ? "opacity-70" : ""}`}
                                    >
                                      <div className="text-4xl mb-4">
                                        {icon}
                                      </div>
                                      <div className="text-2xl font-bold text-center">
                                        {displayName}
                                      </div>

                                      {/* Checkmark icon cho reward đã claim */}
                                      {reward.alreadyClaimed && (
                                        <div className="absolute top-3 right-3 bg-green-500 rounded-full p-2 shadow-lg">
                                          <svg
                                            className="w-6 h-6 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="3"
                                              d="M5 13l4 4L19 7"
                                            ></path>
                                          </svg>
                                        </div>
                                      )}

                                      {/* Subtle visual indicator for claimable rewards (chưa claim) */}
                                      {reward.canClaim &&
                                        !reward.alreadyClaimed && (
                                          <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                        )}

                                      {/* Hover icon */}
                                      {!reward.alreadyClaimed && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                          <div className="bg-white/20 rounded-full p-2">
                                            <ChevronRight className="w-4 h-4 text-white" />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  }
                                  backContent={
                                    <div
                                      className={`bg-gradient-to-b ${reward.canClaim ? "from-green-500 to-green-600" : "from-orange-500 to-orange-600"} rounded-xl h-full flex flex-col items-center justify-center text-white p-4 shadow-lg overflow-hidden`}
                                    >
                                      <div className="text-3xl mb-3">
                                        {reward.canClaim ? "🎁" : "💰"}
                                      </div>

                                      {reward.canClaim ? (
                                        <>
                                          <div className="text-xl font-bold mb-3 text-center">
                                            {displayName}
                                          </div>
                                          <div className="text-sm text-center opacity-90 px-2">
                                            Bạn đã đủ điều kiện để nhận phần
                                            thưởng này
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="text-base font-semibold mb-2">
                                            Yêu cầu nạp tiền
                                          </div>
                                          <div className="text-xl font-bold mb-2">
                                            {depositAmount}
                                          </div>
                                          <div className="text-xs text-center opacity-90 px-2 mb-2">
                                            Đã nạp:{" "}
                                            {reward.userDeposit.toLocaleString()}
                                            đ
                                          </div>
                                          {!reward.isWithin14Days && (
                                            <div className="text-xs text-center text-red-300 px-2 mt-1">
                                              ⚠️{" "}
                                              {formatCountdown(
                                                reward.daysRemaining,
                                                reward.hoursRemaining,
                                                reward.minutesRemaining,
                                              )}
                                            </div>
                                          )}
                                        </>
                                      )}

                                      <div className="text-xs mt-3 opacity-70">
                                        Tap để quay lại
                                      </div>
                                    </div>
                                  }
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* Fixed button area */}
                <div className="w-full">
                  {/* Action buttons */}
                  <div className="flex space-x-4 justify-center">
                    {currentSlide > 0 && (
                      <Button
                        onClick={prevSlide}
                        variant="outline"
                        size="lg"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm h-12 px-6 min-w-[120px]"
                      >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Quay lại
                      </Button>
                    )}

                    {isLastSlide && (
                      <Button
                        onClick={handleSkipToDashboard}
                        variant="outline"
                        size="lg"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm h-12 px-6 min-w-[120px]"
                      >
                        Sử dụng app
                      </Button>
                    )}

                    <Button
                      onClick={isLastSlide ? handleClaimRewards : nextSlide}
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-white/90 font-semibold px-8 py-3 shadow-lg h-12 min-w-[140px]"
                      disabled={isClaimingRewards}
                    >
                      {isLastSlide ? (
                        <>
                          <Gift className="w-5 h-5 mr-2" />
                          {isClaimingRewards ? "Đang xử lý..." : "Nhận thưởng"}
                        </>
                      ) : (
                        <>
                          Tiếp tục
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Skip button */}
                  {!isLastSlide && (
                    <button
                      onClick={handleSkipToReward}
                      className="mt-4 text-white/70 hover:text-white transition-colors text-sm underline"
                    >
                      Bỏ qua tour
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
