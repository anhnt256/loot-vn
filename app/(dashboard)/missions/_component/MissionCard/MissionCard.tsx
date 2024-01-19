import React from "react";
import { Mission, User } from "@prisma/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { updateUserMissionMap } from "@/actions/update-user-mission-map";
import { toast } from "sonner";
import dayjs, { nowUtc } from "@/lib/dayjs";
import { updateUser } from "@/actions/update-user";
import { useUserInfo } from "@/hooks/use-user-info";
import { fetcher } from "@/lib/fetcher";
import { checkReward, cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface CardProps {
  data: any;
  canClaimItems: any;
}

const Card: React.FC<CardProps> = ({ data, canClaimItems }) => {
  const { id: missionId, mission, isDone } = data;

  const { userBalance, userName, userData } = useUserInfo();
  const { name, description, reward, type, startHours, endHours, quantity } =
    mission || {};

  const { userId, branch } = userData || {};

  const canClaim = canClaimItems.filter((x: any) => x.id === missionId)[0]
    ?.canClaim;

  let bgColor = "";
  if (!isDone && canClaim) {
    bgColor =
      "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white";
  }

  const { execute: executeUpdateUser } = useAction(updateUser, {
    onSuccess: () => {},
    onError: (error) => {
      toast.error(error);
    },
  });

  const { data: newUserData } = useQuery<User>({
    queryKey: ["user", userId],
    enabled: !!branch && !!branch,
    queryFn: () => fetcher(`/api/user/${userId}/${branch}`),
  });

  const { execute: executeUpdateUserMissionMap, isLoading } = useAction(
    updateUserMissionMap,
    {
      onSuccess: async (data) => {
        if (newUserData) {
          const { id, userId, rankId, stars, branch } = newUserData;
          const data = {
            id,
            rankId,
            userId,
            stars: stars + reward,
            userName,
            branch,
            mission: {
              type,
              startHours,
              endHours,
              quantity,
            },
          };
          await executeUpdateUser(data);
        }
        // window.location.reload();
      },
      onError: (error) => {
        if (error === "Reward has claim.") {
          toast.error(error);
          return;
        } else {
          toast.error(error);
        }
      },
    },
  );

  const onReward = async (id: number) => {
    if (!isLoading) {
      const canClaim = checkReward(userBalance, mission);
      if (canClaim) {
        await executeUpdateUserMissionMap({
          id,
          isDone: true,
          updatedAt: nowUtc,
        });
      } else {
        toast.message(
          "Bạn chưa đủ điều kiện nhận thưởng. Hãy quay lại sau nhé.",
        );
      }
    }
  };

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      <Image
        src="/quest.png"
        alt={name}
        width={500}
        height={300}
        objectFit="cover"
      />
      <div className="px-5 py-4">
        <div className="font-bold text-xs mb-2 min-h-[32px] cursor-default">
          {name}
        </div>
        <p className="text-gray-700 font-normal text-xs min-h-[64px] cursor-default">
          {description}
        </p>
      </div>
      <hr />
      <div className="px-5 py-4">
        <div className="flex justify-center items-center">
          <Button
            disabled={isDone}
            className={bgColor}
            variant="primary"
            onClick={() => onReward(missionId)}
          >
            <div className="mr-1">{reward?.toLocaleString()}</div>
            <Image src="/star.png" width="22" height="22" alt="stars" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Card;
