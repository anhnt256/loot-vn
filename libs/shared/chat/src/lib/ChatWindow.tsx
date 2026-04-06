import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatStatus } from './ChatStatus';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useSocketChat } from './useSocketChat';
import { ChatUser } from './types';

interface ChatWindowProps {
  serverUrl: string;
  tenantId: string;
  token?: string;
  currentUser: ChatUser;
  title?: string;
  className?: string;
}

export function ChatWindow({
  serverUrl,
  tenantId,
  token,
  currentUser,
  title,
  className = '',
}: ChatWindowProps) {
  const [error, setError] = useState<string | null>(null);
  const [firstUnreadId, setFirstUnreadId] = useState<number | undefined>();
  const maxSeenRef = useRef(0);

  const {
    messages,
    isLoading,
    isSending,
    isConnected,
    hasMore,
    onlineCount,
    sendMessage,
    markSeen,
    loadMore,
    messagesEndRef,
  } = useSocketChat({
    serverUrl,
    tenantId,
    token,
    userId: currentUser.userId,
    machineName: currentUser.machineName,
    staffId: currentUser.staffId,
    loginType: currentUser.loginType,
    onError: (msg) => {
      setError(msg);
      setTimeout(() => setError(null), 5000);
    },
  });

  useEffect(() => {
    if (isConnected && error) setError(null);
  }, [isConnected, error]);

  // Determine firstUnreadId from lastSeen (fetch once on mount)
  useEffect(() => {
    if (!serverUrl || !tenantId || !token || currentUser.loginType !== 'username') return;
    const fetchLastSeen = async () => {
      try {
        const res = await fetch(
          `${serverUrl.replace(/\/$/, '')}/admin/chat/unread-count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'x-tenant-id': tenantId,
            },
          },
        );
        const data = await res.json();
        // If there are unread messages, we need lastSeenId to find the divider
        if (data?.data?.count > 0) {
          const seenRes = await fetch(
            `${serverUrl.replace(/\/$/, '')}/admin/chat/messages?page=1&limit=200`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'x-tenant-id': tenantId,
              },
            },
          );
          // We'll set firstUnreadId after messages load
        }
      } catch {
        // silent
      }
    };
    fetchLastSeen();
  }, []);

  // Once messages loaded, find firstUnreadId by fetching lastSeenId
  useEffect(() => {
    if (messages.length === 0 || currentUser.loginType !== 'username') return;
    if (firstUnreadId !== undefined) return; // already set

    const fetchLastSeenId = async () => {
      try {
        const res = await fetch(
          `${serverUrl.replace(/\/$/, '')}/api/admin/chat/mark-seen`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'x-tenant-id': tenantId,
            },
            body: JSON.stringify({ messageId: 0 }), // dummy to get current count, won't update since 0 < current
          },
        );
        // Actually let's just use a simpler approach: get last seen from a dedicated endpoint
      } catch {
        // silent
      }
    };

    // Simple approach: use REST to get lastSeenId, then find first message after it
    (async () => {
      try {
        const res = await fetch(
          `${serverUrl.replace(/\/$/, '')}/admin/chat/last-seen`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'x-tenant-id': tenantId,
            },
          },
        );
        const data = await res.json();
        const lastSeenId = data?.data?.lastSeenId || 0;
        maxSeenRef.current = lastSeenId;
        const first = messages.find((m) => m.id > lastSeenId);
        if (first) {
          setFirstUnreadId(first.id);
        }
      } catch {
        // silent — no divider
      }
    })();
  }, [messages.length]);

  // When a message becomes visible, mark it as seen
  const handleMessageVisible = useCallback(
    (messageId: number) => {
      if (messageId > maxSeenRef.current) {
        maxSeenRef.current = messageId;
        markSeen(messageId);
      }
    },
    [markSeen],
  );

  const displayTitle = title || `Chat - ${currentUser.machineName || 'Chat'}`;

  return (
    <div className={`bg-gray-900 flex flex-col h-full ${className}`}>
      <ChatStatus
        isConnected={isConnected}
        title={displayTitle}
        onlineCount={onlineCount}
      />

      {error && (
        <div className="bg-red-900/50 border-l-4 border-red-400 p-2 flex items-center gap-2">
          <div className="flex-1">
            <p className="text-sm text-red-300">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-200 text-sm font-medium"
          >
            Thử lại
          </button>
        </div>
      )}

      <MessageList
        messages={messages}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        messagesEndRef={messagesEndRef}
        currentUser={currentUser}
        onMessageVisible={handleMessageVisible}
        firstUnreadId={firstUnreadId}
      />

      <MessageInput
        onSendMessage={sendMessage}
        isSending={isSending}
        disabled={!isConnected}
        placeholder={isConnected ? 'Nhập tin nhắn...' : 'Đang kết nối...'}
      />
    </div>
  );
}
