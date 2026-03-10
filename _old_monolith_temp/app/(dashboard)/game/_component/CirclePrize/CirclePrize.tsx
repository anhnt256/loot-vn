import React, { useEffect, useRef, useState } from "react";
import AnimatedCounter from "@/app/(dashboard)/game/_component/AnimatedCounter/AnimatedCounter";
import { usePolling } from "@/hooks/usePolling";

interface Segment {
  id: number;
  title: string;
  background: string;
  textColor: string;
  value?: number;
}

interface CircleSegmentsProps {
  segments: Segment[];
}

interface ApiData {
  id: number;
  value: string;
  timestamp: string;
}

const CircleSegments: React.FC<CircleSegmentsProps> = ({ segments }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState(60);
  const [fund, setFund] = useState(0);

  const { data, error, isLoading, lastUpdated, refetch } = usePolling<
    ApiData[]
  >("/api/game/fund", {
    interval: 60000, // 60 seconds
    onSuccess: (data) => {
      setFund(data);
      setCountdown(60);
    },
    onError: (error) => {
      console.error("Error fetching data:", error);
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Increase base size by 1.5
    const baseSize = 675; // 450 * 1.5
    const size = Math.min(window.innerWidth, window.innerHeight, baseSize);
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 15; // Slightly larger padding for bigger size

    const formatValue = (value: number): string => {
      return new Intl.NumberFormat("en-US").format(value);
    };

    const drawSegment = (
      startAngle: number,
      endAngle: number,
      segment: Segment,
    ) => {
      if (!ctx) return;

      // Draw segment background
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.background;
      ctx.fill();

      // Draw text
      ctx.save();
      const middleAngle = (startAngle + endAngle) / 2;
      const textDistance = radius * 0.65; // Adjusted for better positioning in larger circle

      // Calculate text position
      const textX = centerX + Math.cos(middleAngle) * textDistance;
      const textY = centerY + Math.sin(middleAngle) * textDistance;

      // Move to text position and rotate
      ctx.translate(textX, textY);
      ctx.rotate(middleAngle + Math.PI / 2);

      // Text styling
      ctx.fillStyle = segment.textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Draw title
      ctx.font = "bold 21px Arial"; // Increased font size (14px * 1.5)
      const words = segment.title.split(" ");
      const lines: string[] = [];
      let currentLine = words[0];

      // Word wrap with increased width
      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + " " + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > radius * 0.55) {
          // Increased wrap width
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      // Draw title lines with increased spacing
      const lineHeight = 30; // Increased from 20
      lines.forEach((line, i) => {
        const yOffset = (i - (lines.length - 1) / 2) * lineHeight;
        ctx.fillText(line, 0, yOffset - 15);
      });

      // Draw value if exists
      if (segment.value !== undefined) {
        ctx.font = "bold 20px Arial"; // Increased from 16px
        const valueText = formatValue(segment.value);
        ctx.fillText(valueText, 0, lineHeight * lines.length);
      }

      ctx.restore();
    };

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segments
    segments.forEach((segment, index) => {
      const startAngle = (index / segments.length) * Math.PI * 2;
      const endAngle = ((index + 1) / segments.length) * Math.PI * 2;
      drawSegment(startAngle, endAngle, segment);
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3; // Increased from 2
    ctx.stroke();
  }, [segments, countdown]);

  return (
    <div className="relative flex justify-center items-center h-[675px]">
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full">
        <div
          className="text-2xl font-bold mb-2 drop-shadow"
          style={{ color: "#b86e00" }}
        >
          Jackpot
        </div>
        <div
          className="text-5xl font-extrabold mb-2 drop-shadow-lg"
          style={{
            color: "#ff9900",
            textShadow: "0 2px 8px #fff, 0 0px 2px #000",
          }}
        >
          {new Intl.NumberFormat("en-US").format(fund)}
        </div>
        <div className="text-base text-gray-700 font-medium">
          Cập nhật sau: {countdown}s
        </div>
      </div>
    </div>
  );
};

export default CircleSegments;
