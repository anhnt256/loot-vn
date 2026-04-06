import React, { useState, useEffect } from 'react';
import {
  Typography,
  DatePicker,
  Select,
  Button,
  Card,
  Table,
  Spin,
  Tag,
  Statistic,
  message,
  Tabs,
  Empty,
} from 'antd';
import {
  BarChartOutlined,
  ReloadOutlined,
  GiftOutlined,
  StarOutlined,
  DollarOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const REWARD_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  PLAY_TIME: { label: 'Giờ chơi', color: 'blue' },
  FOOD: { label: 'Đồ ăn', color: 'orange' },
  DRINK: { label: 'Đồ uống', color: 'green' },
  VOUCHER: { label: 'Voucher', color: 'purple' },
  OTHER: { label: 'Khác', color: 'default' },
};

interface ReportData {
  period: { from: string; to: string };
  stars: {
    totalDistributed: number;
    totalRedeemed: number;
    netBalance: number;
    distributed: Record<string, number>;
  };
  redemptions: {
    total: number;
    totalActualCost: number;
    byType: Record<string, { count: number; starsUsed: number; actualCost: number }>;
    byStatus: Record<string, number>;
  };
  byShift: {
    workShiftId: number;
    shiftName: string;
    count: number;
    starsUsed: number;
    actualCost: number;
  }[];
  topRewards: {
    rewardName: string;
    rewardType: string;
    count: number;
    starsUsed: number;
    totalCost: number;
  }[];
  daily: {
    date: string;
    count: number;
    starsUsed: number;
    actualCost: number;
  }[];
}

interface WorkShift {
  id: number;
  name: string;
}

