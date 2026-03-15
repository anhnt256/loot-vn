import React, { useState, useEffect } from "react";
import { Card, Button, List, Tag, Spin, Empty, Statistic } from "antd";
import { Clock, Play, Square, CheckCircle, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/vi";
import { apiClient } from "@gateway-workspace/shared/utils";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("vi");

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

export default function CheckInComponent({ staffId, month, year }: CheckInProps) {
  const [loading, setLoading] = useState(false);
  const [todayRecords, setTodayRecords] = useState<TimeRecord[]>([]);
  const [currentWorkingRecord, setCurrentWorkingRecord] = useState<TimeRecord | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");
  const [stats, setStats] = useState<Stats>({ todayHours: 0, weekHours: 0, monthHours: 0 });

  useEffect(() => {
    if (staffId && month && year) {
      fetchTodayData();
    }
  }, [staffId, month, year]);

  useEffect(() => {
    if (currentWorkingRecord) {
      const updateTimer = () => {
        const checkInTime = dayjs(currentWorkingRecord.checkInTime);
        const now = dayjs();
        const diffMinutes = Math.max(0, now.diff(checkInTime, "minute"));
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        setElapsedTime(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedTime("00:00");
    }
  }, [currentWorkingRecord]);

  const fetchTodayData = async () => {
    if (!staffId) return;

    try {
      setLoading(true);
      const today = dayjs().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
      const result = await apiClient.post(`/api/hr-app/time-tracking`, { staffId, date: today });

      if (result.data.success) {
        const records = result.data.data.todayRecords || [];
        setTodayRecords(records);
        const working = records.find((r: TimeRecord) => r.status === "WORKING");
        setCurrentWorkingRecord(working || null);
        if (result.data.stats) {
          setStats(result.data.stats);
        }
      } else {
        throw new Error(result.data.error || "Lỗi lấy dữ liệu");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải dữ liệu chấm công");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const result = await apiClient.post(`/api/hr-app/time-tracking`, { staffId, action: "checkin" });
      
      if (!result.data.success) {
        throw new Error(result.data.error || "Lỗi check-in");
      }

      toast.success("Check-in thành công!");
      fetchTodayData();
    } catch (error: any) {
      toast.error(error.message || "Không thể check-in");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (recordId?: number) => {
    const targetRecordId = recordId || currentWorkingRecord?.id;
    if (!targetRecordId) return;

    try {
      setLoading(true);
      const result = await apiClient.post(`/api/hr-app/time-tracking`, { staffId, action: "checkout", recordId: targetRecordId });

      if (!result.data.success) {
        throw new Error(result.data.error || "Lỗi check-out");
      }

      toast.success("Check-out thành công!");
      setCurrentWorkingRecord(null);
      setElapsedTime("00:00");
      fetchTodayData();
    } catch (error: any) {
      toast.error(error.message || "Không thể check-out");
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
      <Card className="shadow-sm border-0 bg-orange-50/50">
        <div className="text-center space-y-4">
          {currentWorkingRecord ? (
            <>
              <div className="space-y-2">
                <div className="text-sm text-orange-600 font-semibold flex items-center justify-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse mr-1"></div> Đang làm việc
                </div>
                <div className="text-5xl font-black text-orange-700 tracking-tight">{elapsedTime}</div>
                <div className="inline-block bg-white px-3 py-1 rounded-full text-xs text-orange-500 font-medium shadow-sm">
                  Vào: {dayjs(currentWorkingRecord.checkInTime).utcOffset(7).format("HH:mm")}
                </div>
              </div>
              <Button
                type="primary"
                danger
                size="large"
                icon={<Square size={20} fill="currentColor" />}
                onClick={() => handleCheckOut()}
                loading={loading}
                block
                className="max-w-xs mx-auto h-12 text-lg font-bold rounded-xl shadow-lg shadow-red-200"
              >
                Kết thúc ca làm
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2 py-4">
                <Clock size={48} className="mx-auto text-blue-200" />
                <div className="text-lg font-medium text-gray-500">Chưa bắt đầu ca làm</div>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<Play size={20} fill="currentColor" />}
                onClick={handleCheckIn}
                loading={loading}
                block
                className="max-w-xs mx-auto h-12 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
              >
                Bắt đầu làm việc
              </Button>
            </>
          )}
        </div>
      </Card>

      <Card 
        title={<span className="flex items-center gap-2 text-gray-800 font-bold"><Clock size={18} /> Lịch sử hôm nay</span>} 
        className="shadow-sm border-0"
      >
        {todayRecords.length === 0 ? (
          <div className="py-8"><Empty description="Chưa có lịch sử làm việc hôm nay" /></div>
        ) : (
          <div className="space-y-4">
            {todayRecords.map((record, index) => {
              const checkInDisplay = dayjs(record.checkInTime).utcOffset(7).format("HH:mm:ss");
              const checkOutDisplay = record.checkOutTime ? dayjs(record.checkOutTime).utcOffset(7).format("HH:mm:ss") : "--:--:--";
              
              const checkIn = dayjs(record.checkInTime);
              let hours = record.totalHours;
              if (!hours || hours < 0) {
                if (record.checkOutTime) {
                  const checkOut = dayjs(record.checkOutTime);
                  hours = Math.abs(checkOut.diff(checkIn, "hour", true));
                } else {
                  const now = dayjs();
                  hours = Math.abs(now.diff(checkIn, "hour", true));
                }
              }
              
              const hoursInt = Math.floor(hours);
              const minutesInt = Math.floor((hours - hoursInt) * 60);
              const isWorking = record.status === "WORKING";

              return (
                <div key={record.id} className={`relative pl-6 border-l-2 ${isWorking ? 'border-orange-100' : 'border-green-100'} last:pb-0 pb-4`}>
                  <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ${isWorking ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Lần {todayRecords.length - index}</span>
                      <div className={`text-[11px] font-bold ${isWorking ? 'text-orange-600' : 'text-green-600'}`}>
                        {isWorking ? "Đang làm việc" : "Hoàn thành"}
                      </div>
                    </div>
                    <div className={`text-[11px] font-bold ${isWorking ? 'text-orange-700 bg-orange-50' : 'text-green-700 bg-green-50'} px-2 py-0.5 rounded border border-current opacity-80`}>
                      {hoursInt}h {minutesInt}m
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50/50 p-2 rounded border border-gray-100">
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Vào</div>
                      <div className={`text-xs font-bold ${isWorking ? 'text-orange-700' : 'text-gray-700'}`}>{checkInDisplay}</div>
                    </div>
                    <div className="bg-gray-50/50 p-2 rounded border border-gray-100">
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Ra</div>
                      <div className="text-xs font-bold text-gray-700">{checkOutDisplay}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
