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
  const didFetchLastSeen = useRef(false);

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
    scrollToBottom,
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

  // Once messages loaded, find firstUnreadId and scroll appropriately
  useEffect(() => {
    if (messages.length === 0 || didFetchLastSeen.current) return;
    if (currentUser.loginType !== 'username') {
      // Non-admin: just scroll to bottom
      setTimeout(scrollToBottom, 100);
      didFetchLastSeen.current = true;
      return;
    }

    didFetchLastSeen.current = true;

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
          // MessageList will scroll to the unread divider
        } else {
          // All messages read — scroll to bottom
          setTimeout(scrollToBottom, 100);
        }
      } catch {
        // Fallback: scroll to bottom
        setTimeout(scrollToBottom, 100);
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
