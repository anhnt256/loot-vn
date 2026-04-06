import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Table, Select, Button, Tag, App, DatePicker, Input, Drawer, Space, Card,
  Statistic, Row, Col, Image, Rate, Timeline,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ReloadOutlined, SearchOutlined, CloseOutlined, MessageOutlined,
  ToolOutlined, CheckCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiClient } from '@gateway-workspace/shared/utils/client';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

/* ---------- constants ---------- */
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SUBMITTED:  { label: 'Đã gửi',      color: 'gold' },
  RECEIVED:   { label: 'Đã nhận',      color: 'blue' },
  PROCESSING: { label: 'Đang xử lý',  color: 'orange' },
  COMPLETED:  { label: 'Hoàn thành',   color: 'green' },
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  SPACE:     { label: 'Không gian', color: 'blue' },
  STAFF:     { label: 'Nhân viên',  color: 'orange' },
  SERVICE:   { label: 'Dịch vụ',    color: 'purple' },
  EQUIPMENT: { label: 'Thiết bị',   color: 'geekblue' },
  FOOD:      { label: 'Đồ ăn',      color: 'green' },
  OTHER:     { label: 'Khác',       color: 'default' },
  // Client-side categories (lowercase mapping)
  MACHINES:    { label: 'Máy móc',     color: 'purple' },
  CLEANLINESS: { label: 'Vệ sinh',     color: 'red' },
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  IMPROVEMENT:      { label: 'Cải thiện',          color: 'cyan' },
  BUG_REPORT:       { label: 'Báo lỗi',            color: 'red' },
  FEATURE_REQUEST:  { label: 'Yêu cầu tính năng',  color: 'purple' },
  GENERAL:          { label: 'Chung',               color: 'default' },
  RESTOCK_REQUEST:  { label: 'Nhập hàng',           color: 'volcano' },
};

/** Derive priority tag from rating: 1★ = urgent, 5★ = low */
function getPriorityFromRating(rating: number, storedPriority: string): { label: string; color: string } {
  if (rating >= 1) {
    if (rating <= 1) return { label: 'Ưu tiên xử lý', color: 'red' };
    if (rating <= 2) return { label: 'Cao',             color: 'volcano' };
    if (rating <= 3) return { label: 'Trung bình',      color: 'gold' };
    return                   { label: 'Thấp',            color: 'green' };
  }
  // Fallback to stored priority for items without rating
  const map: Record<string, { label: string; color: string }> = {
    HIGH:   { label: 'Cao',         color: 'red' },
    MEDIUM: { label: 'Trung bình',  color: 'gold' },
    LOW:    { label: 'Thấp',        color: 'green' },
  };
  return map[storedPriority] ?? { label: storedPriority, color: 'default' };
}

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'SUBMITTED', label: 'Đã gửi' },
  { value: 'RECEIVED', label: 'Đã nhận' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'Tất cả mức độ' },
  { value: 'LOW', label: 'Thấp' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HIGH', label: 'Cao' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Tất cả danh mục' },
  { value: 'SPACE', label: 'Không gian' },
  { value: 'STAFF', label: 'Nhân viên' },
  { value: 'SERVICE', label: 'Dịch vụ' },
  { value: 'EQUIPMENT', label: 'Thiết bị' },
  { value: 'FOOD', label: 'Đồ ăn' },
  { value: 'OTHER', label: 'Khác' },
];

const MACHINE_CATEGORIES = ['MACHINES', 'EQUIPMENT'];

const DEVICE_ITEMS = [
  { field: 'monitorStatus',   name: 'Màn hình',  icon: '🖥️' },
  { field: 'keyboardStatus',  name: 'Bàn phím',  icon: '⌨️' },
  { field: 'mouseStatus',     name: 'Chuột',     icon: '🖱️' },
  { field: 'headphoneStatus', name: 'Tai nghe',  icon: '🎧' },
  { field: 'chairStatus',     name: 'Ghế',       icon: '💺' },
  { field: 'networkStatus',   name: 'Mạng',      icon: '📶' },
];

const DEVICE_STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  GOOD:                { label: 'Tốt',         color: '#52c41a' },
  DAMAGED_BUT_USABLE:  { label: 'Hỏng nhẹ',   color: '#faad14' },
  COMPLETELY_DAMAGED:  { label: 'Hỏng nặng',   color: '#ff4d4f' },
};

