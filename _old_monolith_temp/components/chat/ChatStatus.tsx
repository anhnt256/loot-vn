"use client";

import React from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

interface ChatStatusProps {
  isConnected: boolean;
  isConnecting?: boolean;
  machineName: string;
  branch?: string;
  onlineCount?: number;
}

export function ChatStatus({
  isConnected,
  isConnecting = false,
  machineName,
  branch,
  onlineCount = 0,
}: ChatStatusProps) {
  const displayName = branch ? `${machineName}(${branch})` : machineName;

  return (
    <div className="bg-gray-900 text-white p-1.5 border-b border-gray-700">
      <div className="flex items-center gap-2 mb-0.5">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
          title={isConnected ? "Đã Kết Nối" : "Mất Kết Nối"}
        ></div>
        <div className="text-sm font-medium">Chat - {displayName}</div>
      </div>

      {isConnecting && (
        <div className="text-xs flex items-center gap-1 mb-0.5">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Đang kết nối...</span>
        </div>
      )}

      {/* Online count */}
      <div className="text-xs text-gray-300">
        {onlineCount} người đang online
      </div>
    </div>
  );
}
