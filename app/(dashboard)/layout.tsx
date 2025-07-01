"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useUserInfo } from "@/hooks/use-user-info";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLogout } from "@/queries/auth.query";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { updateUser } from "@/actions/update-user";

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
  }, [userName, userData, executeUpdateUser, magicStone]);

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
          {/*<Link*/}
          {/*  className={cn(*/}
          {/*    "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",*/}
          {/*    pathname === "/missions" ? "bg-gray-700" : "transparent",*/}
          {/*  )}*/}
          {/*  href="/missions"*/}
          {/*>*/}
          {/*  Nhiệm vụ*/}
          {/*</Link>*/}
          <Link
            className={cn(
              "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
              pathname === "/game" ? "bg-gray-700" : "transparent",
            )}
            href="/game"
          >
            Trò chơi
          </Link>
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
        {/* {children} */}
        <h1>
          Website bảo trì để nâng cấp phần mềm mới. Chúng tôi sẽ quay trở lại
          sớm. Rất mong các bạn thông cảm.
        </h1>
      </div>
    </div>
  );
};

export default DashBoardLayout;
