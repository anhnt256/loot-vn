"use client";

import { useState, useEffect } from "react";
import { Tabs, Card, Button, Spin, Avatar, Badge, Select } from "antd";
import { User, Clock, Award, AlertTriangle, LogOut, BarChart3, Settings } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLogout } from "@/queries/auth.query";
import StaffInfo from "./_components/StaffInfo";
import TimeTracking from "./_components/TimeTracking";
import BonusHistory from "./_components/BonusHistory";
import PenaltyHistory from "./_components/PenaltyHistory";
import SalarySummary from "./_components/SalarySummary";
import CheckIn from "./_components/CheckIn";
import dayjs from "@/lib/dayjs";
import "./staff.css";

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState("checkin");
  const [staffData, setStaffData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const logoutMutation = useLogout();
  const router = useRouter();

  // Month filter state - default to current month or previous month
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | null>(null);

  useEffect(() => {
    // Set default to current month
    const now = dayjs();
    const currentMonth = now.month() + 1;
    const currentYear = now.year();
    
    setSelectedMonth({ month: currentMonth, year: currentYear });
  }, []);

  useEffect(() => {
    fetchStaffInfo();
  }, []);

  const fetchStaffInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/staff/my-info");
      if (!response.ok) {
        throw new Error("Failed to fetch staff info");
      }
      const result = await response.json();
      if (result.success) {
        setStaffData(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch staff info");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải thông tin nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/staff-login");
    } catch (error) {
      toast.error("Đăng xuất thất bại");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                size={64}
                className="bg-white text-orange-500 text-xl font-bold"
              >
                {staffData?.fullName?.charAt(0)?.toUpperCase() || "S"}
              </Avatar>
              <div>
                <h1 className="text-xl font-bold">{staffData?.fullName || "Nhân viên"}</h1>
                <p className="text-orange-100 text-sm">{staffData?.userName || ""}</p>
                <p className="text-orange-100 text-xs mt-1">
                  {staffData?.staffType === "STAFF" && "Nhân viên"}
                  {staffData?.staffType === "KITCHEN" && "Bếp"}
                  {staffData?.staffType === "SECURITY" && "Bảo vệ"}
                  {staffData?.staffType === "CASHIER" && "Thu ngân"}
                  {staffData?.staffType === "MANAGER" && "Quản lý"}
                  {staffData?.staffType === "SUPER_ADMIN" && "Super Admin"}
                  {staffData?.staffType === "BRANCH_ADMIN" && "Quản lý chi nhánh"}
                </p>
                {/* Show manager button if user is manager */}
                {(staffData?.staffType === "MANAGER" || 
                  staffData?.staffType === "SUPER_ADMIN" || 
                  staffData?.staffType === "BRANCH_ADMIN") && (
                  <Button
                    type="default"
                    icon={<Settings size={16} />}
                    onClick={() => router.push("/manager")}
                    className="mt-2 bg-white text-orange-600 hover:bg-orange-50 border-orange-300"
                    size="small"
                  >
                    Chuyển qua trang quản lý
                  </Button>
                )}
              </div>
            </div>
            <Button
              type="text"
              icon={<LogOut size={20} />}
              onClick={handleLogout}
              className="text-white hover:bg-orange-700"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Month Filter */}
      {selectedMonth && (
        <div className="px-4 pt-4">
          <Card className="shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Chọn tháng:</span>
              <Select
                value={`${selectedMonth.month}-${selectedMonth.year}`}
                onChange={(value) => {
                  const [month, year] = value.split("-").map(Number);
                  setSelectedMonth({ month, year });
                }}
                disabled={activeTab === "info" || activeTab === "checkin"}
                style={{ minWidth: 150 }}
                options={(() => {
                  const now = dayjs();
                  const currentMonth = now.month() + 1;
                  const currentYear = now.year();
                  
                  const options = [];
                  
                  // Previous month
                  if (currentMonth === 1) {
                    options.push({
                      value: `12-${currentYear - 1}`,
                      label: `Tháng 12/${currentYear - 1}`,
                    });
                  } else {
                    options.push({
                      value: `${currentMonth - 1}-${currentYear}`,
                      label: `Tháng ${currentMonth - 1}/${currentYear}`,
                    });
                  }
                  
                  // Current month
                  options.push({
                    value: `${currentMonth}-${currentYear}`,
                    label: `Tháng ${currentMonth}/${currentYear}`,
                  });
                  
                  return options;
                })()}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 pt-4">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "checkin",
              label: (
                <span className="flex items-center gap-2">
                  <Clock size={18} />
                  <span className="hidden sm:inline">Chấm công</span>
                </span>
              ),
              children: staffData?.id && selectedMonth ? (
                <CheckIn 
                  staffId={staffData.id} 
                  month={selectedMonth.month}
                  year={selectedMonth.year}
                /> 
              ) : (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ),
            },
            {
              key: "summary",
              label: (
                <span className="flex items-center gap-2">
                  <BarChart3 size={18} />
                  <span className="hidden sm:inline">Tổng quan</span>
                </span>
              ),
              children: staffData?.id && selectedMonth ? (
                <SalarySummary 
                  staffId={staffData.id} 
                  month={selectedMonth.month}
                  year={selectedMonth.year}
                /> 
              ) : (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ),
            },
            {
              key: "time",
              label: (
                <span className="flex items-center gap-2">
                  <Clock size={18} />
                  <span className="hidden sm:inline">Chấm công</span>
                </span>
              ),
              children: staffData?.id && selectedMonth ? (
                <TimeTracking 
                  staffId={staffData.id}
                  month={selectedMonth.month}
                  year={selectedMonth.year}
                /> 
              ) : (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ),
            },
            {
              key: "bonus",
              label: (
                <span className="flex items-center gap-2">
                  <Award size={18} />
                  <span className="hidden sm:inline">Thưởng</span>
                </span>
              ),
              children: staffData?.id && selectedMonth ? (
                <BonusHistory 
                  staffId={staffData.id}
                  month={selectedMonth.month}
                  year={selectedMonth.year}
                /> 
              ) : (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ),
            },
            {
              key: "penalty",
              label: (
                <span className="flex items-center gap-2">
                  <AlertTriangle size={18} />
                  <span className="hidden sm:inline">Phạt</span>
                </span>
              ),
              children: staffData?.id && selectedMonth ? (
                <PenaltyHistory 
                  staffId={staffData.id}
                  month={selectedMonth.month}
                  year={selectedMonth.year}
                /> 
              ) : (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ),
            },
            {
              key: "info",
              label: (
                <span className="flex items-center gap-2">
                  <User size={18} />
                  <span className="hidden sm:inline">Thông tin</span>
                </span>
              ),
              children: <StaffInfo staffData={staffData} onRefresh={fetchStaffInfo} />,
            },
          ]}
          className="staff-tabs"
        />
      </div>
    </div>
  );
}

