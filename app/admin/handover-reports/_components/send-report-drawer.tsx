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

interface SubmissionTracking {
  morningSubmissionCount: number;
  afternoonSubmissionCount: number;
  eveningSubmissionCount: number;
  isMorningComplete: boolean;
  isAfternoonComplete: boolean;
  isEveningComplete: boolean;
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
  const [selectedDateState, setSelectedDateState] = useState(
    selectedDate || "",
  );
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialData, setMaterialData] = useState<MaterialReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [submissionTracking, setSubmissionTracking] =
    useState<SubmissionTracking | null>(null);

  const shifts = Object.values(SHIFT_ENUM);

  // Helper function to check if this is a second report (has existing data)
  const isSecondReport = () => {
    return materialData.some((item) => item.isSecondReport);
  };

  // Helper function to check if current shift is complete
  const isCurrentShiftComplete = () => {
    if (!submissionTracking || !selectedShift) return false;

    if (selectedShift === SHIFT_ENUM.SANG) {
      return submissionTracking.isMorningComplete;
    } else if (selectedShift === SHIFT_ENUM.CHIEU) {
      return submissionTracking.isAfternoonComplete;
    } else if (selectedShift === SHIFT_ENUM.TOI) {
      return submissionTracking.isEveningComplete;
    }
    return false;
  };

  // Helper function to get current submission count
  const getCurrentSubmissionCount = () => {
    if (!submissionTracking || !selectedShift) return 0;

    if (selectedShift === SHIFT_ENUM.SANG) {
      return submissionTracking.morningSubmissionCount;
    } else if (selectedShift === SHIFT_ENUM.CHIEU) {
      return submissionTracking.afternoonSubmissionCount;
    } else if (selectedShift === SHIFT_ENUM.TOI) {
      return submissionTracking.eveningSubmissionCount;
    }
    return 0;
  };

  // Helper function to check if this is first submission (only beginning allowed)
  const isFirstSubmission = () => {
    return getCurrentSubmissionCount() === 0;
  };

  // Helper function to check if this is second submission (received/issued allowed)
  const isSecondSubmission = () => {
    return getCurrentSubmissionCount() === 1;
  };

  // Helper function to check if all shifts are completed
  const areAllShiftsCompleted = () => {
    if (!submissionTracking) return false;

    // Check if submission tracking has valid data
    if (
      submissionTracking.morningSubmissionCount === undefined ||
      submissionTracking.afternoonSubmissionCount === undefined ||
      submissionTracking.eveningSubmissionCount === undefined
    ) {
      return false;
    }

    const result =
      submissionTracking.morningSubmissionCount >= 2 &&
      submissionTracking.afternoonSubmissionCount >= 2 &&
      submissionTracking.eveningSubmissionCount >= 2;

    return result;
  };

  // Helper function to get available shifts count
  const getAvailableShiftsCount = () => {
    if (!submissionTracking) return 3;

    let availableCount = 0;
    if (submissionTracking.morningSubmissionCount < 2) availableCount++;
    if (submissionTracking.afternoonSubmissionCount < 2) availableCount++;
    if (submissionTracking.eveningSubmissionCount < 2) availableCount++;

    return availableCount;
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
      return {
        text: "Tồn đầu từ ca trước",
        color: "text-purple-600 bg-purple-50",
      };
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

  // Fetch staff list and set initial shift when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchStaffList();
      // Set default report type if provided
      if (defaultReportType) {
        setSelectedReportType(defaultReportType);
      }
    }
  }, [isOpen, defaultReportType]);

  // Reset selected shift when date changes
  useEffect(() => {
    if (isOpen && selectedDateState) {
      // Reset selected shift when date changes to force recalculation
      setSelectedShift("");
      setSelectedStaff("");
      setMaterialData([]);
    }
  }, [selectedDateState]);

  // Initialize data when drawer opens or when date changes
  useEffect(() => {
    if (isOpen && selectedReportType) {
      initializeData();
    }
  }, [isOpen, selectedReportType, selectedDateState]);

  // Fetch materials when shift changes
  useEffect(() => {
    if (isOpen && selectedShift && selectedReportType) {
      checkReportCompletionAndFetchMaterials();
    }
  }, [selectedShift]);

  // Helper function to process materials data based on shift and submission count
  const processMaterialsData = (
    currentDayMaterials: any[],
    previousDayMaterials: any[],
    currentShift: string,
    submissionCount: number,
  ) => {
    const materialsMap = new Map();

    // Process current day materials - get data for the current selected shift
    currentDayMaterials.forEach((material: any) => {
      const shiftData = material[currentShift.toLowerCase()];
      if (shiftData) {
        materialsMap.set(material.id, {
          id: material.id,
          materialName: material.materialName,
          beginning: shiftData.beginning || 0,
          received: shiftData.received || 0,
          issued: shiftData.issued || 0,
          ending: shiftData.ending || 0,
          isBeginningFromPreviousShift: false,
          hasBeginningData: shiftData.beginning > 0,
          isSecondReport: submissionCount > 0,
        });
      }
    });

    // Process beginning inventory logic based on current shift and submission count
    if (submissionCount === 0) {
      // First submission: need to get beginning from previous shift
      if (currentShift === SHIFT_ENUM.SANG) {
        // Morning shift: get from previous day evening ending
        previousDayMaterials.forEach((material: any) => {
          if (!materialsMap.has(material.id)) {
            materialsMap.set(material.id, {
              id: material.id,
              materialName: material.materialName,
              beginning: material.ending || 0,
              received: 0,
              issued: 0,
              ending: material.ending || 0,
              isBeginningFromPreviousShift: true,
              hasBeginningData: material.ending > 0,
              isSecondReport: false,
            });
          } else {
            const currentMaterial = materialsMap.get(material.id);
            currentMaterial.beginning = material.ending || 0;
            currentMaterial.isBeginningFromPreviousShift = true;
            currentMaterial.hasBeginningData = material.ending > 0;
          }
        });
      } else if (currentShift === SHIFT_ENUM.CHIEU) {
        // Afternoon shift: get from current day morning ending
        currentDayMaterials.forEach((material: any) => {
          const morningData = material.morning;
          if (morningData && morningData.ending !== undefined) {
            if (!materialsMap.has(material.id)) {
              materialsMap.set(material.id, {
                id: material.id,
                materialName: material.materialName,
                beginning: morningData.ending || 0,
                received: 0,
                issued: 0,
                ending: morningData.ending || 0,
                isBeginningFromPreviousShift: true,
                hasBeginningData: morningData.ending > 0,
                isSecondReport: false,
              });
            } else {
              const currentMaterial = materialsMap.get(material.id);
              currentMaterial.beginning = morningData.ending || 0;
              currentMaterial.isBeginningFromPreviousShift = true;
              currentMaterial.hasBeginningData = morningData.ending > 0;
            }
          }
        });
      } else if (currentShift === SHIFT_ENUM.TOI) {
        // Evening shift: get from current day afternoon ending
        currentDayMaterials.forEach((material: any) => {
          const afternoonData = material.afternoon;
          if (afternoonData && afternoonData.ending !== undefined) {
            if (!materialsMap.has(material.id)) {
              materialsMap.set(material.id, {
                id: material.id,
                materialName: material.materialName,
                beginning: afternoonData.ending || 0,
                received: 0,
                issued: 0,
                ending: afternoonData.ending || 0,
                isBeginningFromPreviousShift: true,
                hasBeginningData: afternoonData.ending > 0,
                isSecondReport: false,
              });
            } else {
              const currentMaterial = materialsMap.get(material.id);
              currentMaterial.beginning = afternoonData.ending || 0;
              currentMaterial.isBeginningFromPreviousShift = true;
              currentMaterial.hasBeginningData = afternoonData.ending > 0;
            }
          }
        });
      }
    }
    // For second submission (submissionCount === 1), keep existing beginning data

    // Convert map to array and sort by material name
    const processedData = Array.from(materialsMap.values()).sort(
      (a: MaterialReportData, b: MaterialReportData) =>
        a.materialName.localeCompare(b.materialName),
    );

    // Auto-calculate ending for all materials
    return processedData.map((item: MaterialReportData) => ({
      ...item,
      ending: item.beginning + item.received - item.issued,
    }));
  };

  // Function to initialize data when drawer opens
  const initializeData = async () => {
    setLoading(true);
    try {
      // Calculate the appropriate shift based on the selected date
      let targetShift = getCurrentShift();

      // If a custom date is selected, determine the appropriate shift for that date
      if (selectedDateState) {
        const selectedDate = new Date(selectedDateState);
        const today = new Date();

        // If selected date is today, use current shift
        if (selectedDate.toDateString() === today.toDateString()) {
          targetShift = getCurrentShift();
        } else {
          // If selected date is different, default to morning shift for historical dates
          // or determine based on the date context
          if (selectedDate < today) {
            // For past dates, default to morning shift
            targetShift = SHIFT_ENUM.SANG;
          } else {
            // For future dates, also default to morning shift
            targetShift = SHIFT_ENUM.SANG;
          }
        }
      }

      const reportDate = getReportDateForSubmission(
        targetShift,
        selectedDateState,
      );

      const params = new URLSearchParams();
      params.append("date", reportDate);
      params.append("reportType", selectedReportType);

      const response = await fetch(
        `/api/handover-reports/get-report-data?${params.toString()}`,
      );
      const result = await response.json();

      if (result.success) {
        // Save submission tracking data
        if (result.data.submissionTracking) {
          setSubmissionTracking(result.data.submissionTracking);
        } else {
          setSubmissionTracking(null);
        }

        // Auto-select available shift based on submission tracking
        const tracking = result.data.submissionTracking;

        if (tracking && tracking.morningSubmissionCount !== undefined) {
          let availableShift = null;

          // Check morning shift
          if (tracking.morningSubmissionCount < 2) {
            availableShift = SHIFT_ENUM.SANG;
          }
          // Check afternoon shift
          else if (tracking.afternoonSubmissionCount < 2) {
            availableShift = SHIFT_ENUM.CHIEU;
          }
          // Check evening shift
          else if (tracking.eveningSubmissionCount < 2) {
            availableShift = SHIFT_ENUM.TOI;
          }

          // If no available shift found, set to first incomplete shift or default
          if (!availableShift) {
            // All shifts completed, don't auto-select any shift
            setSelectedShift("");
            setSelectedStaff("");
            setMaterialData([]);
            return;
          }

          if (availableShift) {
            setSelectedShift(availableShift);

            // Auto-select staff for the available shift
            if (result.data.staffInfo) {
              let staffId = null;
              if (availableShift === SHIFT_ENUM.SANG) {
                staffId = result.data.staffInfo.morningStaffId;
              } else if (availableShift === SHIFT_ENUM.CHIEU) {
                staffId = result.data.staffInfo.afternoonStaffId;
              } else if (availableShift === SHIFT_ENUM.TOI) {
                staffId = result.data.staffInfo.eveningStaffId;
              }

              // Only auto-select staff if the shift has existing data
              if (staffId) {
                setSelectedStaff(staffId.toString());
              } else {
                // Reset staff selection for new shift
                setSelectedStaff("");
              }
            }

            // Process materials data for the selected shift
            const currentDayMaterials = result.data.materials.currentDay || [];
            const previousDayMaterials =
              result.data.materials.previousDay || [];
            const submissionCount =
              tracking[`${availableShift.toLowerCase()}SubmissionCount`] || 0;

            const calculatedData = processMaterialsData(
              currentDayMaterials,
              previousDayMaterials,
              availableShift,
              submissionCount,
            );

            setMaterialData(calculatedData);
          } else {
            // All shifts completed
            setSelectedShift("");
            setSelectedStaff("");
            setMaterialData([]);
          }
        } else {
          // No submission tracking data or invalid data, set default shift based on date
          const defaultShift = targetShift;
          setSelectedShift(defaultShift);
          setSelectedStaff("");
          setMaterialData([]);
        }
      }
    } catch (error) {
      console.error("Error initializing data:", error);
    } finally {
      setLoading(false);
    }
  };

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
      const reportDate = getReportDateForSubmission(
        selectedShift || getCurrentShift(),
        selectedDateState,
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
      params.append("reportType", selectedReportType);

      const response = await fetch(
        `/api/handover-reports/get-report-data?${params.toString()}`,
      );
      const result = await response.json();

      if (result.success) {
        // Get current shift for filtering data
        const currentShift = selectedShift || getCurrentShift();

        // Get submission count for current shift
        const submissionCount = getCurrentSubmissionCount();

        // Get all materials from current day data
        const currentDayMaterials = result.data.materials.currentDay || [];
        const previousDayMaterials = result.data.materials.previousDay || [];

        // Process materials data using helper function
        const calculatedData = processMaterialsData(
          currentDayMaterials,
          previousDayMaterials,
          currentShift,
          submissionCount,
        );

        setMaterialData(calculatedData);

        // Save submission tracking data
        if (result.data.submissionTracking) {
          setSubmissionTracking(result.data.submissionTracking);
        }

        // Auto-select staff if report already exists and has beginning data
        if (
          result.data.staffInfo &&
          calculatedData.some((item: MaterialReportData) => item.beginning > 0)
        ) {
          let staffId = null;
          if (currentShift === SHIFT_ENUM.SANG) {
            staffId = result.data.staffInfo.morningStaffId;
          } else if (currentShift === SHIFT_ENUM.CHIEU) {
            staffId = result.data.staffInfo.afternoonStaffId;
          } else if (currentShift === SHIFT_ENUM.TOI) {
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
            <div
              className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${status.color}`}
            >
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
      render: (value, record, index) => {
        // Disable if shift is complete or if this is second submission
        const isDisabled = isCurrentShiftComplete() || isSecondSubmission();
        return (
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
            className={`text-center ${isDisabled ? "bg-gray-50" : ""}`}
            disabled={isDisabled}
            min={0}
            step={0.5}
            placeholder="Nhập tồn đầu"
          />
        );
      },
    },
    {
      title: "Nhập",
      dataIndex: "received",
      key: "received",
      width: 100,
      render: (value, record, index) => {
        // Only enable if shift is not complete and this is second submission
        const isDisabled = isCurrentShiftComplete() || !isSecondSubmission();
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) =>
              handleDataChange(
                index,
                "received",
                parseFloat(e.target.value) || 0,
              )
            }
            className={`text-center ${isDisabled ? "bg-gray-50" : ""}`}
            disabled={isDisabled}
            min={0}
            step={0.5}
            placeholder="Nhập số lượng"
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
        const maxIssued = record.beginning + record.received;
        const isExceeded = value > maxIssued;
        // Only enable if shift is not complete and this is second submission
        const isDisabled = isCurrentShiftComplete() || !isSecondSubmission();
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) =>
              handleDataChange(index, "issued", parseFloat(e.target.value) || 0)
            }
            className={`text-center ${isDisabled ? "bg-gray-50" : ""} ${isExceeded ? "border-red-500 bg-red-50" : ""}`}
            disabled={isDisabled}
            min={0}
            max={maxIssued}
            step={0.5}
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
        return (
          <Input
            type="number"
            value={value}
            className="text-center bg-gray-50 font-bold text-gray-900"
            disabled
            min={0}
            step={0.5}
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

    // Check if shift is already complete
    if (isCurrentShiftComplete()) {
      message.error("Ca làm việc này đã hoàn tất, không thể gửi thêm báo cáo!");
      return;
    }

    // Check submission count limit
    const currentCount = getCurrentSubmissionCount();
    if (currentCount >= 2) {
      message.error("Ca làm việc này đã đạt tối đa 2 lần gửi báo cáo!");
      return;
    }

    // Check if this is a second report (has beginning data from API)
    const isSecondReport = materialData.some((item) => item.isSecondReport);

    // Validate based on submission count
    if (isFirstSubmission()) {
      // First submission: only beginning data is allowed
      // No validation needed - beginning can be 0 if out of stock
    } else if (isSecondSubmission()) {
      // Second submission: validate that materials with beginning data have at least some activity
      const materialsWithBeginningButNoActivity = materialData.filter(
        (material) =>
          material.beginning > 0 &&
          material.received === 0 &&
          material.issued === 0,
      );
      if (materialsWithBeginningButNoActivity.length > 0) {
        const materialNames = materialsWithBeginningButNoActivity
          .map((m) => m.materialName)
          .join(", ");
        message.warning(
          `Các nguyên vật liệu sau chưa có hoạt động nhập/xuất: ${materialNames}`,
        );
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
      // Calculate the correct report date based on selected shift and custom date
      const reportDate = getReportDateForSubmission(
        selectedShift,
        selectedDateState,
      );

      // Prepare materials data based on submission count
      // Recalculate ending to ensure accuracy
      const preparedMaterials = materialData.map((material) => ({
        ...material,
        received: isSecondSubmission() ? material.received : null,
        issued: isSecondSubmission() ? material.issued : null,
        ending:
          material.beginning +
          (isSecondSubmission() ? material.received : 0) -
          (isSecondSubmission() ? material.issued : 0),
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
  const reportDate = selectedDateState
    ? new Date(selectedDateState).toLocaleDateString("vi-VN")
    : getReportDate(selectedShift || getCurrentShift());
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
                    disabled={isSecondReport() || isCurrentShiftComplete()}
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
                    disabled={
                      loading || isSecondReport() || isCurrentShiftComplete()
                    }
                    loading={loading}
                  >
                    {shifts.map((shift) => {
                      // Check if shift is completed (2/2 submissions)
                      const isShiftCompleted = submissionTracking
                        ? (shift === SHIFT_ENUM.SANG &&
                            submissionTracking.morningSubmissionCount >= 2) ||
                          (shift === SHIFT_ENUM.CHIEU &&
                            submissionTracking.afternoonSubmissionCount >= 2) ||
                          (shift === SHIFT_ENUM.TOI &&
                            submissionTracking.eveningSubmissionCount >= 2)
                        : false;

                      return (
                        <Select.Option
                          key={shift}
                          value={shift}
                          disabled={isShiftCompleted}
                        >
                          {SHIFT_LABELS[shift as keyof typeof SHIFT_LABELS]}
                          {shift === getCurrentShift() && " (Hiện tại)"}
                          {isShiftCompleted && " (Đã hoàn thành)"}
                        </Select.Option>
                      );
                    })}
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
                      getReportDateForSubmission(
                        selectedShift || getCurrentShift(),
                      )
                    }
                    onChange={(e) => setSelectedDateState(e.target.value)}
                    disabled={isSecondReport() || isCurrentShiftComplete()}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isSecondReport() || isCurrentShiftComplete()
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
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
                    disabled={isSecondReport() || isCurrentShiftComplete()}
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
                  Nguyên vật liệu ({materialData.length})
                </h3>
                <div className="flex items-center gap-3">
                  {/* Submission Count */}
                  {submissionTracking && (
                    <div className="flex items-center gap-1 text-sm">
                      <span className="font-medium">Lần gửi:</span>
                      <span
                        className={`px-2 py-1 rounded-md ${
                          (selectedShift === SHIFT_ENUM.SANG &&
                            submissionTracking.morningSubmissionCount >= 2) ||
                          (selectedShift === SHIFT_ENUM.CHIEU &&
                            submissionTracking.afternoonSubmissionCount >= 2) ||
                          (selectedShift === SHIFT_ENUM.TOI &&
                            submissionTracking.eveningSubmissionCount >= 2)
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {(selectedShift === SHIFT_ENUM.SANG &&
                          submissionTracking.morningSubmissionCount) ||
                          (selectedShift === SHIFT_ENUM.CHIEU &&
                            submissionTracking.afternoonSubmissionCount) ||
                          (selectedShift === SHIFT_ENUM.TOI &&
                            submissionTracking.eveningSubmissionCount) ||
                          0}
                        /2
                      </span>
                    </div>
                  )}

                  {/* Instructions */}
                  <div
                    className={`text-sm px-3 py-2 rounded-md ${
                      getCurrentSubmissionCount() === 1
                        ? "text-orange-600 bg-orange-50 border border-orange-200"
                        : "text-gray-600 bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <span className="font-bold">
                      {getCurrentSubmissionCount() === 1 ? "Lần 2" : "Lần 1"}
                    </span>
                    :{" "}
                    {getCurrentSubmissionCount() === 1
                      ? "Nhập dữ liệu Nhập - Xuất để kết ca."
                      : "Nhập tồn đầu sau đó Gửi báo cáo để xác nhận bàn giao."}
                    <br />
                    <span className="text-xs opacity-75">
                      {getCurrentSubmissionCount() === 1
                        ? "Lần 1: Nhập tồn đầu sau đó Gửi báo cáo để xác nhận bàn giao."
                        : "Lần 2: Nhập dữ liệu Nhập - Xuất để kết ca."}
                    </span>
                  </div>
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
              ) : areAllShiftsCompleted() ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-green-600">
                    Đã báo cáo xong cho ngày {selectedDateState || selectedDate}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Bạn có muốn báo cáo cho ngày tiếp theo không?
                  </p>
                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => {
                      // Tăng ngày lên 1
                      const nextDate = new Date(
                        selectedDateState || selectedDate,
                      );
                      nextDate.setDate(nextDate.getDate() + 1);
                      const nextDateStr = nextDate.toISOString().split("T")[0];
                      setSelectedDateState(nextDateStr);
                    }}
                  >
                    Báo cáo ngày{" "}
                    {(() => {
                      const nextDate = new Date(
                        selectedDateState || selectedDate,
                      );
                      nextDate.setDate(nextDate.getDate() + 1);
                      return nextDate.toLocaleDateString("vi-VN");
                    })()}
                  </button>
                </div>
              ) : !selectedShift ? (
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">
                    Vui lòng chọn ca làm việc
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Chọn ca làm việc để xem danh sách nguyên vật liệu
                  </p>
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
                  areAllShiftsCompleted()
                }
                icon={<Send className="w-4 h-4" />}
                size="large"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {areAllShiftsCompleted()
                  ? "Tất cả ca đã hoàn thành"
                  : "Gửi báo cáo"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
