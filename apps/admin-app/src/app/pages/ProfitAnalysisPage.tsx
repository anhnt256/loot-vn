import React, { useState, useEffect } from "react";
import { ReloadOutlined, RiseOutlined, DollarOutlined, PieChartOutlined } from '@ant-design/icons';
import { Table, Tag, Button, Card, Breadcrumb, Space, Row, Col, Statistic, Progress } from "antd";
import type { ColumnsType } from "antd/es/table";
import { apiClient } from "@gateway-workspace/shared/utils/client";

interface ProfitReport {
  id: number;
  recipeName: string;
  salePrice: number;
  costPrice: number;
  profit: number;
  margin: string;
}

export default function ProfitAnalysisPage() {
  const [data, setData] = useState<ProfitReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<ProfitReport[]>("/admin/materials/profit-reports");
      setData(response.data);
    } catch (error) {
      console.error("Profit API fail:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<ProfitReport> = [
    {
      title: "Sản phẩm",
      dataIndex: "recipeName",
      key: "recipeName",
      render: (text) => <span className="font-bold text-gray-100">{text}</span>
    },
    {
      title: "Giá bán",
      dataIndex: "salePrice",
      key: "salePrice",
      align: 'right',
      render: (val) => <span className="text-blue-400">{val.toLocaleString()}đ</span>
    },
    {
      title: "Giá vốn (COGS)",
      dataIndex: "costPrice",
      key: "costPrice",
      align: 'right',
      render: (val) => <span className="text-gray-400">{val.toLocaleString()}đ</span>
    },
    {
      title: "Lợi nhuận gộp",
      dataIndex: "profit",
      key: "profit",
      align: 'right',
      render: (val) => <span className="text-green-500 font-bold">{val.toLocaleString()}đ</span>
    },
    {
      title: "Tỷ suất (%)",
      dataIndex: "margin",
      key: "margin",
      align: 'center',
      render: (margin: string) => {
        const value = parseFloat(margin);
        let color = "red";
        if (value > 30) color = "green";
        else if (value > 15) color = "orange";
        return <Tag color={color}>{margin}</Tag>;
      }
    },
    {
      title: "Biểu đồ",
      key: "chart",
      width: 150,
      render: (_, record) => {
        const marginValue = parseFloat(record.margin);
        return <Progress percent={marginValue} size="small" status={marginValue > 15 ? 'active' : 'exception'} />
      }
    }
  ];

  const totalSale = data.reduce((sum, item) => sum + item.salePrice, 0);
  const totalCost = data.reduce((sum, item) => sum + item.costPrice, 0);
  const avgMargin = data.length > 0 ? (data.reduce((sum, item) => sum + parseFloat(item.margin), 0) / data.length).toFixed(1) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Breadcrumb className="mb-2">
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item>Quản lý kho</Breadcrumb.Item>
            <Breadcrumb.Item>Phân tích lợi nhuận</Breadcrumb.Item>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-white m-0">Phân tích Lợi nhuận & Giá vốn</h1>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchReport} loading={loading}>Cập nhật báo cáo</Button>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card className="bg-gray-800 border-gray-700">
            <Statistic
              title={<span className="text-gray-400">Giá trị thực đơn (Avg)</span>}
              value={totalSale / (data.length || 1)}
              precision={0}
              suffix="đ"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="bg-gray-800 border-gray-700">
            <Statistic
              title={<span className="text-gray-400">Tỷ suất lợi nhuận TB</span>}
              value={avgMargin}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="bg-gray-800 border-gray-700">
            <Statistic
              title={<span className="text-gray-400">Số món đã định mức (BOM)</span>}
              value={data.length}
              prefix={<PieChartOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="bg-gray-800 border-gray-700">
        <div className="mb-4 text-gray-400 italic">
          * Dữ liệu được tính toán dựa trên Công thức (BOM) và Giá vốn nguyên liệu hiện tại.
        </div>
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          loading={loading}
          pagination={false}
          className="custom-table"
        />
      </Card>
    </div>
  );
}
