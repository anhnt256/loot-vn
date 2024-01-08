"use client";

import React, { useEffect, useState } from "react";
import MissionCard from "../MissionCard/MissionCard";
import { Mission, User, UserMissionMap } from "@prisma/client";
import { fetcher } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";
import { useAction } from "@/hooks/use-action";
import { createUserMissionMap } from "@/actions/create-user-mission-map";
import { toast } from "sonner";
import { useUserInfo } from "@/hooks/use-user-info";
import { getCookie } from "cookies-next";
import { BRANCH } from "@/constants/enum.constant";
const List = () => {
  const [currentData, setCurrentData] = useState<Mission[]>([]);
  const { userData } = useUserInfo();
  const branch = getCookie("branch") || BRANCH.GOVAP;

  const { data: cards, isLoading } = useQuery<[Mission]>({
    queryKey: ["mission"],
    queryFn: () => fetcher(`/api/mission`),
  });

  const { execute: executeCreateUserMissionMap } = useAction(
    createUserMissionMap,
    {
      onSuccess: () => {},
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  const { data: userMissionData } = useQuery<UserMissionMap[]>({
    queryKey: ["user-mission-map", userData?.userId],
    enabled: !!userData && !!branch,
    queryFn: () =>
      fetcher(`/api/user-mission-map/${userData?.userId}/${branch}`),
  });

  useEffect(() => {
    if (userMissionData && userMissionData?.length === 0) {
      if (cards && cards.length > 0) {
        setCurrentData(cards);
        if (userData) {
          cards.forEach((card) => {
            executeCreateUserMissionMap({
              branch,
              userId: userData.userId,
              missionId: card.id,
            });
          });
        }
      }
    }
  }, [cards, userMissionData]);

  return (
    <div className="flex flex-wrap justify-between">
      {currentData &&
        currentData.map((card, index) => (
          <div className="w-1/5 p-4" key={index}>
            {currentData && currentData.length > 0 && (
              <MissionCard data={card} />
            )}
          </div>
        ))}
    </div>
  );
};
export default List;
