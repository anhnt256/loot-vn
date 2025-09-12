"use client";

import React, { useState, useEffect } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useLocalStorageValue } from '@/hooks/useLocalStorageValue';
import { X, MessageCircle } from 'lucide-react';
import { useAdminChat } from './AdminChatProvider';
import Cookies from 'js-cookie';

const CURRENT_USER = 'currentUser';

interface AdminChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminChatDrawer({ isOpen, onClose }: AdminChatDrawerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const userData = useLocalStorageValue(CURRENT_USER, null);
  const { isChatEnabled } = useAdminChat();
  const loginType = Cookies.get('loginType');
  
  // Try to get userId from different sources
  const userId = (userData as any)?.userId || 
                 (userData as any)?.id || 
                 Cookies.get('userId') ||
                 Cookies.get('id') ||
                 -99; // Admin uses -99 as userId

  // Test: Always render if isOpen, ignore other conditions temporarily
  if (!isOpen) {
    return null;
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed top-6 right-6 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gray-900 text-white p-3 rounded-lg shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2 border border-gray-700"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Admin Chat</span>
        </button>
      </div>
    );
  }

  // Simple test - always show if isOpen
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed top-6 right-6 z-40 w-80 h-[calc(100vh-3rem)] bg-gray-900 border border-gray-700 shadow-xl rounded-lg flex flex-col"
    >
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Admin Chat - All Machines</h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded"
            >
              <span className="text-xs">−</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 h-full">
        <div className="h-full">
          <ChatWindow
            machineName="ALL" // Chat với tất cả máy
            branch={(userData as any)?.branch}
            staffId={(userData as any)?.userType === 'staff' ? userId : undefined}
            currentUserId={userId}
            currentMachineName={loginType === 'username' ? 'ADMIN' : 'STAFF'}
            currentBranch={(userData as any)?.branch}
            currentLoginType={loginType}
            isAdminChat={true} // Đây là admin chat view
            className="h-full border-0 rounded-none"
          />
        </div>
      </div>
    </div>
  );
}
