import React, { useCallback, useState } from "react";
import { Clock, RefreshCw } from "lucide-react";
import dayjs from "@/lib/dayjs";
import { toast } from "sonner";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { useAction } from "@/hooks/use-action";
import { createCheckInResult } from "@/actions/create-checkInResult";
import { CURRENT_USER } from "@/constants/token.constant";

const CheckInCard = () => {
  const [isChecking, setIsChecking] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER) || "{}");
  const playTime = currentUser?.totalCheckIn / 1000 || 0;
  const claim = currentUser?.claimedCheckIn || 0;
  const rewards = currentUser?.availableCheckIn || 0;
  const userId = currentUser?.userId || 0;

  const { execute: executeCheckIn } = useAction(createCheckInResult, {
    onSuccess: () => {
      toast.success("Check-in thành công!");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleCheckIn = useCallback(async () => {
    const canClaim = rewards - claim;
    if ((rewards || claim) < 0) {
      toast.error("Lỗi hệ thống. Vui lòng liên hệ nhân viên để được hỗ trợ!");
      return;
    }
    if (isChecking || canClaim <= 0) {
      toast.error("Bạn không có phần thưởng để nhận");
      return;
    }
    if (!isChecking) {
      setIsChecking(true);
      try {
        await executeCheckIn({
          userId,
        });
      } catch (error) {
        toast.error("Lỗi khi nhận thưởng!");
      }
      setIsChecking(false);
      window.location.reload();
    }
  }, [rewards, claim, isChecking, executeCheckIn, userId]);

  const handleUpdate = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="border-2 p-4 border-gray-400 shadow-card rounded-lg">
      {isChecking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Spin size="large" />
        </div>
      )}
      {/* Title with date */}
      <div className="text-center mb-4">
        <h2 className="text-yellow-500 font-bold text-xl">Điểm danh ngày</h2>
        <p className="text-yellow-500 font-bold text-xl">
          {dayjs().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")}
        </p>
      </div>
      {/* Stats */}
      <div className="space-y-3 mb-4">
        {/* Play time */}
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-gray-400 text-sm">Tổng thời gian chơi</p>
            <p className="text-white font-bold text-lg">{playTime}h</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-yellow-500">
            <StarFilled className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Đã nhận</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-bold text-lg">
                {claim.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        {/* Rewards */}
        <div className="flex items-center gap-2">
          <div className="text-yellow-500">
            <StarOutlined className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Có thể nhận</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-bold text-lg">
                {rewards.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleUpdate}
          className="flex-1 flex items-center justify-center gap-1 text-base bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Cập nhật</span>
        </button>
        <button
          disabled={rewards - claim <= 0}
          onClick={handleCheckIn}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-base py-2 px-3 rounded-lg transition-all duration-200 font-bold"
        >
          Nhận thưởng
        </button>
      </div>
    </div>
  );
};

export default CheckInCard;
