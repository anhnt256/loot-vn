"use client";

import { useEffect } from "react";
import { useUserInfo } from "@/hooks/use-user-info";
import { updateUserBalance } from "@/lib/utils";
import CheckInCard from "@/app/(dashboard)/dashboard/_component/CheckInCard/CheckInCard";
import CheckInCalendar from "./_component/CheckInCalendar/CheckInCalendar";

const Dashboard = () => {
  const { activeUser } = useUserInfo();

  useEffect(() => {
    if (activeUser) {
      (async () => {
        await updateUserBalance(activeUser);
      })();
    }
  }, [activeUser]);

  return (
    <div className="flex flex-col p-5 gap-4">
      <div className="shadow-lg rounded-lg w-full overflow-auto max-h-[89vh] relative">
        <div className="w-full bg-gray-900/95 rounded-xl p-6 border border-gray-800 shadow-lg">
          <div className="w-[26rem] mx-auto">
            <CheckInCard />
          </div>
          <div className="w-[1000px] mx-auto mt-4 flex justify-center">
            <p className="text-gray-400 text-sm">
              Hiện tại tính năng điểm danh không áp dụng khi sử dụng combo. Mong
              các bạn thông cảm!
            </p>
          </div>

          <CheckInCalendar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
