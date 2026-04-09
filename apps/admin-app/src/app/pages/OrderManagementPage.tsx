import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Table, Select, Button, Tag, App, DatePicker, Input, Tooltip, Modal,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ReloadOutlined, FilterOutlined, CloseOutlined, PrinterOutlined,
  CheckCircleOutlined, CloseCircleOutlined, PlayCircleOutlined,
  ShoppingCartOutlined, DollarOutlined,
  WalletOutlined, CreditCardOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiClient, getToken } from '@gateway-workspace/shared/utils/client';
import { io, Socket } from 'socket.io-client';

import { useShift } from '../hooks/useShift';
import { useShiftGuard } from '../hooks/useShiftGuard';
import { printReceipt, usePrinterStore } from '../services/print';
import type { ReceiptData } from '../services/print';

/* ---------- types ---------- */
interface OrderDetail {
  id: number;
  recipeName: string;
  quantity: number;
  salePrice: number;
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
  discountAmount: number | null;
  campaignId: number | null;
  createdAt: string;
  details: OrderDetail[];
  statusHistory: StatusHistory[];
}

interface RevenueInfo {
  totalCompleted: number;
  completedCount: number;
}

/* ---------- constants ---------- */
const STATUS_CONFIG: Record<string, { label: string; color: string; btnColor: string; next: string | null; nextLabel: string }> = {
  PENDING:    { label: 'Chờ xác nhận', color: 'gold',    btnColor: '#2563eb', next: 'CHAP_NHAN',  nextLabel: 'Chấp nhận' },
  CHAP_NHAN:  { label: 'Chấp nhận',   color: 'blue',    btnColor: '#7c3aed', next: 'THU_TIEN',   nextLabel: 'Thu tiền' },
  THU_TIEN:   { label: 'Thu tiền',     color: 'purple',  btnColor: '#ea580c', next: 'PHUC_VU',    nextLabel: 'Phục vụ' },
  PHUC_VU:    { label: 'Phục vụ',      color: 'orange',  btnColor: '#16a34a', next: 'HOAN_THANH', nextLabel: 'Hoàn thành' },
  HOAN_THANH: { label: 'Hoàn thành',   color: 'green',   btnColor: '#22c55e', next: null,         nextLabel: '' },
  HUY:        { label: 'Đã hủy',       color: 'red',     btnColor: '#dc2626', next: null,         nextLabel: '' },
};

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'UNPROCESSED', label: 'Chưa xử lý' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CHAP_NHAN', label: 'Chấp nhận' },
  { value: 'THU_TIEN', label: 'Thu tiền' },
  { value: 'PHUC_VU', label: 'Phục vụ' },
  { value: 'HOAN_THANH', label: 'Hoàn thành' },
  { value: 'HUY', label: 'Đã hủy' },
];

function statusLabel(s: string | null) {
  if (!s) return STATUS_CONFIG['PENDING'];
  return STATUS_CONFIG[s] ?? { label: s, color: 'default', next: null, nextLabel: '' };
}

function fmtMoney(v: number | string) {
  return `${Number(v).toLocaleString('vi-VN')  } đ`;
}

/* ---------- flattened row for table ---------- */
interface TableRow {
  key: string;
  orderId: number;
  order: FoodOrder;
  detail: OrderDetail;
  detailIndex: number;
  detailCount: number;
  orderIndex: number; // vị trí order (0,1,2...) để xen kẽ màu
}

