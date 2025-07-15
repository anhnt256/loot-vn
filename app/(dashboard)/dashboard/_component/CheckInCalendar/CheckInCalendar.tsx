// Calendar.tsx
import React, { useCallback, useEffect, useState } from "react";
import { CheckInDay } from "@/type/checkin";
import dayjs from "@/lib/dayjs";
import isEmpty from "lodash/isEmpty";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { UserStarHistory } from "@/prisma/generated/prisma-client";
import { CURRENT_USER } from "@/constants/token.constant";

const CheckInCalendar = () => {
  const [days, setDays] = useState<CheckInDay[]>([]);
  const [totalRewards, setTotalReward] = useState<number>(0);
  const [userCheckIn, setUserCheckIn] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [branch, setBranch] = useState<string | null>(null);

  const createDaysOfMonth = useCallback((): CheckInDay[] => {
    const year = dayjs().year();
    const month = dayjs().month() + 1;
    const daysInMonth = dayjs(new Date(year, month, 0)).date();
    const daysList: CheckInDay[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = dayjs(new Date(year, month - 1, day)).format("YYYY-MM-DD");

      const currentResult = userCheckIn?.filter((item: UserStarHistory) => {
        return dayjs(item.createdAt).utc().format("YYYY-MM-DD") === date;
      });

      if (isEmpty(currentResult)) {
        const isExpire = dayjs(date).isBefore(dayjs());
        const isToday = dayjs(date).isSame(dayjs(), "day");

        const currentDate: CheckInDay = {
          date: dayjs(date).date().toString(),
          rewards: 0,
          status: isToday
            ? "available"
            : isExpire
              ? "expired"
              : ("coming" as const),
        };
        daysList.push(currentDate);
      } else {
        const totalDayRewards = currentResult?.reduce((acc, item) => {
          return acc + (item.newStars - item.oldStars);
        }, 0);
        const currentDate: CheckInDay = {
          date: dayjs(date).date().toString(),
          rewards: totalDayRewards,
          status: "checked",
        };
        daysList.push(currentDate);
      }
    }

    return daysList;
  }, [userCheckIn]);

  // Load user data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem(CURRENT_USER);
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          setCurrentUserId(parsedUserData.userId || parsedUserData.id);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }

      // Get branch from localStorage or default
      const branchData = localStorage.getItem("branch") || "GO_VAP";
      setBranch(branchData);
    }
  }, []);

  // Fetch user check-in data
  useEffect(() => {
    if (!currentUserId || !branch) return;

    const fetchUserCheckIn = async () => {
      try {
        const response = await fetch(`/api/check-in-result/${currentUserId}`);
        if (response.ok) {
          const data = await response.json();
          setUserCheckIn(data || []);
        }
      } catch (error) {
        console.error("Error fetching user check-in data:", error);
        setUserCheckIn([]);
      }
    };

    fetchUserCheckIn();
  }, [currentUserId, branch]);

  useEffect(() => {
    if (userCheckIn && userCheckIn.length > 0) {
      setDays(createDaysOfMonth());
      setTotalReward(
        userCheckIn.reduce(
          (acc, item) => acc + (item.newStars - item.oldStars),
          0,
        ),
      );
    } else {
      setDays(createDaysOfMonth());
    }
  }, [createDaysOfMonth, userCheckIn]);

  if (!days?.length) {
    return (
      <div className="w-full mx-auto p-2">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {[...Array(14)].map((_, index) => (
            <Card
              key={`skeleton-${index}`}
              className="bg-moccasin shadow-lg rounded-lg p-2 h-16"
            >
              <div className="flex flex-col items-center justify-center">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with total rewards */}
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <h2 className="text-gray-400 text-base font-medium">{`Lịch điểm danh tháng ${
          new Date().getMonth() + 1
        }`}</h2>
        <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-lg">
          <span className="text-gray-400 text-sm">Tổng nhận:</span>
          <div className="flex items-center">
            <span className="text-yellow-500 font-bold flex items-center gap-1 text-base">
              {totalRewards?.toLocaleString()}
              <Image src="/star.png" width="18" height="18" alt="stars" />
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 flex-1 min-h-0">
        {days.map((day) => (
          <div
            key={day.date}
            className={`
              relative p-2 rounded-lg text-center flex flex-col justify-center
              ${
                day.status === "expired"
                  ? "bg-light-pink"
                  : day.status === "checked"
                    ? "bg-pale-green"
                    : day.status === "coming"
                      ? "bg-moccasin"
                      : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              }
              transition-all duration-200
            `}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium text-dark-gray">
                {day.date.split("-")[0]}
              </span>
              <div className="flex items-center">
                <span className="text-black font-bold flex items-center gap-1 text-sm">
                  {day.rewards?.toLocaleString()}
                  <Image src="/star.png" width="14" height="14" alt="stars" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-end items-center gap-3 mt-3 text-sm flex-shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-light-pink"></div>
          <span className="text-white">Đã quá hạn</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-pale-green"></div>
          <span className="text-white">Đã điểm danh</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <span className="text-white">Có thể điểm danh</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-moccasin"></div>
          <span className="text-white">Sắp mở</span>
        </div>
      </div>
    </div>
  );
};

export default CheckInCalendar;
