import React, { useEffect, useRef, useState, useCallback } from 'react';
import { apiClient } from '@gateway-workspace/shared/utils/client';

import AnimatedCounter from './AnimatedCounter';

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

const CircleSegments: React.FC<CircleSegmentsProps> = ({ segments }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState(60);
  const [fund, setFund] = useState(0);

  const fetchFund = useCallback(async () => {
    try {
      const res = await apiClient.get('/game/fund');
      setFund(res.data);
      setCountdown(60);
    } catch (err) {
      console.error('Error fetching fund:', err);
    }
  }, []);

  // Initial fetch + polling every 60s
  useEffect(() => {
    fetchFund();
    const interval = setInterval(fetchFund, 60000);
    return () => clearInterval(interval);
  }, [fetchFund]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseSize = 675;
    const size = Math.min(window.innerWidth, window.innerHeight, baseSize);
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 15;

    const formatValue = (value: number): string => new Intl.NumberFormat('en-US').format(value);

    const drawSegment = (startAngle: number, endAngle: number, segment: Segment) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.background;
      ctx.fill();

      ctx.save();
      const middleAngle = (startAngle + endAngle) / 2;
      const textDistance = radius * 0.65;
      const textX = centerX + Math.cos(middleAngle) * textDistance;
      const textY = centerY + Math.sin(middleAngle) * textDistance;

      ctx.translate(textX, textY);
      ctx.rotate(middleAngle + Math.PI / 2);

      ctx.fillStyle = segment.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = 'bold 21px Arial';
      const words = segment.title.split(' ');
      const lines: string[] = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const testLine = `${currentLine  } ${  words[i]}`;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > radius * 0.55) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      const lineHeight = 30;
      lines.forEach((line, i) => {
        const yOffset = (i - (lines.length - 1) / 2) * lineHeight;
        ctx.fillText(line, 0, yOffset - 15);
      });

      if (segment.value !== undefined) {
        ctx.font = 'bold 20px Arial';
        const valueText = formatValue(segment.value);
        ctx.fillText(valueText, 0, lineHeight * lines.length);
      }

      ctx.restore();
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    segments.forEach((segment, index) => {
      const startAngle = (index / segments.length) * Math.PI * 2;
      const endAngle = ((index + 1) / segments.length) * Math.PI * 2;
      drawSegment(startAngle, endAngle, segment);
    });

    // Center circle - dark theme
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [segments, countdown]);

  return (
    <div className="relative flex justify-center items-center h-[675px]">
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full">
        <div className="text-2xl font-bold mb-2 drop-shadow text-primary">
          Jackpot
        </div>
        <div
          className="text-5xl font-extrabold font-gaming mb-2 drop-shadow-lg text-primary"
          style={{
            textShadow: '0 2px 8px rgba(0,0,0,0.3), 0 0px 2px #000',
          }}
        >
          <AnimatedCounter from={0} to={fund} />
        </div>
        <div className="text-base text-gray-400 font-medium">
          Cập nhật sau: {countdown}s
        </div>
      </div>
    </div>
  );
};

export default CircleSegments;
