"use client";

import React from "react";
import Link from "next/link";
import { useUserInfo } from "@/hooks/use-user-info";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLogout } from "@/queries/auth.query";
import { toast } from "sonner";
import FacebookMsg from "@/components/FacebookMsg";

const DashBoardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const loginMutation = useLogout();

  const { userData } = useUserInfo();
  const { stars } = userData || {};
  const pathname = usePathname();

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
            <div className="flex justify-center items-center mr-4">
              <div className="mr-1 cursor-default">
                {stars?.toLocaleString()}
              </div>
              <Image src="/star.png" width="22" height="22" alt="stars" />
            </div>
            {/*<div className="flex justify-center items-center">*/}
            {/*  <div className="mr-1 cursor-default">*/}
            {/*    {stars?.toLocaleString()}*/}
            {/*  </div>*/}
            {/*  <Image src="/rock.png" width="22" height="22" alt="stars" />*/}
            {/*</div>*/}
          </div>
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
        <FacebookMsg />
      </div>
    </div>
  );
};

export default DashBoardLayout;
