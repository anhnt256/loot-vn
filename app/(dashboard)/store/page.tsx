"use client";

import { Reward } from "@/prisma/generated/prisma-client";
import { fetcher } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo } from "react";
import RewardList from "./RewardList/RewardList";
import { Button } from "@/components/ui/button";
import { getCookie } from "cookies-next";
import { BRANCH } from "@/constants/enum.constant";

const Store = () => {
  const branch = getCookie("branch") || BRANCH.GOVAP;
  const { data: rewards } = useQuery<[Reward]>({
    queryKey: ["reward"],
    queryFn: () => fetcher(`/api/reward/${branch}`),
  });

  return (
    <div className="flex flex-col p-5 gap-4">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full overflow-auto max-h-[89vh]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-2 mr-4">
            Trung tâm quà tặng
          </h2>
          <div className="flex mr-4 items-center justify-between">
            <div className="flex mr-4">
              <div className="w-4 h-4 bg-orange-700/50 mr-2" />
              <div className="text-xs">Đã hết mã</div>
            </div>
            <div className="flex mr-4">
              <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mr-2" />
              <div className="text-xs">Có thể đổi thưởng</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-black p-1 font-semibold mb-2 mr-4 bg-orange-300 w-full">
            Sau khi đổi thưởng, phần thưởng sẽ được cộng trực tiếp vào số dư tài khoản. Vui lòng đăng nhập lại để cập nhật số giờ chơi chính xác. Xin cảm ơn.
          </span>
        </div>

        <div id="calendar" className="overflow-y-auto">
          <RewardList rewards={rewards} />
        </div>
      </div>
    </div>
  );
};

export default Store;
