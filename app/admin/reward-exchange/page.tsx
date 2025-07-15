"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "@/lib/dayjs";
import StatsCard from "./_components/stats-card";
import { DatePicker, Select as AntSelect } from "antd";
const { RangePicker } = DatePicker;
import Cookies from "js-cookie";
import { usePolling } from "@/hooks/usePolling";
import { usePendingCount } from "@/components/admin/AdminSidebar";

interface RewardExchange {
  id: number;
  createdAt: string;
  updatedAt: string;
  note?: string;
  status: "INITIAL" | "APPROVE" | "REJECT";
  user: {
    id: number;
    userId: number | null;
    userName: string | null;
    stars: number;
    branch: string;
  };
  reward: {
    id: number;
    name: string;
    value: number;
    stars: number;
  };
  promotionCode: {
    id: number;
    code: string;
    name: string;
    value: number;
  };
}

interface HistoryResponse {
  rewards: RewardExchange[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface StatsResponse {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const RewardExchangePage = () => {
  const [selectedReward, setSelectedReward] = useState<RewardExchange | null>(
    null,
  );
  const [action, setAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [note, setNote] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [historyStatus, setHistoryStatus] = useState<string>("ALL");
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedDateRange, setSelectedDateRange] = useState<
    [dayjs.Dayjs, dayjs.Dayjs]
  >([dayjs().startOf("day"), dayjs().endOf("day")]);
  const [selectedBranch, setSelectedBranch] = useState("GO_VAP");
  const [loginType, setLoginType] = useState(
    Cookies.get("loginType") || "username",
  );
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const queryClient = useQueryClient();
  const { setPendingCount } = usePendingCount();

  // Load branch from cookie on component mount
  useEffect(() => {
    const branch = Cookies.get("branch");
    if (branch) setSelectedBranch(branch);
  }, []);

  // Polling for pending rewards
  const pendingPolling = usePolling<RewardExchange[]>(
    `/api/reward-exchange/pending?branch=${selectedBranch}`,
    {
      interval: 60000, // 60 seconds
      enabled: isPollingEnabled && activeTab === "pending",
      onSuccess: (data) => {
        queryClient.setQueryData(
          ["reward-exchange-pending", selectedBranch],
          data,
        );
      },
      onError: (error) => {
        console.error("Polling error for pending rewards:", error);
      },
    },
  );

  // Polling for stats
  const statsPolling = usePolling<StatsResponse>(
    `/api/reward-exchange/stats?branch=${selectedBranch}&startDate=${selectedDateRange[0].format("YYYY-MM-DD")}&endDate=${selectedDateRange[1].format("YYYY-MM-DD")}`,
    {
      interval: 60000, // 60 seconds
      enabled: isPollingEnabled,
      onSuccess: (data) => {
        queryClient.setQueryData(
          [
            "reward-exchange-stats",
            selectedBranch,
            selectedDateRange[0].format("YYYY-MM-DD"),
            selectedDateRange[1].format("YYYY-MM-DD"),
          ],
          data,
        );
        setPendingCount(data.pending || 0);
      },
      onError: (error) => {
        console.error("Polling error for stats:", error);
      },
    },
  );

  const { data: pendingRewards, isLoading: pendingLoading } = useQuery<
    RewardExchange[]
  >({
    queryKey: ["reward-exchange-pending", selectedBranch],
    queryFn: () =>
      fetcher(`/api/reward-exchange/pending?branch=${selectedBranch}`),
    initialData: pendingPolling.data || undefined,
  });

  const { data: historyData, isLoading: historyLoading } =
    useQuery<HistoryResponse>({
      queryKey: [
        "reward-exchange-history",
        historyStatus,
        historyPage,
        selectedBranch,
        selectedDateRange[0].format("YYYY-MM-DD"),
        selectedDateRange[1].format("YYYY-MM-DD"),
      ],
      queryFn: () =>
        fetcher(
          `/api/reward-exchange/history?status=${historyStatus}&page=${historyPage}&branch=${selectedBranch}&startDate=${selectedDateRange[0].format("YYYY-MM-DD")}&endDate=${selectedDateRange[1].format("YYYY-MM-DD")}`,
        ),
      enabled: activeTab === "history",
    });

  const { data: stats, isLoading: statsLoading } = useQuery<StatsResponse>({
    queryKey: [
      "reward-exchange-stats",
      selectedBranch,
      selectedDateRange[0].format("YYYY-MM-DD"),
      selectedDateRange[1].format("YYYY-MM-DD"),
    ],
    queryFn: () =>
      fetcher(
        `/api/reward-exchange/stats?branch=${selectedBranch}&startDate=${selectedDateRange[0].format("YYYY-MM-DD")}&endDate=${selectedDateRange[1].format("YYYY-MM-DD")}`,
      ),
    initialData: statsPolling.data || undefined,
  });

  // Cập nhật số lượt pending khi stats thay đổi
  useEffect(() => {
    if (stats) {
      setPendingCount(stats.pending || 0);
    }
  }, [stats, setPendingCount]);

  // Reset page when status changes
  useEffect(() => {
    setHistoryPage(1);
  }, [historyStatus]);

  // Manual refresh function
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["reward-exchange-pending"] });
    queryClient.invalidateQueries({ queryKey: ["reward-exchange-stats"] });
    if (activeTab === "history") {
      queryClient.invalidateQueries({ queryKey: ["reward-exchange-history"] });
    }
    pendingPolling.refetch();
    statsPolling.refetch();
    toast.success("Đã cập nhật dữ liệu");
  };

