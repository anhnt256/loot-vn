"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";
import { toast } from "sonner";
import { Modal } from "antd";

// Add custom styles
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.5); }
    50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.6); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
  
  .birthday-tier-card {
    transition: all 0.3s ease;
  }
  
  .birthday-tier-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
  
  .birthday-scroll {
    scroll-behavior: smooth;
  }
`;

interface BirthdayTier {
  id: number;
  tierName: string;
  discountPercent: number;
  milestoneAmount: number;
  additionalAmount: number;
  bonusAmount: number;
  totalAtTier: number;
  totalReceived: number;
  freeSpins: number;
  tkChinh: number;
  tkPhu: number;
  tongNhan: number;
  cumulativeBonusAmount: number; // Cộng dồn bonusAmount
  cumulativeFreeSpins: number; // Cộng dồn freeSpins
}

interface UserProgress {
  id: number;
  userId: number;
  tierId: number;
  branch: string;
  isClaimed: boolean;
  claimedAt: string | null;
  totalSpent: number;
  tierName: string;
  discountPercent: number;
  milestoneAmount: number;
  additionalAmount: number;
  bonusAmount: number;
  totalAtTier: number;
  totalReceived: number;
  freeSpins: number;
}

interface BirthdayHistoryItem {
  id: number;
  userId: number;
  tierId: number;
  tierName: string;
  bonusAmount: number;
  freeSpins: number;
  claimedAt: string;
}

export default function BirthdayPage() {
  const user: any = useLocalStorageValue("currentUser", null);
  const [tiers, setTiers] = useState<BirthdayTier[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<BirthdayHistoryItem[]>([]);

  useEffect(() => {
    if (user?.userId) {
      fetchBirthdayData();
    }
  }, [user?.userId]);

  const fetchBirthdayData = async () => {
    try {
      const response = await fetch(`/api/birthday/progress/${user?.userId}`);
      const data = await response.json();

      if (data.success) {
        setProgress(data.data.progress);
        setTotalSpent(data.data.totalSpent);
        setTiers(data.data.allTiers);
      }
    } catch (error) {
      console.error("Error fetching birthday data:", error);
      toast.error("Failed to load birthday data");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryData = async () => {
    try {
      const response = await fetch(`/api/birthday/history/${user?.userId}`);
      const data = await response.json();

      if (data.success) {
        setHistoryData(data.data);
      }
    } catch (error) {
      console.error("Error fetching history data:", error);
      toast.error("Failed to load history data");
    }
  };

  const handleClaimReward = async (tierId: number) => {
    try {
      const response = await fetch("/api/birthday/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.userId,
          tierId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Claimed ${data.data.bonusAmount.toLocaleString()} VNĐ bonus and ${data.data.freeSpins} free spins!`,
        );
        fetchBirthdayData(); // Refresh data
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast.error("Failed to claim reward");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTierStatus = (tier: BirthdayTier) => {
    const userProgress = progress.find((p) => p.tierId === tier.id);

    if (userProgress?.isClaimed) {
      return "claimed";
    }

    if (totalSpent >= tier.milestoneAmount) {
      return "available";
    }

    return "locked";
  };

  const getTierColor = (tier: BirthdayTier) => {
    const percent = tier.discountPercent;
    if (percent >= 600) return "from-red-500 to-pink-500";
    if (percent >= 500) return "from-orange-500 to-red-500";
    if (percent >= 450) return "from-yellow-500 to-orange-500";
    if (percent >= 350) return "from-green-500 to-yellow-500";
    if (percent >= 250) return "from-blue-500 to-green-500";
    if (percent >= 220) return "from-purple-500 to-blue-500";
    return "from-indigo-500 to-purple-500";
  };

  const BirthdayRules = () => (
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-lg rounded-lg max-h-[85vh] overflow-hidden">
      <h1 className="text-xl font-bold text-center mb-3 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        🎂 Thể Lệ Chương Trình Sinh Nhật GateWay 6 tuổi 🎂
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(85vh-80px)] overflow-y-auto">
        {/* Left column */}
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
            <h2 className="text-base font-semibold mb-2 text-purple-800">
              📋 Tổng Quan
            </h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                🔹 Chương trình sinh nhật đặc biệt dành cho thành viên GateWay
                với các mốc nạp tiền và phần thưởng hấp dẫn.
              </p>
              <p>
                🔹 Mỗi mốc chỉ có thể nhận thưởng{" "}
                <strong>1 lần duy nhất</strong>.
              </p>
              <p>
                🔹 Thưởng bao gồm <strong>tiền bonus</strong> và{" "}
                <strong>lượt quay miễn phí</strong>.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
            <h2 className="text-base font-semibold mb-2 text-yellow-800">
              ⚠️ Lưu Ý Quan Trọng
            </h2>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Chương trình áp dụng theo từng chi nhánh GateWay</li>
              <li>
                • Thưởng chỉ được sử dụng để đổi lấy giờ chơi hoặc sản phẩm tại
                trang Đổi thưởng
              </li>
              <li>• Không có giá trị quy đổi, mua bán bằng tiền mặt</li>
              <li>
                • GateWay có quyền thay đổi thể lệ mà không cần thông báo trước
              </li>
              <li>• Các tài khoản gian lận sẽ bị khóa vĩnh viễn</li>
              <li className="font-bold text-red-600">
                • Nếu xảy ra tranh chấp, quyết định của The GateWay là quyết định cuối cùng
              </li>
              <li className="font-bold text-red-600">
                • Người chơi khi tham gia sự kiện cần đọc kỹ và hoàn toàn đồng ý với các yêu cầu này trước khi tiến hành sử dụng
              </li>
            </ul>
          </div>

          <div className="text-center p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
            <p className="font-bold text-sm">
              🍀 The GateWay eSport Gaming - Đã chơi là phải vui 🍀
            </p>
          </div>
        </div>

        {/* Right column - Reward tiers table */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
          <h2 className="text-base font-semibold mb-3 text-green-800">
            🎁 Bảng Thưởng Chi Tiết
          </h2>
          <div className="overflow-x-auto max-h-[calc(85vh-200px)]">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-white/50 sticky top-0">
                <tr>
                  <th className="border border-gray-300 p-1 text-center">
                    Mốc nạp (VNĐ)
                  </th>
                  <th className="border border-gray-300 p-1 text-center">
                    % KM
                  </th>
                  <th className="border border-gray-300 p-1 text-center">
                    Thưởng tại mốc
                  </th>
                  <th className="border border-gray-300 p-1 text-center font-bold text-blue-700 bg-blue-50">
                    <div>Thưởng</div>
                    <div>(CỘNG DỒN)</div>
                  </th>
                  <th className="border border-gray-300 p-1 text-center font-bold text-purple-700 bg-purple-50">
                    <div>Lượt quay</div>
                    <div>(CỘNG DỒN)</div>
                  </th>
                  <th className="border border-gray-300 p-1 text-center font-bold text-green-700 bg-green-50">
                    <div>Tổng</div>
                    <div>(CỘNG DỒN)</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white/30">
                  <td className="border border-gray-300 p-1 text-center font-bold">
                    5.000
                  </td>
                  <td className="border border-gray-300 p-1 text-center bg-red-100 font-bold">
                    600%
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    10.000₫ + 2q
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-blue-600">
                    30.000₫
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-purple-600">2</td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-green-600">
                    35.000₫
                  </td>
                </tr>
                <tr className="bg-white/30">
                  <td className="border border-gray-300 p-1 text-center font-bold">
                    10.000
                  </td>
                  <td className="border border-gray-300 p-1 text-center bg-orange-100 font-bold">
                    500%
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    15.000₫ + 1q
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-blue-600">
                    55.000₫
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-purple-600">3</td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-green-600">
                    65.000₫
                  </td>
                </tr>
                <tr className="bg-white/30">
                  <td className="border border-gray-300 p-1 text-center font-bold">
                    20.000
                  </td>
                  <td className="border border-gray-300 p-1 text-center bg-yellow-100 font-bold">
                    450%
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    25.000₫ + 2q
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-blue-600">
                    100.000₫
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-purple-600">5</td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-green-600">
                    120.000₫
                  </td>
                </tr>
                <tr className="bg-white/30">
                  <td className="border border-gray-300 p-1 text-center font-bold">
                    50.000
                  </td>
                  <td className="border border-gray-300 p-1 text-center bg-green-100 font-bold">
                    350%
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    65.000₫ + 4q
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-blue-600">
                    205.000₫
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-purple-600">9</td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-green-600">
                    255.000₫
                  </td>
                </tr>
                <tr className="bg-white/30">
                  <td className="border border-gray-300 p-1 text-center font-bold">
                    100.000
                  </td>
                  <td className="border border-gray-300 p-1 text-center bg-blue-100 font-bold">
                    250%
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    75.000₫ + 5q
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-blue-600">
                    330.000₫
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-purple-600">14</td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-green-600">
                    430.000₫
                  </td>
                </tr>
                <tr className="bg-white/30">
                  <td className="border border-gray-300 p-1 text-center font-bold">
                    200.000
                  </td>
                  <td className="border border-gray-300 p-1 text-center bg-purple-100 font-bold">
                    220%
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    140.000₫ + 8q
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-blue-600">
                    550.000₫
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-purple-600">22</td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-green-600">
                    750.000₫
                  </td>
                </tr>
                <tr className="bg-white/30">
                  <td className="border border-gray-300 p-1 text-center font-bold">
                    500.000
                  </td>
                  <td className="border border-gray-300 p-1 text-center bg-indigo-100 font-bold">
                    150%
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    380.000₫ + 7q
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-blue-600">
                    730.000₫
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-purple-600">29</td>
                  <td className="border border-gray-300 p-1 text-center font-bold text-green-600">
                    1.500.000₫
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const BirthdayHistory = () => (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-lg rounded-lg max-h-[85vh] overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          📋 Lịch Sử Nhận Thưởng Sinh Nhật
        </h1>
      </div>

      {historyData.length > 0 ? (
        <div className="space-y-3 max-h-[calc(85vh-120px)] overflow-y-auto">
          {historyData.map((item, index) => (
            <div
              key={item.id}
              className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600">
                    Nhận ngày:{" "}
                    {new Date(item.claimedAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 text-sm">
                    +{formatCurrency(item.bonusAmount)} VNĐ
                  </p>
                  <p className="text-xs text-blue-600">
                    +{item.freeSpins} lượt quay
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🎁</div>
          <p className="text-gray-500 text-base">Chưa có lịch sử nhận thưởng</p>
          <p className="text-gray-400 text-sm">
            Hãy nạp tiền để nhận thưởng sinh nhật!
          </p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 relative">
        <div className="container mx-auto p-3 relative z-10 pb-16">
          {/* Header skeleton */}
          <div className="text-center mb-4">
            <div className="h-8 bg-white/20 rounded w-2/3 mb-2 mx-auto animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded w-1/2 mb-4 mx-auto animate-pulse"></div>
            
            {/* Action buttons skeleton */}
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-white/20 rounded-full w-20 animate-pulse"></div>
              ))}
            </div>

            {/* Progress summary skeleton */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4 border border-white/20 max-w-xl mx-auto">
              <div className="grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-3 bg-white/20 rounded w-16 mb-1 mx-auto animate-pulse"></div>
                    <div className="h-6 bg-white/30 rounded w-20 mx-auto animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Birthday tiers skeleton */}
          <div className="space-y-3">
            {/* Top row - 4 smaller cards skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border-2 border-gray-400/50 min-h-[280px] animate-pulse">
                  {/* Tier header skeleton */}
                  <div className="text-center mb-2">
                    <div className="h-5 bg-white/20 rounded-full w-20 mx-auto mb-1"></div>
                  </div>

                  {/* Nạp - Nhận section skeleton */}
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    <div className="h-9 bg-red-600/30 rounded border border-red-500/50"></div>
                    <div className="h-9 bg-green-500/70 rounded border border-green-400"></div>
                  </div>

                  {/* TK chính - TK phụ - Lượt quay skeleton */}
                  <div className="grid grid-cols-3 gap-1 mb-2">
                    <div className="h-9 bg-blue-600/30 rounded border border-blue-500/50"></div>
                    <div className="h-9 bg-indigo-600/30 rounded border border-indigo-500/50"></div>
                    <div className="h-9 bg-amber-600/30 rounded border border-amber-500/50"></div>
                  </div>

                  {/* Progress indicator skeleton */}
                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <div className="h-3 bg-white/20 rounded w-12"></div>
                      <div className="h-3 bg-white/20 rounded w-8"></div>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div className="h-1.5 bg-white/40 rounded-full w-1/3"></div>
                    </div>
                  </div>

                  {/* Action button skeleton */}
                  <div className="h-11 bg-white/20 rounded"></div>
                </div>
              ))}
            </div>

            {/* Bottom row - 3 larger cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border-2 border-gray-400/50 min-h-[320px] animate-pulse">
                  {/* Tier header skeleton */}
                  <div className="text-center mb-3">
                    <div className="h-6 bg-white/20 rounded-full w-24 mx-auto mb-2"></div>
                  </div>

                  {/* Nạp - Nhận section skeleton */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="h-12 bg-red-600/30 rounded border border-red-500/50"></div>
                    <div className="h-12 bg-green-500/70 rounded border border-green-400"></div>
                  </div>

                  {/* TK chính - TK phụ - Lượt quay skeleton */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="h-11 bg-blue-600/30 rounded border border-blue-500/50"></div>
                    <div className="h-11 bg-indigo-600/30 rounded border border-indigo-500/50"></div>
                    <div className="h-11 bg-amber-600/30 rounded border border-amber-500/50"></div>
                  </div>

                  {/* Progress indicator skeleton */}
                  <div className="mb-3">
                    <div className="flex justify-between mb-2">
                      <div className="h-3 bg-white/20 rounded w-12"></div>
                      <div className="h-3 bg-white/20 rounded w-8"></div>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="h-2 bg-white/40 rounded-full w-1/2"></div>
                    </div>
                  </div>

                  {/* Action button skeleton */}
                  <div className="h-16 bg-white/20 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note skeleton */}
          <div className="text-center mt-4 pb-4">
            <div className="h-3 bg-white/10 rounded w-64 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 relative birthday-scroll">
      {/* Custom styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-bounce animate-float"></div>
        <div className="absolute top-20 left-10 w-16 h-16 bg-red-400 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-12 h-12 bg-blue-400 rounded-full opacity-20 animate-bounce animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute bottom-10 left-20 w-14 h-14 bg-green-400 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute top-1/2 left-1/4 w-8 h-8 bg-pink-400 rounded-full opacity-30 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-10 h-10 bg-purple-400 rounded-full opacity-25 animate-float"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="container mx-auto p-3 relative z-10 pb-16">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
            🎂 Sinh Nhật GateWay 6 tuổi 🎂
          </h1>

          <p className="text-center text-white/80 text-xs mb-4">
            📅 Thời gian diễn ra: 24/07/2025 - 31/07/2025
          </p>

          {/* Action buttons */}
          <div className="flex justify-center gap-2 mb-4">
            <Button
              onClick={() => setRulesModalOpen(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-3 py-1.5 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 text-xs"
            >
              📋 Thể Lệ
            </Button>
            <Button
              onClick={() => {
                fetchHistoryData();
                setHistoryModalOpen(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-3 py-1.5 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 text-xs"
            >
              📊 Lịch Sử Quà
            </Button>
            <Button
              onClick={() => {
                setLoading(true);
                fetchBirthdayData();
              }}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold px-3 py-1.5 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 text-xs"
            >
              🔄 Cập nhật
            </Button>
          </div>

          {/* Progress summary */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4 border border-white/20 max-w-xl mx-auto">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-white/70 text-xs mb-1">Tổng tiền đã nạp</p>
                <p className="text-lg font-bold text-green-400">
                  {formatCurrency(totalSpent)} VNĐ
                </p>
              </div>
              <div className="text-center">
                <p className="text-white/70 text-xs mb-1">Mốc đã đạt</p>
                <p className="text-lg font-bold text-blue-400">
                  {tiers.filter((t) => totalSpent >= t.milestoneAmount).length}{" "}
                  / {tiers.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-white/70 text-xs mb-1">Mốc đã nhận</p>
                <p className="text-lg font-bold text-purple-400">
                  {progress.filter((p) => p.isClaimed).length} / {tiers.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Birthday tiers grid */}
        <div className="space-y-3">
          {/* Top row - 4 smaller cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {tiers.slice(0, 4).map((tier) => {
              const status = getTierStatus(tier);
              const progressPercent = Math.min(
                (totalSpent / tier.milestoneAmount) * 100,
                100,
              );

              return (
                <div key={tier.id} className="relative group">
                  <div
                    className={`relative bg-white/10 backdrop-blur-sm rounded-lg p-2 border-2 birthday-tier-card h-full ${
                      status === "claimed"
                        ? "border-green-400 bg-green-500/20 animate-glow"
                        : status === "available"
                          ? "border-yellow-400 bg-yellow-500/20 animate-pulse"
                          : "border-gray-400/50 hover:border-gray-300"
                    }`}
                  >
                    {/* Tier header */}
                    <div className="text-center mb-2">
                      <div
                        className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-bold mb-1 bg-gradient-to-r ${getTierColor(tier)} text-white shadow-lg`}
                      >
                        Bonus {tier.discountPercent}%
                      </div>
                    </div>

                    {/* Nạp - Nhận section */}
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      <div className="flex flex-col items-center justify-center p-1 bg-red-600/30 rounded border border-red-500/50 min-h-[35px]">
                        <p className="text-red-100 text-xs font-semibold">
                          Nạp
                        </p>
                        <p className="text-red-50 text-xs font-bold">
                          {formatCurrency(tier.milestoneAmount)}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-1 bg-green-500/70 rounded border border-green-400 min-h-[35px]">
                        <p className="text-green-100 text-xs font-semibold">
                          Nhận*
                        </p>
                        <p className="text-white text-xs font-bold">
                          {formatCurrency(tier.tongNhan)}
                        </p>
                      </div>
                    </div>

                    {/* TK chính - TK phụ - Lượt quay */}
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      <div className="flex flex-col items-center justify-center p-1 bg-blue-600/30 rounded border border-blue-500/50 min-h-[35px]">
                        <p className="text-blue-100 text-xs font-semibold">
                          TK chính
                        </p>
                        <p className="text-blue-50 text-xs font-bold">
                          {formatCurrency(tier.tkChinh)}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-1 bg-indigo-600/30 rounded border border-indigo-500/50 min-h-[35px]">
                        <p className="text-indigo-100 text-xs font-semibold">
                          TK phụ
                        </p>
                        <p className="text-indigo-50 text-xs font-bold">
                          {formatCurrency(
                            tier.cumulativeBonusAmount || tier.bonusAmount,
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-1 bg-amber-600/30 rounded border border-amber-500/50 min-h-[35px]">
                        <p className="text-amber-100 text-xs font-semibold">
                          Lượt quay
                        </p>
                        <p className="text-amber-50 text-xs font-bold">
                          +{tier.cumulativeFreeSpins || tier.freeSpins}
                        </p>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-white/80 mb-1">
                        <span>Tiến độ</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            status === "claimed"
                              ? "bg-green-400"
                              : status === "available"
                                ? "bg-yellow-400"
                                : "bg-gradient-to-r from-purple-400 to-pink-400"
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action button */}
                    {status === "available" && (
                      <Button
                        onClick={() => handleClaimReward(tier.id)}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-1.5 rounded shadow-lg transform hover:scale-105 transition-all duration-200 text-xs flex items-center justify-center min-h-[45px]"
                      >
                        Claim
                      </Button>
                    )}

                    {status === "claimed" && (
                      <div className="text-center p-1 bg-green-500/20 rounded border border-green-400 min-h-[45px] flex items-center justify-center">
                        <p className="text-green-400 font-bold text-xs">
                          ✅ Đã nhận
                        </p>
                      </div>
                    )}

                    {status === "locked" && (
                      <div className="text-center p-1 bg-gray-500/20 rounded border border-gray-400 min-h-[45px] flex flex-col items-center justify-center">
                        <p className="text-gray-400 font-medium text-xs">
                          🔒 Chưa đủ
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Cần thêm{" "}
                          {formatCurrency(tier.milestoneAmount - totalSpent)}{" "}
                          VNĐ
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom row - 3 larger cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tiers.slice(4, 7).map((tier) => {
              const status = getTierStatus(tier);
              const progressPercent = Math.min(
                (totalSpent / tier.milestoneAmount) * 100,
                100,
              );

              return (
                <div key={tier.id} className="relative group">
                  <div
                    className={`relative bg-white/10 backdrop-blur-sm rounded-lg p-3 border-2 birthday-tier-card h-full ${
                      status === "claimed"
                        ? "border-green-400 bg-green-500/20 animate-glow"
                        : status === "available"
                          ? "border-yellow-400 bg-yellow-500/20 animate-pulse"
                          : "border-gray-400/50 hover:border-gray-300"
                    }`}
                  >
                    {/* Tier header */}
                    <div className="text-center mb-3">
                      <div
                        className={`inline-block px-2 py-1 rounded-full text-sm font-bold mb-2 bg-gradient-to-r ${getTierColor(tier)} text-white shadow-lg`}
                      >
                        Bonus {tier.discountPercent}%
                      </div>
                    </div>

                    {/* Nạp - Nhận section */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex flex-col items-center justify-center p-2 bg-red-600/30 rounded border border-red-500/50 min-h-[50px]">
                        <p className="text-red-100 text-xs font-semibold">
                          Nạp
                        </p>
                        <p className="text-red-50 text-sm font-bold">
                          {formatCurrency(tier.milestoneAmount)}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 bg-green-500/70 rounded border border-green-400 min-h-[50px]">
                        <p className="text-green-100 text-xs font-semibold">
                          Nhận*
                        </p>
                        <p className="text-white text-sm font-bold">
                          {formatCurrency(tier.tongNhan)}
                        </p>
                      </div>
                    </div>

                    {/* TK chính - TK phụ - Lượt quay */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="flex flex-col items-center justify-center p-1 bg-blue-600/30 rounded border border-blue-500/50 min-h-[45px]">
                        <p className="text-blue-100 text-xs font-semibold">
                          TK chính
                        </p>
                        <p className="text-blue-50 text-xs font-bold">
                          {formatCurrency(tier.tkChinh)}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-1 bg-indigo-600/30 rounded border border-indigo-500/50 min-h-[45px]">
                        <p className="text-indigo-100 text-xs font-semibold">
                          TK phụ
                        </p>
                        <p className="text-indigo-50 text-xs font-bold">
                          {formatCurrency(
                            tier.cumulativeBonusAmount || tier.bonusAmount,
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-1 bg-amber-600/30 rounded border border-amber-500/50 min-h-[45px]">
                        <p className="text-amber-100 text-xs font-semibold">
                          Lượt quay
                        </p>
                        <p className="text-amber-50 text-xs font-bold">
                          +{tier.cumulativeFreeSpins || tier.freeSpins}
                        </p>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-white/80 mb-2">
                        <span>Tiến độ</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            status === "claimed"
                              ? "bg-green-400"
                              : status === "available"
                                ? "bg-yellow-400"
                                : "bg-gradient-to-r from-purple-400 to-pink-400"
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action button */}
                    {status === "available" && (
                      <Button
                        onClick={() => handleClaimReward(tier.id)}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-2 rounded shadow-lg transform hover:scale-105 transition-all duration-200 text-sm flex items-center justify-center min-h-[60px]"
                      >
                        Claim
                      </Button>
                    )}

                    {status === "claimed" && (
                      <div className="text-center p-2 bg-green-500/20 rounded border border-green-400 min-h-[60px] flex items-center justify-center">
                        <p className="text-green-400 font-bold text-sm">
                          ✅ Đã nhận thưởng
                        </p>
                      </div>
                    )}

                    {status === "locked" && (
                      <div className="text-center p-2 bg-gray-500/20 rounded border border-gray-400 min-h-[60px] flex flex-col items-center justify-center">
                        <p className="text-gray-400 font-medium text-sm">
                          🔒 Chưa đủ điều kiện
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Cần thêm{" "}
                          {formatCurrency(tier.milestoneAmount - totalSpent)}{" "}
                          VNĐ
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center mt-4 pb-4">
          <p className="text-white/60 text-xs">
            * Số tiền &quot;Nhận&quot; là số tiền cộng dồn từ các mốc trước đó
          </p>
        </div>
      </div>

      {/* Modals */}
      <Modal
        title=""
        open={rulesModalOpen}
        onCancel={() => setRulesModalOpen(false)}
        footer={null}
        width={1200}
        centered
        style={{ maxHeight: "90vh" }}
      >
        <BirthdayRules />
      </Modal>

      <Modal
        title=""
        open={historyModalOpen}
        onCancel={() => setHistoryModalOpen(false)}
        footer={null}
        width={800}
        centered
        style={{ maxHeight: "90vh" }}
      >
        <BirthdayHistory />
      </Modal>
    </div>
  );
}
