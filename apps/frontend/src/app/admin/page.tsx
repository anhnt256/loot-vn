"use client";

import {
  Button,
  Card,
  Drawer,
  Select,
  Modal,
  Form,
  Radio,
  Input,
  message,
  Tabs,
} from "antd";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import _, { isEmpty } from "lodash";
import { EnumComputerStatus } from "@gateway-workspace/shared/utils";
import { usePolling } from "@gateway-workspace/shared/hooks";
import { useBranch } from "@gateway-workspace/shared/ui";
import Cookies from "js-cookie";
import {
  FaDesktop,
  FaKeyboard,
  FaMouse,
  FaHeadphones,
  FaChair,
  FaWifi,
  FaEdit,
  FaSave,
  FaPencilAlt,
  FaInfoCircle,
  FaEye,
} from "react-icons/fa";
import { Crown, Trophy } from "lucide-react";
import ComputerCard from "./_components/ComputerCard";
import "./admin-tabs.css";

interface DeviceHistory {
  id: number;
  createdAt: string;
  type: "REPORT" | "REPAIR";
  issue?: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
  technician?: string;
  note?: string | null;
  monitorStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  keyboardStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  mouseStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  headphoneStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  chairStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  networkStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  computerStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  // Add other fields if needed
}

interface DeviceStatus {
  id: number;
  monitorStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  keyboardStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  mouseStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  headphoneStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  chairStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  networkStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  computerStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  note?: string | null;
  histories: DeviceHistory[];
}

interface Computer {
  id: number;
  name: string;
  status: number;
  userId: number;
  userName: string;
  round: number;
  totalCheckIn: number;
  claimedCheckIn: number;
  availableCheckIn: number;
  stars: number;
  magicStone: number;
  devices: DeviceStatus[];
  userType?: number;
  isUseApp?: boolean;
  note?: string;
  battlePass?: {
    isUsed: boolean;
    isPremium: boolean;
    data: {
      level: number;
      exp: number;
    } | null;
  };
  machineDetails?: {
    netInfo?: {
      Cpu?: string;
      Gpu?: string;
      Memory?: string;
      Motherboard?: string;
      Storage?: string;
      Network?: string;
      cpu_load?: string;
      gpu_load?: string;
      ram_load?: string;
      cpu_temp?: string;
      gpu_temp?: string;
      ram_used?: string;
      ram_available?: string;
      disk_load?: string;
      net_download?: string;
      net_upload?: string;
    };
    machineGroupName?: string;
    pricePerHour?: number;
  };
}

interface DeviceStatusOption {
  value: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  label: string;
  color: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "GOOD":
      return "text-green-500";
    case "DAMAGED_BUT_USABLE":
      return "text-yellow-400";
    case "COMPLETELY_DAMAGED":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "GOOD":
      return "Tốt";
    case "DAMAGED_BUT_USABLE":
      return "Xài tạm";
    case "COMPLETELY_DAMAGED":
      return "Hỏng";
    default:
      return status;
  }
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString || dateString === "Invalid Date") {
    return "-";
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "-";
    }
    return date.toLocaleString();
  } catch (error) {
    return "-";
  }
};

const COUNT_DOWN_TIME = 90; // 1.5 phút thay vì 5 phút để cập nhật dữ liệu nhanh hơn

const COMBO_BG_COLOR = "bg-purple-700";

