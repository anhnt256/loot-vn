"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { useStaffContext } from "@/components/providers/StaffProvider";

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
  received: number | null;
  issued: number | null;
  ending: number;
}

interface SendReportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  defaultReportType?: string;
  onReportSubmitted?: () => void;
}

interface Staff {
  id: number;
  fullName: string;
  userName: string;
}

// Function to map material data based on conditions
const mapMaterialData = (
  isInitialData: boolean,
  materials: any,
  submissionTracking: any,
  selectedShift: string,
): MaterialReportData[] => {
  // Helper function to get submission count for current shift
  const getSubmissionCount = (
    submissionTracking: any,
    selectedShift: string,
  ) => {
    if (!submissionTracking) return 0;

    switch (selectedShift) {
      case SHIFT_ENUM.SANG:
        return submissionTracking.morningSubmissionCount || 0;
      case SHIFT_ENUM.CHIEU:
        return submissionTracking.afternoonSubmissionCount || 0;
      case SHIFT_ENUM.TOI:
        return submissionTracking.eveningSubmissionCount || 0;
      default:
        return 0;
    }
  };

  const submissionCount = getSubmissionCount(submissionTracking, selectedShift);

  // Trường hợp 1: isInitialData = true - Chưa có dữ liệu cả ngày hiện tại và ngày trước đó
  if (isInitialData) {
    if (materials?.availableMaterials) {
      return materials.availableMaterials.map((material: any) => ({
        id: material.id,
        materialName: material.materialName,
        beginning: 0, // Cho user nhập Tồn đầu
        received: null, // Disable Nhập
        issued: null, // Disable Xuất
        ending: 0, // Disable Tồn cuối
      }));
    }
    return [];
  }

  // Trường hợp 2: isInitialData = false, submissionCount = 0 - Có dữ liệu từ ngày trước, FE có thể tính toán
  if (submissionCount === 0) {
    // Khi isInitialData = false, luôn sử dụng availableMaterials để lấy danh sách materials
    // vì currentDay chỉ có dữ liệu khi đã có báo cáo cho ngày hiện tại
    const materialsToMap =
      materials?.availableMaterials || materials?.currentDay || [];

    if (materialsToMap && materialsToMap.length > 0) {
      return materialsToMap.map((material: any) => {
        let beginningValue = 0;

        // Lấy Tồn cuối từ ca trước làm Tồn đầu
        if (selectedShift === SHIFT_ENUM.SANG) {
          // Ca sáng: lấy từ ca tối hôm trước
          const previousMaterial = materials.previousDay?.find(
            (pm: any) => String(pm.id) === String(material.id),
          );
          beginningValue = previousMaterial?.ending || 0;
        } else if (selectedShift === SHIFT_ENUM.CHIEU) {
          // Ca chiều: lấy từ ca sáng
          const morningMaterial = materials.currentMorning?.find(
            (mm: any) => String(mm.id) === String(material.id),
          );
          beginningValue = morningMaterial?.ending || 0;
        } else if (selectedShift === SHIFT_ENUM.TOI) {
          // Ca tối: lấy từ ca chiều
          const afternoonMaterial = materials.currentAfternoon?.find(
            (am: any) => String(am.id) === String(material.id),
          );
          beginningValue = afternoonMaterial?.ending || 0;
        }

        const result = {
          id: material.id,
          materialName: material.materialName,
          beginning: beginningValue,
          received: null, // Disable Nhập cho lần submit đầu tiên
          issued: null, // Disable Xuất cho lần submit đầu tiên
          ending: beginningValue, // Tự động tính = beginning + received - issued
        };

        return result;
      });
    }
    return [];
  }

  // Trường hợp 3: submissionCount = 1 - Lần thứ 2 khởi tạo báo cáo (edit mode)
  if (submissionCount === 1) {
    if (materials?.currentDay) {
      return materials.currentDay.map((material: any) => {
        let shiftData: any = {};

        // Lấy dữ liệu theo ca
        switch (selectedShift) {
          case SHIFT_ENUM.SANG:
            shiftData = material.morning || {};
            break;
          case SHIFT_ENUM.CHIEU:
            shiftData = material.afternoon || {};
            break;
          case SHIFT_ENUM.TOI:
            shiftData = material.evening || {};
            break;
        }

        return {
          id: material.id,
          materialName: material.materialName,
          beginning: shiftData.beginning || 0, // Disable Tồn đầu
          received: shiftData.received || 0, // Enable Nhập
          issued: shiftData.issued || 0, // Enable Xuất
          ending: shiftData.ending || shiftData.beginning || 0, // Tự động tính
        };
      });
    }
    return [];
  }

  // Trường hợp 4: submissionCount >= 2 - Ca đã hoàn tất
  if (submissionCount >= 2) {
    if (materials?.currentDay) {
      return materials.currentDay.map((material: any) => {
        let shiftData: any = {};

        switch (selectedShift) {
          case SHIFT_ENUM.SANG:
            shiftData = material.morning || {};
            break;
          case SHIFT_ENUM.CHIEU:
            shiftData = material.afternoon || {};
            break;
          case SHIFT_ENUM.TOI:
            shiftData = material.evening || {};
            break;
        }

        return {
          id: material.id,
          materialName: material.materialName,
          beginning: shiftData.beginning || 0,
          received: shiftData.received || 0,
          issued: shiftData.issued || 0,
          ending: shiftData.ending || 0,
        };
      });
    }
    return [];
  }

  return [];
};

