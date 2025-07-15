"use client";

import { Reward } from "@/prisma/generated/prisma-client";
import { fetcher } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import RewardList from "./RewardList/RewardList";
import RewardHistory from "./RewardHistory/RewardHistory";
import { Button } from "@/components/ui/button";
import { getCookie } from "cookies-next";
import { BRANCH } from "@/constants/enum.constant";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";
import { CURRENT_USER } from "@/constants/token.constant";

const Store = () => {
  const branch = getCookie("branch") || BRANCH.GOVAP;
  const userData = useLocalStorageValue(CURRENT_USER, null) as any;
  const userId = userData?.userId || userData?.id;
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data: rewards, isLoading } = useQuery<[Reward]>({
    queryKey: ["reward"],
    queryFn: () => fetcher(`/api/reward/${branch}`),
  });

  const handleRewardSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  // return (
  //   <div>
  //     <h1>Tính năng đang bảo trì, vui lòng quay lại sau</h1>
  //   </div>
  // );

  return (
    <div className="flex p-4 gap-4 h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Cột trái - Trung tâm quà tặng */}
      <div className="flex-1 bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col border border-gray-200">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🎁</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Trung tâm quà tặng
                </h2>
                <p className="text-sm text-gray-600">Đổi sao lấy phần thưởng</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-3">
            <div className="flex items-start space-x-3">
              <span className="text-orange-500 text-lg">ℹ️</span>
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Thông báo quan trọng:</p>
                <p className="text-xs leading-relaxed">
                  Sau khi đổi thưởng, phần thưởng sẽ được cộng trực tiếp vào số dư tài
                  khoản. Vui lòng đăng nhập lại để cập nhật số giờ chơi chính xác. Xin
                  cảm ơn.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Đang tải phần thưởng...</p>
              </div>
            </div>
          ) : (
            <RewardList rewards={rewards} onRewardSuccess={handleRewardSuccess} />
          )}
        </div>
      </div>
      
      {/* Cột phải - Lịch sử đổi thưởng */}
      <div className="w-96 bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col border border-gray-200">
        {userId ? (
          <RewardHistory key={refreshKey} userId={userId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🔐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Cần đăng nhập</h3>
              <p className="text-gray-500 text-sm">Vui lòng đăng nhập để xem lịch sử đổi thưởng</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Store;
