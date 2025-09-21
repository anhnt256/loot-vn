"use client";

import React, { useState, useEffect } from "react";
import { ChatWindow } from "./ChatWindow";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";
import { MessageCircle } from "lucide-react";

const CURRENT_USER = "currentUser";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ChatPanel({ isOpen, onClose, className = "" }: ChatPanelProps) {
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const userData = useLocalStorageValue(CURRENT_USER, null);

  useEffect(() => {
    // Get machine name from user data
    if (userData) {
      const user = userData as any;
      const machineName =
        user.machineName ||
        user.userName ||
        user.username ||
        user.pcName ||
        user.pc_name ||
        "";

      if (machineName) {
        setSelectedMachine(`Máy ${machineName}`);
      }
    }
  }, [userData]);

  if (!userData) {
    return null;
  }

  return (
    <div
      className={`h-full bg-gray-900 border-l border-gray-700 shadow-lg flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } ${className}`}
    >
      {/* Chat Content */}
      <div className="flex-1 h-full">
        {selectedMachine ? (
          <div className="h-full">
            <ChatWindow
              machineName={selectedMachine}
              branch={(userData as any)?.branch}
              staffId={
                (userData as any)?.userType === "staff"
                  ? (userData as any)?.userId
                  : undefined
              }
              currentUserId={(userData as any)?.userId}
              className="h-full border-0 rounded-none"
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Đang tải thông tin máy...
              </h4>
              <p className="text-xs text-gray-500">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
