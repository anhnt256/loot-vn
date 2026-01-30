"use client";

import { useState, useEffect } from "react";
import { Card, Avatar, Button, Row, Col, Select } from "antd";
import {
  Award,
  AlertTriangle,
  DollarSign,
  Calendar,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLogout } from "@/queries/auth.query";
import { setCookie, getCookie } from "cookies-next";

export default function ManagerPage() {
  const [selectedBranch, setSelectedBranch] = useState<string>("GO_VAP");
  const [userName, setUserName] = useState<string>("");
  const logoutMutation = useLogout();
  const router = useRouter();

  useEffect(() => {
    // Get branch from cookie, default to GO_VAP
    const branchFromCookie = getCookie("branch") as string;
    const initialBranch = branchFromCookie || "GO_VAP";
    setSelectedBranch(initialBranch);

    // Get username from localStorage
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser);
          setUserName(userData.userName || "");
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
    setCookie("branch", branch, { path: "/", maxAge: 60 * 60 * 24 * 7 }); // 7 days
    // Reload page to refresh data with new branch
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      const result = await logoutMutation.mutateAsync();
      if (result?.redirectPath) {
        router.push(result.redirectPath);
      } else {
        router.push("/staff-login");
      }
    } catch (error) {
      toast.error("Đăng xuất thất bại");
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                size={64}
                className="bg-white text-blue-500 text-xl font-bold"
              >
                {userName?.charAt(0)?.toUpperCase() || "M"}
              </Avatar>
              <div>
                <h1 className="text-xl font-bold">Quản lý</h1>
                <p className="text-blue-100 text-sm">{userName || ""}</p>
                <Button
                  type="default"
                  icon={<ArrowLeft size={16} />}
                  onClick={() => router.push("/staff")}
                  className="mt-2 bg-white text-blue-600 hover:bg-blue-50 border-blue-300"
                  size="small"
                >
                  Quay về trang của tôi
                </Button>
              </div>
            </div>
            <Button
              type="text"
              icon={<LogOut size={20} />}
              onClick={handleLogout}
              className="text-white hover:bg-blue-700"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Branch Selector */}
      <div className="px-4 pt-4">
        <div className="flex justify-end">
          <Select
            value={selectedBranch}
            onChange={handleBranchChange}
            style={{ minWidth: 150 }}
          >
            <Select.Option value="GO_VAP">Gò Vấp</Select.Option>
            <Select.Option value="TAN_PHU">Tân Phú</Select.Option>
          </Select>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="px-4 pt-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              className="h-full cursor-pointer shadow-md hover:shadow-lg transition-shadow"
              onClick={() => router.push("/manager/income-expense")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 p-4 rounded-full mb-4">
                  <DollarSign size={32} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Quản lý thu chi</h3>
                <p className="text-gray-500 text-sm">
                  Theo dõi tiền quản lý thực giữ
                </p>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              className="h-full cursor-pointer shadow-md hover:shadow-lg transition-shadow"
              onClick={() => router.push("/manager/bonus")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <Award size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Quản lý thưởng</h3>
                <p className="text-gray-500 text-sm">
                  Thêm và quản lý thưởng cho nhân viên
                </p>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              className="h-full cursor-pointer shadow-md hover:shadow-lg transition-shadow"
              onClick={() => router.push("/manager/penalty")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                  <AlertTriangle size={32} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Quản lý phạt</h3>
                <p className="text-gray-500 text-sm">
                  Thêm và quản lý phạt cho nhân viên
                </p>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              className="h-full cursor-pointer shadow-md hover:shadow-lg transition-shadow"
              onClick={() => router.push("/manager/leave")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-100 p-4 rounded-full mb-4">
                  <Calendar size={32} className="text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Quản lý nghỉ</h3>
                <p className="text-gray-500 text-sm">
                  Xem và quản lý đơn nghỉ phép
                </p>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
