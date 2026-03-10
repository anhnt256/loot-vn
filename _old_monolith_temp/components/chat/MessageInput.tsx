"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isSending: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSendMessage,
  isSending,
  disabled = false,
  placeholder = "Nhập tin nhắn...",
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSending || disabled) {
      return;
    }

    onSendMessage(content.trim());
    setContent("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    // Limit message length
    if (value.length <= 1000) {
      setContent(value);

      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text");

    // Check if pasted content would exceed limit
    if (content.length + pastedText.length > 1000) {
      e.preventDefault();
      const remainingChars = 1000 - content.length;
      const truncatedText = pastedText.substring(0, remainingChars);
      setContent((prev) => prev + truncatedText);
    }
  };

  useEffect(() => {
    // Focus textarea when component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="border-t border-gray-700 bg-gray-900 p-1.5">
      <form onSubmit={handleSubmit} className="flex gap-1.5">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="w-full px-1.5 py-1 text-sm border border-gray-600 bg-gray-800 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-400"
            rows={3}
            style={{ minHeight: "72px", maxHeight: "120px" }}
          />

          {/* Character count */}
          <div className="absolute bottom-1 right-1.5 text-xs text-gray-500">
            {content.length}/1000
          </div>
        </div>

        <button
          type="submit"
          disabled={!content.trim() || isSending || disabled}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors self-start"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isSending ? "Đang gửi..." : "Gửi"}
          </span>
        </button>
      </form>

      {/* Help text */}
      <div className="text-xs text-gray-400 mt-0.5">
        Nhấn Enter để gửi, Shift+Enter để xuống dòng
      </div>
    </div>
  );
}
