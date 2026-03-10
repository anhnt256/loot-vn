"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import MeteorEffect from "./_component/MeteorEffect/MeteorEffect";
import { WishResult } from "./_component/WishResult/WishResult";

import { Rules } from "./_component/Rules/Rules";
import CircleSegments from "./_component/CirclePrize/CirclePrize";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@gateway-workspace/shared/utils";
import { useAction } from "@gateway-workspace/shared/hooksuse-action";
import { toast } from "sonner";
import { createGameResult } from "@gateway-workspace/shared/utils";
import { CURRENT_USER } from "@gateway-workspace/shared/utils";
import { useLocalStorageValue } from "@gateway-workspace/shared/hooks";

const Game = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMeteor, setShowMeteor] = useState(false);
  const [meteorStar, setMeteorStar] = useState<number>(3);
  const [single, setSingle] = useState<boolean>(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sử dụng hook để lấy userData từ localStorage
  const userData: any = useLocalStorageValue(CURRENT_USER, null);
  const [round, setRound] = useState<number>(0);
  const [giftRound, setGiftRound] = useState<number>(0);
  const [branch, setBranch] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"round" | "giftRound">(
    "round",
  );

  // Đồng bộ round, giftRound, branch khi userData thay đổi
  useEffect(() => {
    if (userData) {
      setRound(userData.round || 0);
      setGiftRound(userData.giftRound || 0);
    }
    if (typeof window !== "undefined") {
      const branchData = localStorage.getItem("branch") || "GO_VAP";
      setBranch(branchData);
    }
  }, [userData]);

  const { userId, totalPayment } = userData || {};

  const { data: segments } = useQuery<[any]>({
    queryKey: ["game-items"],
    queryFn: () => fetcher(`/api/game/items`),
  });

  const { execute: executeRoll } = useAction(createGameResult, {
    onSuccess: (data) => {
      setIsRolling(false);
      handleMeteorAnimation(data);
    },
    onError: (error: any) => {
      setIsRolling(false);
      toast.error(
        error?.message ||
          error ||
          "Không thể thực hiện quay. Vui lòng thử lại hoặc liên hệ admin.",
      );
    },
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openRuleModal = () => setIsRuleModalOpen(true);
  const closeRuleModal = () => setIsRuleModalOpen(false);

  const handleMeteorAnimation = (data: any) => {
    const ids = data.map((item: any) => item.id);
    const isSingle = ids.length === 1;
    setSingle(isSingle);

    let starLevel = 3;
    if (ids.includes(4) || ids.includes(5)) starLevel = 4;
    if (ids.includes(6) || ids.includes(7) || ids.includes(8)) starLevel = 5;
    setMeteorStar(starLevel);

    setShowMeteor(true);
    setIsAnimating(true);
  };

  const handleRoll = async (rolls: number) => {
    if (isRolling || isAnimating) {
      return;
    }
    setIsRolling(true);
    await executeRoll({
      userId: Number(userId),
      rolls,
      type: selectedType === "round" ? "Wish" : "Gift",
    });
  };

  // Hàm gọi user-calculator để cập nhật lại user info
  const updateUserInfo = async () => {
    if (!userId) return;
    try {
      const res = await fetch("/api/user-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listUsers: [Number(userId)] }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const newUser = json.data[0];
        localStorage.setItem(CURRENT_USER, JSON.stringify(newUser));
        setRound(newUser.round || 0);
        setGiftRound(newUser.giftRound || 0);
      }
    } catch (err) {
      // Có thể toast lỗi nếu muốn
      // toast.error("Không thể cập nhật thông tin user");
    }
  };

  // Lắng nghe khi hiệu ứng meteor kết thúc (showMeteor từ true về false)
  useEffect(() => {
    if (!showMeteor && !isAnimating) {
      // Hiệu ứng vừa kết thúc, cập nhật lại user info
      updateUserInfo();
      setIsAnimating(false); // reset lại trạng thái animating
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMeteor]);

  if (!userData || !branch) return null;

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="bg-white rounded-lg shadow-sm w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between p-3 bg-blue-600 text-white flex-shrink-0">
          <h2 className="text-lg font-semibold">Đền Nguyện Ước</h2>
          <div className="flex gap-2">
            <div className="bg-orange-500 rounded px-2 py-1">
              <span className="text-white text-xs font-medium">
                Tổng tiền nạp: {totalPayment?.toLocaleString() || 0}
              </span>
            </div>
            <div
              className={`flex items-center gap-1 rounded px-2 py-1 cursor-pointer transition-colors ${
                selectedType === "round"
                  ? "bg-white text-blue-600 border border-blue-600"
                  : "bg-gray-600"
              }`}
              onClick={() => setSelectedType("round")}
            >
              <span className="text-xs font-medium">
                {round?.toLocaleString() || 0}
              </span>
              <Image src={"/rock.png"} alt="wish" width="12" height="12" />
            </div>
            <div
              className={`flex items-center gap-1 rounded px-2 py-1 cursor-pointer transition-colors ${
                selectedType === "giftRound"
                  ? "bg-white text-blue-600 border border-blue-600"
                  : "bg-gray-600"
              }`}
              onClick={() => setSelectedType("giftRound")}
            >
              <span className="text-xs font-medium">
                {giftRound?.toLocaleString() || 0}
              </span>
              <span role="img" aria-label="gift" className="text-xs">
                🎁
              </span>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-100 p-2 flex-shrink-0">
          <p className="text-red-800 text-xs leading-tight">
            Số lượt quay được tính theo tổng tiền nạp trong tuần, và reset vào
            0h mỗi thứ 2 hàng tuần. Vui lòng sử dụng sớm để tránh mất lượt.
          </p>
          <p className="text-blue-800 text-xs font-bold mt-1 leading-tight">
            {`Tỉ lệ trúng Jackpot sẽ được cải thiện mạnh khi trên ${Number(process.env.NEXT_PUBLIC_UP_RATE_AMOUNT).toLocaleString()} VND. Hãy để ý nhé`}
          </p>
        </div>

        {/* Game Wheel Section */}
        <div className="flex-1 flex justify-center items-center bg-gray-100 p-2 min-h-0">
          <div className="w-full h-full flex items-center justify-center">
            <CircleSegments
              segments={
                Array.isArray(segments) ? [...segments].slice(0, 7) : []
              }
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center bg-gray-100 p-4 flex-shrink-0">
          <div className="flex gap-3">
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              onClick={() => openModal()}
            >
              Lịch sử
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              onClick={() => openRuleModal()}
            >
              Thể lệ
            </button>
            <button
              className="bg-pink-400 hover:bg-pink-500 text-white px-5 py-2 rounded text-sm font-medium flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setSelectedType("round");
                handleRoll(1);
              }}
              disabled={
                isRolling ||
                isAnimating ||
                (selectedType === "round" && round <= 0) ||
                (selectedType === "giftRound" && giftRound <= 0)
              }
            >
              {selectedType === "giftRound" ? (
                <span role="img" aria-label="gift" className="text-sm">
                  🎁
                </span>
              ) : (
                <Image src={"/rock.png"} alt="wish" width="14" height="14" />
              )}
              Ước
            </button>
            <button
              className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded text-sm font-medium flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setSelectedType("giftRound");
                handleRoll(10);
              }}
              disabled={
                isRolling ||
                isAnimating ||
                (selectedType === "round" && round < 10) ||
                (selectedType === "giftRound" && giftRound < 10)
              }
            >
              {selectedType === "giftRound" ? (
                <span role="img" aria-label="gift" className="text-sm">
                  🎁
                </span>
              ) : (
                <Image src={"/rock.png"} alt="wish" width="14" height="14" />
              )}
              Ước x10
            </button>
          </div>
        </div>

        {showMeteor && (
          <div className="wish-container">
            <MeteorEffect
              show={showMeteor}
              isSingle={single}
              rarity={meteorStar}
              setShowMeteor={(show) => {
                setShowMeteor(show);
                if (!show) {
                  setIsAnimating(false);
                }
              }}
              openModal={openModal}
            />
          </div>
        )}

        {isModalOpen && (
          <WishResult isModalOpen={isModalOpen} closeModal={closeModal} />
        )}

        {isRuleModalOpen && (
          <Rules isModalOpen={isRuleModalOpen} closeModal={closeRuleModal} />
        )}
      </div>
    </div>
  );
};

export default Game;
