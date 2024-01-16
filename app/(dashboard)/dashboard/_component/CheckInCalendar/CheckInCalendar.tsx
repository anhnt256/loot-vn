"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { updateUser } from "@/actions/update-user";
import { useQuery } from "@tanstack/react-query";
import { CheckInItem } from "@prisma/client";
import { fetcher } from "@/lib/fetcher";
import { useCallback, useState } from "react";
import { createCheckInResult } from "@/actions/create-checkInResult";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import dayjs from "@/lib/dayjs";
import { useUserInfo } from "@/hooks/use-user-info";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MIN_LOGIN_TIME } from "@/constants/constant";

const CheckInCalendar = () => {
  const [isChecking, setIsChecking] = useState<boolean | undefined>(false);
  const [isShowModal, setShowModal] = useState<boolean>(false);
  const { userName, userData, userCheckIn } = useUserInfo();
  const [currentInfo, setCurrentInfo] = useState<
    | {
        day: string;
        star: number;
      }
    | undefined
  >();

  const { data: todaySpentTime } = useQuery<number>({
    queryKey: ["today-spent-time", userName],
    enabled: !!userName,
    queryFn: () => fetcher(`/api/account/${userName}/today-spent-time`),
  });

  // Get the first day of the next month
  function getAllDaysOfMonth() {
    const year = dayjs().year();
    const month = dayjs().month() + 1;
    const daysInMonth = dayjs(new Date(year, month, 0)).date();
    const daysList = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = dayjs(new Date(year, month - 1, day)).format("YYYY-MM-DD");
      daysList.push(date);
    }

    return daysList;
  }

  function chunkArrayInGroups(arr: string[], size: number) {
    const result = [];

    for (let i = 0; i < arr.length; i += size) {
      const chunk = arr.slice(i, i + size);
      result.push(chunk);
    }

    return result;
  }

  const { execute: executeCheckIn } = useAction(createCheckInResult, {
    onSuccess: () => {
      toast.success("Check-in thành công!");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { execute: executeUpdateUser } = useAction(updateUser, {
    onSuccess: async () => {
      if (userData) {
        const { userId, branch } = userData;
        await executeCheckIn({ userId, branch });
        setIsChecking(false);
        window.location.reload();
      }
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { data: checkInData, isLoading } = useQuery<[CheckInItem]>({
    queryKey: ["check-in-item"],
    queryFn: () => fetcher(`/api/check-in-item`),
  });

  const handleDayClick = useCallback(
    async (day: string, star: number) => {
      if (!isChecking && userCheckIn) {
        const hasCheckIn = userCheckIn.find(
          (x) =>
            dayjs(x.createdAt).format("DD/MM/YYYY") ===
            dayjs(day).format("DD/MM/YYYY"),
        );
        if (hasCheckIn) {
          toast.error("Hôm nay bạn đã điểm danh!");
          return;
        }
        if (dayjs(day).isToday()) {
          if (todaySpentTime && todaySpentTime >= MIN_LOGIN_TIME) {
            setIsChecking(true);
            if (userData) {
              const { id, userId, rankId, stars, branch } = userData;
              if (userName) {
                await executeUpdateUser({
                  id,
                  rankId,
                  stars: stars + star,
                  magicStone: 0,
                  userId,
                  branch,
                  userName,
                });
              }
            }
          } else {
            toast.error(`Hôm nay bạn chưa chơi đủ ${MIN_LOGIN_TIME} phút !`);
            return;
          }
        } else if (dayjs(day).isSameOrAfter(dayjs())) {
          toast.error("Chưa đến ngày điểm danh!");
          return;
        } else {
          // setShowModal(true);
          // setCurrentInfo({ day, star });
          toast.error("Đã quá hạn điểm danh!");
        }
      }
    },
    [
      userCheckIn,
      isChecking,
      executeUpdateUser,
      executeCheckIn,
      userData,
      todaySpentTime,
    ],
  );
  const checkInArray = chunkArrayInGroups(getAllDaysOfMonth(), 7);

  const confirmPassCheckIn = async () => {
    if (currentInfo && userData) {
      const { star } = currentInfo || {};
      setShowModal(false);
      setIsChecking(true);
      const { id, userId, rankId, stars, branch } = userData;
      await executeUpdateUser({ id, rankId, stars: stars + star });
      await executeCheckIn({ userId, branch });
      setIsChecking(false);
      window.location.reload();
    }
  };

  const renderCheckIn = useCallback(() => {
    return (
      <>
        {checkInArray.map((days, index: number) => {
          return (
            <div className="grid grid-cols-7 gap-4 mb-4" key={index}>
              {days.map((day) => {
                const date = dayjs(day).format("ddd");
                if (!checkInData || !userCheckIn) {
                  return null;
                }

                let stars = 0;
                const currentDate = checkInData.find((x) => x.dayName === date);
                if (currentDate) {
                  stars = currentDate.stars;
                }

                const hasCheckIn = userCheckIn.find(
                  (x) =>
                    dayjs(x.createdAt).format("DD/MM/YYYY") ===
                    dayjs(day).format("DD/MM/YYYY"),
                );
                let bgColor = "bg-red-200";
                if (dayjs(day).isToday()) {
                  if (hasCheckIn) {
                    bgColor = "bg-green-200";
                  } else {
                    bgColor =
                      "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white";
                  }
                } else if (dayjs(day).isSameOrAfter(dayjs())) {
                  bgColor = "bg-white";
                }

                return (
                  <Card
                    onClick={() => handleDayClick(day, stars)}
                    key={day}
                    className={cn(
                      "shadow-lg rounded-lg p-4",
                      bgColor,
                      hasCheckIn ? "cursor-default" : "cursor-pointer",
                    )}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex justify-center items-center ">
                        <div className="mr-1">{stars?.toLocaleString()}</div>
                        <Image
                          src="/star.png"
                          width="22"
                          height="22"
                          alt="stars"
                        />
                      </div>
                      <div className="text-xs">
                        {dayjs(day).format("DD-MM-YYYY")}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          );
        })}
      </>
    );
  }, [checkInArray, checkInData, userCheckIn, handleDayClick]);

  if (isLoading) {
    return (
      <div className="w-full mx-auto p-4">
        {checkInArray.map((days, index: number) => {
          return (
            <div className="grid grid-cols-7 gap-4 mb-4" key={index}>
              {days.map((day) => {
                return (
                  <Card
                    key={day}
                    className="bg-white shadow-lg rounded-lg p-4 h-20 cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  </Card>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full mx-auto mt-6">
      <>
        {renderCheckIn()}
        <Dialog open={isShowModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Điểm danh quá hạn</DialogTitle>
              <DialogDescription>
                Bạn có muốn dùng 1 đá vô cực để điểm danh không ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="default"
                onClick={() => confirmPassCheckIn()}
              >
                Có
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Không
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    </div>
  );
};

export default CheckInCalendar;
