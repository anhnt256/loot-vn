import React from "react";
import { Mission } from "@prisma/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface CardProps {
  data: Mission;
}

const Card: React.FC<CardProps> = ({ data }) => {
  const { name, description, reward } = data;
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      <Image
        src="/quest.png"
        alt={name}
        width={500}
        height={300}
        objectFit="cover"
      />
      <div className="px-5 py-4">
        <div className="font-bold text-xs mb-2 min-h-[32px]">{name}</div>
        <p className="text-gray-700 font-normal text-xs min-h-[48px]">
          {description}
        </p>
      </div>
      <hr />
      <div className="px-5 py-4">
        <div className="flex justify-center items-center">
          <Button variant="primary">
            <div className="mr-1">{reward?.toLocaleString()}</div>
            <Image src="/star.png" width="22" height="22" alt="stars" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Card;