const AdminDashboard = () => {
  const refreshRef = useRef();
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [currentComputer, setCurrentComputer] = useState<
    Computer | undefined
  >();
  const [computers, setComputers] = useState<Computer[]>([]);
  const [countdown, setCountdown] = useState(COUNT_DOWN_TIME);
  const { branch: selectedBranch, loginType } = useBranch();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm] = Form.useForm();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm] = Form.useForm();
  const [showCheckLoginModal, setShowCheckLoginModal] = useState(false);
  const [checkLoginForm] = Form.useForm();
  const [searchUsers, setSearchUsers] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [migrateUser, setMigrateUser] = useState<any>(null);
  const [showMigrateModal, setShowMigrateModal] = useState(false);
  const [migrationInfo, setMigrationInfo] = useState<any>(null);
  const [isEditingUserName, setIsEditingUserName] = useState(false);
  const [editedUserName, setEditedUserName] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNote, setEditedNote] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteModalContent, setNoteModalContent] = useState("");
  const [fundAmount, setFundAmount] = useState<number | null>(null);

  const deviceList = [
    {
      key: "monitor",
      label: "Màn hình",
      icon: <FaDesktop className="text-lg" />,
    },
    {
      key: "keyboard",
      label: "Bàn phím",
      icon: <FaKeyboard className="text-lg" />,
    },
    { key: "mouse", label: "Chuột", icon: <FaMouse className="text-lg" /> },
    {
      key: "headphone",
      label: "Tai nghe",
      icon: <FaHeadphones className="text-lg" />,
    },
    { key: "chair", label: "Ghế", icon: <FaChair className="text-lg" /> },
    { key: "network", label: "Mạng", icon: <FaWifi className="text-lg" /> },
  ] as const;

  const deviceStatusOptions: DeviceStatusOption[] = [
    { value: "GOOD", label: "Hoạt động tốt", color: "text-green-500" },
    {
      value: "DAMAGED_BUT_USABLE",
      label: "Hỏng nhưng có thể sử dụng",
      color: "text-yellow-400",
    },
    {
      value: "COMPLETELY_DAMAGED",
      label: "Hỏng hoàn toàn",
      color: "text-red-500",
    },
  ];

  // Fetch fund amount function
  const fetchFund = useCallback(async () => {
    try {
      const response = await fetch("/api/game/fund");
      if (response.ok) {
        const amount = await response.json();
        setFundAmount(Number(amount) || 0);
      }
    } catch (error) {
      console.error("Error fetching fund:", error);
    }
  }, []);

  // Memoize the polling options
  const pollingOptions = useMemo(
    () => ({
      interval: COUNT_DOWN_TIME * 1000, // 90 seconds
      onSuccess: async (data: any[]) => {
        const computerSorted = _.sortBy(data, (o) => o.name);
        setComputers(computerSorted);
        setCountdown(COUNT_DOWN_TIME);
        // Fetch fund amount together with computer data
        await fetchFund();
      },
      onError: (error: Error) => {
        console.error("Error fetching data:", error);
      },
    }),
    [fetchFund],
  );

  const { data, refetch } = usePolling<any[]>(`/api/computer`, pollingOptions);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleReportIssue = () => {
    setShowReportModal(true);
  };

  const handleReportSubmit = async (values: any) => {
    try {
      const computerId = currentComputer?.id;

      const response = await fetch(`/api/devices/${computerId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "REPORT",
          status: "PENDING",
          issue: values.note,
          monitorStatus: values.monitorStatus,
          keyboardStatus: values.keyboardStatus,
          mouseStatus: values.mouseStatus,
          headphoneStatus: values.headphoneStatus,
          chairStatus: values.chairStatus,
          networkStatus: values.networkStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit report");
      }

      const result = await response.json();
      message.success("Báo cáo đã được gửi thành công");

      // Update the current computer's device status
      if (currentComputer && result.data) {
        setCurrentComputer((prev) => ({
          ...prev!,
          devices: [result.data.device],
        }));
      }

      setShowReportModal(false);
      reportForm.resetFields();
    } catch (error) {
      console.error("Error submitting report:", error);
      message.error("Có lỗi xảy ra khi gửi báo cáo");
    }
  };

  const handleUpdateDeviceStatus = async (values: any) => {
    try {
      const computerId = currentComputer?.id;

      const response = await fetch(`/api/devices/${computerId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "REPAIR",
          status: "RESOLVED",
          issue: values.note,
          monitorStatus: values.monitorStatus,
          keyboardStatus: values.keyboardStatus,
          mouseStatus: values.mouseStatus,
          headphoneStatus: values.headphoneStatus,
          chairStatus: values.chairStatus,
          networkStatus: values.networkStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update device status");
      }

      const result = await response.json();
      message.success("Cập nhật trạng thái thiết bị thành công");

      // Update the current computer's device status
      if (currentComputer && result.data) {
        setCurrentComputer((prev) => ({
          ...prev!,
          devices: [result.data.device],
        }));
      }

      setShowUpdateModal(false);
      updateForm.resetFields();
    } catch (error) {
      console.error("Error updating device status:", error);
      message.error("Có lỗi xảy ra khi cập nhật trạng thái thiết bị");
    }
  };

  const handleCheckLoginSearch = async () => {
    try {
      setLoadingSearch(true);
      const computerId = checkLoginForm.getFieldValue("computerId");
      const userName = checkLoginForm.getFieldValue("userName");

      if (!computerId && !userName) {
        message.error("Vui lòng nhập userName hoặc chọn số máy");
        return;
      }

      let requestBody = {};

      if (computerId && userName) {
        // Tìm kiếm theo số máy + userName (để chuyển đổi)
        const computer = computers.find((c) => c.id === computerId);
        if (!computer) {
          message.error("Không tìm thấy thông tin máy");
          return;
        }
        requestBody = {
          machineName: computer.name,
          userName: userName.trim(),
        };
      } else if (computerId) {
        // Tìm kiếm theo số máy riêng lẻ
        const computer = computers.find((c) => c.id === computerId);
        if (!computer) {
          message.error("Không tìm thấy thông tin máy");
          return;
        }
        requestBody = { machineName: computer.name };
      } else if (userName) {
        // Tìm kiếm theo userName riêng lẻ
        requestBody = { userName: userName.trim() };
      }

      const res = await fetch(`/api/check-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Không tìm thấy thông tin");
      }

      const data = await res.json();
      setSearchUsers(data?.data?.users || []);
      setMigrationInfo(data?.data);
    } catch (e: any) {
      message.error(e.message || "Có lỗi xảy ra khi tìm kiếm");
      setSearchUsers([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Thống kê số lượng máy theo trạng thái và combo
  const total = computers.length;
  const countReady = computers.filter(
    (c) => Number(c.status) === EnumComputerStatus.READY.id,
  ).length;
  const countOn = computers.filter(
    (c) => Number(c.status) === EnumComputerStatus.ON.id && c.userType !== 5,
  ).length;
  const countOff = computers.filter(
    (c) =>
      Number(c.status) !== EnumComputerStatus.READY.id &&
      Number(c.status) !== EnumComputerStatus.ON.id,
  ).length;
  const countCombo = computers.filter((c) => c.userType === 5).length;
  // Số máy hoạt động = máy đang sử dụng + combo
  const countActive = countOn + countCombo;

  // Chuẩn bị base info
  const baseUserId = migrationInfo?.userId;
  const baseUserName = (
    migrationInfo?.userName ||
    searchUsers[0]?.userName ||
    ""
  ).toLowerCase();
  const baseStars = migrationInfo?.starsCalculated;

  // Sort users theo mức độ tương đồng
  const sortedUsers = [...searchUsers].sort((a, b) => {
    // So sánh userId
    if (a.userId === baseUserId && b.userId !== baseUserId) return -1;
    if (a.userId !== baseUserId && b.userId === baseUserId) return 1;
    // So sánh username (không phân biệt hoa thường)
    if (
      a.userId === baseUserId &&
      b.userId === baseUserId &&
      a.userName?.toLowerCase() === baseUserName &&
      b.userName?.toLowerCase() !== baseUserName
    )
      return -1;
    if (
      a.userId === baseUserId &&
      b.userId === baseUserId &&
      a.userName?.toLowerCase() !== baseUserName &&
      b.userName?.toLowerCase() === baseUserName
    )
      return 1;
    // So sánh stars
    if (
      a.userId === baseUserId &&
      b.userId === baseUserId &&
      a.userName?.toLowerCase() === baseUserName &&
      b.userName?.toLowerCase() === baseUserName
    ) {
      if (a.stars === baseStars && b.stars !== baseStars) return -1;
      if (a.stars !== baseStars && b.stars === baseStars) return 1;
    }
    return 0;
  });

  // Kiểm tra có user nào trùng userId không
  const hasUserIdMatch = sortedUsers.some((u) => u.userId === baseUserId);

  // Thêm hàm cập nhật tên người dùng
  const handleUpdateUserName = async () => {
    if (!currentComputer) return;
    try {
      const res = await fetch("/api/computer/update-userName", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentComputer.userId,
          userName: editedUserName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentComputer({ ...currentComputer, userName: editedUserName });
        message.success("Đã cập nhật tên người dùng thành công!");
        // Refresh data từ server để cập nhật UI
        await refetch();
      } else {
        message.error(data.message || "Cập nhật thất bại");
      }
    } catch (e) {
      message.error("Có lỗi xảy ra khi cập nhật tên người dùng");
    }
    setIsEditingUserName(false);
  };

  // Thêm hàm cập nhật ghi chú
  const handleUpdateNote = async () => {
    if (!currentComputer) return;
    try {
      const res = await fetch("/api/user/note", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentComputer.userId,
          note: editedNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentComputer({ ...currentComputer, note: editedNote });
        message.success("Đã cập nhật ghi chú thành công!");
        // Refresh data từ server để cập nhật UI
        await refetch();
      } else {
        message.error(data.message || "Cập nhật thất bại");
      }
    } catch (e) {
      message.error("Có lỗi xảy ra khi cập nhật ghi chú");
    }
    setIsEditingNote(false);
  };

  // Thêm hàm cập nhật trạng thái quan tâm app
  const handleUpdateIsUseApp = async (isUseApp: boolean) => {
    if (!currentComputer) return;
    try {
      const res = await fetch("/api/user/is-use-app", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentComputer.userId,
          isUseApp: isUseApp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentComputer({ ...currentComputer, isUseApp: isUseApp });
        message.success(
          `Đã cập nhật trạng thái quan tâm app thành ${isUseApp ? "có" : "không"}!`,
        );
        // Refresh data từ server để cập nhật UI
        await refetch();
      } else {
        message.error(data.message || "Cập nhật thất bại");
      }
    } catch (e) {
      message.error("Có lỗi xảy ra khi cập nhật trạng thái quan tâm app");
    }
  };

  // Thêm hàm cập nhật ghi chú từ modal
  const handleUpdateNoteModal = async () => {
    if (!currentComputer) return;
    try {
      const res = await fetch("/api/user/note", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentComputer.userId,
          note: editedNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentComputer({ ...currentComputer, note: editedNote });
        message.success("Đã cập nhật ghi chú thành công!");
        setShowNoteModal(false);
        await refetch();
      } else {
        message.error(data.message || "Cập nhật thất bại");
      }
    } catch (e) {
      message.error("Có lỗi xảy ra khi cập nhật ghi chú");
    }
    setIsEditingNote(false);
  };

  return (
    <div className="flex flex-col p-5 gap-4">
      <div className="shadow-lg rounded-lg w-full overflow-auto max-h-[89vh] relative">
        <div className="w-full bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
          <div className="flex justify-between items-center gap-4 mt-4 text-sm mb-4">
            <div className="flex items-center gap-4">
              <Button
                className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowCheckLoginModal(true)}
              >
                Kiểm tra đăng nhập
              </Button>
              {fundAmount !== null &&
                (() => {
                  const upRateAmount =
                    Number(process.env.NEXT_PUBLIC_UP_RATE_AMOUNT) || 0;
                  const threshold = upRateAmount * 0.9; // 90% threshold
                  const isNearJackpot = fundAmount >= threshold;

                  return (
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                        isNearJackpot
                          ? "bg-red-600/40 border-red-500"
                          : "bg-yellow-600/20 border-yellow-600/50"
                      }`}
                    >
                      <span
                        className={`font-semibold ${
                          isNearJackpot ? "text-red-300" : "text-yellow-400"
                        }`}
                      >
                        Tổng quỹ: {fundAmount.toLocaleString("vi-VN")} VNĐ
                        {isNearJackpot && " ⚠️ Sắp nổ hũ!"}
                      </span>
                    </div>
                  );
                })()}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-300">{`Dữ liệu sẽ cập nhật sau: ${countdown}s`}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">
                  Hoạt động: {countActive}/{total}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-300">
                  Đang khởi động ({countReady})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-300">Đang sử dụng ({countOn})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-700"></div>
                <span className="text-gray-300">Combo ({countCombo})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-gray-300">Máy tắt ({countOff})</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-start items-center">
            {computers.map((item, index) => (
              <ComputerCard
                key={index}
                computer={item}
                onClick={() => {
                  setCurrentComputer(item);
                  setShowDetailDrawer(true);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <Drawer
        title={`Chi tiết máy ${currentComputer?.name}`}
        placement="right"
        onClose={() => {
          setShowDetailDrawer(false);
          setCurrentComputer(undefined);
          setIsEditingUserName(false);
          setIsEditingNote(false);
        }}
        open={showDetailDrawer}
        width={600}
        className="dark-drawer"
        styles={{
          header: {
            background: "#1f2937",
            color: "white",
            borderBottom: "1px solid #374151",
          },
          body: {
            background: "#1f2937",
            padding: "16px",
          },
          mask: {
            background: "rgba(0, 0, 0, 0.6)",
          },
          wrapper: {
            background: "#1f2937",
          },
          footer: {
            background: "#1f2937",
            borderTop: "1px solid #374151",
          },
        }}
      >
        {currentComputer && (
          <Tabs
            defaultActiveKey="0"
            className="text-gray-200 custom-admin-tabs"
            tabBarGutter={32}
            items={[
              {
                key: "0",
                label: (
                  <span className="text-base font-semibold">Thông tin máy</span>
                ),
                children: (
                  <div className="py-6 px-6 bg-[#23272f] rounded-lg border border-[#374151]">
                    {/* Machine Hardware Information Section */}
                    <div className="flex flex-col gap-4 pb-4 border-b border-gray-700">
                      <div className="flex flex-col gap-2">
                        <div className="text-lg font-bold text-white">
                          Thông tin phần cứng
                        </div>
                        {currentComputer.machineDetails?.netInfo ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* CPU Card */}
                            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                <div className="text-blue-400 font-semibold">
                                  CPU
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="font-bold text-white text-sm">
                                  {currentComputer.machineDetails.netInfo.Cpu ||
                                    "Unknown CPU"}
                                </div>
                                <div className="text-xs text-gray-300">
                                  Load:{" "}
                                  <span className="text-green-400 font-semibold">
                                    {currentComputer.machineDetails.netInfo
                                      .cpu_load || "0"}
                                    %
                                  </span>
                                </div>
                                {currentComputer.machineDetails.netInfo
                                  .cpu_temp && (
                                  <div className="text-xs text-gray-300">
                                    Nhiệt độ:{" "}
                                    <span className="text-blue-400 font-semibold">
                                      {
                                        currentComputer.machineDetails.netInfo
                                          .cpu_temp
                                      }
                                      °C
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* GPU Card */}
                            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                <div className="text-purple-400 font-semibold">
                                  GPU
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="font-bold text-white text-sm">
                                  {currentComputer.machineDetails.netInfo.Gpu ||
                                    "Unknown GPU"}
                                </div>
                                <div className="text-xs text-gray-300">
                                  Load:{" "}
                                  <span className="text-green-400 font-semibold">
                                    {currentComputer.machineDetails.netInfo
                                      .gpu_load || "0"}
                                    %
                                  </span>
                                </div>
                                {currentComputer.machineDetails.netInfo
                                  .gpu_temp && (
                                  <div className="text-xs text-gray-300">
                                    Nhiệt độ:{" "}
                                    <span className="text-blue-400 font-semibold">
                                      {
                                        currentComputer.machineDetails.netInfo
                                          .gpu_temp
                                      }
                                      °C
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* RAM Card */}
                            <div className="bg-gradient-to-br from-pink-900/30 to-pink-800/20 border border-pink-500/30 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                                <div className="text-pink-400 font-semibold">
                                  RAM
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="font-bold text-white text-sm">
                                  {currentComputer.machineDetails.netInfo
                                    .Memory || "Unknown RAM"}
                                </div>
                                <div className="text-xs text-gray-300">
                                  Load:{" "}
                                  <span className="text-pink-400 font-semibold">
                                    {currentComputer.machineDetails.netInfo
                                      .ram_load || "0"}
                                    %
                                  </span>
                                </div>
                                {currentComputer.machineDetails.netInfo
                                  .ram_used &&
                                  currentComputer.machineDetails.netInfo
                                    .ram_available && (
                                    <div className="text-xs text-gray-300">
                                      Đã dùng:{" "}
                                      <span className="text-yellow-400 font-semibold">
                                        {
                                          currentComputer.machineDetails.netInfo
                                            .ram_used
                                        }
                                        GB
                                      </span>
                                    </div>
                                  )}
                                {currentComputer.machineDetails.netInfo
                                  .ram_available && (
                                  <div className="text-xs text-gray-300">
                                    Còn lại:{" "}
                                    <span className="text-green-400 font-semibold">
                                      {
                                        currentComputer.machineDetails.netInfo
                                          .ram_available
                                      }
                                      GB
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Motherboard Card */}
                            <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <div className="text-green-400 font-semibold">
                                  Mainboard
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="font-bold text-white text-sm">
                                  {currentComputer.machineDetails.netInfo
                                    .Motherboard || "Unknown Motherboard"}
                                </div>
                              </div>
                            </div>

                            {/* Storage Card */}
                            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                <div className="text-yellow-400 font-semibold">
                                  Storage
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="font-bold text-white text-sm">
                                  {currentComputer.machineDetails.netInfo
                                    .Storage || "Unknown Storage"}
                                </div>
                                {currentComputer.machineDetails.netInfo
                                  .disk_load && (
                                  <div className="text-xs text-gray-300">
                                    Load:{" "}
                                    <span className="text-yellow-400 font-semibold">
                                      {
                                        currentComputer.machineDetails.netInfo
                                          .disk_load
                                      }
                                      %
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Network Card */}
                            <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-500/30 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                                <div className="text-cyan-400 font-semibold">
                                  Network
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="font-bold text-white text-sm">
                                  {currentComputer.machineDetails.netInfo
                                    .Network || "Unknown Network"}
                                </div>
                                {currentComputer.machineDetails.netInfo
                                  .net_download &&
                                  currentComputer.machineDetails.netInfo
                                    .net_upload && (
                                    <>
                                      <div className="text-xs text-gray-300">
                                        Download:{" "}
                                        <span className="text-green-400 font-semibold">
                                          {
                                            currentComputer.machineDetails
                                              .netInfo.net_download
                                          }
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-300">
                                        Upload:{" "}
                                        <span className="text-blue-400 font-semibold">
                                          {
                                            currentComputer.machineDetails
                                              .netInfo.net_upload
                                          }
                                        </span>
                                      </div>
                                    </>
                                  )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center py-8">
                            Không có thông tin phần cứng
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Machine Group and Pricing Information */}
                    <div className="flex flex-col gap-2 mt-4 py-4">
                      <div className="text-lg font-bold text-white">
                        Thông tin nhóm máy
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-400">Nhóm máy:</div>
                        <div className="font-bold text-white">
                          {currentComputer.machineDetails?.machineGroupName ||
                            "Default"}
                        </div>
                        <div className="text-gray-400">Giá/giờ:</div>
                        <div className="font-bold text-green-400">
                          {currentComputer.machineDetails?.pricePerHour
                            ? `${Number(currentComputer.machineDetails.pricePerHour).toLocaleString()} VNĐ`
                            : "Chưa có giá"}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "1",
                label: (
                  <span className="text-base font-semibold">
                    Thông tin cơ bản
                  </span>
                ),
                children: (
                  <div className="py-6 px-6 bg-[#23272f] rounded-lg border border-[#374151]">
                    {/* Computer Information Section */}
                    <div className="flex flex-col gap-4 pb-4 border-b border-gray-700">
                      <div className="flex flex-col gap-2">
                        <div className="text-lg font-bold text-white">
                          Thông tin cơ bản
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-400">Trạng thái:</div>
                          <div className="font-bold">
                            {currentComputer.userType === 5 ? (
                              <span className="text-purple-400">Combo</span>
                            ) : Number(currentComputer.status) ===
                              EnumComputerStatus.ON.id ? (
                              <span className="text-blue-400">
                                Đang sử dụng
                              </span>
                            ) : Number(currentComputer.status) ===
                              EnumComputerStatus.READY.id ? (
                              <span className="text-orange-400">
                                Đang khởi động
                              </span>
                            ) : (
                              <span className="text-gray-400">Máy tắt</span>
                            )}
                          </div>
                          <div className="text-gray-400 flex items-center gap-2">
                            Tên người dùng:
                            {currentComputer.userType !== 5 &&
                              currentComputer.isUseApp === false && (
                                <FaInfoCircle
                                  className="text-blue-400 cursor-help"
                                  title="Bạn cần bật 'Quan tâm App' để có thể đổi tên người dùng"
                                />
                              )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isEditingUserName ? (
                              <>
                                <input
                                  className="bg-gray-800 text-white border border-gray-500 rounded px-2 py-1 w-32 focus:outline-none"
                                  value={editedUserName}
                                  onChange={(e) =>
                                    setEditedUserName(e.target.value)
                                  }
                                  onBlur={() => setIsEditingUserName(false)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleUpdateUserName();
                                    if (e.key === "Escape")
                                      setIsEditingUserName(false);
                                  }}
                                />
                                <button
                                  className="text-green-400 hover:text-green-600"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleUpdateUserName();
                                  }}
                                  title="Lưu"
                                >
                                  <FaSave />
                                </button>
                              </>
                            ) : (
                              <>
                                <span
                                  className={`font-bold ${
                                    currentComputer.userType === 5
                                      ? "text-white"
                                      : currentComputer.isUseApp === false
                                        ? "text-red-500"
                                        : "text-white"
                                  }`}
                                >
                                  {currentComputer.userType === 5
                                    ? "Combo"
                                    : currentComputer.isUseApp === false
                                      ? "Không sử dụng App"
                                      : currentComputer.userName ||
                                        "Chưa có người dùng"}
                                </span>
                                {currentComputer.userType !== 5 &&
                                  currentComputer.isUseApp !== false && (
                                    <button
                                      className="text-gray-400 hover:text-blue-400 ml-1"
                                      onClick={() => {
                                        setIsEditingUserName(true);
                                        setEditedUserName(
                                          currentComputer.userName || "",
                                        );
                                      }}
                                      title="Sửa tên người dùng"
                                    >
                                      <FaPencilAlt />
                                    </button>
                                  )}
                              </>
                            )}
                          </div>
                          <div className="text-gray-400">ID người dùng:</div>
                          <div className="text-orange-300 font-bold">
                            {currentComputer.userId || "N/A"}
                          </div>
                          <div className="text-gray-400">Điểm danh:</div>
                          <div className="text-purple-300 font-bold">
                            {currentComputer.availableCheckIn?.toLocaleString() ||
                              0}
                          </div>
                          <div className="text-gray-400">Lượt quay:</div>
                          <div className="text-blue-300 font-bold">
                            {currentComputer.round?.toLocaleString() || 0}
                          </div>
                          <div className="text-gray-400">Stars:</div>
                          {currentComputer.userType === 5 ||
                          Number(currentComputer.status) !==
                            EnumComputerStatus.ON.id ||
                          !currentComputer.userName ||
                          currentComputer.userId === 0 ? (
                            <div className="text-yellow-300 font-bold">
                              ⭐ 0
                            </div>
                          ) : (
                            <div
                              className={`font-bold ${currentComputer.stars > 100000 ? "text-red-400" : "text-yellow-300"}`}
                            >
                              ⭐{" "}
                              {Number(currentComputer.stars)
                                ? Number(currentComputer.stars).toLocaleString()
                                : "0"}
                            </div>
                          )}
                          <div className="text-gray-400">Magic Stone:</div>
                          <div className="text-green-400 font-bold">
                            💎{" "}
                            {currentComputer.userType === 5 ||
                            Number(currentComputer.status) !==
                              EnumComputerStatus.ON.id ||
                            !currentComputer.userName ||
                            currentComputer.userId === 0
                              ? "0"
                              : Number(currentComputer.magicStone)
                                ? Number(
                                    currentComputer.magicStone,
                                  ).toLocaleString()
                                : "0"}
                          </div>
                          <div className="text-gray-400">Battle Pass:</div>
                          <div className="flex items-center gap-2">
                            {currentComputer.battlePass?.isUsed ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Crown
                                    className={`w-4 h-4 ${currentComputer.battlePass.isPremium ? "text-yellow-400" : "text-gray-400"}`}
                                  />
                                  <span
                                    className={`font-bold ${currentComputer.battlePass.isPremium ? "text-yellow-400" : "text-gray-400"}`}
                                  >
                                    {currentComputer.battlePass.isPremium
                                      ? "Premium"
                                      : "Free"}
                                  </span>
                                </div>
                                {currentComputer.battlePass.data && (
                                  <div className="flex items-center gap-1">
                                    <Trophy className="w-4 h-4 text-blue-400" />
                                    <span className="text-blue-400 font-bold">
                                      Lv.{currentComputer.battlePass.data.level}{" "}
                                      ({currentComputer.battlePass.data.exp} XP)
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 font-bold">
                                Chưa tham gia
                              </span>
                            )}
                          </div>
                          <div className="text-gray-400">Quan tâm App:</div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={currentComputer.isUseApp || false}
                              onChange={(e) =>
                                handleUpdateIsUseApp(e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-white font-bold">
                              {currentComputer.isUseApp ? "Có" : "Không"}
                            </span>
                          </div>
                          <div className="text-gray-400">Ghi chú:</div>
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <span
                                className="text-white font-bold block"
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 5,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "pre-line",
                                  maxHeight: "7.5em", // 5 dòng x 1.5em
                                }}
                              >
                                {currentComputer.note || "Không có ghi chú"}
                              </span>
                              {currentComputer.note &&
                                currentComputer.note.split("\n").length > 5 && (
                                  <button
                                    className="ml-2 text-blue-400 underline text-xs font-normal"
                                    onClick={() => {
                                      setNoteModalContent(
                                        currentComputer.note || "",
                                      );
                                      setEditedNote(currentComputer.note || "");
                                      setShowNoteModal(true);
                                    }}
                                  >
                                    Xem thêm
                                  </button>
                                )}
                            </div>
                            <button
                              className="text-gray-400 hover:text-blue-400 ml-1"
                              onClick={() => {
                                setNoteModalContent(currentComputer.note || "");
                                setEditedNote(currentComputer.note || "");
                                setShowNoteModal(true);
                              }}
                              title="Xem/Sửa ghi chú"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Device Status Section */}
                    <div className="flex flex-col gap-2 mt-2 py-4">
                      <div className="text-lg font-bold text-white">
                        Trạng thái thiết bị
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <FaDesktop
                            className={getStatusColor(
                              currentComputer.devices[0]?.monitorStatus ||
                                "GOOD",
                            )}
                          />
                          <span>Màn hình</span>
                        </div>
                        <div
                          className={getStatusColor(
                            currentComputer.devices[0]?.monitorStatus || "GOOD",
                          )}
                        >
                          {getStatusText(
                            currentComputer.devices[0]?.monitorStatus || "GOOD",
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <FaKeyboard
                            className={getStatusColor(
                              currentComputer.devices[0]?.keyboardStatus ||
                                "GOOD",
                            )}
                          />
                          <span>Bàn phím</span>
                        </div>
                        <div
                          className={getStatusColor(
                            currentComputer.devices[0]?.keyboardStatus ||
                              "GOOD",
                          )}
                        >
                          {getStatusText(
                            currentComputer.devices[0]?.keyboardStatus ||
                              "GOOD",
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <FaMouse
                            className={getStatusColor(
                              currentComputer.devices[0]?.mouseStatus || "GOOD",
                            )}
                          />
                          <span>Chuột</span>
                        </div>
                        <div
                          className={getStatusColor(
                            currentComputer.devices[0]?.mouseStatus || "GOOD",
                          )}
                        >
                          {getStatusText(
                            currentComputer.devices[0]?.mouseStatus || "GOOD",
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <FaHeadphones
                            className={getStatusColor(
                              currentComputer.devices[0]?.headphoneStatus ||
                                "GOOD",
                            )}
                          />
                          <span>Tai nghe</span>
                        </div>
                        <div
                          className={getStatusColor(
                            currentComputer.devices[0]?.headphoneStatus ||
                              "GOOD",
                          )}
                        >
                          {getStatusText(
                            currentComputer.devices[0]?.headphoneStatus ||
                              "GOOD",
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <FaChair
                            className={getStatusColor(
                              currentComputer.devices[0]?.chairStatus || "GOOD",
                            )}
                          />
                          <span>Ghế</span>
                        </div>
                        <div
                          className={getStatusColor(
                            currentComputer.devices[0]?.chairStatus || "GOOD",
                          )}
                        >
                          {getStatusText(
                            currentComputer.devices[0]?.chairStatus || "GOOD",
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <FaWifi
                            className={getStatusColor(
                              currentComputer.devices[0]?.networkStatus ||
                                "GOOD",
                            )}
                          />
                          <span>Mạng</span>
                        </div>
                        <div
                          className={getStatusColor(
                            currentComputer.devices[0]?.networkStatus || "GOOD",
                          )}
                        >
                          {getStatusText(
                            currentComputer.devices[0]?.networkStatus || "GOOD",
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-end">
                      {currentComputer.userType !== 5 && (
                        <Button
                          type="default"
                          onClick={() => {
                            setShowCheckLoginModal(true);
                            // Tự động set số máy và username hiện tại
                            setTimeout(() => {
                              checkLoginForm.setFieldsValue({
                                computerId: currentComputer.id,
                                userName: currentComputer.userName || "",
                              });
                            }, 100);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Kiểm tra đăng nhập
                        </Button>
                      )}
                      <Button type="primary" danger onClick={handleReportIssue}>
                        Báo hỏng
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          setCurrentComputer(currentComputer);
                          setShowUpdateModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Sửa chữa
                      </Button>
                    </div>
                  </div>
                ),
              },
              {
                key: "2",
                label: (
                  <span className="text-base font-semibold">Lịch sử máy</span>
                ),
                children: (
                  <div className="p-6 bg-[#23272f] rounded-lg border border-[#374151]">
                    <div className="flex flex-col gap-2 pt-2">
                      {(() => {
                        const histories = (
                          currentComputer.devices[0]?.histories || []
                        ).filter(Boolean);
                        const latestReport = [...histories]
                          .filter((h) => h.type === "REPORT")
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt).getTime() -
                              new Date(a.createdAt).getTime(),
                          )
                          .pop();
                        const latestRepair = [...histories]
                          .filter((h) => h.type === "REPAIR")
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt).getTime() -
                              new Date(a.createdAt).getTime(),
                          )
                          .pop();
                        const renderDeviceStatus = (history: DeviceHistory) => (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="flex items-center gap-2">
                              <FaDesktop /> <span>Màn hình:</span>{" "}
                              <span
                                className={getStatusColor(
                                  history?.monitorStatus || "GOOD",
                                )}
                              >
                                {getStatusText(
                                  history?.monitorStatus || "GOOD",
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaKeyboard /> <span>Bàn phím:</span>{" "}
                              <span
                                className={getStatusColor(
                                  history?.keyboardStatus || "GOOD",
                                )}
                              >
                                {getStatusText(
                                  history?.keyboardStatus || "GOOD",
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaMouse /> <span>Chuột:</span>{" "}
                              <span
                                className={getStatusColor(
                                  history?.mouseStatus || "GOOD",
                                )}
                              >
                                {getStatusText(history?.mouseStatus || "GOOD")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaHeadphones /> <span>Tai nghe:</span>{" "}
                              <span
                                className={getStatusColor(
                                  history?.headphoneStatus || "GOOD",
                                )}
                              >
                                {getStatusText(
                                  history?.headphoneStatus || "GOOD",
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaChair /> <span>Ghế:</span>{" "}
                              <span
                                className={getStatusColor(
                                  history?.chairStatus || "GOOD",
                                )}
                              >
                                {getStatusText(history?.chairStatus || "GOOD")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaWifi /> <span>Mạng:</span>{" "}
                              <span
                                className={getStatusColor(
                                  history?.networkStatus || "GOOD",
                                )}
                              >
                                {getStatusText(
                                  history?.networkStatus || "GOOD",
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaDesktop /> <span>Máy tính:</span>{" "}
                              <span
                                className={getStatusColor(
                                  history?.computerStatus || "GOOD",
                                )}
                              >
                                {getStatusText(
                                  history?.computerStatus || "GOOD",
                                )}
                              </span>
                            </div>
                            <p className="col-span-2 mt-2 text-gray-300">
                              <b>Mô tả:</b> {history?.issue || "Không có mô tả"}
                            </p>
                          </div>
                        );
                        return (
                          <div className="flex flex-col gap-4 mb-4">
                            <Card
                              title={
                                <span className="text-red-500 font-bold">
                                  Báo hỏng mới nhất
                                </span>
                              }
                              bordered={false}
                              className="bg-gray-800 border-l-4 border-red-500 shadow-lg text-white"
                            >
                              {latestReport ? (
                                <>
                                  <div>
                                    <b>Thời gian:</b>{" "}
                                    {formatDate(latestReport.createdAt)}
                                  </div>
                                  {renderDeviceStatus(latestReport)}
                                </>
                              ) : (
                                <div className="text-gray-400">
                                  Không có dữ liệu
                                </div>
                              )}
                            </Card>
                            <Card
                              title={
                                <span className="text-blue-500 font-bold">
                                  Sửa chữa mới nhất
                                </span>
                              }
                              bordered={false}
                              className="bg-gray-800 border-l-4 border-blue-500 shadow-lg text-white"
                            >
                              {latestRepair ? (
                                <>
                                  <div>
                                    <b>Thời gian:</b>{" "}
                                    {formatDate(latestRepair.createdAt)}
                                  </div>
                                  {renderDeviceStatus(latestRepair)}
                                </>
                              ) : (
                                <div className="text-gray-400">
                                  Không có dữ liệu
                                </div>
                              )}
                            </Card>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Drawer>

      {/* Report Issue Modal */}
      <Modal
        title={<span className="text-white">Báo cáo sự cố thiết bị</span>}
        open={showReportModal}
        onCancel={() => {
          setShowReportModal(false);
          reportForm.resetFields();
        }}
        footer={null}
        className="dark-modal"
        width={900}
        styles={{
          header: {
            background: "#1f2937",
            color: "white",
            borderBottom: "1px solid #374151",
            paddingBottom: "12px",
          },
          content: {
            background: "#1f2937",
          },
          body: {
            background: "#1f2937",
            padding: "20px",
          },
          mask: {
            background: "rgba(0, 0, 0, 0.6)",
          },
          footer: {
            background: "#1f2937",
            borderTop: "1px solid #374151",
          },
        }}
      >
        <Form
          form={reportForm}
          layout="vertical"
          onFinish={handleReportSubmit}
          className="text-gray-200"
          initialValues={{
            monitorStatus: currentComputer?.devices[0]?.monitorStatus || "GOOD",
            keyboardStatus:
              currentComputer?.devices[0]?.keyboardStatus || "GOOD",
            mouseStatus: currentComputer?.devices[0]?.mouseStatus || "GOOD",
            headphoneStatus:
              currentComputer?.devices[0]?.headphoneStatus || "GOOD",
            chairStatus: currentComputer?.devices[0]?.chairStatus || "GOOD",
            networkStatus: currentComputer?.devices[0]?.networkStatus || "GOOD",
          }}
        >
          <div className="space-y-2">
            {deviceList.map((device) => (
              <div
                key={device.key}
                className="border-b border-gray-700 pb-2 last:border-b-0"
              >
                <div className="flex items-center gap-2 mb-2">
                  {device.icon}
                  <span className="text-lg font-medium">{device.label}</span>
                </div>
                <Form.Item
                  name={`${device.key}Status`}
                  className="mb-0"
                  rules={[
                    {
                      required: true,
                      message: `Vui lòng chọn trạng thái ${device.label.toLowerCase()}`,
                    },
                  ]}
                >
                  <Radio.Group className="w-full">
                    <div className="grid grid-cols-3 gap-8">
                      {deviceStatusOptions.map((status) => (
                        <Radio key={status.value} value={status.value}>
                          <div className={`${status.color} text-base`}>
                            {status.label}
                          </div>
                        </Radio>
                      ))}
                    </div>
                  </Radio.Group>
                </Form.Item>
              </div>
            ))}
          </div>

          <Form.Item
            label={<span className="text-gray-200">Ghi chú</span>}
            name="note"
            className="mb-0 mt-6"
          >
            <Input.TextArea
              placeholder="Mô tả chi tiết vấn đề của thiết bị..."
              className="dark-input"
              style={{
                backgroundColor: "#374151",
                borderColor: "#4B5563",
                color: "white",
              }}
              rows={4}
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-4 mt-8 pt-4 border-t border-gray-700">
            <Button
              onClick={() => {
                setShowReportModal(false);
                reportForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-600 hover:bg-blue-700 ml-2"
            >
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Device Status Modal */}
      <Modal
        title={<span className="text-white">Cập nhật trạng thái thiết bị</span>}
        open={showUpdateModal}
        onCancel={() => {
          setShowUpdateModal(false);
          updateForm.resetFields();
        }}
        footer={null}
        className="dark-modal"
        width={900}
        styles={{
          header: {
            background: "#1f2937",
            color: "white",
            borderBottom: "1px solid #374151",
            paddingBottom: "12px",
          },
          content: {
            background: "#1f2937",
          },
          body: {
            background: "#1f2937",
            padding: "20px",
          },
          mask: {
            background: "rgba(0, 0, 0, 0.6)",
          },
          footer: {
            background: "#1f2937",
            borderTop: "1px solid #374151",
          },
        }}
      >
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdateDeviceStatus}
          className="text-gray-200"
          initialValues={{
            monitorStatus: currentComputer?.devices[0]?.monitorStatus || "GOOD",
            keyboardStatus:
              currentComputer?.devices[0]?.keyboardStatus || "GOOD",
            mouseStatus: currentComputer?.devices[0]?.mouseStatus || "GOOD",
            headphoneStatus:
              currentComputer?.devices[0]?.headphoneStatus || "GOOD",
            chairStatus: currentComputer?.devices[0]?.chairStatus || "GOOD",
            networkStatus: currentComputer?.devices[0]?.networkStatus || "GOOD",
          }}
        >
          <div className="space-y-2">
            {deviceList.map((device) => (
              <div
                key={device.key}
                className="border-b border-gray-700 pb-2 last:border-b-0"
              >
                <div className="flex items-center gap-2 mb-2">
                  {device.icon}
                  <span className="text-lg font-medium">{device.label}</span>
                </div>
                <Form.Item
                  name={`${device.key}Status`}
                  className="mb-0"
                  rules={[
                    {
                      required: true,
                      message: `Vui lòng chọn trạng thái ${device.label.toLowerCase()}`,
                    },
                  ]}
                >
                  <Radio.Group className="w-full">
                    <div className="grid grid-cols-3 gap-8">
                      {deviceStatusOptions.map((status) => (
                        <Radio key={status.value} value={status.value}>
                          <div className={`${status.color} text-base`}>
                            {status.label}
                          </div>
                        </Radio>
                      ))}
                    </div>
                  </Radio.Group>
                </Form.Item>
              </div>
            ))}
          </div>

          <Form.Item
            label={<span className="text-gray-200">Ghi chú</span>}
            name="note"
            className="mb-0 mt-6"
          >
            <Input.TextArea
              placeholder="Mô tả chi tiết vấn đề của thiết bị..."
              className="dark-input"
              style={{
                backgroundColor: "#374151",
                borderColor: "#4B5563",
                color: "white",
              }}
              rows={4}
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-4 mt-8 pt-4 border-t border-gray-700">
            <Button
              onClick={() => {
                setShowUpdateModal(false);
                updateForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-600 hover:bg-blue-700 ml-2"
            >
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Check Login Modal */}
      <Modal
        title={<span className="text-white">Kiểm tra đăng nhập</span>}
        open={showCheckLoginModal}
        onCancel={() => {
          setShowCheckLoginModal(false);
          checkLoginForm.resetFields();
          setSearchUsers([]);
          setMigrationInfo(null);
        }}
        footer={null}
        className="dark-modal"
        width={500}
        styles={{
          header: {
            background: "#1f2937",
            color: "white",
            borderBottom: "1px solid #374151",
            paddingBottom: "12px",
          },
          content: {
            background: "#1f2937",
          },
          body: {
            background: "#1f2937",
            padding: "20px",
          },
          mask: {
            background: "rgba(0, 0, 0, 0.6)",
          },
          footer: {
            background: "#1f2937",
            borderTop: "1px solid #374151",
          },
        }}
      >
        <Form
          form={checkLoginForm}
          layout="vertical"
          className="text-gray-200"
          onFinish={handleCheckLoginSearch}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-gray-200">Số máy</span>}
              name="computerId"
              className="mb-0"
            >
              <Select
                placeholder="Chọn số máy..."
                className="dark-input"
                style={{
                  backgroundColor: "#374151",
                  borderColor: "#4B5563",
                  color: "white",
                }}
                options={computers.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                showSearch
                optionFilterProp="label"
                allowClear
              />
            </Form.Item>
            <Form.Item
              label={<span className="text-gray-200">Tên đăng nhập</span>}
              name="userName"
              className="mb-0"
            >
              <Input
                placeholder="Nhập Tên đăng nhập..."
                className="dark-input"
                style={{
                  borderColor: "#4B5563",
                  color: "black",
                }}
                allowClear
              />
            </Form.Item>
          </div>
          <Form.Item className="mb-0 mt-4">
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-600 hover:bg-blue-700 w-full"
              loading={loadingSearch}
            >
              Tìm kiếm
            </Button>
          </Form.Item>
        </Form>
        {/* Hiển thị kết quả tìm kiếm user */}
        <div className="mt-4">
          {searchUsers.length > 0 ? (
            <div>
              <div className="font-bold text-gray-300 mb-2">
                {(() => {
                  const computerId = checkLoginForm.getFieldValue("computerId");
                  const userName = checkLoginForm.getFieldValue("userName");
                  if (computerId && userName) {
                    const computer = computers.find((c) => c.id === computerId);
                    return `Kết quả chuyển đổi tài khoản - Máy ${computer?.name} + Username: ${userName}`;
                  } else if (computerId) {
                    const computer = computers.find((c) => c.id === computerId);
                    return `Danh sách tài khoản trên máy ${computer?.name}:`;
                  } else if (userName) {
                    return `Danh sách tài khoản có Username: ${userName}`;
                  }
                  return "Danh sách tài khoản:";
                })()}
              </div>
              {(() => {
                const computerId = checkLoginForm.getFieldValue("computerId");
                const username = checkLoginForm.getFieldValue("username");
                const isMigrationMode = computerId && username;

                return (
                  <Card
                    className="bg-gradient-to-r from-yellow-400 to-yellow-200 border-2 border-yellow-500 text-black mb-3"
                    bodyStyle={{ padding: 16 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div>
                          <b className="text-blue-700 text-lg font-bold">
                            {isMigrationMode
                              ? "Target UserId:"
                              : "Base UserId:"}
                          </b>{" "}
                          <span className="text-blue-900 text-lg font-bold">
                            {migrationInfo.userId}
                          </span>
                        </div>
                        <div>
                          <b className="text-gray-700">Username:</b>{" "}
                          <span className="text-black">
                            {migrationInfo.userName ||
                              searchUsers[0]?.userName.toUpperCase() ||
                              "N/A"}
                          </span>
                        </div>
                        <div>
                          <b className="text-yellow-700 text-lg font-bold">
                            Stars:
                          </b>{" "}
                          <span className="text-yellow-900 text-lg font-bold">
                            {migrationInfo.starsCalculated?.toLocaleString() ??
                              0}
                          </span>
                        </div>
                        <div className="italic text-xs text-gray-700 mt-1">
                          {isMigrationMode
                            ? "Đây là thông tin tài khoản đích để chuyển đổi. Lưu ý: Cần ưu tiên chọn các tài khoản có UserId trùng với Target UserId để đảm bảo đăng nhập thành công."
                            : "Đây là thông tin tài khoản gốc để bạn tham khảo khi quyết định giữ lại tài khoản bên dưới. Lưu ý: Cần ưu tiên chọn các tài khoản có UserId trùng với Base UserId. Nếu không sẽ không thể đăng nhập."}
                        </div>
                      </div>
                      {!isMigrationMode && (
                        <Button
                          type="primary"
                          danger
                          className="bg-red-600 hover:bg-red-700 text-white font-bold border-none"
                          onClick={async () => {
                            try {
                              const baseUserId = migrationInfo.userId;
                              const baseUserName =
                                migrationInfo.userName ||
                                searchUsers[0]?.userName;
                              const baseStars = migrationInfo.starsCalculated;

                              const resetUser = {
                                userId: baseUserId,
                                userName: baseUserName,
                                stars: baseStars,
                                rankId: searchUsers[0]?.rankId || 1,
                                magicStone: searchUsers[0]?.magicStone || 0,
                                totalPayment: searchUsers[0]?.totalPayment || 0,
                              };

                              const res = await fetch("/api/user/reset", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ user: resetUser }),
                              });

                              const data = await res.json();
                              if (data.success) {
                                message.success(
                                  `Đã reset tài khoản thành công! Đã xóa ${data.deletedCount} tài khoản cũ và tạo tài khoản mới.`,
                                );
                                setShowCheckLoginModal(false);
                                setSearchUsers([]);
                                setMigrationInfo(null);
                                await refetch();
                              } else {
                                message.error(
                                  data.message || "Có lỗi xảy ra khi reset",
                                );
                              }
                            } catch (e: any) {
                              message.error(
                                e.message || "Có lỗi xảy ra khi reset",
                              );
                            }
                          }}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })()}
              {/* List các user có thể Migrate */}
              <div className="grid grid-cols-1 gap-3">
                {sortedUsers.map((user, idx) => {
                  const selectedComputerId =
                    checkLoginForm.getFieldValue("computerId");
                  const selectedComputer = computers.find(
                    (c) => c.id === selectedComputerId,
                  );
                  const isCurrent = user.userId === selectedComputer?.userId;
                  // Card nổi bật nếu là tương đồng nhất
                  const isBestMatch = hasUserIdMatch && idx === 0;
                  return (
                    <Card
                      key={user.userId + "-" + user.stars}
                      className={
                        isBestMatch
                          ? "bg-gray-800 border-2 border-orange-500 text-white"
                          : "bg-gray-800 border border-gray-700 text-white"
                      }
                      bodyStyle={{ padding: 16 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div>
                            <b className="text-blue-400 text-lg font-bold">
                              UserId:
                            </b>{" "}
                            <span className="text-blue-300 text-lg font-bold">
                              {user.userId}
                            </span>
                          </div>
                          <div>
                            <b className="text-gray-300">Username:</b>{" "}
                            <span className="text-white">
                              {user.userName || user.username}
                            </span>
                          </div>
                          <div>
                            <b className="text-yellow-400 text-lg font-bold">
                              Stars:
                            </b>{" "}
                            <span className="text-yellow-300 text-lg font-bold">
                              {user.stars?.toLocaleString() ?? 0}
                            </span>
                          </div>
                        </div>
                        <Button
                          type={isCurrent ? "primary" : "default"}
                          className={
                            isBestMatch
                              ? "bg-orange-600 hover:bg-orange-700 text-white font-bold border-none"
                              : "bg-gray-600 text-white font-bold border-none"
                          }
                          onClick={() => {
                            setMigrateUser(user);
                            setShowMigrateModal(true);
                          }}
                        >
                          {(() => {
                            const computerId =
                              checkLoginForm.getFieldValue("computerId");
                            const userName =
                              checkLoginForm.getFieldValue("userName");
                            return computerId && userName
                              ? "Chuyển đổi"
                              : "Giữ lại";
                          })()}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-gray-400">Không có dữ liệu</div>
          )}
        </div>
      </Modal>

      {/* Modal xác nhận Migrate */}
      <Modal
        title={<span className="text-white">Xác nhận Migrate tài khoản</span>}
        open={showMigrateModal}
        onCancel={() => setShowMigrateModal(false)}
        onOk={async () => {
          if (!migrateUser || !searchUsers.length) {
            message.error("Không có dữ liệu để migrate");
            return;
          }
          try {
            const res = await fetch("/api/user/migrate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                keepId: migrateUser.id,
                users: searchUsers,
                starsCalculated: migrationInfo?.starsCalculated,
              }),
            });
            const data = await res.json();
            if (data.success) {
              message.success(
                "Đã giữ lại tài khoản và cập nhật số sao thành công!",
              );
              setShowMigrateModal(false);
              setShowCheckLoginModal(false);
              setSearchUsers([]);
              setMigrateUser(null);
              setMigrationInfo(null);
              await refetch();
            } else {
              message.error(data.message || "Có lỗi xảy ra khi migrate");
            }
          } catch (e: any) {
            message.error(e.message || "Có lỗi xảy ra khi migrate");
          }
        }}
        okText="OK"
        cancelText="Hủy"
        className="dark-modal"
        styles={{
          header: {
            background: "#1f2937",
            color: "white",
            borderBottom: "1px solid #374151",
          },
          content: { background: "#1f2937" },
          body: { background: "#1f2937", padding: "20px" },
          mask: { background: "rgba(0, 0, 0, 0.6)" },
          footer: { background: "#1f2937", borderTop: "1px solid #374151" },
        }}
      >
        {migrateUser && (
          <div className="text-gray-200 text-base">
            Bạn sẽ giữ lại tài khoản có{" "}
            <b className="text-blue-400">UserId: {migrationInfo?.userId}</b>,{" "}
            <b className="text-gray-300">
              Username: {migrateUser.userName || migrateUser.username}
            </b>
            ,{" "}
            <b className="text-yellow-400">
              Stars: {migrateUser.stars?.toLocaleString() ?? 0}
            </b>{" "}
            và cập nhật số sao thành{" "}
            <b className="text-green-400">
              {migrationInfo?.starsCalculated?.toLocaleString() ?? 0}
            </b>
            .
            <br />
            Các tài khoản khác sẽ bị{" "}
            <span className="text-red-400 font-bold">xóa</span>.<br />
            <span className="text-red-400 font-bold">
              Hãy cân nhắc kỹ vì các dữ liệu này sẽ không thể hoàn tác.
            </span>
          </div>
        )}
      </Modal>

      {/* Modal xem/sửa toàn bộ ghi chú */}
      <Modal
        open={showNoteModal}
        onCancel={() => setShowNoteModal(false)}
        footer={null}
        title={<span className="text-lg font-bold">Ghi chú</span>}
        className="dark-modal"
        width={600}
        styles={{
          header: { background: "#1f2937", color: "white" },
          content: { background: "#23272f" },
          body: { background: "#23272f", color: "#fff", padding: 24 },
          mask: { background: "rgba(0,0,0,0.6)" },
          footer: { background: "#23272f" },
        }}
      >
        <div className="flex flex-col gap-4">
          <textarea
            className="w-full bg-gray-800 text-white border border-gray-500 rounded px-2 py-1 focus:outline-none resize-none"
            value={editedNote}
            onChange={(e) => setEditedNote(e.target.value)}
            rows={10}
            placeholder="Nhập ghi chú..."
            style={{ minHeight: 120 }}
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowNoteModal(false)}>Đóng</Button>
            <Button
              type="primary"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={async () => {
                setIsEditingNote(true);
                await handleUpdateNoteModal();
              }}
            >
              Lưu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