export default function SendReportDrawer({
  isOpen,
  onClose,
  selectedDate,
  defaultReportType,
  onReportSubmitted,
}: SendReportDrawerProps) {
  const [selectedShift, setSelectedShift] = useState("");

  // Debug selectedShift changes
  useEffect(() => {
    // console.log('selectedShift changed to:', selectedShift);
  }, [selectedShift]);

  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedReportType, setSelectedReportType] = useState(
    defaultReportType ?? "",
  );
  const [selectedDateState, setSelectedDateState] = useState(
    selectedDate || "",
  );
  const [materialData, setMaterialData] = useState<MaterialReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { getAllStaff } = useStaffContext();
  const staffList = getAllStaff();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [submissionTracking, setSubmissionTracking] = useState<any>(null);
  const [displayTime, setDisplayTime] = useState<string>("");
  const hasInitializedRef = useRef(false);
  const isAutoSettingShiftRef = useRef(false);

  // Debug submissionTracking changes
  useEffect(() => {
    // console.log('submissionTracking changed to:', submissionTracking);
  }, [submissionTracking]);

  const shifts = Object.values(SHIFT_ENUM);

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


  // Set initial shift when drawer opens
  useEffect(() => {
    if (isOpen) {
      if (defaultReportType) {
        setSelectedReportType(defaultReportType);
      } else {
        // No fallback: explicitly notify to select report type
        // and prevent fetching until selected
        setSelectedReportType("");
      }
      // snapshot current time once when drawer opens to avoid updating on every re-render
      setDisplayTime(new Date().toLocaleTimeString("vi-VN"));
    }
  }, [isOpen, defaultReportType]);

  // Call API get-report-data when init and set into materialData state
  useEffect(() => {
    if (isOpen && selectedReportType && !hasInitializedRef.current) {
      const fetchReportData = async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams();
          params.append(
            "date",
            selectedDateState || new Date().toISOString().split("T")[0],
          );
          params.append("reportType", selectedReportType);

          const response = await fetch(
            `/api/handover-reports/get-report-data?${params.toString()}`,
          );
          const result = await response.json();

          if (result.success) {
            const { isInitialData, submissionTracking } = result.data;
            setSubmissionTracking(submissionTracking);

            // Decide shift first, then map materials using that shift
            let autoShift: string = SHIFT_ENUM.SANG;
            if (submissionTracking) {
              if (submissionTracking.morningSubmissionCount < 2) {
                autoShift = SHIFT_ENUM.SANG;
              } else if (submissionTracking.afternoonSubmissionCount < 2) {
                autoShift = SHIFT_ENUM.CHIEU;
              } else if (submissionTracking.eveningSubmissionCount < 2) {
                autoShift = SHIFT_ENUM.TOI;
              }
            }

            isAutoSettingShiftRef.current = true;
            setSelectedShift(autoShift);
            isAutoSettingShiftRef.current = false;

            const mappedMaterials = mapMaterialData(
              isInitialData,
              result.data.materials,
              submissionTracking,
              autoShift,
            );
            setMaterialData(mappedMaterials);
          } else {
            console.error("Failed to fetch report data:", result.error);
            setMaterialData([]);
          }
        } catch (error) {
          console.error("Error fetching report data:", error);
          setMaterialData([]);
        } finally {
          setLoading(false);
          // Always set initialized flag to prevent duplicate calls
          hasInitializedRef.current = true;
        }
      };

      fetchReportData();
    }
  }, [isOpen, selectedReportType, selectedDateState]);

  // Reset initialization flag when drawer closes
  useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
    }
  }, [isOpen]);

  // Update material data when selectedShift changes (only for manual changes)
  useEffect(() => {
    if (isOpen && selectedReportType && selectedShift && hasInitializedRef.current && submissionTracking && !isAutoSettingShiftRef.current) {
      const fetchReportData = async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams();
          params.append(
            "date",
            selectedDateState || new Date().toISOString().split("T")[0],
          );
          params.append("reportType", selectedReportType);

          const response = await fetch(
            `/api/handover-reports/get-report-data?${params.toString()}`,
          );
          const result = await response.json();

          if (result.success) {
            const { isInitialData, submissionTracking } = result.data;
            setSubmissionTracking(submissionTracking);

            const mappedMaterials = mapMaterialData(
              isInitialData,
              result.data.materials,
              submissionTracking,
              selectedShift,
            );
            setMaterialData(mappedMaterials);
          } else {
            console.error("Failed to fetch report data:", result.error);
            setMaterialData([]);
          }
        } catch (error) {
          console.error("Error fetching report data:", error);
          setMaterialData([]);
        } finally {
          setLoading(false);
        }
      };

      fetchReportData();
    }
  }, [selectedShift]);

  // Helper function to get submission count for current shift
  const getSubmissionCount = (
    submissionTracking: any,
    selectedShift: string,
  ) => {
    switch (selectedShift) {
      case SHIFT_ENUM.SANG:
        return submissionTracking.morningSubmissionCount || 0;
      case SHIFT_ENUM.CHIEU:
        return submissionTracking.afternoonSubmissionCount || 0;
      case SHIFT_ENUM.TOI:
        return submissionTracking.eveningSubmissionCount || 0;
      default:
        return 0;
    }
  };

  // Helper function to determine if fields should be disabled
  const shouldDisableBeginning = (
    submissionTracking: any,
    selectedShift: string,
  ) => {
    if (!submissionTracking) {
      return false; // isInitialData = true, cho phép edit
    }
    const submissionCount = getSubmissionCount(
      submissionTracking,
      selectedShift,
    );
    const shouldDisable = submissionCount >= 1;
    return shouldDisable; // Disable beginning if submissionCount >= 1
  };

  const shouldDisableReceivedIssued = (
    submissionTracking: any,
    selectedShift: string,
  ) => {
    if (!submissionTracking) {
      return true; // Disable if no submissionTracking (isInitialData = true)
    }
    const submissionCount = getSubmissionCount(
      submissionTracking,
      selectedShift,
    );
    const shouldDisable = submissionCount === 0 || submissionCount >= 2;
    return shouldDisable; // Disable for first submission (count = 0) and completed shifts
  };

  const shouldDisableEnding = () => {
    return true; // Luôn disable Tồn cuối
  };

  const isShiftCompleted = (submissionTracking: any, selectedShift: string) => {
    if (!submissionTracking) return false;
    const submissionCount = getSubmissionCount(
      submissionTracking,
      selectedShift,
    );
    return submissionCount >= 2;
  };

  // Table columns configuration using useMemo to ensure re-render when dependencies change
  const columns: ColumnsType<MaterialReportData> = useMemo(() => {
    return [
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
              handleDataChange(
                index,
                "beginning",
                parseFloat(e.target.value) || 0,
              )
            }
            className={`text-center ${shouldDisableBeginning(submissionTracking, selectedShift) ? "bg-gray-100" : ""}`}
            min={0}
            step={0.5}
            placeholder="Nhập tồn đầu"
            disabled={shouldDisableBeginning(submissionTracking, selectedShift)}
            title={
              shouldDisableBeginning(submissionTracking, selectedShift)
                ? "Tồn đầu đã được khóa"
                : "Nhập số lượng tồn đầu"
            }
          />
        ),
      },
      {
        title: "Nhập",
        dataIndex: "received",
        key: "received",
        width: 100,
        render: (value, record, index) => {
          const isDisabled = shouldDisableReceivedIssued(
            submissionTracking,
            selectedShift,
          );
          return (
            <Input
              type="number"
              value={value || ""}
              onChange={(e) =>
                handleDataChange(
                  index,
                  "received",
                  parseFloat(e.target.value) || 0,
                )
              }
              className={`text-center ${isDisabled || loading ? "bg-gray-100" : ""}`}
              min={0}
              step={0.5}
              placeholder="Nhập số lượng"
              disabled={isDisabled || loading}
              title={
                isDisabled
                  ? "Trường nhập đã được khóa"
                  : "Nhập số lượng nhận vào"
              }
            />
          );
        },
      },
      {
        title: "Xuất",
        dataIndex: "issued",
        key: "issued",
        width: 100,
        render: (value, record, index) => {
          const isDisabled = shouldDisableReceivedIssued(
            submissionTracking,
            selectedShift,
          );
          return (
            <Input
              type="number"
              value={value || ""}
              onChange={(e) =>
                handleDataChange(
                  index,
                  "issued",
                  parseFloat(e.target.value) || 0,
                )
              }
              className={`text-center ${isDisabled || loading ? "bg-gray-100" : ""}`}
              min={0}
              step={0.5}
              placeholder="Xuất số lượng"
              disabled={isDisabled || loading}
              title={
                isDisabled
                  ? "Trường xuất đã được khóa"
                  : "Nhập số lượng xuất ra"
              }
            />
          );
        },
      },
      {
        title: "Tồn cuối",
        dataIndex: "ending",
        key: "ending",
        width: 100,
        render: (value, record, index) => (
          <Input
            type="number"
            value={value}
            className="text-center bg-gray-50 font-bold text-gray-900"
            disabled={shouldDisableEnding()}
            min={0}
            step={0.5}
          />
        ),
      },
    ];
  }, [submissionTracking, selectedShift]); // Dependencies for useMemo

  const handleDataChange = (
    index: number,
    field: keyof MaterialReportData,
    value: number,
  ) => {
    // Use functional state update to avoid stale closures from memoized columns
    setMaterialData((prev) => {
      const newData = [...prev];
      const currentRow = {
        ...newData[index],
        [field]: value,
      } as MaterialReportData;

      if (field === "beginning" || field === "received" || field === "issued") {
        const beginning =
          field === "beginning" ? value : (currentRow.beginning ?? 0);
        const received =
          field === "received" ? value : (currentRow.received ?? 0);
        const issued = field === "issued" ? value : (currentRow.issued ?? 0);
        currentRow.ending = beginning + received - issued;
      }

      newData[index] = currentRow;
      return newData;
    });
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

    // Kiểm tra nếu ca đã hoàn tất
    if (isShiftCompleted(submissionTracking, selectedShift)) {
      message.error("Ca này đã hoàn tất, không thể chỉnh sửa!");
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await fetch("/api/handover-reports/submit-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDateState || new Date().toISOString().split("T")[0],
          shift: selectedShift,
          reportType: selectedReportType,
          staffId: parseInt(selectedStaff),
          materials: materialData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success("Gửi báo cáo thành công!");
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

  const title = `Báo cáo ${selectedShift ? SHIFT_LABELS[selectedShift as keyof typeof SHIFT_LABELS] : "Chưa chọn ca"} ${selectedDateState || new Date().toLocaleDateString("vi-VN")}`;

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
                  Thời gian hiện tại: {displayTime}
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
                    placeholder={loading ? "Đang tải..." : "Chọn ca làm việc"}
                    value={selectedShift}
                    onChange={setSelectedShift}
                    className="w-full"
                    size="large"
                    disabled={loading}
                    loading={loading}
                  >
                    {shifts.map((shift) => (
                      <Select.Option key={shift} value={shift}>
                        {SHIFT_LABELS[shift as keyof typeof SHIFT_LABELS]}
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
                    value={
                      selectedDateState ||
                      new Date().toISOString().split("T")[0]
                    }
                    onChange={(e) => setSelectedDateState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Status Notification */}
            {submissionTracking && (
              <div className="mb-4">
                {isShiftCompleted(submissionTracking, selectedShift) ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-yellow-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Ca{" "}
                          {
                            SHIFT_LABELS[
                              selectedShift as keyof typeof SHIFT_LABELS
                            ]
                          }{" "}
                          đã hoàn tất
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            Báo cáo này đã được hoàn tất và không thể chỉnh sửa.
                          </p>
                          <p className="mt-1">
                            <button
                              onClick={() => {
                                const tomorrow = new Date(selectedDateState);
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                setSelectedDateState(
                                  tomorrow.toISOString().split("T")[0],
                                );
                              }}
                              className="font-medium underline hover:text-yellow-600"
                            >
                              Báo cáo cho ngày tiếp theo →
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-blue-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Trạng thái ca{" "}
                          {
                            SHIFT_LABELS[
                              selectedShift as keyof typeof SHIFT_LABELS
                            ]
                          }
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            Lần báo cáo:{" "}
                            {getSubmissionCount(
                              submissionTracking,
                              selectedShift,
                            ) + 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Materials Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-medium text-gray-900">
                  Nguyên vật liệu ({materialData.length})
                </h3>
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
                  !selectedShift ||
                  !selectedStaff ||
                  !selectedReportType ||
                  isShiftCompleted(submissionTracking, selectedShift)
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
