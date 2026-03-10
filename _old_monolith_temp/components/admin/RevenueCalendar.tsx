"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Spin, Tooltip, Modal } from "antd";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ShiftData {
  shift: string;
  totalFood?: number;
  gamingRevenue?: number;
  deduction?: number;
  actualMoney?: number; // totalFood + gamingRevenue - deduction
  momoRevenue?: number;
  handoverAmount: number;
  actualShiftRevenue: number;
  confirmedHeldAmount: number;
  difference: number;
}

interface DayData {
  date: string;
  totalHandover: number; // from WorkShiftRevenueReport (display on calendar)
  totalActualMoney?: number; // totalFood + gamingRevenue - deduction (per day)
  totalMomo?: number;
  totalActual: number;
  totalConfirmedHeld: number;
  managerAmount: number; // from ManagerIncomeExpense
  difference: number;
  hasAlert: boolean; // true when managerAmount != totalHandover
  shifts: ShiftData[];
}

interface CalendarData {
  year: number;
  month: number;
  branch: string;
  startDate: string;
  endDate: string;
  days: DayData[];
  summary: {
    totalDays: number;
    daysWithData: number;
    alertCount: number;
    totalMonthHandover: number;
    totalMonthActualMoney?: number;
    totalMonthMomo?: number;
    totalMonthActual: number;
    totalMonthDifference: number;
  };
}

const WEEKDAY_NAMES = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "CN",
];
const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const SHIFT_NAMES: Record<string, string> = {
  MORNING: "Sáng",
  AFTERNOON: "Chiều",
  EVENING: "Tối",
};

function formatMoney(amount: number): string {
  if (amount === 0) return "-";
  // Format as x.xxx (thousands)
  const thousands = Math.round(amount / 1000);
  return thousands.toLocaleString("vi-VN");
}

function formatFullMoney(amount: number): string {
  return amount.toLocaleString("vi-VN") + " đ";
}

