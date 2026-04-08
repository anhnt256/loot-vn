import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Table, Button, Tag, App, DatePicker, Input, Modal, Select,
  Card, Statistic, Row, Col, Space, Popconfirm, Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
  GiftOutlined, ClockCircleOutlined,
  CoffeeOutlined, ShoppingOutlined, SwapOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiClient, getToken } from '@gateway-workspace/shared/utils/client';
import { io, Socket } from 'socket.io-client';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

/* ---------- types ---------- */

interface Redemption {
  id: number;
  userId: number;
  promotionRewardId: number;
  starsCost: number;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  rewardType: string;
  chosenRecipeId?: number;
  chosenQuantity?: number;
  walletType?: string;
  moneyAmount?: number;
  actualCost?: number;
  workShiftId?: number;
  approvedBy?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  rewardName?: string;
  prType?: string;
  recipeName?: string;
  userName?: string;
}

/* ---------- constants ---------- */

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Chờ duyệt',   color: 'gold' },
  COMPLETED: { label: 'Đã duyệt',    color: 'green' },
  REJECTED:  { label: 'Từ chối',      color: 'red' },
};

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PLAY_TIME: { label: 'Giờ chơi',  color: 'blue',    icon: <ClockCircleOutlined /> },
  FOOD:      { label: 'Đồ ăn',     color: 'orange',  icon: <ShoppingOutlined /> },
  DRINK:     { label: 'Đồ uống',   color: 'green',   icon: <CoffeeOutlined /> },
  VOUCHER:   { label: 'Voucher',    color: 'purple',  icon: <GiftOutlined /> },
  OTHER:     { label: 'Khác',       color: 'default', icon: <GiftOutlined /> },
};

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'COMPLETED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
];

/* ---------- component ---------- */

