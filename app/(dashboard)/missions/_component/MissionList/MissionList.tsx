"use client";

import React, { useEffect, useMemo, useState } from "react";
import MissionCard from "../MissionCard/MissionCard";
import { Mission } from "@/prisma/generated/prisma-client";
import { useAction } from "@/hooks/use-action";
import { createUserMissionMap } from "@/actions/create-user-mission-map";
import { toast } from "sonner";
import { useUserInfo } from "@/hooks/use-user-info";
import { getCookie } from "cookies-next";
import { BRANCH } from "@/constants/enum.constant";
import { currentTimeVN } from "@/lib/dayjs";
import { Skeleton } from "@/components/ui/skeleton";

const List = ({
  cards,
  canClaimItems,
  userMissionData,
}: {
  cards: any;
  canClaimItems: any;
  userMissionData: any;
}) => {
  const [currentData, setCurrentData] = useState<Mission[]>([]);
  const { userData } = useUserInfo();
  const branch = getCookie("branch") || BRANCH.GOVAP;

  const { execute: executeCreateUserMissionMap, isLoading } = useAction(
    createUserMissionMap,
    {
      onSuccess: () => {
        window.location.reload();
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  useEffect(() => {
    if (userMissionData && userMissionData?.length < 5) {
      if (cards && cards.length > 0) {
        if (userData) {
          const data: any[] = [];
          cards.forEach((card: any, index: number) => {
            data.push({
              branch,
              userId: userData.userId,
              missionId: card.id,
              createdAt: currentTimeVN,
            });
          });
          executeCreateUserMissionMap(data);
        }
      }
    }
  }, [cards, userMissionData]);

  useEffect(() => {
    if (userMissionData && userMissionData.length === 5) {
      setCurrentData(userMissionData);
    }
  }, [userMissionData]);

  const renderData = useMemo(() => {
    return (
      <>
        {currentData &&
          currentData.length > 0 &&
          currentData.map((card, index) => (
            <div className="w-1/5 p-4" key={index}>
              <MissionCard data={card} canClaimItems={canClaimItems} />
            </div>
          ))}
      </>
    );
  }, [currentData, canClaimItems]);

  const renderSkeleton = (
    <>
      {Array.from({ length: 5 }).map((card, index) => (
        <div className="w-1/5 p-4" key={index}>
          {currentData && currentData.length > 0 && (
            <div className="max-w-sm rounded overflow-hidden shadow-lg">
              <Skeleton className="w-[500px] h-[300px]" />
            </div>
          )}
        </div>
      ))}
    </>
  );

  return <div className="flex flex-wrap justify-between">{renderData}</div>;
};
export default List;
