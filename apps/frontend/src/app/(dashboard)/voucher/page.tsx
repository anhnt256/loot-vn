"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@gateway-workspace/shared/ui";
import { Badge } from "@gateway-workspace/shared/ui";
import { Button } from "@gateway-workspace/shared/ui";
import { Copy, Gift, Clock, CheckCircle, XCircle, Star } from "lucide-react";
import { toast } from "sonner";

interface PromotionCode {
  id: number;
  name: string;
  code: string;
  value: number;
  branch: string;
  isUsed: boolean;
  status: string | null; // INITIAL, APPROVE, REJECT, hoặc null (chưa redeem)
  eventId: string;
  rewardType: string;
  rewardValue: number;
  expirationDate: string;
  createdAt: string;
  updatedAt: string;
}

type TabType = "unused" | "used";

export default function VoucherPage() {
  const [promotionCodes, setPromotionCodes] = useState<PromotionCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("unused");

  useEffect(() => {
    fetchPromotionCodes();
  }, []);

  const fetchPromotionCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/promotion-codes", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch promotion codes");
      }

      const data = await response.json();
      console.log("🎫 Fetched promotion codes:", data.promotionCodes);
      console.log("🎫 Total codes:", data.promotionCodes?.length || 0);
      setPromotionCodes(data.promotionCodes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching promotion codes:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Đã copy mã: ${code}`);
    } catch (err) {
      toast.error("Không thể copy mã");
    }
  };

  const handleRedeem = async (voucher: PromotionCode) => {
    try {
      const response = await fetch("/api/voucher/redeem", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promotionCodeId: voucher.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Đổi thưởng thất bại");
      }

      toast.success(`Đã đổi thưởng: ${cleanVoucherName(voucher.name)}`);

      // Refresh danh sách voucher
      await fetchPromotionCodes();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể đổi thưởng";
      toast.error(errorMessage);
      console.error("Error redeeming voucher:", err);
    }
  };

  const cleanVoucherName = (name: string) => {
    // Loại bỏ phần suffix " - HOURS", " - DRINK", " - SNACK", " - FOOD"
    return name.replace(/\s*-\s*(HOURS|DRINK|SNACK|FOOD)\s*$/i, "");
  };

  const getRewardTypeDisplay = (rewardType: string) => {
    switch (rewardType) {
      case "FREE_HOURS":
        return {
          label: "Giờ chơi miễn phí",
          color: "bg-blue-500",
          icon: "⏰",
          gradient: "from-blue-500 to-blue-700",
          bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100",
        };
      case "FREE_DRINK":
        return {
          label: "Nước pha chế miễn phí",
          color: "bg-green-500",
          icon: "🥤",
          gradient: "from-green-500 to-emerald-700",
          bgGradient: "bg-gradient-to-br from-green-50 to-emerald-100",
        };
      case "FREE_FOOD":
        return {
          label: "Đồ ăn miễn phí",
          color: "bg-orange-500",
          icon: "🍕",
          gradient: "from-orange-500 to-red-600",
          bgGradient: "bg-gradient-to-br from-orange-50 to-red-100",
        };
      case "FREE_SNACK":
        return {
          label: "Đồ ăn vặt miễn phí",
          color: "bg-yellow-500",
          icon: "🍿",
          gradient: "from-yellow-500 to-orange-600",
          bgGradient: "bg-gradient-to-br from-yellow-50 to-orange-100",
        };
      default:
        return {
          label: "Phần thưởng miễn phí",
          color: "bg-purple-500",
          icon: "🎁",
          gradient: "from-purple-500 to-pink-600",
          bgGradient: "bg-gradient-to-br from-purple-50 to-pink-100",
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (expirationDate: string) => {
    return new Date(expirationDate) < new Date();
  };

  const isCurrentMonth = (dateString: string) => {
    if (!dateString) {
      console.log("⚠️ No date string provided");
      return false;
    }

    const date = new Date(dateString);
    const now = new Date();

    // Sử dụng UTC để tránh vấn đề timezone
    const dateMonth = date.getUTCMonth();
    const dateYear = date.getUTCFullYear();
    const nowMonth = now.getMonth();
    const nowYear = now.getFullYear();

    console.log(`📅 Checking: ${dateString}`);
    console.log(`   Voucher: Month ${dateMonth + 1}/${dateYear}`);
    console.log(`   Current: Month ${nowMonth + 1}/${nowYear}`);
    console.log(`   Match: ${dateMonth === nowMonth && dateYear === nowYear}`);

    return dateMonth === nowMonth && dateYear === nowYear;
  };

  // Filter vouchers based on active tab and current month
  const filteredVouchers = promotionCodes.filter((voucher) => {
    const isCurrentMonthVoucher = isCurrentMonth(voucher.createdAt);
    console.log(
      `🔍 Voucher "${voucher.name}": Month=${isCurrentMonthVoucher}, status=${voucher.status}, expired=${isExpired(voucher.expirationDate)}`,
    );

    // TEMPORARY: Comment out month filter to debug
    // if (!isCurrentMonthVoucher) return false;

    if (activeTab === "unused") {
      // Tab "Chưa sử dụng" bao gồm:
      // 1. Voucher chưa redeem (status = null)
      // 2. Voucher bị REJECT (có thể redeem lại)
      // 3. Voucher đang chờ duyệt (status = INITIAL)
      // KHÔNG bao gồm: APPROVE hoặc voucher hết hạn
      const isRejected = voucher.status === "REJECT";
      const isPending = voucher.status === "INITIAL";
      const notRedeemed = voucher.status === null;
      const notExpired = !isExpired(voucher.expirationDate);

      console.log(
        `   → unused tab: rejected=${isRejected}, pending=${isPending}, notRedeemed=${notRedeemed}, notExpired=${notExpired}`,
      );

      return (notRedeemed || isRejected || isPending) && notExpired;
    } else {
      // Tab "Đã sử dụng": chỉ voucher đã APPROVE
      const isApproved = voucher.status === "APPROVE";
      console.log(`   → used tab: approved=${isApproved}`);
      return isApproved;
    }
  });

  console.log("Total promotion codes:", promotionCodes.length);
  console.log("Filtered vouchers:", filteredVouchers.length);
  console.log("Active tab:", activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchPromotionCodes}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Voucher của tôi
        </h1>
        <p className="text-gray-600">
          Danh sách các mã khuyến mãi trong tháng {new Date().getMonth() + 1}/
          {new Date().getFullYear()}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("unused")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "unused"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Chưa sử dụng (
            {
              promotionCodes.filter((v) => {
                return (
                  isCurrentMonth(v.createdAt) &&
                  !isExpired(v.expirationDate) &&
                  (v.status === null ||
                    v.status === "REJECT" ||
                    v.status === "INITIAL")
                );
              }).length
            }
            )
          </button>
          <button
            onClick={() => setActiveTab("used")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "used"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Đã sử dụng (
            {
              promotionCodes.filter(
                (v) => v.status === "APPROVE" && isCurrentMonth(v.createdAt),
              ).length
            }
            )
          </button>
        </div>
      </div>

      {filteredVouchers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gift className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {activeTab === "unused"
                ? "Chưa có voucher nào"
                : "Chưa sử dụng voucher nào"}
            </h3>
            <p className="text-gray-500 text-center">
              {activeTab === "unused"
                ? "Bạn chưa có voucher nào trong tháng này. Hãy tham gia các sự kiện để nhận voucher!"
                : "Bạn chưa sử dụng voucher nào trong tháng này."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVouchers.map((voucher) => {
            const rewardInfo = getRewardTypeDisplay(voucher.rewardType);
            const expired = isExpired(voucher.expirationDate);

            return (
              <Card
                key={voucher.id}
                className={`relative overflow-hidden border-0 shadow-lg ${
                  expired ? "opacity-60" : ""
                } ${rewardInfo.bgGradient}`}
              >
                <CardContent className="p-6 space-y-4">
                  {/* Icon & Title */}
                  <div className="text-center space-y-2">
                    <div className="text-5xl mb-2">{rewardInfo.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {cleanVoucherName(voucher.name)}
                    </h3>
                    {/* Chỉ hiển thị badge "Đang chờ duyệt" */}
                    {voucher.status === "INITIAL" && (
                      <Badge className="bg-blue-500 text-white">
                        Đang chờ duyệt
                      </Badge>
                    )}
                  </div>

                  {/* Ngày hết hạn */}
                  <div className="text-center bg-white bg-opacity-60 rounded-lg py-3 px-4">
                    <p className="text-sm text-gray-600 mb-1">Hết hạn:</p>
                    <p
                      className={`text-lg font-semibold ${
                        expired ? "text-red-600" : "text-gray-800"
                      }`}
                    >
                      {formatDate(voucher.expirationDate)}
                    </p>
                  </div>

                  {/* Nút Đổi thưởng cho voucher chưa sử dụng hoặc bị từ chối */}
                  {(voucher.status === null || voucher.status === "REJECT") &&
                    !expired && (
                      <Button
                        onClick={() => handleRedeem(voucher)}
                        className={`w-full bg-gradient-to-r ${rewardInfo.gradient} hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md`}
                      >
                        <Star className="h-5 w-5 mr-2" />
                        Đổi thưởng
                      </Button>
                    )}

                  {/* Thông báo cho voucher đang chờ duyệt */}
                  {voucher.status === "INITIAL" && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800 flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4" />
                        Đang chờ admin duyệt
                      </p>
                    </div>
                  )}

                  {/* Thông báo cho voucher đã được duyệt */}
                  {voucher.status === "APPROVE" && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800 flex items-center justify-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Đã sử dụng thành công
                      </p>
                    </div>
                  )}

                  {/* Thông báo cho voucher hết hạn */}
                  {!voucher.isUsed && expired && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-800 flex items-center justify-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Voucher đã hết hạn
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
