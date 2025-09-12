"use client";

import React, { createContext, useContext, useState } from "react";

interface AdminChatContextType {
  isChatEnabled: boolean;
  toggleChat: () => void;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const AdminChatContext = createContext<AdminChatContextType | undefined>(
  undefined,
);

export function AdminChatProvider({ children }: { children: React.ReactNode }) {
  const [isChatEnabled, setIsChatEnabled] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleChat = () => {
    setIsChatEnabled(!isChatEnabled);
    if (!isChatEnabled) {
      setIsDrawerOpen(false);
    }
  };

  const setDrawerOpen = (open: boolean) => {
    if (isChatEnabled) {
      setIsDrawerOpen(open);
    }
  };

  return (
    <AdminChatContext.Provider
      value={{
        isChatEnabled,
        toggleChat,
        isDrawerOpen,
        setDrawerOpen,
      }}
    >
      {children}
    </AdminChatContext.Provider>
  );
}

export function useAdminChat() {
  const context = useContext(AdminChatContext);
  if (context === undefined) {
    throw new Error("useAdminChat must be used within an AdminChatProvider");
  }
  return context;
}
