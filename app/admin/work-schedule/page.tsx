"use client";

import { useState, useEffect } from "react";
import { useBranch } from "@/components/providers/BranchProvider";

type ViewMode = "WEEK" | "MONTH" | "AGENDA";

export default function WorkSchedulePage() {
  const { branch } = useBranch();
  const [isClient, setIsClient] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("WEEK");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calendar IDs from environment variables
  const calendarIds = {
    GO_VAP: process.env.NEXT_PUBLIC_CALENDAR_GV || "",
    TAN_PHU: process.env.NEXT_PUBLIC_CALENDAR_TP || "",
  };

  const calendarId = calendarIds[branch as keyof typeof calendarIds];
  const branchName = branch === "GO_VAP" ? "Gò Vấp" : "Tân Phú";

  const getCalendarUrl = (mode: ViewMode) => {
    if (!calendarId) {
      return "";
    }

    const params = new URLSearchParams({
      src: calendarId,
      ctz: "Asia/Ho_Chi_Minh",
      showTitle: "0",
      showNav: "1",
      showDate: "1",
      showPrint: "0",
      showTabs: "1",
      showCalendars: "0",
      showTz: "0",
      mode: mode,
      height: "600",
      wkst: "2", // Week starts on Monday
      bgcolor: "#ffffff",
      hl: "vi", // Vietnamese language
    });
    return `https://calendar.google.com/calendar/embed?${params.toString()}`;
  };

  if (!isClient) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!calendarId) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">
            ⚠️ Chưa cấu hình Calendar
          </h2>
          <p className="text-red-700">
            Vui lòng cấu hình biến môi trường{" "}
            <code className="bg-red-100 px-2 py-1 rounded">
              NEXT_PUBLIC_CALENDAR_GV
            </code>{" "}
            và{" "}
            <code className="bg-red-100 px-2 py-1 rounded">
              NEXT_PUBLIC_CALENDAR_TP
            </code>{" "}
            trong file{" "}
            <code className="bg-red-100 px-2 py-1 rounded">.env.local</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-0">
      {/* Calendar iframe - full height with zoom */}
      <div className="flex-1 bg-white overflow-hidden">
        <iframe
          key={`${branch}-${viewMode}`}
          src={getCalendarUrl(viewMode)}
          style={{
            border: 0,
            transform: "scale(0.62)",
            transformOrigin: "top left",
            width: "161%",
            height: "161%",
          }}
          frameBorder="0"
          title={`Lịch làm việc ${branchName}`}
        />
      </div>
    </div>
  );
}
