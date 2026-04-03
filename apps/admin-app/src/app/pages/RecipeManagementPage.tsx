import { useState, useEffect } from "react";
import { PlusOutlined, EditOutlined, ReloadOutlined, DeleteOutlined, SettingOutlined, HistoryOutlined, SwapOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Tag, Button, Modal, Form, Input, message, Select, Card, Breadcrumb, Space, InputNumber, Divider } from "antd";
import type { ColumnsType } from "antd/es/table";
import { apiClient } from "@gateway-workspace/shared/utils/client";

const API_BASE = apiClient.defaults.baseURL || '';

interface Recipe {
  id: number;
  name: string;
  salePrice: number;
  imageUrl: string | null;
  isActive: boolean;
  versions: RecipeVersion[];
}

interface RecipeVersion {
  id: number;
  versionName: string;
  isActive: boolean;
  effectiveFrom: string;
  items: RecipeItem[];
}

interface RecipeItem {
  id: number;
  materialId: number;
  quantity: number;
  unit: string;
  material?: { name: string; baseUnit: string };
}

interface Material {
  id: number;
  name: string;
  baseUnit: string;
}

function imgSrc(url: string | null) {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export default function RecipeManagementPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);

  const [createVisible, setCreateVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [createLoading, setCreateLoading] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Compare modal
  const [compareVisible, setCompareVisible] = useState(false);
  const [compareRecipe, setCompareRecipe] = useState<Recipe | null>(null);
  const [leftVersionId, setLeftVersionId] = useState<number | null>(null);
  const [rightVersionId, setRightVersionId] = useState<number | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recipesRes, materialsRes] = await Promise.all([
        apiClient.get<Recipe[]>("/admin/materials/recipes"),
        apiClient.get<Material[]>("/admin/materials")
      ]);
      setRecipes(recipesRes.data);
      setMaterials(materialsRes.data);
    } catch {
      message.error("Lỗi khi tải dữ liệu công thức");
    } finally {
      setLoading(false);
    }
  };

  // --- Compare ---
  const openCompare = (recipe: Recipe) => {
    setCompareRecipe(recipe);
    const versions = recipe.versions;
    // Default: active (newest) vs previous
    const active = versions.find(v => v.isActive) || versions[0];
    const prev = versions.length > 1 ? versions[1] : null;
    setRightVersionId(active?.id || null);
    setLeftVersionId(prev?.id || null);
    setCompareVisible(true);
  };

  // --- Edit ---
  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    const activeVersion = recipe.versions?.find(v => v.isActive) || recipe.versions?.[0];
    const items = activeVersion?.items?.map(item => ({
      materialId: item.materialId,
      quantity: Number(item.quantity),
      unit: item.unit || '',
    })) || [];
    editForm.setFieldsValue({ items });
    setEditVisible(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingRecipe) return;
    if (!values.items || values.items.length === 0) {
      message.warning("Cần ít nhất 1 nguyên liệu");
      return;
    }
    setEditLoading(true);
    try {
      await apiClient.patch(`/admin/materials/recipes/${editingRecipe.id}`, { items: values.items });
      message.success("Cập nhật BOM thành công!");
      setEditVisible(false);
      fetchData();
    } catch {
      message.error("Lỗi khi cập nhật BOM");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateSubmit = async (values: any) => {
    setCreateLoading(true);
    try {
      await apiClient.post("/admin/materials/recipes", values);
      message.success("Thiết lập công thức thành công!");
      setCreateVisible(false);
      fetchData();
    } catch {
      message.error("Lỗi khi lưu công thức");
    } finally {
      setCreateLoading(false);
    }
  };

  // --- Table ---
  const columns: ColumnsType<Recipe> = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          {record.imageUrl ? (
            <img src={imgSrc(record.imageUrl)} alt={text} className="w-12 h-12 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-700 shrink-0" />
          )}
          <div>
            <div className="font-bold text-gray-100">{text}</div>
            <div className="text-gray-400 text-xs">Giá bán: {Number(record.salePrice).toLocaleString()}đ</div>
          </div>
        </div>
      )
    },
    {
      title: "Công thức hiện tại",
      key: "items",
      render: (_, record) => {
        const activeVersion = record.versions?.find(v => v.isActive) || record.versions?.[0];
        if (!activeVersion) return <span className="text-gray-500 italic">Chưa thiết lập</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {activeVersion.items.map(item => (
              <Tag key={item.id} color="blue" className="m-0">
                {item.material?.name}: {Number(item.quantity)} {item.unit || item.material?.baseUnit}
              </Tag>
            ))}
          </div>
        );
      }
    },
    {
      title: "Version",
      key: "version",
      width: 110,
      render: (_, record) => {
        const activeVersion = record.versions?.find(v => v.isActive) || record.versions?.[0];
        const count = record.versions?.length || 0;
        if (!activeVersion) return <span className="text-gray-500">-</span>;
        return (
          <Button
            type="link"
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => openCompare(record)}
            disabled={count < 2}
            className="p-0"
          >
            {activeVersion.versionName}
            {count > 1 && <span className="text-gray-500 ml-1">({count})</span>}
          </Button>
        );
      }
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 110,
      render: (active) => <Tag color={active ? "green" : "red"}>{active ? "Hoạt động" : "Tạm dừng"}</Tag>
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>Sửa BOM</Button>
      )
    }
  ];

  const renderItemsForm = () => (
    <Form.List name="items">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Space key={key} style={{ display: 'flex', marginBottom: 16 }} align="baseline">
              <Form.Item {...restField} name={[name, 'materialId']} rules={[{ required: true, message: 'Chọn NVL' }]} style={{ width: 300 }}>
                <Select placeholder="Nguyên liệu" showSearch optionFilterProp="children">
                  {materials.map(m => (
                    <Select.Option key={m.id} value={m.id}>{m.name} ({m.baseUnit})</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true, message: 'Nhập SL' }]}>
                <InputNumber placeholder="SL" min={0.0001} step={0.1} style={{ width: 120 }} />
              </Form.Item>
              <Form.Item {...restField} name={[name, 'unit']}>
                <Input placeholder="ĐVT" style={{ width: 100 }} />
              </Form.Item>
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
            </Space>
          ))}
          <Form.Item>
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm nguyên liệu</Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );

  // --- Compare helpers ---
  const leftVersion = compareRecipe?.versions.find(v => v.id === leftVersionId) || null;
  const rightVersion = compareRecipe?.versions.find(v => v.id === rightVersionId) || null;

  // Build diff: material name -> { left, right }
  const buildDiff = () => {
    if (!leftVersion || !rightVersion) return [];
    const map = new Map<number, { name: string; baseUnit: string; left: RecipeItem | null; right: RecipeItem | null }>();

    for (const item of leftVersion.items) {
      map.set(item.materialId, {
        name: item.material?.name || `#${item.materialId}`,
        baseUnit: item.material?.baseUnit || '',
        left: item,
        right: null,
      });
    }
    for (const item of rightVersion.items) {
      const existing = map.get(item.materialId);
      if (existing) {
        existing.right = item;
      } else {
        map.set(item.materialId, {
          name: item.material?.name || `#${item.materialId}`,
          baseUnit: item.material?.baseUnit || '',
          left: null,
          right: item,
        });
      }
    }
    return Array.from(map.values());
  };

  const diffRows = buildDiff();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Breadcrumb className="mb-2" items={[{ title: "Dashboard" }, { title: "Quản lý kho" }, { title: "Định mức (BOM)" }]} />
          <h1 className="text-2xl font-bold text-white m-0">Công thức & Định mức (BOM)</h1>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setCreateVisible(true); }}>Thiết lập BOM</Button>
        </Space>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <div className="mb-4">
          <Input
            placeholder="Tìm theo tên sản phẩm..."
            prefix={<SearchOutlined className="text-gray-400" />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 320 }}
            size="large"
          />
        </div>
        <Table
          columns={columns}
          dataSource={recipes.filter((r) =>
            !searchText || r.name.toLowerCase().includes(searchText.toLowerCase())
          )}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 12 }}
          className="custom-table"
        />
      </Card>

      {/* Create Modal */}
      <Modal title="Thiết lập Công thức / Định mức (BOM)" open={createVisible} onCancel={() => setCreateVisible(false)} footer={null} width={750} destroyOnHidden>
        <Form form={createForm} layout="vertical" onFinish={handleCreateSubmit} className="mt-4">
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}>
            <Input placeholder="VD: Trà sữa trân châu, Cơm gà xối mỡ..." size="large" />
          </Form.Item>
          <Form.Item name="salePrice" label="Giá bán (VNĐ)">
            <InputNumber placeholder="VD: 35000" min={0} style={{ width: '100%' }} size="large" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Divider><SettingOutlined /> Thành phần nguyên liệu</Divider>
          {renderItemsForm()}
          <div className="flex justify-end gap-3 mt-8">
            <Button onClick={() => setCreateVisible(false)} size="large">Hủy</Button>
            <Button type="primary" htmlType="submit" loading={createLoading} size="large">Lưu Công Thức</Button>
          </div>
        </Form>
      </Modal>

      {/* Edit BOM Modal */}
      <Modal
        title={editingRecipe ? (
          <div className="flex items-center gap-3">
            {editingRecipe.imageUrl && <img src={imgSrc(editingRecipe.imageUrl)} alt="" className="w-10 h-10 rounded-lg object-cover" />}
            <div>
              <div>Sửa BOM: {editingRecipe.name}</div>
              <div className="text-xs text-gray-400 font-normal">
                {editingRecipe.versions?.find(v => v.isActive)?.versionName || ''} &rarr; Phiên bản mới
              </div>
            </div>
          </div>
        ) : "Sửa BOM"}
        open={editVisible} onCancel={() => setEditVisible(false)} footer={null} width={750} destroyOnHidden
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit} className="mt-4">
          <Divider><SettingOutlined /> Thành phần nguyên liệu</Divider>
          {renderItemsForm()}
          <div className="flex justify-end gap-3 mt-8">
            <Button onClick={() => setEditVisible(false)} size="large">Hủy</Button>
            <Button type="primary" htmlType="submit" loading={editLoading} size="large">Lưu BOM mới</Button>
          </div>
        </Form>
      </Modal>

      {/* Compare Versions Modal */}
      <Modal
        title={compareRecipe ? (
          <div className="flex items-center gap-3">
            {compareRecipe.imageUrl && <img src={imgSrc(compareRecipe.imageUrl)} alt="" className="w-10 h-10 rounded-lg object-cover" />}
            <div>
              <div>So sánh phiên bản: {compareRecipe.name}</div>
              <div className="text-xs text-gray-400 font-normal">{compareRecipe.versions.length} phiên bản</div>
            </div>
          </div>
        ) : "So sánh"}
        open={compareVisible}
        onCancel={() => setCompareVisible(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        {compareRecipe && (
          <div className="mt-4">
            {/* Version selectors */}
            <div className="flex items-center gap-3 mb-6">
              <Select
                value={leftVersionId}
                onChange={setLeftVersionId}
                style={{ width: 250 }}
                placeholder="Phiên bản cũ"
              >
                {compareRecipe.versions.map(v => (
                  <Select.Option key={v.id} value={v.id} disabled={v.id === rightVersionId}>
                    {v.versionName} {v.isActive ? '(Active)' : ''} — {new Date(v.effectiveFrom).toLocaleDateString('vi-VN')}
                  </Select.Option>
                ))}
              </Select>
              <SwapOutlined className="text-gray-400 text-lg" />
              <Select
                value={rightVersionId}
                onChange={setRightVersionId}
                style={{ width: 250 }}
                placeholder="Phiên bản mới"
              >
                {compareRecipe.versions.map(v => (
                  <Select.Option key={v.id} value={v.id} disabled={v.id === leftVersionId}>
                    {v.versionName} {v.isActive ? '(Active)' : ''} — {new Date(v.effectiveFrom).toLocaleDateString('vi-VN')}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Diff table */}
            {leftVersion && rightVersion ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-400 font-medium">Nguyên liệu</th>
                    <th className="text-right py-2 text-gray-400 font-medium px-4">{leftVersion.versionName}</th>
                    <th className="text-right py-2 text-gray-400 font-medium px-4">{rightVersion.versionName}</th>
                    <th className="text-right py-2 text-gray-400 font-medium">Thay đổi</th>
                  </tr>
                </thead>
                <tbody>
                  {diffRows.map((row, i) => {
                    const leftQty = row.left ? Number(row.left.quantity) : 0;
                    const rightQty = row.right ? Number(row.right.quantity) : 0;
                    const diff = rightQty - leftQty;
                    const isNew = !row.left;
                    const isRemoved = !row.right;
                    const isChanged = !isNew && !isRemoved && diff !== 0;

                    let diffColor = "text-gray-400";
                    let diffText = "—";
                    if (isNew) { diffColor = "text-green-400"; diffText = "+ Mới"; }
                    else if (isRemoved) { diffColor = "text-red-400"; diffText = "Đã xoá"; }
                    else if (isChanged) {
                      diffColor = diff > 0 ? "text-yellow-400" : "text-cyan-400";
                      diffText = `${diff > 0 ? '+' : ''}${diff} ${row.baseUnit}`;
                    }

                    return (
                      <tr key={i} className={`border-b border-gray-800 ${isRemoved ? 'opacity-50' : ''}`}>
                        <td className="py-2.5 text-gray-200">{row.name}</td>
                        <td className={`text-right py-2.5 px-4 ${isNew ? 'text-gray-600' : 'text-gray-300'}`}>
                          {row.left ? `${leftQty} ${row.left.unit || row.baseUnit}` : '—'}
                        </td>
                        <td className={`text-right py-2.5 px-4 ${isRemoved ? 'text-gray-600' : 'text-gray-300'}`}>
                          {row.right ? `${rightQty} ${row.right.unit || row.baseUnit}` : '—'}
                        </td>
                        <td className={`text-right py-2.5 font-medium ${diffColor}`}>{diffText}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-gray-500 py-8">Chọn 2 phiên bản để so sánh</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
