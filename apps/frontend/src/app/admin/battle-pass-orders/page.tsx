"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePolling } from "@gateway-workspace/shared/hooks";
import { useSoundNotification } from "@gateway-workspace/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@gateway-workspace/shared/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@gateway-workspace/shared/ui";
import { Textarea } from "@gateway-workspace/shared/ui";
import { Button } from "@gateway-workspace/shared/ui";
import BattlePassOrderCard from "./_components/BattlePassOrderCard";

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

export default function BattlePassOrdersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");
  const previousPendingCount = useRef(0);
  const { playNotification } = useSoundNotification();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<BattlePassOrder | null>(
    null,
  );
  const [action, setAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [note, setNote] = useState("");

  // Polling for pending orders
  const pendingPolling = usePolling<BattlePassOrder[]>(
    `/api/battle-pass/orders?status=PENDING`,
    {
      interval: 30000, // 30 seconds
      enabled: filter === "PENDING",
      onSuccess: (data) => {
        const newPendingCount = data?.length || 0;

        // Play sound when new pending order arrives
        playNotification(newPendingCount, previousPendingCount.current);
        previousPendingCount.current = newPendingCount;

        queryClient.setQueryData(["battle-pass-orders", "PENDING"], data);
      },
      onError: (error) => {
        console.error("Polling error for pending orders:", error);
      },
    },
  );

  const { data: orders, isLoading } = useQuery<BattlePassOrder[]>({
    queryKey: ["battle-pass-orders", filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter !== "ALL") params.append("status", filter);

      const response = await fetch(
        `/api/battle-pass/orders?${params.toString()}`,
      );
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
    initialData:
      filter === "PENDING" ? pendingPolling.data || undefined : undefined,
  });

  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrder || !action) throw new Error("Missing data");

      const endpoint =
        action === "APPROVE"
          ? `/api/battle-pass/orders/${selectedOrder.id}/approve`
          : `/api/battle-pass/orders/${selectedOrder.id}/reject`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() || null }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process order");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["battle-pass-orders"] });
      toast.success(
        action === "APPROVE"
          ? "✅ Đã duyệt đơn hàng thành công!"
          : "✅ Đã từ chối đơn hàng!",
      );
      setIsDialogOpen(false);
      setSelectedOrder(null);
      setAction(null);
      setNote("");
    },
    onError: (error: any) => {
      toast.error(`❌ ${error.message}`);
    },
  });

  const openActionDialog = (
    order: BattlePassOrder,
    actionType: "APPROVE" | "REJECT",
  ) => {
    setSelectedOrder(order);
    setAction(actionType);
    setNote("");
    setIsDialogOpen(true);
  };

  const handleApprove = (orderId: number) => {
    const order = orders?.find((o) => o.id === orderId);
    if (order) {
      openActionDialog(order, "APPROVE");
    }
  };

  const handleReject = (orderId: number) => {
    const order = orders?.find((o) => o.id === orderId);
    if (order) {
      openActionDialog(order, "REJECT");
    }
  };

  const handleDialogAction = () => {
    if (action === "REJECT" && !note.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    actionMutation.mutate();
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["battle-pass-orders"] });
    pendingPolling.refetch();
    toast.success("Đã cập nhật dữ liệu");
  };

  const pendingOrders = orders?.filter((o) => o.status === "PENDING") || [];
  const pendingCount = pendingOrders.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Quản lý đơn hàng Premium Battle Pass
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  Duyệt và quản lý các đơn hàng mua Premium Battle Pass
                </p>
              </div>
              <div className="flex items-center gap-3">
                {pendingCount > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                    <span className="text-yellow-800 font-semibold">
                      {pendingCount} đơn chờ duyệt
                    </span>
                  </div>
                )}
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  🔄 Làm mới
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Card>
          <CardContent className="p-0">
            <div className="flex border-b">
              <button
                onClick={() => {
                  setActiveTab("pending");
                  setFilter("PENDING");
                }}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "pending"
                    ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Chờ duyệt ({pendingCount})
              </button>
              <button
                onClick={() => {
                  setActiveTab("history");
                  setFilter("ALL");
                }}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "history"
                    ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Lịch sử
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Filters for history tab */}
        {activeTab === "history" && (
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div>
                  <label
                    htmlFor="status-filter"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Trạng thái
                  </label>
                  <select
                    id="status-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-4">Đang tải...</p>
              </CardContent>
            </Card>
          ) : !orders || orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg font-medium">
                  Không có đơn hàng nào
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {activeTab === "pending"
                    ? "Chưa có đơn hàng nào đang chờ duyệt"
                    : "Chưa có lịch sử đơn hàng"}
                </p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <BattlePassOrderCard
                key={order.id}
                order={order}
                onApprove={handleApprove}
                onReject={handleReject}
                showActions={activeTab === "pending"}
              />
            ))
          )}
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {action === "APPROVE"
                ? "✅ Duyệt đơn hàng Premium Battle Pass"
                : "❌ Từ chối đơn hàng Premium Battle Pass"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedOrder && (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">
                    Khách hàng:{" "}
                    {selectedOrder.userName || `User ${selectedOrder.userId}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    User ID: {selectedOrder.userId}
                  </p>
                  <p className="text-sm text-gray-600">
                    Chi nhánh:{" "}
                    <span className="font-medium">
                      {selectedOrder.branch === "GO_VAP" ? "Gò Vấp" : "Tân Phú"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Mùa:{" "}
                    <span className="font-medium">
                      {selectedOrder.seasonName ||
                        `Season ${selectedOrder.packageId}`}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Giá:{" "}
                    <span className="font-medium text-orange-600">
                      {selectedOrder.price.toLocaleString()}đ
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Mã đơn hàng:{" "}
                    <span className="font-medium">#{selectedOrder.id}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Ghi chú {action === "REJECT" ? "(bắt buộc)" : "(tùy chọn)"}
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  action === "APPROVE"
                    ? "Nhập ghi chú nếu cần..."
                    : "Nhập lý do từ chối..."
                }
                rows={4}
                className="w-full resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
                disabled={actionMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                onClick={handleDialogAction}
                disabled={actionMutation.isPending}
                className={`flex-1 ${
                  action === "APPROVE"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionMutation.isPending
                  ? "Đang xử lý..."
                  : action === "APPROVE"
                    ? "Xác nhận duyệt"
                    : "Xác nhận từ chối"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
