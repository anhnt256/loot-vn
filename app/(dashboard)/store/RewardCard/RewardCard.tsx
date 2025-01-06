import React, { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUserInfo } from "@/hooks/use-user-info";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { createUserRewardMap } from "@/actions/create-user-reward-map";
import { currentTimeVN } from "@/lib/dayjs";
import { getCookie } from "cookies-next";
import { BRANCH } from "@/constants/enum.constant";

interface CardProps {
  data: any;
}

const RewardCard: React.FC<CardProps> = ({ data }) => {
  const { userData } = useUserInfo();
  const { userId, stars } = userData || {};
  const { id, name, value, totalPromotion } = data;
  const branch = getCookie("branch") || BRANCH.GOVAP;

  let bgColor = "";
  if (stars && stars >= value) {
    bgColor =
      "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white";
  }

  const { execute: executeCreateUserRewardMap, isLoading } = useAction(
    createUserRewardMap,
    {
      onSuccess: async () => {},
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

  const onReward = async () => {
    if (!isLoading) {
      if (totalPromotion === 0) {
        toast.error(
          "Số luợng mã đã hết. Vui lòng liên hệ admin để bổ sung. Xin cảm ơn.",
        );
      } else {
        if (userId && stars && stars - value >= 0 && userData) {
          const { id: currentUserId, stars } = userData;
          const newStars = stars - value;
          await executeCreateUserRewardMap({
            userId,
            rewardId: id,
            currentUserId: currentUserId,
            value,
            branch,
            oldStars: stars,
            newStars,
            createdAt: currentTimeVN,
          });
          window.location.reload();
        } else {
          toast.error("Bạn không có đủ số sao để đổi thưởng.");
        }
      }
    }
  };

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      <Image
        src="/reward.png"
        alt={name}
        width={500}
        height={300}
        objectFit="cover"
        priority={true}
      />
      <div className="px-5 py-4">
        <div className="font-bold text-xs mb-2 min-h-[32px] cursor-default">
          {name}
        </div>
        <p className="text-gray-700 font-normal text-xs min-h-[64px] cursor-default">
          {`Số lượng: ${totalPromotion.toLocaleString()}`}
        </p>
      </div>
      <hr />
      <div className="px-5 py-4">
        <div className="flex justify-center items-center">
          <Button
            disabled={totalPromotion === 0 || isLoading}
            variant="primary"
            className={bgColor}
            onClick={onReward}
          >
            <div className="mr-1">{value?.toLocaleString()}</div>
            <Image src="/star.png" width="22" height="22" alt="stars" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RewardCard;
