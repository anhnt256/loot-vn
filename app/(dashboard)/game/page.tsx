"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import MeteorEffect from "@/app/(dashboard)/game/_component/MeteorEffect/MeteorEffect";
import { WishResult } from "@/app/(dashboard)/game/_component/WishResult/WishResult";

import { Rules } from "@/app/(dashboard)/game/_component/Rules/Rules";
import CircleSegments from "@/app/(dashboard)/game/_component/CirclePrize/CirclePrize";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { createGameResult } from "@/actions/create-gameResult";
import { CURRENT_USER } from "@/constants/token.constant";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";

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
    <div className="flex flex-col p-5 gap-4">
      <div className="shadow-lg rounded-lg w-full overflow-auto max-h-[89vh] relative">
        <div className="flex justify-between p-4 bg-blue-600 text-white">
          <h2>Đền Nguyện Ước</h2>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-orange-600/80 rounded-full px-3 py-1.5">
              <span className="text-white font-semibold">
                {`Tổng tiền nạp: ${totalPayment?.toLocaleString()}`}
              </span>
            </div>
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 cursor-pointer transition-all ${selectedType === "round" ? "bg-gray-800 border-2 border-yellow-400 shadow-lg" : "bg-gray-600/80"}`}
              onClick={() => setSelectedType("round")}
            >
              <span className="text-white font-semibold">
                {round?.toLocaleString()}
              </span>
              <Image src={"/rock.png"} alt="wish" width="24" height="24" />
            </div>
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 cursor-pointer transition-all ${selectedType === "giftRound" ? "bg-green-700 border-2 border-yellow-400 shadow-lg" : "bg-green-600/80"}`}
              onClick={() => setSelectedType("giftRound")}
            >
              <span className="text-white font-semibold">
                {giftRound?.toLocaleString()}
              </span>
              <span role="img" aria-label="gift">
                🎁
              </span>
            </div>
          </div>
        </div>

        <div className="bg-red-200">
          <span className="text-sm p-4">
            Số lượt quay được tính theo tổng tiền nạp trong tuần, và reset vào
            0h mỗi thứ 2 hàng tuần. Vui lòng sử dụng sớm để tránh mất lượt.
          </span>
        </div>
        <div className="flex justify-center items-center bg-gray-200">
          <CircleSegments
            segments={Array.isArray(segments) ? [...segments].slice(0, 7) : []}
          />
        </div>

        {/* Container trắng bo góc, border cam, center, chứa 4 nút */}
        <div className="flex justify-center items-center bg-gray-200 pt-4 pb-6">
          <div className="bg-white rounded-2xl shadow-md flex gap-4 px-8 py-4">
            <button
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-3 py-1.5 rounded text-sm"
              onClick={() => openModal()}
            >
              Lịch sử
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
              onClick={() => openRuleModal()}
            >
              Thể lệ
            </button>
            {/* Wish x1: icon theo selectedType, luôn w-40 */}
            <button
              className="border-2 border-orange-400 text-orange-500 px-6 py-2 rounded-full text-base flex items-center gap-2 bg-white hover:shadow-md transition w-40 justify-center"
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
                <span role="img" aria-label="gift">
                  🎁
                </span>
              ) : (
                <Image src={"/rock.png"} alt="wish" width={18} height={18} />
              )}
              Ước
            </button>
            {/* Wish x10: icon theo selectedType, luôn w-40 */}
            <button
              className="border-2 border-orange-400 text-orange-500 px-6 py-2 rounded-full text-base flex items-center gap-2 bg-white hover:shadow-md transition w-40 justify-center"
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
                <span role="img" aria-label="gift">
                  🎁
                </span>
              ) : (
                <Image src={"/rock.png"} alt="wish" width={18} height={18} />
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
