"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Calculator, ChevronDown } from "lucide-react";

interface AnomalyData {
  shift: string;
  totalFood: number;
  deduction: number;
  actualFoodRevenue: number;
  playtime: number;
  actualShiftRevenue: number;
  momo: number;
  incidental: number;
  handoverMoney: number;
}

interface DailyAnomalyData {
  date: string;
  shifts: {
    Sáng: AnomalyData | null;
    Chiều: AnomalyData | null;
    Tối: AnomalyData | null;
  };
  totals: {
    totalFood: number;
    deduction: number;
    actualFoodRevenue: number;
    playtime: number;
    actualShiftRevenue: number;
    momo: number;
    incidental: number;
    handoverMoney: number;
  };
}

const shifts = ["Sáng", "Chiều", "Tối"];

export default function AnomalyPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(false);
  const [anomalyData, setAnomalyData] = useState<DailyAnomalyData | null>(null);

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format number with Vietnamese thousands separator
  const formatNumber = (num: number) => {
    return num.toLocaleString("vi-VN");
  };

  // Fetch anomaly data (placeholder - will be connected to API later)
  const fetchAnomalyData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/anomaly?date=${selectedDate}`);
      // const data = await response.json();
      
      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const mockData: DailyAnomalyData = {
        date: selectedDate,
        shifts: {
          Sáng: {
            shift: "Sáng",
            totalFood: 304000,
            deduction: 170000,
            actualFoodRevenue: 94000,
            playtime: 955000,
            actualShiftRevenue: 1049000,
            momo: 233000,
            incidental: 17000,
            handoverMoney: 799000,
          },
          Chiều: {
            shift: "Chiều",
            totalFood: 427000,
            deduction: 126000,
            actualFoodRevenue: 341000,
            playtime: 840000,
            actualShiftRevenue: 1181000,
            momo: 326000,
            incidental: 0,
            handoverMoney: 855000,
          },
          Tối: {
            shift: "Tối",
            totalFood: 79000,
            deduction: 17000,
            actualFoodRevenue: 62000,
            playtime: 320000,
            actualShiftRevenue: 382000,
            momo: 50000,
            incidental: 0,
            handoverMoney: 332000,
          },
        },
        totals: {
          totalFood: 810000,
          deduction: 313000,
          actualFoodRevenue: 497000,
          playtime: 2115000,
          actualShiftRevenue: 2612000,
          momo: 609000,
          incidental: 17000,
          handoverMoney: 1986000,
        },
      };
      
      setAnomalyData(mockData);
    } catch (error) {
      console.error("Error fetching anomaly data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalyData();
  }, [selectedDate]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Cảnh báo giao dịch bất thường
          </h1>
          <p className="text-sm text-gray-600">
            Theo dõi và phát hiện các giao dịch bất thường theo từng ca
          </p>
        </div>

        {/* Date Picker Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <label
                htmlFor="date-input"
                className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium cursor-pointer hover:bg-green-800 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                <span>Ngày {formatDisplayDate(selectedDate)}</span>
                <ChevronDown className="w-4 h-4 ml-auto" />
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                id="date-input"
              />
            </div>
            <button
              onClick={() => {
                // TODO: Add calculator functionality
                console.log("Calculator clicked");
              }}
              className="flex items-center justify-center w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
            >
              <Calculator className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              {/* Table Header */}
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="px-4 py-3 text-left font-semibold text-sm">
                    Ca
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-sm">
                    <div className="flex items-center justify-end gap-1">
                      <span># Tổng Food</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-sm">
                    <div className="flex items-center justify-end gap-1">
                      <span># Cấn trừ</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-sm">
                    <div className="flex items-center justify-end gap-1">
                      <span># Thực thu Ffood</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-sm">
                    <div className="flex items-center justify-end gap-1">
                      <span># Giờ chơi</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-sm">
                    <div className="flex items-center justify-end gap-1">
                      <span># Thực thu ca</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-sm">
                    <div className="flex items-center justify-end gap-1">
                      <span># Momo</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-sm">
                    <div className="flex items-center justify-end gap-1">
                      <span># Phát sinh</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-sm">
                    <div className="flex items-center justify-end gap-1">
                      <span># Tiền bàn giao</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : !anomalyData ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  <>
                    {/* Shift Rows */}
                    {shifts.map((shift) => {
                      const shiftData = anomalyData.shifts[shift as keyof typeof anomalyData.shifts];
                      if (!shiftData) return null;

                      return (
                        <tr
                          key={shift}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {shift}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-mono text-gray-700">
                            {formatNumber(shiftData.totalFood)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-mono text-gray-700">
                            {formatNumber(shiftData.deduction)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-mono text-gray-700">
                            {formatNumber(shiftData.actualFoodRevenue)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-mono text-gray-700">
                            {formatNumber(shiftData.playtime)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-mono text-gray-700">
                            {formatNumber(shiftData.actualShiftRevenue)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-mono text-gray-700">
                            {formatNumber(shiftData.momo)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-mono text-gray-700">
                            {shiftData.incidental > 0 ? formatNumber(shiftData.incidental) : ""}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-mono text-gray-700">
                            {formatNumber(shiftData.handoverMoney)}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Total Row */}
                    <tr className="bg-gray-100 border-t-2 border-gray-300">
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        Tổng
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-mono font-semibold text-gray-900">
                        {formatNumber(anomalyData.totals.totalFood)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-mono font-semibold text-gray-900">
                        {formatNumber(anomalyData.totals.deduction)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-mono font-semibold text-gray-900">
                        {formatNumber(anomalyData.totals.actualFoodRevenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-mono font-semibold text-gray-900">
                        {formatNumber(anomalyData.totals.playtime)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-mono font-bold text-blue-600">
                        {formatNumber(anomalyData.totals.actualShiftRevenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-mono font-bold text-orange-600">
                        {formatNumber(anomalyData.totals.momo)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-mono font-bold text-red-600">
                        {formatNumber(anomalyData.totals.incidental)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-mono font-bold text-green-600">
                        {formatNumber(anomalyData.totals.handoverMoney)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-blue-600 mt-0.5">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Ghi chú về cảnh báo
              </h3>
              <p className="text-sm text-blue-800">
                Các giao dịch được đánh dấu là bất thường khi có sự chênh lệch lớn so với
                mức trung bình hoặc có dấu hiệu không nhất quán giữa các chỉ số.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
