"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import MeteorEffect from "@/app/(dashboard)/game/_component/MeteorEffect/MeteorEffect";
import { WishResult } from "@/app/(dashboard)/game/_component/WishResult/WishResult";
import { useUserInfo } from "@/hooks/use-user-info";
import { Rules } from "@/app/(dashboard)/game/_component/Rules/Rules";
import { usePolling } from "@/hooks/usePolling";
import AnimatedCounter from "@/app/(dashboard)/game/_component/AnimatedCounter/AnimatedCounter";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import ResultCard from "@/app/(dashboard)/game/_component/ResultCard/ResultCard";

interface ApiData {
  id: number;
  value: string;
  timestamp: string;
}

const Game = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMeteor, setShowMeteor] = useState(false);
  const [meteorStar, setMeteorStar] = useState<number>(3);
  const [single, setSingle] = useState<boolean>(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  const [count, setCount] = useState(0);
  const { userName, userData } = useUserInfo();
  const { stars } = userData || {};

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openRuleModal = () => setIsRuleModalOpen(true);
  const closeRuleModal = () => setIsRuleModalOpen(false);

  const handleSuccess = useCallback(() => {
    setCount((prevCount) => prevCount + 1);
  }, []);

  const { data, error, isLoading, lastUpdated, refetch } = usePolling<
    ApiData[]
  >("/api/game/wish/calc-fund", {
    interval: 10000, // 30 seconds
    onSuccess: (data) => {
      handleSuccess();
      console.error("Success fetching data:", data);
    },
    onError: (error) => {
      console.error("Error fetching data:", error);
    },
  });

  // const { data: infos } = useQuery<[any]>({
  //   queryKey: ["calc-user-roll"],
  //   queryFn: () => fetcher(`/api/jobs/calc-user-roll`),
  // });

  const result = [
    {
      itemID: 14430,
      name: "waveriding-whirl",
      rarity: 3,
      weaponType: "catalyst",
      limited: true,
      origin: "natlan",
    },
    {
      itemID: 15430,
      name: "flower-wreathed-feathers",
      rarity: 3,
      weaponType: "bow",
      limited: true,
      origin: "natlan",
    },
    {
      itemID: 15514,
      name: "astral-vultures-crimson-plumage",
      rarity: 3,
      weaponType: "bow",
      limited: true,
      origin: "natlan",
      offset: {
        button: { t: 10, w: 75, l: 30 },
      },
    },
  ];

  const handleMeteorAnimation = () => {
    const stars = result.map(({ rarity }) => rarity);
    const isSingle = stars.length === 1;
    setSingle(isSingle);

    let starLevel = 3;
    if (stars.includes(4)) starLevel = 4;
    if (stars.includes(5)) starLevel = 5;
    setMeteorStar(starLevel);

    setShowMeteor(true);
  };

  const handleRoll = (rolls: number) => {
    handleMeteorAnimation();
  };

  const WishButton = ({ count }: { count: number }) => {
    return (
      <button
        className="bg-white rounded-full p-2 shadow-lg flex flex-col items-center w-48"
        onClick={() => handleRoll(count)}
      >
        <span className="text-gray-600 text-sm">Wish ×{count}</span>
        <div className="flex items-center space-x-1 mt-1">
          <Image src={"/rock.png"} alt="wish" width="24" height="24" />
          <span className="text-gray-500 text-sm">x {count}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col p-5 gap-4">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-4">
            Tính năng mới sẽ dự kiến ra mắt vào ngày 10/01/2025. Hãy cùng đón
            chờ nhé!
          </h2>

          <div className="flex justify-center items-center">
            <Image
              src="/game.png"
              width={800}
              height={550}
              alt="stars"
              className="object-cover"
              priority
              quality={100}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col p-5 gap-4">
      <div className="shadow-lg rounded-lg w-full overflow-auto max-h-[89vh] relative">
        <div className="flex justify-between p-4 bg-blue-600 text-white">
          <h2>Đền Nguyện Ước</h2>
          <AnimatedCounter
            from={count}
            to={count + 1000}
            className="text-2xl font-bold text-white"
          />

          <div className="flex gap-2">
            <div className="flex items-center bg-gray-600/80 rounded-full px-3 py-1.5">
              <span className="text-white font-semibold flex items-center gap-2">
                {stars?.toLocaleString()}
                <Image src="/star.png" width="24" height="24" alt="stars" />
              </span>
            </div>

            <div className="flex items-center gap-2 bg-gray-600/80 rounded-full px-3 py-1.5">
              <span className="text-white font-semibold">25</span>
              <Image src={"/rock.png"} alt="wish" width="24" height="24" />
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center pt-24 pb-44 bg-gray-200">
          <Image
            className="max-w-full max-h-80 object-contain rounded-lg"
            src="/temp.webp"
            width="600"
            height="800"
            alt="banner"
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
              setShowMeteor={setShowMeteor}
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

        <div className="flex justify-center items-center mt-4">
          <ResultCard rarity="Jackpot" prize="1,000,000" />
        </div>
      </div>
    </div>
  );
};

export default Game;
