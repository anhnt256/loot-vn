"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useStaffContext } from "@/components/providers/StaffProvider";
import { useBranch } from "@/components/providers/BranchProvider";

interface Report {
  id: number;
  date: string;
  shift: string;
  time: string;
  playtimeFee: number;
  serviceFee: number;
  momo: number;
  expense: number;
  interShiftExpenseAmount?: number;
  interShiftExpenseSourceShift?: string;
  interShiftExpenseSourceDate?: string;
  counterStaffId: number;
  kitchenStaffId: number;
  securityStaffId: number;
  note: string;
  details: string;
}

// No mock data – all data comes from API

const shifts = ["Sáng", "Chiều", "Tối"];
const branches = ["GO_VAP", "TAN_PHU"];
const PAGE_SIZE = 10;

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const { staff } = useStaffContext();
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterShift, setFilterShift] = useState("");
  const { branch: selectedBranch } = useBranch();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "view">("create");
  const [isSourceShiftModalOpen, setIsSourceShiftModalOpen] = useState(false);
  const [amountToWithdraw, setAmountToWithdraw] = useState("0");
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use existing hook for currentUser
  // const currentUser = useLocalStorageValue("currentUser", "");

  const [formValues, setFormValues] = useState({
    id: 0,
    date: "",
    time: "",
    shift: "Sáng",
    playtimeFee: "",
    serviceFee: "",
    momo: "",
    expense: "",
    interShiftExpenseAmount: "",
    interShiftExpenseSourceShift: "",
    interShiftExpenseSourceDate: "",
    cashier: "",
    kitchenStaff: "",
    securityGuard: "",
    note: "",
  });

  const [formDefaults, setFormDefaults] = useState({
    date: "",
    time: "",
    shift: "",
  });

  // Helper function to get staff name by ID
  const getStaffNameById = (staffId: number, staffList: any[]) => {
    const staff = staffList.find((s) => s.id === staffId);
    return staff?.fullName || `ID: ${staffId}`;
  };

  // Group reports by date and calculate daily totals
  const groupedReports = useMemo(() => {
    const groups: { [key: string]: { reports: Report[]; totals: any } } = {};

    // Filter reports based on user permissions - only show 2 most recent days for mac user
    let filteredReports = reports;

    // Check login type from cookie
    const loginTypeFromCookie = Cookies.get("loginType");
    if (loginTypeFromCookie === "macAddress" || loginTypeFromCookie === "mac") {
      // Get unique dates and sort them
      const uniqueDates = [...new Set(reports.map((r) => r.date))].sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime(),
      );

      // Only take the 2 most recent dates
      const allowedDates = uniqueDates.slice(0, 2);

      filteredReports = reports.filter((report) =>
        allowedDates.includes(report.date),
      );
    }

    filteredReports.forEach((report) => {
      if (!groups[report.date]) {
        groups[report.date] = {
          reports: [],
          totals: {
            playtimeFee: 0,
            serviceFee: 0,
            momo: 0,
            expense: 0,
            total: 0,
          },
        };
      }

      groups[report.date].reports.push(report);
      groups[report.date].totals.playtimeFee += report.playtimeFee;
      groups[report.date].totals.serviceFee += report.serviceFee;
      groups[report.date].totals.momo += report.momo;
      groups[report.date].totals.expense += report.expense;
      groups[report.date].totals.total +=
        report.playtimeFee + report.serviceFee - report.expense;
    });

    // Sort dates in descending order
    return Object.entries(groups).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
    );
  }, [reports]);

  // Toggle collapse for a specific date
  const toggleDayCollapse = (date: string) => {
    setCollapsedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterDate) params.append("date", filterDate);
      if (filterShift) {
        // Convert display shift to enum format for API
        const enumShift =
          filterShift === "Sáng"
            ? "SANG"
            : filterShift === "Chiều"
              ? "CHIEU"
              : "TOI";
        params.append("shift", enumShift);
      }
      params.append("page", page.toString());
      params.append("limit", PAGE_SIZE.toString());

      const response = await fetch(`/api/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Transform API data to match frontend interface
          const transformedReports = data.data.map((report: any) => {
            // console.log("Processing report:", report); // Debug log

            const inter = report?.fileUrl?.interShiftExpense || {};

            // Map shift values from enum to display text
            let shiftValue = "N/A";
            if (report.shift === "SANG") shiftValue = "Sáng";
            else if (report.shift === "CHIEU") shiftValue = "Chiều";
            else if (report.shift === "TOI") shiftValue = "Tối";
            else shiftValue = report.shift || "N/A";

            const transformed = {
              id: report.id,
              date: new Date(report.date).toISOString().split("T")[0],
              time: new Date(report.date)
                .toTimeString()
                .split(" ")[0]
                .substring(0, 5),
              shift: shiftValue,
              playtimeFee: report.details?.GIO || 0,
              serviceFee: report.details?.DICH_VU || 0,
              momo: report.details?.MOMO || 0,
              expense: report.details?.CHI || 0,
              counterStaffId: report.counterStaffId,
              kitchenStaffId: report.kitchenStaffId,
              securityStaffId: report.securityStaffId,
              note: report.note || "",
              // map inter-shift expense from JSON fileUrl
              interShiftExpenseAmount: inter?.amount || 0,
              interShiftExpenseSourceShift: inter?.sourceShift || "",
              interShiftExpenseSourceDate: inter?.sourceDate || "",
              details: "Chi tiết báo cáo",
            };

            // console.log("Transformed report:", transformed); // Debug log
            return transformed;
          });

          setReports(transformedReports);
          // For pagination with grouped dates, we need to consider that each page shows PAGE_SIZE reports
          // but the actual display is grouped by date, so totalPages should be based on total reports
          const totalReports = data.data?.length || 0;
          setTotalPages(Math.max(1, Math.ceil(totalReports / PAGE_SIZE)));
        } else {
          setReports([]);
          setTotalPages(1);
        }
      } else {
        console.error("Failed to fetch reports:", response.status);
        setReports([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff from API and map the same list to all 3 dropdowns
  // Set default staff values when staff data is available
  useEffect(() => {
    const allStaff = [...staff.cashiers, ...staff.kitchen, ...staff.security];
    if (allStaff.length > 0) {
      setFormValues((prev) => ({
        ...prev,
        cashier: allStaff[0].fullName,
        kitchenStaff: allStaff[0].fullName,
        securityGuard: allStaff[0].fullName,
      }));
    }
  }, [staff]);

  // Load data on mount and when filters change
  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    fetchTimeoutRef.current = setTimeout(() => {
      fetchReports();
    }, 100);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [filterDate, filterShift, page]);

  // Set default collapsed state when reports change
  useEffect(() => {
    if (reports.length > 0) {
      const allDates = reports.map((r) => r.date);
      setCollapsedDays(new Set(allDates));
    }
  }, [reports]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterDate, filterShift]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const handleViewDetails = (report: Report) => {
    setDrawerMode("view");
    setFormValues({
      id: report.id,
      date: report.date,
      time: report.time,
      shift: report.shift,
      playtimeFee: String(report.playtimeFee),
      serviceFee: String(report.serviceFee),
      momo: String(report.momo),
      expense: String(report.expense),
      interShiftExpenseAmount: String(report.interShiftExpenseAmount || "0"),
      interShiftExpenseSourceShift: report.interShiftExpenseSourceShift || "",
      interShiftExpenseSourceDate: report.interShiftExpenseSourceDate || "",
      cashier: getStaffNameById(report.counterStaffId, staff.cashiers),
      kitchenStaff: getStaffNameById(report.kitchenStaffId, staff.kitchen),
      securityGuard: getStaffNameById(report.securityStaffId, staff.security),
      note: report.note,
    });
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenCreateDrawer = () => {
    setDrawerMode("create");
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0].substring(0, 5); // HH:MM
    const hour = now.getHours();
    let shift = "Tối";
    if (hour >= 7 && hour < 15) shift = "Sáng";
    if (hour >= 15 && hour < 22) shift = "Chiều";

    setFormValues({
      id: 0,
      date,
      time,
      shift,
      playtimeFee: "",
      serviceFee: "",
      momo: "",
      expense: "",
      interShiftExpenseAmount: "",
      interShiftExpenseSourceShift: "",
      interShiftExpenseSourceDate: "",
      cashier: staff.cashiers[0]?.fullName || "",
      kitchenStaff: staff.kitchen[0]?.fullName || "",
      securityGuard: staff.security[0]?.fullName || "",
      note: "",
    });
    setIsDrawerOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    const numericFields = [
      "playtimeFee",
      "serviceFee",
      "momo",
      "expense",
      "interShiftExpenseAmount",
    ];

    if (numericFields.includes(name)) {
      // playtimeFee allows negative values (for refunds, discounts, etc.)
      // Other fields only allow positive values
      const isNegativeAllowed = name === "playtimeFee";

      if (isNegativeAllowed) {
        // For playtimeFee: allow negative and positive, but prevent values between -1000 and 1000
        const numValue = parseFloat(value);
        if (
          value === "" ||
          value === "-" ||
          numValue <= -1000 ||
          numValue >= 1000 ||
          (numValue > -1000 && numValue < 1000 && numValue !== 0)
        ) {
          setFormValues((prev) => ({ ...prev, [name]: value }));
        }
      } else {
        // For other fields: only allow positive values >= 1000
        const regex = /^\d*\.?\d*$/;
        if (regex.test(value) || value === "") {
          setFormValues((prev) => ({ ...prev, [name]: value }));
        }
      }
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validate field when user leaves (blur event)
  const handleFieldBlur = (fieldName: string, value: string) => {
    // Skip validation if field is empty or just whitespace
    if (!value || value.trim() === "") {
      return;
    }

    const numValue = parseFloat(value) || 0;

    if (fieldName === "playtimeFee") {
      // playtimeFee can be negative or positive, but must be <= -1000 or >= 1000
      if (numValue > -1000 && numValue < 1000 && numValue !== 0) {
        alert(
          `Tiền giờ chơi phải <= -1,000 VNĐ hoặc >= 1,000 VNĐ. Giá trị hiện tại: ${numValue}`,
        );
        // Don't clear the field, let user edit it
        return;
      }
    } else if (fieldName === "serviceFee") {
      // serviceFee must be >= 1000
      if (numValue < 1000) {
        alert(`Tiền dịch vụ phải >= 1,000 VNĐ. Giá trị hiện tại: ${numValue}`);
        // Don't clear the field, let user edit it
        return;
      }
    } else if (fieldName === "momo") {
      // momo must be >= 1000
      if (numValue < 1000) {
        alert(`Momo phải >= 1,000 VNĐ. Giá trị hiện tại: ${numValue}`);
        // Don't clear the field, let user edit it
        return;
      }
    } else if (fieldName === "expense") {
      // expense can be 0 or >= 1000, but cannot be negative
      if (numValue < 0) {
        alert(`Chi phí không được âm. Giá trị hiện tại: ${numValue}`);
        return;
      }
      if (numValue > 0 && numValue < 1000) {
        alert(
          `Chi phí phải = 0 hoặc >= 1,000 VNĐ. Giá trị hiện tại: ${numValue}`,
        );
        return;
      }
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate financial data - all amounts must be >= 1000 for positive, <= -1000 for negative
    const playtimeFee = parseFloat(formValues.playtimeFee) || 0;
    const serviceFee = parseFloat(formValues.serviceFee) || 0;
    const momo = parseFloat(formValues.momo) || 0;
    const expense = parseFloat(formValues.expense) || 0;

    // Validate playtime fee (can be negative or positive)
    if (playtimeFee > 0 && playtimeFee < 1000) {
      alert("Tiền giờ chơi dương phải >= 1,000 VNĐ");
      return;
    }
    if (playtimeFee < 0 && playtimeFee > -1000) {
      alert("Tiền giờ chơi âm phải <= -1,000 VNĐ");
      return;
    }

    // Validate other fields (must be >= 1000)
    if (serviceFee < 1000) {
      alert("Tiền dịch vụ phải >= 1,000 VNĐ");
      return;
    }

    if (momo < 1000) {
      alert("Momo phải >= 1,000 VNĐ");
      return;
    }

    // Validate expense (can be 0 or positive, cannot be negative)
    if (isNaN(expense) || expense < 0) {
      alert("Chi phí không được âm");
      return;
    }

    try {
      // Find staff IDs by name
      const counterStaff = staff.cashiers.find(
        (s) => s.fullName === formValues.cashier,
      );
      const kitchenStaff = staff.kitchen.find(
        (s) => s.fullName === formValues.kitchenStaff,
      );
      const securityStaff = staff.security.find(
        (s) => s.fullName === formValues.securityGuard,
      );

      if (!counterStaff || !kitchenStaff || !securityStaff) {
        alert("Vui lòng chọn đầy đủ nhân viên cho tất cả các vị trí");
        return;
      }

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formValues.date,
          shift:
            formValues.shift === "Sáng"
              ? "SANG"
              : formValues.shift === "Chiều"
                ? "CHIEU"
                : "TOI",
          playtimeMoney: formValues.playtimeFee,
          serviceMoney: formValues.serviceFee,
          momo: formValues.momo,
          expenses: formValues.expense,
          counterStaffId: counterStaff.id,
          kitchenStaffId: kitchenStaff.id,
          securityStaffId: securityStaff.id,
          notes: formValues.note,
          interShiftExpenseAmount: formValues.interShiftExpenseAmount,
          interShiftExpenseSourceShift: formValues.interShiftExpenseSourceShift,
          interShiftExpenseSourceDate: formValues.interShiftExpenseSourceDate,
        }),
      });

      if (response.ok) {
        setIsDrawerOpen(false);
        // Refresh reports list
        fetchReports();
      } else {
        const error = await response.json();
        alert("Lỗi: " + (error.message || "Không thể lưu báo cáo"));
      }
    } catch (error) {
      console.error("Error creating report:", error);
      alert("Lỗi khi lưu báo cáo");
    }
  };

  const totalNew =
    (parseFloat(formValues.playtimeFee) || 0) +
    (parseFloat(formValues.serviceFee) || 0) -
    (parseFloat(formValues.expense) || 0);

  const eligibleShifts = useMemo(() => {
    const amount = parseFloat(amountToWithdraw) || 0;
    if (amount <= 0) return [];

    // Chỉ lấy dữ liệu của 7 ngày gần nhất
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Sắp xếp báo cáo từ mới nhất đến cũ nhất để ưu tiên lấy từ ca gần nhất
    return reports
      .filter((r) => {
        const reportDate = new Date(r.date);
        reportDate.setHours(0, 0, 0, 0);
        return reportDate >= sevenDaysAgo;
      })
      .filter(
        (r) => r.playtimeFee + r.serviceFee - r.momo - r.expense >= amount,
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [amountToWithdraw, reports]);

  const handleSelectSourceShift = (report: Report) => {
    // Convert display shift back to enum format
    const enumShift =
      report.shift === "Sáng"
        ? "SANG"
        : report.shift === "Chiều"
          ? "CHIEU"
          : "TOI";

    setFormValues((prev) => ({
      ...prev,
      interShiftExpenseAmount: amountToWithdraw,
      interShiftExpenseSourceShift: enumShift,
      interShiftExpenseSourceDate: report.date,
    }));
    setIsSourceShiftModalOpen(false);
    setAmountToWithdraw("0");
  };

  const handleClearInterShiftExpense = () => {
    setFormValues((prev) => ({
      ...prev,
      interShiftExpenseAmount: "0",
      interShiftExpenseSourceShift: "",
      interShiftExpenseSourceDate: "",
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-900 text-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh sách báo cáo Gateway</h1>
        <button
          onClick={handleOpenCreateDrawer}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Tạo báo cáo
        </button>
      </div>

      {/* Vùng filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex-1">
          <label
            htmlFor="date-filter"
            className="block text-sm font-medium mb-1"
          >
            Ngày
          </label>
          <input
            id="date-filter"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="shift-filter"
            className="block text-sm font-medium mb-1"
          >
            Ca
          </label>
          <select
            id="shift-filter"
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            <option value="Sáng">Sáng</option>
            <option value="Chiều">Chiều</option>
            <option value="Tối">Tối</option>
          </select>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3 text-left font-semibold">Ngày</th>
              <th className="p-3 text-right font-semibold">Tiền giờ chơi</th>
              <th className="p-3 text-right font-semibold">Tiền dịch vụ</th>
              <th className="p-3 text-right font-semibold">Momo</th>
              <th className="p-3 text-right font-semibold">Chi</th>
              <th className="p-3 text-right font-semibold">Tổng</th>
              <th className="p-3 text-center font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-400">
                  Đang tải...
                </td>
              </tr>
            ) : groupedReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-400">
                  Không có báo cáo nào khớp với bộ lọc
                </td>
              </tr>
            ) : (
              groupedReports.map(([date, group]) => {
                const isCollapsed = collapsedDays.has(date);
                return (
                  <React.Fragment key={date}>
                    {/* Daily summary row */}
                    <tr
                      className="border-b border-gray-700 bg-gray-700/50 hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                      onClick={() => toggleDayCollapse(date)}
                    >
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-2">
                          <svg
                            className={`w-4 h-4 transition-transform ${isCollapsed ? "rotate-90" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <div className="text-left">
                            <div className="font-semibold">
                              {new Date(date).toLocaleDateString("vi-VN", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-medium">
                        {group.totals.playtimeFee.toLocaleString("en-US")}
                      </td>
                      <td className="p-3 text-right font-mono font-medium">
                        {group.totals.serviceFee.toLocaleString("en-US")}
                      </td>
                      <td className="p-3 text-right font-mono font-medium">
                        {group.totals.momo.toLocaleString("en-US")}
                      </td>
                      <td className="p-3 text-right font-mono font-medium">
                        {group.totals.expense.toLocaleString("en-US")}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-lg">
                        <span
                          className={`${group.totals.total >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {group.totals.total.toLocaleString("en-US")}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-gray-400">
                            {group.reports.length} ca
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Shift detail rows (when expanded) */}
                    {!isCollapsed &&
                      group.reports.map((report, index) => {
                        const total =
                          report.playtimeFee +
                          report.serviceFee -
                          report.expense;
                        return (
                          <tr
                            key={report.id}
                            className="border-b border-gray-700 hover:bg-gray-600 transition-colors duration-200 bg-gray-800/30"
                            onClick={(e) => e.stopPropagation()} // Prevent click from bubbling up to parent row
                          >
                            <td className="p-3 pl-8 text-sm text-gray-300">
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                                  ID: {report.id}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                                  {report.time}
                                </span>
                                <span className="px-3 py-1 bg-blue-600/30 text-blue-400 rounded-full text-xs font-medium border border-blue-600/50">
                                  {report.shift}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Ca {index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-right font-mono text-sm">
                              {report.playtimeFee.toLocaleString("en-US")}
                            </td>
                            <td className="p-3 text-right font-mono text-sm">
                              {report.serviceFee.toLocaleString("en-US")}
                            </td>
                            <td className="p-3 text-right font-mono text-sm">
                              {report.momo.toLocaleString("en-US")}
                            </td>
                            <td className="p-3 text-right font-mono text-sm">
                              {report.expense.toLocaleString("en-US")}
                            </td>
                            <td className="p-3 text-right font-mono text-sm font-medium">
                              <span
                                className={`${total >= 0 ? "text-green-400" : "text-red-400"}`}
                              >
                                {total.toLocaleString("en-US")}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent click from bubbling up
                                  handleViewDetails(report);
                                }}
                                className="text-green-400 hover:text-green-300 hover:underline text-sm px-2 py-1 rounded hover:bg-green-400/10 transition-colors"
                              >
                                Xem
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Trước
        </button>
        <span className="font-semibold">
          Trang {page} / {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sau
        </button>
      </div>

      {/* Main Drawer for Create/View */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-40"
            onClick={closeDrawer}
          ></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out translate-x-0">
            <form
              onSubmit={handleCreateReport}
              className="p-6 h-full flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {drawerMode === "view"
                    ? `Chi tiết Báo cáo #${formValues.id}`
                    : "Tạo Báo Cáo Mới"}
                </h2>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                {/* Khu vực thông tin ca */}
                <div>
                  <h3 className="text-md font-semibold mb-2 text-gray-300 border-b border-gray-700 pb-2">
                    Thông tin ca làm việc
                  </h3>
                  <div className="grid grid-cols-12 gap-4 pt-2">
                    <div className="col-span-4">
                      <label
                        htmlFor="date"
                        className="block text-sm font-medium mb-1"
                      >
                        Ngày
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formValues.date}
                        onChange={handleFormChange}
                        disabled={drawerMode === "view"}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                      />
                    </div>
                    <div className="col-span-4">
                      <label
                        htmlFor="time"
                        className="block text-sm font-medium mb-1"
                      >
                        Giờ
                      </label>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        value={formValues.time}
                        onChange={handleFormChange}
                        disabled={drawerMode === "view"}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                      />
                    </div>
                    <div className="col-span-4">
                      <label
                        htmlFor="shift"
                        className="block text-sm font-medium mb-1"
                      >
                        Ca
                      </label>
                      <select
                        id="shift"
                        name="shift"
                        value={formValues.shift}
                        onChange={handleFormChange}
                        disabled={drawerMode === "view"}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                      >
                        {shifts.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Khu vực nhân sự */}
                <div>
                  <h3 className="text-md font-semibold mb-2 text-gray-300 border-b border-gray-700 pb-2">
                    Thông tin nhân viên
                  </h3>
                  <div className="grid grid-cols-12 gap-4 pt-2">
                    <div className="col-span-4">
                      <label
                        htmlFor="cashier"
                        className="block text-sm font-medium mb-1"
                      >
                        Quầy
                      </label>
                      <select
                        id="cashier"
                        name="cashier"
                        value={formValues.cashier}
                        onChange={handleFormChange}
                        disabled={drawerMode === "view"}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                      >
                        {staff.cashiers.map((staffMember) => (
                          <option
                            key={staffMember.id}
                            value={staffMember.fullName}
                          >
                            {staffMember.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <label
                        htmlFor="kitchenStaff"
                        className="block text-sm font-medium mb-1"
                      >
                        Bếp
                      </label>
                      <select
                        id="kitchenStaff"
                        name="kitchenStaff"
                        value={formValues.kitchenStaff}
                        onChange={handleFormChange}
                        disabled={drawerMode === "view"}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                      >
                        {staff.kitchen.map((staffMember) => (
                          <option
                            key={staffMember.id}
                            value={staffMember.fullName}
                          >
                            {staffMember.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <label
                        htmlFor="securityGuard"
                        className="block text-sm font-medium mb-1"
                      >
                        Bảo vệ
                      </label>
                      <select
                        id="securityGuard"
                        name="securityGuard"
                        value={formValues.securityGuard}
                        onChange={handleFormChange}
                        disabled={drawerMode === "view"}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                      >
                        {staff.security.map((staffMember) => (
                          <option
                            key={staffMember.id}
                            value={staffMember.fullName}
                          >
                            {staffMember.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Khu vực tài chính */}
                <div>
                  <h3 className="text-md font-semibold mb-2 text-gray-300 border-b border-gray-700 pb-2">
                    Chi tiết tài chính
                  </h3>
                  <div className="grid grid-cols-12 gap-4 pt-2">
                    <div className="col-span-3">
                      <label
                        htmlFor="playtimeFee"
                        className="block text-sm font-medium mb-1"
                      >
                        Tiền giờ chơi
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        id="playtimeFee"
                        name="playtimeFee"
                        value={formValues.playtimeFee}
                        onChange={handleFormChange}
                        onBlur={(e) =>
                          handleFieldBlur("playtimeFee", e.target.value)
                        }
                        disabled={drawerMode === "view"}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                      />
                    </div>
                    <div className="col-span-3">
                      <label
                        htmlFor="serviceFee"
                        className="block text-sm font-medium mb-1"
                      >
                        Tiền dịch vụ
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        id="serviceFee"
                        name="serviceFee"
                        value={formValues.serviceFee}
                        onChange={handleFormChange}
                        onBlur={(e) =>
                          handleFieldBlur("serviceFee", e.target.value)
                        }
                        disabled={drawerMode === "view"}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                      />
                    </div>
                    <div className="col-span-3">
                      <label
                        htmlFor="momo"
                        className="block text-sm font-medium mb-1"
                      >
                        Momo
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        id="momo"
                        name="momo"
                        value={formValues.momo}
                        onChange={handleFormChange}
                        onBlur={(e) => handleFieldBlur("momo", e.target.value)}
                        disabled={drawerMode === "view"}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                      />
                    </div>
                    <div className="col-span-3">
                      <label
                        htmlFor="expense"
                        className="block text-sm font-medium mb-1"
                      >
                        Chi
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        id="expense"
                        name="expense"
                        value={formValues.expense}
                        onChange={handleFormChange}
                        onBlur={(e) =>
                          handleFieldBlur("expense", e.target.value)
                        }
                        disabled={drawerMode === "view"}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Khu vực chi từ ca khác */}
                <div>
                  <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <h3 className="text-md font-semibold text-gray-300">
                      Khoản chi từ ca khác
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsSourceShiftModalOpen(true)}
                      className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors"
                      title="Lấy tiền từ ca khác"
                      disabled={drawerMode === "view"}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                        />
                      </svg>
                    </button>
                  </div>
                  {parseFloat(formValues.interShiftExpenseAmount) > 0 && (
                    <div className="relative mt-2 p-3 bg-gray-700/70 rounded-md text-sm">
                      <button
                        type="button"
                        onClick={handleClearInterShiftExpense}
                        className="absolute top-1 right-1 p-0.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
                        title="Xóa khoản đã lấy"
                        disabled={drawerMode === "view"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      <p>
                        <strong>Đã lấy:</strong>{" "}
                        <span className="font-mono text-red-400">
                          {parseFloat(
                            formValues.interShiftExpenseAmount,
                          ).toLocaleString("en-US")}{" "}
                          VNĐ
                        </span>
                      </p>
                      <p>
                        <strong>Từ ca:</strong>{" "}
                        {formValues.interShiftExpenseSourceShift === "Sáng"
                          ? "Sáng"
                          : formValues.interShiftExpenseSourceShift === "CHIEU"
                            ? "Chiều"
                            : formValues.interShiftExpenseSourceShift === "TOI"
                              ? "Tối"
                              : formValues.interShiftExpenseSourceShift}
                        , Ngày {formValues.interShiftExpenseSourceDate}
                      </p>
                    </div>
                  )}
                </div>

                {/* Khu vực tổng kết */}
                <div className="pt-2 border-t border-gray-700">
                  <p className="text-lg">
                    <strong>Tổng:</strong>{" "}
                    <span
                      className={`font-mono font-bold ${totalNew < 0 ? "text-red-400" : "text-green-400"}`}
                    >
                      {totalNew.toLocaleString("en-US")} VNĐ
                    </span>
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="note"
                    className="block text-sm font-medium mb-1"
                  >
                    Ghi chú (Chi tiết)
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formValues.note}
                    onChange={handleFormChange}
                    rows={4}
                    disabled={drawerMode === "view"}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 mt-auto border-t border-gray-700">
                {drawerMode === "create" && (
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Lưu Báo Cáo
                  </button>
                )}
              </div>
            </form>
          </div>
        </>
      )}

      {/* Modal chọn ca lấy tiền */}
      {isSourceShiftModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                Chọn ca để lấy tiền
              </h2>
              <button
                onClick={() => setIsSourceShiftModalOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="amountToWithdraw"
                  className="block text-sm font-medium mb-1 text-gray-300"
                >
                  Số tiền cần lấy
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  id="amountToWithdraw"
                  name="amountToWithdraw"
                  value={amountToWithdraw}
                  onChange={(e) =>
                    /^\d*\.?\d*$/.test(e.target.value) &&
                    setAmountToWithdraw(e.target.value)
                  }
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                  placeholder="Nhập số tiền..."
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                <h3 className="text-md font-semibold text-gray-300">
                  Các ca có đủ doanh số:
                </h3>
                {eligibleShifts.length > 0 ? (
                  eligibleShifts.map((report) => (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => handleSelectSourceShift(report)}
                      className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex justify-between items-center"
                    >
                      <span>
                        Ca <strong>{report.shift}</strong> - Ngày {report.date}
                      </span>
                      <span className="font-mono text-green-400">
                        {(
                          report.playtimeFee +
                          report.serviceFee -
                          report.momo -
                          report.expense
                        ).toLocaleString("en-US")}{" "}
                        VNĐ
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm p-3 bg-gray-900/50 rounded-md">
                    {parseFloat(amountToWithdraw) > 0
                      ? "Không tìm thấy ca nào phù hợp."
                      : "Vui lòng nhập số tiền cần lấy."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
