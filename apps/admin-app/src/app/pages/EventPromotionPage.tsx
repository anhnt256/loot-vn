import React, { useCallback, useEffect, useState } from 'react';
import {
  Table, Button, Tag, App, Modal, Form, Input, DatePicker, Select,
  Card, Row, Col, Statistic, Space, Tabs, InputNumber, Popconfirm,
  Drawer, Divider, Empty, Badge, Collapse, List, Descriptions,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined,
  GiftOutlined, TagOutlined, BarChartOutlined, CopyOutlined,
  AimOutlined, ThunderboltOutlined, TrophyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiClient } from '@gateway-workspace/shared/utils/client';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

/* ---------- types ---------- */

interface Event {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  budget?: number;
  isActive: boolean;
  createdAt: string;
  targetRules: TargetRule[];
  promotions: Promotion[];
  _count?: { participants: number; analytics: number };
}

interface TargetRule {
  id: number;
  type: string;
  operator: string;
  value: string;
}

interface Promotion {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;
  conditions: Condition[];
  rewardBundles: RewardBundle[];
  couponBatches: CouponBatch[];
}

interface Condition {
  id: number;
  triggerAction: string;
  operator: string;
  value: number;
}

interface RewardBundle {
  id: number;
  name: string;
  items: RewardItem[];
}

interface RewardItem {
  id: number;
  rewardType: string;
  value: number;
  walletType?: string;
  maxValue?: number;
}

interface CouponBatch {
  id: number;
  name: string;
  discountType: string;
  discountValue: number;
  maxDiscountValue?: number;
  totalCodes: number;
  usageFrequency: string;
  _count?: { codes: number };
}

interface Analytics {
  snapshot: {
    totalParticipants: number;
    totalRewardsClaimed: number;
    totalCouponsIssued: number;
    totalCouponsUsed: number;
    totalRevenue: number;
    totalRewardCost: number;
    conversionRate: number;
  } | null;
  promotionBreakdown: {
    promotionId: number;
    name: string;
    totalCodes: number;
    usedCodes: number;
    usageRate: number;
  }[];
}

/* ---------- constants ---------- */

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'default' },
  ACTIVE: { label: 'Hoạt động', color: 'green' },
  PAUSED: { label: 'Tạm dừng', color: 'orange' },
  COMPLETED: { label: 'Hoàn thành', color: 'blue' },
  CANCELLED: { label: 'Đã huỷ', color: 'red' },
  PENDING_APPROVAL: { label: 'Chờ duyệt', color: 'gold' },
};

const EVENT_TYPES = [
  { value: 'HOLIDAY_EVENT', label: 'Sự kiện lễ' },
  { value: 'SEASONAL_EVENT', label: 'Sự kiện mùa' },
  { value: 'PROMOTIONAL_CAMPAIGN', label: 'Chiến dịch KM' },
  { value: 'NEW_USER_WELCOME', label: 'Chào mừng user mới' },
  { value: 'LOYALTY_PROGRAM', label: 'Khách hàng thân thiết' },
  { value: 'REFERRAL_PROGRAM', label: 'Giới thiệu bạn bè' },
];

const TARGET_TYPES = [
  { value: 'RANK', label: 'Theo hạng (Rank)' },
  { value: 'MIN_TOTAL_PAYMENT', label: 'Tổng nạp tối thiểu' },
  { value: 'ZONE', label: 'Khu vực máy' },
  { value: 'SPECIFIC_USER', label: 'User cụ thể' },
];

const TRIGGER_ACTIONS = [
  { value: 'TOPUP', label: 'Nạp tiền' },
  { value: 'ORDER_FOOD', label: 'Đặt F&B' },
  { value: 'PLAY_TIME', label: 'Thời gian chơi' },
  { value: 'TOTAL_SPEND', label: 'Tổng chi tiêu' },
];

