"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Search, Download, Package, Send } from "lucide-react";
import Cookies from "js-cookie";
import {
  SHIFT_ENUM,
  REPORT_TYPE_ENUM,
  BRANCH_ENUM,
  SHIFT_LABELS,
  REPORT_TYPE_LABELS,
  BRANCH_LABELS,
} from "@/constants/handover-reports.constants";
import MaterialManagementDrawer from "./_components/material-management-drawer";
import SendReportDrawer from "./_components/send-report-drawer";

interface MaterialReport {
  id: number;
  materialName: string;
  materialType: string;
  morning: {
    beginning: number;
    received: number;
    issued: number;
    ending: number;
    staffId?: number;
  };
  afternoon: {
    beginning: number;
    received: number;
    issued: number;
    ending: number;
    staffId?: number;
  };
  evening: {
    beginning: number;
    received: number;
    issued: number;
    ending: number;
    staffId?: number;
  };
}

interface HandoverReport {
  id: number;
  date: string;
  reportType: string;
  note?: string;
  materials: MaterialReport[];
}

const reportTypes = Object.values(REPORT_TYPE_ENUM);
const branches = Object.values(BRANCH_ENUM);

const LoadingSkeleton = () => (
  <>
    {[...Array(8)].map((_, index) => (
      <tr key={index} className="border border-gray-300">
        <td className="border border-gray-300 px-2 py-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        {[...Array(12)].map((_, cellIndex) => (
          <td key={cellIndex} className="border border-gray-300 px-2 py-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </td>
        ))}
      </tr>
    ))}
  </>
);

