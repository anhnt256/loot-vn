"use client";

import { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Tag, Row, Col, Empty, Spin } from "antd";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import dayjs from "@/lib/dayjs";

interface Bonus {
  id: number;
  staffId: number;
  fullName: string;
  userName: string;
  amount: number;
  reason: string;
  description?: string;
  rewardDate: string;
  status: string;
  createdAt: string;
}

interface Staff {
  id: number;
  fullName: string;
  userName: string;
  staffType?: string;
}

export default function BonusManagement() {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | null>(null);

  useEffect(() => {
    const now = dayjs();
    setSelectedMonth({ month: now.month() + 1, year: now.year() });
    fetchStaffList();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchBonuses();
    }
  }, [selectedMonth]);

  const fetchStaffList = async () => {
    try {
      const response = await fetch("/api/staff");
      if (!response.ok) throw new Error("Failed to fetch staff");
      const result = await response.json();
      if (result.success) {
        setStaffList(result.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải danh sách nhân viên");
    }
  };

  const fetchBonuses = async () => {
    if (!selectedMonth) return;
    try {
      setLoading(true);
      const response = await fetch(
        `/api/manager/bonus?month=${selectedMonth.month}&year=${selectedMonth.year}`
      );
      if (!response.ok) throw new Error("Failed to fetch bonuses");
      const result = await response.json();
      if (result.success) {
        setBonuses(result.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải danh sách thưởng");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const response = await fetch("/api/manager/bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          rewardDate: values.rewardDate ? values.rewardDate.format("YYYY-MM-DD") : null,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Thêm thưởng thành công");
        setShowModal(false);
        form.resetFields();
        fetchBonuses();
      } else {
        throw new Error(result.error || "Failed to create bonus");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể thêm thưởng");
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

  return (
    <div className="space-y-4">
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
            Thêm thưởng
          </Button>
        </div>
      </Card>

      {/* Bonus List */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : bonuses.length === 0 ? (
          <Empty description="Không có dữ liệu thưởng" />
        ) : (
          <Row gutter={[16, 16]}>
            {bonuses.map((bonus) => (
              <Col xs={24} sm={12} lg={8} key={bonus.id}>
                <Card
                  className="h-full"
                  hoverable
                >
                  <div className="space-y-2">
                    <div>
                      <div className="font-semibold text-lg">{bonus.fullName}</div>
                      <div className="text-sm text-gray-500">{bonus.userName}</div>
                    </div>
                    
                    <div className="text-2xl font-bold text-green-600">
                      {bonus.amount.toLocaleString("vi-VN")} ₫
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600">Lý do:</div>
                      <div className="font-medium">{bonus.reason}</div>
                    </div>
                    
                    {bonus.description && (
                      <div>
                        <div className="text-sm text-gray-600">Mô tả:</div>
                        <div className="text-sm">{bonus.description}</div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-sm text-gray-500">
                        {dayjs(bonus.rewardDate).format("DD/MM/YYYY")}
                      </div>
                      <Tag color={bonus.status === "PENDING" ? "orange" : "green"}>
                        {bonus.status === "PENDING" ? "Chờ duyệt" : "Đã duyệt"}
                      </Tag>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      <Modal
        title="Thêm thưởng"
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
            label="Nhân viên"
            name="staffId"
            rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
          >
            <Select
              placeholder="Chọn nhân viên"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={staffList
                .filter((s) => s.staffType === "STAFF")
                .map((s) => ({
                  value: s.id,
                  label: `${s.fullName} (${s.userName})`,
                }))}
            />
          </Form.Item>

          <Form.Item
            label="Số tiền"
            name="amount"
            rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
          >
            <InputNumber
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              className="w-full"
              placeholder="Nhập số tiền"
            />
          </Form.Item>

          <Form.Item
            label="Lý do"
            name="reason"
            rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
          >
            <Input placeholder="Nhập lý do thưởng" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Nhập mô tả (tùy chọn)" />
          </Form.Item>

          <Form.Item label="Ngày thưởng" name="rewardDate">
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={2} placeholder="Nhập ghi chú (tùy chọn)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Thêm thưởng
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

