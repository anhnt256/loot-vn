"use client";

import React, { useState, useMemo } from "react";

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
  cashier: string;
  kitchenStaff: string;
  securityGuard: string;
  note: string;
  details: string;
}

const initialReports: Report[] = [
  {
    id: 1,
    date: "2024-06-01",
    shift: "Sáng",
    time: "08:30:15",
    playtimeFee: 100000,
    serviceFee: 50000,
    momo: 50000,
    expense: 10000,
    cashier: "Nhân viên A",
    kitchenStaff: "Đầu bếp X",
    securityGuard: "Bảo vệ 1",
    note: "Báo cáo ca sáng",
    details:
      "Chi tiết giao dịch 1: Khách chơi 100k, nạp 50k game A, trả 50k qua momo. Chi 10k tiền nước.",
  },
  {
    id: 2,
    date: "2024-06-01",
    shift: "Chiều",
    time: "14:05:45",
    playtimeFee: 150000,
    serviceFee: 50000,
    momo: 0,
    expense: 20000,
    interShiftExpenseAmount: 50000,
    interShiftExpenseSourceShift: "Sáng",
    interShiftExpenseSourceDate: "2024-06-01",
    cashier: "Nhân viên B",
    kitchenStaff: "Không có",
    securityGuard: "Bảo vệ 2",
    note: "Báo cáo ca chiều",
    details:
      "Chi tiết giao dịch 2: Khách chơi 150k, bán 2 thẻ 25k. Chi 20k tiền ăn. Lấy 50k từ ca sáng.",
  },
  // Thêm dữ liệu mẫu khác nếu cần
];

const mockStaff = {
  cashiers: ["Nhân viên A", "Nhân viên B", "Nhân viên C"],
  kitchen: ["Đầu bếp X", "Đầu bếp Y", "Không có"],
  security: ["Bảo vệ 1", "Bảo vệ 2", "Không có"],
};

const shifts = ["Sáng", "Chiều", "Tối"];
const PAGE_SIZE = 10;

