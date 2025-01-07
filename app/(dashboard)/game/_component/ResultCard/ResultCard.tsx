import React from "react";
import Image from "next/image";

interface CardProps {
  rarity: "Rare" | "Medium" | "Legend" | "Jackpot";
  prize: string;
}

const ResultCard: React.FC<CardProps> = ({ rarity, prize }) => {
  const borderColors = {
    Rare: "border-blue-500",
    Medium: "border-purple-500",
    Legend: "border-yellow-500",
    Jackpot: "border-red-500",
  };

  const textColors = {
    Rare: "text-blue-500",
    Medium: "text-purple-500",
    Legend: "text-yellow-500",
    Jackpot: "text-red-500",
  };

  return (
    <div
      className={`
      relative w-64 h-96
      border-4 rounded-xl overflow-hidden
      ${borderColors[rarity]}
      transition-all duration-300
      hover:scale-105
    `}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/meo.jpg"
          alt="Card background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Opacity Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content Layer */}
      <div className="relative z-10 h-full w-full p-4">
        <div className="text-xl font-bold text-white">
          <span className={textColors[rarity]}>{rarity}</span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`
            text-3xl font-bold
            ${textColors[rarity]}
          `}
          >
            {prize}đ
          </span>
        </div>
      </div>

      {/* Jackpot Effect */}
      {rarity === "Jackpot" && (
        <div className="absolute inset-0 bg-red-500/10" />
      )}
    </div>
  );
};

export default ResultCard;
