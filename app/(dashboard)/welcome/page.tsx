"use client";

import { Reward } from "@/prisma/generated/prisma-client";
import { fetcher } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import VoucherList from "@/app/(dashboard)/voucher/VoucherList/VoucherList";
import { getCookie } from "cookies-next";
import { BRANCH } from "@/constants/enum.constant";
import Image from "next/image";
import { useUserInfo } from "@/hooks/use-user-info";

const Voucher = () => {
  const router = useRouter();
  const { userData, isNewUser } = useUserInfo();

  useEffect(() => {
    if (!isNewUser) {
      router.push("/dashboard");
    }
  }, [isNewUser, router]);

  const arrayCard = [
    {
      id: 1,
      title: "Nạp 50k",
      mainValue: 50000,
      subValue: 50000,
      totalValue: 100000,
      discountPercentage: 100,
      currentPrice: 100000,
    },
    {
      id: 2,
      title: "Nạp 100k",
      mainValue: 100000,
      subValue: 120000,
      totalValue: 220000,
      discountPercentage: 120,
      currentPrice: 220000,
    },
    {
      id: 3,
      title: "Nạp 200k",
      mainValue: 200000,
      subValue: 280000,
      totalValue: 480000,
      discountPercentage: 140,
      currentPrice: 480000,
    },
    {
      id: 4,
      title: "Nạp 500k",
      mainValue: 500000,
      subValue: 800000,
      totalValue: 1300000,
      discountPercentage: 160,
      currentPrice: 1300000,
    },
    {
      id: 5,
      title: "Nạp 700k",
      mainValue: 700000,
      subValue: 1260000,
      totalValue: 1960000,
      discountPercentage: 180,
      currentPrice: 1960000,
    },
    {
      id: 6,
      title: "Nạp 1,000k",
      mainValue: 1000000,
      subValue: 2000000,
      totalValue: 3000000,
      discountPercentage: 200,
      currentPrice: 3000000,
    },
  ];

  const arrayOther = [
    {
      id: 1,
      title: "Miễn phí 1 nước pha chế tự chọn",
      description: "Miễn phí 1 nước pha chế tự chọn khi order từ 40k",
    },
    {
      id: 2,
      title: "Miễn phí 1 nước pha chế tự chọn",
      description: "Miễn phí 1 nước pha chế tự chọn khi order từ 40k",
    },
    {
      id: 3,
      title: "Miễn phí 1 phần cá viên",
      description: "Miễn phí 1 phần cá viên khi order nước pha chế tự chọn",
    },
    {
      id: 4,
      title: "Miễn phí 1 phần cá viên",
      description: "Miễn phí 1 phần cá viên khi order nước pha chế tự chọn",
    },
    {
      id: 5,
      title: "Mua 2 tặng 1",
      description: "Miễn phí 1 phần nước pha chế khi order từ 2 ly",
    },
    {
      id: 6,
      title: "Mua 2 tặng 1",
      description: "Miễn phí 1 phần nước pha chế khi order từ 2 ly",
    },
  ];

  return (
    <div className="flex flex-col p-5 gap-4">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full overflow-auto max-h-[89vh]">
        <div id="calendar" className="overflow-y-auto">
          <div className="flex justify-between mb-8">
            {arrayCard.map((item, index) => {
              return (
                <div
                  key={index}
                  className="max-w-sm rounded overflow-hidden shadow-lg relative mb-4 mr-4"
                >
                  <Image
                    className="w-full"
                    src="./welcome.png"
                    alt="Card Image"
                  />

                  <div className="absolute top-0 right-0 bg-green-500 rounded-full text-white text-sm p-2 m-2">
                    {`+${item.discountPercentage}%`}
                  </div>

                  <div className="px-6 py-4">
                    <div className="flex flex-col justify-center">
                      <div className="text-lg text-green-500">{`Nhận ngay ${item.totalValue.toLocaleString()}đ`}</div>
                      <div className="text-sm text-blue-500">{`Tài khoản chính: ${item.mainValue.toLocaleString()}đ`}</div>
                      <div className="text-sm text-orange-500">{`Tài khoản phụ: ${item.subValue.toLocaleString()}đ`}</div>
                    </div>
                  </div>
                  <div className="px-6 pt-4 pb-2 bg-blue-100 text-green-500 text-center text-lg">
                    <div>{`Nạp ${item.mainValue.toLocaleString()}đ`}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-start">
            {arrayOther.map((item, index) => {
              return (
                <div
                  key={index}
                  className="max-w-sm rounded overflow-hidden shadow-lg relative mb-4 mr-4"
                >
                  <Image
                    className="w-full"
                    src="./welcome.png"
                    alt="Card Image"
                  />

                  <div className="px-6 py-4">
                    <div className="font-bold text-xl mb-2 min-h-[56px]">
                      {item.title}
                    </div>
                    <p className="text-gray-700 text-base">
                      {item.description}
                    </p>
                  </div>
                  <div className="px-6 pt-4 pb-2 bg-blue-100 text-green-500 text-center text-lg">
                    <div>Order Ngay</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voucher;
