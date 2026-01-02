"use client";

import { useState, useEffect } from "react";
import { Card, Button, List, Tag, Space, Spin, Empty, Statistic } from "antd";
import { Clock, CheckCircle, XCircle, Play, Square } from "lucide-react";
import { toast } from "sonner";
import dayjs from "@/lib/dayjs";

interface TimeTrackingProps {
  staffId: number;
  month: number;
  year: number;
}

interface TimeRecord {
  id: number;
  checkInTime: string;
  checkOutTime: string | null;
  date: string;
  totalHours: number | null;
  status: "WORKING" | "COMPLETED";
}

export default function TimeTracking({ staffId, month, year }: TimeTrackingProps) {
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<TimeRecord | null>(null);
  const [history, setHistory] = useState<TimeRecord[]>([]);
  const [stats, setStats] = useState({ todayHours: 0, weekHours: 0, monthHours: 0 });

  useEffect(() => {
    if (staffId && month && year) {
      fetchTimeData();
    }
  }, [staffId, month, year]);

  const fetchTimeData = async () => {
    if (!staffId || !month || !year) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/staff/time-tracking?staffId=${staffId}&month=${month}&year=${year}`);
      if (!response.ok) throw new Error("Failed to fetch time data");
      const result = await response.json();
      if (result.success) {
        setTodayRecord(result.data.todayRecord);
        setHistory(result.data.history || []);
        setStats(result.data.stats || { todayHours: 0, weekHours: 0, monthHours: 0 });
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải dữ liệu giờ làm việc");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/staff/time-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, action: "checkin" }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Check-in thành công!");
        fetchTimeData();
      } else {
        throw new Error(result.error || "Check-in thất bại");
      }
    } catch (error: any) {
      toast.error(error.message || "Check-in thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/staff/time-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, action: "checkout" }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Check-out thành công!");
        fetchTimeData();
      } else {
        throw new Error(result.error || "Check-out thất bại");
      }
    } catch (error: any) {
      toast.error(error.message || "Check-out thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !todayRecord) {
    return (
      <div className="flex justify-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  const isWorking = todayRecord?.status === "WORKING";

  return (
    <div className="space-y-4 pb-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="text-center">
          <Statistic
            title="Hôm nay"
            value={stats.todayHours}
            suffix="h"
            valueStyle={{ fontSize: "18px", fontWeight: "bold" }}
          />
        </Card>
        <Card className="text-center">
          <Statistic
            title="Tuần này"
            value={stats.weekHours}
            suffix="h"
            valueStyle={{ fontSize: "18px", fontWeight: "bold" }}
          />
        </Card>
        <Card className="text-center">
          <Statistic
            title="Tháng này"
            value={stats.monthHours}
            suffix="h"
            valueStyle={{ fontSize: "18px", fontWeight: "bold" }}
          />
        </Card>
      </div>

      {/* Check In/Out Button */}
      <Card className="shadow-sm">
        <div className="text-center space-y-4">
          {isWorking ? (
            <>
              <div className="space-y-2">
                <Tag color="green" className="text-base px-4 py-2">
                  <CheckCircle className="inline mr-2" />
                  Đang làm việc
                </Tag>
                <p className="text-gray-600">
                  Check-in: {dayjs(todayRecord?.checkInTime).format("HH:mm DD/MM/YYYY")}
                </p>
              </div>
              <Button
                type="primary"
                danger
                size="large"
                icon={<Square size={20} />}
                onClick={handleCheckOut}
                loading={loading}
                className="w-full"
              >
                Check-out
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Tag color="default" className="text-base px-4 py-2">
                  <XCircle className="inline mr-2" />
                  Chưa check-in
                </Tag>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<Play size={20} />}
                onClick={handleCheckIn}
                loading={loading}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Check-in
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* History */}
      <Card title="Lịch sử làm việc" className="shadow-sm">
        {history.length === 0 ? (
          <Empty description="Chưa có lịch sử" />
        ) : (
          <List
            dataSource={history}
            renderItem={(item) => (
              <List.Item>
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">
                      {dayjs(item.date).format("DD/MM/YYYY")}
                    </span>
                    <Tag color={item.status === "COMPLETED" ? "green" : "orange"}>
                      {item.status === "COMPLETED" ? "Hoàn thành" : "Đang làm"}
                    </Tag>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <Clock size={14} className="inline mr-1" />
                      Vào: {dayjs(item.checkInTime).format("HH:mm")}
                    </div>
                    {item.checkOutTime && (
                      <div>
                        <Clock size={14} className="inline mr-1" />
                        Ra: {dayjs(item.checkOutTime).format("HH:mm")}
                      </div>
                    )}
                    {item.totalHours && (
                      <div className="font-medium text-orange-600">
                        Tổng: {item.totalHours.toFixed(2)} giờ
                      </div>
                    )}
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

