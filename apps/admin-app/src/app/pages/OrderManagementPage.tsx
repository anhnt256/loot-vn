import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Table, Select, Button, Tag, App, DatePicker, Input, Tooltip, Popconfirm, Modal,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ReloadOutlined, FilterOutlined, CloseOutlined, PrinterOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  ShoppingCartOutlined, DollarOutlined,
  WalletOutlined, CreditCardOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiClient, ACCESS_TOKEN_KEY } from '@gateway-workspace/shared/utils/client';
import { io, Socket } from 'socket.io-client';
import { getCookie } from 'cookies-next';
import { useShift } from '../hooks/useShift';

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
  createdAt: string;
  details: OrderDetail[];
  statusHistory: StatusHistory[];
}

interface RevenueInfo {
  totalCompleted: number;
  completedCount: number;
}

/* ---------- constants ---------- */
const STATUS_CONFIG: Record<string, { label: string; color: string; next: string | null; nextLabel: string }> = {
  PENDING:    { label: 'Chờ xác nhận', color: 'gold',    next: 'CHAP_NHAN',  nextLabel: 'Chấp nhận' },
  CHAP_NHAN:  { label: 'Chấp nhận',   color: 'blue',    next: 'THU_TIEN',   nextLabel: 'Thu tiền' },
  THU_TIEN:   { label: 'Thu tiền',     color: 'purple',  next: 'PHUC_VU',    nextLabel: 'Phục vụ' },
  PHUC_VU:    { label: 'Phục vụ',      color: 'orange',  next: 'HOAN_THANH', nextLabel: 'Hoàn thành' },
  HOAN_THANH: { label: 'Hoàn thành',   color: 'green',   next: null,         nextLabel: '' },
  HUY:        { label: 'Đã hủy',       color: 'red',     next: null,         nextLabel: '' },
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
  return Number(v).toLocaleString('vi-VN') + ' đ';
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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [revenue, setRevenue] = useState<RevenueInfo>({ totalCompleted: 0, completedCount: 0 });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs().startOf('day'), dayjs().endOf('day'),
  ]);

  // Shift state (shared via hook)
  const { currentShift, isShiftOwner } = useShift();

  const socketRef = useRef<Socket | null>(null);

  /* ---------- data fetchers ---------- */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: pageSize };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (dateRange[0]) params.from = dateRange[0].toISOString();
      if (dateRange[1]) params.to = dateRange[1].toISOString();
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

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // WebSocket for real-time updates
  useEffect(() => {
    const tenantId = apiClient.defaults.headers.common['x-tenant-id'] as string;
    if (!tenantId) return;

    const token = getCookie(ACCESS_TOKEN_KEY) as string | undefined;
    const socket: Socket = io(`${apiClient.defaults.baseURL ?? ''}/orders`, {
      auth: { tenantId, token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('join:admin', { tenantId });
    });

    socket.on('order:new', () => fetchOrders());
    socket.on('order:status', () => fetchOrders());

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

  const handleFilterUnprocessed = () => {
    setStatusFilter('UNPROCESSED');
    setPage(1);
  };

  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setSearchText('');
    setDateRange([dayjs().startOf('day'), dayjs().endOf('day')]);
    setPage(1);
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
      width: 100,
      align: 'right' as const,
      render: (_, row) => {
        if (row.detailIndex !== 0) return { children: null, props: { rowSpan: 0 } };
        return {
          children: <span className="text-red-400 font-bold">{fmtMoney(row.order.totalAmount)}</span>,
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

        if (row.order.status === 'HOAN_THANH' || row.order.status === 'HUY') {
          return {
            children: (
              <div className="flex items-center gap-2">
                <Tag color={cfg.color}>{cfg.label}</Tag>
                <Tooltip title="In hóa đơn"><Button size="small" icon={<PrinterOutlined />} type="text" /></Tooltip>
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
                <Tooltip title={noShift ? (currentShift ? `Chỉ "${currentShift.staffName}" mới được phép xử lý đơn hàng` : 'Cần nhận ca trước khi thao tác') : undefined}>
                  <Button
                    type="primary"
                    size="small"
                    loading={isUpdating}
                    disabled={noShift}
                    onClick={() => handleUpdateStatus(row.order.id, cfg.next!)}
                    style={noShift ? {} : { background: '#22c55e', borderColor: '#22c55e' }}
                    icon={<CheckCircleOutlined />}
                  >
                    {cfg.nextLabel.toUpperCase()}
                  </Button>
                </Tooltip>
              )}
              {cfg.next && (
                <Popconfirm
                  title="Xác nhận hủy đơn hàng?"
                  onConfirm={() => handleUpdateStatus(row.order.id, 'HUY')}
                  okText="Hủy đơn"
                  cancelText="Không"
                  okButtonProps={{ danger: true }}
                  disabled={noShift}
                >
                  <Tooltip title={noShift ? (currentShift ? `Chỉ "${currentShift.staffName}" mới được phép xử lý đơn hàng` : 'Cần nhận ca trước khi thao tác') : undefined}>
                    <Button
                      danger
                      size="small"
                      disabled={isUpdating || noShift}
                      icon={<CloseCircleOutlined />}
                    >
                      HỦY
                    </Button>
                  </Tooltip>
                </Popconfirm>
              )}
              <Tooltip title="In hóa đơn">
                <Button size="small" icon={<PrinterOutlined />} type="text" />
              </Tooltip>
            </div>
          ),
          props: { rowSpan: row.detailCount },
        };
      },
    },
  ];

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
            {currentShift ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-semibold text-green-400">Đang nhận đơn</span>
                </div>
                <div className="text-white text-base font-bold">
                  {currentShift.staffName}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  Nhận ca lúc {dayjs(currentShift.startedAt).format('HH:mm - DD/MM/YYYY')}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold mb-1 text-yellow-400">
                  Chưa nhận ca
                </div>
                <div className="text-gray-500 text-xs">
                  Bấm "NHẬN CA" trên thanh header để bắt đầu ca làm việc
                </div>
              </>
            )}
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
            value={dateRange as any}
            onChange={(dates) => {
              setDateRange(dates ? [dates[0], dates[1]] : [null, null]);
              setPage(1);
            }}
            format="DD/MM/YYYY"
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
    </div>
  );
};

export default OrderManagementPage;
