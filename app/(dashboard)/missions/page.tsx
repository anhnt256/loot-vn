"use client";

import { Button } from "@/components/ui/button";
import MissionList from "./_component/MissionList/MissionList";
import { Mission } from "@prisma/client";
import { fetcher } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";
import { useUserInfo } from "@/hooks/use-user-info";
import { getCookie } from "cookies-next";
import { BRANCH } from "@/constants/enum.constant";
import { useCallback, useEffect, useState } from "react";
import { checkReward } from "@/lib/utils";
import { toast } from "sonner";

const Missions = () => {
  const { userName, userData } = useUserInfo();
  const branch = getCookie("branch") || BRANCH.GOVAP;

  const [canClaimItems, setCanClaimItems] = useState<any[]>([]);

  const { data: cards } = useQuery<[Mission]>({
    queryKey: ["mission"],
    queryFn: () => fetcher(`/api/mission`),
  });

  const { data: userMissionData } = useQuery<any[]>({
    queryKey: ["user-mission-map", userData?.userId],
    enabled: !!userData && !!branch,
    queryFn: () =>
      fetcher(`/api/user-mission-map/${userData?.userId}/${branch}`),
  });

  const onCheckReward = useCallback(
    async (isClick: boolean) => {
      if (userMissionData && userMissionData.length > 0) {
        const claims: any[] = [];
        const result = await fetcher(`/api/account/${userName}/balance`);
        await Promise.all(
          userMissionData.map(async (item, index) => {
            const { id } = item;
            const canClaim = checkReward(result, item.mission);
            claims.push({ canClaim, id });
          }),
        );
        setCanClaimItems(claims);
        if (isClick) {
          toast.success("Cập nhật tiến độ thành công!");
        }
      }
    },
    [userMissionData],
  );

  useEffect(() => {
    (async () => {
      if (userMissionData && userMissionData.length > 0) {
        await onCheckReward(false);
      }
    })();
  }, [userMissionData]);

  return (
    <div className="flex flex-col p-5 gap-4">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-2 mr-4">
            Trung tâm nhiệm vụ
          </h2>

          <div className="flex mr-4 items-center justify-between">
            <div className="flex mr-4">
              <div className="w-4 h-4 bg-orange-700/50 mr-2" />
              <div className="text-xs">Đã nhận thưởng</div>
            </div>
            <div className="flex mr-4">
              <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mr-2" />
              <div className="text-xs">Có thể nhận thưởng</div>
            </div>
            <Button variant="green" onClick={() => onCheckReward(true)}>
              Cập nhật tiến độ
            </Button>
          </div>
        </div>

        <div id="calendar" className="overflow-y-auto">
          <MissionList
            cards={cards}
            canClaimItems={canClaimItems}
            userMissionData={userMissionData}
          />
        </div>
      </div>
    </div>
  );
};

export default Missions;
