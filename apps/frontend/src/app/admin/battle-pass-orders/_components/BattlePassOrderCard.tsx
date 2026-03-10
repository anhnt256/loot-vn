"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@gateway-workspace/shared/ui";
import { Button } from "@gateway-workspace/shared/ui";
import { Check, X } from "lucide-react";
import { dayjs } from "@gateway-workspace/shared/utils";

interface BattlePassOrder {
  id: number;
  userId: number;
  userName?: string;
  packageId: number;
  packageName?: string;
  seasonName?: string;
  price: number;
  branch: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  approvedAt?: string;
  approvedBy?: number;
  approverName?: string;
  note?: string;
}

interface BattlePassOrderCardProps {
  order: BattlePassOrder;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  showActions?: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return (
        <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full border border-yellow-300">
          ⏳ Chờ duyệt
        </span>
      );
    case "APPROVED":
      return (
        <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full border border-green-300">
          ✅ Đã duyệt
        </span>
      );
    case "REJECTED":
      return (
        <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full border border-red-300">
          ❌ Từ chối
        </span>
      );
    case "CANCELLED":
      return (
        <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full border border-gray-300">
          🚫 Đã hủy
        </span>
      );
    default:
      return null;
  }
};

export default function BattlePassOrderCard({
  order,
  onApprove,
  onReject,
  showActions = true,
}: BattlePassOrderCardProps) {
  return (
    <Card className="w-full mb-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
      <CardHeader className="pb-4">
        <div className="space-y-4">
          {/* Header with user info and status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-xl font-bold text-gray-900">
                {order.userName || `User ${order.userId}`}
              </CardTitle>
              <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {order.branch === "GO_VAP" ? "Gò Vấp" : "Tân Phú"}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {dayjs.utc(order.createdAt).format("DD/MM/YYYY HH:mm")}
              </span>
              {getStatusBadge(order.status)}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid gap-4 grid-cols-3">
            {/* Season Info */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-4">
              <div className="text-xs font-medium opacity-90 mb-1">
                Mùa Battle Pass
              </div>
              <div className="text-lg font-bold">
                {order.seasonName || `Season ${order.packageId}`}
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg p-4">
              <div className="text-xs font-medium opacity-90 mb-1">Giá</div>
              <div className="text-lg font-bold">
                {order.price.toLocaleString()}đ
              </div>
            </div>

            {/* Order ID */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg p-4">
              <div className="text-xs font-medium opacity-90 mb-1">
                Mã đơn hàng
              </div>
              <div className="text-lg font-bold">#{order.id}</div>
            </div>
          </div>

          {/* User ID */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">User ID:</span> {order.userId}
          </div>

          {/* Approver info or note */}
          {order.status === "APPROVED" && order.approverName && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm text-green-800">
                <span className="font-semibold">Người duyệt:</span>{" "}
                {order.approverName}
              </div>
              {order.approvedAt && (
                <div className="text-xs text-green-700 mt-1">
                  Duyệt lúc:{" "}
                  {dayjs.utc(order.approvedAt).format("DD/MM/YYYY HH:mm")}
                </div>
              )}
            </div>
          )}

          {order.status === "REJECTED" && order.note && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm text-red-800">
                <span className="font-semibold">Lý do từ chối:</span>{" "}
                {order.note}
              </div>
              {order.approverName && (
                <div className="text-xs text-red-700 mt-1">
                  Từ chối bởi: {order.approverName}
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      {/* Actions */}
      {showActions && order.status === "PENDING" && (
        <CardContent className="pt-0">
          <div className="flex gap-3">
            <Button
              onClick={() => onApprove?.(order.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <Check className="mr-2 h-5 w-5" />
              Duyệt đơn
            </Button>
            <Button
              onClick={() => onReject?.(order.id)}
              variant="destructive"
              className="flex-1"
              size="lg"
            >
              <X className="mr-2 h-5 w-5" />
              Từ chối
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