const OrderManagementPage: React.FC = () => {
  const { notification, modal } = App.useApp();
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [printing, setPrinting] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [revenue, setRevenue] = useState<RevenueInfo>({ totalCompleted: 0, completedCount: 0 });
  const [startingShift, setStartingShift] = useState(false);
  const [cancelModal, setCancelModal] = useState<{ orderId: number } | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [printedOrders, setPrintedOrders] = useState<Set<number>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('loot_printed_orders') ?? '[]');
      return new Set(stored);
    } catch { return new Set(); }
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');
  // Shift state (shared via hook)
  const { currentShift, hasShift, isShiftOwner, startShift } = useShift();
  const { confirmShiftStart } = useShiftGuard();

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs().startOf('day'), dayjs(),
  ]);

  // Sync dateRange start with shift startedAt
  useEffect(() => {
    if (currentShift?.startedAt) {
      setDateRange([dayjs(currentShift.startedAt), dayjs()]);
    }
  }, [currentShift?.startedAt]);

  const socketRef = useRef<Socket | null>(null);

  /* ---------- data fetchers ---------- */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: pageSize };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (dateRange[0]) params.from = dateRange[0].toISOString();
      // Luôn dùng thời gian hiện tại cho `to` để không bỏ sót đơn mới
      params.to = dayjs().toISOString();
      if (searchText.trim()) params.search = searchText.trim();

      const res = await apiClient.get('/admin/orders/all', { params });
      setOrders(res.data?.data ?? []);
      setTotal(res.data?.total ?? 0);
      setRevenue(res.data?.revenue ?? { totalCompleted: 0, completedCount: 0 });
    } catch {
      notification.error({ message: 'Không thể tải danh sách đơn hàng', placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, dateRange, searchText]);

  // Ref để WebSocket luôn gọi fetchOrders mới nhất (tránh stale closure)
  const fetchOrdersRef = useRef(fetchOrders);
  fetchOrdersRef.current = fetchOrders;

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // WebSocket for real-time updates
  useEffect(() => {
    const tenantId = apiClient.defaults.headers.common['x-tenant-id'] as string;
    if (!tenantId) return;

    const token = getToken();
    const socket: Socket = io(`${apiClient.defaults.baseURL ?? ''}/orders`, {
      auth: { tenantId, token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('join:admin', { tenantId });
    });

    socket.on('order:new', () => fetchOrdersRef.current());
    socket.on('order:status', () => fetchOrdersRef.current());

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, []);

  /* ---------- order actions ---------- */
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdating(orderId);
    try {
      await apiClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders();
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

  const handleCancelOrder = async () => {
    if (!cancelModal || !cancelReason.trim()) return;
    setUpdating(cancelModal.orderId);
    try {
      await apiClient.patch(`/admin/orders/${cancelModal.orderId}/status`, {
        status: 'HUY',
        note: cancelReason.trim(),
      });
      await fetchOrders();
      setCancelModal(null);
      setCancelReason('');
    } catch (err: any) {
      notification.error({
        message: 'Huỷ đơn thất bại',
        description: err?.response?.data?.message ?? 'Vui lòng thử lại',
        placement: 'topRight',
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleFilterUnprocessed = () => {
    setStatusFilter('UNPROCESSED');
    setPage(1);
  };

  // Lắng nghe event từ ShiftButton khi cần filter đơn chưa hoàn thành
  useEffect(() => {
    const handler = () => {
      setStatusFilter('UNPROCESSED');
      setPage(1);
    };
    window.addEventListener('shift:filter-unfinished', handler);
    return () => window.removeEventListener('shift:filter-unfinished', handler);
  }, []);

  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setSearchText('');
    setDateRange([
      currentShift?.startedAt ? dayjs(currentShift.startedAt) : dayjs().startOf('day'),
      dayjs(),
    ]);
    setPage(1);
  };

  const handlePrint = async (orderId: number) => {
    setPrinting(orderId);
    try {
      const res = await apiClient.get(`/admin/orders/${orderId}/receipt`);
      const receiptData: ReceiptData = res.data;
      await printReceipt(receiptData);
      setPrintedOrders((prev) => {
        const next = new Set(prev).add(orderId);
        localStorage.setItem('loot_printed_orders', JSON.stringify([...next]));
        return next;
      });
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

  // Flatten orders into rows for table with rowSpan
  const tableData: TableRow[] = useMemo(() => {
    const rows: TableRow[] = [];
    orders.forEach((order, orderIndex) => {
      const details = order.details.length > 0
        ? order.details
        : [{ id: 0, recipeName: '(Không có món)', quantity: 0, salePrice: 0, subtotal: 0, note: null }];
      details.forEach((d, idx) => {
        rows.push({
          key: `${order.id}-${d.id}`,
          orderId: order.id,
          order,
          detail: d,
          detailIndex: idx,
          detailCount: details.length,
          orderIndex,
        });
      });
    });
    return rows;
  }, [orders]);

  const columns: ColumnsType<TableRow> = [
    {
      title: 'THỜI GIAN',
      width: 140,
      render: (_, row) => {
        if (row.detailIndex !== 0) return { children: null, props: { rowSpan: 0 } };
        const d = new Date(row.order.createdAt);
        return {
          children: (
            <span className="text-gray-300 text-xs">
              {String(d.getHours()).padStart(2, '0')}:{String(d.getMinutes()).padStart(2, '0')}{' '}
              {String(d.getDate()).padStart(2, '0')}/{String(d.getMonth() + 1).padStart(2, '0')}/{d.getFullYear()}
            </span>
          ),
          props: { rowSpan: row.detailCount },
        };
      },
    },
    {
      title: 'MÁY',
      width: 120,
      render: (_, row) => {
        if (row.detailIndex !== 0) return { children: null, props: { rowSpan: 0 } };
        return {
          children: (
            <span className="text-blue-400 font-semibold text-sm">
              {row.order.computerName || row.order.macAddress || '—'}
            </span>
          ),
          props: { rowSpan: row.detailCount },
        };
      },
    },
    {
      title: 'MẶT HÀNG',
      render: (_, row) => (
        <div>
          <div className="font-semibold text-gray-100 text-sm uppercase">{row.detail.recipeName}</div>
          {row.detail.note && (
            <div className="text-xs text-green-400 italic mt-0.5">
              {row.detail.note}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'SL',
      width: 60,
      align: 'center' as const,
      render: (_, row) => <span className="text-red-400 font-bold">{row.detail.quantity}</span>,
    },
    {
      title: 'TT',
      width: 100,
      align: 'right' as const,
      render: (_, row) => <span className="text-gray-300">{fmtMoney(row.detail.subtotal)}</span>,
    },
    {
      title: 'TỔNG',
      width: 130,
      align: 'right' as const,
      render: (_, row) => {
        if (row.detailIndex !== 0) return { children: null, props: { rowSpan: 0 } };
        const discount = Number(row.order.discountAmount) || 0;
        return {
          children: (
            <div>
              <span className="text-red-400 font-bold">{fmtMoney(row.order.totalAmount)}</span>
              {discount > 0 && (
                <div className="mt-0.5">
                  <span className="text-green-400 text-xs">KM −{fmtMoney(discount)} </span>
                  <span className="text-gray-500 text-xs line-through">{fmtMoney(Number(row.order.totalAmount) + discount)}</span>
                </div>
              )}
            </div>
          ),
          props: { rowSpan: row.detailCount },
        };
      },
    },
    {
      title: 'THAO TÁC',
      width: 280,
      render: (_, row) => {
        const cfg = statusLabel(row.order.status);
        const isUpdating = updating === row.order.id;

        if (row.detailIndex !== 0) {
          return { children: null, props: { rowSpan: 0 } };
        }

        const printed = printedOrders.has(row.order.id);

        if (row.order.status === 'HOAN_THANH' || row.order.status === 'HUY') {
          return {
            children: (
              <div className="flex items-center gap-2">
                <Tag color={cfg.color}>{cfg.label}</Tag>
                <Tooltip title={printed ? 'In lại bill' : 'In bill'}>
                  <Button
                    icon={<PrinterOutlined />}
                    loading={printing === row.order.id}
                    onClick={() => handlePrint(row.order.id)}
                    style={printed ? { background: '#22c55e', borderColor: '#22c55e', color: '#fff' } : {}}
                  />
                </Tooltip>
              </div>
            ),
            props: { rowSpan: row.detailCount },
          };
        }

        const noShift = !isShiftOwner;
        return {
          children: (
            <div className="flex items-center gap-2 flex-wrap">
              {cfg.next && (
                <Tooltip title={noShift ? (currentShift ? `Chỉ "${currentShift.staffName}" mới được phép xử lý đơn hàng` : 'Bạn cần Nhận ca để xử lý đơn hàng nhé') : undefined}>
                  <Button
                    type="primary"
                    loading={isUpdating}
                    disabled={noShift}
                    onClick={() => handleUpdateStatus(row.order.id, cfg.next!)}
                    style={noShift ? {} : { background: cfg.btnColor, borderColor: cfg.btnColor }}
                  >
                    {cfg.nextLabel.toUpperCase()}
                  </Button>
                </Tooltip>
              )}
              {cfg.next && (
                <Tooltip title={noShift ? (currentShift ? `Chỉ "${currentShift.staffName}" mới được phép xử lý đơn hàng` : 'Bạn cần Nhận ca để xử lý đơn hàng nhé') : undefined}>
                  <Button
                    disabled={isUpdating || noShift}
                    onClick={() => { setCancelModal({ orderId: row.order.id }); setCancelReason(''); }}
                    style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
                  >
                    HỦY
                  </Button>
                </Tooltip>
              )}
              <Tooltip title={printed ? 'In lại bill' : 'In bill'}>
                <Button
                  icon={<PrinterOutlined />}
                  loading={printing === row.order.id}
                  onClick={() => handlePrint(row.order.id)}
                  style={printed ? { background: '#22c55e', borderColor: '#22c55e', color: '#fff' } : {}}
                />
              </Tooltip>
            </div>
          ),
          props: { rowSpan: row.detailCount },
        };
      },
    },
  ];

  const handleStartShiftInline = async () => {
    const confirmed = await confirmShiftStart();
    if (!confirmed) return;
    setStartingShift(true);
    try {
      await startShift();
      notification.success({ message: 'Đã nhận ca!', placement: 'topRight' });
    } catch (err: any) {
      notification.error({
        message: err?.response?.data?.message ?? 'Không thể nhận ca',
        placement: 'topRight',
      });
    } finally {
      setStartingShift(false);
    }
  };

  // Chưa có ca nào đang hoạt động → chỉ hiển thị thông báo nhận ca
  if (!hasShift) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white m-0">Đơn Hàng</h1>
        </div>

        <div
          className="rounded-xl border flex flex-col items-center justify-center py-24"
          style={{ background: '#1f2937', borderColor: '#374151' }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#374151' }}>
            <ShoppingCartOutlined className="text-gray-500" style={{ fontSize: 28 }} />
          </div>
          <h2 className="text-lg font-semibold text-gray-300 mb-1">Chưa nhận ca</h2>
          <p className="text-sm text-gray-500 mb-6">Bạn cần nhận ca để bắt đầu xem và xử lý đơn hàng</p>
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            loading={startingShift}
            onClick={handleStartShiftInline}
            style={{ background: '#22c55e', borderColor: '#22c55e' }}
          >
            NHẬN CA
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white m-0">Đơn Hàng</h1>
        <div className="flex items-center gap-3">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchOrders}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Shift info card */}
      <div
        className="rounded-xl p-5 border"
        style={{ background: '#1f2937', borderColor: '#374151' }}
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="text-xs font-bold text-gray-400 tracking-wider mb-2">THÔNG TIN CA HIỆN TẠI</div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-semibold text-green-400">Đang nhận đơn</span>
            </div>
            <div className="text-white text-base font-bold">
              {currentShift!.staffName}
            </div>
            <div className="text-gray-400 text-xs mt-1">
              Nhận ca lúc {dayjs(currentShift!.startedAt).format('HH:mm - DD/MM/YYYY')}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#166534' }}>
                <ShoppingCartOutlined className="text-green-400 text-lg" />
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider">Doanh Thu Dịch Vụ</div>
                <div className="text-lg font-bold text-white">{fmtMoney(revenue.totalCompleted)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#9a3412' }}>
                <DollarOutlined className="text-orange-400 text-lg" />
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider">Doanh Thu Khác</div>
                <div className="text-lg font-bold text-white">0 đ</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#1e3a5f' }}>
                <WalletOutlined className="text-blue-400 text-lg" />
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider">Thanh Toán Ví Điện Tử</div>
                <div className="text-lg font-bold text-white">0 đ</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#1e3a5f' }}>
                <CreditCardOutlined className="text-blue-400 text-lg" />
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider">Hoàn Tiền Ví Điện Tử</div>
                <div className="text-lg font-bold text-white">0 đ</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl p-4 border"
        style={{ background: '#1f2937', borderColor: '#374151' }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={STATUS_OPTIONS}
            style={{ minWidth: 160 }}
            placeholder="Trạng Thái"
          />
          <Input.Search
            placeholder="Tìm theo máy hoặc món..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={() => { setPage(1); fetchOrders(); }}
            allowClear
            style={{ width: 240 }}
          />
          <DatePicker.RangePicker
            showTime={{ format: 'HH:mm' }}
            value={dateRange as any}
            onChange={(dates) => {
              setDateRange(dates ? [dates[0], dates[1]] : [null, null]);
              setPage(1);
            }}
            format="DD/MM/YYYY HH:mm"
            allowClear
          />
          <Button
            icon={<FilterOutlined />}
            onClick={handleFilterUnprocessed}
            type={statusFilter === 'UNPROCESSED' ? 'primary' : 'default'}
          >
            LỌC ĐƠN CHƯA XỬ LÝ
          </Button>
          <Button
            icon={<CloseOutlined />}
            onClick={handleClearFilters}
            type="text"
            danger
          />
        </div>
      </div>

      {/* Orders table */}
      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['20', '50', '100'],
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          showTotal: (t) => `Tổng ${t} đơn hàng`,
        }}
        bordered
        size="middle"
        scroll={{ x: 900 }}
        rowClassName={(row) => {
          const s = row.order.status;
          const base = row.orderIndex % 2 === 0 ? 'order-row-even' : 'order-row-odd';
          if (s === 'HUY') return `${base} opacity-50`;
          return base;
        }}
      />

      {/* Modal xác nhận huỷ đơn */}
      <Modal
        title="Xác nhận huỷ đơn hàng"
        open={!!cancelModal}
        onCancel={() => setCancelModal(null)}
        onOk={handleCancelOrder}
        okText="Xác nhận huỷ"
        cancelText="Đóng"
        okButtonProps={{ danger: true, disabled: !cancelReason.trim() }}
        confirmLoading={updating === cancelModal?.orderId}
      >
        <p className="mb-2">Vui lòng nhập lý do huỷ đơn hàng #{cancelModal?.orderId}:</p>
        <Input.TextArea
          rows={3}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Nhập lý do huỷ đơn..."
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default OrderManagementPage;
