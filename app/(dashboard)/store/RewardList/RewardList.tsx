"use client";

import React, { useEffect, useMemo, useState } from "react";
import RewardCard from "@/app/(dashboard)/store/RewardCard/RewardCard";

const RewardList = ({ rewards, onRewardSuccess }: { rewards: any; onRewardSuccess?: () => void }) => {
  const renderData = useMemo(() => {
    if (!rewards || rewards.length === 0) {
      return (
        <div className="col-span-full flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-4xl mb-4">🎁</div>
            <p className="text-gray-500 text-lg">Không có phần thưởng nào</p>
            <p className="text-gray-400 text-sm">Vui lòng quay lại sau</p>
          </div>
        </div>
      );
    }

    return rewards.map((reward: any, index: number) => (
      <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
        <RewardCard data={reward} onRewardSuccess={onRewardSuccess} />
      </div>
    ));
  }, [rewards, onRewardSuccess]);

      return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {renderData}
    </div>
  );
};

export default RewardList;
