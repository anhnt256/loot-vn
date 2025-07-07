"use client";

import { useRouter } from "next/navigation";
import { clearUserData } from "@/lib/utils";

export function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });
      // Xóa thông tin user khỏi localStorage
      clearUserData();
      router.push("/admin-login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-100">
          Gateway Admin Dashboard
        </h1>

        <div className="flex items-center space-x-4">
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
