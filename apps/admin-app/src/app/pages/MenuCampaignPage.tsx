import React, { useCallback, useEffect, useState } from 'react';
import {
  Table, Button, Tag, App, Modal, Form, Input, InputNumber, Select,
  DatePicker, Card, Statistic, Row, Col, Space, Popconfirm, Progress, Tabs,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined,
  PlayCircleOutlined, PauseCircleOutlined, StopOutlined,
  DollarOutlined, ShoppingCartOutlined, UserOutlined, PercentageOutlined,
  ThunderboltOutlined, FireOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiClient } from '@gateway-workspace/shared/utils/client';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface Campaign {
  id: number;
  name: string;
  description: string | null;
  status: string;
  discountType: string;
  discountValue: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  totalBudget: number | null;
  spentBudget: number;
  totalUsageCount: number;
  maxUsesPerUserPerCampaign: number | null;
  maxUsesPerUserPerDay: number | null;
  minOrderValue: number | null;
  priority: number;
  testGroup: string | null;
  menuScopes: any[];
  customerScopes: any[];
  timeSlots: any[];
  comboRules: any[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'default' },
  ACTIVE: { label: 'Đang chạy', color: 'green' },
  PAUSED: { label: 'Tạm dừng', color: 'orange' },
  BUDGET_EXCEEDED: { label: 'Hết ngân sách', color: 'red' },
  EXPIRED: { label: 'Hết hạn', color: 'gray' },
  CANCELLED: { label: 'Đã huỷ', color: 'red' },
};

const DISCOUNT_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  PERCENTAGE: { label: 'Giảm %', icon: <PercentageOutlined /> },
  FIXED_AMOUNT: { label: 'Giảm cố định', icon: <DollarOutlined /> },
  FLAT_PRICE: { label: 'Đồng giá', icon: <ThunderboltOutlined /> },
  COMBO_DEAL: { label: 'Combo', icon: <FireOutlined /> },
};

const fmtMoney = (v: number) => `${v?.toLocaleString('vi-VN')  }đ`;

