"use client";

import React, { useEffect, useMemo, useState } from "react";
import RewardCard from "@/app/(dashboard)/store/RewardCard/RewardCard";

const RewardList = ({ rewards }: { rewards: any }) => {
  const renderData = useMemo(() => {
    return (
      <>
        {rewards &&
          rewards.length > 0 &&
          rewards.map((reward: any, index: number) => (
            <div className="w-1/6 p-2" key={index}>
              <RewardCard data={reward} />
            </div>
          ))}
      </>
    );
  }, [rewards]);

  return (
    <div className="flex flex-wrap justify-items-center">{renderData}</div>
  );
};
export default RewardList;
