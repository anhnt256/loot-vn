"use client";

import React, { useRef, useEffect } from "react";
import { clearUserData } from "@/lib/utils";

// Hook auto logout sau 5 phút không hoạt động
function useAutoLogout(onLogout: () => void, timeout = 1 * 60 * 1000) {
  const timer = useRef<NodeJS.Timeout>();
  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(onLogout, timeout);
    };
    const events = ["mousemove", "keydown", "click", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [onLogout, timeout]);
}

export function AutoLogoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Tích hợp auto logout cho toàn app
  useAutoLogout(
    () => {
      // Xóa thông tin user khỏi localStorage
      clearUserData();

      if (typeof window !== "undefined" && window.electron) {
        // @ts-ignore
        window.electron.send("close-app");
      }
    },
    60 * 60 * 1000, // 1 hour
  );

  return <>{children}</>;
}
