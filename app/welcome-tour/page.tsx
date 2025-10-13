"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WelcomeTour from "@/components/WelcomeTour";
import { CURRENT_USER } from "@/constants/token.constant";
import dayjs from "@/lib/dayjs";

export default function WelcomeTourPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const userDataString = localStorage.getItem(CURRENT_USER);
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUserInfo(userData);

        // Chỉ cho phép user mới hoặc user cũ quay trở lại (≥30 ngày) access welcome tour
        const isNewUser = userData.isNewUser === true;
        const isReturnedUser = userData.isReturnedUser === true;

        if (isNewUser || isReturnedUser) {
          setIsAuthorized(true);
        } else {
          // User thường xuyên không được access welcome tour, redirect về dashboard
          console.log(
            "User is not authorized for welcome tour, redirecting to dashboard...",
          );
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/dashboard");
      }
    } else {
      // Không có user data, redirect về login
      router.push("/");
    }
  }, [router]);

  const handleComplete = () => {
    router.push("/dashboard");
  };

  // Tính số ngày từ lần đăng nhập cuối
  const daysSinceLastLogin = userInfo?.lastLoginDate
    ? dayjs().diff(dayjs(userInfo.lastLoginDate), "day")
    : undefined;

  // Chỉ render WelcomeTour nếu user được authorized
  if (!isAuthorized || !userInfo) {
    return null; // Hoặc có thể show loading spinner
  }

  return (
    <WelcomeTour
      isOpen={true}
      onComplete={handleComplete}
      userName={userInfo?.userName}
      isNewUser={userInfo?.isNewUser}
      isReturnedUser={userInfo?.isReturnedUser}
      daysSinceLastLogin={daysSinceLastLogin}
    />
  );
}
