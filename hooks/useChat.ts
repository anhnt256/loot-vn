import { useState, useEffect, useCallback, useRef } from 'react';
import { useSSE } from './useSSE';
import { parseMachineDisplayName } from '@/lib/machine-utils';

export interface ChatMessage {
  id: number;
  content: string;
  userId?: number;
  machineName: string;
  branch: string;
  createdAt: string;
  staffId?: number;
  userName?: string;
}

interface UseChatOptions {
  machineName: string;
  onError?: (error: string) => void;
}

export function useChat({ machineName, onError }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Parse machine name to get actual machine name for API calls
  const parsedMachine = parseMachineDisplayName(machineName);
  const actualMachineName = parsedMachine.name || machineName;

  // SSE URL for real-time updates (group chat - no machineName needed)
  const sseUrl = `/api/chat/subscribe?machineName=${encodeURIComponent(actualMachineName)}`;

  // Handle incoming real-time messages
  const handleMessage = useCallback((data: any) => {
    if (data.type === 'connected') {
      return;
    }

    if (data.type === 'online_count') {
      setOnlineCount(data.count);
      return;
    }

    // Add new message to the list
    setMessages(prev => [...prev, data]);
  }, []);

  // Handle SSE errors
  const handleError = useCallback((error: Event) => {
    console.error('SSE error:', error);
    onError?.('Connection error occurred');
  }, [onError]);

  // Setup SSE connection
  const { isConnected, error: sseError } = useSSE(sseUrl, {
    onMessage: handleMessage,
    onError: handleError,
  });

  // Load initial messages
  const loadMessages = useCallback(async (page: number = 1, append: boolean = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat/messages?page=${page}&limit=50`);
      const result = await response.json();

      if (result.statusCode === 200) {
        const newMessages = result.data.messages;
        setHasMore(result.data.pagination.hasNext);
        
        if (append) {
          setMessages(prev => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
        }
        setCurrentPage(page);
      } else {
        onError?.(result.message || 'Failed to load messages');
      }
    } catch (error) {
      onError?.('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [actualMachineName, onError]);

  // Send a new message
  const sendMessage = useCallback(async (content: string, staffId?: number) => {
    if (isSending || !content.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          machineName: actualMachineName,
          staffId,
        }),
      });

      const result = await response.json();

      if (result.statusCode === 200) {
        // Message will be added via SSE, no need to add manually
      } else {
        onError?.(result.message || 'Failed to send message');
      }
    } catch (error) {
      onError?.('Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [actualMachineName, isSending, onError]);

  // Load more messages (for pagination)
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMessages(currentPage + 1, true);
    }
  }, [hasMore, isLoading, currentPage, actualMachineName, onError]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load initial messages on mount
  useEffect(() => {
    if (machineName) {
      loadMessages(1, false);
    }
  }, [actualMachineName]);

  // Handle SSE connection errors
  useEffect(() => {
    if (sseError) {
      onError?.(sseError);
    }
  }, [sseError, onError]);

  return {
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
  };
}
