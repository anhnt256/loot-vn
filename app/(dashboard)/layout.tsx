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

const DashBoardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const loginMutation = useLogout();

  const { userName, userData, isNewUser } = useUserInfo();
  const { stars } = userData || {};
  const pathname = usePathname();

  const { execute: executeUpdateUser } = useAction(updateUser, {
    onSuccess: async () => {},
    onError: (error) => {
      toast.error(error);
    },
  });

  useEffect(() => {
    if (userData && userName) {
      const { id, rankId, userId, stars, branch } = userData;

      const data = {
        id,
        rankId,
        userId,
        stars,
        userName,
      };
      executeUpdateUser(data);
    }
  }, [userName, userData, executeUpdateUser]);

  const handleLogout = async () => {
    const result = await loginMutation.mutateAsync();
    const { statusCode, data, message } = result || {};
    if (statusCode === 200) {
      router.push("/");
    } else if (statusCode === 500) {
      toast.error(message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-200">
      <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
        <nav>
          <div className="flex justify-end mb-4">
            <div className="flex gap-2">
              <div className="flex items-center bg-gray-600/80 rounded-full px-3 py-1.5">
                <span className="text-white font-semibold flex items-center gap-2">
                  {stars?.toLocaleString()}
                  <Image src="/star.png" width="24" height="24" alt="stars" />
                </span>
              </div>

              <div className="flex items-center gap-2 bg-gray-600/80 rounded-full px-3 py-1.5">
                <span className="text-white font-semibold">25</span>
                <Image src={"/rock.png"} alt="wish" width="24" height="24" />
              </div>
            </div>
            {/*<div className="flex justify-center items-center">*/}
            {/*  <div className="mr-1 cursor-default">*/}
            {/*    {stars?.toLocaleString()}*/}
            {/*  </div>*/}
            {/*  <Image src="/rock.png" width="22" height="22" alt="stars" />*/}
            {/*</div>*/}
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
              pathname === "/missions" ? "bg-gray-700" : "transparent",
            )}
            href="/missions"
          >
            Nhiệm vụ
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
          <Link
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
              pathname === "/voucher" ? "bg-gray-700" : "transparent",
            )}
            href="/voucher"
          >
            Voucher
          </Link>
          <div
            onClick={handleLogout}
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 cursor-pointer"
          >
            Đăng xuất
          </div>
        </nav>
      </div>

      <div className="flex-1 p-10 text-2xl font-bold bg-gray-400">
        {children}
        {/*<h1>Website bảo trì để sửa lỗi. Dự kiến hoàn thành ngày 05/09/2024. Rất mong các bạn thông cảm.</h1>*/}
      </div>
    </div>
  );
};

export default DashBoardLayout;
