"use client";

import { useState, useEffect } from "react";
import { Card, List, Tag, Spin, Empty, Image } from "antd";
import { Calendar, Award } from "lucide-react";
import { toast } from "sonner";
import dayjs from "@/lib/dayjs";

interface BonusHistoryProps {
  staffId: number;
  month: number;
  year: number;
}

interface BonusRecord {
  id: number;
  amount: number;
  reason: string;
  description: string | null;
  imageUrl: string | null;
  note: string | null;
  rewardDate: string;
  status: "PENDING" | "APPROVED" | "PAID";
  createdAt: string;
}

export default function BonusHistory({ staffId, month, year }: BonusHistoryProps) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ url: string; visible: boolean }>({
    url: "",
    visible: false,
  });
  const [bonusHistory, setBonusHistory] = useState<BonusRecord[]>([]);

  useEffect(() => {
    if (month && year && staffId) {
      fetchHistory();
    }
  }, [staffId, month, year]);

  const fetchHistory = async () => {
    if (!month || !year || !staffId) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `/api/staff/salary/history?staffId=${staffId}&month=${month}&year=${year}`
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch bonus history");
      }
      const result = await response.json();
      if (result.success) {
        setBonusHistory(result.data.bonusHistory || []);
      }
    } catch (error: any) {
      console.error("Error fetching bonus history:", error);
      toast.error(error.message || "Không thể tải lịch sử thưởng");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">

      {/* Bonus History */}
      <Card 
        title={
          <span className="flex items-center gap-2">
            <Award size={18} className="text-green-600" />
            Lịch sử thưởng
          </span>
        } 
        className="shadow-sm"
      >
        {bonusHistory.length === 0 ? (
          <Empty description="Chưa có lịch sử thưởng" />
        ) : (
          <List
            dataSource={bonusHistory}
            renderItem={(item) => (
              <List.Item>
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{item.reason}</span>
                    <Tag
                      color={
                        item.status === "PAID"
                          ? "green"
                          : item.status === "APPROVED"
                          ? "blue"
                          : "orange"
                      }
                    >
                      {item.status === "PAID" && "Đã thanh toán"}
                      {item.status === "APPROVED" && "Đã duyệt"}
                      {item.status === "PENDING" && "Chờ duyệt"}
                    </Tag>
                  </div>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="font-medium text-green-600">
                      Số tiền: {item.amount.toLocaleString("vi-VN")} ₫
                    </div>
                    {item.description && (
                      <div className="text-gray-700">{item.description}</div>
                    )}
                    {item.imageUrl && (
                      <div className="mt-2">
                        <Image
                          src={item.imageUrl}
                          alt={item.reason}
                          width={120}
                          height={120}
                          className="rounded cursor-pointer object-cover"
                          preview={{
                            visible: imagePreview.visible && imagePreview.url === item.imageUrl,
                            onVisibleChange: (visible) => {
                              setImagePreview({ url: item.imageUrl || "", visible });
                            },
                          }}
                          onClick={() => setImagePreview({ url: item.imageUrl || "", visible: true })}
                        />
                      </div>
                    )}
                    {item.note && (
                      <div className="text-xs text-gray-500 italic">
                        Ghi chú: {item.note}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      <Calendar size={12} className="inline mr-1" />
                      {item.rewardDate ? dayjs(item.rewardDate).format("DD/MM/YYYY HH:mm") : dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}

