"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import dayjs from "@/lib/dayjs";

interface RewardExchange {
  id: number;
  promotionCodeId: number;
  duration: number;
  isUsed: boolean;
  status: "INITIAL" | "APPROVE" | "REJECT";
  branch: string;
  createdAt: string;
  updatedAt: string;
  note?: string;
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
    value: number;
    stars: number;
  };
}

interface RewardExchangeCardProps {
  reward: RewardExchange;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  showActions?: boolean;
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

export default function RewardExchangeCard({
  reward,
  onApprove,
  onReject,
  showActions = true,
}: RewardExchangeCardProps) {
  return (
    <Card className="w-full mb-4 shadow-sm hover:shadow-md transition-shadow">
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
              </div>
              {/* Date and Status on the right */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {dayjs.utc(reward.createdAt).format("DD/MM/YYYY HH:mm")}
                </span>
                {getStatusBadge(reward.status)}
              </div>
            </div>

            {/* User stats grid - 4 cards in 1 row */}
            <div
              className={`grid gap-4 ${reward.status === "REJECT" ? "grid-cols-3" : "grid-cols-4"}`}
            >
              {/* Card 1: Phần thưởng */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-3">
                <div className="text-center">
                  <p className="text-xs text-purple-100 font-medium mb-2">
                    Phần thưởng
                  </p>
                  <div className="space-y-1">
                    <div className="text-sm font-bold">
                      {reward.reward?.name || "Không xác định"}
                    </div>
                    <div className="text-xs text-purple-100">
                      {reward.reward?.stars?.toLocaleString() || "0"} sao
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Số sao - Ẩn khi status là REJECT */}
              {reward.status !== "REJECT" && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 font-medium mb-2">
                      Số sao
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Hiện tại:</span>
                        <span className="text-sm font-bold text-green-700">
                          {(
                            (reward.user?.stars || 0) +
                            (reward.reward?.stars || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Sau đổi:</span>
                        <span className="text-sm font-bold text-red-600">
                          {(reward.user?.stars || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 3: Tài khoản chính (Main) */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                <div className="text-center">
                  <p className="text-xs text-gray-600 font-medium mb-2">
                    Tài khoản chính
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {reward.status === "INITIAL"
                          ? "Hiện tại:"
                          : "Trước đổi:"}
                      </span>
                      <span className="text-sm font-bold text-purple-700">
                        {(reward.user?.fnetMain || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Sau đổi:</span>
                      <span className="text-sm font-bold text-purple-700">
                        {reward.status === "INITIAL"
                          ? (reward.user?.fnetMain || 0).toLocaleString()
                          : (
                              reward.user?.fnetMainAfter ||
                              reward.user?.fnetMain ||
                              0
                            ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Tài khoản phụ (Sub) */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3">
                <div className="text-center">
                  <p className="text-xs text-gray-600 font-medium mb-2">
                    Tài khoản phụ
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {reward.status === "INITIAL"
                          ? "Hiện tại:"
                          : "Trước đổi:"}
                      </span>
                      <span className="text-sm font-bold text-blue-700">
                        {(reward.user?.fnetSub || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Sau đổi:</span>
                      <span className="text-sm font-bold text-red-600">
                        {reward.status === "INITIAL"
                          ? (
                              (reward.user?.fnetSub || 0) +
                              (reward.reward?.value || 0)
                            ).toLocaleString()
                          : (
                              reward.user?.fnetSubAfter ||
                              reward.user?.fnetSub ||
                              0
                            ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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
            >
              <Check className="w-4 h-4 mr-2" />
              Duyệt
            </Button>
            <Button
              onClick={() => onReject?.(reward.id)}
              variant="destructive"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Từ chối
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
