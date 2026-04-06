import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Form,
  InputNumber,
  Input,
  Button,
  Typography,
  message,
  Skeleton,
  Descriptions,
  Spin,
  Modal,
  Tabs,
  Table,
  Switch,
  Tooltip,
  Select,
  Tag,
  Popconfirm,
  Checkbox,
  Empty,
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  InfoCircleOutlined,
  HolderOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
  DeleteOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import { useSearchParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Title } = Typography;

// ─── Wheel Preview (mini canvas) ───
function WheelPreview({ items }: { items: GameItem[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visibleItems = items.filter((i) => i.showOnWheel).sort((a, b) => a.displayOrder - b.displayOrder);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 280;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 8;

    ctx.clearRect(0, 0, size, size);

    if (visibleItems.length === 0) {
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      ctx.font = '14px Arial';
      ctx.fillText('Chưa có item', cx, cy);
      return;
    }

    visibleItems.forEach((seg, i) => {
      const startAngle = (i / visibleItems.length) * Math.PI * 2;
      const endAngle = ((i + 1) / visibleItems.length) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.background;
      ctx.fill();

      // Text
      ctx.save();
      const mid = (startAngle + endAngle) / 2;
      const tx = cx + Math.cos(mid) * radius * 0.6;
      const ty = cy + Math.sin(mid) * radius * 0.6;
      ctx.translate(tx, ty);
      ctx.rotate(mid + Math.PI / 2);
      ctx.fillStyle = seg.textColor;
      ctx.textAlign = 'center';
      ctx.font = 'bold 11px Arial';
      ctx.fillText(seg.title.length > 12 ? seg.title.slice(0, 12) + '…' : seg.title, 0, -4);
      ctx.font = '10px Arial';
      ctx.fillText(seg.value.toLocaleString(), 0, 10);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ff9900';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Jackpot', cx, cy + 5);
  }, [visibleItems]);

  return <canvas ref={canvasRef} style={{ width: 280, height: 280 }} />;
}

// ─── Sortable Table Row ───
function SortableRow({ children, ...props }: any) {
  const id = props['data-row-key'];
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 999, background: '#374151' } : {}),
  };
  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child: any) => {
        if (child?.key === 'drag') {
          return React.cloneElement(child, {
            children: (
              <HolderOutlined
                style={{ cursor: 'grab', color: '#6b7280', fontSize: 16 }}
                {...listeners}
              />
            ),
          });
        }
        return child;
      })}
    </tr>
  );
}

interface ServerTime {
  now: string;
  dayOfWeek: string;
  startDay: string;
  endDay: string;
  startWeek: string;
  endWeek: string;
  startMonth: string;
  endMonth: string;
}

interface GameItem {
  id: number;
  title: string;
  background: string;
  textColor: string;
  value: number;
  rating: number;
  showOnWheel: boolean;
  displayOrder: number;
}

// ─── System Tab (placeholder) ───
function SystemTab() {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#6b7280' }}>
      <SettingOutlined style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
      <div style={{ fontSize: 16 }}>Chưa có cấu hình hệ thống.</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>Các cấu hình chung sẽ được thêm tại đây.</div>
    </div>
  );
}

