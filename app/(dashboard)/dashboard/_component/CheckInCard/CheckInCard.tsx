import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, Star, RefreshCw } from "lucide-react";
import dayjs from "@/lib/dayjs";
import { useAction } from "@/hooks/use-action";
import { createCheckInResult } from "@/actions/create-checkInResult";
import { toast } from "sonner";
import { useUserInfo, useUserCheckIn, useCheckInItem } from "@/hooks/use-user-info";
import { UserStarHistory } from "@/prisma/generated/prisma-client";
import isEmpty from "lodash/isEmpty";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import Image from "next/image";
import { Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { getCurrentDayOfWeekVN } from "@/lib/battle-pass-utils";

const CheckInCard = () => {
  const [isChecking, setIsChecking] = useState<boolean | undefined>(false);
  const [playTime, setPlayTime] = useState<number>(0);
  const [rewards, setRewards] = useState<number>(0);
  const { userData, currentUserId, branch } = useUserInfo();
  const { userCheckIn } = useUserCheckIn(currentUserId, branch);
  const { checkInItem } = useCheckInItem();

  const { userId } = userData || {};

  const claim = useMemo(() => {
    const date = dayjs().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");

    const currentResults = userCheckIn?.filter((item: UserStarHistory) => {
      const itemDate = dayjs(item.createdAt).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
      return itemDate === date;
    });

    if (isEmpty(currentResults)) {
      return 0;
    }

    const totalClaim = currentResults?.reduce((sum, item) => {
      return sum + (item.newStars - item.oldStars);
    }, 0);

    // Debug logging for claim calculation
    console.log('Claim Debug:', {
      date,
      currentResults,
      totalClaim
    });

    return totalClaim;
  }, [userCheckIn]);

  const { data: totalHours } = useQuery<[any]>({
    queryKey: ["user-spend"],
    enabled: !!userId && !!branch,
    queryFn: () => fetcher(`/api/spend/${userId}/${branch}`),
  });

  // Debug logging for data loading
  console.log('CheckIn Data Debug:', {
    userId,
    branch,
    totalHours,
    checkInItem,
    userCheckIn,
    userData
  });

  const { execute: executeCheckIn } = useAction(createCheckInResult, {
    onSuccess: () => {
      toast.success("Check-in thành công!");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleCheckIn = useCallback(async () => {
    const canClaim = rewards - claim;
    if ((rewards || claim) < 0) {
      toast.error("Lỗi hệ thống. Vui lòng liên hệ nhân viên để được hỗ trợ!");
      return;
    }

    if (isChecking || canClaim <= 0) {
      toast.error("Bạn không có phần thưởng để nhận");
      return;
    }
    if (!isChecking && userCheckIn) {
      if (userData) {
        const { userId, branch } = userData;
        setIsChecking(true);
        await executeCheckIn({
          userId,
          branch,
          addedStar: canClaim,
        });
        setIsChecking(false);
      }
    }
  }, [rewards, claim, isChecking, userData, executeCheckIn]);

  useEffect(() => {
    if (checkInItem && totalHours !== undefined) {
      const currentTime = totalHours as unknown as number;
      const today = getCurrentDayOfWeekVN();

      setPlayTime(currentTime);

      const todayCheckIn = checkInItem.find((item) => item.dayName === today);
      const starsPerHour = todayCheckIn ? todayCheckIn.stars : 1000;

      const calculatedRewards = currentTime * starsPerHour;
      setRewards(calculatedRewards);

      // Debug logging
      console.log('CheckIn Debug:', {
        currentTime,
        today,
        todayCheckIn,
        starsPerHour,
        calculatedRewards,
        claim,
        canClaim: calculatedRewards - claim
      });
    }
  }, [totalHours, checkInItem, claim]);

  const handleUpdate = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="border-2 p-8 border-gray-400 shadow-card rounded-lg">
      {isChecking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Spin size="large" />
        </div>
      )}
      {/* Title with date */}
      <div className="text-center mb-6">
        <h2 className="text-yellow-500 font-bold text-xl">Điểm danh ngày</h2>
        <p className="text-yellow-500 font-bold text-xl">
          {dayjs().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")}
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-4 mb-6">
        {/* Play time */}
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-gray-400">Tổng thời gian chơi</p>
            <p className="text-white font-bold text-lg">{playTime}h</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-yellow-500">
            <StarFilled className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-gray-400">Đã nhận</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-bold text-lg">
                {claim.toLocaleString()}
              </p>
              <Image src="/star.png" width="24" height="24" alt="stars" />
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="flex items-center gap-2">
          <div className="text-yellow-500">
            <StarOutlined className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-gray-400">Có thể nhận</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-bold text-lg">
                {(rewards - claim).toLocaleString()}
              </p>
              <Image src="/star.png" width="24" height="24" alt="stars" />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleUpdate}
          className="flex-1 flex items-center justify-center gap-2 text-xl bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Cập nhật</span>
        </button>

        <button
          disabled={rewards - claim <= 0}
          onClick={handleCheckIn}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xl py-2 px-4 rounded-lg transition-all duration-200 font-bold"
        >
          Nhận thưởng
        </button>
      </div>
    </div>
  );
};

export default CheckInCard;