// ─── Reward Statistics Sub-tab ───
function RewardStatistics() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs(),
  ]);
  const [shiftFilter, setShiftFilter] = useState<number | undefined>();
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShifts();
    fetchReport();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await apiClient.get('/hr-manager/work-shift');
      setShifts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setShifts([]);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params: any = {
        from: dateRange[0].format('YYYY-MM-DD'),
        to: dateRange[1].format('YYYY-MM-DD'),
      };
      if (shiftFilter) params.workShiftId = shiftFilter;
      const res = await apiClient.get('/promotion-reward/report/summary', { params });
      setReport(res.data);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const STAR_TYPE_LABELS: Record<string, string> = {
    CHECK_IN: 'Check-in',
    GAME: 'Vòng quay',
    MISSION: 'Nhiệm vụ',
    FEEDBACK: 'Feedback',
    BATTLE_PASS: 'Battle Pass',
    GIFT_ROUND: 'Quà tặng',
    REWARD: 'Thưởng',
    RETURN_GIFT: 'Trả quà',
    REDEMPTION: 'Đổi thưởng',
  };

  const shiftColumns = [
    { title: 'Ca', dataIndex: 'shiftName', key: 'shiftName' },
    { title: 'Lượt đổi', dataIndex: 'count', key: 'count', render: (v: number) => v.toLocaleString() },
    { title: 'Sao sử dụng', dataIndex: 'starsUsed', key: 'starsUsed', render: (v: number) => <span style={{ color: '#eab308' }}>⭐ {v.toLocaleString()}</span> },
    { title: 'Chi phí thực', dataIndex: 'actualCost', key: 'actualCost', render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toLocaleString()} ₫</span> },
  ];

  const topColumns = [
    { title: '#', width: 40, render: (_: any, __: any, idx: number) => idx + 1 },
    { title: 'Phần thưởng', dataIndex: 'rewardName', key: 'rewardName' },
    { title: 'Loại', dataIndex: 'rewardType', key: 'rewardType', render: (v: string) => <Tag color={REWARD_TYPE_LABELS[v]?.color}>{REWARD_TYPE_LABELS[v]?.label || v}</Tag> },
    { title: 'Lượt', dataIndex: 'count', key: 'count', render: (v: number) => v.toLocaleString() },
    { title: 'Sao', dataIndex: 'starsUsed', key: 'starsUsed', render: (v: number) => <span style={{ color: '#eab308' }}>⭐ {v.toLocaleString()}</span> },
    { title: 'Tổng chi phí', dataIndex: 'totalCost', key: 'totalCost', render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toLocaleString()} ₫</span> },
  ];

  const dailyColumns = [
    { title: 'Ngày', dataIndex: 'date', key: 'date', render: (v: any) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Lượt đổi', dataIndex: 'count', key: 'count', render: (v: number) => v.toLocaleString() },
    { title: 'Sao sử dụng', dataIndex: 'starsUsed', key: 'starsUsed', render: (v: number) => <span style={{ color: '#eab308' }}>⭐ {v.toLocaleString()}</span> },
    { title: 'Chi phí thực', dataIndex: 'actualCost', key: 'actualCost', render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toLocaleString()} ₫</span> },
  ];

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <RangePicker
          value={dateRange}
          onChange={(v) => v && setDateRange(v as [dayjs.Dayjs, dayjs.Dayjs])}
          format="DD/MM/YYYY"
          style={{ width: 280 }}
        />
        <Select
          placeholder="Tất cả ca"
          allowClear
          style={{ width: 160 }}
          value={shiftFilter}
          onChange={(v) => setShiftFilter(v)}
          options={shifts.map(s => ({ value: s.id, label: s.name }))}
        />
        <Button type="primary" icon={<ReloadOutlined />} onClick={fetchReport} loading={loading}>
          Xem báo cáo
        </Button>
      </div>

      {loading && !report ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : !report ? (
        <Empty description="Chọn khoảng thời gian và nhấn Xem báo cáo" />
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <Card size="small" style={{ background: '#1f2937', border: '1px solid #374151' }}>
              <Statistic
                title={<span style={{ color: '#9ca3af' }}>Sao cấp phát</span>}
                value={report.stars.totalDistributed}
                prefix={<StarOutlined style={{ color: '#eab308' }} />}
                valueStyle={{ color: '#eab308', fontSize: 22 }}
                formatter={(v) => Number(v).toLocaleString()}
              />
            </Card>
            <Card size="small" style={{ background: '#1f2937', border: '1px solid #374151' }}>
              <Statistic
                title={<span style={{ color: '#9ca3af' }}>Sao đã đổi</span>}
                value={report.stars.totalRedeemed}
                prefix={<SwapOutlined style={{ color: '#f97316' }} />}
                valueStyle={{ color: '#f97316', fontSize: 22 }}
                formatter={(v) => Number(v).toLocaleString()}
              />
            </Card>
            <Card size="small" style={{ background: '#1f2937', border: '1px solid #374151' }}>
              <Statistic
                title={<span style={{ color: '#9ca3af' }}>Lượt đổi thưởng</span>}
                value={report.redemptions.total}
                prefix={<GiftOutlined style={{ color: '#8b5cf6' }} />}
                valueStyle={{ color: '#8b5cf6', fontSize: 22 }}
                formatter={(v) => Number(v).toLocaleString()}
              />
            </Card>
            <Card size="small" style={{ background: '#1f2937', border: '1px solid #374151' }}>
              <Statistic
                title={<span style={{ color: '#9ca3af' }}>Tổng chi phí thực</span>}
                value={report.redemptions.totalActualCost}
                prefix={<DollarOutlined style={{ color: '#ef4444' }} />}
                valueStyle={{ color: '#ef4444', fontSize: 22 }}
                suffix="₫"
                formatter={(v) => Number(v).toLocaleString()}
              />
            </Card>
          </div>

          {/* Breakdown by type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <Card title={<span style={{ color: '#e5e7eb' }}>Chi phí theo loại</span>} size="small" style={{ background: '#1f2937', border: '1px solid #374151' }}>
              {Object.keys(report.redemptions.byType).length === 0 ? (
                <div style={{ color: '#6b7280', textAlign: 'center', padding: 20 }}>Chưa có dữ liệu</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(report.redemptions.byType).map(([type, data]) => {
                    const pct = report.redemptions.totalActualCost > 0 ? (data.actualCost / report.redemptions.totalActualCost * 100) : 0;
                    return (
                      <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag color={REWARD_TYPE_LABELS[type]?.color} style={{ width: 80, textAlign: 'center' }}>
                          {REWARD_TYPE_LABELS[type]?.label || type}
                        </Tag>
                        <div style={{ flex: 1, background: '#374151', borderRadius: 4, height: 20, overflow: 'hidden' }}>
                          <div style={{
                            width: `${pct}%`, height: '100%',
                            background: type === 'PLAY_TIME' ? '#3b82f6' : type === 'FOOD' ? '#f97316' : type === 'DRINK' ? '#22c55e' : '#8b5cf6',
                            borderRadius: 4, minWidth: pct > 0 ? 2 : 0,
                          }} />
                        </div>
                        <span style={{ color: '#e5e7eb', fontWeight: 600, width: 120, textAlign: 'right' }}>
                          {data.actualCost.toLocaleString()} ₫
                        </span>
                        <span style={{ color: '#6b7280', fontSize: 12, width: 60 }}>
                          ({data.count} lượt)
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card title={<span style={{ color: '#e5e7eb' }}>Sao cấp phát theo nguồn</span>} size="small" style={{ background: '#1f2937', border: '1px solid #374151' }}>
              {Object.keys(report.stars.distributed).length === 0 ? (
                <div style={{ color: '#6b7280', textAlign: 'center', padding: 20 }}>Chưa có dữ liệu</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Object.entries(report.stars.distributed)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, total]) => (
                      <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#9ca3af' }}>{STAR_TYPE_LABELS[type] || type}</span>
                        <span style={{ color: '#eab308', fontWeight: 600 }}>⭐ {total.toLocaleString()}</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </Card>
          </div>

          {/* Shift + Top rewards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <Card title={<span style={{ color: '#e5e7eb' }}>Theo ca trực</span>} size="small" style={{ background: '#1f2937', border: '1px solid #374151' }}>
              <Table
                dataSource={report.byShift.map((s, i) => ({ ...s, key: i }))}
                columns={shiftColumns}
                pagination={false}
                size="small"
                locale={{ emptyText: 'Chưa có dữ liệu' }}
              />
            </Card>
            <Card title={<span style={{ color: '#e5e7eb' }}>Top phần thưởng</span>} size="small" style={{ background: '#1f2937', border: '1px solid #374151' }}>
              <Table
                dataSource={report.topRewards.map((r, i) => ({ ...r, key: i }))}
                columns={topColumns}
                pagination={false}
                size="small"
                locale={{ emptyText: 'Chưa có dữ liệu' }}
              />
            </Card>
          </div>

          {/* Daily breakdown */}
          <Card title={<span style={{ color: '#e5e7eb' }}>Chi tiết theo ngày</span>} size="small" style={{ background: '#1f2937', border: '1px solid #374151' }}>
            <Table
              dataSource={report.daily.map((d, i) => ({ ...d, key: i }))}
              columns={dailyColumns}
              pagination={false}
              size="small"
              locale={{ emptyText: 'Chưa có dữ liệu' }}
            />
          </Card>
        </>
      )}
    </div>
  );
}

// ─── Main ───
export default function StatisticsPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ color: '#9ca3af', fontSize: 13, marginBottom: 4 }}>Dashboard / Thống kê</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChartOutlined style={{ fontSize: 24, color: 'var(--primary-color, #1677ff)' }} />
            <Title level={2} style={{ margin: 0, color: 'white' }}>
              Thống kê
            </Title>
          </div>
        </div>
      </div>

      {/* Tabs — extensible for future stats */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 12, border: '1px solid #374151' }}>
        <Tabs
          defaultActiveKey="reward"
          style={{ padding: '12px 20px 0' }}
          items={[
            {
              key: 'reward',
              label: 'Đổi thưởng',
              children: (
                <div style={{ padding: '16px 0 24px' }}>
                  <RewardStatistics />
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
