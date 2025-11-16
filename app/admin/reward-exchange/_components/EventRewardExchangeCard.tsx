"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import dayjs from "@/lib/dayjs";

interface EventRewardExchange {
  id: number;
  promotionCodeId: number;
  duration: number;
  isUsed: boolean;
  status: "INITIAL" | "APPROVE" | "REJECT";
  branch: string;
  createdAt: string;
  updatedAt: string;
  note?: string;
  type: "EVENT";
  user: {
    userId: number | null;
    userName: string | null;
    stars: number;
    branch: string;
    fnetMoney: number;
    fnetMain?: number;
    fnetSub?: number;
    fnetMainAfter?: number;
    fnetSubAfter?: number;
  };
  reward: {
    id: number;
    name: string;
    type?: string;
    code?: string;
    value?: number; // rewardValue từ PromotionCode
  };
}

interface EventRewardExchangeCardProps {
  reward: EventRewardExchange;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  showActions?: boolean;
  isProcessing?: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "INITIAL":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
          Chờ duyệt
        </span>
      );
    case "APPROVE":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          Đã duyệt
        </span>
      );
    case "REJECT":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          Đã từ chối
        </span>
      );
    default:
      return null;
  }
};

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

export default function EventRewardExchangeCard({
  reward,
  onApprove,
  onReject,
  showActions = true,
  isProcessing = false,
}: EventRewardExchangeCardProps) {
  const rewardIcon = getEventRewardIcon(reward.reward?.type);

  return (
    <Card className="w-full mb-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
      <CardHeader className="pb-4">
        <div className="space-y-4">
          {/* User info section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-xl font-bold text-gray-900">
                  {reward.user?.userName || "Không xác định"}
                </CardTitle>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {reward.user?.branch || "Không xác định"}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full">
                  🎉 Event
                </span>
              </div>
              {/* Date and Status on the right */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {dayjs.utc(reward.createdAt).format("DD/MM/YYYY HH:mm")}
                </span>
                {getStatusBadge(reward.status)}
              </div>
            </div>

            {/* Event Reward Card & Fnet Money - 3 cột ngang */}
            <div
              className={`grid gap-4 ${
                (reward.reward?.type === "FREE_HOURS" ||
                  reward.reward?.name?.includes("nạp tài khoản chính") ||
                  reward.reward?.name?.includes("MAIN_ACCOUNT_TOPUP")) &&
                reward.status !== "REJECT"
                  ? "grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {/* Event Reward Card */}
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-center space-y-3">
                  {/* Nếu là nạp tài khoản chính thì hiển thị đơn giản */}
                  {reward.reward?.name?.includes("nạp tài khoản chính") ||
                  reward.reward?.name?.includes("MAIN_ACCOUNT_TOPUP") ? (
                    <>
                      <div className="text-xl font-bold mb-3">
                        Nạp tài khoản chính
                      </div>
                      <div className="text-3xl font-bold">
                        {(reward.reward?.value || 0).toLocaleString()}đ
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-5xl mb-2">{rewardIcon}</div>
                      <div className="text-xl font-bold">
                        {reward.reward?.name || "Phần thưởng Event"}
                      </div>
                      {reward.reward?.code && (
                        <div className="text-sm bg-white bg-opacity-20 rounded-lg py-2 px-4 inline-block">
                          <span className="font-mono">
                            {reward.reward.code}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Tài khoản Fnet - hiển thị cho FREE_HOURS hoặc nạp tài khoản chính */}
              {(reward.reward?.type === "FREE_HOURS" ||
                reward.reward?.name?.includes("nạp tài khoản chính") ||
                reward.reward?.name?.includes("MAIN_ACCOUNT_TOPUP")) &&
                reward.status !== "REJECT" && (
                  <>
                    {/* Tài khoản chính (Main) */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 font-medium mb-3">
                          Tài khoản chính
                        </p>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-gray-500">Hiện tại: </span>
                            <span className="font-bold text-purple-700">
                              {(reward.user?.fnetMain || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Sau đổi: </span>
                            <span
                              className={`font-bold ${
                                // Nếu có fnetMainAfter và khác fnetMain thì Main thay đổi (màu đỏ)
                                reward.user?.fnetMainAfter !== undefined &&
                                reward.user?.fnetMainAfter !==
                                  reward.user?.fnetMain
                                  ? "text-red-600"
                                  : "text-purple-700"
                              }`}
                            >
                              {Number(
                                reward.user?.fnetMainAfter !== undefined
                                  ? reward.user?.fnetMainAfter
                                  : reward.user?.fnetMain || 0,
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tài khoản phụ (Sub) */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 font-medium mb-3">
                          Tài khoản phụ
                        </p>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-gray-500">Hiện tại: </span>
                            <span className="font-bold text-blue-700">
                              {(reward.user?.fnetSub || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Sau đổi: </span>
                            <span
                              className={`font-bold ${
                                // Nếu có fnetSubAfter và khác fnetSub thì Sub thay đổi (màu đỏ)
                                reward.user?.fnetSubAfter !== undefined &&
                                reward.user?.fnetSubAfter !==
                                  reward.user?.fnetSub
                                  ? "text-red-600"
                                  : "text-blue-700"
                              }`}
                            >
                              {Number(
                                reward.user?.fnetSubAfter !== undefined
                                  ? reward.user?.fnetSubAfter
                                  : reward.user?.fnetSub || 0,
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
            </div>

            {/* Note section - only show for non-INITIAL status */}
            {reward.status !== "INITIAL" && reward.note && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Ghi chú:</span> {reward.note}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Action buttons - only show for INITIAL status */}
      {showActions && reward.status === "INITIAL" && (
        <CardContent className="pt-0">
          <div className="flex space-x-3">
            <Button
              onClick={() => onApprove?.(reward.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isProcessing}
            >
              <Check className="w-4 h-4 mr-2" />
              {isProcessing ? "Đang xử lý..." : "Duyệt"}
            </Button>
            <Button
              onClick={() => onReject?.(reward.id)}
              variant="destructive"
              className="flex-1"
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-2" />
              {isProcessing ? "Đang xử lý..." : "Từ chối"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
