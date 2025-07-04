"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import MeteorEffect from "@/app/(dashboard)/game/_component/MeteorEffect/MeteorEffect";
import { WishResult } from "@/app/(dashboard)/game/_component/WishResult/WishResult";
import { useUserInfo } from "@/hooks/use-user-info";
import { Rules } from "@/app/(dashboard)/game/_component/Rules/Rules";
import CircleSegments from "@/app/(dashboard)/game/_component/CirclePrize/CirclePrize";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { createGameResult } from "@/actions/create-gameResult";

const Game = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMeteor, setShowMeteor] = useState(false);
  const [meteorStar, setMeteorStar] = useState<number>(3);
  const [single, setSingle] = useState<boolean>(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { userData, branch } = useUserInfo();
  const queryClient = useQueryClient();

  const {
    stars,
    userId,
    id: currentUserId,
    magicStone,
    totalPayment,
  } = userData || {};

  const { data: segments } = useQuery<[any]>({
    queryKey: ["game-items"],
    queryFn: () => fetcher(`/api/game/items`),
  });

  const { data: rounds, isSuccess } = useQuery<[any]>({
    queryKey: ["calc-round"],
    queryFn: () => fetcher(`/api/game/${userId}/calc-round`),
    enabled: !!userId && !!branch,
  });

  // Cập nhật user data sau khi calc-round thành công
  useEffect(() => {
    if (isSuccess && rounds) {
      queryClient.invalidateQueries({ queryKey: ["user", currentUserId] });
    }
  }, [isSuccess, rounds, queryClient, currentUserId]);

  const { execute: executeRoll, data } = useAction(createGameResult, {
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

    // Cập nhật magicStone sau khi quay
    queryClient.invalidateQueries({ queryKey: ["calc-round"] });
    queryClient.invalidateQueries({ queryKey: ["user", currentUserId] });
  };

  const handleRoll = async (rolls: number) => {
    if (isRolling || isAnimating) {
      return;
    }
    setIsRolling(true);
    await executeRoll({
      userId: Number(userId),
      branch: String(branch),
      rolls,
    });
  };

  const WishButton = ({ count }: { count: number }) => {
    const isDisabled = isRolling || isAnimating;
    return (
      <button
        className={`bg-white rounded-full p-2 shadow-lg flex flex-col items-center w-48 ${
          isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
        }`}
        onClick={() => handleRoll(count)}
        disabled={isDisabled}
      >
        <span className="text-gray-600 text-sm">Wish ×{count}</span>
        <div className="flex items-center space-x-1 mt-1">
          <Image src={"/rock.png"} alt="wish" width="24" height="24" />
          <span className="text-gray-500 text-sm">x {count}</span>
        </div>
      </button>
    );
  };

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
            <div className="flex items-center gap-2 bg-gray-600/80 rounded-full px-3 py-1.5">
              <span className="text-white font-semibold">
                {magicStone?.toLocaleString()}
              </span>
              <Image src={"/rock.png"} alt="wish" width="24" height="24" />
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

        <div className="absolute bottom-5 left-0 right-0 flex justify-between items-center px-4">
          <div className="flex space-x-4">
            <button
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded"
              onClick={() => openModal()}
            >
              Lịch sử
            </button>

            <button
              className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => openRuleModal()}
            >
              Thể lệ
            </button>
          </div>

          <div className="flex space-x-4">
            <WishButton count={1} />
            <WishButton count={10} />
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
