"use client";

import React, { useState, useEffect } from "react";
import { X, Send, User, Clock } from "lucide-react";
import { Table, Input, Button, Select, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SHIFT_ENUM,
  SHIFT_LABELS,
  REPORT_TYPE_ENUM,
  REPORT_TYPE_LABELS,
} from "@/constants/handover-reports.constants";
import { CURRENT_USER } from "@/constants/token.constant";

interface Material {
  id: number;
  materialName: string;
  materialType: string;
  isDeleted: boolean;
  isFood: boolean;
}

interface MaterialReportData {
  id: number;
  materialName: string;
  beginning: number;
  received: number;
  issued: number;
  ending: number;
  isBeginningFromPreviousShift?: boolean;
  hasBeginningData?: boolean; // Track if beginning data has been entered
  isSecondReport?: boolean; // Track if this is second report (has previous data)
}

interface SendReportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  defaultReportType?: string;
  onReportSubmitted?: () => void; // Callback to refresh data after successful submission
}

interface Staff {
  id: number;
  fullName: string;
  userName: string;
}

export default function SendReportDrawer({
  isOpen,
  onClose,
  selectedDate,
  defaultReportType,
  onReportSubmitted,
}: SendReportDrawerProps) {
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedReportType, setSelectedReportType] = useState(
    defaultReportType || REPORT_TYPE_ENUM.BAO_CAO_BEP,
  );
  const [selectedDateState, setSelectedDateState] = useState(selectedDate || "");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialData, setMaterialData] = useState<MaterialReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const shifts = Object.values(SHIFT_ENUM);

  // Helper function to check if this is a second report (has existing data)
  const isSecondReport = () => {
    return materialData.some(item => item.isSecondReport);
  };

  // Helper function to get material status
  const getMaterialStatus = (record: MaterialReportData) => {
    if (record.isSecondReport) {
      if (record.received > 0 || record.issued > 0) {
        return { text: "Đã hoàn thành", color: "text-green-600 bg-green-50" };
      }
      return { text: "Đã có tồn đầu", color: "text-blue-600 bg-blue-50" };
    }
    
    if (record.isBeginningFromPreviousShift) {
      return { text: "Tồn đầu từ ca trước", color: "text-purple-600 bg-purple-50" };
    }
    
    return { text: "Chờ nhập tồn đầu", color: "text-orange-600 bg-orange-50" };
  };

  // Function to determine current shift based on time
  const getCurrentShift = () => {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour >= 7 && currentHour < 15) {
      return SHIFT_ENUM.SANG;
    } else if (currentHour >= 15 && currentHour < 22) {
      return SHIFT_ENUM.CHIEU;
    } else {
      return SHIFT_ENUM.TOI;
    }
  };

  // Function to get report date based on shift in DD/MM/YYYY format
  const getReportDate = (shift: string) => {
    const now = new Date();
    const reportDate = new Date(now);

    // For night shift (22:00 - 07:00), if current time is after midnight (0:00-7:00),
    // the report should be for the previous day
    if (shift === SHIFT_ENUM.TOI) {
      const currentHour = now.getHours();
      if (currentHour >= 0 && currentHour < 7) {
        reportDate.setDate(now.getDate() - 1);
      }
    }

    const day = String(reportDate.getDate()).padStart(2, "0");
    const month = String(reportDate.getMonth() + 1).padStart(2, "0");
    const year = reportDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Function to get report date for submission in YYYY-MM-DD format
  const getReportDateForSubmission = (shift: string, customDate?: string) => {
    // If custom date is provided, use it
    if (customDate) {
      return customDate;
    }

    const now = new Date();
    const reportDate = new Date(now);

    // For night shift (22:00 - 07:00), if current time is after midnight (0:00-7:00),
    // the report should be for the previous day
    if (shift === SHIFT_ENUM.TOI) {
      const currentHour = now.getHours();
      if (currentHour >= 0 && currentHour < 7) {
        reportDate.setDate(now.getDate() - 1);
      }
    }

    const year = reportDate.getFullYear();
    const month = String(reportDate.getMonth() + 1).padStart(2, "0");
    const day = String(reportDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Load current user from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem(CURRENT_USER);
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          setCurrentUser(parsedUserData);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  // Fetch staff list from API
  const fetchStaffList = async () => {
    try {
      const response = await fetch("/api/staff");
      const result = await response.json();

      if (result.success) {
        setStaffList(result.data);
      } else {
        console.error("Failed to fetch staff list:", result.error);
        setStaffList([]);
      }
    } catch (error) {
      console.error("Error fetching staff list:", error);
      setStaffList([]);
    }
  };

  // Fetch materials when drawer opens or when report type/shift/date changes
  useEffect(() => {
    if (isOpen && selectedShift && selectedReportType) {
      checkReportCompletionAndFetchMaterials();
    }
  }, [isOpen, selectedReportType, selectedShift, selectedDateState]);

  // Fetch staff list and set initial shift when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchStaffList();
      // Auto-select current shift when drawer opens
      const currentShift = getCurrentShift();
      setSelectedShift(currentShift);
      // Set default report type if provided
      if (defaultReportType) {
        setSelectedReportType(defaultReportType);
      }
    }
  }, [isOpen, defaultReportType]);

  // Initialize material data when materials are loaded
  useEffect(() => {
    if (materials.length > 0) {
      // Sort materials by name to match the order in the main table
      const sortedMaterials = [...materials].sort((a, b) =>
        a.materialName.localeCompare(b.materialName),
      );

      const initialData = sortedMaterials.map((material, index) => ({
        id: material.id,
        materialName: material.materialName,
        beginning: 0, // Sẽ được tính từ dữ liệu ca trước
        received: 0,
        issued: 0,
        ending: 0,
        isBeginningFromPreviousShift: false,
        hasBeginningData: false, // Track if beginning data has been entered
        isSecondReport: false, // Track if this is second report
      }));
      setMaterialData(initialData);
    }
  }, [materials]);

  // Check if report is completed before fetching materials
  const checkReportCompletionAndFetchMaterials = async () => {
    setLoading(true);
    try {
      // Calculate the correct report date based on selected shift and custom date
      let reportDate = getReportDateForSubmission(
        selectedShift || getCurrentShift(),
        selectedDateState
      );

      // Always use the selected report date - API will handle getting previous shift data
      // For morning shift, API will automatically get evening ending from previous day
      // For afternoon shift, API will get morning ending from same day
      // For evening shift, API will get afternoon ending from same day

      // First, check if report is completed
      const checkParams = new URLSearchParams();
      checkParams.append("date", reportDate);
      checkParams.append("shift", selectedShift || getCurrentShift());
      checkParams.append("reportType", selectedReportType);

      const checkResponse = await fetch(
        `/api/handover-reports/check-completion?${checkParams.toString()}`,
      );
      const checkResult = await checkResponse.json();

      if (checkResult.success && checkResult.data.isCompleted) {
        message.error("Báo cáo này đã hoàn tất, không thể chỉnh sửa!");
        setMaterialData([]);
        return;
      }

      // If not completed, proceed to fetch materials
      const params = new URLSearchParams();
      params.append("date", reportDate);
      params.append("shift", selectedShift || getCurrentShift());
      params.append("reportType", selectedReportType);

      const response = await fetch(
        `/api/handover-reports/get-report-data?${params.toString()}`,
      );
      const result = await response.json();

      if (result.success) {
        // Sort materials by name to ensure consistent order with main table
        const sortedData = result.data.materials.sort(
          (a: MaterialReportData, b: MaterialReportData) =>
            a.materialName.localeCompare(b.materialName),
        );
        
        // Use data from API directly - it already has the correct flags
        setMaterialData(sortedData);
        
        // Auto-select staff if report already exists and has beginning data
        if (result.data.staffInfo && sortedData.some((item: MaterialReportData) => item.beginning > 0)) {
          const shift = selectedShift || getCurrentShift();
          let staffId = null;
          if (shift === SHIFT_ENUM.SANG) {
            staffId = result.data.staffInfo.morningStaffId;
          } else if (shift === SHIFT_ENUM.CHIEU) {
            staffId = result.data.staffInfo.afternoonStaffId;
          } else if (shift === SHIFT_ENUM.TOI) {
            staffId = result.data.staffInfo.eveningStaffId;
          }
          if (staffId) {
            setSelectedStaff(staffId.toString());
          }
        }
      } else {
        console.error("Failed to fetch materials:", result.error);
        setMaterialData([]);
      }
    } catch (error) {
      console.error("Error checking completion or fetching materials:", error);
      setMaterialData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      // Calculate the correct report date based on selected shift and custom date
      let reportDate = getReportDateForSubmission(
        selectedShift || getCurrentShift(),
        selectedDateState
      );

      // Always use the selected report date - API will handle getting previous shift data
      // For morning shift, API will automatically get evening ending from previous day
      // For afternoon shift, API will get morning ending from same day
      // For evening shift, API will get afternoon ending from same day

      const params = new URLSearchParams();
      params.append("date", reportDate);
      params.append("shift", selectedShift || getCurrentShift());
      params.append("reportType", selectedReportType);

      const response = await fetch(
        `/api/handover-reports/get-report-data?${params.toString()}`,
      );
      const result = await response.json();

      if (result.success) {
        // Sort materials by name to ensure consistent order with main table
        const sortedData = result.data.materials.sort(
          (a: MaterialReportData, b: MaterialReportData) =>
            a.materialName.localeCompare(b.materialName),
        );
        
        // Use data from API directly - it already has the correct flags
        setMaterialData(sortedData);
        
        // Auto-select staff if report already exists and has beginning data
        if (result.data.staffInfo && sortedData.some((item: MaterialReportData) => item.beginning > 0)) {
          const shift = selectedShift || getCurrentShift();
          let staffId = null;
          if (shift === SHIFT_ENUM.SANG) {
            staffId = result.data.staffInfo.morningStaffId;
          } else if (shift === SHIFT_ENUM.CHIEU) {
            staffId = result.data.staffInfo.afternoonStaffId;
          } else if (shift === SHIFT_ENUM.TOI) {
            staffId = result.data.staffInfo.eveningStaffId;
          }
          if (staffId) {
            setSelectedStaff(staffId.toString());
          }
        }
      } else {
        console.error("Failed to fetch materials:", result.error);
        setMaterialData([]);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
      setMaterialData([]);
    } finally {
      setLoading(false);
    }
  };

  // Table columns configuration
  const columns: ColumnsType<MaterialReportData> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nguyên vật liệu",
      dataIndex: "materialName",
      key: "materialName",
      width: 200,
      render: (value, record) => {
        const status = getMaterialStatus(record);
        return (
          <div>
            <div className="font-medium">{value}</div>
            <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${status.color}`}>
              {status.text}
            </div>
          </div>
        );
      },
    },
    {
      title: "Tồn đầu",
      dataIndex: "beginning",
      key: "beginning",
      width: 100,
      render: (value, record, index) => (
        <Input
          type="number"
          value={value}
          onChange={(e) =>
            handleDataChange(index, "beginning", parseInt(e.target.value) || 0)
          }
          className={`text-center ${record.isSecondReport ? "bg-gray-50" : ""}`}
          disabled={record.isSecondReport || isSecondReport()}
          min={0}
          placeholder="Nhập tồn đầu"
        />
      ),
    },
    {
      title: "Nhập",
      dataIndex: "received",
      key: "received",
      width: 100,
      render: (value, record, index) => (
        <Input
          type="number"
          value={value}
          onChange={(e) =>
            handleDataChange(index, "received", parseInt(e.target.value) || 0)
          }
          className={`text-center ${!record.isSecondReport ? "bg-gray-50" : ""}`}
          disabled={!record.isSecondReport}
          min={0}
          placeholder="Nhập số lượng"
        />
      ),
    },
    {
      title: "Xuất",
      dataIndex: "issued",
      key: "issued",
      width: 100,
      render: (value, record, index) => {
        const maxIssued = record.beginning + record.received;
        const isExceeded = value > maxIssued;
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) =>
              handleDataChange(index, "issued", parseInt(e.target.value) || 0)
            }
            className={`text-center ${!record.isSecondReport ? "bg-gray-50" : ""} ${isExceeded ? "border-red-500 bg-red-50" : ""}`}
            disabled={!record.isSecondReport}
            min={0}
            max={maxIssued}
            title={isExceeded ? `Tối đa: ${maxIssued}` : ""}
            placeholder="Xuất số lượng"
          />
        );
      },
    },
    {
      title: "Tồn cuối",
      dataIndex: "ending",
      key: "ending",
      width: 100,
      render: (value, record, index) => {
        const calculatedEnding =
          record.beginning + record.received - record.issued;
        return (
          <Input
            type="number"
            value={calculatedEnding}
            className="text-center bg-gray-50 font-bold text-gray-900"
            disabled
            min={0}
          />
        );
      },
    },
  ];

  const handleDataChange = (
    index: number,
    field: keyof MaterialReportData,
    value: number,
  ) => {
    const newData = [...materialData];
    newData[index] = { ...newData[index], [field]: value };

    // Validate issued amount cannot exceed beginning + received
    if (field === "issued") {
      const maxIssued = newData[index].beginning + newData[index].received;
      if (value > maxIssued) {
        message.warning(
          `Số lượng xuất không thể vượt quá tổng kho (${maxIssued})`,
        );
        newData[index].issued = maxIssued;
        value = maxIssued;
      }
    }

    // Auto-calculate ending inventory
    if (field === "beginning" || field === "received" || field === "issued") {
      newData[index].ending =
        newData[index].beginning +
        newData[index].received -
        newData[index].issued;
    }

    setMaterialData(newData);
  };

  const handleSubmit = async () => {
    if (!selectedShift) {
      message.error("Vui lòng chọn ca làm việc!");
      return;
    }
    if (!selectedStaff) {
      message.error("Vui lòng chọn nhân viên!");
      return;
    }
    if (!selectedReportType) {
      message.error("Vui lòng chọn loại báo cáo!");
      return;
    }

    // Check if this is a second report (has beginning data from API)
    const isSecondReport = materialData.some(item => item.isSecondReport);
    
    // For second report, beginning data is locked and cannot be changed
    // For first report, beginning can be 0 if out of stock
    if (!isSecondReport) {
      // No validation needed - beginning can be 0 if out of stock
    }

    // Validate that materials with beginning data have at least some activity (only for second report)
    if (isSecondReport) {
      const materialsWithBeginningButNoActivity = materialData.filter(
        (material) => material.beginning > 0 && material.received === 0 && material.issued === 0
      );
      if (materialsWithBeginningButNoActivity.length > 0) {
        const materialNames = materialsWithBeginningButNoActivity
          .map((m) => m.materialName)
          .join(", ");
        message.warning(`Các nguyên vật liệu sau chưa có hoạt động nhập/xuất: ${materialNames}`);
      }
    }

    // Validate all materials before submission
    const invalidMaterials = materialData.filter((material) => {
      const maxIssued = material.beginning + material.received;
      return material.issued > maxIssued;
    });

    if (invalidMaterials.length > 0) {
      const materialNames = invalidMaterials
        .map((m) => m.materialName)
        .join(", ");
      message.error(`Số lượng xuất vượt quá tổng kho cho: ${materialNames}`);
      return;
    }

    setSubmitLoading(true);
    try {
      // Calculate the correct report date based on selected shift
      const reportDate = getReportDateForSubmission(selectedShift);

      // Prepare materials data - set received and issued to null for first report
      const preparedMaterials = materialData.map(material => ({
        ...material,
        received: isSecondReport ? material.received : null,
        issued: isSecondReport ? material.issued : null,
      }));

      const response = await fetch("/api/handover-reports/submit-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: reportDate,
          shift: selectedShift,
          reportType: selectedReportType,
          staffId: parseInt(selectedStaff),
          materials: preparedMaterials,
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success("Gửi báo cáo thành công!");
        // Call callback to refresh data in parent component
        if (onReportSubmitted) {
          onReportSubmitted();
        }
        onClose();
      } else {
        message.error(result.error || "Có lỗi xảy ra khi gửi báo cáo!");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      message.error("Có lỗi xảy ra khi gửi báo cáo!");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isOpen) return null;

  // Generate title with selected shift, date and staff name
  const reportDate = selectedDateState ? new Date(selectedDateState).toLocaleDateString('vi-VN') : getReportDate(selectedShift || getCurrentShift());
  const selectedStaffData = staffList.find(
    (staff) => staff.id.toString() === selectedStaff,
  );
  const staffName = selectedStaffData
    ? selectedStaffData.fullName
    : "Chưa chọn nhân viên";
  const title = `Báo cáo ${selectedShift ? SHIFT_LABELS[selectedShift as keyof typeof SHIFT_LABELS] : SHIFT_LABELS[getCurrentShift() as keyof typeof SHIFT_LABELS]} ${reportDate} - ${staffName}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-6xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Selection Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-gray-900 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Thông tin báo cáo
                </h3>
                <div className="text-sm text-gray-600">
                  Thời gian hiện tại: {new Date().toLocaleTimeString("vi-VN")}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Report Type Selection */}
                <div>
                  <label
                    htmlFor="report-type-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Loại báo cáo *
                  </label>
                  <Select
                    id="report-type-select"
                    placeholder="Chọn loại báo cáo"
                    value={selectedReportType}
                    onChange={setSelectedReportType}
                    className="w-full"
                    size="large"
                    disabled={isSecondReport()}
                  >
                    {Object.values(REPORT_TYPE_ENUM).map((type) => (
                      <Select.Option key={type} value={type}>
                        {
                          REPORT_TYPE_LABELS[
                            type as keyof typeof REPORT_TYPE_LABELS
                          ]
                        }
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* Shift Selection */}
                <div>
                  <label
                    htmlFor="shift-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ca làm việc *
                  </label>
                  <Select
                    id="shift-select"
                    placeholder="Chọn ca làm việc"
                    value={selectedShift}
                    onChange={setSelectedShift}
                    className="w-full"
                    size="large"
                    disabled={isSecondReport()}
                  >
                    {shifts.map((shift) => (
                      <Select.Option key={shift} value={shift}>
                        {SHIFT_LABELS[shift as keyof typeof SHIFT_LABELS]}
                        {shift === getCurrentShift() && " (Hiện tại)"}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* Date Selection */}
                <div>
                  <label
                    htmlFor="date-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ngày báo cáo *
                  </label>
                  <input
                    id="date-select"
                    type="date"
                    value={selectedDateState || getReportDateForSubmission(selectedShift || getCurrentShift())}
                    onChange={(e) => setSelectedDateState(e.target.value)}
                    disabled={isSecondReport()}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isSecondReport() ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                {/* Staff Selection */}
                <div>
                  <label
                    htmlFor="staff-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nhân viên *
                  </label>
                  <Select
                    id="staff-select"
                    placeholder="Chọn nhân viên"
                    value={selectedStaff}
                    onChange={setSelectedStaff}
                    className="w-full"
                    size="large"
                    showSearch
                    disabled={isSecondReport()}
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {staffList.map((staff) => (
                      <Select.Option key={staff.id} value={staff.id.toString()}>
                        {staff.fullName}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Materials Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-medium text-gray-900">
                  Số lượng ca{" "}
                  {selectedShift
                    ? SHIFT_LABELS[
                        selectedShift as keyof typeof SHIFT_LABELS
                      ]?.toLowerCase()
                    : ""}{" "}
                  ({materialData.length})
                </h3>
                <div className={`text-sm px-3 py-1 rounded-md ${
                  materialData.some(item => item.isSecondReport) 
                    ? "text-orange-600 bg-orange-50" 
                    : "text-gray-600 bg-blue-50"
                }`}>
                  <span className="font-medium">Hướng dẫn:</span> {
                    materialData.some(item => item.isSecondReport) 
                      ? "Cập nhật nhập/xuất cho ca này (thông tin cơ bản đã bị khóa)" 
                      : materialData.some(item => item.isBeginningFromPreviousShift)
                        ? "Tồn đầu đã được lấy từ ca trước, có thể chỉnh sửa"
                        : "Nhập tồn đầu cho ca mới"
                  }
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-md"></div>
                    </div>
                  ))}
                </div>
              ) : materialData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">
                    Chưa có nguyên vật liệu nào
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Vui lòng kiểm tra lại loại báo cáo
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200">
                  <Table
                    columns={columns}
                    dataSource={materialData}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                    scroll={{ x: 800 }}
                    className="material-report-table"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-end space-x-3">
              <Button onClick={onClose} size="large">
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={submitLoading}
                disabled={
                  !selectedShift || !selectedStaff || !selectedReportType
                }
                icon={<Send className="w-4 h-4" />}
                size="large"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Gửi báo cáo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
