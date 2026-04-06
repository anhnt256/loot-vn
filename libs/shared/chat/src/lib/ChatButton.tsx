import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatWindow } from './ChatWindow';
import { ChatUser } from './types';

interface ChatButtonProps {
  serverUrl: string;
  tenantId: string;
  token?: string;
  currentUser: ChatUser;
  title?: string;
}

export function ChatButton({
  serverUrl,
  tenantId,
  token,
  currentUser,
  title,
}: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isOpenRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);

  // Keep ref in sync
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Maintain a background socket for unread count tracking
  useEffect(() => {
    if (!tenantId || !serverUrl) return;

    const socket = io(`${serverUrl}/chat`, {
      auth: {
        tenantId,
        token,
        userId: currentUser.userId,
        machineName: currentUser.machineName,
        staffId: currentUser.staffId,
        loginType: currentUser.loginType,
      },
      transports: ['websocket'],
    });

    socket.on('chat:unread_count', (data: { count: number }) => {
      // Only update badge when chat is closed; when open the user is reading
      if (!isOpenRef.current) {
        setUnreadCount(data.count);
      }
    });

    // When a new message arrives and chat is closed, bump unread
    socket.on('chat:message', () => {
      if (!isOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, [serverUrl, tenantId, token, currentUser.userId]);

  // When chat opens → clear badge; when chat closes → re-fetch real unread count
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    } else {
      // Re-fetch fresh unread count from server via socket
      socketRef.current?.emit('chat:mark-seen', { messageId: 0 });
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Float button */}
      <button
        onClick={handleToggle}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white flex items-center justify-center`}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center px-1">
            <span className="text-xs font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-[500px] rounded-lg shadow-2xl overflow-hidden border border-gray-700">
          <ChatWindow
            serverUrl={serverUrl}
            tenantId={tenantId}
            token={token}
            currentUser={currentUser}
            title={title}
          />
        </div>
      )}
    </>
  );
}
