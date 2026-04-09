import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Drawer, Badge, Button, Tag, Spin, Empty, App } from 'antd';
import { ShoppingOutlined, ReloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';
import { apiClient, getToken } from '@gateway-workspace/shared/utils/client';

import { useShift } from '../hooks/useShift';
import { printReceipt } from '../services/print';
import type { ReceiptData } from '../services/print';

interface OrderDetail {
  id: number;
  recipeName: string;
  quantity: number;
  subtotal: number;
  note: string | null;
}

interface StatusHistory {
  id: number;
  status: string;
  changedBy: number | null;
  note: string | null;
  changedAt: string;
}

interface FoodOrder {
  id: number;
  userId: number;
  macAddress: string;
  computerName: string | null;
  status: string | null;
  totalAmount: number;
  campaignId?: number | null;
  discountAmount?: number | null;
  createdAt: string;
  details: OrderDetail[];
  statusHistory: StatusHistory[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; btnColor: string; next: string | null; nextLabel: string }> = {
  PENDING:    { label: 'Chờ xác nhận', color: 'gold',    btnColor: '#2563eb', next: 'CHAP_NHAN',  nextLabel: 'Chấp nhận' },
  CHAP_NHAN:  { label: 'Chấp nhận',    color: 'blue',    btnColor: '#7c3aed', next: 'THU_TIEN',   nextLabel: 'Thu tiền' },
  THU_TIEN:   { label: 'Thu tiền',     color: 'purple',  btnColor: '#ea580c', next: 'PHUC_VU',    nextLabel: 'Phục vụ' },
  PHUC_VU:    { label: 'Phục vụ',      color: 'orange',  btnColor: '#16a34a', next: 'HOAN_THANH', nextLabel: 'Hoàn thành' },
  HOAN_THANH: { label: 'Hoàn thành',   color: 'green',   btnColor: '#22c55e', next: null,         nextLabel: '' },
  HUY:        { label: 'Đã hủy',       color: 'red',     btnColor: '#dc2626', next: null,         nextLabel: '' },
};

const ALL_STATUS_FILTERS = ['ALL', 'PENDING', 'CHAP_NHAN', 'THU_TIEN', 'PHUC_VU', 'HOAN_THANH'] as const;
type StatusFilter = typeof ALL_STATUS_FILTERS[number];

const FILTER_LABELS: Record<StatusFilter, string> = {
  ALL:        'Tất cả',
  PENDING:    'Chờ xác nhận',
  CHAP_NHAN:  'Chấp nhận',
  THU_TIEN:   'Thu tiền',
  PHUC_VU:    'Phục vụ',
  HOAN_THANH: 'Hoàn thành',
};

const PAGE_SIZE = 10;

function statusLabel(s: string | null) {
  if (!s) return STATUS_CONFIG['PENDING'];
  return STATUS_CONFIG[s] ?? { label: s, color: 'default', next: null, nextLabel: '' };
}

interface Props {
  tenantId: string;
}

const OrderDrawer: React.FC<Props> = ({ tenantId }) => {
  const { notification } = App.useApp();
  const [open, setOpen] = useState(false);
  const [allOrders, setAllOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [printing, setPrinting] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const { currentShift, hasShift, isShiftOwner } = useShift();
  const socketRef = useRef<Socket | null>(null);

  // Preload audio after first user interaction (browser autoplay policy)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const unlock = () => {
      if (!audioRef.current) {
        const audio = new Audio('/ting2.mp3');
        audio.volume = 1;
        audio.load();
        audioRef.current = audio;
      }
      document.removeEventListener('click', unlock);
    };
    document.addEventListener('click', unlock);
    return () => document.removeEventListener('click', unlock);
  }, []);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchOrders = async () => {
    if (!hasShift) { setAllOrders([]); return; }
    setLoading(true);
    setPage(1);
    try {
      const res = await apiClient.get('/admin/orders/all', { params: { limit: 200 } });
      setAllOrders(res.data?.data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantId) return;
    fetchOrders();

    const token = getToken();
    const socket: Socket = io(`${apiClient.defaults.baseURL ?? ''}/orders`, {
      auth: { tenantId, token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('join:admin', { tenantId });
    });

    socket.on('order:new', (order: FoodOrder) => {
      setAllOrders((prev) => {
        const exists = prev.find((o) => o.id === order.id);
        if (exists) return prev;
        return [order, ...prev];
      });
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      notification.info({
        message: `Đơn hàng mới #${order.id}`,
        description: `Máy ${order.computerName || order.macAddress} — ${Number(order.totalAmount).toLocaleString('vi-VN')}đ`,
        placement: 'topRight',
        duration: 6,
      });
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [tenantId]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // Lắng nghe event từ ShiftButton khi cần filter đơn chưa hoàn thành
  useEffect(() => {
    const handleFilterUnfinished = () => {
      setOpen(true);
      setStatusFilter('ALL');
      fetchOrders();
    };
    window.addEventListener('shift:filter-unfinished', handleFilterUnfinished);
    return () => window.removeEventListener('shift:filter-unfinished', handleFilterUnfinished);
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await apiClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      const updated: FoodOrder = res.data?.data;
      setAllOrders((prev) =>
        updated.status === 'HOAN_THANH' || updated.status === 'HUY'
          ? prev.filter((o) => o.id !== orderId)
          : prev.map((o) => (o.id === orderId ? updated : o)),
      );
    } catch (err: any) {
      notification.error({
        message: 'Cập nhật thất bại',
        description: err?.response?.data?.message ?? 'Vui lòng thử lại',
        placement: 'topRight',
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleCancel = (orderId: number) => handleUpdateStatus(orderId, 'HUY');

  const handlePrint = async (orderId: number) => {
    setPrinting(orderId);
    try {
      const res = await apiClient.get(`/admin/orders/${orderId}/receipt`);
      const receiptData: ReceiptData = res.data;
      await printReceipt(receiptData);
      notification.success({ message: 'In bill thành công!', placement: 'topRight' });
    } catch (err: any) {
      notification.error({
        message: 'In bill thất bại',
        description: err?.response?.data?.message ?? err?.message ?? 'Vui lòng thử lại',
        placement: 'topRight',
      });
    } finally {
      setPrinting(null);
    }
  };

  // Filtered + paginated
  const filtered = allOrders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    const s = o.status ?? 'PENDING';
    return s === statusFilter;
  });

  const visibleOrders = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visibleOrders.length < filtered.length;

  // Infinite scroll via IntersectionObserver
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setPage((p) => p + 1);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const pendingCount = allOrders.filter((o) => !o.status || o.status === 'PENDING' || o.status === 'CHAP_NHAN' || o.status === 'THU_TIEN' || o.status === 'PHUC_VU').length;

  // Status filter counts
  const countByStatus = (s: StatusFilter) => {
    if (s === 'ALL') return allOrders.length;
    return allOrders.filter((o) => (o.status ?? 'PENDING') === s).length;
  };

  // Khi chưa nhận ca → ẩn nút, xoá đơn cũ
  useEffect(() => {
    if (!hasShift) setAllOrders([]);
  }, [hasShift]);

  if (!hasShift) return null;

  return (
    <>
      <Badge count={pendingCount} overflowCount={99} offset={[-4, 4]}>
        <Button
          icon={<ShoppingOutlined />}
          onClick={() => { setOpen(true); fetchOrders(); }}
          type={pendingCount > 0 ? 'primary' : 'default'}
          style={pendingCount > 0 ? { animation: 'pulse 2s infinite' } : {}}
        >
          Đơn hàng
        </Button>
      </Badge>

      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span>Đơn hàng đang xử lý ({allOrders.length})</span>
            <Button size="small" icon={<ReloadOutlined />} onClick={fetchOrders} loading={loading}>
              Làm mới
            </Button>
          </div>
        }
        placement="right"
        size={500}
        open={open}
        onClose={() => setOpen(false)}
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
      >
        {/* Status filter bar */}
        <div className="px-4 pt-3 pb-2 flex-shrink-0 border-b border-gray-700 bg-gray-900">
          <div className="flex gap-2 flex-wrap">
            {ALL_STATUS_FILTERS.map((s) => {
              const count = countByStatus(s);
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border"
                  style={active
                    ? { background: '#ec4899', borderColor: '#ec4899', color: '#fff' }
                    : { background: '#1f2937', borderColor: '#374151', color: '#9ca3af' }
                  }
                >
                  {FILTER_LABELS[s]}
                  {count > 0 && (
                    <span
                      className="px-1.5 py-0 rounded-full text-[10px] font-bold"
                      style={active
                        ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                        : { background: '#374151', color: '#d1d5db' }
                      }
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable order list */}
        <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          {loading && allOrders.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <Spin />
            </div>
          ) : filtered.length === 0 ? (
            <Empty description="Không có đơn hàng nào" className="mt-12" />
          ) : (
            <div className="p-3 flex flex-col gap-3">
              {visibleOrders.map((order) => {
                const cfg = statusLabel(order.status);
                const createdAt = new Date(order.createdAt);
                const dateStr = createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' });
                const timeStr = `${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')}`;

                return (
                  <div
                    key={order.id}
                    className="rounded-xl border overflow-hidden"
                    style={{ background: '#111827', borderColor: '#1f2937' }}
                  >
                    {/* Card header */}
                    <div
                      className="flex items-center justify-between px-4 py-2.5"
                      style={{ background: '#1f2937' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">Đơn #{order.id}</span>
                        <span className="text-gray-400 text-xs">{dateStr} · {timeStr}</span>
                        {(order.computerName || order.macAddress) && (
                          <span className="text-gray-500 text-xs">· {order.computerName || order.macAddress}</span>
                        )}
                      </div>
                      <Tag color={cfg.color} style={{ margin: 0 }}>{cfg.label}</Tag>
                    </div>

                    {/* Items */}
                    <div className="px-4 py-3 space-y-1.5">
                      {order.details.map((d) => (
                        <div key={d.id} className="flex flex-col gap-0.5">
                          <div className="flex items-baseline justify-between text-sm">
                            <span className="text-gray-200 font-medium">
                              {d.recipeName}
                              <span className="text-gray-500 ml-1.5 text-xs">x{d.quantity}</span>
                            </span>
                            <span className="text-pink-400 font-semibold ml-3 flex-shrink-0">
                              {Number(d.subtotal).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          {d.note && (
                            <div className="flex items-center gap-1 text-xs text-yellow-400/90 pl-1">
                              <span className="text-yellow-500">✎</span>
                              <span>{d.note}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Total + Discount */}
                    <div className="px-4 py-2 border-t space-y-1" style={{ borderColor: '#1f2937' }}>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Tổng cộng</span>
                        <span className="text-pink-400 font-bold text-base">
                          {Number(order.totalAmount).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      {Number(order.discountAmount) > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-green-400 text-xs">KM giảm {Number(order.discountAmount).toLocaleString('vi-VN')}đ</span>
                          <span className="text-gray-500 text-xs line-through">{(Number(order.totalAmount) + Number(order.discountAmount)).toLocaleString('vi-VN')}đ</span>
                        </div>
                      )}
                    </div>

                    {/* Status history */}
                    {(order.statusHistory?.length ?? 0) > 0 && (
                      <div
                        className="px-4 py-2 space-y-1 border-t"
                        style={{ borderColor: '#1f2937', background: '#0d1117' }}
                      >
                        {(order.statusHistory ?? []).map((h) => {
                          const t = new Date(h.changedAt);
                          return (
                            <div key={h.id} className="flex items-center gap-2 text-[11px] text-gray-500">
                              <span className="font-mono text-gray-600">
                                {String(t.getHours()).padStart(2,'0')}:{String(t.getMinutes()).padStart(2,'0')}:{String(t.getSeconds()).padStart(2,'0')}
                              </span>
                              <Tag color={statusLabel(h.status).color} style={{ margin: 0, fontSize: 10, padding: '0 6px' }}>
                                {statusLabel(h.status).label}
                              </Tag>
                              {h.note && <span className="text-gray-600">{h.note}</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Actions */}
                    <div
                      className="flex items-center justify-center gap-3 px-4 py-3 border-t"
                      style={{ borderColor: '#1f2937' }}
                    >
                      {isShiftOwner ? (
                        <>
                          {cfg.next && (
                            <Button
                              type="primary"
                              loading={updating === order.id}
                              onClick={() => handleUpdateStatus(order.id, cfg.next!)}
                              style={{ background: cfg.btnColor, borderColor: cfg.btnColor, minWidth: 100 }}
                            >
                              {cfg.nextLabel.toUpperCase()}
                            </Button>
                          )}
                          {cfg.next && (
                            <Button
                              disabled={updating === order.id}
                              onClick={() => handleCancel(order.id)}
                              style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff', minWidth: 64 }}
                            >
                              HỦY
                            </Button>
                          )}
                          <Button
                            icon={<PrinterOutlined />}
                            loading={printing === order.id}
                            onClick={() => handlePrint(order.id)}
                            style={{ minWidth: 40 }}
                          />
                        </>
                      ) : (
                        <div className="text-xs text-yellow-400 w-full text-center py-1">
                          {currentShift ? `Chỉ "${currentShift.staffName}" mới được phép xử lý đơn hàng` : 'Bạn cần Nhận ca để xử lý đơn hàng nhé'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-4 flex items-center justify-center">
                {loadingMore && <Spin size="small" />}
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default OrderDrawer;
