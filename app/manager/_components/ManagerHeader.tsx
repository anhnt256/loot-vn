"use client";

import { useState, useEffect } from "react";
import { Button, Select } from "antd";
import { LogOut, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/queries/auth.query";
import { setCookie, getCookie } from "cookies-next";
import { toast } from "sonner";

interface ManagerHeaderProps {
  title: string;
  showBackButton?: boolean;
  color?: "blue" | "green" | "red" | "purple" | "orange";
}

export default function ManagerHeader({
  title,
  showBackButton = true,
  color = "blue",
}: ManagerHeaderProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>("GO_VAP");
  const logoutMutation = useLogout();
  const router = useRouter();

  useEffect(() => {
    // Get branch from cookie, default to GO_VAP
    const branchFromCookie = getCookie("branch") as string;
    const initialBranch = branchFromCookie || "GO_VAP";
    setSelectedBranch(initialBranch);
  }, []);

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
    setCookie("branch", branch, { path: "/", maxAge: 60 * 60 * 24 * 7 }); // 7 days
    // Reload page to refresh data with new branch
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/staff-login");
    } catch (error) {
      toast.error("Đăng xuất thất bại");
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case "green":
        return "bg-gradient-to-r from-green-500 to-green-600";
      case "red":
        return "bg-gradient-to-r from-red-500 to-red-600";
      case "purple":
        return "bg-gradient-to-r from-purple-500 to-purple-600";
      case "orange":
        return "bg-gradient-to-r from-orange-500 to-orange-600";
      default:
        return "bg-gradient-to-r from-blue-500 to-blue-600";
    }
  };

  const getHoverColor = () => {
    switch (color) {
      case "green":
        return "hover:bg-green-700";
      case "red":
        return "hover:bg-red-700";
      case "purple":
        return "hover:bg-purple-700";
      case "orange":
        return "hover:bg-orange-700";
      default:
        return "hover:bg-blue-700";
    }
  };

  return (
    <>
      {/* Header */}
      <div className={`${getColorClasses()} text-white shadow-lg`}>
        <div className="px-4 py-6">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center justify-between">
            {showBackButton ? (
              <Button
                type="text"
                icon={<ArrowLeft size={18} />}
                onClick={() => router.push("/manager")}
                className={`text-white ${getHoverColor()}`}
              >
                Quay lại
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="text"
              icon={<LogOut size={18} />}
              onClick={handleLogout}
              className={`text-white ${getHoverColor()}`}
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
    </>
  );
}
