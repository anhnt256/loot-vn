"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUserInfo } from "@/hooks/use-user-info";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLogout } from "@/queries/auth.query";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { updateUser } from "@/actions/update-user";
import dayjs from "@/lib/dayjs";

// Hook auto logout sau 5 phút không hoạt động
function useAutoLogout(onLogout: () => void, timeout = 5 * 60 * 1000) {
  const timer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(onLogout, timeout);
    };
    const events = ["mousemove", "keydown", "click", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [onLogout, timeout]);
}

const DashBoardLayout = ({ children }: { children: React.ReactNode }) => {
  const loginMutation = useLogout();

  const { userName, userData } = useUserInfo();
  const { stars, magicStone } = userData || {};
  const pathname = usePathname();
  const [showGatewayBonus, setShowGatewayBonus] = useState(true);

  const IS_MAINTENANCE = process.env.NEXT_PUBLIC_IS_MAINTENANCE === "true";

  const { execute: executeUpdateUser } = useAction(updateUser, {
    onSuccess: async () => {},
    onError: (error) => {
      toast.error(error);
    },
  });

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

  // Tích hợp auto logout
  useAutoLogout(
    () => {
      if (typeof window !== "undefined" && window.electron) {
        // @ts-ignore
        window.electron.send("close-app");
      }
    },
    5 * 60 * 1000,
  );

  // Kiểm tra xem có hiển thị Gateway Bonus không
  useEffect(() => {
    const claimDeadline =
      process.env.NEXT_PUBLIC_GATEWAY_BONUS_DEADLINE || "2025-07-15";
    const now = dayjs();
    const deadline = dayjs(claimDeadline);

    if (now.isAfter(deadline)) {
      setShowGatewayBonus(false);
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-200">
      <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
        <nav>
          <div className="flex justify-end mb-4">
            <div className="flex gap-2">
              <div className="flex items-center  px-3 py-1.5">
                <span className="text-orange-500 uppercase font-semibold flex items-center gap-2">
                  {userName}
                </span>
              </div>
              <div className="flex items-center bg-gray-600/80 rounded-full px-3 py-1.5">
                <span className="text-white font-semibold flex items-center gap-2">
                  {stars?.toLocaleString()}
                  <Image src="/star.png" width="24" height="24" alt="stars" />
                </span>
              </div>
            </div>
          </div>
          {/*{isNewUser && (*/}
          {/*  <Link*/}
          {/*    className={cn(*/}
          {/*      "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",*/}
          {/*      pathname === "/welcome" ? "bg-gray-700" : "transparent",*/}
          {/*    )}*/}
          {/*    href="/welcome"*/}
          {/*  >*/}
          {/*    Quà chào mừng*/}
          {/*  </Link>*/}
          {/*)}*/}

          <Link
            className={cn(
              "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
              pathname === "/dashboard" ? "bg-gray-700" : "transparent",
            )}
            href="/dashboard"
          >
            Điểm danh
          </Link>
          <Link
            className={cn(
              "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
              pathname === "/game" ? "bg-gray-700" : "transparent",
            )}
            href="/game"
          >
            Trò chơi
          </Link>
          {showGatewayBonus && (
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
          )}
          {/* <Link
            className={cn(
              "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
              pathname === "/store" ? "bg-gray-700" : "transparent",
            )}
            href="/store"
          >
            Đổi thưởng
          </Link>
          <Link
            className={cn(
              "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
              pathname === "/battle-pass" ? "bg-gray-700" : "transparent",
            )}
            href="/battle-pass"
          >
            Battle Pass
          </Link> */}
          {/*<Link*/}
          {/*  className={cn(*/}
          {/*    "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",*/}
          {/*    pathname === "/voucher" ? "bg-gray-700" : "transparent",*/}
          {/*  )}*/}
          {/*  href="/voucher"*/}
          {/*>*/}
          {/*  Voucher*/}
          {/*</Link>*/}
          <div
            onClick={handleLogout}
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 cursor-pointer"
          >
            Thoát
          </div>
        </nav>
      </div>

      <div className="flex-1 p-10 text-2xl font-bold bg-gray-400">
        {IS_MAINTENANCE ? (
          <h1>
            Website bảo trì để nâng cấp phần mềm mới. Chúng tôi sẽ quay trở lại
            sớm. Rất mong các bạn thông cảm.
          </h1>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default DashBoardLayout;
