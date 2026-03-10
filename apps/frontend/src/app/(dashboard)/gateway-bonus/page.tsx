"use client";

import { useState, useEffect } from "react";

import { toast } from "sonner";
import Image from "next/image";
import { dayjs } from "@gateway-workspace/shared/utils";
import { CURRENT_USER } from "@gateway-workspace/shared/utils";

interface GatewayBonusStatus {
  available: boolean;
  reason?: string;
  message: string;
  deadline?: string;
  accountDeadline?: string;
}

export default function GatewayBonusPage() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [status, setStatus] = useState<GatewayBonusStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  // Fetch trạng thái Gateway Bonus
  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      if (!currentUserId) throw new Error("Missing userId");
      const response = await fetch(
        `/api/gateway-bonus?userId=${currentUserId}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch status");
      }
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error fetching status:", error);
      toast.error("Không thể tải thông tin Gateway Bonus");
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userDataString = localStorage.getItem(CURRENT_USER);
      if (userDataString) {
        try {
          const parsedUserData = JSON.parse(userDataString);
          setCurrentUserId(parsedUserData.userId || parsedUserData.id);
          setUserData(parsedUserData);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  // Claim Gateway Bonus
  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      if (!currentUserId) throw new Error("Missing userId");
      const response = await fetch("/api/gateway-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Claim failed");
      }
      toast.success(data.message || "Nhận Gateway Bonus thành công!");
      fetchStatus();
    } catch (error) {
      console.error("Error claiming bonus:", error);
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchStatus();
    }
  }, [currentUserId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Không thể tải thông tin
          </h2>
          <button
            onClick={fetchStatus}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Image
                src="/star.png"
                width={80}
                height={80}
                alt="Gateway Bonus"
                className="animate-pulse"
              />
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                3
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Gateway Bonus</h1>
          <p className="text-xl text-blue-200 mb-2">
            Nhận 3 lượt quay miễn phí ngay hôm nay!
          </p>
          <p className="text-sm text-gray-300 mb-2">
            Chỉ áp dụng cho tài khoản tạo trước ngày 05/07/2025
          </p>
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-300 text-sm font-semibold">
              ⚠️ HẠN CUỐI: 15/07/2025 - Không claim sẽ mất phần thưởng vĩnh
              viễn!
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Status */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="mr-3">📊</span>
              Trạng thái
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Tài khoản:</span>
                <span className="text-white font-semibold">
                  {userData?.userName || `ID: ${currentUserId}`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Lượt quay hiện tại:</span>
                <span className="text-white font-semibold flex items-center">
                  {userData?.magicStone || 0}
                  <Image
                    src="/star.png"
                    width={20}
                    height={20}
                    alt="stars"
                    className="ml-1"
                  />
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Ngày tạo tài khoản:</span>
                <span className="text-white font-semibold">
                  {userData?.createdAt
                    ? dayjs(userData.createdAt).format("DD/MM/YYYY")
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Hạn nhận:</span>
                <span className="text-red-400 font-semibold">
                  {status.deadline
                    ? dayjs(status.deadline).format("DD/MM/YYYY")
                    : "15/07/2025"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Action */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="mr-3">🎁</span>
              Nhận thưởng
            </h2>

            {status.available ? (
              <div className="text-center">
                <div className="mb-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-green-300 text-lg font-semibold mb-4">
                    Bạn đủ điều kiện nhận Gateway Bonus!
                  </p>
                  <p className="text-gray-300 text-sm mb-3">
                    Nhận ngay 3 lượt quay miễn phí
                  </p>
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-yellow-300 text-sm font-semibold">
                      ⏰ Chỉ còn{" "}
                      {status.deadline
                        ? dayjs(status.deadline).diff(dayjs(), "day")
                        : 0}{" "}
                      ngày để nhận thưởng!
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isClaiming ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    "Nhận ngay 3 lượt quay"
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <div className="text-6xl mb-4">❌</div>
                  <p className="text-red-300 text-lg font-semibold mb-4">
                    {status.message}
                  </p>
                </div>

                {status.reason === "expired" && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-200 text-sm">
                      Chương trình đã kết thúc vào ngày{" "}
                      {status.deadline
                        ? dayjs(status.deadline).format("DD/MM/YYYY")
                        : "15/07/2025"}
                    </p>
                  </div>
                )}

                {status.reason === "new_account" && (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-200 text-sm">
                      Chỉ áp dụng cho tài khoản tạo trước ngày{" "}
                      {status.accountDeadline
                        ? dayjs(status.accountDeadline).format("DD/MM/YYYY")
                        : "05/07/2025"}
                    </p>
                  </div>
                )}

                {status.reason === "already_claimed" && (
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-200 text-sm">
                      Bạn đã nhận Gateway Bonus rồi. Hãy sử dụng 3 lượt quay
                      miễn phí trong trò chơi!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-3">ℹ️</span>
            Thông tin chương trình
          </h3>

          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="text-blue-300 font-semibold mb-2">
                Điều kiện tham gia:
              </h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Tài khoản được tạo trước ngày 05/07/2025</li>
                <li>• Chưa từng nhận Gateway Bonus</li>
                <li>• Chương trình kéo dài đến hết ngày 15/07/2025</li>
              </ul>
            </div>

            <div>
              <h4 className="text-green-300 font-semibold mb-2">
                Phần thưởng:
              </h4>
              <ul className="text-gray-300 space-y-1">
                <li>• 3 lượt quay miễn phí</li>
                <li>• Có thể sử dụng ngay trong trò chơi</li>
                <li>• Không giới hạn thời gian sử dụng</li>
              </ul>
            </div>
          </div>

          {/* Warning Section */}
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <h4 className="text-red-300 font-semibold mb-2 flex items-center">
              <span className="mr-2">⚠️</span>
              Lưu ý quan trọng
            </h4>
            <ul className="text-red-200 text-sm space-y-1">
              <li>
                • Chương trình Gateway Bonus sẽ kết thúc vào ngày{" "}
                <strong>15/07/2025</strong>
              </li>
              <li>
                • Sau ngày này, tính năng sẽ bị ẩn và không thể nhận thưởng
              </li>
              <li>• Mỗi tài khoản chỉ được nhận 1 lần duy nhất</li>
              <li>• Phần thưởng không thể chuyển nhượng hoặc hoàn trả</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
