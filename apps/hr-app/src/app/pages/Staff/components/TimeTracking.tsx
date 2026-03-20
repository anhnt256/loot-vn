import React, { useState, useEffect } from "react";
import { Card, Spin, Empty, Tag } from "antd";
import { Clock, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/vi";
import { apiClient } from "@gateway-workspace/shared/utils";

dayjs.extend(utc);
dayjs.locale("vi");

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
      const result = await apiClient.post(`/hr-app/time-tracking`, { staffId, month, year });

      if (result.data.success) {
        setHistory(result.data.data.history || []);
        setStats(result.data.data.stats || { todayHours: 0, weekHours: 0, monthHours: 0 });
      } else {
        throw new Error(result.data.error || "Lỗi lấy dữ liệu");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải dữ liệu giờ làm việc");
    } finally {
      setLoading(false);
    }
  };

  // Group history by date
  const groupedHistory = history.reduce((acc: any, record: TimeRecord) => {
    const date = dayjs(record.checkInTime).utcOffset(7).format("YYYY-MM-DD");
    if (!acc[date]) {
      acc[date] = {
        date,
        records: [],
        totalHours: 0
      };
    }
    acc[date].records.push(record);
    acc[date].totalHours += record.totalHours || 0;
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));
  const todayStr = dayjs().format("YYYY-MM-DD");

  if (loading && history.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Stats - Compact on one line */}
      <Card className="shadow-sm border-0 py-1" bodyStyle={{ padding: "8px 16px" }}>
        <div className="flex justify-between items-center text-center">
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Hôm nay</div>
            <div className="text-base font-bold text-blue-600">{stats.todayHours.toFixed(1)}h</div>
          </div>
          <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tuần này</div>
            <div className="text-base font-bold text-green-600">{stats.weekHours.toFixed(1)}h</div>
          </div>
          <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tháng này</div>
            <div className="text-base font-bold text-purple-600">{stats.monthHours.toFixed(1)}h</div>
          </div>
        </div>
      </Card>

      {/* History */}
      <Card 
        title={<span className="flex items-center gap-2 font-bold text-gray-800"><Clock size={18} /> Lịch sử làm việc</span>} 
        className="shadow-sm border-0 mt-4"
        bodyStyle={{ padding: 0 }}
        style={{ marginTop: 16 }}
      >
        {sortedDates.length === 0 ? (
          <div className="py-12"><Empty description="Chưa có dữ liệu lịch sử" /></div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedDates.map((dateKey) => {
              const group = groupedHistory[dateKey];
              const isToday = dateKey === todayStr;
              const dateDisplay = dayjs(dateKey).format("DD/MM/YYYY");
              
              return (
                <div key={dateKey} className="group">
                  <details className="w-full" open={isToday}>
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 list-none transition-colors border-b border-transparent group-open:border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isToday ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                          <span className="text-xs font-bold">{dayjs(dateKey).format("DD")}</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{isToday ? "Hôm nay" : dateDisplay}</div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                            {dayjs(dateKey).format("dddd")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <div className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-full text-xs">
                          {group.totalHours.toFixed(1)}h
                        </div>
                        <ChevronRight className="text-gray-300 group-open:rotate-90 transition-transform" size={16} />
                      </div>
                    </summary>
                    
                    <div className="p-4 px-6 space-y-4 bg-gray-50/50">
                      {[...group.records].sort((a: any, b: any) => b.id - a.id).map((record: any, index: number) => {
                        const checkInDisplay = dayjs(record.checkInTime).utcOffset(7).format("HH:mm:ss");
                        const checkOutDisplay = record.checkOutTime ? dayjs(record.checkOutTime).utcOffset(7).format("HH:mm:ss") : "--:--:--";
                        const hours = record.totalHours || 0;
                        const hoursInt = Math.floor(hours);
                        const minutesInt = Math.floor((hours - hoursInt) * 60);
                        const isWorking = record.status === "WORKING";

                        return (
                          <div key={record.id} className={`relative pl-6 border-l-2 ${isWorking ? 'border-orange-100' : 'border-green-100'} last:pb-0 pb-4`}>
                            <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ${isWorking ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Lần {group.records.length - index}</span>
                                <div className={`text-[11px] font-bold ${isWorking ? 'text-orange-600' : 'text-green-600'}`}>
                                  {isWorking ? "Đang làm việc" : "Hoàn thành"}
                                </div>
                              </div>
                              <div className={`text-[11px] font-bold ${isWorking ? 'text-orange-700 bg-orange-50' : 'text-green-700 bg-green-50'} px-2 py-0.5 rounded border border-current opacity-80`}>
                                {hoursInt}h {minutesInt}m
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Vào</div>
                                <div className={`text-xs font-bold ${isWorking ? 'text-orange-700' : 'text-gray-700'}`}>{checkInDisplay}</div>
                              </div>
                              <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Ra</div>
                                <div className="text-xs font-bold text-gray-700">{checkOutDisplay}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
