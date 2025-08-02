"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Search, Eye, Star, Filter } from "lucide-react";
import Cookies from "js-cookie";
import {
  FEEDBACK_CATEGORY_ENUM,
  FEEDBACK_STATUS_ENUM,
  FEEDBACK_PRIORITY_ENUM,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_PRIORITY_LABELS,
} from "@/constants/feedback.constants";
import {
  BRANCH_ENUM as HANDOVER_BRANCH_ENUM,
  BRANCH_LABELS as HANDOVER_BRANCH_LABELS,
} from "@/constants/handover-reports.constants";
import FeedbackDetailDrawer from "./_components/feedback-detail-drawer";

interface Feedback {
  id: number;
  userId: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  rating: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userUserId: string;
  response?: string;
}

const categories = Object.values(FEEDBACK_CATEGORY_ENUM);
const statuses = Object.values(FEEDBACK_STATUS_ENUM);
const priorities = Object.values(FEEDBACK_PRIORITY_ENUM);
const branches = Object.values(HANDOVER_BRANCH_ENUM);

const LoadingSkeleton = () => (
  <>
    {[...Array(8)].map((_, index) => (
      <tr key={index} className="border border-gray-300">
        <td className="border border-gray-300 px-2 py-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
      </tr>
    ))}
  </>
);

export default function FeedbackManagementPage() {
  const [startDate, setStartDate] = useState(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return oneMonthAgo.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("TAN_PHU");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );
  const [loginType, setLoginType] = useState(
    Cookies.get("loginType") || "username",
  );

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedStatus) params.append("status", selectedStatus);
      if (selectedPriority) params.append("priority", selectedPriority);
      if (selectedBranch) params.append("branch", selectedBranch);

      const response = await fetch(`/api/admin/feedback?${params.toString()}`);
      const result = await response.json();

      if (result.success || result.statusCode === 200) {
        console.log("Feedbacks data:", result.data);
        setFeedbacks(result.data || []);
      } else {
        console.error("Failed to fetch feedbacks:", result.error);
        setFeedbacks([]);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBranch) params.append("branch", selectedBranch);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(
        `/api/admin/feedback/stats?${params.toString()}`,
      );
      const result = await response.json();

      if (result.success || result.statusCode === 200) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    const branch = Cookies.get("branch");
    if (branch && (branch === "TAN_PHU" || branch === "GO_VAP")) {
      setSelectedBranch(branch);
    } else {
      // Default to TAN_PHU if no valid branch in cookie
      setSelectedBranch("TAN_PHU");
      Cookies.set("branch", "TAN_PHU", { path: "/" });
    }
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchFeedbacks();
      fetchStats();
    }
  }, [
    selectedBranch,
    startDate,
    endDate,
    selectedCategory,
    selectedStatus,
    selectedPriority,
  ]);

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value);
    Cookies.set("branch", value, { path: "/" });
  };

  const handleSearch = () => {
    if (selectedBranch) {
      fetchFeedbacks();
      fetchStats();
    }
  };

  const handleOpenDetail = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsDetailDrawerOpen(true);
  };

  const handleCloseDetailDrawer = () => {
    setIsDetailDrawerOpen(false);
    setSelectedFeedback(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600 bg-red-50";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50";
      case "LOW":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "text-blue-600 bg-blue-50";
      case "RECEIVED":
        return "text-purple-600 bg-purple-50";
      case "PROCESSING":
        return "text-orange-600 bg-orange-50";
      case "COMPLETED":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="p-2 lg:p-4 space-y-3">
      {/* Filter Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3 gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Quản lý Feedback
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {/* Branch */}
          <select
            value={selectedBranch}
            onChange={(e) => handleBranchChange(e.target.value)}
            required
            disabled={loginType === "mac"}
            className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              loginType === "mac"
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : ""
            }`}
          >
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {HANDOVER_BRANCH_LABELS[branch]}
              </option>
            ))}
          </select>

          {/* Start Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Từ ngày"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Đến ngày"
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {FEEDBACK_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {FEEDBACK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả độ ưu tiên</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {FEEDBACK_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading || !selectedBranch}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3">
            Thống kê tổng quan
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm text-blue-600 font-medium">Tổng cộng</div>
              <div className="text-lg font-bold text-blue-800">
                {stats.total || 0}
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-md">
              <div className="text-sm text-yellow-600 font-medium">Đã gửi</div>
              <div className="text-lg font-bold text-yellow-800">
                {stats.submitted || 0}
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-md">
              <div className="text-sm text-purple-600 font-medium">Đã nhận</div>
              <div className="text-lg font-bold text-purple-800">
                {stats.received || 0}
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-md">
              <div className="text-sm text-orange-600 font-medium">
                Đang xử lý
              </div>
              <div className="text-lg font-bold text-orange-800">
                {stats.processing || 0}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <div className="text-sm text-green-600 font-medium">
                Hoàn thành
              </div>
              <div className="text-lg font-bold text-green-800">
                {stats.completed || 0}
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-md">
              <div className="text-sm text-red-600 font-medium">
                Ưu tiên cao
              </div>
              <div className="text-lg font-bold text-red-800">
                {stats.highPriority || 0}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-600 font-medium">
                Ưu tiên TB
              </div>
              <div className="text-lg font-bold text-gray-800">
                {stats.mediumPriority || 0}
              </div>
            </div>
            <div className="bg-indigo-50 p-3 rounded-md">
              <div className="text-sm text-indigo-600 font-medium">Điểm TB</div>
              <div className="text-lg font-bold text-indigo-800">
                {stats.averageRating || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback List Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  STT
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Người dùng
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Tiêu đề
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Danh mục
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Độ ưu tiên
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Trạng thái
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Điểm đánh giá
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Ngày tạo
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {loading || initialLoad ? (
                <LoadingSkeleton />
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                feedbacks.map((feedback, index) => (
                  <tr key={feedback.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 font-medium">
                      {feedback.userName || "Ẩn danh"}
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <div className="max-w-xs truncate" title={feedback.title}>
                        {feedback.title}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {FEEDBACK_CATEGORY_LABELS[
                          feedback.category as keyof typeof FEEDBACK_CATEGORY_LABELS
                        ] || "Khác"}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(feedback.priority)}`}
                      >
                        {FEEDBACK_PRIORITY_LABELS[
                          feedback.priority as keyof typeof FEEDBACK_PRIORITY_LABELS
                        ] || "Không xác định"}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(feedback.status)}`}
                      >
                        {FEEDBACK_STATUS_LABELS[
                          feedback.status as keyof typeof FEEDBACK_STATUS_LABELS
                        ] || "Không xác định"}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {renderStars(feedback.rating)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {new Date(feedback.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      <button
                        onClick={() => handleOpenDetail(feedback)}
                        className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Detail Drawer */}
      <FeedbackDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={handleCloseDetailDrawer}
        feedback={selectedFeedback}
        onFeedbackUpdated={fetchFeedbacks}
      />
    </div>
  );
}