export default function AdminReportsPage() {
  const [reports, setReports] = useState(initialReports);
  const [filterDate, setFilterDate] = useState("");
  const [filterShift, setFilterShift] = useState("");
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "view">("create");
  const [isSourceShiftModalOpen, setIsSourceShiftModalOpen] = useState(false);
  const [amountToWithdraw, setAmountToWithdraw] = useState("0");

  const [formValues, setFormValues] = useState({
    id: 0,
    date: "",
    time: "",
    shift: "Sáng",
    playtimeFee: "0",
    serviceFee: "0",
    momo: "0",
    expense: "0",
    interShiftExpenseAmount: "0",
    interShiftExpenseSourceShift: "",
    interShiftExpenseSourceDate: "",
    cashier: mockStaff.cashiers[0],
    kitchenStaff: mockStaff.kitchen[0],
    securityGuard: mockStaff.security[0],
    note: "",
  });

  const [formDefaults, setFormDefaults] = useState({
    date: "",
    time: "",
    shift: "",
  });

  // Lọc và phân trang dựa trên state `reports`
  const filteredReports = useMemo(
    () =>
      reports.filter((r) => {
        const matchDate = filterDate ? r.date === filterDate : true;
        const matchShift = filterShift ? r.shift === filterShift : true;
        return matchDate && matchShift;
      }),
    [reports, filterDate, filterShift],
  );

  // Phân trang
  const totalPage = Math.ceil(filteredReports.length / PAGE_SIZE);
  const paginatedReports = filteredReports.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPage, p + 1));

  // Reset về trang 1 khi filter thay đổi
  React.useEffect(() => {
    setPage(1);
  }, [filterDate, filterShift]);

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
      cashier: report.cashier,
      kitchenStaff: report.kitchenStaff,
      securityGuard: report.securityGuard,
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
      playtimeFee: "0",
      serviceFee: "0",
      momo: "0",
      expense: "0",
      interShiftExpenseAmount: "0",
      interShiftExpenseSourceShift: "",
      interShiftExpenseSourceDate: "",
      cashier: mockStaff.cashiers[0],
      kitchenStaff: mockStaff.kitchen[0],
      securityGuard: mockStaff.security[0],
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
      const isNegativeAllowed = name === "playtimeFee";
      const regex = isNegativeAllowed ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
      if (regex.test(value) || value === "") {
        setFormValues((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: Report = {
      id: Math.max(0, ...reports.map((r) => r.id)) + 1,
      date: formValues.date,
      time: formValues.time,
      shift: formValues.shift,
      playtimeFee: parseFloat(formValues.playtimeFee) || 0,
      serviceFee: parseFloat(formValues.serviceFee) || 0,
      momo: parseFloat(formValues.momo) || 0,
      expense: parseFloat(formValues.expense) || 0,
      interShiftExpenseAmount:
        parseFloat(formValues.interShiftExpenseAmount) || 0,
      interShiftExpenseSourceShift: formValues.interShiftExpenseSourceShift,
      interShiftExpenseSourceDate: formValues.interShiftExpenseSourceDate,
      cashier: formValues.cashier,
      kitchenStaff: formValues.kitchenStaff,
      securityGuard: formValues.securityGuard,
      note: formValues.note,
      details: formValues.note,
    };
    setReports((prev) => [newReport, ...prev]);
    setIsDrawerOpen(false);
  };

  const totalNew =
    (parseFloat(formValues.playtimeFee) || 0) +
    (parseFloat(formValues.serviceFee) || 0) -
    (parseFloat(formValues.momo) || 0) -
    (parseFloat(formValues.expense) || 0);

  const eligibleShifts = useMemo(() => {
    const amount = parseFloat(amountToWithdraw) || 0;
    if (amount <= 0) return [];

    // Sắp xếp báo cáo từ mới nhất đến cũ nhất để ưu tiên lấy từ ca gần nhất
    return reports
      .filter(
        (r) => r.playtimeFee + r.serviceFee - r.momo - r.expense >= amount,
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [amountToWithdraw, reports]);

  const handleSelectSourceShift = (report: Report) => {
    setFormValues((prev) => ({
      ...prev,
      interShiftExpenseAmount: amountToWithdraw,
      interShiftExpenseSourceShift: report.shift,
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
              <th className="p-3 text-left font-semibold">ID</th>
              <th className="p-3 text-left font-semibold">Ngày</th>
              <th className="p-3 text-left font-semibold">Giờ</th>
              <th className="p-3 text-left font-semibold">Ca</th>
              <th className="p-3 text-right font-semibold">Tiền giờ chơi</th>
              <th className="p-3 text-right font-semibold">Tiền dịch vụ</th>
              <th className="p-3 text-right font-semibold">Momo</th>
              <th className="p-3 text-right font-semibold">Chi</th>
              <th className="p-3 text-right font-semibold">Tổng</th>
              <th className="p-3 text-center font-semibold">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center p-4 text-gray-400">
                  Không có báo cáo nào khớp với bộ lọc
                </td>
              </tr>
            ) : (
              paginatedReports.map((r) => {
                const total = r.playtimeFee + r.serviceFee - r.momo - r.expense;
                return (
                  <tr
                    key={r.id}
                    className="border-b border-gray-700 hover:bg-gray-600 transition-colors duration-200"
                  >
                    <td className="p-3">{r.id}</td>
                    <td className="p-3">{r.date}</td>
                    <td className="p-3">{r.time}</td>
                    <td className="p-3">{r.shift}</td>
                    <td className="p-3 text-right font-mono">
                      {r.playtimeFee.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {r.serviceFee.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {r.momo.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {r.expense.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {total.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleViewDetails(r)}
                        className="text-green-400 hover:underline"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
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
          Trang {page} / {totalPage}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPage}
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
                    <div className="col-span-5">
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
                    <div className="col-span-3">
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
                        {mockStaff.cashiers.map((name) => (
                          <option key={name} value={name}>
                            {name}
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
                        {mockStaff.kitchen.map((name) => (
                          <option key={name} value={name}>
                            {name}
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
                        {mockStaff.security.map((name) => (
                          <option key={name} value={name}>
                            {name}
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
                          ).toLocaleString()}{" "}
                          VNĐ
                        </span>
                      </p>
                      <p>
                        <strong>Từ ca:</strong>{" "}
                        {formValues.interShiftExpenseSourceShift}, Ngày{" "}
                        {formValues.interShiftExpenseSourceDate}
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
                      {totalNew.toLocaleString()} VNĐ
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

                <div>
                  <label
                    htmlFor="file"
                    className="block text-sm font-medium mb-1"
                  >
                    File (nếu có)
                  </label>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                    disabled={drawerMode === "view"}
                  />
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
                        ).toLocaleString()}{" "}
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
