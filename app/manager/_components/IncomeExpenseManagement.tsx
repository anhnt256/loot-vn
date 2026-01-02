"use client";

import { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Tag, Row, Col, Empty, Spin } from "antd";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import dayjs from "@/lib/dayjs";
import { getCookie } from "cookies-next";

interface IncomeExpense {
  id: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  reason: string;
  description?: string;
  transactionDate: string;
  branch: string;
  createdAt: string;
  createdBy?: number;
  createdByName?: string;
  createdByUserName?: string;
}

export default function IncomeExpenseManagement() {
  const [transactions, setTransactions] = useState<IncomeExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | null>(null);

  useEffect(() => {
    const now = dayjs();
    setSelectedMonth({ month: now.month() + 1, year: now.year() });
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchTransactions();
    }
  }, [selectedMonth]);

  const fetchTransactions = async () => {
    if (!selectedMonth) return;
    try {
      setLoading(true);
      const branch = getCookie("branch") as string || "GO_VAP";
      const response = await fetch(
        `/api/manager/income-expense?month=${selectedMonth.month}&year=${selectedMonth.year}&branch=${branch}`
      );
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const result = await response.json();
      if (result.success) {
        setTransactions(result.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải dữ liệu thu chi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const branch = getCookie("branch") as string || "GO_VAP";
      const response = await fetch("/api/manager/income-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          transactionDate: values.transactionDate ? values.transactionDate.format("YYYY-MM-DD") : null,
          branch: branch,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Thêm giao dịch thành công");
        setShowModal(false);
        form.resetFields();
        fetchTransactions();
      } else {
        throw new Error(result.error || "Failed to create transaction");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể thêm giao dịch");
    }
  };

  const monthOptions = (() => {
    const now = dayjs();
    const currentMonth = now.month() + 1;
    const currentYear = now.year();
    const options = [];
    
    if (currentMonth === 1) {
      options.push({
        value: `12-${currentYear - 1}`,
        label: `Tháng 12/${currentYear - 1}`,
      });
    } else {
      options.push({
        value: `${currentMonth - 1}-${currentYear}`,
        label: `Tháng ${currentMonth - 1}/${currentYear}`,
      });
    }
    
    options.push({
      value: `${currentMonth}-${currentYear}`,
      label: `Tháng ${currentMonth}/${currentYear}`,
    });
    
    return options;
  })();

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Tổng thu</div>
              <div className="text-2xl font-bold text-green-600">
                {totalIncome.toLocaleString("vi-VN")} ₫
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Tổng chi</div>
              <div className="text-2xl font-bold text-red-600">
                {totalExpense.toLocaleString("vi-VN")} ₫
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Số dư</div>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                {balance.toLocaleString("vi-VN")} ₫
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Select
            value={selectedMonth ? `${selectedMonth.month}-${selectedMonth.year}` : null}
            onChange={(value) => {
              const [month, year] = value.split("-").map(Number);
              setSelectedMonth({ month, year });
            }}
            style={{ minWidth: 150 }}
            options={monthOptions}
          />
          
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setShowModal(true)}
          >
            Thêm giao dịch
          </Button>
        </div>
      </Card>

      {/* Transactions List */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : transactions.length === 0 ? (
          <Empty description="Không có dữ liệu thu chi" />
        ) : (
          <Row gutter={[16, 16]}>
            {transactions.map((transaction) => (
              <Col xs={24} sm={12} lg={8} key={transaction.id}>
                <Card
                  className="h-full"
                  hoverable
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Tag color={transaction.type === "INCOME" ? "green" : "red"}>
                        {transaction.type === "INCOME" ? "Thu" : "Chi"}
                      </Tag>
                      <div className="text-sm text-gray-500">
                        {dayjs(transaction.transactionDate).format("DD/MM/YYYY")}
                      </div>
                    </div>
                    
                    <div className={`text-2xl font-bold ${transaction.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "INCOME" ? "+" : "-"} {transaction.amount.toLocaleString("vi-VN")} ₫
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600">Lý do:</div>
                      <div className="font-medium">{transaction.reason}</div>
                    </div>
                    
                    {transaction.description && (
                      <div>
                        <div className="text-sm text-gray-600">Mô tả:</div>
                        <div className="text-sm">{transaction.description}</div>
                      </div>
                    )}
                    
                    {transaction.createdByName && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-500">
                          Người tạo: {transaction.createdByName}
                          {transaction.createdByUserName && ` (${transaction.createdByUserName})`}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Add Transaction Modal */}
      <Modal
        title="Thêm giao dịch"
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Loại giao dịch"
            name="type"
            rules={[{ required: true, message: "Vui lòng chọn loại giao dịch" }]}
          >
            <Select placeholder="Chọn loại giao dịch">
              <Select.Option value="INCOME">Thu</Select.Option>
              <Select.Option value="EXPENSE">Chi</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Số tiền"
            name="amount"
            rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
          >
            <InputNumber
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => {
                const parsed = value?.replace(/\$\s?|(,*)/g, "") || "0";
                return (parseFloat(parsed) || 0) as any;
              }}
              className="w-full"
              placeholder="Nhập số tiền"
            />
          </Form.Item>

          <Form.Item
            label="Lý do"
            name="reason"
            rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
          >
            <Input placeholder="Nhập lý do" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Nhập mô tả (tùy chọn)" />
          </Form.Item>

          <Form.Item
            label="Ngày giao dịch"
            name="transactionDate"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Thêm giao dịch
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

