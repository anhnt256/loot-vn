import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CURRENT_USER } from "@/constants/token.constant";
import { useAction } from "@/hooks/use-action";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";
import { toast } from "sonner";
import { createUserRewardMap } from "@/actions/create-user-reward-map";
import { getCookie } from "cookies-next";
import { BRANCH } from "@/constants/enum.constant";
import dayjs from "@/lib/dayjs";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";
import { fetcher } from "@/lib/fetcher";

interface CardProps {
  data: any;
  onRewardSuccess?: () => void;
}

// Định nghĩa type cho userData
interface UserData {
  userId?: number;
  id?: number;
  userName?: string;
  stars?: number;
  magicStone?: number;
  [key: string]: any;
}

const RewardCard: React.FC<CardProps> = ({ data, onRewardSuccess }) => {
  const { id, name, value, totalPromotion } = data;
  const branch = getCookie("branch") || BRANCH.GOVAP;
  
  // Sử dụng hook để lấy userData từ localStorage với auto-sync
  const userData = useLocalStorageValue(CURRENT_USER, null) as UserData | null;
  
  // Lấy userId từ userData
  const userId = userData?.userId || userData?.id;
  
  // Lấy stars từ userData (đã được cập nhật từ user-calculator)
  const actualStars = userData?.stars || 0;

  // Hàm gọi API user-calculator để cập nhật lại thông tin user
  const refreshUserData = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch("/api/user-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listUsers: [Number(userId)],
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          const updatedUserData = result.data[0];
          // Cập nhật localStorage với thông tin mới
          localStorage.setItem(CURRENT_USER, JSON.stringify(updatedUserData));
          // Force reload để cập nhật UI
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };



  // Tính toán trạng thái và style
  const isAvailable = totalPromotion > 0;
  const canRedeem = actualStars >= value && isAvailable;
  const isOutOfStock = totalPromotion === 0;

  // Tính toán màu sắc dựa trên giá trị (không phụ thuộc vào trạng thái)
  const getRewardStyle = () => {
    // Màu sắc theo giá trị từ 10k đến 500k
    if (value <= 10000) {
      return {
        header: 'bg-gradient-to-br from-blue-400 to-blue-500',
        glow: 'shadow-blue-400/30'
      };
    } else if (value <= 20000) {
      return {
        header: 'bg-gradient-to-br from-green-400 to-green-500',
        glow: 'shadow-green-400/30'
      };
    } else if (value <= 50000) {
      return {
        header: 'bg-gradient-to-br from-purple-400 to-purple-500',
        glow: 'shadow-purple-400/30'
      };
    } else if (value <= 100000) {
      return {
        header: 'bg-gradient-to-br from-pink-400 to-pink-500',
        glow: 'shadow-pink-400/30'
      };
    } else if (value <= 200000) {
      return {
        header: 'bg-gradient-to-br from-red-400 to-red-500',
        glow: 'shadow-red-400/30'
      };
    } else {
      // 500k - nổi bật nhất
      return {
        header: 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 animate-pulse',
        glow: 'shadow-yellow-400/40'
      };
    }
  };

  // Tính toán button style dựa trên trạng thái
  const getButtonStyle = () => {
    if (isOutOfStock) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }

    if (!canRedeem) {
      return 'bg-orange-100 text-orange-600 hover:bg-orange-200';
    }

    // Button style theo giá trị khi có thể đổi
    if (value <= 10000) {
      return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl';
    } else if (value <= 20000) {
      return 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl';
    } else if (value <= 50000) {
      return 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl';
    } else if (value <= 100000) {
      return 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl';
    } else if (value <= 200000) {
      return 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl';
    } else {
      // 500k - nổi bật nhất
      return 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]';
    }
  };

  const rewardStyle = getRewardStyle();
  const buttonStyle = getButtonStyle();

  const { execute: executeCreateUserRewardMap, isLoading } = useAction(
    createUserRewardMap,
    {
      onSuccess: async (data) => {
        console.log("=== DEBUG: useAction onSuccess called ===");
        console.log("Success data:", data);
        // Gọi API user-calculator để tính toán lại số dư
        await refreshUserData();
        toast.success("Đổi thưởng thành công!");
        // Gọi callback để refresh lịch sử
        onRewardSuccess?.();
      },
      onError: (error) => {
        console.log("=== DEBUG: useAction onError called ===");
        console.log("Error:", error);
        if (error === "Reward has claim.") {
          toast.error(error);
          return;
        } else {
          toast.error(error);
        }
      },
    },
  );

  const onReward = async () => {
    console.log("=== DEBUG: onReward function called ===");
    console.log("isLoading:", isLoading);
    
    if (isLoading) {
      console.log("DEBUG: Function blocked by loading state");
      return;
    }
    
    if (totalPromotion === 0) {
      console.log("DEBUG: No promotion available");
      console.log("DEBUG: About to show toast - no promotion");
      toast.error(
        "Số luợng mã đã hết. Vui lòng liên hệ admin để bổ sung. Xin cảm ơn.",
      );
      console.log("DEBUG: Toast - no promotion should have been shown");
      return;
    }

    if (!userId || !userData) {
      console.log("DEBUG: Missing user data");
      console.log("userId:", userId);
      console.log("userData:", userData);
      console.log("DEBUG: About to show toast - missing user data");
      toast.error("Không tìm thấy thông tin user.");
      console.log("DEBUG: Toast - missing user data should have been shown");
      return;
    }

    // Kiểm tra số sao từ userData
    if (actualStars < value) {
      console.log("DEBUG: Not enough stars");
      console.log("actualStars:", actualStars);
      console.log("required value:", value);
      console.log("DEBUG: About to show toast - not enough stars");
      toast.error(`Bạn chỉ có ${actualStars.toLocaleString()} sao, không đủ để đổi thưởng này (cần ${value.toLocaleString()} sao).`);
      console.log("DEBUG: Toast - not enough stars should have been shown");
      return;
    }

    try {
      const currentUserId = userData?.userId || userData?.id;
      const newStars = actualStars - value;
      
      console.log("=== DEBUG: Calling executeCreateUserRewardMap ===");
      console.log("Calling executeCreateUserRewardMap with:", {
        userId,
        rewardId: id,
        currentUserId,
        value,
        oldStars: actualStars,
        newStars,
        branch,
        createdAt: getCurrentTimeVNISO(),
      });
      
      const result = await executeCreateUserRewardMap({
        userId,
        rewardId: id,
        value,
        oldStars: actualStars,
        newStars,
        branch,
        createdAt: getCurrentTimeVNISO(),
      });
      
      console.log("DEBUG: executeCreateUserRewardMap result:", result);
    } catch (error) {
      console.error("DEBUG: Error in onReward:", error);
      console.log("DEBUG: About to show toast - general error");
      toast.error("Có lỗi xảy ra khi đổi thưởng.");
      console.log("DEBUG: Toast - general error should have been shown");
    }
  };

  return (
    <div className={`group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:${rewardStyle.glow}`}>
      {/* Header với gradient */}
      <div className={`relative h-14 ${rewardStyle.header}`}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Tên phần thưởng */}
        <div className="relative h-full flex items-center justify-center px-2">
          <div className="text-center text-white">
            <div className="text-sm font-semibold leading-tight">
              {name}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Quantity */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-600">Số lượng:</span>
          <span className={`text-sm font-semibold ${
            isOutOfStock ? 'text-red-500' : 'text-green-600'
          }`}>
            {totalPromotion.toLocaleString()}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg">
          <span className="text-xs text-gray-600">Giá:</span>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-bold text-gray-800">
              {value?.toLocaleString()}
            </span>
            <span className="text-yellow-500 text-sm">⭐</span>
          </div>
        </div>

        {/* Button */}
        <Button
          disabled={!canRedeem || isLoading}
          className={`w-full py-2 text-sm font-medium transition-all duration-200 ${buttonStyle}`}
          onClick={onReward}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang xử lý...</span>
            </div>
          ) : (
            <span>ĐỔI THƯỞNG</span>
          )}
        </Button>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default RewardCard;