export default function HandoverReportsPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedReportType, setSelectedReportType] = useState("BAO_CAO_BEP");
  const [selectedBranch, setSelectedBranch] = useState("GO_VAP");
  const [reports, setReports] = useState<HandoverReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isMaterialDrawerOpen, setIsMaterialDrawerOpen] = useState(false);
  const [isSendReportDrawerOpen, setIsSendReportDrawerOpen] = useState(false);
  const [loginType, setLoginType] = useState(
    Cookies.get("loginType") || "username",
  );

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);
      if (selectedReportType) params.append("reportType", selectedReportType);
      if (selectedBranch) params.append("branch", selectedBranch);

      const response = await fetch(
        `/api/handover-reports?${params.toString()}`,
      );
      const result = await response.json();

      if (result.success) {
        console.log("Reports data:", result.data);
        setReports(result.data);
      } else {
        console.error("Failed to fetch reports:", result.error);
        setReports([]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    const branch = Cookies.get("branch");
    if (branch) {
      setSelectedBranch(branch);
    }
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchReports();
    }
  }, [selectedBranch, selectedDate, selectedReportType]);

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value);
    Cookies.set("branch", value, { path: "/" });
  };

  const handleSearch = () => {
    if (selectedBranch && selectedDate && selectedReportType) {
      fetchReports();
    }
  };

  const handleOpenMaterialManagement = () => {
    setIsMaterialDrawerOpen(true);
  };

  const handleCloseMaterialDrawer = () => {
    setIsMaterialDrawerOpen(false);
  };

  const handleOpenSendReport = () => {
    setIsSendReportDrawerOpen(true);
  };

  const handleCloseSendReportDrawer = () => {
    setIsSendReportDrawerOpen(false);
  };

  // Function to check data consistency and return validation errors
  const validateMaterialData = (material: MaterialReport) => {
    const errors: { [key: string]: boolean } = {};

    // Check morning shift: beginning + received - issued should equal ending
    const morningCalculated =
      material.morning.beginning +
      material.morning.received -
      material.morning.issued;
    if (Math.abs(morningCalculated - material.morning.ending) > 0.01) {
      errors.morningEnding = true;
    }

    // Check afternoon shift: beginning + received - issued should equal ending
    const afternoonCalculated =
      material.afternoon.beginning +
      material.afternoon.received -
      material.afternoon.issued;
    if (Math.abs(afternoonCalculated - material.afternoon.ending) > 0.01) {
      errors.afternoonEnding = true;
    }

    // Check evening shift: beginning + received - issued should equal ending
    const eveningCalculated =
      material.evening.beginning +
      material.evening.received -
      material.evening.issued;
    if (Math.abs(eveningCalculated - material.evening.ending) > 0.01) {
      errors.eveningEnding = true;
    }

    // Check shift continuity: morning ending should equal afternoon beginning
    // Only check if afternoon shift has data (beginning > 0 or received > 0 or issued > 0 or ending > 0)
    const afternoonHasData =
      material.afternoon.beginning > 0 ||
      material.afternoon.received > 0 ||
      material.afternoon.issued > 0 ||
      material.afternoon.ending > 0;
    if (
      afternoonHasData &&
      Math.abs(material.morning.ending - material.afternoon.beginning) > 0.01
    ) {
      errors.afternoonBeginning = true;
      errors.morningEnding = true;
    }

    // Check shift continuity: afternoon ending should equal evening beginning
    // Only check if evening shift has data (beginning > 0 or received > 0 or issued > 0 or ending > 0)
    const eveningHasData =
      material.evening.beginning > 0 ||
      material.evening.received > 0 ||
      material.evening.issued > 0 ||
      material.evening.ending > 0;
    if (
      eveningHasData &&
      Math.abs(material.afternoon.ending - material.evening.beginning) > 0.01
    ) {
      errors.eveningBeginning = true;
      errors.afternoonEnding = true;
    }

    return errors;
  };

  // Function to get cell styling based on validation errors
  const getCellStyle = (material: MaterialReport, field: string) => {
    const errors = validateMaterialData(material);
    return errors[field] ? "text-red-600 font-semibold" : "";
  };

  // Function to get error details for tooltip
  const getErrorDetails = (material: MaterialReport, field: string) => {
    const errors = validateMaterialData(material);
    if (!errors[field]) return null;

    const errorMessages: { [key: string]: string } = {
      morningEnding: `Tồn cuối sáng (${material.morning.ending}) ≠ Tồn đầu (${material.morning.beginning}) + Nhập (${material.morning.received}) - Xuất (${material.morning.issued}) = ${material.morning.beginning + material.morning.received - material.morning.issued}`,
      afternoonBeginning: `Tồn đầu chiều (${material.afternoon.beginning}) ≠ Tồn cuối sáng (${material.morning.ending})`,
      afternoonEnding: `Tồn cuối chiều (${material.afternoon.ending}) ≠ Tồn đầu (${material.afternoon.beginning}) + Nhập (${material.afternoon.received}) - Xuất (${material.afternoon.issued}) = ${material.afternoon.beginning + material.afternoon.received - material.afternoon.issued}`,
      eveningBeginning: `Tồn đầu tối (${material.evening.beginning}) ≠ Tồn cuối chiều (${material.afternoon.ending})`,
      eveningEnding: `Tồn cuối tối (${material.evening.ending}) ≠ Tồn đầu (${material.evening.beginning}) + Nhập (${material.evening.received}) - Xuất (${material.evening.issued}) = ${material.evening.beginning + material.evening.received - material.evening.issued}`,
    };

    return errorMessages[field];
  };

  // Function to count total errors across all materials
  const getTotalErrors = () => {
    let totalErrors = 0;
    reports.forEach((report) => {
      report.materials.forEach((material) => {
        const errors = validateMaterialData(material);
        totalErrors += Object.keys(errors).length;
      });
    });
    return totalErrors;
  };

  return (
    <div className="p-2 lg:p-4 space-y-3">
      {/* Filter Section - Moved to top */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3 gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Báo cáo hằng ngày -{" "}
            {selectedReportType === "BAO_CAO_BEP" ? "Bếp" : "Nước"}
          </h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleOpenMaterialManagement}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Package className="w-4 h-4 mr-2" />
              Quản lý Nguyên vật liệu
            </button>
            <button
              onClick={handleOpenSendReport}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              Gửi báo cáo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Branch */}
          <select
            value={selectedBranch}
            onChange={(e) => handleBranchChange(e.target.value)}
            required
            disabled={loginType === "mac"}
            className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              loginType === "mac"
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : ""
            }`}
          >
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {BRANCH_LABELS[branch]}
              </option>
            ))}
          </select>

          {/* Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Report Type */}
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {reportTypes.map((type) => (
              <option key={type} value={type}>
                {REPORT_TYPE_LABELS[type as keyof typeof REPORT_TYPE_LABELS]}
              </option>
            ))}
          </select>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={
              loading || !selectedDate || !selectedBranch || !selectedReportType
            }
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </div>
      </div>

      {/* Report Display Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4">
        {/* Summary Section */}
        <div className="mb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-2">
            Tóm tắt báo cáo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm text-blue-600 font-medium">
                Tổng nguyên vật liệu
              </div>
              <div className="text-lg font-bold text-blue-800">
                {reports.length > 0 ? reports[0].materials.length : 0}
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-md">
              <div className="text-sm text-yellow-600 font-medium">
                Lỗi dữ liệu
              </div>
              <div className="text-lg font-bold text-yellow-800">
                {getTotalErrors()}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <div className="text-sm text-green-600 font-medium">
                Ngày báo cáo
              </div>
              <div className="text-lg font-bold text-green-800">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString("vi-VN")
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {/* Legend for data validation */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center text-sm text-yellow-800">
              <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
              <span className="font-medium">Chú ý:</span>
              <span className="ml-2">
                Dữ liệu màu đỏ cho thấy có sự không khớp trong tính toán hoặc
                liên kết giữa các ca
              </span>
            </div>
            <div className="mt-2 text-xs text-yellow-700 space-y-1">
              <div>• Tồn cuối ≠ Tồn đầu + Nhập - Xuất</div>
              <div>• Tồn cuối ca trước ≠ Tồn đầu ca sau</div>
            </div>
          </div>

          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">
                  STT
                </th>
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">
                  Nguyên vật liệu
                </th>
                <th
                  className="border border-gray-300 px-2 py-2 text-center font-semibold"
                  colSpan={4}
                >
                  Số lượng ca sáng
                </th>
                <th
                  className="border border-gray-300 px-2 py-2 text-center font-semibold"
                  colSpan={4}
                >
                  Số lượng ca chiều
                </th>
                <th
                  className="border border-gray-300 px-2 py-2 text-center font-semibold"
                  colSpan={4}
                >
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
              {loading || initialLoad ? (
                <LoadingSkeleton />
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                reports.map((report) =>
                  report.materials.map((material, materialIndex) => (
                    <tr
                      key={`${report.id}-${material.id}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {materialIndex + 1}
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
                      <td
                        className={`border border-gray-300 px-2 py-2 text-center ${getCellStyle(material, "morningEnding")}`}
                        title={
                          getErrorDetails(material, "morningEnding") ||
                          undefined
                        }
                      >
                        {material.morning.ending}
                      </td>
                      {/* Afternoon Shift */}
                      <td
                        className={`border border-gray-300 px-2 py-2 text-center ${getCellStyle(material, "afternoonBeginning")}`}
                        title={
                          getErrorDetails(material, "afternoonBeginning") ||
                          undefined
                        }
                      >
                        {material.afternoon.beginning}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.afternoon.received}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.afternoon.issued}
                      </td>
                      <td
                        className={`border border-gray-300 px-2 py-2 text-center ${getCellStyle(material, "afternoonEnding")}`}
                        title={
                          getErrorDetails(material, "afternoonEnding") ||
                          undefined
                        }
                      >
                        {material.afternoon.ending}
                      </td>
                      {/* Evening Shift */}
                      <td
                        className={`border border-gray-300 px-2 py-2 text-center ${getCellStyle(material, "eveningBeginning")}`}
                        title={
                          getErrorDetails(material, "eveningBeginning") ||
                          undefined
                        }
                      >
                        {material.evening.beginning}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.evening.received}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {material.evening.issued}
                      </td>
                      <td
                        className={`border border-gray-300 px-2 py-2 text-center ${getCellStyle(material, "eveningEnding")}`}
                        title={
                          getErrorDetails(material, "eveningEnding") ||
                          undefined
                        }
                      >
                        {material.evening.ending}
                      </td>
                    </tr>
                  )),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Material Management Drawer */}
      <MaterialManagementDrawer
        isOpen={isMaterialDrawerOpen}
        onClose={handleCloseMaterialDrawer}
      />

      {/* Send Report Drawer */}
      <SendReportDrawer
        isOpen={isSendReportDrawerOpen}
        onClose={handleCloseSendReportDrawer}
        selectedDate={selectedDate}
        defaultReportType={selectedReportType}
        onReportSubmitted={fetchReports}
      />
    </div>
  );
}
