import React, { useState, useEffect } from "react";
import { Card, List, Tag, Spin, Empty, Image } from "antd";
import { Calendar, Award, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { apiClient } from "@gateway-workspace/shared/utils";

interface RewardPunishHistoryProps {
  staffId: string;
  month: number;
  year: number;
}

interface HistoryItem {
  id: string;
  amount: number;
  reason: string;
  description: string | null;
  imageUrl: string | null;
  note: string | null;
  date: string;
  status: "PENDING" | "APPROVED" | "PAID";
  type: "REWARD" | "PUNISHMENT";
}

export default function RewardPunishHistory({ staffId, month, year }: RewardPunishHistoryProps) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (month && year && staffId) {
      fetchHistory();
    }
  }, [staffId, month, year]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const result = await apiClient.post(`/hr-app/salary/history`, { staffId, month, year });
      
      if (result.data.success) {
        const rewards = (result.data.data.bonusHistory || []).map((item: any) => ({
          ...item,
          type: "REWARD",
          date: item.rewardDate || item.createdAt
        }));
        const punishments = (result.data.data.penaltiesHistory || []).map((item: any) => ({
          ...item,
          type: "PUNISHMENT",
          date: item.penaltyDate || item.createdAt
        }));

        const combined = [...rewards, ...punishments].sort((a, b) => 
          dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
        );

        setHistory(combined);
      } else {
        throw new Error(result.data.error || "Lỗi lấy dữ liệu lịch sử");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải lịch sử thưởng/phạt");
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
      <Card
        title={
          <span className="flex items-center gap-2">
            <Award size={18} className="text-blue-600" />
            Thưởng & Phạt
          </span>
        }
        className="shadow-sm"
      >
        {history.length === 0 ? (
          <Empty description="Chưa có thông tin thưởng hoặc phạt" />
        ) : (
          <List
            dataSource={history}
            renderItem={(item) => (
              <List.Item className={`${item.type === 'PUNISHMENT' ? 'border-l-4 border-red-500 pl-4' : 'border-l-4 border-green-500 pl-4'}`}>
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-base flex items-center gap-2">
                      {item.type === 'REWARD' ? 
                        <Award size={16} className="text-green-600" /> : 
                        <AlertTriangle size={16} className="text-red-600" />
                      }
                      {item.reason}
                    </span>
                    <Tag
                      color={
                        item.type === 'REWARD' 
                          ? (item.status === 'PAID' ? 'green' : 'blue') 
                          : (item.status === 'PAID' ? 'red' : 'orange')
                      }
                    >
                      {item.status === "PAID" && (item.type === 'REWARD' ? "Đã nhận" : "Đã trừ")}
                      {item.status === "APPROVED" && "Đã duyệt"}
                      {item.status === "PENDING" && "Chờ duyệt"}
                    </Tag>
                  </div>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className={`font-bold text-lg ${item.type === 'REWARD' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.type === 'REWARD' ? '+' : '-'}{item.amount.toLocaleString("vi-VN")} ₫
                    </div>
                    {item.description && (
                      <div className="text-gray-700">{item.description}</div>
                    )}
                    {item.imageUrl && (
                      <div className="mt-2 text-center">
                        <Image
                          src={item.imageUrl}
                          alt={item.reason}
                          className="rounded-lg shadow-sm max-h-40"
                        />
                      </div>
                    )}
                    {item.note && (
                      <div className="text-xs text-gray-500 italic mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <strong>Ghi chú từ quản lý:</strong> {item.note}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Calendar size={14} />
                      {dayjs(item.date).utcOffset(7).format("DD/MM/YYYY HH:mm")}
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
