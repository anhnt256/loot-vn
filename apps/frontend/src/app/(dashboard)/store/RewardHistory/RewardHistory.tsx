import React, { useEffect, useState } from "react";
import { Button } from "@gateway-workspace/shared/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@gateway-workspace/shared/ui";
import { fetcher } from "@gateway-workspace/shared/utils";
import { dayjs } from "@gateway-workspace/shared/utils";
import { usePolling } from "@gateway-workspace/shared/hooks";

interface RewardHistoryItem {
  id: number;
  createdAt: string;
  updatedAt: string;
  status: "INITIAL" | "APPROVE" | "REJECT";
  note?: string;
  type: "STARS" | "EVENT";
  // Reward fields (from API - STARS type)
  reward_id?: number;
  reward_name?: string;
  reward_value?: number;
  reward_stars?: number;
  // PromotionCode fields (from API - STARS type)
  promotionCode_id?: number;
  promotionCode_code?: string;
  promotionCode_name?: string;
  promotionCode_value?: number;
  // Event Reward fields (from API - EVENT type)
  eventReward_id?: number;
  eventReward_name?: string;
  eventReward_config?: string;
  eventPromotionCode_code?: string;
  eventPromotionCode_name?: string;
  eventPromotionCode_type?: string;
}

interface RewardHistoryResponse {
  rewards: RewardHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface RewardHistoryProps {
  userId: number;
}

const RewardHistory: React.FC<RewardHistoryProps> = ({ userId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isManualRefetching, setIsManualRefetching] = useState(false);

  // Sử dụng usePolling để tự động cập nhật mỗi 60s
  const {
    data: historyData,
    isLoading,
    error,
    lastUpdated,
    refetch,
  } = usePolling<RewardHistoryResponse>(
    `/api/reward-exchange/user-history?userId=${userId}&page=${currentPage}&limit=5`,
    {
      interval: 60000, // 60 seconds
      enabled: !!userId,
      onSuccess: (data) => {
        console.log("History updated:", data);
      },
      onError: (error) => {
        console.error("Error updating history:", error);
      },
    },
  );

  // Reset về trang 1 khi userId thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [userId]);

  // Tính toán thời gian còn lại đến lần cập nhật tiếp theo
  const getTimeUntilNextUpdate = () => {
    if (!lastUpdated) return 60;
    const now = new Date();
    const timeDiff = now.getTime() - lastUpdated.getTime();
    const secondsElapsed = Math.floor(timeDiff / 1000);
    return Math.max(0, 60 - secondsElapsed);
  };

  const [timeUntilUpdate, setTimeUntilUpdate] = useState(
    getTimeUntilNextUpdate(),
  );

  // Cập nhật countdown mỗi giây
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilUpdate(getTimeUntilNextUpdate());
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "INITIAL":
        return (
          <div className="flex items-center space-x-1">
            <span className="px-2 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200">
              Chờ xử lý
            </span>
          </div>
        );
      case "APPROVE":
        return (
          <div className="flex items-center space-x-1">
            <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200">
              Hoàn thành
            </span>
          </div>
        );
      case "REJECT":
        return (
          <div className="flex items-center space-x-1">
            <span className="px-2 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-full border border-red-200">
              Từ chối
            </span>
          </div>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-50 text-gray-700 rounded-full border border-gray-200">
            {status}
          </span>
        );
    }
  };

  // Tính toán màu sắc icon dựa trên giá trị stars (số sao cần để đổi)
  const getRewardIconStyle = (value: number) => {
    if (value <= 13000) {
      return "bg-[#9b59b6]";
    } else if (value <= 23000) {
      return "bg-[#e67e22]";
    } else if (value <= 50000) {
      return "bg-[#2980b9]";
    } else if (value <= 95000) {
      return "bg-[#c0392b]";
    } else if (value <= 190000) {
      return "bg-[#27ae60]";
    } else {
      // 480k - nổi bật nhất
      return "bg-gradient-to-r from-purple-600 via-pink-600 to-red-600";
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs.utc(dateString).format("DD/MM/YYYY HH:mm");
  };

  // Helper để lấy thông tin reward dựa trên type
  const getRewardInfo = (item: RewardHistoryItem) => {
    if (item.type === "EVENT") {
      return {
        name:
          item.eventPromotionCode_name ||
          item.eventReward_name ||
          "Phần thưởng Event",
        icon: getEventRewardIcon(item.eventPromotionCode_type),
        badgeText: "🎉 Event",
        badgeColor: "bg-gradient-to-r from-purple-500 to-pink-500",
        value: null, // Event không hiển thị stars
      };
    } else {
      return {
        name: item.reward_name || item.promotionCode_name || "Không xác định",
        icon: "⭐",
        badgeText:
          item.reward_stars?.toLocaleString() ||
          item.promotionCode_value?.toLocaleString(),
        badgeColor: getRewardIconStyle(item.reward_stars || 0),
        value: item.reward_stars || item.promotionCode_value,
      };
    }
  };

  // Helper để lấy icon cho event reward type
  const getEventRewardIcon = (rewardType?: string) => {
    switch (rewardType) {
      case "FREE_HOURS":
        return "⏰";
      case "FREE_DRINK":
        return "🥤";
      case "FREE_SNACK":
        return "🍿";
      case "FREE_FOOD":
        return "🍕";
      default:
        return "🎁";
    }
  };

  // Hàm cập nhật thủ công
  const handleManualRefresh = () => {
    setIsManualRefetching(true);
    // Reload toàn bộ page để cập nhật lại tất cả dữ liệu
    window.location.reload();
  };

  if (!historyData) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            Lịch sử đổi thưởng
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2 animate-bounce">📋</div>
            <p className="text-gray-500">Đang tải lịch sử...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Lịch sử đổi thưởng
            </h3>
            {historyData.rewards.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                Tổng cộng: {historyData.pagination.total} giao dịch
              </p>
            )}
          </div>
          <Button
            onClick={handleManualRefresh}
            disabled={isManualRefetching}
            size="sm"
            variant="outline"
            className="text-xs px-3 py-1.5 hover:bg-blue-50 hover:border-blue-200"
          >
            {isManualRefetching ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Cập nhật...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span>🔄</span>
                <span>Cập nhật</span>
              </div>
            )}
          </Button>
        </div>

        {/* Thông tin cập nhật tự động */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {lastUpdated ? (
              <>Cập nhật lần cuối: {dayjs(lastUpdated).format("HH:mm:ss")}</>
            ) : (
              "Chưa có dữ liệu"
            )}
          </span>
          <span>Cập nhật sau: {timeUntilUpdate}s</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {historyData.rewards.length > 0 ? (
          <div className="space-y-3">
            {historyData.rewards.map((item, index) => {
              const rewardInfo = getRewardInfo(item);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-lg transition-all duration-200 hover:border-gray-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <div
                          className={`w-8 h-8 ${rewardInfo.badgeColor} rounded-lg flex items-center justify-center`}
                        >
                          <span className="text-white text-sm">
                            {rewardInfo.icon}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {rewardInfo.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {item.type === "EVENT" ? (
                              <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full font-medium">
                                {rewardInfo.badgeText}
                              </span>
                            ) : (
                              <p className="text-xs text-gray-600 font-medium">
                                {rewardInfo.badgeText}{" "}
                                <span className="text-yellow-500">⭐</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      <span className="font-medium">Yêu cầu:</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>

                    {item.status !== "INITIAL" && (
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                        <span className="font-medium">Xử lý:</span>
                        <span>{formatDate(item.updatedAt)}</span>
                      </div>
                    )}
                  </div>

                  {item.note && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-500 text-sm">💬</span>
                        <div className="text-xs text-gray-700">
                          <span className="font-medium">Ghi chú:</span>{" "}
                          {item.note}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            {historyData.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-3 mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1 || isLoading}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="text-xs px-3 py-1.5 hover:bg-gray-50"
                >
                  ← Trước
                </Button>

                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-600 font-medium">
                    Trang {currentPage}
                  </span>
                  <span className="text-xs text-gray-400">/</span>
                  <span className="text-xs text-gray-600">
                    {historyData.pagination.totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    currentPage === historyData.pagination.totalPages ||
                    isLoading
                  }
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="text-xs px-3 py-1.5 hover:bg-gray-50"
                >
                  Sau →
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 font-medium text-lg mb-2">
                Chưa có lịch sử đổi thưởng
              </p>
              <p className="text-gray-400 text-sm">
                Hãy đổi thưởng đầu tiên để xem lịch sử
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardHistory;