const REWARD_TYPES = [
  { value: 'BONUS_PERCENT', label: '% Bonus vào ví' },
  { value: 'TOPUP_FIXED', label: 'Cộng tiền cố định' },
  { value: 'SPIN_TURNS', label: 'Lượt quay thưởng' },
  { value: 'FREE_DRINK', label: 'Nước miễn phí' },
  { value: 'FREE_FOOD', label: 'Đồ ăn miễn phí' },
  { value: 'COUPON', label: 'Mã giảm giá' },
];

const USAGE_FREQ = [
  { value: 'ONE_TIME', label: '1 lần duy nhất' },
  { value: 'PER_WEEK', label: '1 lần/tuần' },
  { value: 'PER_MONTH', label: '1 lần/tháng' },
  { value: 'PER_EVENT', label: 'Không giới hạn (suốt sự kiện)' },
];

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN').format(v);

/* ========== COMPONENT ========== */

const EventPromotionPage: React.FC = () => {
  const { notification, modal } = App.useApp();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  // Create Event modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();

  // Event detail drawer
  const [detailEvent, setDetailEvent] = useState<Event | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // Create Promotion modal
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoForm] = Form.useForm();

  // Create Coupon Batch modal
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponForm] = Form.useForm();
  const [couponPromoId, setCouponPromoId] = useState<number | null>(null);

  /* ---------- fetch ---------- */

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await apiClient.get(`/event-promotion/events${params}`);
      setEvents(res.data);
    } catch (err: any) {
      notification.error({ title: 'Lỗi', description: err.message });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const fetchDetail = async (eventId: string) => {
    try {
      const [eventRes, analyticsRes] = await Promise.all([
        apiClient.get(`/event-promotion/events/${eventId}`),
        apiClient.get(`/event-promotion/events/${eventId}/analytics`),
      ]);
      setDetailEvent(eventRes.data);
      setAnalytics(analyticsRes.data);
      setDetailOpen(true);
    } catch (err: any) {
      notification.error({ title: 'Lỗi', description: err.message });
    }
  };

  /* ---------- create event ---------- */

  const handleCreateEvent = async (values: any) => {
    try {
      const body = {
        name: values.name,
        description: values.description,
        type: values.type,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        budget: values.budget,
        targetRules: values.targetRules?.filter((r: any) => r?.type) || [],
      };
      await apiClient.post('/event-promotion/events', body);
      notification.success({ title: 'Thành công', description: 'Đã tạo sự kiện' });
      setCreateOpen(false);
      createForm.resetFields();
      fetchEvents();
    } catch (err: any) {
      notification.error({ title: 'Lỗi', description: err.message });
    }
  };

  /* ---------- update event status ---------- */

  const handleStatusChange = async (eventId: string, status: string) => {
    try {
      await apiClient.put(`/event-promotion/events/${eventId}`, { status });
      notification.success({ title: 'Thành công', description: `Đã chuyển trạng thái sang ${STATUS_CONFIG[status]?.label || status}` });
      fetchEvents();
      if (detailEvent?.id === eventId) fetchDetail(eventId);
    } catch (err: any) {
      notification.error({ title: 'Lỗi', description: err.message });
    }
  };

  /* ---------- create promotion ---------- */

  const handleCreatePromotion = async (values: any) => {
    try {
      const body = {
        eventId: detailEvent!.id,
        name: values.name,
        description: values.description,
        priority: values.priority || 1,
        conditions: values.conditions?.filter((c: any) => c?.triggerAction) || [],
        rewardBundles: values.rewardBundles?.filter((b: any) => b?.name)?.map((b: any) => ({
          name: b.name,
          items: b.items?.filter((i: any) => i?.rewardType) || [],
        })) || [],
      };
      await apiClient.post('/event-promotion/promotions', body);
      notification.success({ title: 'Thành công', description: 'Đã tạo chương trình KM' });
      setPromoOpen(false);
      promoForm.resetFields();
      fetchDetail(detailEvent!.id);
    } catch (err: any) {
      notification.error({ title: 'Lỗi', description: err.message });
    }
  };

  /* ---------- delete promotion ---------- */

  const handleDeletePromotion = async (promotionId: number) => {
    try {
      await apiClient.delete(`/event-promotion/promotions/${promotionId}`);
      notification.success({ title: 'Thành công', description: 'Đã xoá chương trình KM' });
      fetchDetail(detailEvent!.id);
    } catch (err: any) {
      notification.error({ title: 'Lỗi', description: err.message });
    }
  };

  /* ---------- create coupon batch ---------- */

  const handleCreateCouponBatch = async (values: any) => {
    if (!couponPromoId) return;
    try {
      const body = {
        promotionId: couponPromoId,
        name: values.name,
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscountValue: values.maxDiscountValue,
        totalCodes: values.totalCodes,
        validDays: values.validDays,
        usageFrequency: values.usageFrequency,
        maxUsagePerUser: values.maxUsagePerUser || 1,
      };
      const res = await apiClient.post('/event-promotion/coupon-batches', body);
      notification.success({
        title: 'Thành công',
        description: `Đã tạo ${res.data.codesCreated} mã khuyến mãi`,
      });
      setCouponOpen(false);
      couponForm.resetFields();
      fetchDetail(detailEvent!.id);
    } catch (err: any) {
      notification.error({ title: 'Lỗi', description: err.message });
    }
  };

  /* ---------- generate analytics snapshot ---------- */

  const handleGenerateSnapshot = async () => {
    if (!detailEvent) return;
    try {
      await apiClient.post(`/event-promotion/events/${detailEvent.id}/analytics/snapshot`);
      notification.success({ title: 'Thành công', description: 'Đã tạo snapshot analytics' });
      const res = await apiClient.get(`/event-promotion/events/${detailEvent.id}/analytics`);
      setAnalytics(res.data);
    } catch (err: any) {
      notification.error({ title: 'Lỗi', description: err.message });
    }
  };

  /* ---------- table columns ---------- */

  const columns: ColumnsType<Event> = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'name',
      render: (name, record) => (
        <a onClick={() => fetchDetail(record.id)} style={{ fontWeight: 600 }}>{name}</a>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      render: (type) => EVENT_TYPES.find(t => t.value === type)?.label || type,
      width: 160,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => {
        const cfg = STATUS_CONFIG[status] || { label: status, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
      width: 130,
    },
    {
      title: 'Thời gian',
      render: (_, record) => (
        <span>{dayjs(record.startDate).format('DD/MM/YY')} - {dayjs(record.endDate).format('DD/MM/YY')}</span>
      ),
      width: 180,
    },
    {
      title: 'KM',
      render: (_, record) => <Badge count={record.promotions?.length || 0} showZero />,
      width: 60,
      align: 'center',
    },
    {
      title: 'Người tham gia',
      render: (_, record) => fmt(record._count?.participants || 0),
      width: 120,
      align: 'right',
    },
    {
      title: '',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'DRAFT' && (
            <Button size="small" type="primary" onClick={() => handleStatusChange(record.id, 'ACTIVE')}>
              Kích hoạt
            </Button>
          )}
          {record.status === 'ACTIVE' && (
            <Button size="small" onClick={() => handleStatusChange(record.id, 'PAUSED')}>
              Tạm dừng
            </Button>
          )}
          {record.status === 'PAUSED' && (
            <Button size="small" type="primary" onClick={() => handleStatusChange(record.id, 'ACTIVE')}>
              Tiếp tục
            </Button>
          )}
          {['ACTIVE', 'PAUSED'].includes(record.status) && (
            <Button size="small" danger onClick={() => handleStatusChange(record.id, 'COMPLETED')}>
              Kết thúc
            </Button>
          )}
        </Space>
      ),
    },
  ];

  /* ========== RENDER ========== */

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2 style={{ margin: 0, color: '#fff' }}>
            <GiftOutlined style={{ marginRight: 8 }} />
            Quản lý Sự kiện & Khuyến mãi
          </h2>
        </Col>
        <Col>
          <Space>
            <Select
              allowClear
              placeholder="Lọc trạng thái"
              style={{ width: 160 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchEvents} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              Tạo sự kiện
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Events table */}
      <Table
        dataSource={events}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        size="middle"
      />

      {/* ===== Create Event Modal ===== */}
      <Modal
        title="Tạo sự kiện mới"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => createForm.submit()}
        width={640}
        okText="Tạo"
        cancelText="Huỷ"
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateEvent}>
          <Form.Item name="name" label="Tên sự kiện" rules={[{ required: true }]}>
            <Input placeholder="VD: Khuyến mãi 30/4" />
          </Form.Item>
          <Form.Item name="type" label="Loại sự kiện" rules={[{ required: true }]}>
            <Select options={EVENT_TYPES} placeholder="Chọn loại" />
          </Form.Item>
          <Form.Item name="dateRange" label="Thời gian" rules={[{ required: true }]}>
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="budget" label="Ngân sách (VNĐ)">
            <InputNumber style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Divider>Đối tượng tham gia</Divider>
          <Form.List name="targetRules">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                    <Col span={8}>
                      <Form.Item {...rest} name={[name, 'type']} noStyle>
                        <Select placeholder="Loại" options={TARGET_TYPES} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item {...rest} name={[name, 'operator']} noStyle>
                        <Select options={[{ value: '>=', label: '>=' }, { value: '=', label: '=' }, { value: 'IN', label: 'IN' }]} />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item {...rest} name={[name, 'value']} noStyle>
                        <Input placeholder="Giá trị (VD: 5000000)" />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Button danger size="small" onClick={() => remove(name)}>X</Button>
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>
                  Thêm điều kiện
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* ===== Event Detail Drawer ===== */}
      <Drawer
        title={detailEvent?.name || 'Chi tiết sự kiện'}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={800}
        extra={
          <Space>
            <Button icon={<BarChartOutlined />} onClick={handleGenerateSnapshot}>
              Cập nhật Analytics
            </Button>
          </Space>
        }
      >
        {detailEvent && (
          <Tabs
            items={[
              {
                key: 'info',
                label: 'Thông tin',
                children: (
                  <>
                    <Descriptions column={2} size="small" bordered>
                      <Descriptions.Item label="Trạng thái">
                        <Tag color={STATUS_CONFIG[detailEvent.status]?.color}>
                          {STATUS_CONFIG[detailEvent.status]?.label}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Loại">
                        {EVENT_TYPES.find(t => t.value === detailEvent.type)?.label}
                      </Descriptions.Item>
                      <Descriptions.Item label="Bắt đầu">{dayjs(detailEvent.startDate).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                      <Descriptions.Item label="Kết thúc">{dayjs(detailEvent.endDate).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                      <Descriptions.Item label="Ngân sách" span={2}>{detailEvent.budget ? `${fmt(detailEvent.budget)  }đ` : 'Không giới hạn'}</Descriptions.Item>
                      <Descriptions.Item label="Mô tả" span={2}>{detailEvent.description || '—'}</Descriptions.Item>
                    </Descriptions>

                    {detailEvent.targetRules.length > 0 && (
                      <>
                        <Divider orientationMargin={0}><AimOutlined /> Đối tượng</Divider>
                        {detailEvent.targetRules.map((r) => (
                          <Tag key={r.id} style={{ marginBottom: 4 }}>
                            {TARGET_TYPES.find(t => t.value === r.type)?.label} {r.operator} {r.value}
                          </Tag>
                        ))}
                      </>
                    )}
                  </>
                ),
              },
              {
                key: 'promotions',
                label: `Khuyến mãi (${detailEvent.promotions.length})`,
                children: (
                  <>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      style={{ marginBottom: 16 }}
                      onClick={() => { setPromoOpen(true); promoForm.resetFields(); }}
                    >
                      Thêm chương trình KM
                    </Button>

                    {detailEvent.promotions.length === 0 ? (
                      <Empty description="Chưa có chương trình khuyến mãi" />
                    ) : (
                      <Collapse
                        items={detailEvent.promotions.map((promo) => ({
                          key: promo.id,
                          label: (
                            <Space>
                              <strong>{promo.name}</strong>
                              <Tag color={promo.isActive ? 'green' : 'default'}>
                                {promo.isActive ? 'Hoạt động' : 'Tắt'}
                              </Tag>
                            </Space>
                          ),
                          extra: (
                            <Popconfirm title="Xoá chương trình này?" onConfirm={() => handleDeletePromotion(promo.id)}>
                              <Button size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                            </Popconfirm>
                          ),
                          children: (
                            <div>
                              {/* Conditions */}
                              {promo.conditions.length > 0 && (
                                <>
                                  <strong><ThunderboltOutlined /> Điều kiện:</strong>
                                  <div style={{ marginBottom: 12, marginTop: 4 }}>
                                    {promo.conditions.map((c) => (
                                      <Tag key={c.id} color="blue">
                                        {TRIGGER_ACTIONS.find(t => t.value === c.triggerAction)?.label} {c.operator} {fmt(c.value)}
                                      </Tag>
                                    ))}
                                  </div>
                                </>
                              )}

                              {/* Reward Bundles */}
                              {promo.rewardBundles.length > 0 && (
                                <>
                                  <strong><TrophyOutlined /> Phần thưởng:</strong>
                                  {promo.rewardBundles.map((bundle) => (
                                    <Card key={bundle.id} size="small" style={{ marginTop: 8, marginBottom: 8 }}>
                                      <strong>{bundle.name}</strong>
                                      <div style={{ marginTop: 4 }}>
                                        {bundle.items.map((item) => (
                                          <Tag key={item.id} color="purple" style={{ marginBottom: 4 }}>
                                            {REWARD_TYPES.find(t => t.value === item.rewardType)?.label}: {item.value}
                                            {item.walletType ? ` (${item.walletType})` : ''}
                                            {item.maxValue ? ` max ${fmt(item.maxValue)}đ` : ''}
                                          </Tag>
                                        ))}
                                      </div>
                                    </Card>
                                  ))}
                                </>
                              )}

                              {/* Coupon Batches */}
                              <Divider />
                              <Space style={{ marginBottom: 8 }}>
                                <strong><TagOutlined /> Mã khuyến mãi:</strong>
                                <Button
                                  size="small"
                                  type="dashed"
                                  icon={<PlusOutlined />}
                                  onClick={() => { setCouponPromoId(promo.id); setCouponOpen(true); couponForm.resetFields(); }}
                                >
                                  Tạo đợt mã
                                </Button>
                              </Space>
                              {promo.couponBatches.length === 0 ? (
                                <div style={{ color: '#888', fontSize: 12 }}>Chưa có mã khuyến mãi</div>
                              ) : (
                                <List
                                  size="small"
                                  dataSource={promo.couponBatches}
                                  renderItem={(batch) => (
                                    <List.Item>
                                      <Space>
                                        <strong>{batch.name}</strong>
                                        <Tag>{batch.discountType === 'PERCENT' ? `${batch.discountValue}%` : `${fmt(batch.discountValue)}đ`}</Tag>
                                        {batch.maxDiscountValue && <Tag color="orange">Max {fmt(batch.maxDiscountValue)}đ</Tag>}
                                        <Tag color="blue">{batch.totalCodes} mã</Tag>
                                        <Tag>{USAGE_FREQ.find(f => f.value === batch.usageFrequency)?.label}</Tag>
                                      </Space>
                                    </List.Item>
                                  )}
                                />
                              )}
                            </div>
                          ),
                        }))}
                      />
                    )}
                  </>
                ),
              },
              {
                key: 'analytics',
                label: 'Analytics',
                children: analytics?.snapshot ? (
                  <>
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                      <Col span={6}><Card><Statistic title="Người tham gia" value={analytics.snapshot.totalParticipants} /></Card></Col>
                      <Col span={6}><Card><Statistic title="Rewards đã phát" value={analytics.snapshot.totalRewardsClaimed} /></Card></Col>
                      <Col span={6}><Card><Statistic title="Mã đã dùng" value={`${analytics.snapshot.totalCouponsUsed}/${analytics.snapshot.totalCouponsIssued}`} /></Card></Col>
                      <Col span={6}><Card><Statistic title="Conversion" value={((analytics.snapshot.conversionRate || 0) * 100).toFixed(1)} suffix="%" /></Card></Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                      <Col span={12}><Card><Statistic title="Doanh thu" value={fmt(Number(analytics.snapshot.totalRevenue))} suffix="đ" /></Card></Col>
                      <Col span={12}><Card><Statistic title="Chi phí KM" value={fmt(Number(analytics.snapshot.totalRewardCost))} suffix="đ" /></Card></Col>
                    </Row>

                    {analytics.promotionBreakdown.length > 0 && (
                      <>
                        <Divider>Breakdown theo Promotion</Divider>
                        <Table
                          size="small"
                          dataSource={analytics.promotionBreakdown}
                          rowKey="promotionId"
                          pagination={false}
                          columns={[
                            { title: 'Promotion', dataIndex: 'name' },
                            { title: 'Tổng mã', dataIndex: 'totalCodes', align: 'right' as const },
                            { title: 'Đã dùng', dataIndex: 'usedCodes', align: 'right' as const },
                            {
                              title: 'Tỉ lệ',
                              dataIndex: 'usageRate',
                              align: 'right' as const,
                              render: (v: number) => `${(v * 100).toFixed(1)}%`,
                            },
                          ]}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <Empty description="Chưa có dữ liệu analytics. Nhấn 'Cập nhật Analytics' để tạo snapshot." />
                ),
              },
            ]}
          />
        )}
      </Drawer>

      {/* ===== Create Promotion Modal ===== */}
      <Modal
        title="Thêm chương trình Khuyến mãi"
        open={promoOpen}
        onCancel={() => setPromoOpen(false)}
        onOk={() => promoForm.submit()}
        width={700}
        okText="Tạo"
        cancelText="Huỷ"
      >
        <Form form={promoForm} layout="vertical" onFinish={handleCreatePromotion}>
          <Form.Item name="name" label="Tên chương trình" rules={[{ required: true }]}>
            <Input placeholder="VD: Nạp 1 triệu tặng 50%" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item name="priority" label="Độ ưu tiên" initialValue={1}>
            <InputNumber min={1} max={100} />
          </Form.Item>

          <Divider>Điều kiện kích hoạt</Divider>
          <Form.List name="conditions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                    <Col span={8}>
                      <Form.Item {...rest} name={[name, 'triggerAction']} noStyle>
                        <Select placeholder="Hành động" options={TRIGGER_ACTIONS} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item {...rest} name={[name, 'operator']} noStyle initialValue=">=">
                        <Select options={[{ value: '>=', label: '>=' }, { value: '=', label: '=' }, { value: '>', label: '>' }]} />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item {...rest} name={[name, 'value']} noStyle>
                        <InputNumber style={{ width: '100%' }} placeholder="Giá trị" />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Button danger size="small" onClick={() => remove(name)}>X</Button>
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>
                  Thêm điều kiện
                </Button>
              </>
            )}
          </Form.List>

          <Divider>Phần thưởng (Bundle)</Divider>
          <Form.List name="rewardBundles">
            {(bundleFields, { add: addBundle, remove: removeBundle }) => (
              <>
                {bundleFields.map(({ key: bKey, name: bName, ...bRest }) => (
                  <Card key={bKey} size="small" style={{ marginBottom: 12 }}>
                    <Row gutter={8}>
                      <Col span={20}>
                        <Form.Item {...bRest} name={[bName, 'name']} label="Tên bundle" rules={[{ required: true }]}>
                          <Input placeholder="VD: Gói thưởng VIP" />
                        </Form.Item>
                      </Col>
                      <Col span={4} style={{ display: 'flex', alignItems: 'end', paddingBottom: 24 }}>
                        <Button danger size="small" onClick={() => removeBundle(bName)}>Xoá</Button>
                      </Col>
                    </Row>
                    <Form.List name={[bName, 'items']}>
                      {(itemFields, { add: addItem, remove: removeItem }) => (
                        <>
                          {itemFields.map(({ key: iKey, name: iName, ...iRest }) => (
                            <Row key={iKey} gutter={8} style={{ marginBottom: 4 }}>
                              <Col span={8}>
                                <Form.Item {...iRest} name={[iName, 'rewardType']} noStyle>
                                  <Select placeholder="Loại" options={REWARD_TYPES} />
                                </Form.Item>
                              </Col>
                              <Col span={5}>
                                <Form.Item {...iRest} name={[iName, 'value']} noStyle>
                                  <InputNumber style={{ width: '100%' }} placeholder="Giá trị" />
                                </Form.Item>
                              </Col>
                              <Col span={5}>
                                <Form.Item {...iRest} name={[iName, 'walletType']} noStyle>
                                  <Select allowClear placeholder="Ví" options={[{ value: 'MAIN', label: 'Chính' }, { value: 'SUB', label: 'Phụ' }]} />
                                </Form.Item>
                              </Col>
                              <Col span={4}>
                                <Form.Item {...iRest} name={[iName, 'maxValue']} noStyle>
                                  <InputNumber style={{ width: '100%' }} placeholder="Max" />
                                </Form.Item>
                              </Col>
                              <Col span={2}>
                                <Button danger size="small" onClick={() => removeItem(iName)}>X</Button>
                              </Col>
                            </Row>
                          ))}
                          <Button type="dashed" size="small" block onClick={() => addItem()}>+ Thêm reward</Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => addBundle()}>
                  Thêm bundle phần thưởng
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* ===== Create Coupon Batch Modal ===== */}
      <Modal
        title="Tạo đợt mã khuyến mãi"
        open={couponOpen}
        onCancel={() => setCouponOpen(false)}
        onOk={() => couponForm.submit()}
        width={520}
        okText="Tạo mã"
        cancelText="Huỷ"
      >
        <Form form={couponForm} layout="vertical" onFinish={handleCreateCouponBatch}>
          <Form.Item name="name" label="Tên đợt" rules={[{ required: true }]}>
            <Input placeholder="VD: Mã nước miễn phí 30/4" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="discountType" label="Loại giảm giá" rules={[{ required: true }]}>
                <Select options={[{ value: 'PERCENT', label: 'Phần trăm (%)' }, { value: 'FIXED', label: 'Cố định (VNĐ)' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="discountValue" label="Giá trị giảm" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="maxDiscountValue" label="Giảm tối đa (VNĐ)">
            <InputNumber style={{ width: '100%' }} placeholder="VD: 5000" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="totalCodes" label="Số lượng mã" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} max={10000} placeholder="VD: 1000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="validDays" label="Hạn sử dụng (ngày)">
                <InputNumber style={{ width: '100%' }} min={1} placeholder="VD: 7" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="usageFrequency" label="Tần suất sử dụng" rules={[{ required: true }]}>
                <Select options={USAGE_FREQ} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxUsagePerUser" label="Max lần/user" initialValue={1}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default EventPromotionPage;