const RATING_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: 'Rất không hài lòng', color: '#ff4d4f' },
  2: { text: 'Không hài lòng',     color: '#fa8c16' },
  3: { text: 'Bình thường',        color: '#fadb14' },
  4: { text: 'Hài lòng',           color: '#52c41a' },
  5: { text: 'Rất hài lòng',       color: '#1890ff' },
};

const DEVICE_STATUS_LABELS: Record<string, string> = {
  GOOD: 'Hoạt động tốt',
  DAMAGED_BUT_USABLE: 'Hỏng nhưng có thể sử dụng',
  COMPLETELY_DAMAGED: 'Hỏng hoàn toàn',
};

/** Parse structured note JSON from feedback */
function parseNote(note: string | null): { deviceStatuses?: Record<string, string>; userNote?: string } | null {
  if (!note) return null;
  try {
    const parsed = JSON.parse(note);
    return parsed ?? null;
  } catch {
    // Legacy plain-text note
    return { userNote: note };
  }
}

const STATUS_FLOW: Record<string, string[]> = {
  SUBMITTED:  ['RECEIVED', 'PROCESSING', 'COMPLETED'],
  RECEIVED:   ['PROCESSING', 'COMPLETED'],
  PROCESSING: ['COMPLETED'],
  COMPLETED:  [],
};

/* ---------- types ---------- */
interface FeedbackItem {
  id: number;
  userId: number | null;
  type: string;
  title: string;
  description: string;
  priority: string;
  category: string | null;
  rating: number;
  image: string | null;
  note: string | null;
  isAnonymous: boolean;
  status: string;
  response: string | null;
  stars: number;
  createdAt: string;
  updatedAt: string;
  computerId: number | null;
  user?: { userId: number; userName: string | null } | null;
  computer?: { id: number; name: string | null } | null;
}

interface Stats {
  submitted: number;
  received: number;
  processing: number;
  completed: number;
  total: number;
}

