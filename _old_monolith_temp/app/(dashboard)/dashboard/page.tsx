"use client";

import CheckInCard from "@/app/(dashboard)/dashboard/_component/CheckInCard/CheckInCard";
import CheckInCalendar from "./_component/CheckInCalendar/CheckInCalendar";

const Dashboard = () => {
  return (
    <div className="flex flex-col p-3 gap-2 h-screen">
      <div className="flex-1 bg-gray-900/95 rounded-xl p-4 border border-gray-800 shadow-lg overflow-hidden">
        <div className="h-full flex flex-col">
          {/* CheckIn Card Section */}
          <div className="flex-shrink-0 mb-3">
            <div className="w-[24rem] mx-auto">
              <CheckInCard />
            </div>
          </div>

          {/* Info Text */}
          <div className="flex-shrink-0 mb-3">
            <p className="text-gray-400 text-xs text-center">
              Hiện tại tính năng điểm danh không áp dụng khi sử dụng combo. Mong
              các bạn thông cảm!
            </p>
          </div>

          {/* Calendar Section */}
          <div className="flex-1 min-h-0">
            <CheckInCalendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
