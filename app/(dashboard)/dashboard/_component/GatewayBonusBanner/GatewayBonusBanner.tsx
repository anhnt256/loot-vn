"use client";

import { useState, useEffect } from "react";
import { useUserInfo } from "@/hooks/use-user-info";
import Link from "next/link";
import dayjs from "@/lib/dayjs";

interface GatewayBonusStatus {
  available: boolean;
  reason?: string;
  message: string;
  deadline?: string;
}

export function GatewayBonusBanner() {
  const { currentUserId } = useUserInfo();
  const [status, setStatus] = useState<GatewayBonusStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Fetch trạng thái Gateway Bonus
  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      if (!currentUserId) return;
      const response = await fetch(`/api/gateway-bonus?userId=${currentUserId}`);
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          setIsVisible(false);
          return;
        }
        throw new Error(data.message || "Failed to fetch status");
      }
      setStatus(data);
    } catch (error) {
      setIsVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchStatus();
    }
  }, [currentUserId]);

  useEffect(() => {
    const claimDeadline = process.env.NEXT_PUBLIC_GATEWAY_BONUS_DEADLINE || "2025-07-15";
    const now = dayjs();
    const deadline = dayjs(claimDeadline);
    if (now.isAfter(deadline)) {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible || isLoading) {
    return null;
  }
  if (!status || !status.available) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 mb-6 shadow-lg border-2 border-yellow-400">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🎁</div>
          <div>
            <h3 className="text-white font-bold text-lg">
              Gateway Bonus - Nhận 3 lượt quay miễn phí!
            </h3>
            <p className="text-blue-100 text-sm mb-1">
              Chỉ áp dụng cho tài khoản tạo trước ngày 05/07/2025
            </p>
            <p className="text-yellow-300 text-sm font-semibold">
              ⚠️ HẠN CUỐI: {status.deadline ? dayjs(status.deadline).format("DD/MM/YYYY") : "15/07/2025"} - Không claim sẽ mất phần thưởng!
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/gateway-bonus"
            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Nhận ngay
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
} 