export default function RevenueCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showActualVsHandover, setShowActualVsHandover] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/fraud-alerts/revenue-calendar?year=${year}&month=${month}`,
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to fetch");
      setCalendarData(data.data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Build calendar grid
  const buildCalendarGrid = () => {
    if (!calendarData) return [];

    const firstDayOfMonth = new Date(year, month - 1, 1);
    // JS: 0=Sunday, we want 0=Monday
    let startWeekday = firstDayOfMonth.getDay() - 1;
    if (startWeekday < 0) startWeekday = 6;

    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const grid: (DayData | null)[] = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startWeekday; i++) {
      grid.push(null);
    }

    // Add days of the month
    for (let d = 1; d <= lastDayOfMonth; d++) {
      const dayData = calendarData.days.find((day) => {
        const dayNum = parseInt(day.date.slice(-2));
        return dayNum === d;
      });
      grid.push(dayData || null);
    }

    return grid;
  };

  const handleDayClick = (day: DayData | null) => {
    if (day && day.shifts.length > 0) {
      setSelectedDay(day);
      setIsModalOpen(true);
    }
  };

  const grid = buildCalendarGrid();

  // Split into weeks
  const weeks: (DayData | null)[][] = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  const isToday = (day: DayData | null) => {
    if (!day) return false;
    const todayStr = today.toISOString().slice(0, 10);
    return day.date === todayStr;
  };

  return (
    <div className="space-y-4">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ChevronLeft className="w-5 h-5" />}
            onClick={goToPreviousMonth}
            className="!text-white hover:!bg-white/10"
          />
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg text-black font-bold">
              {String(month).padStart(2, "0")}/{year}
            </div>
          </div>
          <Button
            type="text"
            icon={<ChevronRight className="w-5 h-5" />}
            onClick={goToNextMonth}
            className="!text-white hover:!bg-white/10"
          />
        </div>

        {calendarData && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">
                Tổng tiền bàn giao:{" "}
                <span className="text-white font-medium">
                  {formatFullMoney(calendarData.summary.totalMonthHandover)}
                </span>
              </span>
              {showActualVsHandover &&
                typeof calendarData.summary.totalMonthActualMoney ===
                  "number" && (
                  <span className="text-gray-400">
                    Tổng tiền thực tế:{" "}
                    <span className="text-amber-300 font-medium">
                      {formatFullMoney(
                        calendarData.summary.totalMonthActualMoney,
                      )}
                    </span>
                  </span>
                )}
              {typeof calendarData.summary.totalMonthMomo === "number" && (
                <span className="text-gray-400">
                  Tổng tiền Momo:{" "}
                  <span className="text-pink-300 font-medium">
                    {formatFullMoney(calendarData.summary.totalMonthMomo)}
                  </span>
                </span>
              )}
              {calendarData.summary.alertCount > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  {calendarData.summary.alertCount} ngày cảnh báo
                </span>
              )}
            </div>
            <Button
              type={showActualVsHandover ? "primary" : "default"}
              size="small"
              onClick={() => setShowActualVsHandover((v) => !v)}
              className={
                showActualVsHandover
                  ? "!bg-amber-600 hover:!bg-amber-700"
                  : "!text-white !border !border-white !bg-white/20 hover:!bg-white/30"
              }
            >
              {showActualVsHandover ? "Ẩn" : "Xem"} tiền thực tế vs bàn giao
            </Button>
          </div>
        )}
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 bg-gray-100 border-b">
            {WEEKDAY_NAMES.map((name, i) => (
              <div
                key={i}
                className={`py-3 text-center font-semibold text-sm ${
                  i === 6 ? "text-red-500" : "text-gray-700"
                }`}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="divide-y">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 divide-x">
                {week.map((day, dayIndex) => {
                  const dayNum = day
                    ? parseInt(day.date.slice(-2))
                    : weekIndex * 7 +
                      dayIndex +
                      1 -
                      (buildCalendarGrid().findIndex((d) => d !== null) || 0);

                  const isEmptyCell =
                    !day ||
                    dayNum < 1 ||
                    dayNum > new Date(year, month, 0).getDate();
                  const isSunday = dayIndex === 6;
                  const hasData = day && day.shifts.length > 0;
                  const hasAlert = day?.hasAlert;

                  // Determine background color
                  let bgClass = "bg-white hover:bg-gray-50";
                  if (isToday(day)) {
                    bgClass = "bg-red-50";
                  } else if (hasAlert) {
                    bgClass = "bg-red-100 hover:bg-red-200";
                  } else if (hasData && !hasAlert) {
                    bgClass = "bg-green-50 hover:bg-green-100";
                  }

                  return (
                    <div
                      key={dayIndex}
                      className={`min-h-[90px] p-2 transition-colors cursor-pointer ${bgClass} ${
                        isEmptyCell ? "bg-gray-50" : ""
                      }`}
                      onClick={() => handleDayClick(day)}
                    >
                      {!isEmptyCell && day && (
                        <>
                          {/* Day number */}
                          <div
                            className={`text-sm font-medium mb-1 ${
                              isSunday ? "text-red-500" : "text-gray-700"
                            } ${isToday(day) ? "font-bold" : ""}`}
                          >
                            {parseInt(day.date.slice(-2))}
                          </div>

                          {/* Amount: show WorkShiftRevenueReport handover / actual money on calendar */}
                          {hasData && (
                            <Tooltip
                              title={
                                <div className="text-xs">
                                  <div className="font-medium text-gray-200">
                                    WorkShiftRevenueReport:
                                  </div>
                                  <div>
                                    Tiền thực tế
                                    (food+game−deduction−incidental):{" "}
                                    {formatFullMoney(day.totalActualMoney ?? 0)}
                                  </div>
                                  <div>
                                    Momo: {formatFullMoney(day.totalMomo ?? 0)}
                                  </div>
                                  <div>
                                    Cần bàn giao (handover):{" "}
                                    {formatFullMoney(day.totalHandover)}
                                  </div>
                                  <div>
                                    Thực tế (actualShiftRevenue):{" "}
                                    {formatFullMoney(day.totalActual)}
                                  </div>
                                  <div>
                                    Giữ lại:{" "}
                                    {formatFullMoney(day.totalConfirmedHeld)}
                                  </div>
                                  <div className="mt-1 font-medium text-gray-200">
                                    ManagerIncomeExpense:
                                  </div>
                                  <div>
                                    Sổ quản lý (amount):{" "}
                                    {formatFullMoney(day.managerAmount)}
                                  </div>
                                  {hasAlert && (
                                    <div className="mt-1 text-red-300 font-medium">
                                      Lệch:{" "}
                                      {formatFullMoney(
                                        day.managerAmount - day.totalHandover,
                                      )}
                                    </div>
                                  )}
                                </div>
                              }
                            >
                              <div className="text-center whitespace-nowrap">
                                {showActualVsHandover ? (
                                  <>
                                    <div className="text-sm font-semibold text-amber-600">
                                      {formatMoney(day.totalActualMoney ?? 0)}
                                      <span className="text-xs font-normal text-gray-500">
                                        {" "}
                                        000 đ (thực tế)
                                      </span>
                                    </div>
                                    <div
                                      className={`text-sm font-bold ${hasAlert ? "text-red-600" : "text-green-600"}`}
                                    >
                                      {formatMoney(day.totalHandover)}
                                      <span className="text-xs font-normal text-gray-500">
                                        {" "}
                                        000 đ (bàn giao)
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <span
                                      className={`text-lg font-bold ${
                                        hasAlert
                                          ? "text-red-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {formatMoney(day.totalHandover)}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-0.5">
                                      000 đ (bàn giao)
                                    </span>
                                  </>
                                )}
                              </div>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-50 border border-green-200"></div>
          <span>
            Khớp (ManagerIncomeExpense = WorkShiftRevenueReport handover)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
          <span>Lệch (sổ quản lý ≠ tiền bàn giao)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border border-gray-200"></div>
          <span>Chưa có dữ liệu</span>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span>Chi tiết ngày {selectedDay?.date}</span>
            {selectedDay?.hasAlert && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedDay && (
          <div className="space-y-4">
            {/* Summary: WorkShiftRevenueReport + ManagerIncomeExpense */}
            {/* Tiền thực tế vs Tiền bàn giao (totalFood + gameRevenue - deduction vs handover) */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div>
                <div className="text-xs text-gray-600">
                  Tiền thực tế (totalFood + gameRevenue − deduction −
                  incidentalAmount)
                </div>
                <div className="text-lg font-bold text-amber-700">
                  {formatFullMoney(selectedDay.totalActualMoney ?? 0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">
                  Momo (tổng theo ngày)
                </div>
                <div className="text-lg font-bold text-pink-600">
                  {formatFullMoney(selectedDay.totalMomo ?? 0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">
                  Tiền bàn giao (handover)
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {formatFullMoney(selectedDay.totalHandover)}
                </div>
              </div>
              <div className="col-span-3">
                <div className="text-xs text-gray-500">
                  Chênh (thực tế − bàn giao)
                </div>
                <div
                  className={`text-lg font-bold ${(selectedDay.totalActualMoney ?? 0) - selectedDay.totalHandover !== 0 ? "text-orange-600" : "text-gray-600"}`}
                >
                  {formatFullMoney(
                    (selectedDay.totalActualMoney ?? 0) -
                      selectedDay.totalHandover,
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-xs text-gray-500">
                  ManagerIncomeExpense – Sổ quản lý (amount)
                </div>
                <div
                  className={`text-lg font-bold ${
                    selectedDay.hasAlert ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatFullMoney(selectedDay.managerAmount)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">
                  Lệch (sổ quản lý − bàn giao)
                </div>
                <div
                  className={`text-lg font-bold ${
                    selectedDay.hasAlert ? "text-red-600" : "text-gray-600"
                  }`}
                >
                  {formatFullMoney(
                    selectedDay.managerAmount - selectedDay.totalHandover,
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-xs text-gray-500">
                  Thực tế (actualShiftRevenue)
                </div>
                <div className="text-lg font-bold text-green-600">
                  {formatFullMoney(selectedDay.totalActual)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">
                  Giữ lại (confirmedHeldAmount)
                </div>
                <div className="text-lg font-bold text-gray-600">
                  {formatFullMoney(selectedDay.totalConfirmedHeld)}
                </div>
              </div>
            </div>

            {/* Shift details */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Chi tiết theo ca</h4>
              <div className="divide-y border rounded-lg">
                {selectedDay.shifts.map((shift) => (
                  <div
                    key={shift.shift}
                    className={`p-3 ${Math.abs(shift.difference) > 1000 ? "bg-red-50" : ""}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {SHIFT_NAMES[shift.shift] || shift.shift}
                      </span>
                      {Math.abs(shift.difference) > 1000 && (
                        <span className="text-xs text-red-500 font-medium">
                          Lệch {formatFullMoney(shift.difference)}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-gray-500">
                          Tiền thực tế (food+game−deduction−incidental):{" "}
                        </span>
                        <span className="font-medium text-amber-700">
                          {formatFullMoney(shift.actualMoney ?? 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Momo: </span>
                        <span className="font-medium text-pink-600">
                          {formatFullMoney(shift.momoRevenue ?? 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Bàn giao: </span>
                        <span className="font-medium">
                          {formatFullMoney(shift.handoverAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">
                          actualShiftRevenue:{" "}
                        </span>
                        <span className="font-medium">
                          {formatFullMoney(shift.actualShiftRevenue)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Giữ lại: </span>
                        <span className="font-medium">
                          {formatFullMoney(shift.confirmedHeldAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
