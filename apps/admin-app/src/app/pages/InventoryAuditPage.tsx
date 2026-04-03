import React, { useState, useEffect } from "react";
import { ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { Table, Tag, Button, Card, Breadcrumb, Space, DatePicker, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { apiClient } from "@gateway-workspace/shared/utils/client";
import dayjs from "dayjs";

interface Transaction {
  id: number;
  materialId: number;
  type: string;
  quantityChange: number;
  reason: string;
  referenceId: string;
  createdAt: string;
  material?: { name: string; baseUnit: string };
}

export default function InventoryAuditPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Vì YOLO Barry chưa build endpoint Audit riêng biệt, 
      // tôi sẽ lách qua Material API nếu cần, 
      // hoặc giả định có endpoint /admin/materials/transactions
      const response = await apiClient.get<Transaction[]>("/admin/materials/transactions");
      setData(response.data);
    } catch (error) {
      console.error("Audit API fail:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Transaction> = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
      width: 160,
    },
    {
      title: "Nguyên liệu",
      key: "material",
      render: (_, record) => (
        <div>
          <span className="font-bold text-gray-100">{record.material?.name}</span>
          <br />
          <span className="text-gray-400 text-xs">ID: {record.materialId}</span>
        </div>
      )
    },
    {
      title: "Loại GD",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const colors: Record<string, string> = {
          'SALE': 'orange',
          'RECEIPT': 'green',
          'ADJUST': 'blue',
          'REFUND': 'purple',
          'WASTE': 'red'
        };
        const labels: Record<string, string> = {
          'SALE': 'Bán hàng',
          'RECEIPT': 'Nhập kho',
          'ADJUST': 'Điều chỉnh',
          'REFUND': 'Trả hàng',
          'WASTE': 'Hao hụt'
        };
        return <Tag color={colors[type] || 'default'}>{labels[type] || type}</Tag>;
      }
    },
    {
      title: "Biến động",
      dataIndex: "quantityChange",
      key: "quantityChange",
      align: 'right',
      render: (val, record) => (
        <span className={Number(val) > 0 ? "text-green-500" : "text-red-500"}>
          {Number(val) > 0 ? "+" : ""}{Number(val).toLocaleString()} {record.material?.baseUnit}
        </span>
      )
    },
    {
      title: "Lý do / Tham chiếu",
      key: "reason",
      render: (_, record) => (
        <div>
          <div>{record.reason}</div>
          {record.referenceId && <Tag className="text-xs">Ref: {record.referenceId}</Tag>}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Breadcrumb className="mb-2">
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item>Quản lý kho</Breadcrumb.Item>
            <Breadcrumb.Item>Nhật ký biến động</Breadcrumb.Item>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-white m-0">Nhật ký & Audit Kho</h1>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchTransactions} loading={loading}>Làm mới</Button>
        </Space>
      </div>

      <Card className="bg-gray-800 border-gray-700 mb-6 py-2 px-4">
         <Space size={20}>
            <div className="text-gray-300">Bộ lọc:</div>
            <DatePicker.RangePicker />
            <Select placeholder="Tất cả loại giao dịch" style={{ width: 200 }} allowClear>
               <Select.Option value="SALE">Bán hàng</Select.Option>
               <Select.Option value="RECEIPT">Nhập kho</Select.Option>
               <Select.Option value="WASTE">Hao hụt</Select.Option>
            </Select>
            <Button type="primary" icon={<FilterOutlined />}>Lọc dữ liệu</Button>
         </Space>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 15 }}
          className="custom-table"
        />
      </Card>
    </div>
  );
}
