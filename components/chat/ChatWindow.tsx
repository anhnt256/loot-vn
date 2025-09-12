"use client";

import React, { useState, useEffect } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ChatStatus } from "./ChatStatus";
import { useChat } from "@/hooks/useChat";
import { MessageCircle, AlertCircle } from "lucide-react";

interface ChatWindowProps {
  machineName: string;
  branch?: string;
  staffId?: number;
  className?: string;
  currentUserId?: number;
  currentMachineName?: string;
  currentBranch?: string;
  currentLoginType?: string;
  isAdminChat?: boolean;
}

export function ChatWindow({
  machineName,
  branch,
  staffId,
  className = "",
  currentUserId,
  currentMachineName,
  currentBranch,
  currentLoginType,
  isAdminChat = false,
}: ChatWindowProps) {
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const {
    messages,
    isLoading,
    isSending,
    isConnected,
    hasMore,
    onlineCount,
    sendMessage,
    loadMore,
    scrollToBottom,
    messagesEndRef,
  } = useChat({
    machineName,
    onError: (errorMessage) => {
      setError(errorMessage);
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    },
  });

  const handleSendMessage = (content: string) => {
    setError(null);
    sendMessage(content, staffId);
  };

  const handleRetry = () => {
    setError(null);
    // The hook will automatically retry connection
  };

  // Clear error when connection is restored
  useEffect(() => {
    if (isConnected && error) {
      setError(null);
    }
  }, [isConnected, error]);

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Chat</span>
          {messages.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 flex flex-col h-full ${className}`}>
      {/* Header */}
      <ChatStatus
        isConnected={isConnected}
        machineName={machineName}
        branch={branch}
        onlineCount={onlineCount}
      />

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        messagesEndRef={messagesEndRef}
        currentUserId={currentUserId}
        currentMachineName={currentMachineName}
        currentBranch={currentBranch}
        currentLoginType={currentLoginType}
        isAdminChat={isAdminChat}
      />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isSending={isSending}
        disabled={!isConnected}
        placeholder={isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."}
      />
    </div>
  );
}
