import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChatMessage, ChatUser, MessageType } from './types';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore?: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  currentUser?: ChatUser;
  isAdminChat?: boolean;
  /** Called when a message scrolls into view — used for mark-seen */
  onMessageVisible?: (messageId: number) => void;
  /** ID of the first unread message — used to show divider */
  firstUnreadId?: number;
}

function formatTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '--:--';
  }
}

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const dateStr = d.toISOString().split('T')[0];
    const nowStr = now.toISOString().split('T')[0];

    if (dateStr === nowStr) return 'Hôm nay';

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Hôm qua';

    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return '';
  }
}

function resolveStaffType(message: ChatMessage, currentUser?: ChatUser): string | null {
  // Current user's own message
  if (currentUser && message.userId === currentUser.userId) {
    return currentUser.staffType || null;
  }
  // From DB JOIN
  return message.staffType || null;
}

function getMessageType(
  message: ChatMessage,
  currentUser?: ChatUser,
): MessageType {
  const staffType = resolveStaffType(message, currentUser);

  // Staff/admin messages (has staffId or staffType)
  if (staffType) {
    if (staffType === 'SUPER_ADMIN' || staffType === 'MANAGER') return 'super-admin';
    if (staffType === 'BRANCH_ADMIN') return 'branch-admin';
    return 'staff';
  }
  // Current user (client)
  if (currentUser && message.userId === currentUser.userId) {
    return 'current-user';
  }
  // Has staffId but no staffType resolved
  if (message.staffId) return 'staff';
  // Regular user
  if (message.userId) return 'user';
  return 'system';
}

const STAFF_TYPE_LABELS: Record<string, string> = {
  STAFF: 'Nhân viên',
  KITCHEN: 'Bếp',
  SECURITY: 'Bảo vệ',
  CASHIER: 'Thu ngân',
  MANAGER: 'Quản lý',
  SUPER_ADMIN: 'Super Admin',
  BRANCH_ADMIN: 'Admin',
};

function getMessageSender(
  message: ChatMessage,
  currentUser?: ChatUser,
): string {
  const staffType = resolveStaffType(message, currentUser);
  const roleLabel = staffType ? STAFF_TYPE_LABELS[staffType] : null;

  let name: string;
  if (currentUser && message.userId === currentUser.userId) {
    name = currentUser.userName || currentUser.machineName || 'Bạn';
  } else {
    name = message.userName || message.machineName || 'User';
  }

  return roleLabel ? `${name} (${roleLabel})` : name;
}

const MESSAGE_COLORS: Record<
  MessageType,
  { bg: string; text: string; time: string; sender: string }
> = {
  'super-admin': { bg: 'bg-pink-500/25', text: 'text-pink-100', time: 'text-pink-300', sender: 'text-pink-400' },
  'branch-admin': { bg: 'bg-cyan-500/25', text: 'text-cyan-100', time: 'text-cyan-300', sender: 'text-cyan-400' },
  staff: { bg: 'bg-orange-500/25', text: 'text-orange-100', time: 'text-orange-300', sender: 'text-orange-400' },
  'current-user': { bg: 'bg-green-500/25', text: 'text-green-100', time: 'text-green-300', sender: 'text-green-400' },
  user: { bg: 'bg-gray-600/40', text: 'text-gray-100', time: 'text-gray-400', sender: 'text-gray-300' },
  system: { bg: 'bg-yellow-500/25', text: 'text-yellow-100', time: 'text-yellow-300', sender: 'text-yellow-400' },
};

/** Single message row — reports visibility via IntersectionObserver */
function MessageRow({
  message,
  showDate,
  currentUser,
  onVisible,
}: {
  message: ChatMessage;
  showDate: boolean;
  currentUser?: ChatUser;
  onVisible?: (id: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onVisible || !ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible(message.id);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [message.id, onVisible]);

  const messageType = getMessageType(message, currentUser);
  const sender = getMessageSender(message, currentUser);
  const colors = MESSAGE_COLORS[messageType];
  const isCurrentUser = currentUser && message.userId === currentUser.userId;

  return (
    <div ref={ref}>
      {showDate && (
        <div className="text-center text-xs text-gray-400 my-1">
          {formatDate(message.createdAt)}
        </div>
      )}
      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs lg:max-w-md px-2.5 py-1.5 rounded-lg border border-white/5 ${colors.bg}`}>
          <div className={`font-bold mb-0.5 ${colors.sender}`} style={{ fontSize: '11px' }}>
            {sender}
          </div>
          <div className={`whitespace-pre-wrap font-medium ${colors.text}`} style={{ fontSize: '12px', lineHeight: '1.4' }}>
            {message.content}
          </div>
          <div className={`mt-0.5 ${colors.time}`} style={{ fontSize: '9px' }}>
            {formatTime(message.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MessageList({
  messages,
  isLoading,
  hasMore,
  onLoadMore,
  messagesEndRef,
  currentUser,
  onMessageVisible,
  firstUnreadId,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const firstUnreadRef = useRef<HTMLDivElement>(null);
  const didScrollToUnread = useRef(false);
  const prevMessageCount = useRef(0);

  const isNearBottom = () => {
    const el = listRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  const handleScroll = () => {
    if (listRef.current) {
      setShowLoadMore(listRef.current.scrollTop === 0 && hasMore);
    }
  };

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.addEventListener('scroll', handleScroll);
      return () => list.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore]);

  // Scroll to first unread on initial render
  useEffect(() => {
    if (firstUnreadId && firstUnreadRef.current && !didScrollToUnread.current) {
      didScrollToUnread.current = true;
      firstUnreadRef.current.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  }, [firstUnreadId, messages]);

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      // New message(s) added (not loading older messages which prepend)
      const added = messages.length - prevMessageCount.current;
      const isNewMessage = added > 0 && added < 5; // small batch = real-time, not pagination
      if (isNewMessage && isNearBottom()) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevMessageCount.current = messages.length;
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {showLoadMore && (
        <div className="p-2 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-xs"
          >
            {isLoading ? 'Đang tải...' : 'Tải thêm tin nhắn'}
          </button>
        </div>
      )}

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-1 space-y-1 bg-gray-900"
      >
        {messages.map((message, index) => {
          const showDate =
            index === 0 ||
            formatDate(messages[index - 1].createdAt) !==
              formatDate(message.createdAt);
          const isFirstUnread = firstUnreadId === message.id;

          return (
            <div key={message.id}>
              {/* Unread divider */}
              {isFirstUnread && (
                <div
                  ref={firstUnreadRef}
                  className="flex items-center gap-2 my-2"
                >
                  <div className="flex-1 h-px bg-red-500" />
                  <span className="text-xs text-red-400 font-medium whitespace-nowrap">
                    Tin nhắn mới
                  </span>
                  <div className="flex-1 h-px bg-red-500" />
                </div>
              )}
              <MessageRow
                message={message}
                showDate={showDate && !isFirstUnread}
                currentUser={currentUser}
                onVisible={onMessageVisible}
              />
            </div>
          );
        })}

        {isLoading && messages.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            Đang tải tin nhắn...
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
