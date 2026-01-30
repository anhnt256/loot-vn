"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn, clearUserData } from "@/lib/utils";
import { useLogout } from "@/queries/auth.query";
import { toast } from "sonner";
import dayjs from "@/lib/dayjs";
import { CURRENT_USER } from "@/constants/token.constant";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";
import Feedback from "@/components/Feedback";
import { ChatPanel } from "@/components/chat/ChatPanel";

const DashBoardLayout = ({ children }: { children: React.ReactNode }) => {
  const loginMutation = useLogout();
  const pathname = usePathname();
  const currentUser = useLocalStorageValue(CURRENT_USER, null);
  const [isClient, setIsClient] = useState(false);
  const [showWelcomeRewards, setShowWelcomeRewards] = useState(false);

  const IS_MAINTENANCE = process.env.NEXT_PUBLIC_IS_MAINTENANCE === "true";
  const GATEWAY_BIRTHDAY_ENABLE =
    process.env.NEXT_PUBLIC_GATEWAY_BIRTHDAY_ENABLE === "true";
  const STORE_DISABLED = process.env.NEXT_PUBLIC_STORE_DISABLED === "true";
  const BATTLE_PASS_ENABLE =
    process.env.NEXT_PUBLIC_GATEWAY_BATTLE_PASS_ENABLE === "true";

  // Check xem user có phải là user mới hoặc user cũ quay trở lại không
  useEffect(() => {
    const userData = localStorage.getItem(CURRENT_USER);
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        const isNewUser = parsedData.isNewUser === true;
        const isReturnedUser = parsedData.isReturnedUser === true;
        setShowWelcomeRewards(isNewUser || isReturnedUser);
      } catch (error) {
        console.error("Error parsing user data for welcome rewards:", error);
        setShowWelcomeRewards(false);
      }
    }
  }, [currentUser]);

  // Function to call user-calculator API and update localStorage
  const refreshUserData = async () => {
    let parsedUserData = null;
    try {
      // Get userData from localStorage
      const userData = localStorage.getItem(CURRENT_USER);
      let userId = null;
      if (userData) {
        try {
          parsedUserData = JSON.parse(userData);
          userId = parsedUserData.userId || parsedUserData.id;
        } catch (error) {
          console.error("Error parsing currentUser from localStorage:", error);
        }
      }
      if (!userId) {
        console.error("No userId found in localStorage");
        return;
      }
      
      // Fetch workShifts if not present in localStorage
      let workShifts = parsedUserData?.workShifts || [];
      if (!workShifts || workShifts.length === 0) {
        try {
          const workShiftsResponse = await fetch("/api/work-shifts");
          if (workShiftsResponse.ok) {
            const workShiftsResult = await workShiftsResponse.json();
            if (workShiftsResult.success && workShiftsResult.data) {
              workShifts = workShiftsResult.data;
            }
          }
        } catch (error) {
          console.error("Error fetching work shifts:", error);
        }
      }
      
      const response = await fetch("/api/user-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listUsers: [userId],
        }),
      });
      if (response.ok) {
        const freshUserData = await response.json();
        // Lấy user đầu tiên trong mảng data
        const user = Array.isArray(freshUserData.data)
          ? freshUserData.data[0]
          : null;
        if (user && parsedUserData) {
          // Preserve isNewUser, isReturnedUser và workShifts từ login response
          // Vì user-calculator API không trả về các field này
          const updatedUser = {
            ...user,
            isNewUser: parsedUserData.isNewUser,
            isReturnedUser: parsedUserData.isReturnedUser,
            workShifts: workShifts.length > 0 ? workShifts : (parsedUserData.workShifts || []),
          };
          localStorage.setItem(CURRENT_USER, JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  // Load currentUser và refresh data khi mount
  useEffect(() => {
    refreshUserData();
  }, []);

  const handleLogout = async () => {
    const result = await loginMutation.mutateAsync();
    const { statusCode, message } = result || {};
    if (statusCode === 200) {
      // Xóa thông tin user khỏi localStorage
      clearUserData();
      localStorage.clear();

      if (typeof window !== "undefined" && window.electron) {
        // @ts-ignore
        window.electron.send("close-app");
      }
    } else if (statusCode === 500) {
      toast.error(message);
    }
  };

  // Chỉ gọi checkGatewayBonus sau khi user-calculator fetch xong và currentUser đã ổn định
  // useEffect(() => {
  //   if (!currentUser) return;
  //   const checkGatewayBonus = async () => {
  //     try {
  //       let userId = null;
  //       const user = currentUser as any;
  //       userId = user.userId || user.id;
  //       if (!userId) {
  //         setShowGatewayBonus(false);
  //         return;
  //       }
  //       const res = await fetch(`/api/gateway-bonus?userId=${userId}`);
  //       if (res.ok) {
  //         const data = await res.json();
  //         setShowGatewayBonus(!!data.available);
  //       } else {
  //         setShowGatewayBonus(false);
  //       }
  //     } catch (err) {
  //       setShowGatewayBonus(false);
  //     }
  //   };
  //   checkGatewayBonus();
  // }, [currentUser]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading hoặc skeleton nếu chưa ở client hoặc chưa có currentUser
  if (!isClient || !currentUser) {
    return (
      <div className="flex h-screen bg-gray-200">
        <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
          <nav>
            <div className="flex justify-end mb-4">
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-1.5">
                  <div className="h-6 w-24 bg-gray-600 animate-pulse rounded"></div>
                </div>
                <div className="flex items-center bg-gray-600/80 rounded-full px-3 py-1.5">
                  <div className="h-6 w-16 bg-gray-500 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
            {/* Navigation skeleton */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="py-2.5 px-4">
                <div className="h-6 w-full bg-gray-600 animate-pulse rounded"></div>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex-1 p-10 text-2xl font-bold bg-gray-400">
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <div className="h-12 w-64 bg-gray-500 mx-auto mb-4 rounded"></div>
                <div className="h-8 w-48 bg-gray-500 mx-auto mb-2 rounded"></div>
                <div className="h-6 w-32 bg-gray-500 mx-auto rounded"></div>
              </div>
            </div>
            {/* Game-style loading animation */}
            <div className="flex space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <div className="text-gray-600 text-lg">Đang tải dữ liệu...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-200">
      {/* Left Sidebar */}
      <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 flex-shrink-0">
        <nav>
          <div className="flex justify-end mb-4">
            <div className="flex gap-2">
              <div className="flex items-center px-3 py-1.5">
                <span className="text-orange-500 uppercase font-semibold flex items-center gap-2">
                  {(currentUser as any)?.userName}
                </span>
              </div>
              <div className="flex items-center bg-gray-600/80 rounded-full px-3 py-1.5">
                <span className="text-white font-semibold flex items-center gap-1">
                  {(currentUser as any)?.stars?.toLocaleString()}
                  <span className="text-yellow-400">⭐</span>
                </span>
              </div>
            </div>
          </div>

          {GATEWAY_BIRTHDAY_ENABLE && (
            <Link
              className={cn(
                "block py-2.5 px-4 rounded transition-all duration-300 hover:bg-gray-700 relative overflow-hidden group",
                pathname === "/birthday" ? "bg-orange-500" : "bg-orange-400",
              )}
              href="/birthday"
            >
              <span className="relative z-10">Sinh nhật</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 via-yellow-500/20 via-green-500/20 via-blue-500/20 via-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          )}
          <Link
            className={cn(
              "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
              pathname === "/dashboard" ? "bg-gray-700" : "transparent",
            )}
            href="/dashboard"
          >
            Điểm danh
          </Link>
          {showWelcomeRewards && (
            <Link
              className={cn(
                "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
                pathname === "/welcome-tour" ? "bg-gray-700" : "transparent",
              )}
              href="/welcome-tour"
            >
              Quà chào mừng
            </Link>
          )}
          <Link
            className={cn(
              "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
              pathname === "/game" ? "bg-gray-700" : "transparent",
            )}
            href="/game"
          >
            Trò chơi
          </Link>
          {/* Tạm ẩn tính năng Hẹn chơi */}
          {/* <Link
            className={cn(
              "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
              pathname === "/game-appointments" ? "bg-gray-700" : "transparent",
            )}
            href="/game-appointments"
          >
            Hẹn chơi
          </Link> */}
          {STORE_DISABLED ? (
            <div className="block py-2.5 px-4 rounded text-gray-500 cursor-not-allowed">
              Đổi thưởng (Tạm khóa)
            </div>
          ) : (
            <Link
              className={cn(
                "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
                pathname === "/store" ? "bg-gray-700" : "transparent",
              )}
              href="/store"
            >
              Đổi thưởng
            </Link>
          )}
          <Link
            className={cn(
              "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
              pathname === "/feedback" ? "bg-gray-700" : "transparent",
            )}
            href="/feedback"
          >
            Phản hồi đã gửi
          </Link>
          {BATTLE_PASS_ENABLE && (
            <Link
              className={cn(
                "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
                pathname === "/battle-pass" ? "bg-gray-700" : "transparent",
              )}
              href="/battle-pass"
            >
              Battle Pass
            </Link>
          )}
          <Link
            className={cn(
              "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
              pathname === "/voucher" ? "bg-gray-700" : "transparent",
            )}
            href="/voucher"
          >
            Voucher
          </Link>
          {/* Tạm ẩn tính năng Hẹn chơi */}
          {/* <Link
            className={cn(
              "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
              pathname.startsWith("/game-appointments") ? "bg-gray-700" : "transparent",
            )}
            href="/game-appointments"
          >
            🎮 Hẹn chơi
          </Link> */}
          {/* {showGatewayBonus && (
            <Link
              className={cn(
                "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 flex items-center gap-2 font-bold",
                pathname === "/gateway-bonus"
                  ? "bg-gradient-to-r from-yellow-400/80 to-pink-400/80 text-white scale-105 shadow-lg"
                  : "text-yellow-400 animate-pulse",
              )}
              href="/gateway-bonus"
            >
              <span
                className={
                  pathname === "/gateway-bonus"
                    ? "text-2xl"
                    : "text-2xl animate-bounce"
                }
              >
                🎁
              </span>
              Gateway Bonus
              {pathname !== "/gateway-bonus" && (
                <span className="ml-2 animate-ping inline-flex h-3 w-3 rounded-full bg-yellow-400 opacity-75"></span>
              )}
            </Link>
          )} */}

          <div
            onClick={handleLogout}
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 cursor-pointer"
          >
            Thoát
          </div>
        </nav>
      </div>

      {/* Main Content Area - Scaled down to make room for chat */}
      <div
        className="flex-1 overflow-hidden"
        style={{ width: "calc(100% - 320px)" }}
      >
        {IS_MAINTENANCE ? (
          <div className="flex items-center justify-center h-full p-10 text-2xl font-bold bg-gray-400">
            <h1>
              Website bảo trì để nâng cấp phần mềm mới. Chúng tôi sẽ quay trở
              lại sớm. Rất mong các bạn thông cảm.
            </h1>
          </div>
        ) : STORE_DISABLED && pathname === "/store" ? (
          <div className="flex items-center justify-center h-full p-10 text-2xl font-bold bg-gray-400">
            <h1>
              Tính năng đổi thưởng đang tạm khóa để bảo trì. Vui lòng thử lại
              sau.
            </h1>
          </div>
        ) : (
          <div className="h-full overflow-auto">{children}</div>
        )}
      </div>

      {/* Fixed Chat Panel - Always visible on the right */}
      <div className="w-80 bg-white border-l border-gray-200 shadow-lg flex-shrink-0">
        <ChatPanel
          isOpen={true}
          onClose={() => {}} // Disable close for always-visible mode
          className="h-full"
        />
      </div>

      {/* Feedback Component - hiển thị xuyên suốt layout */}
      <Feedback />
    </div>
  );
};

export default DashBoardLayout;
