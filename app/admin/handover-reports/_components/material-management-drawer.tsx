"use client"

import React, { useState, useEffect } from "react";
import { X, Plus, Edit } from "lucide-react";
import { Table, Tag, Button, Modal, Form, Input, Switch, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { REPORT_TYPE_ENUM, REPORT_TYPE_LABELS } from "@/constants/handover-reports.constants";

interface Material {
  id: number;
  materialName: string;
  materialType: string;
  isDeleted: boolean;
  isFood: boolean;
}

interface MaterialManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MaterialManagementDrawer({ isOpen, onClose }: MaterialManagementDrawerProps) {
  const [selectedReportType, setSelectedReportType] = useState("BAO_CAO_NUOC");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  const reportTypes = Object.values(REPORT_TYPE_ENUM);

  // Table columns configuration
  const columns: ColumnsType<Material> = [
    {
      title: 'Tên nguyên vật liệu',
      dataIndex: 'materialName',
      key: 'materialName',
      render: (text: string, record: Material) => (
        <span className={record.isDeleted ? 'line-through text-gray-500' : 'text-gray-900'}>
          {text}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'isDeleted',
      dataIndex: 'isDeleted',
      render: (isDeleted: boolean) => (
        <Tag color={isDeleted ? 'red' : 'green'}>
          {isDeleted ? 'Đã xóa' : 'Hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Hiển thị trên FFood',
      key: 'isFood',
      dataIndex: 'isFood',
      render: (isFood: boolean) => (
        <Tag color={isFood ? 'blue' : 'orange'}>
          {isFood ? 'Có' : 'Không'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record: Material) => (
        <Button
          type="text"
          icon={<Edit className="w-4 h-4" />}
          onClick={() => handleEdit(record)}
          className="text-blue-600 hover:text-blue-800"
        >
          Sửa
        </Button>
      ),
    },
  ];

  // Fetch materials when report type changes
  useEffect(() => {
    if (isOpen && selectedReportType) {
      fetchMaterials();
    } else {
      setMaterials([]);
    }
  }, [isOpen, selectedReportType]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/handover-reports/materials?reportType=${selectedReportType}`);
      const result = await response.json();

      if (result.success) {
        setMaterials(result.data);
      } else {
        console.error("Failed to fetch materials:", result.error);
        setMaterials([]);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (value: string) => {
    setSelectedReportType(value);
  };

  const handleAddNew = () => {
    setEditingMaterial(null);
    form.resetFields();
    form.setFieldsValue({
      materialType: selectedReportType,
      isFood: true,
      isDeleted: false,
    });
    setModalVisible(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    form.setFieldsValue({
      materialName: material.materialName,
      materialType: material.materialType,
      isFood: material.isFood,
      isDeleted: material.isDeleted,
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
      const url = editingMaterial 
        ? '/api/handover-reports/materials'
        : '/api/handover-reports/materials';
      
      const method = editingMaterial ? 'PUT' : 'POST';
      const body = editingMaterial 
        ? { ...values, id: editingMaterial.id }
        : values;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        message.success(
          editingMaterial 
            ? 'Cập nhật nguyên vật liệu thành công!' 
            : 'Thêm nguyên vật liệu thành công!'
        );
        setModalVisible(false);
        setEditingMaterial(null);
        form.resetFields();
        fetchMaterials(); // Refresh the list
      } else {
        message.error(result.error || 'Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Có lỗi xảy ra khi lưu dữ liệu!');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Quản lý Nguyên vật liệu
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Report Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại báo cáo
              </label>
              <select
                value={selectedReportType}
                onChange={(e) => handleReportTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn loại báo cáo</option>
                {reportTypes.map((type) => (
                  <option key={type} value={type}>
                    {REPORT_TYPE_LABELS[type as keyof typeof REPORT_TYPE_LABELS]}
                  </option>
                ))}
              </select>
            </div>

            {/* Materials Table - Only show when report type is selected */}
            {selectedReportType && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-medium text-gray-900">
                    Danh sách nguyên vật liệu ({materials.length})
                  </h3>
                  <Button
                    type="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={handleAddNew}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Thêm mới
                  </Button>
                </div>
                
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-md"></div>
                      </div>
                    ))}
                  </div>
                ) : materials.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">Chưa có nguyên vật liệu nào</p>
                    <p className="text-sm text-gray-400 mt-1">Hãy chọn loại báo cáo khác hoặc thêm nguyên vật liệu mới</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200">
                    <Table
                      columns={columns}
                      dataSource={materials}
                      rowKey="id"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
                      }}
                      size="middle"
                      loading={loading}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Empty state when no report type selected */}
            {!selectedReportType && (
              <div className="text-center py-16 text-gray-500">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-xl font-medium">Chọn loại báo cáo</p>
                <p className="text-sm text-gray-400 mt-2">Để xem danh sách nguyên vật liệu</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Material Modal */}
      <Modal
        title={editingMaterial ? 'Chỉnh sửa nguyên vật liệu' : 'Thêm nguyên vật liệu mới'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            materialType: selectedReportType,
            isFood: true,
            isDeleted: false,
          }}
        >
          <Form.Item
            name="materialName"
            label="Tên nguyên vật liệu"
            rules={[
              { required: true, message: 'Vui lòng nhập tên nguyên vật liệu!' },
              { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập tên nguyên vật liệu..." />
          </Form.Item>

          <Form.Item
            name="materialType"
            label="Loại báo cáo"
            rules={[{ required: true, message: 'Vui lòng chọn loại báo cáo!' }]}
          >
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
              disabled
            >
              <option value={selectedReportType}>
                {REPORT_TYPE_LABELS[selectedReportType as keyof typeof REPORT_TYPE_LABELS]}
              </option>
            </select>
          </Form.Item>

          <Form.Item
            name="isFood"
            label="Hiển thị trên FFood"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Có" 
              unCheckedChildren="Không"
            />
          </Form.Item>

          <Form.Item
            name="isDeleted"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Đã xóa" 
              unCheckedChildren="Hoạt động"
            />
          </Form.Item>

          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={handleModalCancel}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingMaterial ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
} 