  // Toggle polling
  const togglePolling = () => {
    setIsPollingEnabled(!isPollingEnabled);
    toast.success(
      isPollingEnabled ? "Đã tắt tự động cập nhật" : "Đã bật tự động cập nhật",
    );
  };

  const handleBranchChange = async (value: string) => {
    setSelectedBranch(value);
    Cookies.set("branch", value, { path: "/" });
    // Invalidate queries to refetch data with new branch
    queryClient.invalidateQueries({ queryKey: ["reward-exchange-pending"] });
    queryClient.invalidateQueries({ queryKey: ["reward-exchange-stats"] });
    if (activeTab === "history") {
      queryClient.invalidateQueries({ queryKey: ["reward-exchange-history"] });
    }
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setSelectedDateRange([dates[0], dates[1]]);
      // Invalidate queries to refetch data with new date range
      queryClient.invalidateQueries({ queryKey: ["reward-exchange-stats"] });
      if (activeTab === "history") {
        queryClient.invalidateQueries({
          queryKey: ["reward-exchange-history"],
        });
      }
    }
  };

  const handleAction = async () => {
    if (!selectedReward || !action) return;

    try {
      const response = await fetch("/api/reward-exchange/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rewardMapId: selectedReward.id,
          action,
          note: note.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process reward exchange");
      }

      toast.success(result.message);
      setIsDialogOpen(false);
      setSelectedReward(null);
      setAction(null);
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["reward-exchange-pending"] });
      queryClient.invalidateQueries({ queryKey: ["reward-exchange-stats"] });

      // Cập nhật số lượt pending ngay lập tức
      if (stats) {
        const newPendingCount =
          action === "APPROVE" || action === "REJECT"
            ? Math.max(0, stats.pending - 1)
            : stats.pending;
        setPendingCount(newPendingCount);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const openActionDialog = (
    reward: RewardExchange,
    actionType: "APPROVE" | "REJECT",
  ) => {
    setSelectedReward(reward);
    setAction(actionType);
    setNote("");
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVE":
        return (
          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full border border-green-200">
            Đã duyệt
          </span>
        );
      case "REJECT":
        return (
          <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full border border-red-200">
            Đã từ chối
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
            Chờ duyệt
          </span>
        );
    }
  };

  // Chỉ show loading khi lần đầu load hoặc khi đang fetch data
  const isInitialLoading =
    (pendingLoading && !pendingRewards) ||
    (historyLoading && activeTab === "history" && !historyData) ||
    (statsLoading && !stats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý đổi thưởng
          </h1>
          <p className="text-gray-600 text-lg">
            Duyệt các yêu cầu đổi thưởng từ người dùng
          </p>
        </div>

        {isInitialLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg font-medium text-gray-600">Đang tải...</div>
          </div>
        )}

        {/* Filters */}
        <div
          className={`mb-6 flex flex-wrap gap-4 items-center ${isInitialLoading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Chi nhánh:
            </span>
            <AntSelect
              value={selectedBranch}
              onChange={handleBranchChange}
              className="w-40"
              disabled={loginType === "mac"}
              options={[
                { value: "GO_VAP", label: "Gò Vấp" },
                { value: "TAN_PHU", label: "Tân Phú" },
              ]}
              style={{
                backgroundColor: "#fff",
                borderColor: "#d1d5db",
                borderRadius: "6px",
                color: loginType === "mac" ? "#bfbfbf" : "#000",
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Khoảng thời gian:
            </span>
            <RangePicker
              value={selectedDateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              className="w-64"
              style={{
                backgroundColor: "#fff",
                borderColor: "#d1d5db",
                borderRadius: "6px",
              }}
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              🔄 Làm mới
            </Button>
            <Button
              onClick={togglePolling}
              variant={isPollingEnabled ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              {isPollingEnabled ? "⏸️ Tắt tự động" : "▶️ Bật tự động"}
            </Button>
            {isPollingEnabled && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Tự động cập nhật mỗi 60s
              </span>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && !isInitialLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Chờ duyệt"
              value={stats.pending}
              description="Yêu cầu đang chờ xử lý"
              icon="⏳"
              color="yellow"
            />
            <StatsCard
              title="Đã duyệt"
              value={stats.approved}
              description="Yêu cầu đã được duyệt"
              icon="✅"
              color="green"
            />
            <StatsCard
              title="Đã từ chối"
              value={stats.rejected}
              description="Yêu cầu đã bị từ chối"
              icon="❌"
              color="red"
            />
            <StatsCard
              title="Tổng cộng"
              value={stats.total}
              description="Tổng số yêu cầu"
              icon="📊"
              color="blue"
            />
          </div>
        )}

        {/* Main Content Card */}
        <Card
          className={`shadow-lg border-0 ${isInitialLoading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <CardHeader className="bg-white border-b border-gray-200">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "pending"
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Chờ duyệt ({pendingRewards?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "history"
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Lịch sử
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Pending Tab */}
            {activeTab === "pending" && (
              <div className="space-y-4">
                {pendingLoading && !pendingRewards ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">Đang tải...</div>
                  </div>
                ) : pendingRewards && pendingRewards.length > 0 ? (
                  pendingRewards.map((reward) => (
                    <Card
                      key={reward.id}
                      className="border border-gray-200 hover:shadow-md transition-all duration-200"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <CardTitle className="text-xl font-bold text-gray-900">
                                User ID: {reward.user?.userId || "N/A"}
                              </CardTitle>
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {reward.user?.branch || "N/A"}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <p>
                                <span className="font-medium">Username:</span>{" "}
                                {reward.user?.userName || "N/A"}
                              </p>
                              <p>
                                <span className="font-medium">Số sao:</span>{" "}
                                {reward.user?.stars?.toLocaleString() || "0"}
                              </p>
                              <p>
                                <span className="font-medium">
                                  Ngày yêu cầu:
                                </span>{" "}
                                {dayjs
                                  .utc(reward.createdAt)
                                  .format("DD/MM/YYYY HH:mm")}
                              </p>
                              <p>
                                <span className="font-medium">
                                  Mã khuyến mãi:
                                </span>{" "}
                                {reward.promotionCode?.code || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="flex justify-end">
                              {getStatusBadge(reward.status)}
                            </div>
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">
                              <p className="font-bold text-lg">
                                {reward.reward.name}
                              </p>
                              <p className="text-sm opacity-90">
                                Giá: {reward.reward.stars?.toLocaleString()} sao
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {reward.note && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Ghi chú:</span>{" "}
                              {reward.note}
                            </p>
                          </div>
                        )}
                        <div className="flex gap-3 mt-4">
                          <Button
                            onClick={() => openActionDialog(reward, "APPROVE")}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
                          >
                            ✅ Duyệt
                          </Button>
                          <Button
                            onClick={() => openActionDialog(reward, "REJECT")}
                            variant="destructive"
                            className="flex-1 font-semibold py-2"
                          >
                            ❌ Từ chối
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📭</div>
                        <p className="text-gray-500 font-medium">
                          Không có yêu cầu đổi thưởng nào đang chờ duyệt
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className="space-y-6">
                {historyLoading && !historyData ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">Đang tải...</div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <Select
                        value={historyStatus}
                        onValueChange={setHistoryStatus}
                      >
                        <SelectTrigger className="w-64 bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                          <SelectItem value="APPROVE">Đã duyệt</SelectItem>
                          <SelectItem value="REJECT">Đã từ chối</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      {historyData?.rewards &&
                      historyData.rewards.length > 0 ? (
                        historyData.rewards.map((reward) => (
                          <Card
                            key={reward.id}
                            className="border border-gray-200 hover:shadow-md transition-all duration-200"
                          >
                            <CardHeader className="pb-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-3">
                                    <CardTitle className="text-xl font-bold text-gray-900">
                                      User ID: {reward.user?.userId || "N/A"}
                                    </CardTitle>
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                      {reward.user?.branch || "N/A"}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                    <p>
                                      <span className="font-medium">
                                        Username:
                                      </span>{" "}
                                      {reward.user?.userName || "N/A"}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Số sao:
                                      </span>{" "}
                                      {reward.user?.stars?.toLocaleString() ||
                                        "0"}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Ngày yêu cầu:
                                      </span>{" "}
                                      {dayjs
                                        .utc(reward.createdAt)
                                        .format("DD/MM/YYYY HH:mm")}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Ngày xử lý:
                                      </span>{" "}
                                      {dayjs
                                        .utc(reward.updatedAt)
                                        .format("DD/MM/YYYY HH:mm")}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right space-y-2">
                                  <div className="flex justify-end">
                                    {getStatusBadge(reward.status)}
                                  </div>
                                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">
                                    <p className="font-bold text-lg">
                                      {reward.reward.name}
                                    </p>
                                    <p className="text-sm opacity-90">
                                      Giá hiển thị:{" "}
                                      {reward.reward.stars?.toLocaleString()}{" "}
                                      sao | Giá đổi:{" "}
                                      {reward.reward.value?.toLocaleString()}{" "}
                                      sao
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">
                                    Mã khuyến mãi:
                                  </span>{" "}
                                  {reward.promotionCode?.code || "N/A"}
                                </p>
                                {reward.note && (
                                  <p className="text-sm text-gray-700 mt-1">
                                    <span className="font-medium">
                                      Ghi chú:
                                    </span>{" "}
                                    {reward.note}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card className="border-2 border-dashed border-gray-300">
                          <CardContent className="flex items-center justify-center h-32">
                            <div className="text-center">
                              <div className="text-4xl mb-2">📋</div>
                              <p className="text-gray-500 font-medium">
                                Không có lịch sử đổi thưởng
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Pagination */}
                    {historyData?.pagination &&
                      historyData.pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                          <div className="flex items-center space-x-4 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
                            <Button
                              variant="outline"
                              onClick={() =>
                                setHistoryPage(Math.max(1, historyPage - 1))
                              }
                              disabled={historyPage === 1}
                              className="px-4 py-2"
                            >
                              ← Trước
                            </Button>
                            <span className="text-sm font-medium text-gray-700 px-4">
                              Trang {historyPage} /{" "}
                              {historyData.pagination.totalPages}
                            </span>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setHistoryPage(
                                  Math.min(
                                    historyData.pagination.totalPages,
                                    historyPage + 1,
                                  ),
                                )
                              }
                              disabled={
                                historyPage ===
                                historyData.pagination.totalPages
                              }
                              className="px-4 py-2"
                            >
                              Sau →
                            </Button>
                          </div>
                        </div>
                      )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {action === "APPROVE"
                ? "✅ Duyệt yêu cầu đổi thưởng"
                : "❌ Từ chối yêu cầu đổi thưởng"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedReward && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">
                    User ID: {selectedReward.user?.userId || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Username: {selectedReward.user?.userName || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phần thưởng:{" "}
                    <span className="font-medium">
                      {selectedReward.reward?.name || "N/A"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Giá trị:{" "}
                    <span className="font-medium">
                      {selectedReward.reward?.stars?.toLocaleString() || "0"}{" "}
                      sao
                    </span>
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
                required={action === "REJECT"}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="px-6"
              >
                Hủy
              </Button>
              <Button
                onClick={handleAction}
                className={`px-6 font-semibold ${
                  action === "APPROVE"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                disabled={action === "REJECT" && !note.trim()}
              >
                {action === "APPROVE" ? "✅ Duyệt" : "❌ Từ chối"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardExchangePage;
