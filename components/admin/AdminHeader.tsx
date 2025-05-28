"use client";

import { signOut } from "next-auth/react";

export function AdminHeader() {
  return (
    <header className="bg-white shadow-md">
      <div className="px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          Gateway Admin Dashboard
        </h1>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
} 