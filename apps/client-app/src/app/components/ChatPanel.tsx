import React, { useEffect, useRef, useState } from 'react';
import { App } from 'antd';
import { io, Socket } from 'socket.io-client';
import { apiClient, ACCESS_TOKEN_KEY, getCookie } from '@gateway-workspace/shared/utils/client';
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';

interface ChatMessage {
  id: number;
  sender: string;
  content: string;
  createdAt: string;
  isStaff?: boolean;
}

interface FoodOrder {
  id: number;
  status: string | null;
  totalAmount: number;
  createdAt: string;
  details: {
    id: number;
    recipeName: string;
    salePrice: number;
    quantity: number;
    subtotal: number;
    note: string | null;
  }[];
}

interface Props {
  machineName?: string;
  defaultTab?: 'chat' | 'cart';
}

const ORDER_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:    { label: 'Chờ xác nhận', color: '#f59e0b' },
  CHAP_NHAN:  { label: 'Chấp nhận',    color: '#3b82f6' },
  THU_TIEN:   { label: 'Thu tiền',     color: '#a855f7' },
  PHUC_VU:    { label: 'Phục vụ',      color: '#f97316' },
  HOAN_THANH: { label: 'Hoàn thành',   color: '#22c55e' },
  HUY:        { label: 'Đã hủy',       color: '#ef4444' },
};

function getStatusInfo(status: string | null) {
  if (!status) return { label: 'Đang chờ xác nhận', color: '#f59e0b' };
  return ORDER_STATUS_LABEL[status] ?? { label: status, color: '#9ca3af' };
}

