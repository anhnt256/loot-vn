import React, { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import { useUser } from '../contexts/UserContext';

interface CheckInDay {
  date: string;
  rewards: number;
  status: 'available' | 'expired' | 'checked' | 'coming';
}

interface Props {
  refreshKey?: number;
}

const STATUS_STYLE: Record<CheckInDay['status'], { bg: string; text: string; dot: string }> = {
  expired:   { bg: 'bg-pink-200 border border-pink-300',                                                         text: 'text-pink-900',   dot: 'bg-pink-400' },
  checked:   { bg: 'bg-green-200 border-2 border-green-400',                                                     text: 'text-green-900',  dot: 'bg-green-500' },
  available: { bg: '',                                                                                           text: 'text-white',      dot: 'bg-gradient-to-r from-indigo-600 to-pink-600' },
  coming:    { bg: 'bg-[#FEF3C7] border border-[#FDE68A]',                                                      text: 'text-amber-900',  dot: 'bg-amber-300' },
};

const CheckInCalendar: React.FC<Props> = ({ refreshKey }) => {
  const { user } = useUser();
  const [days, setDays] = useState<CheckInDay[]>([]);
  const [totalRewards, setTotalRewards] = useState(0);
  const [loading, setLoading] = useState(true);

  const createDaysOfMonth = useCallback((history: any[]): CheckInDay[] => {
    const year = dayjs().year();
    const month = dayjs().month() + 1;
    const daysInMonth = dayjs(new Date(year, month, 0)).date();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = dayjs(new Date(year, month - 1, day)).format('YYYY-MM-DD');
      const hits = history.filter(
        (item) => dayjs(item.createdAt).format('YYYY-MM-DD') === dateStr
      );

      if (hits.length === 0) {
        const isPast  = dayjs(dateStr).isBefore(dayjs(), 'day');
        const isToday = dayjs(dateStr).isSame(dayjs(), 'day');
        return {
          date: String(day),
          rewards: 0,
          status: isToday ? 'available' : isPast ? 'expired' : 'coming',
        };
      }

      const rewards = hits.reduce(
        (acc, item) => acc + ((item.newStars ?? 0) - (item.oldStars ?? 0)),
        0
      );
      return { date: String(day), rewards, status: 'checked' };
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const userId = user?.userId || user?.id;

      if (!userId) {
        setDays(createDaysOfMonth([]));
        setLoading(false);
        return;
      }

      try {
        const res = await apiClient.get(`/dashboard/check-in-result/${userId}`);
        const history = res.data || [];
        setDays(createDaysOfMonth(history));
        setTotalRewards(
          history.reduce(
            (acc: number, item: any) => acc + ((item.newStars ?? 0) - (item.oldStars ?? 0)),
            0
          )
        );
      } catch {
        setDays(createDaysOfMonth([]));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [createDaysOfMonth, refreshKey, user]);

  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-gray-300 font-semibold text-sm">
          Lịch điểm danh tháng {new Date().getMonth() + 1}
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-400 text-sm font-semibold">
            Tổng nhận: {totalRewards.toLocaleString()} ⭐
          </span>
        </div>
      </div>

      {/* Grid + Legend wrapper */}
      <div className="relative flex-1">
        <div className="grid grid-cols-7 gap-1.5 h-full">
          {days.map((day) => {
            const s = STATUS_STYLE[day.status];
            return (
              <div
                key={day.date}
                className={`rounded-lg p-2 flex flex-col items-center justify-center gap-1 ${s.bg} transition-all duration-200`}
                style={day.status === 'available' ? {
                  background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                  boxShadow: '0 0 16px color-mix(in srgb, var(--primary-color) 40%, transparent)',
                } : undefined}
              >
                <span className={`font-gaming font-bold text-lg leading-none ${s.text}`}>
                  {day.date}
                </span>
                <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${s.text}`}>
                  {day.rewards > 0 ? day.rewards.toLocaleString() : '0'} ⭐
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend — floats over the empty cells in the last row */}
        <div className="absolute bottom-0 right-0 flex flex-col items-end gap-1 pb-1 pr-1">
          {([
            ['expired',   'Đã quá hạn'],
            ['checked',   'Đã điểm danh'],
            ['available', 'Có thể điểm danh'],
            ['coming',    'Sắp mở'],
          ] as [CheckInDay['status'], string][]).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${STATUS_STYLE[status].dot}`}
                style={status === 'available' ? {
                  background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))',
                } : undefined}
              />
              <span className="text-gray-400 text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheckInCalendar;
