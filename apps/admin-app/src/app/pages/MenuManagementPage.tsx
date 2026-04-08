import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  EyeInvisibleOutlined,
  HolderOutlined,
  ClockCircleOutlined,
 TagOutlined } from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Breadcrumb,
  message,
  Popconfirm,
  Badge,
  Spin,
  Switch,
  TimePicker,
  DatePicker,
  Divider,
  Tooltip,
  Checkbox,
} from "antd";
import { apiClient } from "@gateway-workspace/shared/utils/client";

interface ActiveCampaign {
  id: number;
  name: string;
  discountType: string;
  discountValue: number;
  maxDiscountAmount: number | null;
  status: string;
  menuScopes: { scopeType: string; targetId: number | null }[];
}

const API_BASE = apiClient.defaults.baseURL || "";

function getImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_BASE}${imageUrl}`;
}

interface MachineGroup {
  MachineGroupId: number;
  MachineGroupName: string;
}

interface MenuCategory {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  _count: { recipes: number };
  scheduleEnabled: boolean;
  scheduleTimeStart: string | null;
  scheduleTimeEnd: string | null;
  scheduleDateStart: string | null;
  scheduleDateEnd: string | null;
  scheduleDayRules: string | null;
  scheduleMachineGroupIds: string | null;
  requiredCategoryIds: string | null;
}

interface MenuItem {
  id: number;
  name: string;
  salePrice: number;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: number | null;
  secondaryCategoryIds: string | null; // JSON array e.g. "[2,5]"
  category: { id: number; name: string } | null;
}

function parseSecondaryIds(raw: string | null): number[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

interface DaySchedule {
  day: number;     // 0=CN, 1=T2, ..., 6=T7
  enabled: boolean;
  timeStart: string; // "HH:mm"
  timeEnd: string;   // "HH:mm"
}

const DAY_LABELS: { value: number; label: string }[] = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "CN" },
];

const DEFAULT_DAY_SCHEDULES: DaySchedule[] = DAY_LABELS.map((d) => ({
  day: d.value,
  enabled: true,
  timeStart: "00:00",
  timeEnd: "23:59",
}));

function parseDaySchedules(raw: string | null): DaySchedule[] {
  if (!raw) return DEFAULT_DAY_SCHEDULES.map((d) => ({ ...d }));
  try {
    const parsed = JSON.parse(raw) as DaySchedule[];
    // Ensure all 7 days exist
    return DAY_LABELS.map((d) => {
      const found = parsed.find((p) => p.day === d.value);
      return found ?? { day: d.value, enabled: true, timeStart: "00:00", timeEnd: "23:59" };
    });
  } catch {
    return DEFAULT_DAY_SCHEDULES.map((d) => ({ ...d }));
  }
}

function SortableCategoryItem({
  cat,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onManageProducts,
}: {
  cat: MenuCategory;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onManageProducts: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center rounded px-2 py-1.5 cursor-pointer transition-colors ${
        isSelected ? "bg-blue-900/40" : "hover:bg-gray-700/50"
      }`}
      onClick={onSelect}
    >
      {/* Drag handle - fixed width */}
      <span
        {...attributes}
        {...listeners}
        className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing shrink-0 w-5 flex justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <HolderOutlined />
      </span>

      {/* Category name - takes remaining space, truncates */}
      <span className="text-gray-200 flex-1 truncate min-w-0 mx-2 text-sm">{cat.name}</span>

      {/* Fixed-width icons group - always 116px regardless of content */}
      <div className="flex items-center gap-1 shrink-0 w-[116px] justify-end">
        {cat.scheduleEnabled && (
          <Tooltip title="Đang hẹn giờ">
            <ClockCircleOutlined className="text-cyan-400" style={{ fontSize: 12 }} />
          </Tooltip>
        )}
        {cat.requiredCategoryIds && cat.requiredCategoryIds !== '[]' && (
          <Tooltip title="Yêu cầu món chính">
            <span className="text-orange-400 text-xs font-bold leading-none">!</span>
          </Tooltip>
        )}
        <span
          onClick={(e) => { e.stopPropagation(); onManageProducts(); }}
          className="cursor-pointer hover:opacity-80"
          title="Quản lý sản phẩm trong danh mục"
        >
          <Badge count={cat._count.recipes} showZero overflowCount={9999} style={{ backgroundColor: '#6b7280' }} />
        </span>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
        />
        <Popconfirm
          title="Xoá danh mục này?"
          description="Sản phẩm sẽ chuyển về Chưa phân loại"
          onConfirm={(e) => { e?.stopPropagation(); onDelete(); }}
          onCancel={(e) => e?.stopPropagation()}
        >
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Popconfirm>
      </div>
    </div>
  );
}

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const [catModalVisible, setCatModalVisible] = useState(false);
  const [editingCat, setEditingCat] = useState<MenuCategory | null>(null);
  const [catForm] = Form.useForm();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [machineGroups, setMachineGroups] = useState<MachineGroup[]>([]);
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>(DEFAULT_DAY_SCHEDULES.map((d) => ({ ...d })));

  /* ── Assign products modal ── */
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assignCat, setAssignCat] = useState<MenuCategory | null>(null);
  const [assignSelected, setAssignSelected] = useState<number[]>([]);
  const [assignSearch, setAssignSearch] = useState("");
  // IDs of items to keep in both categories (secondary)
  const [assignKeepBoth, setAssignKeepBoth] = useState<number[]>([]);

  const [activeCampaigns, setActiveCampaigns] = useState<ActiveCampaign[]>([]);

  useEffect(() => {
    fetchData();
    apiClient.get<MachineGroup[]>("/admin/menu/machine-groups")
      .then(r => setMachineGroups(r.data || []))
      .catch(() => {});
    apiClient.get("/menu-campaign", { params: { status: "ACTIVE" } })
      .then(r => setActiveCampaigns(r.data || []))
      .catch(() => {});
  }, []);

  const getItemCampaign = (item: MenuItem): { campaign: ActiveCampaign; discount: number } | null => {
    for (const c of activeCampaigns) {
      const scopes = c.menuScopes || [];
      const hasAll = scopes.some(s => s.scopeType === "ALL");
      const hasCat = scopes.some(s => s.scopeType === "CATEGORY" && s.targetId === item.categoryId);
      const hasRecipe = scopes.some(s => s.scopeType === "RECIPE" && s.targetId === item.id);
      if (!scopes.length || hasAll || hasCat || hasRecipe) {
        let discount = 0;
        const price = Number(item.salePrice);
        if (c.discountType === "PERCENTAGE") discount = price * c.discountValue / 100;
        else if (c.discountType === "FIXED_AMOUNT") discount = Math.min(c.discountValue, price);
        else if (c.discountType === "FLAT_PRICE") discount = Math.max(0, price - c.discountValue);
        if (c.maxDiscountAmount) discount = Math.min(discount, c.maxDiscountAmount);
        if (discount > 0) return { campaign: c, discount: Math.round(discount) };
      }
    }
    return null;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([
        apiClient.get<MenuCategory[]>("/admin/menu/categories"),
        apiClient.get<MenuItem[]>("/admin/menu/items"),
      ]);
      setCategories(catRes.data);
      setItems(itemRes.data);
    } catch {
      message.error("Lỗi khi tải dữ liệu menu");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems =
    selectedCategoryId === null
      ? items
      : selectedCategoryId === 0
        ? items.filter((i) => !i.categoryId && parseSecondaryIds(i.secondaryCategoryIds).length === 0)
        : items.filter((i) =>
            i.categoryId === selectedCategoryId ||
            parseSecondaryIds(i.secondaryCategoryIds).includes(selectedCategoryId)
          );

  // --- Category CRUD ---
  const openCatModal = (cat?: MenuCategory) => {
    setEditingCat(cat || null);
    setDaySchedules(parseDaySchedules(cat?.scheduleDayRules ?? null));
    catForm.setFieldsValue({
      name: cat?.name ?? "",
      scheduleDate: cat?.scheduleDateStart && cat?.scheduleDateEnd
        ? [dayjs(cat.scheduleDateStart), dayjs(cat.scheduleDateEnd)]
        : null,
      scheduleMachineGroupIds: cat?.scheduleMachineGroupIds
        ? JSON.parse(cat.scheduleMachineGroupIds)
        : [],
      requiredCategoryIds: cat?.requiredCategoryIds
        ? JSON.parse(cat.requiredCategoryIds)
        : [],
    });
    setCatModalVisible(true);
  };

  const handleCatSubmit = async (values: any) => {
    try {
      const payload: any = {
        name: values.name,
        scheduleEnabled: true,
        scheduleTimeStart: null,
        scheduleTimeEnd: null,
        scheduleDateStart: values.scheduleDate?.[0]?.toISOString() ?? null,
        scheduleDateEnd: values.scheduleDate?.[1]?.toISOString() ?? null,
        scheduleDayRules: JSON.stringify(daySchedules),
        scheduleMachineGroupIds: values.scheduleMachineGroupIds?.length
          ? JSON.stringify(values.scheduleMachineGroupIds)
          : null,
        requiredCategoryIds: values.requiredCategoryIds?.length
          ? JSON.stringify(values.requiredCategoryIds)
          : null,
      };
      if (editingCat) {
        await apiClient.patch(`/admin/menu/categories/${editingCat.id}`, payload);
        message.success("Cập nhật danh mục thành công");
      } else {
        await apiClient.post("/admin/menu/categories", payload);
        message.success("Thêm danh mục thành công");
      }
      setCatModalVisible(false);
      fetchData();
    } catch {
      message.error("Lỗi khi lưu danh mục");
    }
  };

  const handleDeleteCat = async (id: number) => {
    try {
      await apiClient.delete(`/admin/menu/categories/${id}`);
      message.success("Đã xoá danh mục");
      if (selectedCategoryId === id) setSelectedCategoryId(null);
      fetchData();
    } catch {
      message.error("Lỗi khi xoá danh mục");
    }
  };

  const openAssignModal = (cat: MenuCategory) => {
    setAssignCat(cat);
    // Chọn sẵn items có categoryId = cat.id HOẶC có cat.id trong secondaryCategoryIds
    const selected = items
      .filter((i) => i.categoryId === cat.id || parseSecondaryIds(i.secondaryCategoryIds).includes(cat.id))
      .map((i) => i.id);
    setAssignSelected(selected);
    // Items đã có sẵn trong secondaryCategoryIds cho category này
    const existingSecondary = items
      .filter((i) => i.categoryId !== cat.id && parseSecondaryIds(i.secondaryCategoryIds).includes(cat.id))
      .map((i) => i.id);
    setAssignKeepBoth(existingSecondary);
    setAssignSearch("");
    setAssignModalVisible(true);
  };

  const handleAssignSubmit = async () => {
    if (!assignCat) return;
    try {
      // Items đang thuộc category này (primary)
      const currentPrimaryIds = items.filter((i) => i.categoryId === assignCat.id).map((i) => i.id);
      // Items đang là secondary cho category này
      const currentSecondaryIds = items
        .filter((i) => i.categoryId !== assignCat.id && parseSecondaryIds(i.secondaryCategoryIds).includes(assignCat.id))
        .map((i) => i.id);
      const allCurrentIds = [...currentPrimaryIds, ...currentSecondaryIds];

      const newlyChecked = assignSelected.filter((id) => !allCurrentIds.includes(id));
      const unchecked = allCurrentIds.filter((id) => !assignSelected.includes(id));

      const promises: Promise<any>[] = [];

      // Newly checked items: chia ra "move" và "keep both"
      const toMoveAsPrimary = newlyChecked.filter((id) => !assignKeepBoth.includes(id));
      const toAddAsSecondary = newlyChecked.filter((id) => assignKeepBoth.includes(id));

      if (toMoveAsPrimary.length > 0) {
        promises.push(apiClient.patch("/admin/menu/items/bulk-assign", { categoryId: assignCat.id, recipeIds: toMoveAsPrimary }));
      }
      if (toAddAsSecondary.length > 0) {
        promises.push(apiClient.patch("/admin/menu/items/secondary-category/add", { categoryId: assignCat.id, recipeIds: toAddAsSecondary }));
      }

      // Unchecked items: xoá khỏi primary hoặc secondary
      const uncheckedPrimary = unchecked.filter((id) => currentPrimaryIds.includes(id));
      const uncheckedSecondary = unchecked.filter((id) => currentSecondaryIds.includes(id));

      if (uncheckedPrimary.length > 0) {
        promises.push(apiClient.patch("/admin/menu/items/bulk-assign", { categoryId: null, recipeIds: uncheckedPrimary }));
      }
      if (uncheckedSecondary.length > 0) {
        promises.push(apiClient.patch("/admin/menu/items/secondary-category/remove", { categoryId: assignCat.id, recipeIds: uncheckedSecondary }));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        message.success(`Đã cập nhật danh mục "${assignCat.name}"`);
        fetchData();
      }
      setAssignModalVisible(false);
    } catch {
      message.error("Lỗi khi cập nhật danh mục");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);
    const orders = reordered.map((c: any, i: number) => ({ id: c.id, sortOrder: i }));
    try {
      await apiClient.patch("/admin/menu/categories/reorder", { orders });
    } catch {
      message.error("Lỗi khi lưu thứ tự danh mục");
      fetchData();
    }
  };


  const totalItems = items.length;
  const activeItems = items.filter((i) => i.isActive).length;
  const uncategorized = items.filter((i) => !i.categoryId && parseSecondaryIds(i.secondaryCategoryIds).length === 0).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Breadcrumb className="mb-2" items={[{ title: "Dashboard" }, { title: "Quản lý Menu" }]} />
          <h1 className="text-2xl font-bold text-white m-0">Quản lý Menu</h1>
          <div className="text-gray-400 text-sm mt-1">
            {totalItems} sản phẩm &middot; {activeItems} đang hiển thị &middot; {uncategorized} chưa phân loại
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeCampaigns.map(c => (
            <span key={c.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border"
              style={{ borderColor: 'var(--ant-color-primary)', color: 'var(--ant-color-primary)', background: 'color-mix(in srgb, var(--ant-color-primary) 10%, transparent)' }}>
              <TagOutlined />
              {c.name}
              <span className="opacity-70">
                {c.discountType === 'PERCENTAGE' ? `−${c.discountValue}%` : c.discountType === 'FLAT_PRICE' ? `Đồng giá ${c.discountValue.toLocaleString()}đ` : `−${c.discountValue.toLocaleString()}đ`}
              </span>
            </span>
          ))}
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Left: Categories */}
        <Card
          className="bg-gray-800 border-gray-700 shrink-0"
          style={{ width: 340 }}
          title={<span className="text-gray-100">Danh mục</span>}
          extra={
            <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => openCatModal()}>Thêm</Button>
          }
        >
          {/* Fixed items */}
          <div
            className={`flex items-center gap-2 rounded px-3 py-1.5 cursor-pointer transition-colors ${selectedCategoryId === null ? "bg-blue-900/40" : "hover:bg-gray-700/50"}`}
            onClick={() => setSelectedCategoryId(null)}
          >
            <span className="text-gray-200 flex-1">Tất cả</span>
            <Badge count={totalItems} showZero overflowCount={9999} style={{ backgroundColor: '#6b7280' }} />
          </div>
          <div
            className={`flex items-center gap-2 rounded px-3 py-1.5 cursor-pointer transition-colors ${selectedCategoryId === 0 ? "bg-blue-900/40" : "hover:bg-gray-700/50"}`}
            onClick={() => setSelectedCategoryId(0)}
          >
            <span className="text-gray-200 flex-1">Chưa phân loại</span>
            <Badge count={uncategorized} showZero overflowCount={9999} style={{ backgroundColor: '#6b7280' }} />
          </div>

          {/* Sortable categories */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {categories.map((cat) => (
                <SortableCategoryItem
                  key={cat.id}
                  cat={cat}
                  isSelected={selectedCategoryId === cat.id}
                  onSelect={() => setSelectedCategoryId(cat.id)}
                  onEdit={() => openCatModal(cat)}
                  onDelete={() => handleDeleteCat(cat.id)}
                  onManageProducts={() => openAssignModal(cat)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </Card>

        {/* Right: Visual menu grid */}
        <div className="flex-1 min-w-0">
          {/* Category tabs */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <button
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategoryId === null
                  ? "bg-gradient-to-r from-pink-500 to-cyan-400 text-white shadow-lg"
                  : "bg-gray-800 text-gray-300 border border-gray-600 hover:border-gray-400"
              }`}
              onClick={() => setSelectedCategoryId(null)}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategoryId === cat.id
                    ? "bg-gradient-to-r from-pink-500 to-cyan-400 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 border border-gray-600 hover:border-gray-400"
                }`}
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product cards grid */}
          {loading ? (
            <div className="flex justify-center py-20"><Spin size="large" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`relative rounded-2xl overflow-hidden transition-all ${
                    !item.isActive ? "opacity-50" : ""
                  }`}
                  style={{ background: "#1e2433" }}
                >
                  <div className="aspect-[4/3] bg-gray-800 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={getImageUrl(item.imageUrl)!}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <AppstoreOutlined style={{ fontSize: 48 }} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-gray-100 text-sm truncate">{item.name}</div>
                    {(() => {
                      const promo = getItemCampaign(item);
                      if (promo && Number(item.salePrice) > 0) {
                        const newPrice = Number(item.salePrice) - promo.discount;
                        return (
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-gray-500 line-through text-sm">{Number(item.salePrice).toLocaleString()}đ</span>
                            <span className="font-extrabold text-base" style={{ color: 'var(--ant-color-primary)' }}>{newPrice.toLocaleString()}đ</span>
                          </div>
                        );
                      }
                      return <div className="text-pink-400 font-extrabold text-base mt-1">{Number(item.salePrice).toLocaleString()}đ</div>;
                    })()}
                  </div>
                  {(() => {
                    const promo = getItemCampaign(item);
                    return promo ? (
                      <div className="absolute top-2 left-2 text-white text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'var(--ant-color-primary)' }}>
                        {promo.campaign.discountType === 'PERCENTAGE' ? `−${promo.campaign.discountValue}%` : `−${promo.discount.toLocaleString()}đ`}
                      </div>
                    ) : null;
                  })()}
                  {!item.isActive && (
                    <div className="absolute top-2 right-2 bg-red-500/80 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <EyeInvisibleOutlined /> Ẩn
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <Modal
        title={editingCat ? "Sửa danh mục" : "Thêm danh mục"}
        open={catModalVisible}
        onCancel={() => setCatModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={catForm} layout="vertical" onFinish={handleCatSubmit} className="mt-4">
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: "Nhập tên danh mục" }]}>
            <Input placeholder="VD: Khuyến mãi, Đặc biệt, Combo..." />
          </Form.Item>

          <Divider className="my-3" />

          <div className="bg-gray-900 rounded-lg p-4 flex flex-col gap-4">
              {/* Lịch theo ngày trong tuần */}
              <div>
                <div className="text-gray-300 text-sm font-medium mb-2">Khung giờ theo ngày</div>
                <div className="flex flex-col gap-1">
                  {daySchedules.map((ds, idx) => {
                    const label = DAY_LABELS.find((d) => d.value === ds.day)?.label ?? "";
                    return (
                      <div
                        key={ds.day}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded ${ds.enabled ? "bg-gray-800" : "bg-gray-800/40 opacity-60"}`}
                      >
                        <Switch
                          size="small"
                          checked={ds.enabled}
                          onChange={(checked) => {
                            const updated = [...daySchedules];
                            updated[idx] = { ...updated[idx], enabled: checked };
                            setDaySchedules(updated);
                          }}
                        />
                        <span className="text-gray-200 text-sm w-12 font-medium">{label}</span>
                        <TimePicker.RangePicker
                          format="HH:mm"
                          minuteStep={15}
                          size="small"
                          disabled={!ds.enabled}
                          style={{ flex: 1 }}
                          placeholder={["Từ", "Đến"]}
                          value={[dayjs(ds.timeStart, "HH:mm"), dayjs(ds.timeEnd, "HH:mm")]}
                          onChange={(values) => {
                            const updated = [...daySchedules];
                            updated[idx] = {
                              ...updated[idx],
                              timeStart: values?.[0]?.format("HH:mm") ?? "00:00",
                              timeEnd: values?.[1]?.format("HH:mm") ?? "23:59",
                            };
                            setDaySchedules(updated);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <Form.Item name="scheduleDate" label="Khoảng ngày áp dụng (để trống = luôn luôn)" className="mb-0">
                <DatePicker.RangePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  placeholder={["Từ ngày", "Đến ngày"]}
                />
              </Form.Item>

              <Form.Item name="scheduleMachineGroupIds" label="Nhóm máy áp dụng (để trống = tất cả)" className="mb-0">
                <Select
                  mode="multiple"
                  placeholder="Chọn nhóm máy..."
                  allowClear
                  options={machineGroups.map(g => ({
                    label: g.MachineGroupName,
                    value: g.MachineGroupId,
                  }))}
                />
              </Form.Item>
            </div>

          <Divider className="my-3" />

          <Form.Item
            name="requiredCategoryIds"
            label={
              <span className="text-gray-200 font-medium">
                Yêu cầu món chính từ danh mục{" "}
                <span className="text-gray-500 font-normal text-xs">(để trống = không ràng buộc)</span>
              </span>
            }
          >
            <Select
              mode="multiple"
              placeholder="Chọn danh mục bắt buộc phải có trước khi order món này..."
              allowClear
              options={categories
                .filter((c) => c.id !== editingCat?.id)
                .map((c) => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setCatModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu</Button>
          </div>
        </Form>
      </Modal>

      {/* Assign Products Modal */}
      <Modal
        title={assignCat ? `Quản lý sản phẩm — ${assignCat.name}` : "Quản lý sản phẩm"}
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        onOk={handleAssignSubmit}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
        destroyOnClose
      >
        <div className="mb-3 text-gray-400 text-sm">
          Tick chọn sản phẩm muốn thêm vào danh mục "{assignCat?.name}". Bỏ tick để xoá khỏi danh mục.
        </div>
        <Input.Search
          placeholder="Tìm sản phẩm..."
          allowClear
          className="mb-3"
          value={assignSearch}
          onChange={(e) => setAssignSearch(e.target.value)}
        />
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <div className="flex flex-col gap-1">
            {items
              .filter((i) => i.isActive)
              .filter((i) => !assignSearch || i.name.toLowerCase().includes(assignSearch.toLowerCase()))
              .map((item) => {
                const inThisCat = item.categoryId === assignCat?.id;
                const isSecondaryHere = parseSecondaryIds(item.secondaryCategoryIds).includes(assignCat?.id ?? 0);
                const inOtherCat = item.categoryId && item.categoryId !== assignCat?.id;
                const otherCatName = inOtherCat ? categories.find((c) => c.id === item.categoryId)?.name : null;
                const isChecked = assignSelected.includes(item.id);
                const isKeptBoth = assignKeepBoth.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center px-3 py-2 rounded hover:bg-gray-700/50 ${inThisCat || isSecondaryHere ? 'bg-green-900/20' : ''}`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked && inOtherCat && !isSecondaryHere) {
                          // Item đang ở danh mục khác → hỏi xác nhận
                          Modal.confirm({
                            title: 'Sản phẩm thuộc danh mục khác',
                            content: (
                              <span>
                                Bạn đang chọn <b>{item.name}</b> — món này đang nằm ở danh mục <b>{otherCatName}</b>.
                                Bạn muốn giữ lại cả 2 hay xoá ở danh mục <b>{otherCatName}</b>?
                              </span>
                            ),
                            okText: 'Giữ lại',
                            cancelText: `Xoá ở "${otherCatName}"`,
                            okButtonProps: { style: { background: '#22c55e', borderColor: '#22c55e' } },
                            cancelButtonProps: { danger: true },
                            onOk: () => {
                              // Giữ lại cả 2: thêm vào assignKeepBoth
                              setAssignSelected((prev) => [...prev, item.id]);
                              setAssignKeepBoth((prev) => [...prev, item.id]);
                            },
                            onCancel: () => {
                              // Xoá ở danh mục khác: move sang danh mục hiện tại (KHÔNG thêm vào keepBoth)
                              setAssignSelected((prev) => [...prev, item.id]);
                              setAssignKeepBoth((prev) => prev.filter((id) => id !== item.id));
                            },
                          });
                        } else if (checked) {
                          setAssignSelected((prev) => [...prev, item.id]);
                        } else {
                          setAssignSelected((prev) => prev.filter((id) => id !== item.id));
                          setAssignKeepBoth((prev) => prev.filter((id) => id !== item.id));
                        }
                      }}
                      className="flex-1"
                    >
                      <span className="text-gray-200">{item.name}</span>
                      <span className="text-gray-500 text-xs ml-2">{Number(item.salePrice).toLocaleString()}đ</span>
                    </Checkbox>
                    {otherCatName && (
                      <span className={`text-xs shrink-0 ${isKeptBoth ? 'text-green-400' : 'text-yellow-400'}`}>
                        ({otherCatName}{isKeptBoth ? ' · giữ lại' : ''})
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </Modal>

    </div>
  );
}