// ─── Game Tab ───
function GameTab({
  configForm,
  loading,
  saving,
  onSaveConfig,
}: {
  configForm: any;
  loading: boolean;
  saving: boolean;
  onSaveConfig: (values: any) => void;
}) {
  const [originalItems, setOriginalItems] = useState<GameItem[]>([]);
  const [items, setItems] = useState<GameItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [savingItems, setSavingItems] = useState(false);
  const [editingItem, setEditingItem] = useState<GameItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [lockedIds, setLockedIds] = useState<Set<number>>(new Set());

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const hasChanges = JSON.stringify(items) !== JSON.stringify(originalItems);

  const toggleLock = (id: number) => {
    setLockedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoadingItems(true);
      const res = await apiClient.get('/game/admin-items');
      const data = (Array.isArray(res.data) ? res.data : []).map((item: any) => ({
        ...item,
        showOnWheel: !!item.showOnWheel,
      }));
      setOriginalItems(data);
      setItems(data);
    } catch {
      setOriginalItems([]);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const openEditModal = (item: GameItem) => {
    setEditingItem(item);
    editForm.setFieldsValue({
      title: item.title,
      value: item.value,
      background: item.background,
      textColor: item.textColor,
      rating: item.rating,
    });
    setEditModalOpen(true);
  };

  // Save to local state + auto-redistribute rating
  const handleLocalSave = (values: any) => {
    if (!editingItem) return;
    let updated = items.map((item) =>
      item.id === editingItem.id ? { ...item, ...values } : item,
    );

    if (values.rating !== undefined && values.rating !== editingItem.rating) {
      const editedId = editingItem.id;
      const fixedSum = updated.reduce((sum, item) => {
        if (item.id === editedId || lockedIds.has(item.id)) return sum + Number(item.rating || 0);
        return sum;
      }, 0);
      const remaining = 100 - fixedSum;
      const unlocked = updated.filter((item) => item.id !== editedId && !lockedIds.has(item.id));

      if (unlocked.length > 0 && remaining >= 0) {
        const oldSum = unlocked.reduce((s, i) => s + Number(i.rating || 0), 0);
        updated = updated.map((item) => {
          if (item.id === editedId || lockedIds.has(item.id)) return item;
          const p = oldSum > 0 ? Number(item.rating || 0) / oldSum : 1 / unlocked.length;
          return { ...item, rating: Math.round(p * remaining * 100) / 100 };
        });
        const total = updated.reduce((s, i) => s + Number(i.rating || 0), 0);
        const diff = Math.round((100 - total) * 100) / 100;
        if (Math.abs(diff) > 0.001) {
          const last = [...updated].reverse().find((i) => i.id !== editedId && !lockedIds.has(i.id));
          if (last) updated = updated.map((i) => i.id === last.id ? { ...i, rating: Math.round((i.rating + diff) * 100) / 100 } : i);
        }
      }
    }

    setItems(updated);
    setEditModalOpen(false);
    message.info('Đã sửa (chưa lưu). Nhấn "Lưu thay đổi" để cập nhật.');
  };

  const handleRevert = () => {
    setItems([...originalItems]);
    message.info('Đã hoàn tác tất cả thay đổi.');
  };

  const handleBulkSave = async () => {
    const totalRating = items.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    if (Math.abs(totalRating - 100) > 0.01) {
      message.error(`Tổng tỉ lệ phải đạt 100%. Hiện tại: ${totalRating.toFixed(1)}%`);
      return;
    }
    try {
      setSavingItems(true);
      await apiClient.put('/game/bulk-items', { items });
      message.success('Cập nhật tất cả items thành công!');
      setOriginalItems([...items]);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể cập nhật items');
    } finally {
      setSavingItems(false);
    }
  };

  const toggleShowOnWheel = (id: number) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, showOnWheel: !item.showOnWheel } : item));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((item, idx) => ({ ...item, displayOrder: idx }));
    });
  };

  const colorCell = (color: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 20, height: 20, borderRadius: 4, background: color, border: '1px solid #555' }} />
      <span style={{ fontSize: 12, color: '#9ca3af' }}>{color}</span>
    </div>
  );

  const columns: any[] = [
    { key: 'drag', width: 40, align: 'center' as const, render: () => null },
    { title: '#', width: 40, render: (_: any, __: any, idx: number) => idx + 1 },
    { title: 'Tên giải thưởng', dataIndex: 'title', key: 'title' },
    { title: 'Giá trị (Sao)', dataIndex: 'value', key: 'value', width: 110, render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toLocaleString()}</span> },
    { title: 'Tỉ lệ (%)', dataIndex: 'rating', key: 'rating', width: 90, render: (v: number) => v != null ? `${v}%` : '—' },
    { title: 'Màu nền', dataIndex: 'background', key: 'background', width: 110, render: colorCell },
    { title: 'Màu chữ', dataIndex: 'textColor', key: 'textColor', width: 110, render: colorCell },
    {
      title: (
        <Tooltip title="Hiển thị trên vòng quay. Tắt = ẩn khỏi wheel nhưng vẫn có trong pool random.">
          <span style={{ cursor: 'help' }}>Wheel <InfoCircleOutlined style={{ fontSize: 11 }} /></span>
        </Tooltip>
      ),
      key: 'showOnWheel', width: 70, align: 'center' as const,
      render: (_: any, record: GameItem) => (
        <Switch size="small" checked={record.showOnWheel} onChange={() => toggleShowOnWheel(record.id)} />
      ),
    },
    {
      title: (
        <Tooltip title="Khoá tỉ lệ: item bị khoá sẽ không bị tự động cân chỉnh khi thay đổi tỉ lệ item khác.">
          <span style={{ cursor: 'help' }}>Lock <InfoCircleOutlined style={{ fontSize: 11 }} /></span>
        </Tooltip>
      ),
      key: 'lock', width: 60, align: 'center' as const,
      render: (_: any, record: GameItem) => {
        const locked = lockedIds.has(record.id);
        return (
          <Button type="text" size="small"
            icon={locked ? <LockOutlined style={{ color: '#f59e0b' }} /> : <UnlockOutlined style={{ color: '#6b7280' }} />}
            onClick={() => toggleLock(record.id)}
          />
        );
      },
    },
    {
      title: 'Sửa', key: 'action', width: 60, align: 'center' as const,
      render: (_: any, record: GameItem) => (
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} style={{ color: 'var(--primary-color, #1677ff)' }} />
      ),
    },
  ];

  if (loading) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <>
      {/* Config fields */}
      <Form form={configForm} layout="vertical" onFinish={onSaveConfig} requiredMark={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 48px' }}>
          <Form.Item name="SPEND_PER_ROUND" label={<span style={{ color: '#e5e7eb', fontWeight: 500 }}>Số tiền mỗi lượt quay (VNĐ)</span>} rules={[{ required: true, message: 'Bắt buộc' }]} extra={<span style={{ color: '#6b7280', fontSize: 12 }}>Số tiền nạp để được cộng 1 lượt quay</span>}>
            <InputNumber style={{ width: '100%' }} size="large" min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v) => v!.replace(/\$\s?|(,*)/g, '') as any} />
          </Form.Item>
          <Form.Item name="UP_RATE_AMOUNT" label={<span style={{ color: '#e5e7eb', fontWeight: 500 }}>Khoản kích hoạt Nổ Hũ (VNĐ)</span>} rules={[{ required: true, message: 'Bắt buộc' }]} extra={<span style={{ color: '#6b7280', fontSize: 12 }}>Quỹ vượt mức này → tỉ lệ Jackpot tăng</span>}>
            <InputNumber style={{ width: '100%' }} size="large" min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v) => v!.replace(/\$\s?|(,*)/g, '') as any} />
          </Form.Item>
          <Form.Item name="GAME_FUND_RATE" label={<span style={{ color: '#e5e7eb', fontWeight: 500 }}>Tỉ lệ góp hũ (%)</span>} rules={[{ required: true, message: 'Bắt buộc' }]} extra={<span style={{ color: '#6b7280', fontSize: 12 }}>% trích từ mỗi lượt quay vào quỹ Jackpot</span>}>
            <InputNumber style={{ width: '100%' }} size="large" min={0} max={100} step={0.1} addonAfter="%" />
          </Form.Item>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>Lưu cấu hình</Button>
        </div>
      </Form>

      {/* Items section */}
      <div style={{ marginTop: 24, borderTop: '1px solid #374151', paddingTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ color: '#e5e7eb', fontWeight: 600, fontSize: 15 }}>
            Danh sách giải thưởng (Items)
            {hasChanges && <span style={{ color: '#f59e0b', fontSize: 12, marginLeft: 8 }}>● Có thay đổi chưa lưu</span>}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="small" onClick={handleRevert} disabled={!hasChanges}>Hoàn tác</Button>
            <Button size="small" type="primary" icon={<SaveOutlined />} onClick={handleBulkSave} loading={savingItems} disabled={!hasChanges}>Lưu thay đổi</Button>
            <Button size="small" icon={<ReloadOutlined />} onClick={fetchItems} loading={loadingItems}>Làm mới</Button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {/* Table with drag-drop */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <Table
                  dataSource={items.map((item) => ({ ...item, key: item.id }))}
                  columns={columns}
                  loading={loadingItems}
                  pagination={false}
                  size="small"
                  bordered
                  components={{ body: { row: SortableRow } }}
                  rowClassName={(record: any) => record.showOnWheel ? '' : 'opacity-50'}
                />
              </SortableContext>
            </DndContext>
          </div>

          {/* Wheel Preview */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Xem trước vòng quay</span>
            <WheelPreview items={items} />
            <span style={{ color: '#6b7280', fontSize: 11 }}>
              {items.filter((i) => i.showOnWheel).length} / {items.length} items hiển thị
            </span>
          </div>
        </div>
      </div>

      {/* Edit Item Modal */}
      <Modal title={`Sửa giải thưởng: ${editingItem?.title || ''}`} open={editModalOpen} onCancel={() => setEditModalOpen(false)} footer={null} width={500}>
        <Form form={editForm} layout="vertical" onFinish={handleLocalSave} requiredMark={false}>
          <Form.Item name="title" label="Tên giải thưởng" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input size="large" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Form.Item name="value" label="Giá trị (Sao)" rules={[{ required: true, message: 'Bắt buộc' }]}>
              <InputNumber style={{ width: '100%' }} size="large" min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v) => v!.replace(/\$\s?|(,*)/g, '') as any} />
            </Form.Item>
            <Form.Item name="rating" label={editingItem && lockedIds.has(editingItem.id) ? <span>Tỉ lệ trúng (%) <LockOutlined style={{ color: '#f59e0b', fontSize: 12 }} /></span> : 'Tỉ lệ trúng (%)'}>
              <InputNumber style={{ width: '100%' }} size="large" min={0} max={100} step={0.1} disabled={!!editingItem && lockedIds.has(editingItem.id)} />
            </Form.Item>
            <Form.Item name="background" label="Màu nền"><Input size="large" /></Form.Item>
            <Form.Item name="textColor" label="Màu chữ"><Input size="large" /></Form.Item>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button onClick={() => setEditModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>Áp dụng</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

// ─── Reward Type labels ───
const REWARD_TYPE_OPTIONS = [
  { value: 'PLAY_TIME', label: 'Giờ chơi', color: 'blue' },
  { value: 'FOOD', label: 'Đồ ăn', color: 'orange' },
  { value: 'DRINK', label: 'Đồ uống', color: 'green' },
  { value: 'VOUCHER', label: 'Voucher', color: 'purple' },
  { value: 'OTHER', label: 'Khác', color: 'default' },
];

const WALLET_TYPE_OPTIONS = [
  { value: 'SUB', label: 'Tài khoản phụ (mặc định)' },
  { value: 'MAIN', label: 'Tài khoản chính' },
];

interface PromotionReward {
  id: number;
  name: string;
  description?: string;
  type: string;
  starsCost: number;
  walletType?: string;
  moneyAmount?: number;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  maxPerDay?: number;
  maxPerMonth?: number;
  totalQuantity?: number;
  recipes: { recipeId: number; quantity: number; recipeName?: string; salePrice?: number }[];
  categories: { categoryId: number; categoryName?: string }[];
}

interface RecipeOption {
  id: number;
  name: string;
  salePrice: number;
  imageUrl?: string;
  categoryId?: number;
}

interface CategoryOption {
  id: number;
  name: string;
  recipeCount: number;
}

// ─── Reward Tab ───
function RewardTab() {
  const [rewards, setRewards] = useState<PromotionReward[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<PromotionReward | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [rewardType, setRewardType] = useState('PLAY_TIME');
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [menuCategories, setMenuCategories] = useState<CategoryOption[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<{ recipeId: number; quantity: number }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [loadingMenuOptions, setLoadingMenuOptions] = useState(false);

  useEffect(() => { fetchRewards(); }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/promotion-reward');
      setRewards(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuOptions = async (type: string) => {
    if (!['FOOD', 'DRINK'].includes(type)) return;
    try {
      setLoadingMenuOptions(true);
      const res = await apiClient.get('/promotion-reward/menu-options', { params: { rewardType: type } });
      const data = res.data || {};
      setMenuCategories((data.categories || []).map((c: any) => ({ id: c.id, name: c.name, recipeCount: Number(c.recipeCount) || 0 })));
      setRecipes((data.recipes || []).map((r: any) => ({ id: r.id, name: r.name, salePrice: Number(r.salePrice) || 0, imageUrl: r.imageUrl, categoryId: r.categoryId })));
    } catch {
      setMenuCategories([]);
      setRecipes([]);
    } finally {
      setLoadingMenuOptions(false);
    }
  };

  const openCreateModal = () => {
    setEditingReward(null);
    setRewardType('PLAY_TIME');
    setSelectedRecipes([]);
    setSelectedCategories([]);
    setRecipeSearch('');
    form.resetFields();
    form.setFieldsValue({ type: 'PLAY_TIME', walletType: 'SUB', isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (reward: PromotionReward) => {
    setEditingReward(reward);
    setRewardType(reward.type);
    setSelectedRecipes(reward.recipes?.map(r => ({ recipeId: r.recipeId, quantity: r.quantity || 1 })) || []);
    setSelectedCategories(reward.categories?.map(c => c.categoryId) || []);
    setRecipeSearch('');
    if (['FOOD', 'DRINK'].includes(reward.type)) fetchMenuOptions(reward.type);
    form.setFieldsValue({
      name: reward.name,
      description: reward.description,
      type: reward.type,
      starsCost: reward.starsCost,
      walletType: reward.walletType || 'SUB',
      moneyAmount: reward.moneyAmount,
      isActive: reward.isActive,
      maxPerDay: reward.maxPerDay,
      maxPerMonth: reward.maxPerMonth,
      totalQuantity: reward.totalQuantity,
    });
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      setSaving(true);
      const isFoodDrink = ['FOOD', 'DRINK'].includes(values.type);
      const payload = {
        ...values,
        recipes: isFoodDrink ? selectedRecipes : [],
        categories: isFoodDrink ? selectedCategories.map(id => ({ categoryId: id })) : [],
      };
      if (editingReward) {
        await apiClient.put(`/promotion-reward/${editingReward.id}`, payload);
        message.success('Cập nhật thành công');
      } else {
        await apiClient.post('/promotion-reward', payload);
        message.success('Tạo mới thành công');
      }
      setModalOpen(false);
      fetchRewards();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await apiClient.patch(`/promotion-reward/${id}/toggle`);
      fetchRewards();
    } catch {
      message.error('Không thể thay đổi trạng thái');
    }
  };

  const typeTag = (type: string) => {
    const opt = REWARD_TYPE_OPTIONS.find(o => o.value === type);
    return <Tag color={opt?.color || 'default'}>{opt?.label || type}</Tag>;
  };

  const columns: any[] = [
    { title: '#', width: 45, render: (_: any, __: any, idx: number) => idx + 1 },
    { title: 'Tên', dataIndex: 'name', key: 'name', render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { title: 'Loại', dataIndex: 'type', key: 'type', width: 100, render: typeTag },
    {
      title: 'Chi tiết', key: 'detail', width: 200, ellipsis: true,
      render: (_: any, r: PromotionReward) => {
        let text = '—';
        if (r.type === 'PLAY_TIME') {
          text = `${r.moneyAmount?.toLocaleString()} VNĐ → ${r.walletType === 'MAIN' ? 'TK Chính' : 'TK Phụ'}`;
        } else if (['FOOD', 'DRINK'].includes(r.type)) {
          const parts: string[] = [];
          if (r.categories?.length) parts.push(r.categories.map(c => `[${c.categoryName}]`).join(', '));
          if (r.recipes?.length) parts.push(r.recipes.map(rc => rc.recipeName).join(', '));
          text = parts.join(' + ') || 'Chưa chọn món';
        }
        return <span title={text} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{text}</span>;
      },
    },
    {
      title: 'Sao', dataIndex: 'starsCost', key: 'starsCost', width: 80,
      render: (v: number) => <span style={{ fontWeight: 600, color: '#eab308', whiteSpace: 'nowrap' }}>⭐ {v?.toLocaleString()}</span>,
    },
    {
      title: 'Số lượng', key: 'totalQuantity', width: 90,
      render: (_: any, r: PromotionReward) => r.totalQuantity
        ? <span style={{ fontWeight: 500 }}>{r.totalQuantity.toLocaleString()}</span>
        : <span style={{ color: '#6b7280' }}>∞</span>,
    },
    {
      title: 'Giới hạn/user', key: 'limits', width: 130,
      render: (_: any, r: PromotionReward) => {
        const parts: string[] = [];
        if (r.maxPerDay) parts.push(`${r.maxPerDay}/ngày`);
        if (r.maxPerMonth) parts.push(`${r.maxPerMonth}/tháng`);
        return parts.length ? <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{parts.join(', ')}</span> : <span style={{ color: '#6b7280' }}>—</span>;
      },
    },
    {
      title: 'Trạng thái', key: 'isActive', width: 90, align: 'center' as const,
      render: (_: any, r: PromotionReward) => (
        <Switch size="small" checked={r.isActive} onChange={() => handleToggle(r.id)} />
      ),
    },
    {
      title: '', key: 'action', width: 50, align: 'center' as const,
      render: (_: any, r: PromotionReward) => (
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(r)} />
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: '#e5e7eb', fontWeight: 600, fontSize: 15 }}>Danh sách phần thưởng đổi</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>Thêm phần thưởng</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchRewards} loading={loading}>Làm mới</Button>
        </div>
      </div>

      <Table
        dataSource={rewards.map(r => ({ ...r, key: r.id }))}
        columns={columns}
        loading={loading}
        pagination={false}
        size="small"
        bordered
        locale={{ emptyText: <Empty description="Chưa có phần thưởng nào" /> }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingReward ? `Sửa: ${editingReward.name}` : 'Thêm phần thưởng mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
          <Form.Item name="name" label="Tên phần thưởng" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input size="large" placeholder="VD: 1 giờ chơi, Trà sữa size L..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả ngắn (tuỳ chọn)" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
              <Select
                size="large"
                options={REWARD_TYPE_OPTIONS}
                onChange={(v) => {
                  setRewardType(v);
                  setSelectedRecipes([]);
                  setSelectedCategories([]);
                  setRecipeSearch('');
                  if (['FOOD', 'DRINK'].includes(v)) fetchMenuOptions(v);
                }}
              />
            </Form.Item>
            <Form.Item name="starsCost" label="Số sao cần đổi" rules={[{ required: true, message: 'Bắt buộc' }]}>
              <InputNumber
                style={{ width: '100%' }} size="large" min={1}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v!.replace(/,/g, '') as any}
              />
            </Form.Item>
          </div>

          {/* PLAY_TIME fields */}
          {rewardType === 'PLAY_TIME' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
              <Form.Item name="walletType" label="Loại tài khoản">
                <Select size="large" options={WALLET_TYPE_OPTIONS} />
              </Form.Item>
              <Form.Item name="moneyAmount" label="Số tiền (VNĐ)" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <InputNumber
                  style={{ width: '100%' }} size="large" min={0}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(v) => v!.replace(/,/g, '') as any}
                />
              </Form.Item>
            </div>
          )}

          {/* FOOD/DRINK fields */}
          {['FOOD', 'DRINK'].includes(rewardType) && (
            <div style={{ marginBottom: 16 }}>
              {/* Category selection */}
              <label style={{ color: '#e5e7eb', fontWeight: 500, display: 'block', marginBottom: 8 }}>
                Chọn danh mục (user được chọn bất kỳ món nào trong danh mục)
              </label>
              <Select
                mode="multiple"
                placeholder="Chọn danh mục menu..."
                style={{ width: '100%', marginBottom: 12 }}
                value={selectedCategories}
                onChange={(vals) => {
                  setSelectedCategories(vals);
                  // Remove individually selected recipes that now belong to a selected category
                  setSelectedRecipes(prev => prev.filter(sr => {
                    const recipe = recipes.find(r => r.id === sr.recipeId);
                    return !recipe || !vals.includes(recipe.categoryId || 0);
                  }));
                }}
                options={menuCategories.map(c => ({ value: c.id, label: `${c.name} (${c.recipeCount} món)` }))}
                allowClear
              />

              {/* Individual recipe selection */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <label style={{ color: '#e5e7eb', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  Hoặc chọn từng món cụ thể
                </label>
                <Input
                  placeholder="Tìm món..."
                  allowClear
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #374151', borderRadius: 8, padding: 8 }}>
                {(() => {
                  // Filter out recipes already in selected categories, then filter by search
                  const filtered = recipes
                    .filter(r => !selectedCategories.includes(r.categoryId || 0))
                    .filter(r => !recipeSearch || r.name.toLowerCase().includes(recipeSearch.toLowerCase()));
                  if (filtered.length === 0) {
                    return <div style={{ color: '#6b7280', textAlign: 'center', padding: 16 }}>
                      {recipeSearch ? 'Không tìm thấy món nào' : 'Không còn món nào ngoài danh mục đã chọn'}
                    </div>;
                  }
                  return filtered.map(recipe => {
                    const isSelected = selectedRecipes.some(s => s.recipeId === recipe.id);
                    return (
                      <div
                        key={recipe.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                          borderRadius: 6, cursor: 'pointer',
                          background: isSelected ? 'rgba(22,119,255,0.1)' : 'transparent',
                        }}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedRecipes(prev => prev.filter(s => s.recipeId !== recipe.id));
                          } else {
                            setSelectedRecipes(prev => [...prev, { recipeId: recipe.id, quantity: 1 }]);
                          }
                        }}
                      >
                        <Checkbox checked={isSelected} />
                        <span style={{ flex: 1, color: '#e5e7eb' }}>{recipe.name}</span>
                        <span style={{ color: '#9ca3af', fontSize: 12 }}>{recipe.salePrice.toLocaleString()} VNĐ</span>
                      </div>
                    );
                  });
                })()}
              </div>
              {(selectedRecipes.length > 0 || selectedCategories.length > 0) && (
                <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                  {selectedCategories.length > 0 && `${selectedCategories.length} danh mục`}
                  {selectedCategories.length > 0 && selectedRecipes.length > 0 && ' + '}
                  {selectedRecipes.length > 0 && `${selectedRecipes.length} món riêng lẻ`}
                </div>
              )}
            </div>
          )}

          <Form.Item name="totalQuantity" label="Tổng số lượng (tất cả user)">
            <InputNumber
              style={{ width: '100%' }} size="large" min={1} placeholder="Không giới hạn"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => v!.replace(/,/g, '') as any}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Form.Item name="maxPerDay" label="Giới hạn/ngày/user">
              <InputNumber style={{ width: '100%' }} size="large" min={1} placeholder="Không giới hạn" />
            </Form.Item>
            <Form.Item name="maxPerMonth" label="Giới hạn/tháng/user">
              <InputNumber style={{ width: '100%' }} size="large" min={1} placeholder="Không giới hạn" />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
              {editingReward ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

// ─── Main ───
export default function SystemConfig() {
  const [gameForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverTime, setServerTime] = useState<ServerTime | null>(null);
  const [checkingTime, setCheckingTime] = useState(false);
  const [timeModalOpen, setTimeModalOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'game';

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/system-config');
      const data = res.data || {};
      gameForm.setFieldsValue({
        SPEND_PER_ROUND: data.SPEND_PER_ROUND ? Number(data.SPEND_PER_ROUND) : 30000,
        UP_RATE_AMOUNT: data.UP_RATE_AMOUNT ? Number(data.UP_RATE_AMOUNT) : 500000,
        JACKPOT_AMOUNT: data.JACKPOT_AMOUNT ? Number(data.JACKPOT_AMOUNT) : 0,
        GAME_FUND_RATE: data.GAME_FUND_RATE ? Number(data.GAME_FUND_RATE) : 1.5,
      });
    } catch (err) {
      console.error('Lỗi khi tải cấu hình', err);
      message.error('Không thể tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (values: any) => {
    try {
      setSaving(true);
      await apiClient.post('/system-config', values);
      message.success('Cập nhật cấu hình thành công!');
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình', err);
      message.error('Không thể lưu cấu hình hệ thống');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckServerTime = async () => {
    try {
      setCheckingTime(true);
      setTimeModalOpen(true);
      const res = await apiClient.get('/system-config/server-time');
      setServerTime(res.data);
    } catch (err) {
      console.error('Lỗi khi kiểm tra giờ hệ thống', err);
      message.error('Không thể kiểm tra giờ hệ thống');
    } finally {
      setCheckingTime(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ color: '#9ca3af', fontSize: 13, marginBottom: 4 }}>Dashboard / Cấu hình hệ thống</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SettingOutlined style={{ fontSize: 24, color: 'var(--primary-color, #1677ff)' }} />
            <Title level={2} style={{ margin: 0, color: 'white' }}>
              Cấu hình hệ thống
            </Title>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<ClockCircleOutlined />} onClick={handleCheckServerTime} loading={checkingTime}>
            Kiểm tra giờ
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchConfigs}>
            Làm mới
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 12, border: '1px solid #374151' }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setSearchParams({ tab: key })}
          style={{ padding: '12px 20px 0' }}
          items={[
            {
              key: 'system',
              label: 'Hệ thống',
              children: (
                <div style={{ padding: '16px 0 24px' }}>
                  <SystemTab />
                </div>
              ),
            },
            {
              key: 'game',
              label: 'Game',
              children: (
                <div style={{ padding: '16px 0 24px' }}>
                  <GameTab
                    configForm={gameForm}
                    loading={loading}
                    saving={saving}
                    onSaveConfig={handleSaveConfig}
                  />
                </div>
              ),
            },
            {
              key: 'reward',
              label: 'Đổi thưởng',
              children: (
                <div style={{ padding: '16px 0 24px' }}>
                  <RewardTab />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Server Time Modal */}
      <Modal
        title="Kiểm tra giờ hệ thống (Server)"
        open={timeModalOpen}
        onCancel={() => setTimeModalOpen(false)}
        footer={null}
        width={600}
      >
        {checkingTime && !serverTime ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
            <Spin />
          </div>
        ) : serverTime ? (
          <Descriptions bordered size="small" column={1} labelStyle={{ width: 160 }}>
            <Descriptions.Item label="Giờ hiện tại">{serverTime.now}</Descriptions.Item>
            <Descriptions.Item label="Thứ">{serverTime.dayOfWeek}</Descriptions.Item>
            <Descriptions.Item label="Start Day">{serverTime.startDay}</Descriptions.Item>
            <Descriptions.Item label="End Day">{serverTime.endDay}</Descriptions.Item>
            <Descriptions.Item label="Start Week">{serverTime.startWeek}</Descriptions.Item>
            <Descriptions.Item label="End Week">{serverTime.endWeek}</Descriptions.Item>
            <Descriptions.Item label="Start Month">{serverTime.startMonth}</Descriptions.Item>
            <Descriptions.Item label="End Month">{serverTime.endMonth}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    </div>
  );
}
