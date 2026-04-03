import React, { useState, useEffect } from "react";
import { PlusOutlined, EditOutlined, ReloadOutlined, DatabaseOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';
import { Table, Tag, Button, Modal, Form, Input, Switch, message, Select, Card, Breadcrumb, InputNumber } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  REPORT_TYPE_ENUM,
  REPORT_TYPE_LABELS,
  ReportType,
} from "./handover-reports/constants";
import { apiClient } from "@gateway-workspace/shared/utils/client";

interface Material {
  id: number;
  sku: string;
  name: string;
  baseUnit: string;
  quantityInStock: number;
  minStockLevel: number;
  costPrice: number;
  isActive: boolean;
  reportType?: string;
}

export default function MaterialManagementPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterReportType, setFilterReportType] = useState<string | undefined>(undefined);

  // Stock management
  const [stockManagerVisible, setStockManagerVisible] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [stockType, setStockType] = useState<'RECEIPT' | 'ISSUE'>('RECEIPT');
  const [stockForm] = Form.useForm();
  const [stockSearch, setStockSearch] = useState("");

  // --- Main table columns (danh mục) ---
  const columns: ColumnsType<Material> = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 120,
      render: (sku: string) => <Tag color="blue">{sku || "N/A"}</Tag>,
    },
    {
      title: "Tên nguyên vật liệu",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Material) => (
        <span className={!record.isActive ? "line-through text-gray-400" : "text-gray-100 font-medium"}>
          {text}
        </span>
      ),
    },
    {
      title: "Đơn vị gốc",
      dataIndex: "baseUnit",
      key: "baseUnit",
      width: 100,
    },
    {
      title: "Giá vốn",
      dataIndex: "costPrice",
      key: "costPrice",
      align: 'right',
      render: (val: number) => <span className="text-gray-400">{Number(val).toLocaleString()}đ</span>,
    },
    {
      title: "Tồn kho",
      dataIndex: "quantityInStock",
      key: "quantityInStock",
      align: "right",
      render: (val: number, record: Material) => (
        <span className={val <= record.minStockLevel ? "text-red-500 font-bold" : "text-green-400"}>
          {Number(val).toLocaleString()} {record.baseUnit || ''}
        </span>
      ),
    },
    {
      title: "Loại báo cáo",
      key: "reportType",
      dataIndex: "reportType",
      width: 140,
      render: (reportType: string) => {
        const label = REPORT_TYPE_LABELS[reportType as ReportType];
        const color = reportType === REPORT_TYPE_ENUM.BAO_CAO_BEP ? "orange" : "cyan";
        return <Tag color={color}>{label || reportType}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      key: "isActive",
      dataIndex: "isActive",
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Ngừng dùng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: 'center',
      width: 80,
      render: (_, record: Material) => (
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
      ),
    },
  ];

  // --- Stock manager table columns ---
  const stockColumns: ColumnsType<Material> = [
    {
      title: "Nguyên vật liệu",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Material) => (
        <div>
          <div className="text-gray-100 font-medium">{text}</div>
          <div className="text-gray-500 text-xs">{record.sku}</div>
        </div>
      ),
    },
    {
      title: "Đơn vị",
      dataIndex: "baseUnit",
      key: "baseUnit",
      width: 80,
    },
    {
      title: "Tồn kho",
      dataIndex: "quantityInStock",
      key: "quantityInStock",
      align: "right",
      width: 120,
      render: (val: number, record: Material) => (
        <span className={val <= record.minStockLevel ? "text-red-500 font-bold" : "text-green-400"}>
          {Number(val).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Định mức tối thiểu",
      dataIndex: "minStockLevel",
      key: "minStockLevel",
      align: "right",
      width: 140,
      render: (val: number) => Number(val).toLocaleString(),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: 200,
      render: (_, record: Material) => (
        <div className="flex gap-1 justify-center">
          <Button size="small" type="primary" ghost icon={<ImportOutlined />} onClick={() => openStockModal(record, 'RECEIPT')}>
            Nhập
          </Button>
          <Button
            size="small"
            icon={<ExportOutlined />}
            onClick={() => openStockModal(record, 'ISSUE')}
            style={{ borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)' }}
          >
            Xuất
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<Material[]>(`/admin/materials`);
      setMaterials(response.data);
    } catch (error) {
      console.error("Error fetching materials:", error);
      message.error("Không thể tải danh sách nguyên liệu");
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD handlers ---
  const handleAddNew = () => {
    setEditingMaterial(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, minStockLevel: 0, costPrice: 0, baseUnit: "Cái" });
    setModalVisible(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    form.setFieldsValue({
      name: material.name, sku: material.sku, baseUnit: material.baseUnit,
      costPrice: material.costPrice, minStockLevel: material.minStockLevel, isActive: material.isActive,
    });
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingMaterial(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      if (editingMaterial) {
        await apiClient.patch(`/admin/materials/${editingMaterial.id}`, values);
        message.success("Cập nhật nguyên liệu thành công!");
      } else {
        await apiClient.post(`/admin/materials`, values);
        message.success("Thêm nguyên liệu thành công!");
      }
      setModalVisible(false);
      fetchMaterials();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu dữ liệu!");
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- Stock handlers ---
  const openStockModal = (material: Material, type: 'RECEIPT' | 'ISSUE') => {
    setStockType(type);
    stockForm.resetFields();
    stockForm.setFieldsValue({
      materialId: material.id,
      materialName: `${material.name} (${material.baseUnit || 'đơn vị'})`,
    });
    setStockModalVisible(true);
  };

  const handleStockSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      await apiClient.post(`/admin/materials/stock-adjust`, {
        materialId: values.materialId,
        type: stockType,
        quantity: values.quantity,
        reason: values.reason,
      });
      message.success(stockType === 'RECEIPT' ? 'Nhập kho thành công!' : 'Xuất kho thành công!');
      setStockModalVisible(false);
      fetchMaterials();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- Filters ---
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (m.sku && m.sku.toLowerCase().includes(searchText.toLowerCase()));
    const matchesType = !filterReportType || m.reportType === filterReportType;
    return matchesSearch && matchesType;
  });

  const stockFilteredMaterials = materials
    .filter(m => m.isActive)
    .filter(m => !stockSearch || m.name.toLowerCase().includes(stockSearch.toLowerCase()) || (m.sku && m.sku.toLowerCase().includes(stockSearch.toLowerCase())));

  const lowStockCount = materials.filter(m => m.isActive && m.quantityInStock <= m.minStockLevel).length;

  return (
    <div className="p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Breadcrumb className="mb-2" items={[{ title: "Dashboard" }, { title: "Quản lý kho" }, { title: "Danh mục nguyên liệu" }]} />
          <h1 className="text-2xl font-bold text-white m-0">
            Danh mục Nguyên vật liệu
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<DatabaseOutlined />}
            onClick={() => setStockManagerVisible(true)}
          >
            Quản lý kho
            {lowStockCount > 0 && (
              <Tag color="red" className="ml-2">{lowStockCount} thiếu</Tag>
            )}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchMaterials} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
            Thêm mới
          </Button>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-gray-300 font-medium">Tìm kiếm:</span>
          <Input.Search
            placeholder="Tìm theo tên hoặc SKU..."
            allowClear
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 350 }}
          />
          <span className="text-gray-300 font-medium">Loại:</span>
          <Select
            placeholder="Tất cả"
            allowClear
            value={filterReportType}
            onChange={setFilterReportType}
            style={{ width: 180 }}
            options={[
              { value: REPORT_TYPE_ENUM.BAO_CAO_BEP, label: REPORT_TYPE_LABELS[REPORT_TYPE_ENUM.BAO_CAO_BEP as ReportType] },
              { value: REPORT_TYPE_ENUM.BAO_CAO_NUOC, label: REPORT_TYPE_LABELS[REPORT_TYPE_ENUM.BAO_CAO_NUOC as ReportType] },
            ]}
          />
        </div>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <Table
          columns={columns}
          dataSource={filteredMaterials}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `Tổng cộng ${total} mục` }}
          className="custom-table"
        />
      </Card>

      {/* Modal: Thêm/Sửa nguyên liệu */}
      <Modal
        title={<span className="text-lg font-bold">{editingMaterial ? "Chỉnh sửa nguyên vật liệu" : "Thêm nguyên vật liệu mới"}</span>}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="name" label="Tên nguyên vật liệu" rules={[{ required: true, message: "Vui lòng nhập tên!" }]}>
              <Input placeholder="Ví dụ: Sữa đặc" size="large" />
            </Form.Item>
            <Form.Item name="sku" label="Mã SKU (Duy nhất)" rules={[{ required: true, message: "Vui lòng nhập SKU!" }]}>
              <Input placeholder="Ví dụ: MILK-001" size="large" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="baseUnit" label="Đơn vị gốc" rules={[{ required: true, message: "Vui lòng nhập đơn vị gốc!" }]}>
              <Input placeholder="Gam, ML, Cái, Lon..." size="large" />
            </Form.Item>
            <Form.Item name="costPrice" label="Giá vốn (trên 1 đơn vị gốc)" rules={[{ required: true, message: "Vui lòng nhập giá vốn!" }]}>
              <InputNumber style={{ width: '100%' }} placeholder="0" size="large" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="minStockLevel" label="Định mức tồn kho tối thiểu" rules={[{ required: true, message: "Vui lòng nhập định mức!" }]}>
              <InputNumber style={{ width: '100%' }} placeholder="0" size="large" />
            </Form.Item>
          </div>
          <div className="flex gap-8 p-4 bg-gray-900 rounded-lg mb-6">
            <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked" className="mb-0">
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={handleModalCancel} size="large">Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} size="large">
              {editingMaterial ? "Lưu thay đổi" : "Tạo nguyên liệu"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal: Quản lý kho */}
      <Modal
        title={<span className="text-lg font-bold">Quản lý kho</span>}
        open={stockManagerVisible}
        onCancel={() => setStockManagerVisible(false)}
        footer={null}
        width={900}
        destroyOnHidden
      >
        <div className="mb-4">
          <Input.Search
            placeholder="Tìm nguyên liệu..."
            allowClear
            onChange={(e) => setStockSearch(e.target.value)}
            style={{ width: 350 }}
          />
        </div>
        <Table
          columns={stockColumns}
          dataSource={stockFilteredMaterials}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ y: 500 }}
          rowClassName={(record) => record.quantityInStock <= record.minStockLevel ? 'bg-red-900/20' : ''}
        />
      </Modal>

      {/* Modal: Nhập/Xuất kho */}
      <Modal
        title={<span className="text-lg font-bold">{stockType === 'RECEIPT' ? 'Nhập kho' : 'Xuất kho'}</span>}
        open={stockModalVisible}
        onCancel={() => setStockModalVisible(false)}
        footer={null}
        width={500}
        destroyOnHidden
      >
        <Form form={stockForm} layout="vertical" onFinish={handleStockSubmit} className="mt-4">
          <Form.Item name="materialId" hidden><Input /></Form.Item>
          <Form.Item name="materialName" label="Nguyên vật liệu">
            <Input disabled size="large" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}>
              <InputNumber style={{ width: '100%' }} min={0.01} placeholder="0" size="large" />
            </Form.Item>
            <Form.Item name="reason" label="Lý do">
              <Input placeholder={stockType === 'RECEIPT' ? 'Nhập hàng từ NCC...' : 'Hao hụt, hỏng...'} size="large" />
            </Form.Item>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setStockModalVisible(false)} size="large">Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              size="large"
              style={stockType === 'ISSUE' ? { backgroundColor: 'var(--secondary-color)', borderColor: 'var(--secondary-color)' } : undefined}
            >
              {stockType === 'RECEIPT' ? 'Xác nhận nhập' : 'Xác nhận xuất'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
