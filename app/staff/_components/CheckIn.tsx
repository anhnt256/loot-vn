"use client";

import { useState, useEffect } from "react";
import { Card, Button, List, Tag, Spin, Empty, Statistic } from "antd";
import { Clock, Play, Square, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import dayjs from "@/lib/dayjs";

interface CheckInProps {
  staffId: number;
  month: number;
  year: number;
}

interface TimeRecord {
  id: number;
  checkInTime: string;
  checkOutTime: string | null;
  totalHours: number | null;
  status: "WORKING" | "COMPLETED";
}

interface Stats {
  todayHours: number;
  weekHours: number;
  monthHours: number;
}

export default function CheckIn({ staffId, month, year }: CheckInProps) {
  const [loading, setLoading] = useState(false);
  const [todayRecords, setTodayRecords] = useState<TimeRecord[]>([]);
  const [currentWorkingRecord, setCurrentWorkingRecord] =
    useState<TimeRecord | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");
  const [stats, setStats] = useState<Stats>({
    todayHours: 0,
    weekHours: 0,
    monthHours: 0,
  });

  useEffect(() => {
    if (staffId && month && year) {
      fetchTodayData();
    }
  }, [staffId, month, year]);

  // Timer để cập nhật thời gian làm việc mỗi phút
  useEffect(() => {
    if (currentWorkingRecord) {
      const updateTimer = () => {
        // DB stores datetime as UTC+7 string "YYYY-MM-DD HH:mm:ss"
        // Parse it as VN time directly without conversion
        const checkInTime = dayjs.tz(
          currentWorkingRecord.checkInTime,
          "Asia/Ho_Chi_Minh",
        );

        // Current time in Vietnam timezone
        const now = dayjs().tz("Asia/Ho_Chi_Minh");

        // Calculate diff: now - checkInTime (hours worked)
        const diffMinutes = now.diff(checkInTime, "minute");

        // Ensure positive value
        const absDiffMinutes = Math.max(0, diffMinutes);
        const hours = Math.floor(absDiffMinutes / 60);
        const minutes = absDiffMinutes % 60;

        setElapsedTime(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
        );
      };

      updateTimer(); // Update immediately
      const interval = setInterval(updateTimer, 1000); // Update every second for real-time

      return () => clearInterval(interval);
    } else {
      setElapsedTime("00:00");
    }
  }, [currentWorkingRecord]);

  const fetchTodayData = async () => {
    if (!staffId) return;

    try {
      setLoading(true);
      // Sử dụng Vietnam timezone (UTC+7)
      const today = dayjs().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
      const response = await fetch(
        `/api/staff/time-tracking?staffId=${staffId}&date=${today}`,
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to fetch today's data";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.success) {
        const records = result.data.todayRecords || [];
        setTodayRecords(records);
        // Tìm record đang làm việc (chưa checkout) - chỉ lấy record đầu tiên
        const working = records.find((r: TimeRecord) => r.status === "WORKING");
        setCurrentWorkingRecord(working || null);
        // Set stats
        if (result.data.stats) {
          setStats(result.data.stats);
        }
        // Force timer update if there's a working record
        if (working) {
          const checkInTime = dayjs.tz(working.checkInTime, "Asia/Ho_Chi_Minh");
          const now = dayjs().tz("Asia/Ho_Chi_Minh");
          const diffMinutes = Math.max(0, now.diff(checkInTime, "minute"));
          const hours = Math.floor(diffMinutes / 60);
          const minutes = diffMinutes % 60;
          setElapsedTime(
            `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
          );
        } else {
          setElapsedTime("00:00");
        }
      }
    } catch (error: unknown) {
      let errorMessage = "Không thể tải dữ liệu chấm công";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
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
        body: JSON.stringify({
          staffId,
          action: "checkin",
        }),
      });

      const responseText = await response.text();
      let result: any;
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!response.ok || !result.success) {
        const errorMessage =
          result?.error || result?.message || "Check-in thất bại";
        throw new Error(errorMessage);
      }

      toast.success("Check-in thành công!");
      fetchTodayData(); // Refresh data
    } catch (error: unknown) {
      let errorMessage = "Không thể check-in";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (recordId?: number) => {
    const targetRecordId = recordId || currentWorkingRecord?.id;
    if (!targetRecordId) return;

    try {
      setLoading(true);
      const response = await fetch("/api/staff/time-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          action: "checkout",
          recordId: targetRecordId,
        }),
      });

      const responseText = await response.text();
      let result: any;
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!response.ok || !result.success) {
        const errorMessage =
          result?.error || result?.message || "Check-out thất bại";
        throw new Error(errorMessage);
      }

      toast.success("Check-out thành công!");
      setCurrentWorkingRecord(null);
      setElapsedTime("00:00");
      fetchTodayData(); // Refresh data
    } catch (error: unknown) {
      let errorMessage = "Không thể check-out";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && todayRecords.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Check-in/Check-out Card */}
      <Card className="shadow-sm">
        <div className="text-center space-y-4">
          {currentWorkingRecord ? (
            <>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Đang làm việc</div>
                <div className="text-4xl font-bold text-blue-600">
                  {elapsedTime}
                </div>
                <div className="text-xs text-gray-500">
                  Check-in:{" "}
                  {currentWorkingRecord.checkInTime
                    ? currentWorkingRecord.checkInTime.substring(11, 16) // Extract HH:mm from "YYYY-MM-DD HH:mm:ss"
                    : ""}
                </div>
              </div>
              <Button
                type="primary"
                danger
                size="large"
                icon={<Square size={20} />}
                onClick={() => handleCheckOut()}
                loading={loading}
                block
                className="max-w-xs mx-auto"
              >
                Check-out
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Clock size={48} className="mx-auto text-gray-400" />
                <div className="text-sm text-gray-600">
                  Chưa check-in hôm nay
                </div>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<Play size={20} />}
                onClick={handleCheckIn}
                loading={loading}
                block
                className="max-w-xs mx-auto"
              >
                Check-in
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Thống kê giờ làm việc */}
      <Card className="shadow-sm">
        <div className="grid grid-cols-3 gap-4">
          <Statistic
            title="Hôm nay"
            value={stats.todayHours.toFixed(1)}
            suffix="giờ"
            valueStyle={{ color: "#1890ff" }}
          />
          <Statistic
            title="Tuần này"
            value={stats.weekHours.toFixed(1)}
            suffix="giờ"
            valueStyle={{ color: "#52c41a" }}
          />
          <Statistic
            title="Tháng này"
            value={stats.monthHours.toFixed(1)}
            suffix="giờ"
            valueStyle={{ color: "#722ed1" }}
          />
        </div>
      </Card>

      {/* Lịch sử làm việc hôm nay */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <Clock size={18} />
            Lịch sử làm việc hôm nay
          </span>
        }
        className="shadow-sm"
      >
        {todayRecords.length === 0 ? (
          <Empty description="Chưa có lịch sử chấm công hôm nay" />
        ) : (
          <List
            dataSource={todayRecords}
            renderItem={(record: TimeRecord, index: number) => {
              // Display datetime from DB directly, no parsing/formatting
              // Extract time parts from string "YYYY-MM-DD HH:mm:ss"
              const checkInTimeStr = record.checkInTime || "";
              const checkInDisplay = checkInTimeStr.substring(11, 19); // HH:mm:ss

              const checkOutTimeStr = record.checkOutTime || "";
              const checkOutDisplay = checkOutTimeStr
                ? checkOutTimeStr.substring(11, 19)
                : null; // HH:mm:ss

              // For timer calculation, parse datetime (but only for diff calculation)
              const checkIn = dayjs.tz(record.checkInTime, "Asia/Ho_Chi_Minh");
              let checkOut = null;
              if (record.checkOutTime) {
                checkOut = dayjs.tz(record.checkOutTime, "Asia/Ho_Chi_Minh");
              }

              let hours = record.totalHours;

              // Calculate hours if not available
              if (!hours || hours < 0) {
                if (checkOut) {
                  hours = Math.abs(checkOut.diff(checkIn, "hour", true));
                } else {
                  // Still working - calculate from now (Vietnam time)
                  const now = dayjs().tz("Asia/Ho_Chi_Minh");
                  hours = Math.abs(now.diff(checkIn, "hour", true));
                }
              } else {
                // Ensure positive
                hours = Math.abs(hours);
              }

              const hoursInt = Math.floor(hours);
              const minutesInt = Math.floor((hours - hoursInt) * 60);

              return (
                <List.Item>
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Lần {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <Tag
                          color={record.status === "WORKING" ? "blue" : "green"}
                        >
                          {record.status === "WORKING"
                            ? "Đang làm"
                            : "Hoàn thành"}
                        </Tag>
                        {record.status === "WORKING" && (
                          <Button
                            type="primary"
                            danger
                            size="small"
                            onClick={() => handleCheckOut(record.id)}
                            loading={loading}
                          >
                            Check-out
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <CheckCircle
                          size={12}
                          className="inline mr-1 text-green-600"
                        />
                        Check-in: {checkInDisplay}
                      </div>
                      {checkOutDisplay ? (
                        <div>
                          <Square
                            size={12}
                            className="inline mr-1 text-red-600"
                          />
                          Check-out: {checkOutDisplay}
                        </div>
                      ) : null}
                      <div className="font-medium text-blue-600">
                        Thời gian: {String(hoursInt).padStart(2, "0")}:
                        {String(minutesInt).padStart(2, "0")}
                      </div>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
}