const RewardExchangeManagementPage: React.FC = () => {
  const { message } = App.useApp();

  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('day'), dayjs().endOf('day'),
  ]);

  // Preload audio after first user interaction (browser autoplay policy)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const unlock = () => {
      if (!audioRef.current) {
        const audio = new Audio('/doi_thuong.mp3');
        audio.volume = 1;
        audio.load();
        audioRef.current = audio;
      }
      document.removeEventListener('click', unlock);
    };
    document.addEventListener('click', unlock);
    return () => document.removeEventListener('click', unlock);
  }, []);

  // Reject modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  // Stats
  const [stats, setStats] = useState({ PENDING: 0, COMPLETED: 0, REJECTED: 0 });

  // ── Fetch ──
  const fetchRedemptions = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (dateRange[0]) params.from = dateRange[0].format('YYYY-MM-DD');
      if (dateRange[1]) params.to = dateRange[1].format('YYYY-MM-DD');
      const res = await apiClient.get<Redemption[]>('/promotion-reward/redemptions', { params });
      const data = (res.data || []).map((r: any) => ({
        ...r,
        id: Number(r.id),
        userId: Number(r.userId),
        starsCost: Number(r.starsCost),
        promotionRewardId: Number(r.promotionRewardId),
        actualCost: r.actualCost ? Number(r.actualCost) : null,
        moneyAmount: r.moneyAmount ? Number(r.moneyAmount) : null,
      }));
      setRedemptions(data);

      const counts = { PENDING: 0, COMPLETED: 0, REJECTED: 0 };
      data.forEach((r: Redemption) => {
        const key = r.status === 'APPROVED' ? 'COMPLETED' : r.status;
        if (key in counts) counts[key as keyof typeof counts]++;
      });
      setStats(counts);
    } catch {
      message.error('Lỗi tải danh sách yêu cầu đổi thưởng');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateRange, message]);

  useEffect(() => { fetchRedemptions(); }, [fetchRedemptions]);

  // Keep a ref so socket callback always calls latest fetch
  const fetchRef = useRef(fetchRedemptions);
  fetchRef.current = fetchRedemptions;

  // Socket.IO for real-time updates
  useEffect(() => {
    const tenantId = apiClient.defaults.headers.common['x-tenant-id'] as string;
    if (!tenantId) return;

    const token = getToken();
    const socket: Socket = io(`${apiClient.defaults.baseURL ?? ''}/redemptions`, {
      auth: { tenantId, token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('join:admin', { tenantId });
    });

    socket.on('redemption:new', () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      fetchRef.current();
    });
    socket.on('redemption:status', () => fetchRef.current());

    return () => { socket.disconnect(); };
  }, []);

  // ── Actions ──

  const handleApprove = async (id: number) => {
    try {
      await apiClient.patch(`/promotion-reward/redemptions/${id}/approve`, {});
      message.success('Đã duyệt yêu cầu');
      fetchRedemptions();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi khi duyệt');
    }
  };

  const openRejectModal = (id: number) => {
    setRejectingId(id);
    setRejectNote('');
    setRejectModalVisible(true);
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      await apiClient.patch(`/promotion-reward/redemptions/${rejectingId}/reject`, { note: rejectNote || undefined });
      message.success('Đã từ chối yêu cầu');
      setRejectModalVisible(false);
      fetchRedemptions();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi khi từ chối');
    }
  };

  // ── Columns ──

  const columns: ColumnsType<Redemption> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'User',
      key: 'user',
      width: 140,
      render: (_: any, record: Redemption) => (
        <div>
          <div className="font-medium">{record.userName || 'N/A'}</div>
          <div className="text-xs text-gray-400">ID: {record.userId}</div>
        </div>
      ),
    },
    {
      title: 'Phần thưởng',
      dataIndex: 'rewardName',
      key: 'rewardName',
      ellipsis: true,
      render: (name: string, record: Redemption) => (
        <div>
          <div className="font-medium">{name || `#${record.promotionRewardId}`}</div>
          {record.recipeName && (
            <div className="text-xs text-gray-400">Món: {record.recipeName}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'rewardType',
      key: 'rewardType',
      width: 110,
      render: (type: string) => {
        const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.OTHER;
        return <Tag icon={cfg.icon} color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Sao',
      dataIndex: 'starsCost',
      key: 'starsCost',
      width: 80,
      align: 'right',
      render: (v: number) => <span className="font-medium text-yellow-400">{v?.toLocaleString()}</span>,
    },
    {
      title: 'Giá trị',
      key: 'value',
      width: 120,
      align: 'right',
      render: (_: any, record: Redemption) => {
        if (record.moneyAmount) return <span>{Number(record.moneyAmount).toLocaleString()} VND</span>;
        if (record.actualCost) return <span>{Number(record.actualCost).toLocaleString()} VND</span>;
        return '-';
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const cfg = STATUS_CONFIG[status] || { label: status, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 150,
      ellipsis: true,
      render: (note: string) => note || '-',
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (d: string) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_: any, record: Redemption) => {
        if (record.status === 'PENDING') {
          return (
            <Space size="small">
              <Popconfirm title="Duyệt yêu cầu này?" onConfirm={() => handleApprove(record.id)} okText="Duyệt" cancelText="Hủy">
                <Button type="primary" size="small" icon={<CheckCircleOutlined />} style={{ background: '#22c55e' }}>
                  Duyệt
                </Button>
              </Popconfirm>
              <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => openRejectModal(record.id)}>
                Từ chối
              </Button>
            </Space>
          );
        }
        return <span className="text-gray-500 text-xs">-</span>;
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white m-0">
          <SwapOutlined className="mr-2" />
          Quản lý đổi thưởng
        </h2>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic title="Chờ duyệt" value={stats.PENDING} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic title="Đã duyệt" value={stats.COMPLETED} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic title="Từ chối" value={stats.REJECTED} valueStyle={{ color: '#ff4d4f' }} prefix={<CloseCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTER_OPTIONS}
          style={{ width: 180 }}
          placeholder="Trạng thái"
        />
        <RangePicker
          value={dateRange}
          onChange={(dates: any) => {
            if (dates && dates[0] && dates[1]) setDateRange([dates[0], dates[1]]);
          }}
          format="DD/MM/YYYY"
          style={{ width: 260 }}
        />
        <Button icon={<ReloadOutlined />} onClick={fetchRedemptions}>Làm mới</Button>
        {stats.PENDING > 0 && (
          <Badge count={stats.PENDING} overflowCount={99}>
            <Tag color="gold">đang chờ duyệt</Tag>
          </Badge>
        )}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={redemptions}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20, showTotal: (t) => `Tổng: ${t}` }}
        scroll={{ x: 1200 }}
        size="small"
      />

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu đổi thưởng"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={handleReject}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <div className="space-y-3">
          <p className="text-gray-400">Nhập lý do từ chối (tùy chọn):</p>
          <TextArea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Lý do từ chối..."
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
};

export default RewardExchangeManagementPage;
