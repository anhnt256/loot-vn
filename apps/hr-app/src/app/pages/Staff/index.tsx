import React, { useState, useEffect } from "react";
import { Tabs, Card, Button, Spin, Avatar, Select } from "antd";
import {
  User,
  Clock,
  Award,
  AlertTriangle,
  LogOut,
  BarChart3,
  Settings,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "sonner";
import { apiClient } from "@gateway-workspace/shared/utils";
import CheckIn from "./components/CheckIn";
import TimeTracking from "./components/TimeTracking";
import RewardPunishHistory from "./components/RewardPunishHistory";
import RequestTab from "./components/RequestTab";
import StaffInfo from "./components/StaffInfo";
import SalarySummary from "./components/SalarySummary";

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState("checkin");
  const [staffData, setStaffData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState<{
    month: number;
    year: number;
  } | null>(null);

  useEffect(() => {
    const now = dayjs();
    setSelectedMonth({ month: now.month() + 1, year: now.year() });
  }, []);

  useEffect(() => {
    fetchStaffInfo();
  }, []);

  const fetchStaffInfo = async () => {
    try {
      setLoading(true);
      const result = await apiClient.get(`/hr-app/my-info`);
      
      if (result.data.success) {
        setStaffData(result.data.data);
      } else {
        throw new Error(result.data.error || "Lỗi lấy dữ liệu nhân viên");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải thông tin nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="px-4 py-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                size={64}
                className="bg-white text-orange-500 text-xl font-bold"
              >
                {staffData?.fullName?.charAt(0)?.toUpperCase() || "S"}
              </Avatar>
              <div>
                <h1 className="text-xl font-bold">
                  {staffData?.fullName || "Nhân viên"}
                </h1>
                <p className="text-orange-100 text-sm">
                  {staffData?.userName || ""}
                </p>
                <p className="text-orange-100 text-xs mt-1">
                  {staffData?.staffType === "STAFF" && "Nhân viên"}
                  {staffData?.staffType === "KITCHEN" && "Bếp"}
                  {staffData?.staffType === "SECURITY" && "Bảo vệ"}
                  {staffData?.staffType === "CASHIER" && "Thu ngân"}
                  {staffData?.staffType === "MANAGER" && "Quản lý"}
                  {staffData?.staffType === "SUPER_ADMIN" && "Super Admin"}
                  {staffData?.staffType === "BRANCH_ADMIN" &&
                    "Quản lý chi nhánh"}
                </p>
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

      <div className="max-w-5xl mx-auto">
        {/* Month Filter */}
        {selectedMonth && (
          <div className="px-4 pt-4">
            <Card className="shadow-sm">
              <div className="flex items-center gap-2">
                {activeTab === "checkin" ? (
                  <>
                    <span className="font-medium text-gray-600">Ngày hiện tại:</span>
                    <span className="font-bold text-orange-600">{dayjs().format("DD/MM/YYYY")}</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium">Chọn tháng:</span>
                    <Select
                      value={`${selectedMonth.month}-${selectedMonth.year}`}
                      onChange={(value) => {
                        const [month, year] = value.split("-").map(Number);
                        setSelectedMonth({ month, year });
                      }}
                      disabled={activeTab === "info"}
                      style={{ minWidth: 150 }}
                      options={(() => {
                        const now = dayjs();
                        const currentMonth = now.month() + 1;
                        const currentYear = now.year();

                        const options = [];
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

                        options.push({
                          value: `${currentMonth}-${currentYear}`,
                          label: `Tháng ${currentMonth}/${currentYear}`,
                        });

                        return options;
                      })()}
                    />
                  </>
                )}
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
                    <span className="hidden sm:inline">Điểm danh</span>
                  </span>
                ),
                children:
                  staffData?.id && selectedMonth ? (
                    <CheckIn
                      staffId={staffData.id}
                      month={selectedMonth.month}
                      year={selectedMonth.year}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Đang tải...
                    </div>
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
                children:
                  staffData?.id && selectedMonth ? (
                    <SalarySummary
                      staffId={staffData.id}
                      month={selectedMonth.month}
                      year={selectedMonth.year}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Đang tải...
                    </div>
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
                children:
                  staffData?.id && selectedMonth ? (
                    <TimeTracking
                      staffId={staffData.id}
                      month={selectedMonth.month}
                      year={selectedMonth.year}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Đang tải...
                    </div>
                  ),
              },
              {
                key: "reward-punish",
                label: (
                  <span className="flex items-center gap-2">
                    <Award size={18} />
                    <span className="hidden sm:inline">Thưởng & Phạt</span>
                  </span>
                ),
                children:
                  staffData?.id && selectedMonth ? (
                    <RewardPunishHistory
                      staffId={staffData.id}
                      month={selectedMonth.month}
                      year={selectedMonth.year}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Đang tải...
                    </div>
                  ),
              },
              {
                key: "request",
                label: (
                  <span className="flex items-center gap-2">
                    <Send size={18} />
                    <span className="hidden sm:inline">Gửi yêu cầu</span>
                  </span>
                ),
                children:
                  staffData?.id ? (
                    <RequestTab staffId={staffData.id} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Đang tải...
                    </div>
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
                children: (
                  <StaffInfo staffData={staffData} onRefresh={fetchStaffInfo} />
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
