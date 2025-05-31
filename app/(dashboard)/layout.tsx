"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useUserInfo } from "@/hooks/use-user-info";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLogout } from "@/queries/auth.query";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { updateUser } from "@/actions/update-user";
import { useActivityMonitor } from "@/hooks/use-activity-monitor";

const DashBoardLayout = ({ children }: { children: React.ReactNode }) => {
  const loginMutation = useLogout();
  const { userName, userData } = useUserInfo();
  const { stars, magicStone } = userData || {};
  const pathname = usePathname();

  // Add activity monitoring
  useEffect(() => {
    console.log('Dashboard layout mounted');
    useActivityMonitor();
  }, []);

  const { execute: executeUpdateUser } = useAction(updateUser, {
    onSuccess: async () => {},
    onError: (error) => {
      toast.error(error);
    },
  });

  useEffect(() => {
    if (userData && userName) {
      const { id, rankId, userId, stars } = userData;

      const data = {
        id,
        rankId,
        userId,
        stars,
        userName,
        magicStone,
      };
      executeUpdateUser(data);
    }
  }, [userName, userData]);

  const handleLogout = async () => {
    const result = await loginMutation.mutateAsync();
    const { statusCode, data, message } = result || {};
    if (statusCode === 200) {
      if (typeof window !== "undefined" && window.electron) {
        // @ts-ignore
        window.electron.send("close-app");
      }
    } else if (statusCode === 500) {
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <nav className="flex space-x-4">
                <Link
                  href="/dashboard"
                  className={cn(
                    "text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium",
                    pathname === "/dashboard" && "bg-gray-700 text-white"
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/history"
                  className={cn(
                    "text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium",
                    pathname === "/dashboard/history" && "bg-gray-700 text-white"
                  )}
                >
                  Lịch sử
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-gray-300">
                <span className="font-medium">{userName}</span>
                <div className="flex items-center space-x-2 text-sm">
                  <span>⭐ {stars}</span>
                  <span>💎 {magicStone}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default DashBoardLayout;
