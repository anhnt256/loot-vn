"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  Calendar,
  User,
  MessageSquare,
  Save,
  AlertCircle,
  ZoomIn,
} from "lucide-react";
import {
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_PRIORITY_LABELS,
  FEEDBACK_STATUS_ENUM,
} from "@/constants/feedback.constants";

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

interface FeedbackDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: Feedback | null;
  onFeedbackUpdated: () => void;
}

export default function FeedbackDetailDrawer({
  isOpen,
  onClose,
  feedback,
  onFeedbackUpdated,
}: FeedbackDetailDrawerProps) {
  const [status, setStatus] = useState("");
  const [response, setResponse] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    if (feedback) {
      setStatus(feedback.status);
      setResponse(feedback.response || "");
      setError("");
    }
  }, [feedback]);

  const handleUpdate = async () => {
    if (!feedback) return;

    setIsUpdating(true);
    setError("");

    try {
      const apiResponse = await fetch(`/api/admin/feedback`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: feedback.id,
          status,
          response,
        }),
      });

      const result = await apiResponse.json();

      if (result.success || result.statusCode === 200) {
        onFeedbackUpdated();
        onClose();
      } else {
        setError(result.error || "Có lỗi xảy ra khi cập nhật");
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
      setError("Có lỗi xảy ra khi cập nhật");
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch detailed feedback when drawer opens
  useEffect(() => {
    if (isOpen && feedback) {
      const fetchDetail = async () => {
        try {
          const response = await fetch(`/api/admin/feedback/${feedback.id}`);
          const result = await response.json();

          if (result.success || result.statusCode === 200) {
            const detailedFeedback = result.data;
            setStatus(detailedFeedback.status);
            setResponse(detailedFeedback.response || "");
          }
        } catch (error) {
          console.error("Error fetching feedback detail:", error);
        }
      };

      fetchDetail();
    }
  }, [isOpen, feedback]);

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
        <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  if (!feedback) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${
        isOpen ? "block" : "hidden"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="relative w-screen max-w-md">
          <div className="flex h-full flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Chi tiết Feedback
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              )}

              {/* User Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <User className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Người gửi
                  </span>
                </div>
                <p className="text-gray-900 font-medium">
                  {feedback.userName || "Ẩn danh"}
                </p>
                <p className="text-sm text-gray-600">ID: {feedback.userId}</p>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {feedback.title}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                    {feedback.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục
                    </label>
                    <span className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                      {FEEDBACK_CATEGORY_LABELS[
                        feedback.category as keyof typeof FEEDBACK_CATEGORY_LABELS
                      ] || "Khác"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Độ ưu tiên
                    </label>
                    <span
                      className={`inline-block px-3 py-1 text-sm rounded-full ${getPriorityColor(feedback.priority)}`}
                    >
                      {FEEDBACK_PRIORITY_LABELS[
                        feedback.priority as keyof typeof FEEDBACK_PRIORITY_LABELS
                      ] || "Không xác định"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Điểm đánh giá
                    </label>
                    {renderStars(feedback.rating)}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày tạo
                    </label>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(feedback.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>

                {/* Image if exists */}
                {feedback.image && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hình ảnh đính kèm
                    </label>
                    <div
                      className="relative group cursor-pointer"
                      onClick={() => setImageModalOpen(true)}
                    >
                      <img
                        src={feedback.image}
                        alt="Feedback attachment"
                        className="max-w-full h-auto rounded-md border border-gray-200 transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Response Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">
                  Phản hồi của Admin
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.values(FEEDBACK_STATUS_ENUM).map(
                        (statusValue) => (
                          <option key={statusValue} value={statusValue}>
                            {FEEDBACK_STATUS_LABELS[statusValue]}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phản hồi
                    </label>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={4}
                      placeholder="Nhập phản hồi của bạn..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && feedback?.image && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={feedback.image}
              alt="Feedback attachment"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
