import { Card } from "@/components/ui/card";
import React from "react";

const UserSection = () => {
  // Function to generate a random color
  const getRandomColor = () => {
    const colors = ["red", "green", "blue", "yellow", "purple", "orange"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-full">
      <div className="flex flex-col items-center">
        {/* User Info and Other Elements Here */}
        {/* Cards Container */}
        <div className="flex flex-row flex-wrap justify-center gap-4 w-full">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="min-h-[50px] flex-1"
              style={{
                backgroundColor: getRandomColor(),
                maxWidth: "calc(100% / 6 - 1rem)",
              }}
            >
              {/* Card Content Here */}
              <p>Card {index + 1}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSection;
