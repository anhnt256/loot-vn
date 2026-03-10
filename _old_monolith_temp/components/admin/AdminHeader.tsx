"use client";

import { useRouter } from "next/navigation";
import { clearAdminData } from "@/lib/utils";
import { useBranch } from "@/components/providers/BranchProvider";

export function AdminHeader() {
  const router = useRouter();
  const { branch, setBranch, loginType } = useBranch();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });
      // Xóa thông tin admin khỏi localStorage (cookies đã được API route clear)
      clearAdminData();

      router.push("/admin-login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBranch(e.target.value);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-100">
          Gateway Admin Dashboard
        </h1>

        <div className="flex items-center space-x-4">
          {/* Branch Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">
              Chi nhánh:
            </span>
            <select
              value={branch}
              onChange={handleBranchChange}
              disabled={loginType === "mac"}
              className="px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <option value="GO_VAP">Gò Vấp</option>
              <option value="TAN_PHU">Tân Phú</option>
            </select>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
