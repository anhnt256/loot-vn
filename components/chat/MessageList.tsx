"use client";

import React, { useEffect, useRef, useState } from "react";
import dayjs from "@/lib/dayjs";
import { ChatMessage } from "@/hooks/useChat";
import { filterProfanity } from "@/lib/profanity-filter";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore?: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  currentUserId?: number;
  currentMachineName?: string;
  currentBranch?: string;
  currentLoginType?: string;
  isAdminChat?: boolean; // true if this is admin chat view, false if user chat view
}

export function MessageList({
  messages,
  isLoading,
  hasMore,
  onLoadMore,
  messagesEndRef,
  currentUserId,
  currentMachineName,
  currentBranch,
  currentLoginType,
  isAdminChat = false,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [showLoadMore, setShowLoadMore] = useState(false);

  // Show load more button when scrolled to top
  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop } = listRef.current;
      setShowLoadMore(scrollTop === 0 && hasMore);
    }
  };

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.addEventListener("scroll", handleScroll);
      return () => list.removeEventListener("scroll", handleScroll);
    }
  }, [hasMore]);

  const formatTime = (dateString: string) => {
    try {
      // Hiển thị chính xác giờ UTC từ BE trả về (không convert sang local timezone)
      const date = dayjs.utc(dateString);
      return date.format("HH:mm");
    } catch {
      return "--:--";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Hiển thị chính xác ngày UTC từ BE trả về (không convert sang local timezone)
      const date = dayjs.utc(dateString);
      const now = dayjs.utc();
      const isToday = date.format("YYYY-MM-DD") === now.format("YYYY-MM-DD");

      if (isToday) {
        return "Hôm nay";
      }

      const yesterday = now.subtract(1, 'day');
      const isYesterday = date.format("YYYY-MM-DD") === yesterday.format("YYYY-MM-DD");

      if (isYesterday) {
        return "Hôm qua";
      }

      return date.format("DD/MM/YYYY");
    } catch {
      return "";
    }
  };

  const getMessageSender = (message: ChatMessage) => {
    if (message.staffId) {
      return `Staff (${message.userName || "Unknown"})`;
    }
    // For user messages, show Machine(Branch) instead of userName for security
    if (message.userId) {
      // Check if this is admin message (userId: -99)
      if (message.userId === -99) {
        return "ADMIN";
      }
      // Check if this is staff message (userId: -98, -97)
      if (message.userId === -98) {
        return "STAFF(GO_VAP)";
      }
      if (message.userId === -97) {
        return "STAFF(TAN_PHU)";
      }
      // Check if this is current user's message
      if (currentUserId && message.userId === currentUserId) {
        if (currentLoginType === "username") {
          return "ADMIN"; // Admin không có branch
        } else if (currentLoginType === "mac") {
          return `STAFF(${currentBranch})`; // Staff có branch
        }
      }
      return `${message.machineName}(${message.branch})`;
    }
    return "User";
  };

  const getMessageType = (message: ChatMessage) => {
    if (message.staffId) {
      return "staff";
    }
    if (message.userId) {
      // Check if this is the current user's message first
      if (currentUserId && message.userId === currentUserId) {
        // Check login type to determine message type
        if (currentLoginType === "username") {
          return "admin"; // Admin messages
        } else if (currentLoginType === "mac") {
          return "staff"; // Staff messages
        }
        return "current-user";
      }
      // Check if this is admin message (userId: -99)
      if (message.userId === -99) {
        return "admin";
      }
      // Check if this is staff message (userId: -98, -97)
      if (message.userId === -98 || message.userId === -97) {
        return "staff";
      }
      return "user";
    }
    return "system";
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Load more button */}
      {showLoadMore && (
        <div className="p-2 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Đang tải..." : "Tải thêm tin nhắn"}
          </button>
        </div>
      )}

      {/* Messages list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-1 space-y-1 bg-gray-900"
      >
        {messages.map((message, index) => {
          const messageType = getMessageType(message);
          const sender = getMessageSender(message);
          const showDate =
            index === 0 ||
            formatDate(messages[index - 1].createdAt) !==
              formatDate(message.createdAt);

          return (
            <div key={message.id}>
              {/* Date separator */}
              {showDate && (
                <div className="text-center text-xs text-gray-400 my-1">
                  {formatDate(message.createdAt)}
                </div>
              )}

              {/* Message */}
              <div
                className={`flex ${
                  // Only show messages on right if they are from the current user
                  // This applies to all contexts: admin, staff, or user chat
                  currentUserId && message.userId === currentUserId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-2 py-1 rounded-lg ${
                    messageType === "staff"
                      ? "bg-orange-600 text-white"
                      : messageType === "current-user"
                        ? "bg-green-600 text-white"
                        : messageType === "admin"
                          ? "bg-purple-600 text-white"
                          : messageType === "user"
                            ? "bg-gray-700 text-gray-100"
                            : "bg-yellow-600 text-yellow-100"
                  }`}
                >
                  <div
                    className="text-xs font-medium mb-0"
                    style={{ fontSize: "10px" }}
                  >
                    {sender}
                  </div>
                  <div
                    className="text-xs whitespace-pre-wrap"
                    style={{ fontSize: "10px" }}
                  >
                    {filterProfanity(message.content)}
                  </div>
                  <div
                    className={`text-xs mt-0 ${
                      messageType === "staff"
                        ? "text-orange-200"
                        : messageType === "current-user"
                          ? "text-green-200"
                          : messageType === "admin"
                            ? "text-purple-200"
                            : "text-gray-400"
                    }`}
                    style={{ fontSize: "9px" }}
                  >
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && messages.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            Đang tải tin nhắn...
          </div>
        )}

        {/* Empty state */}
        {!isLoading && messages.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
