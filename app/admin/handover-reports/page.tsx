"use client"

import React, { useState, useEffect } from "react";
import { Calendar, Search, Download } from "lucide-react";

interface MaterialReport {
  id: number;
  materialName: string;
  materialType: string;
  morning: {
    beginning: number;
    received: number;
    issued: number;
    ending: number;
  };
  afternoon: {
    beginning: number;
    received: number;
    issued: number;
    ending: number;
  };
  evening: {
    beginning: number;
    received: number;
    issued: number;
    ending: number;
  };
}

interface HandoverReport {
  id: number;
  date: string;
  shift: string;
  reportType: string;
  note?: string;
  staffName: string;
  materials: MaterialReport[];
}

const mockData: MaterialReport[] = [
  {
    id: 1,
    materialName: "Mì",
    materialType: "NGUYEN_VAT_LIEU",
    morning: { beginning: 50, received: 20, issued: 15, ending: 55 },
    afternoon: { beginning: 55, received: 10, issued: 25, ending: 40 },
    evening: { beginning: 40, received: 5, issued: 12, ending: 33 },
  },
  {
    id: 2,
    materialName: "Khoai tây",
    materialType: "NGUYEN_VAT_LIEU",
    morning: { beginning: 30, received: 15, issued: 10, ending: 35 },
    afternoon: { beginning: 35, received: 8, issued: 18, ending: 25 },
    evening: { beginning: 25, received: 3, issued: 8, ending: 20 },
  },
  {
    id: 3,
    materialName: "Chả cá",
    materialType: "NGUYEN_VAT_LIEU",
    morning: { beginning: 25, received: 12, issued: 8, ending: 29 },
    afternoon: { beginning: 29, received: 6, issued: 15, ending: 20 },
    evening: { beginning: 20, received: 2, issued: 6, ending: 16 },
  },
  {
    id: 4,
    materialName: "Bò",
    materialType: "NGUYEN_VAT_LIEU",
    morning: { beginning: 40, received: 18, issued: 12, ending: 46 },
    afternoon: { beginning: 46, received: 9, issued: 22, ending: 33 },
    evening: { beginning: 33, received: 4, issued: 10, ending: 27 },
  },
  {
    id: 5,
    materialName: "Ba rọi",
    materialType: "NGUYEN_VAT_LIEU",
    morning: { beginning: 35, received: 14, issued: 9, ending: 40 },
    afternoon: { beginning: 40, received: 7, issued: 19, ending: 28 },
    evening: { beginning: 28, received: 3, issued: 8, ending: 23 },
  },
];

const shifts = ["Tất cả", "Sáng", "Chiều", "Tối"];
const reportTypes = ["Báo cáo bếp", "Báo cáo nước"];

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, index) => (
      <tr key={index} className="border border-gray-300">
        <td className="border border-gray-300 px-2 py-2">
          <div className="h-4 bg-gray-200 rounded"></div>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <div className="h-4 bg-gray-200 rounded"></div>
        </td>
        {[...Array(13)].map((_, cellIndex) => (
          <td key={cellIndex} className="border border-gray-300 px-2 py-2">
            <div className="h-4 bg-gray-200 rounded"></div>
          </td>
        ))}
      </tr>
    ))}
  </div>
);

export default function HandoverReportsPage() {
  const [timeRange, setTimeRange] = useState("");
  const [selectedShift, setSelectedShift] = useState("Tất cả");
  const [selectedEmployee, setSelectedEmployee] = useState("Tất cả");
  const [selectedReportType, setSelectedReportType] = useState("Báo cáo bếp");
  const [reports, setReports] = useState<HandoverReport[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      const result = await response.json();
      
      if (result.success) {
        setStaffList(result.data);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (timeRange) params.append("date", timeRange);
      if (selectedShift !== "Tất cả") params.append("shift", selectedShift);
      if (selectedEmployee !== "Tất cả") params.append("employee", selectedEmployee);
      if (selectedReportType) params.append("reportType", selectedReportType);

      const response = await fetch(`/api/handover-reports?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setReports(result.data);
      } else {
        console.error("Failed to fetch reports:", result.error);
        // Fallback to mock data structure
        setReports([{
          id: 1,
          date: new Date().toISOString(),
          shift: "SANG",
          reportType: "BAO_CAO_BEP",
          staffName: "Mock Staff",
          materials: mockData
        }]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      // Fallback to mock data structure
      setReports([{
        id: 1,
        date: new Date().toISOString(),
        shift: "SANG",
        reportType: "BAO_CAO_BEP",
        staffName: "Mock Staff",
        materials: mockData
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchReports();
  }, []);

  const handleSearch = () => {
    fetchReports();
  };

  const handleExportPDF = () => {
    // Implement PDF export
    console.log("Exporting PDF...");
  };

  const handleExportExcel = () => {
    // Implement Excel export
    console.log("Exporting Excel...");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quản lý báo cáo</h1>
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Bộ lọc tìm kiếm
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Time Range */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Shift */}
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {shifts.map((shift) => (
              <option key={shift} value={shift}>
                {shift}
              </option>
            ))}
          </select>

          {/* Employee */}
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Tất cả">Tất cả</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.userName}>
                {staff.userName}
              </option>
            ))}
          </select>

          {/* Report Type */}
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {reportTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4 mr-2" />
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </div>
      </div>

      {/* Report Display Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            BÁO CÁO HÀNG NGÀY - BẾP
          </h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleExportPDF}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              Xuất PDF
            </button>
            <button
              onClick={handleExportExcel}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">
                  STT
                </th>
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">
                  Nguyên vật liệu
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold" colSpan={4}>
                  Số lượng ca sáng
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold" colSpan={4}>
                  Số lượng ca chiều
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold" colSpan={4}>
                  Số lượng ca tối
                </th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-2 py-2"></th>
                <th className="border border-gray-300 px-2 py-2"></th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Tồn đầu
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Nhập
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Xuất
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Tồn cuối
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Tồn đầu
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Nhập
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Xuất
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Tồn cuối
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Tồn đầu
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Nhập
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Xuất
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center text-xs">
                  Tồn cuối
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingSkeleton />
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                reports.flatMap((report, reportIndex) => 
                  report.materials.map((material, materialIndex) => (
                    <tr key={`${report.id}-${material.id}`} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {reportIndex * report.materials.length + materialIndex + 1}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 font-medium">
                        {material.materialName}
                      </td>
                      {/* Morning Shift */}
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.morning.beginning}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.morning.received}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.morning.issued}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.morning.ending}
                      </td>
                      {/* Afternoon Shift */}
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.afternoon.beginning}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.afternoon.received}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.afternoon.issued}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.afternoon.ending}
                      </td>
                      {/* Evening Shift */}
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.evening.beginning}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.evening.received}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.evening.issued}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.evening.ending}
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 