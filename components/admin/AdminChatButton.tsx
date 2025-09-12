"use client";

import React, { useState } from 'react';
import { Menu, MessageCircle } from 'lucide-react';
import { AdminChatDrawer } from './AdminChatDrawer';
import { useAdminChat } from './AdminChatProvider';

export function AdminChatButton() {
  const [showChatIcon, setShowChatIcon] = useState(false);
  const { isChatEnabled, isDrawerOpen, setDrawerOpen } = useAdminChat();

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  const toggleIcon = () => {
    setShowChatIcon(!showChatIcon);
  };

  // Don't render if chat is disabled
  if (!isChatEnabled) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={toggleDrawer}
          onMouseEnter={toggleIcon}
          onMouseLeave={toggleIcon}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        >
          {showChatIcon ? (
            <MessageCircle className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Chat Drawer */}
      <AdminChatDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />
    </>
  );
}
