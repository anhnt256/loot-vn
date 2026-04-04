import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  EyeInvisibleOutlined,
  LoadingOutlined,
  CameraOutlined,
  HolderOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
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
  InputNumber,
  Select,
  Card,
  Breadcrumb,
  Space,
  message,
  Popconfirm,
  Badge,
  Spin,
  Upload,
  Switch,
  TimePicker,
  DatePicker,
  Divider,
  Tooltip,
} from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import { apiClient } from "@gateway-workspace/shared/utils/client";

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
  category: { id: number; name: string } | null;
}

function SortableCategoryItem({
  cat,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  cat: MenuCategory;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
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
        <Badge count={cat._count.recipes} showZero style={{ backgroundColor: '#6b7280' }} />
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
  const [catScheduleEnabled, setCatScheduleEnabled] = useState(false);

  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
    apiClient.get<MachineGroup[]>("/admin/menu/machine-groups")
      .then(r => setMachineGroups(r.data || []))
      .catch(() => {});
  }, []);

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
        ? items.filter((i) => !i.categoryId)
        : items.filter((i) => i.categoryId === selectedCategoryId);

  // --- Category CRUD ---
  const openCatModal = (cat?: MenuCategory) => {
    setEditingCat(cat || null);
    const enabled = cat?.scheduleEnabled ?? false;
    setCatScheduleEnabled(enabled);
    catForm.setFieldsValue({
      name: cat?.name ?? "",
      scheduleEnabled: enabled,
      scheduleTime: cat?.scheduleTimeStart && cat?.scheduleTimeEnd
        ? [dayjs(cat.scheduleTimeStart, "HH:mm"), dayjs(cat.scheduleTimeEnd, "HH:mm")]
        : null,
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
        scheduleEnabled: values.scheduleEnabled ?? false,
        scheduleTimeStart: values.scheduleTime?.[0]?.format("HH:mm") ?? null,
        scheduleTimeEnd: values.scheduleTime?.[1]?.format("HH:mm") ?? null,
        scheduleDateStart: values.scheduleDate?.[0]?.toISOString() ?? null,
        scheduleDateEnd: values.scheduleDate?.[1]?.toISOString() ?? null,
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

  // --- Item CRUD ---
  const openItemModal = (item?: MenuItem) => {
    setEditingItem(item || null);
    if (item) {
      itemForm.setFieldsValue({
        name: item.name,
        salePrice: Number(item.salePrice),
        categoryId: item.categoryId,
      });
      setImageUrl(item.imageUrl);
    } else {
      itemForm.setFieldsValue({
        name: "",
        salePrice: 0,
        categoryId: selectedCategoryId && selectedCategoryId > 0 ? selectedCategoryId : undefined,
      });
      setImageUrl(null);
    }
    setItemModalVisible(true);
  };

  const handleItemSubmit = async (values: any) => {
    try {
      const payload = { ...values, imageUrl };
      if (editingItem) {
        await apiClient.patch(`/admin/menu/items/${editingItem.id}`, payload);
        message.success("Cập nhật sản phẩm thành công");
      } else {
        await apiClient.post("/admin/menu/items", payload);
        message.success("Thêm sản phẩm thành công");
      }
      setItemModalVisible(false);
      fetchData();
    } catch {
      message.error("Lỗi khi lưu sản phẩm");
    }
  };

  const handleUploadChange = (info: UploadChangeParam) => {
    if (info.file.status === "uploading") {
      setUploading(true);
      return;
    }
    if (info.file.status === "done") {
      setUploading(false);
      const url = info.file.response?.imageUrl;
      if (url) {
        setImageUrl(url);
        message.success("Upload thành công");
      }
    }
    if (info.file.status === "error") {
      setUploading(false);
      message.error("Upload thất bại");
    }
  };

  const totalItems = items.length;
  const activeItems = items.filter((i) => i.isActive).length;
  const uncategorized = items.filter((i) => !i.categoryId).length;

  const previewUrl = getImageUrl(imageUrl);

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
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openItemModal()}>Thêm sản phẩm</Button>
        </Space>
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
            <Badge count={totalItems} showZero style={{ backgroundColor: '#6b7280' }} />
          </div>
          <div
            className={`flex items-center gap-2 rounded px-3 py-1.5 cursor-pointer transition-colors ${selectedCategoryId === 0 ? "bg-blue-900/40" : "hover:bg-gray-700/50"}`}
            onClick={() => setSelectedCategoryId(0)}
          >
            <span className="text-gray-200 flex-1">Chưa phân loại</span>
            <Badge count={uncategorized} showZero style={{ backgroundColor: '#6b7280' }} />
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
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-pink-500/50 ${
                    !item.isActive ? "opacity-50" : ""
                  }`}
                  style={{ background: "#1e2433" }}
                  onClick={() => openItemModal(item)}
                >
                  <div className="aspect-[4/3] bg-gray-800 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={getImageUrl(item.imageUrl)!}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <AppstoreOutlined style={{ fontSize: 48 }} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-gray-100 text-sm truncate">{item.name}</div>
                    <div className="text-pink-400 font-extrabold text-base mt-1">
                      {Number(item.salePrice).toLocaleString()}đ
                    </div>
                  </div>
                  {!item.isActive && (
                    <div className="absolute top-2 right-2 bg-red-500/80 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <EyeInvisibleOutlined /> Ẩn
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                      Chỉnh sửa
                    </span>
                  </div>
                </div>
              ))}

              <div
                className="rounded-2xl border-2 border-dashed border-gray-600 hover:border-pink-500 flex flex-col items-center justify-center cursor-pointer transition-colors"
                style={{ minHeight: 200 }}
                onClick={() => openItemModal()}
              >
                <PlusOutlined className="text-3xl text-gray-500 mb-2" />
                <span className="text-gray-500 text-sm">Thêm sản phẩm</span>
              </div>
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

          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-200 font-medium flex items-center gap-2">
              <ClockCircleOutlined className="text-cyan-400" /> Hẹn giờ hiển thị
            </span>
            <Form.Item name="scheduleEnabled" valuePropName="checked" className="mb-0">
              <Switch
                checkedChildren="Bật"
                unCheckedChildren="Tắt"
                onChange={setCatScheduleEnabled}
              />
            </Form.Item>
          </div>

          {catScheduleEnabled && (
            <div className="bg-gray-900 rounded-lg p-4 flex flex-col gap-4">
              <Form.Item name="scheduleTime" label="Khung giờ hiển thị" className="mb-0">
                <TimePicker.RangePicker
                  format="HH:mm"
                  minuteStep={15}
                  style={{ width: "100%" }}
                  placeholder={["Từ giờ", "Đến giờ"]}
                />
              </Form.Item>

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
          )}

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

      {/* Item Modal */}
      <Modal
        title={editingItem ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        open={itemModalVisible}
        onCancel={() => setItemModalVisible(false)}
        footer={null}
        destroyOnHidden
        width={520}
      >
        <Form form={itemForm} layout="vertical" onFinish={handleItemSubmit} className="mt-4">
          {/* Image upload */}
          <Form.Item label="Hình ảnh sản phẩm">
            <Upload
              name="file"
              showUploadList={false}
              action={`${API_BASE}/admin/menu/upload`}
              onChange={handleUploadChange}
              accept="image/*"
            >
              <div
                className="relative cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-gray-600 hover:border-pink-500 transition-colors"
                style={{ width: 200, height: 150 }}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <CameraOutlined className="text-white text-2xl" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    {uploading ? <LoadingOutlined className="text-2xl" /> : <CameraOutlined className="text-2xl" />}
                    <span className="text-xs mt-2">{uploading ? "Đang tải..." : "Click để chọn ảnh"}</span>
                  </div>
                )}
              </div>
            </Upload>
          </Form.Item>

          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: "Nhập tên sản phẩm" }]}>
            <Input placeholder="VD: Trà Sữa Trân Châu, Cà Phê Sữa Đá..." size="large" />
          </Form.Item>
          <Form.Item name="salePrice" label="Giá bán (VNĐ)">
            <InputNumber
              placeholder="VD: 35000"
              min={0}
              style={{ width: "100%" }}
              size="large"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>
          <Form.Item name="categoryId" label="Danh mục">
            <Select placeholder="Chọn danh mục" allowClear>
              {categories.map((c) => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setItemModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" size="large">Lưu</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