const MenuCampaignPage: React.FC = () => {
  const { notification, modal } = App.useApp();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // Lookup data for scope selectors
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [recipes, setRecipes] = useState<{ id: number; name: string; categoryId: number }[]>([]);
  const [machineGroups, setMachineGroups] = useState<{ MachineGroupId: number; MachineGroupName: string }[]>([]);
  const [ranks, setRanks] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    apiClient.get('/admin/menu/categories').then(r => setCategories((r.data || []).map((c: any) => ({ id: c.id, name: c.name })))).catch(() => {});
    apiClient.get('/admin/menu/items').then(r => setRecipes((r.data || []).map((i: any) => ({ id: i.id, name: i.name, categoryId: i.categoryId })))).catch(() => {});
    apiClient.get('/admin/menu/machine-groups').then(r => setMachineGroups(r.data || [])).catch(() => {});
    apiClient.get('/admin/user/ranks').then(r => setRanks(r.data || [])).catch(() => setRanks([{ id: 1, name: 'Đồng' }, { id: 2, name: 'Bạc' }, { id: 3, name: 'Vàng' }, { id: 4, name: 'Kim Cương' }]));
  }, []);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/menu-campaign', { params: statusFilter ? { status: statusFilter } : {} });
      setCampaigns(res.data);
    } catch {
      notification.error({ title: 'Lỗi tải danh sách campaign' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleOpenCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      discountType: 'PERCENTAGE',
      priority: 1,
      dateRange: [dayjs(), dayjs().add(7, 'day')],
      menuScopes: [{ scopeType: 'ALL' }],
      customerScopes: [{ scopeType: 'ALL_CUSTOMERS' }],
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (record: Campaign) => {
    setEditingId(record.id);
    const menuScopeType = record.menuScopes?.[0]?.scopeType || 'ALL';
    const menuScopeTargetIds = menuScopeType === 'ALL' ? [] : record.menuScopes.map(s => s.targetId).filter(Boolean);
    const customerScopeType = record.customerScopes?.[0]?.scopeType || 'ALL_CUSTOMERS';
    const customerScopeTargetIds = ['ALL_CUSTOMERS', 'NEW_MEMBER'].includes(customerScopeType)
      ? [] : record.customerScopes.map(s => s.targetId).filter(Boolean);
    form.setFieldsValue({
      ...record,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
      menuScopeType,
      menuScopeTargetIds,
      customerScopeType,
      customerScopeTargetIds,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const { dateRange, menuScopeType, menuScopeTargetIds, customerScopeType, customerScopeTargetIds, ...rest } = values;

      // Transform scope fields into arrays
      const menuScopes = menuScopeType === 'ALL'
        ? [{ scopeType: 'ALL' }]
        : (menuScopeTargetIds || []).map((id: number) => ({ scopeType: menuScopeType, targetId: id }));

      const customerScopes = (customerScopeType === 'ALL_CUSTOMERS' || customerScopeType === 'NEW_MEMBER')
        ? [{ scopeType: customerScopeType }]
        : (customerScopeTargetIds || []).map((id: any) => ({ scopeType: customerScopeType, targetId: Number(id) }));

      const payload = {
        ...rest,
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
        menuScopes,
        customerScopes,
      };

      if (editingId) {
        await apiClient.put(`/menu-campaign/${editingId}`, payload);
        notification.success({ title: 'Cập nhật thành công' });
      } else {
        await apiClient.post('/menu-campaign', payload);
        notification.success({ title: 'Tạo campaign thành công' });
      }
      setFormOpen(false);
      fetchCampaigns();
    } catch (err: any) {
      if (err?.response?.data?.message) {
        notification.error({ title: err.response.data.message });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await apiClient.patch(`/menu-campaign/${id}/status`, { status });
      notification.success({ title: `Đã chuyển sang ${STATUS_CONFIG[status]?.label}` });
      fetchCampaigns();
    } catch (err: any) {
      notification.error({ title: err?.response?.data?.message ?? 'Lỗi' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/menu-campaign/${id}`);
      notification.success({ title: 'Đã xoá campaign' });
      fetchCampaigns();
    } catch (err: any) {
      notification.error({ title: err?.response?.data?.message ?? 'Lỗi' });
    }
  };

  const columns: ColumnsType<Campaign> = [
    {
      title: 'Campaign', dataIndex: 'name', key: 'name',
      render: (name, r) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-400">
            {DISCOUNT_TYPE_CONFIG[r.discountType]?.icon}{' '}
            {r.discountType === 'PERCENTAGE' ? `${r.discountValue}%` : fmtMoney(r.discountValue)}
            {r.maxDiscountAmount ? ` (tối đa ${fmtMoney(r.maxDiscountAmount)})` : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (s) => <Tag color={STATUS_CONFIG[s]?.color}>{STATUS_CONFIG[s]?.label ?? s}</Tag>,
    },
    {
      title: 'Ngân sách', key: 'budget', width: 200,
      render: (_, r) => r.totalBudget ? (
        <div>
          <Progress
            percent={Math.round((r.spentBudget / r.totalBudget) * 100)}
            size="small"
            status={r.spentBudget >= r.totalBudget ? 'exception' : 'active'}
          />
          <div className="text-xs text-gray-400">{fmtMoney(r.spentBudget)} / {fmtMoney(r.totalBudget)}</div>
        </div>
      ) : <span className="text-gray-500">Không giới hạn</span>,
    },
    {
      title: 'Thời gian', key: 'date', width: 180,
      render: (_, r) => (
        <div className="text-xs">
          <div>{dayjs(r.startDate).format('DD/MM/YY HH:mm')}</div>
          <div className="text-gray-400">→ {dayjs(r.endDate).format('DD/MM/YY HH:mm')}</div>
        </div>
      ),
    },
    {
      title: 'Sử dụng', dataIndex: 'totalUsageCount', key: 'usage', width: 80,
      render: (v) => <Tag>{v} lần</Tag>,
    },
    {
      title: 'Ưu tiên', dataIndex: 'priority', key: 'priority', width: 70,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '', key: 'actions', width: 220,
      render: (_, r) => (
        <Space size="small">
          {r.status === 'DRAFT' && (
            <Button size="small" type="primary" icon={<PlayCircleOutlined />}
              style={{ background: '#22c55e', borderColor: '#22c55e' }}
              onClick={() => handleStatusChange(r.id, 'ACTIVE')}>Kích hoạt</Button>
          )}
          {r.status === 'ACTIVE' && (
            <Button size="small" icon={<PauseCircleOutlined />}
              onClick={() => handleStatusChange(r.id, 'PAUSED')}>Tạm dừng</Button>
          )}
          {r.status === 'PAUSED' && (
            <Button size="small" type="primary" icon={<PlayCircleOutlined />}
              onClick={() => handleStatusChange(r.id, 'ACTIVE')}>Tiếp tục</Button>
          )}
          {['DRAFT', 'PAUSED'].includes(r.status) && (
            <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(r)} />
          )}
          {r.status === 'DRAFT' && (
            <Popconfirm title="Xoá campaign này?" onConfirm={() => handleDelete(r.id)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
          {['ACTIVE', 'PAUSED'].includes(r.status) && (
            <Popconfirm title="Huỷ campaign này?" onConfirm={() => handleStatusChange(r.id, 'CANCELLED')}>
              <Button size="small" danger icon={<StopOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Summary stats
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');
  const totalSpent = campaigns.reduce((s, c) => s + c.spentBudget, 0);
  const totalUsage = campaigns.reduce((s, c) => s + c.totalUsageCount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white m-0">Khuyến mãi Menu</h2>
        <Space>
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }}
            options={[
              { value: '', label: 'Tất cả' },
              ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchCampaigns} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Tạo chiến dịch
          </Button>
        </Space>
      </div>

      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Card size="small"><Statistic title="Đang chạy" value={activeCampaigns.length} prefix={<PlayCircleOutlined />} /></Card>
        </Col>
        <Col span={8}>
          <Card size="small"><Statistic title="Tổng đã chi" value={totalSpent} prefix={<DollarOutlined />} suffix="đ" /></Card>
        </Col>
        <Col span={8}>
          <Card size="small"><Statistic title="Tổng lần sử dụng" value={totalUsage} prefix={<ShoppingCartOutlined />} /></Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={campaigns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        size="small"
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingId ? 'Chỉnh sửa chiến dịch' : 'Tạo chiến dịch mới'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        width={720}
        okText={editingId ? 'Cập nhật' : 'Tạo'}
      >
        <Form form={form} layout="vertical" size="middle" className="mt-2">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="Tên chiến dịch" rules={[{ required: true }]} className="mb-3">
                <Input placeholder="VD: Giảm 50% toàn menu" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="priority" label="Ưu tiên" className="mb-3">
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả" className="mb-4">
            <TextArea rows={2} placeholder="Mô tả ngắn gọn" />
          </Form.Item>

          <div className="h-px bg-gray-700 mb-4" />

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="discountType" label="Loại giảm giá" rules={[{ required: true }]} className="mb-3">
                <Select options={Object.entries(DISCOUNT_TYPE_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="discountValue" label="Giá trị" rules={[{ required: true }]} className="mb-3">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="50" formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''} parser={v => v?.replace(/,/g, '') as any} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxDiscountAmount" label="Giảm tối đa (đ)" className="mb-3">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="100,000,000" formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''} parser={v => v?.replace(/,/g, '') as any} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="dateRange" label="Thời gian chạy" rules={[{ required: true }]} className="mb-3">
            <RangePicker showTime format="DD/MM/YYYY HH:mm" className="w-full" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="totalBudget" label="Ngân sách (đ)" className="mb-3">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="100,000,000" formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''} parser={v => v?.replace(/,/g, '') as any} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minOrderValue" label="Đơn tối thiểu (đ)" className="mb-3">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="100,000,000" formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''} parser={v => v?.replace(/,/g, '') as any} />
              </Form.Item>
            </Col>
          </Row>

          <div className="h-px bg-gray-700 mb-4" />

          {/* Menu Scope */}
          <Form.Item label="Áp dụng cho menu" className="mb-1">
            <Form.Item name={['menuScopeType']} noStyle initialValue="ALL">
              <Select style={{ width: '100%' }} onChange={() => form.setFieldValue('menuScopeTargetIds', [])}>
                <Select.Option value="ALL">Toàn bộ menu</Select.Option>
                <Select.Option value="CATEGORY">Theo danh mục</Select.Option>
                <Select.Option value="RECIPE">Theo món cụ thể</Select.Option>
              </Select>
            </Form.Item>
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.menuScopeType !== cur.menuScopeType}>
            {() => {
              const type = form.getFieldValue('menuScopeType');
              if (type === 'CATEGORY') return (
                <Form.Item name="menuScopeTargetIds" className="mb-3">
                  <Select mode="multiple" placeholder="Chọn danh mục" options={categories.map(c => ({ value: c.id, label: c.name }))} />
                </Form.Item>
              );
              if (type === 'RECIPE') return (
                <Form.Item name="menuScopeTargetIds" className="mb-3">
                  <Select mode="multiple" placeholder="Chọn món" showSearch optionFilterProp="label"
                    options={recipes.map(r => ({ value: r.id, label: r.name }))} />
                </Form.Item>
              );
              return null;
            }}
          </Form.Item>

          {/* Customer Scope */}
          <Form.Item label="Đối tượng khách hàng" className="mb-1">
            <Form.Item name={['customerScopeType']} noStyle initialValue="ALL_CUSTOMERS">
              <Select style={{ width: '100%' }} onChange={() => form.setFieldValue('customerScopeTargetIds', [])}>
                <Select.Option value="ALL_CUSTOMERS">Tất cả khách</Select.Option>
                <Select.Option value="RANK">Theo hạng thành viên</Select.Option>
                <Select.Option value="MACHINE_GROUP">Theo nhóm máy</Select.Option>
                <Select.Option value="SPECIFIC_USER">User cụ thể (nhập ID)</Select.Option>
                <Select.Option value="NEW_MEMBER">Khách hàng mới</Select.Option>
              </Select>
            </Form.Item>
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.customerScopeType !== cur.customerScopeType}>
            {() => {
              const type = form.getFieldValue('customerScopeType');
              if (type === 'RANK') return (
                <Form.Item name="customerScopeTargetIds" className="mb-3">
                  <Select mode="multiple" placeholder="Chọn hạng" options={ranks.map(r => ({ value: r.id, label: r.name }))} />
                </Form.Item>
              );
              if (type === 'MACHINE_GROUP') return (
                <Form.Item name="customerScopeTargetIds" className="mb-3">
                  <Select mode="multiple" placeholder="Chọn nhóm máy" options={machineGroups.map(g => ({ value: g.MachineGroupId, label: g.MachineGroupName }))} />
                </Form.Item>
              );
              if (type === 'SPECIFIC_USER') return (
                <Form.Item name="customerScopeTargetIds" className="mb-3">
                  <Select mode="tags" placeholder="Nhập userId (VD: 101, 205)" tokenSeparators={[',',' ']} />
                </Form.Item>
              );
              return null;
            }}
          </Form.Item>

          <div className="h-px bg-gray-700 mb-4" />

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="maxUsesPerUserPerCampaign" label="Giới hạn/user/chiến dịch" className="mb-3">
                <InputNumber min={1} style={{ width: '100%' }} placeholder="100,000,000" formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''} parser={v => v?.replace(/,/g, '') as any} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxUsesPerUserPerDay" label="Giới hạn/user/ngày" className="mb-3">
                <InputNumber min={1} style={{ width: '100%' }} placeholder="100,000,000" formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''} parser={v => v?.replace(/,/g, '') as any} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="testGroup" label="A/B Test" className="mb-3">
                <Select allowClear placeholder="Tắt"
                  options={[{ value: 'A', label: 'Group A' }, { value: 'B', label: 'Group B' }]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuCampaignPage;
