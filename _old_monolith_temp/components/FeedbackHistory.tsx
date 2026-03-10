"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  History,
  Clock,
  AlertCircle,
  Lightbulb,
  Bug,
  Star,
  Image as ImageIcon,
} from "lucide-react";
import dayjs from "@/lib/dayjs";

interface FeedbackItem {
  id: number;
  type: "IMPROVEMENT" | "BUG_REPORT" | "FEATURE_REQUEST" | "GENERAL";
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "SUBMITTED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  category: string | null;
  rating: number;
  image: string | null;
  computerId: string | null;
  createdAt: string;
  updatedAt: string;
}

const FeedbackHistory = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbackHistory = async () => {
    try {
      const response = await fetch("/api/feedback");
      if (response.ok) {
        const data = await response.json();
        setFeedbackList(data.data || []);
      } else {
        toast.error("Không thể tải lịch sử feedback");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải lịch sử");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackHistory();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "BUG_REPORT":
        return <Bug className="h-4 w-4" />;
      case "FEATURE_REQUEST":
        return <Lightbulb className="h-4 w-4" />;
      case "IMPROVEMENT":
        return <Star className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "BUG_REPORT":
        return "Báo lỗi";
      case "FEATURE_REQUEST":
        return "Đề xuất tính năng";
      case "IMPROVEMENT":
        return "Cải thiện";
      default:
        return "Khác";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "Chờ xử lý";
      case "IN_PROGRESS":
        return "Đang xử lý";
      case "RESOLVED":
        return "Đã giải quyết";
      case "REJECTED":
        return "Từ chối";
      default:
        return "Không xác định";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "Cao";
      case "MEDIUM":
        return "Trung bình";
      case "LOW":
        return "Thấp";
      default:
        return "Không xác định";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Đang tải...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Lịch sử Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feedbackList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Bạn chưa có feedback nào
          </div>
        ) : (
          <div className="space-y-4">
            {feedbackList.map((feedback) => (
              <div
                key={feedback.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(feedback.type)}
                    <span className="font-medium">
                      Feedback về {feedback.category || "Khác"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(feedback.priority)}>
                      {getPriorityLabel(feedback.priority)}
                    </Badge>
                    <Badge className={getStatusColor(feedback.status)}>
                      {getStatusLabel(feedback.status)}
                    </Badge>
                  </div>
                </div>

                <div className="mb-3">
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(feedback.type)}
                  </Badge>
                </div>

                {feedback.rating > 0 && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-600">Đánh giá: </span>
                    <span className="text-sm font-medium">
                      {feedback.rating}/5 sao
                    </span>
                  </div>
                )}

                {feedback.description && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-600">Chi tiết: </span>
                    <p className="text-sm text-gray-800 mt-1">
                      {feedback.description}
                    </p>
                  </div>
                )}

                {feedback.image && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Hình ảnh:</span>
                    </div>
                    <div className="relative">
                      <img
                        src={feedback.image}
                        alt="Screenshot"
                        className="max-w-full h-auto max-h-48 rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Tạo: {dayjs(feedback.createdAt).format("DD/MM/YYYY HH:mm")}
                  </div>
                  {feedback.updatedAt !== feedback.createdAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Cập nhật:{" "}
                      {dayjs(feedback.updatedAt).format("DD/MM/YYYY HH:mm")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <Button
            onClick={fetchFeedbackHistory}
            variant="outline"
            className="w-full"
          >
            Làm mới
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackHistory;