const ChatPanel: React.FC<Props> = ({ machineName, defaultTab = 'chat' }) => {
  const { notification } = App.useApp();
  const [activeTab, setActiveTab] = useState<'chat' | 'cart'>(defaultTab);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { cart, setCart, clearCart } = useCart();

  const handleChangeQty = (idx: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[idx].quantity + delta;
      if (newQty <= 0) {
        updated.splice(idx, 1);
      } else {
        updated[idx] = { ...updated[idx], quantity: newQty };
      }
      return updated;
    });
  };

  const handleRemoveItem = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [orderIdx, setOrderIdx] = useState(0);
  const [pauseInfo, setPauseInfo] = useState<{ resumeAt: string; note: string | null } | null>(null);
  const [pauseCountdown, setPauseCountdown] = useState('');
  const currentOrder = orders[orderIdx] ?? null;
  const latestOrder = orders[0] ?? null;
  const isOrderActive = !!(latestOrder &&
    latestOrder.status !== 'HOAN_THANH' &&
    latestOrder.status !== 'HUY');
  const socketRef = useRef<Socket | null>(null);
  const activeOrderIdRef = useRef<number | null>(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const fetchCurrentOrder = async () => {
    try {
      const res = await apiClient.get('/dashboard/orders');
      const list: FoodOrder[] = res.data?.data ?? [];
      setOrders(list);
      setOrderIdx(0);
      return list;
    } catch {
      return [];
    }
  };

  // Kết nối WebSocket + fetch đơn active khi mount
  useEffect(() => {
    const tenantId = (apiClient.defaults.headers.common['x-tenant-id'] as string) ?? '';
    const token = getCookie(ACCESS_TOKEN_KEY) as string | undefined;

    const socket: Socket = io(`${apiClient.defaults.baseURL ?? ''}/orders`, {
      auth: { tenantId, token },
      transports: ['websocket'],
    });

    socket.on('connect', async () => {
      // Fetch đơn hiện tại và join room của đơn active
      const list = await fetchCurrentOrder();
      const active = list.find(
        (o) => o.status !== 'HOAN_THANH' && o.status !== 'HUY',
      );
      if (active) {
        activeOrderIdRef.current = active.id;
        socket.emit('join:order', { orderId: active.id });
      }
      // Fetch trạng thái pause hiện tại
      try {
        const res = await apiClient.get('/admin/orders/pause-status');
        if (res.data?.paused) {
          setPauseInfo({ resumeAt: res.data.resumeAt, note: res.data.note ?? null });
        }
      } catch { /* silent */ }
    });

    // Nhận cập nhật status real-time từ admin
    socket.on('order:status', (data: { orderId: number; status: string; changedAt: string }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === data.orderId ? { ...o, status: data.status } : o,
        ),
      );
    });

    // Nhận thông báo ngưng/mở nhận đơn
    socket.on('order:pause', (data: { resumeAt: string; note: string | null }) => {
      setPauseInfo(data);
    });
    socket.on('order:resume', () => {
      setPauseInfo(null);
      setPauseCountdown('');
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, []);

  // Đếm ngược thời gian mở lại nhận đơn
  useEffect(() => {
    if (!pauseInfo?.resumeAt) { setPauseCountdown(''); return; }
    const tick = () => {
      const diff = new Date(pauseInfo.resumeAt).getTime() - Date.now();
      if (diff <= 0) { setPauseInfo(null); setPauseCountdown(''); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setPauseCountdown(h > 0 ? `${h}g ${m}p ${s}s` : m > 0 ? `${m}p ${s}s` : `${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [pauseInfo]);

  const fetchMessages = async () => {
    try {
      const res = await apiClient.get('/dashboard/chat/messages');
      if (res.data?.data) setMessages(res.data.data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await apiClient.post('/dashboard/chat/messages', {
        content: text,
        userId: user?.userId || user?.id,
      });
      setInput('');
      await fetchMessages();
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const handleCheckout = async () => {
    if (checkingOut || cart.length === 0) return;
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const res = await apiClient.post('/dashboard/checkout', { cart });
      await clearCart();
      const list = await fetchCurrentOrder();
      // Join WebSocket room của đơn mới để nhận status update
      const newOrder = res.data?.data ?? list[0];
      if (newOrder?.id && socketRef.current) {
        activeOrderIdRef.current = newOrder.id;
        socketRef.current.emit('join:order', { orderId: newOrder.id });
      }
      notification.success({
        message: 'Đặt hàng thành công!',
        description: 'Đơn hàng của bạn đang được xử lý. Vui lòng chờ trong giây lát.',
        placement: 'topRight',
        duration: 4,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Đặt hàng thất bại, vui lòng thử lại';
      setCheckoutError(msg);
    } finally {
      setCheckingOut(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex-shrink-0 bg-gray-900 px-3 pt-3 pb-0">
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('chat')}
            className="flex-1 py-2 text-sm font-semibold rounded-md transition-all"
            style={activeTab === 'chat'
              ? { background: 'var(--primary-color)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }
              : { color: '#9ca3af' }}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className="flex-1 py-2 text-sm font-semibold rounded-md transition-all relative"
            style={activeTab === 'cart'
              ? { background: 'var(--secondary-color)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }
              : { color: '#9ca3af' }}
          >
            🛒 Giỏ hàng{cart.length > 0 ? ` (${cart.length})` : ''}
            {isOrderActive && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse"
                style={{ background: getStatusInfo(currentOrder!.status).color }}
              />
            )}
          </button>
        </div>

        {activeTab === 'chat' && (
          <div className="px-1 pt-2 pb-2 border-b border-gray-700 mt-1">
            <p className="font-semibold text-white text-sm">Chat - Máy {machineName || '—'}</p>
            <p className="text-gray-400 text-xs">{onlineCount} người đang online</p>
          </div>
        )}
      </div>

      {activeTab === 'chat' ? (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 bg-gray-900">
            {messages.length === 0 && (
              <p className="text-gray-500 text-xs text-center mt-4">Chưa có tin nhắn</p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="text-xs">
                <div className={`inline-block max-w-full rounded px-2 py-1 ${msg.isStaff ? 'bg-gray-700 border border-gray-600' : 'bg-gray-800 border border-gray-700'}`}>
                  <span className={`font-semibold ${msg.isStaff ? 'text-primary' : 'text-gray-300'}`}>
                    {msg.sender}
                  </span>
                  <span className="text-gray-500 ml-1">{formatTime(msg.createdAt)}</span>
                  <p className="text-gray-200 mt-0.5 whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-700 px-2 py-2 flex-shrink-0 bg-gray-800">
            <div className="flex gap-1 items-center">
              <input
                className="flex-1 text-xs bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-500 rounded px-2 py-1.5 outline-none focus:border-gray-400"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="btn-primary text-xs disabled:opacity-50 px-2 py-1.5 rounded transition-colors"
              >
                Gửi
              </button>
            </div>
            <p className="text-gray-500 text-[10px] mt-1">
              Nhấn Enter để gửi. Shift+Enter để xuống dòng
            </p>
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-0 bg-gray-900 flex flex-col overflow-hidden">

          {/* ── PHẦN TRÊN: Giỏ hàng (55%) ── */}
          <div className="flex flex-col border-b border-gray-700" style={{ flex: '5.5 1 0', minHeight: 0 }}>

            {/* Banner ngưng nhận đơn — luôn hiển thị khi paused */}
            {pauseInfo ? (
              <div
                className="flex-shrink-0 mx-3 mt-2.5 mb-1 rounded-xl px-3 py-2.5 flex flex-col gap-1.5"
                style={{ background: 'linear-gradient(135deg, #431407, #451a03)', border: '1px solid #b45309' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">⏸</span>
                  <div>
                    <p className="text-orange-200 text-xs font-bold leading-tight">Tạm ngưng nhận đơn hàng</p>
                    {pauseInfo.note && (
                      <p className="text-orange-400 text-[10px] mt-0.5">{pauseInfo.note}</p>
                    )}
                  </div>
                </div>
                <div
                  className="flex items-center justify-between rounded-lg px-3 py-1.5"
                  style={{ background: 'rgba(0,0,0,0.3)' }}
                >
                  <span className="text-orange-300/80 text-[10px]">Có thể đặt hàng sau:</span>
                  <span
                    className="font-mono font-bold text-sm tracking-wider"
                    style={{ color: '#fde68a', textShadow: '0 0 8px rgba(253,230,138,0.5)' }}
                  >
                    {pauseCountdown || '—'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 flex-shrink-0">
                <span className="text-gray-300 text-xs font-semibold uppercase tracking-wide">
                  🛒 Giỏ hàng{cart.length > 0 ? ` (${cart.length})` : ''}
                </span>
              </div>
            )}

            {cart.length === 0 ? (
              <p className="text-gray-600 text-xs text-center py-3">Chưa có món nào</p>
            ) : (
              <>
                <div className="overflow-y-auto px-3 pb-2 space-y-2" style={{ minHeight: 0 }}>
                  {cart.map((cartItem, idx) => {
                    const imgSrc = cartItem.item.imageUrl
                      ? `${apiClient.defaults.baseURL ?? ''}${cartItem.item.imageUrl}`
                      : null;
                    const subtotal = cartItem.item.salePrice * cartItem.quantity;
                    return (
                      <div key={idx} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden flex gap-2.5 p-2">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
                          {imgSrc ? (
                            <img src={imgSrc} alt={cartItem.item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-[9px]">NO IMG</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-white font-bold text-xs uppercase leading-tight line-clamp-2 flex-1">{cartItem.item.name}</p>
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-900/40 transition-all cursor-pointer text-[10px]"
                            >✕</button>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleChangeQty(idx, -1)} className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer" style={{ background: '#374151', color: '#d1d5db' }}>−</button>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', color: '#fff' }}>x{cartItem.quantity}</span>
                              <button onClick={() => handleChangeQty(idx, 1)} className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer" style={{ background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', color: '#fff' }}>+</button>
                            </div>
                            <p className="text-pink-400 font-semibold text-[10px]">{subtotal > 0 ? `${subtotal.toLocaleString('vi-VN')}đ` : '0đ'}</p>
                          </div>
                          {cartItem.note && (
                            <p className="text-gray-400 text-[10px] mt-1 truncate">Ghi chú: {cartItem.note}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex-shrink-0 px-3 pb-3 pt-1.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs font-medium">Tổng cộng</span>
                    <span className="font-bold text-sm text-pink-400">
                      {cart.reduce((sum, ci) => sum + ci.item.salePrice * ci.quantity, 0).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  {checkoutError && <p className="text-red-400 text-[10px] text-center">{checkoutError}</p>}
                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut || !!pauseInfo}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all cursor-pointer hover:opacity-90 active:scale-95 disabled:cursor-not-allowed"
                    style={pauseInfo
                      ? { background: '#374151', opacity: 0.7 }
                      : { background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))' }
                    }
                  >
                    {checkingOut
                      ? 'Đang xử lý...'
                      : pauseInfo
                        ? `⏸ Mở lại sau ${pauseCountdown}`
                        : 'Đặt hàng'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── PHẦN DƯỚI: Đơn hàng (45%) ── */}
          <div className="flex flex-col" style={{ flex: '4.5 1 0', minHeight: 0 }}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-300 text-xs font-semibold uppercase tracking-wide">📋 Đơn hàng</span>
                {currentOrder && (
                  <span className="text-gray-500 text-xs">#{currentOrder.id}</span>
                )}
              </div>
              {currentOrder && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: `${getStatusInfo(currentOrder.status).color}22`,
                    color: getStatusInfo(currentOrder.status).color,
                    border: `1px solid ${getStatusInfo(currentOrder.status).color}55`,
                  }}
                >
                  {getStatusInfo(currentOrder.status).label}
                </span>
              )}
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              {!currentOrder ? (
                <p className="text-gray-600 text-xs text-center py-3">Chưa có đơn hàng nào</p>
              ) : (
                <>
                  <p className="px-3 text-gray-600 text-[10px] mb-1.5 flex-shrink-0">
                    {formatTime(currentOrder.createdAt)} · {currentOrder.details.reduce((sum, d) => sum + d.quantity, 0)} món
                    {orderIdx === 0 && isOrderActive && <span className="ml-1 animate-pulse">· đang cập nhật</span>}
                  </p>
                  <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5" style={{ minHeight: 0 }}>
                    {currentOrder.details.map((d) => (
                      <div key={d.id} className="bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-2 flex justify-between items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[10px] font-semibold uppercase leading-tight">{d.recipeName}</p>
                          {d.note && <p className="text-gray-500 text-[10px] mt-0.5 truncate">Ghi chú: {d.note}</p>}
                        </div>
                        <span className="text-gray-400 text-[10px] flex-shrink-0">x{d.quantity}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Prev / Next — fixed at bottom, large touch targets */}
            {orders.length > 1 && (
              <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-t border-gray-700 bg-gray-900">
                <button
                  onClick={() => setOrderIdx((i) => Math.min(i + 1, orders.length - 1))}
                  disabled={orderIdx >= orders.length - 1}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: '#1f2937', color: '#d1d5db', border: '1px solid #374151' }}
                >
                  ◀ Trước
                </button>
                <span className="text-gray-400 text-xs font-bold min-w-[40px] text-center">
                  {orderIdx + 1}/{orders.length}
                </span>
                <button
                  onClick={() => setOrderIdx((i) => Math.max(i - 1, 0))}
                  disabled={orderIdx <= 0}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: '#1f2937', color: '#d1d5db', border: '1px solid #374151' }}
                >
                  Sau ▶
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default ChatPanel;
