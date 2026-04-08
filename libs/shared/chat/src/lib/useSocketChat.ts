import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from './types';

interface UseSocketChatOptions {
  serverUrl: string;
  tenantId: string;
  token?: string;
  userId?: number;
  machineName?: string;
  staffId?: number;
  loginType?: string;
  /** Only connect socket when true (default true) */
  enabled?: boolean;
  onError?: (error: string) => void;
}

export function useSocketChat({
  serverUrl,
  tenantId,
  token,
  userId,
  machineName,
  staffId,
  loginType,
  enabled = true,
  onError,
}: UseSocketChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [onlineCount, setOnlineCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const initialLoadDone = useRef(false);

  // Connect Socket.IO
  useEffect(() => {
    if (!tenantId || !serverUrl || !enabled) return;

    const socket = io(`${serverUrl}/chat`, {
      auth: { tenantId, token, userId, machineName, staffId, loginType },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('chat:message', (message: ChatMessage) => {
      setMessages((prev) => {
        // Deduplicate by message ID (server may emit directly + via Redis)
        if (message.id && prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socket.on('chat:online_count', (data: { count: number }) => {
      setOnlineCount(data.count);
    });

    socket.on('chat:unread_count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    socket.on('connect_error', () => {
      onError?.('Kết nối thất bại');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl, tenantId, token, userId, machineName, staffId, loginType, enabled]);

  // Load messages via REST
  const loadMessages = useCallback(
    async (page: number, append: boolean) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const baseUrl = serverUrl.replace(/\/$/, '');
        const endpoint =
          loginType === 'username'
            ? '/admin/chat/messages'
            : '/dashboard/chat/messages';
        const res = await fetch(
          `${baseUrl}${endpoint}?page=${page}&limit=50`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
              'x-tenant-id': tenantId,
            },
          },
        );
        const result = await res.json();
        if (result.statusCode === 200) {
          const { messages: newMessages, hasNext } = result.data;
          setHasMore(hasNext);
          setMessages((prev) =>
            append ? [...newMessages, ...prev] : newMessages,
          );
          setCurrentPage(page);
        }
      } catch {
        onError?.('Tải tin nhắn thất bại');
      } finally {
        setIsLoading(false);
      }
    },
    [serverUrl, tenantId, token, loginType, isLoading],
  );

  // Initial load — only once when enabled
  useEffect(() => {
    if (tenantId && serverUrl && enabled && !initialLoadDone.current) {
      initialLoadDone.current = true;
      loadMessages(1, false);
    }
  }, [tenantId, serverUrl, enabled]);

  // Reset initialLoadDone when disabled
  useEffect(() => {
    if (!enabled) {
      initialLoadDone.current = false;
    }
  }, [enabled]);

  // Send message via Socket.IO
  const sendMessage = useCallback(
    async (content: string) => {
      if (isSending || !content.trim() || !socketRef.current) return;
      setIsSending(true);
      try {
        socketRef.current.emit(
          'chat:send',
          { content: content.trim(), machineName, userId, staffId },
          (response: any) => {
            if (response?.error) {
              onError?.(response.error);
            }
            setIsSending(false);
          },
        );
      } catch {
        onError?.('Gửi tin nhắn thất bại');
        setIsSending(false);
      }
    },
    [isSending, machineName, userId, staffId],
  );

  // Mark message as seen
  const markSeen = useCallback(
    (messageId: number) => {
      if (!socketRef.current) return;
      socketRef.current.emit('chat:mark-seen', { messageId });
    },
    [],
  );

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMessages(currentPage + 1, true);
    }
  }, [hasMore, isLoading, currentPage, loadMessages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return {
    messages,
    isLoading,
    isSending,
    isConnected,
    hasMore,
    onlineCount,
    unreadCount,
    sendMessage,
    markSeen,
    loadMore,
    scrollToBottom,
    messagesEndRef,
  };
}
