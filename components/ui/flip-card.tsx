"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function FlipCard({
  frontContent,
  backContent,
  className,
  onClick,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    onClick?.();
  };

  return (
    <div
      className={cn(
        "relative w-full h-48 cursor-pointer perspective-1000",
        className,
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 transform-style-preserve-3d",
          isFlipped && "rotate-y-180",
        )}
      >
        {/* Front side */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          {frontContent}
        </div>

        {/* Back side */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          {backContent}
        </div>
      </div>
    </div>
  );
}
