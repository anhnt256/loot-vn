"use client";

import { useEffect } from "react";
import CheckInCalendar from "./_component/CheckInCalendar/CheckInCalendar";
import { useUserInfo } from "@/hooks/use-user-info";
import { updateUserBalance } from "@/lib/utils";

const Dashboard = () => {
  const { userName } = useUserInfo();

  useEffect(() => {
    if (userName) {
      (async () => {
        await updateUserBalance(userName);
      })();
    }
  }, [userName]);

  return (
    <div className="flex flex-col p-5 gap-4">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-2">
            <div>Điểm danh nhận quà</div>
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex mr-4">
              <div className="w-4 h-4 bg-red-200 mr-2" />
              <div className="text-xs">Đã quá hạn</div>
            </div>
            <div className="flex mr-4">
              <div className="w-4 h-4 bg-green-200 mr-2" />
              <div className="text-xs">Đã điểm danh</div>
            </div>
            <div className="flex mr-4">
              <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mr-2" />
              <div className="text-xs">Có thể điểm danh</div>
            </div>
            <div className="flex">
              <div className="w-4 h-4 bg-white mr-2 border" />
              <div className="text-xs">Sắp mở</div>
            </div>
          </div>
        </div>

        <div id="calendar" className="overflow-y-auto">
          <CheckInCalendar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
