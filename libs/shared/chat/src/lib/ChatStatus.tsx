import React from 'react';

interface ChatStatusProps {
  isConnected: boolean;
  title: string;
  onlineCount?: number;
}

export function ChatStatus({
  isConnected,
  title,
  onlineCount = 0,
}: ChatStatusProps) {
  return (
    <div className="bg-gray-900 text-white p-1.5 border-b border-gray-700">
      <div className="flex items-center gap-2 mb-0.5">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <div className="text-sm font-medium">{title}</div>
      </div>
      <div className="text-xs text-gray-300">
        {onlineCount} người đang online
      </div>
    </div>
  );
}