/* ---------- component ---------- */
const FeedbackManagementPage: React.FC = () => {
  const { notification } = App.useApp();

  // data
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);

  // filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [responseText, setResponseText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingResponse, setUpdatingResponse] = useState(false);
  const [creatingDeviceReport, setCreatingDeviceReport] = useState(false);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);

  /* ---------- fetch ---------- */
  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: pageSize };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (searchText) params.search = searchText;
      if (dateRange?.[0]) params.startDate = dateRange[0].format('YYYY-MM-DD');
      if (dateRange?.[1]) params.endDate = dateRange[1].format('YYYY-MM-DD');

      const res = await apiClient.get('/feedback/admin/all', { params });
      setFeedbacks(res.data?.data ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      notification.error({ message: 'Lỗi tải danh sách feedback', placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, priorityFilter, categoryFilter, searchText, dateRange, notification]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get('/feedback/admin/stats');
      setStats(res.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  /* ---------- actions ---------- */
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await apiClient.patch(`/feedback/admin/${id}`, { status: newStatus });
      notification.success({ message: 'Cập nhật trạng thái thành công', placement: 'topRight' });
      fetchFeedbacks();
      fetchStats();
      if (selectedFeedback?.id === id) {
        setSelectedFeedback((prev) => prev ? { ...prev, status: newStatus } : null);
        fetchStatusHistory(id);
      }
    } catch {
      notification.error({ message: 'Lỗi cập nhật trạng thái', placement: 'topRight' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveResponse = async () => {
    if (!selectedFeedback) return;
    setUpdatingResponse(true);
    try {
      await apiClient.patch(`/feedback/admin/${selectedFeedback.id}`, { response: responseText });
      notification.success({ message: 'Đã lưu phản hồi', placement: 'topRight' });
      setSelectedFeedback((prev) => prev ? { ...prev, response: responseText } : null);
      fetchFeedbacks();
    } catch {
      notification.error({ message: 'Lỗi lưu phản hồi', placement: 'topRight' });
    } finally {
      setUpdatingResponse(false);
    }
  };

  const handleCreateDeviceReport = async () => {
    if (!selectedFeedback || !selectedFeedback.computerId) return;
    // Prevent duplicate reports
    if (parseNote(selectedFeedback.note)?.deviceReportCreated) return;
    setCreatingDeviceReport(true);
    try {
      const parsed = parseNote(selectedFeedback.note);
      const userNote = parsed?.userNote
        || selectedFeedback.description.match(/Chi tiết:\s*([\s\S]*?)(?:\n\nTình trạng|$)/)?.[1]?.trim()
        || '';
      const issueRaw = userNote
        ? `[Feedback #${selectedFeedback.id}] ${userNote}`
        : `[Feedback #${selectedFeedback.id}] ${selectedFeedback.title}`;
      const issue = issueRaw.length > 180 ? issueRaw.substring(0, 180) + '...' : issueRaw;
      await apiClient.post(`/devices/${selectedFeedback.computerId}`, {
        type: 'REPORT',
        issue,
        status: 'PENDING',
        ...(parsed?.deviceStatuses ?? { computerStatus: 'DAMAGED_BUT_USABLE' }),
      });
      // Auto-update feedback status to PROCESSING
      if (selectedFeedback.status === 'SUBMITTED' || selectedFeedback.status === 'RECEIVED') {
        await apiClient.patch(`/feedback/admin/${selectedFeedback.id}`, { status: 'PROCESSING' });
        setSelectedFeedback((prev) => prev ? { ...prev, status: 'PROCESSING' } : null);
        fetchFeedbacks();
        fetchStats();
      }
      // Mark device report as created in the note JSON
      const currentNote = parseNote(selectedFeedback.note);
      const updatedNote = JSON.stringify({ ...currentNote, deviceReportCreated: true });
      await apiClient.patch(`/feedback/admin/${selectedFeedback.id}`, { note: updatedNote });
      setSelectedFeedback((prev) => prev ? { ...prev, note: updatedNote } : null);

      notification.success({
        message: 'Đã tạo báo cáo tình trạng thiết bị',
        description: `Báo cáo đã được ghi nhận cho máy ${selectedFeedback.computer?.name || `#${selectedFeedback.computerId}`}. Xem chi tiết tại mục Quản lý lịch sử máy.`,
        placement: 'topRight',
      });
    } catch {
      notification.error({ message: 'Lỗi tạo báo cáo thiết bị', placement: 'topRight' });
    } finally {
      setCreatingDeviceReport(false);
    }
  };

  const fetchStatusHistory = async (feedbackId: number) => {
    try {
      const res = await apiClient.get(`/feedback/admin/${feedbackId}/history`);
      setStatusHistory(res.data ?? []);
    } catch {
      setStatusHistory([]);
    }
  };

  const openDrawer = (record: FeedbackItem) => {
    setSelectedFeedback(record);
    setResponseText(record.response ?? '');
    setStatusHistory([]);
    setDrawerOpen(true);
    fetchStatusHistory(record.id);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setSearchText('');
    setDateRange(null);
    setPage(1);
  };

  const hasFilters = statusFilter || priorityFilter || categoryFilter || searchText || dateRange;

  /* ---------- columns ---------- */
  const columns: ColumnsType<FeedbackItem> = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 55,
      render: (id: number) => <span className="text-gray-400">#{id}</span>,
    },
    {
      title: 'Người gửi',
      key: 'user',
      width: 130,
      render: (_: any, r: FeedbackItem) => {
        if (r.isAnonymous) return <span className="text-gray-500 italic">Ẩn danh</span>;
        const userName = r.user?.userName;
        const computerName = r.computer?.name;
        return (
          <div>
            <div className="font-medium">
              {userName || (r.userId ? `User #${r.userId}` : (computerName || '—'))}
            </div>
            {computerName && (
              <div className="text-xs text-gray-500">{computerName}</div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Danh mục',
      key: 'category',
      width: 110,
      render: (_: any, r: FeedbackItem) => {
        if (!r.category) return <span className="text-gray-500">—</span>;
        const cfg = CATEGORY_CONFIG[r.category] ?? { label: r.category, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 280,
      ellipsis: true,
      render: (title: string, r: FeedbackItem) => (
        <div>
          <div className="font-medium">{title}</div>
          {r.rating > 0 && <Rate disabled defaultValue={r.rating} style={{ fontSize: 12 }} />}
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type: string) => {
        const cfg = TYPE_CONFIG[type] ?? { label: type, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Mức độ',
      key: 'priority',
      width: 110,
      render: (_: any, r: FeedbackItem) => {
        const p = getPriorityFromRating(r.rating, r.priority);
        return <Tag color={p.color}>{p.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => {
        const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date: string) => (
        <span className="text-gray-400 text-xs">
          {dayjs(date).format('DD/MM/YYYY HH:mm')}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, r: FeedbackItem) => (
        <Button
          type="primary"
          size="small"
          icon={<MessageOutlined />}
          onClick={(e) => { e.stopPropagation(); openDrawer(r); }}
        >
          Phản hồi
        </Button>
      ),
    },
  ], []);

  /* ---------- render ---------- */
  return (
    <div className="space-y-4">
      {/* Stats */}
      {stats && (
        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6} lg={3}>
            <Card size="small" className="bg-gray-800 border-gray-700">
              <Statistic title="Tổng" value={stats.total} valueStyle={{ color: '#fff', fontSize: 20 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card size="small" className="bg-gray-800 border-gray-700">
              <Statistic title="Đã gửi" value={stats.submitted} valueStyle={{ color: '#faad14', fontSize: 20 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card size="small" className="bg-gray-800 border-gray-700">
              <Statistic title="Đang xử lý" value={stats.received + stats.processing} valueStyle={{ color: '#1890ff', fontSize: 20 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <Card size="small" className="bg-gray-800 border-gray-700">
              <Statistic title="Hoàn thành" value={stats.completed} valueStyle={{ color: '#52c41a', fontSize: 20 }} />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
          style={{ width: 200 }}
          allowClear
        />
        <Select
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          options={STATUS_OPTIONS}
          style={{ width: 160 }}
        />
        <Select
          value={priorityFilter}
          onChange={(v) => { setPriorityFilter(v); setPage(1); }}
          options={PRIORITY_OPTIONS}
          style={{ width: 150 }}
        />
        <Select
          value={categoryFilter}
          onChange={(v) => { setCategoryFilter(v); setPage(1); }}
          options={CATEGORY_OPTIONS}
          style={{ width: 160 }}
        />
        <RangePicker
          value={dateRange as any}
          onChange={(dates) => { setDateRange(dates as any); setPage(1); }}
          format="DD/MM/YYYY"
          placeholder={['Từ ngày', 'Đến ngày']}
        />
        {hasFilters && (
          <Button icon={<CloseOutlined />} onClick={clearFilters} size="small">
            Xóa lọc
          </Button>
        )}
        <Button icon={<ReloadOutlined />} onClick={() => { fetchFeedbacks(); fetchStats(); }} loading={loading}>
          Tải lại
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={feedbacks}
        rowKey="id"
        loading={loading}
        size="small"
        scroll={{ x: 900 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (t) => `Tổng ${t} feedback`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      {/* Detail Drawer */}
      <Drawer
        title={selectedFeedback ? `Feedback #${selectedFeedback.id}` : 'Chi tiết Feedback'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
        styles={{ body: { paddingBottom: 80 } }}
      >
        {selectedFeedback && (
          <div className="space-y-4">
            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <Tag color={STATUS_CONFIG[selectedFeedback.status]?.color}>
                {STATUS_CONFIG[selectedFeedback.status]?.label ?? selectedFeedback.status}
              </Tag>
              <Tag color={getPriorityFromRating(selectedFeedback.rating, selectedFeedback.priority).color}>
                {getPriorityFromRating(selectedFeedback.rating, selectedFeedback.priority).label}
              </Tag>
              {selectedFeedback.category && (() => {
                const cfg = CATEGORY_CONFIG[selectedFeedback.category] ?? { label: selectedFeedback.category, color: 'default' };
                return <Tag color={cfg.color}>{cfg.label}</Tag>;
              })()}
              {(() => {
                const cfg = TYPE_CONFIG[selectedFeedback.type] ?? { label: selectedFeedback.type, color: 'default' };
                return <Tag color={cfg.color}>{cfg.label}</Tag>;
              })()}
            </div>

            {/* User info */}
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Người gửi</div>
              {selectedFeedback.isAnonymous ? (
                <span className="italic text-gray-500">Ẩn danh</span>
              ) : (
                <div>
                  <span className="font-medium">
                    {selectedFeedback.user?.userName || (selectedFeedback.userId ? `User #${selectedFeedback.userId}` : 'Không xác định')}
                  </span>
                </div>
              )}
              {selectedFeedback.computer?.name && (
                <div className="text-gray-500 text-xs mt-1">Máy: {selectedFeedback.computer.name}</div>
              )}
              <div className="text-gray-500 text-xs mt-1">
                {dayjs(selectedFeedback.createdAt).format('HH:mm DD/MM/YYYY')}
              </div>
            </div>

            {/* ── Feedback content card ── */}
            {(() => {
              const parsed = parseNote(selectedFeedback.note);
              const userNote = parsed?.userNote;
              const deviceStatuses = parsed?.deviceStatuses;
              const catCfg = CATEGORY_CONFIG[selectedFeedback.category ?? ''];
              const ratingInfo = RATING_LABELS[selectedFeedback.rating];
              const isMachine = MACHINE_CATEGORIES.includes(selectedFeedback.category ?? '');

              return (
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  {/* Category header + rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {catCfg && <Tag color={catCfg.color}>{catCfg.label}</Tag>}
                      {selectedFeedback.rating > 0 && (
                        <Tag color="gold">{selectedFeedback.rating}/5</Tag>
                      )}
                    </div>
                  </div>

                  {/* Rating with label */}
                  {selectedFeedback.rating > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs">Đánh giá:</span>
                      <Rate disabled value={selectedFeedback.rating} style={{ fontSize: 16 }} />
                      {ratingInfo && (
                        <span className="text-sm font-medium" style={{ color: ratingInfo.color }}>
                          {ratingInfo.text}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Device statuses — from JSON note or parsed from description */}
                  {isMachine && (() => {
                    if (deviceStatuses) {
                      return (
                        <div>
                          <div className="text-gray-400 text-xs mb-2">Tình trạng thiết bị:</div>
                          <div className="space-y-1">
                            {DEVICE_ITEMS.map((item) => {
                              const val = deviceStatuses[item.field] ?? 'GOOD';
                              const display = DEVICE_STATUS_DISPLAY[val] ?? { label: val, color: '#999' };
                              const label = DEVICE_STATUS_LABELS[val] ?? val;
                              return (
                                <div key={item.field} className="flex items-center gap-2 text-sm">
                                  <span>{item.icon}</span>
                                  <span className="text-gray-300">{item.name}:</span>
                                  <span className="font-medium" style={{ color: display.color }}>
                                    {label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    // Fallback: parse device info from description text for old feedbacks
                    const descLines = selectedFeedback.description.split('\n');
                    const deviceLines = descLines.filter((l) =>
                      DEVICE_ITEMS.some((d) => l.includes(d.name + ':'))
                    );
                    if (deviceLines.length > 0) {
                      return (
                        <div>
                          <div className="text-gray-400 text-xs mb-2">Tình trạng thiết bị:</div>
                          <div className="space-y-1">
                            {deviceLines.map((line, i) => {
                              const clean = line.replace(/^-\s*/, '');
                              const [name, ...rest] = clean.split(':');
                              const statusText = rest.join(':').trim();
                              const isGood = statusText.includes('Hoạt động tốt');
                              const isDamaged = statusText.includes('Hỏng hoàn toàn');
                              const color = isGood ? '#52c41a' : isDamaged ? '#ff4d4f' : '#faad14';
                              const item = DEVICE_ITEMS.find((d) => d.name === name.trim());
                              return (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <span>{item?.icon ?? '📋'}</span>
                                  <span className="text-gray-300">{name.trim()}:</span>
                                  <span className="font-medium" style={{ color }}>{statusText}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* User note */}
                  {(() => {
                    const noteText = userNote || (() => {
                      // Extract "Chi tiết: ..." from description for old feedbacks
                      const match = selectedFeedback.description.match(/Chi tiết:\s*([\s\S]*?)(?:\n\nTình trạng|$)/);
                      return match?.[1]?.trim() || null;
                    })();
                    return noteText ? (
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Chi tiết:</div>
                        <div className="bg-gray-900 rounded-lg p-3 text-sm whitespace-pre-wrap">
                          {noteText}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Fallback: show raw description if no structured data available */}
                  {!parsed && !isMachine && !selectedFeedback.description.includes('Chi tiết:') && (
                    <div>
                      <div className="text-gray-400 text-xs mb-1">Nội dung:</div>
                      <div className="bg-gray-900 rounded-lg p-3 text-sm whitespace-pre-wrap">
                        {selectedFeedback.description}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Image */}
            {selectedFeedback.image && (
              <div>
                <div className="text-gray-400 text-xs mb-1">Hình ảnh đính kèm</div>
                <Image
                  src={selectedFeedback.image}
                  alt="Feedback image"
                  style={{ maxHeight: 300, borderRadius: 8 }}
                />
              </div>
            )}

            {/* Status update */}
            {(STATUS_FLOW[selectedFeedback.status]?.length ?? 0) > 0 && (
              <div>
                <div className="text-gray-400 text-xs mb-2">Cập nhật trạng thái</div>
                <Space wrap>
                  {STATUS_FLOW[selectedFeedback.status]?.map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <Button
                        key={s}
                        size="small"
                        type="primary"
                        loading={updatingStatus}
                        onClick={() => handleUpdateStatus(selectedFeedback.id, s)}
                        style={{
                          backgroundColor: s === 'COMPLETED' ? '#52c41a' : s === 'PROCESSING' ? '#fa8c16' : '#1890ff',
                          borderColor: 'transparent',
                        }}
                      >
                        {cfg?.label ?? s}
                      </Button>
                    );
                  })}
                </Space>
              </div>
            )}

            {/* Status history timeline */}
            {statusHistory.length > 0 && (
              <div>
                <div className="text-gray-400 text-xs mb-2">
                  <ClockCircleOutlined className="mr-1" />
                  Lịch sử xử lý
                </div>
                <Timeline
                  items={[
                    // Initial submission
                    {
                      color: 'gold',
                      children: (
                        <div>
                          <div className="text-sm font-medium">
                            <Tag color="gold" className="mr-1">Đã gửi</Tag>
                          </div>
                          <div className="text-gray-500 text-xs">
                            {dayjs(selectedFeedback.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                          </div>
                        </div>
                      ),
                    },
                    // Status changes
                    ...statusHistory.map((h: any) => {
                      const toCfg = STATUS_CONFIG[h.toStatus] ?? { label: h.toStatus, color: 'default' };
                      const fromTime = statusHistory.indexOf(h) === 0
                        ? dayjs(selectedFeedback.createdAt)
                        : dayjs(statusHistory[statusHistory.indexOf(h) - 1].changedAt);
                      const duration = dayjs(h.changedAt).diff(fromTime, 'minute');
                      const durationText = duration < 60
                        ? `${duration} phút`
                        : duration < 1440
                          ? `${Math.floor(duration / 60)}h ${duration % 60}p`
                          : `${Math.floor(duration / 1440)} ngày ${Math.floor((duration % 1440) / 60)}h`;
                      return {
                        color: toCfg.color === 'green' ? 'green' : toCfg.color === 'orange' ? 'orange' : 'blue',
                        children: (
                          <div>
                            <div className="text-sm font-medium">
                              <Tag color={toCfg.color} className="mr-1">{toCfg.label}</Tag>
                              <span className="text-gray-500 text-xs">+{durationText}</span>
                            </div>
                            <div className="text-gray-500 text-xs">
                              {dayjs(h.changedAt).format('HH:mm:ss DD/MM/YYYY')}
                            </div>
                          </div>
                        ),
                      };
                    }),
                  ]}
                />
              </div>
            )}

            {/* Device report — only for machine/equipment feedback with a computerId */}
            {selectedFeedback.computerId && MACHINE_CATEGORIES.includes(selectedFeedback.category ?? '') && (() => {
              const reported = parseNote(selectedFeedback.note)?.deviceReportCreated;
              return reported ? (
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span className="text-green-300 text-sm">
                    Đã ghi nhận báo cáo tình trạng cho máy <strong>{selectedFeedback.computer?.name || `#${selectedFeedback.computerId}`}</strong>
                  </span>
                </div>
              ) : (
                <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-3">
                  <div className="text-orange-300 text-xs font-medium mb-2">
                    <ToolOutlined className="mr-1" />
                    Báo cáo tình trạng thiết bị
                  </div>
                  <p className="text-gray-400 text-xs mb-2">
                    Tạo báo cáo hư hỏng cho máy <strong className="text-white">{selectedFeedback.computer?.name || `#${selectedFeedback.computerId}`}</strong> và ghi nhận vào lịch sử thiết bị.
                  </p>
                  <Button
                    type="primary"
                    danger
                    icon={<CheckCircleOutlined />}
                    loading={creatingDeviceReport}
                    onClick={handleCreateDeviceReport}
                  >
                    Xác nhận tình trạng
                  </Button>
                </div>
              );
            })()}

            {/* Admin response */}
            <div>
              <div className="text-gray-400 text-xs mb-1">Phản hồi của Admin</div>
              <TextArea
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Nhập phản hồi cho feedback này..."
              />
              <Button
                type="primary"
                onClick={handleSaveResponse}
                loading={updatingResponse}
                className="mt-2"
                disabled={responseText === (selectedFeedback.response ?? '')}
              >
                Lưu phản hồi
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default FeedbackManagementPage;
