"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Form,
  InputNumber,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Cookies from "js-cookie";

const { Search } = Input;

interface Reward {
  id: string;
  name: string;
  description: string;
  type: string;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  usageCount: number;
  maxUsageCount?: number;
  createdAt: string;
  itemType?: string;
}

interface RewardsTabProps {
  selectedBranch: string;
  selectedEvent: Event | null;
}

interface Event {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: number;
  expectedParticipants: number;
  totalParticipants: number;
  totalCodesGenerated: number;
  totalCodesUsed: number;
  totalRewardsDistributed: number;
  createdAt: string;
}

export default function RewardsTab({
  selectedBranch,
  selectedEvent,
}: RewardsTabProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [form] = Form.useForm();

  const rewardTypes = [
    { value: "PERCENTAGE_DISCOUNT", label: "Giảm giá %" },
    { value: "FIXED_DISCOUNT", label: "Giảm giá cố định" },
    { value: "FREE_ITEM", label: "Tặng miễn phí" },
    { value: "BOGO", label: "Mua 1 tặng 1" },
    { value: "MULTIPLIER", label: "Nhân đôi điểm" },
    { value: "FREE_TIME", label: "Tặng thời gian chơi" },
    { value: "MAIN_ACCOUNT_TOPUP", label: "Tặng tài khoản chính" },
    { value: "TOPUP_BONUS_PERCENTAGE", label: "Tặng % khi nạp tiền" },
  ];

  const fetchRewards = async () => {
    try {
      console.log(
        "Fetching rewards for branch:",
        selectedBranch,
        "event:",
        selectedEvent?.id,
      );
      setLoading(true);

      if (!selectedEvent) {
        setRewards([]);
        return;
      }

      const response = await fetch(`/api/rewards?eventId=${selectedEvent.id}`);
      const data = await response.json();
      if (data.success) {
        setRewards(data.rewards);
      }
    } catch (error) {
      console.error("Error fetching rewards:", error);
      message.error("Lỗi khi tải danh sách rewards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [selectedBranch, selectedEvent]);

  const handleCreateReward = async (values: any) => {
    try {
      if (!selectedEvent) {
        message.error("Vui lòng chọn event trước");
        return;
      }

      setLoading(true);
      const response = await fetch("/api/rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          eventId: selectedEvent.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        message.success("Tạo reward thành công!");
        setShowCreateModal(false);
        form.resetFields();
        fetchRewards();
      } else {
        message.error(data.error || "Lỗi khi tạo reward");
      }
    } catch (error) {
      console.error("Error creating reward:", error);
      message.error("Lỗi khi tạo reward");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReward = async (values: any) => {
    if (!editingReward) return;

    try {
      setLoading(true);
      console.log("[DEBUG] Frontend sending values:", values);
      const response = await fetch(`/api/rewards/${editingReward.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
        }),
      });

      const data = await response.json();
      if (data.success) {
        message.success("Cập nhật reward thành công!");
        setShowCreateModal(false);
        setEditingReward(null);
        form.resetFields();
        fetchRewards();
      } else {
        message.error(data.error || "Lỗi khi cập nhật reward");
      }
    } catch (error) {
      console.error("Error updating reward:", error);
      message.error("Lỗi khi cập nhật reward");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rewards/${rewardId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (data.success) {
        message.success("Xóa reward thành công!");
        fetchRewards();
      } else {
        message.error(data.error || "Lỗi khi xóa reward");
      }
    } catch (error) {
      console.error("Error deleting reward:", error);
      message.error("Lỗi khi xóa reward");
    } finally {
      setLoading(false);
    }
  };

  const getTypeText = (type: string) => {
    const typeMap = {
      PERCENTAGE_DISCOUNT: "Giảm giá %",
      FIXED_DISCOUNT: "Giảm giá cố định",
      FREE_ITEM: "Tặng miễn phí",
      BOGO: "Mua 1 tặng 1",
      MULTIPLIER: "Nhân đôi điểm",
      FREE_TIME: "Tặng thời gian chơi",
      MAIN_ACCOUNT_TOPUP: "Tặng tài khoản chính",
      TOPUP_BONUS_PERCENTAGE: "Tặng % khi nạp tiền",
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getTypeColor = (type: string) => {
    const colorMap = {
      PERCENTAGE_DISCOUNT: "blue",
      FIXED_DISCOUNT: "green",
      FREE_ITEM: "purple",
      BOGO: "orange",
      MULTIPLIER: "cyan",
      FREE_TIME: "magenta",
      MAIN_ACCOUNT_TOPUP: "gold",
      TOPUP_BONUS_PERCENTAGE: "lime",
    };
    return colorMap[type as keyof typeof colorMap] || "default";
  };

  const filteredRewards = rewards.filter((reward) => {
    const matchesSearch =
      reward.name.toLowerCase().includes(searchText.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === "all" || reward.type === filterType;
    return matchesSearch && matchesType;
  });

  const columns = [
    {
      title: "Tên Reward",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Reward) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{getTypeText(type)}</Tag>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (value: number, record: Reward) => {
        switch (record.type) {
          case "PERCENTAGE_DISCOUNT":
          case "TOPUP_BONUS_PERCENTAGE":
            return `${value}%`;
          case "FIXED_DISCOUNT":
          case "FREE_TIME":
          case "MAIN_ACCOUNT_TOPUP":
            return `${value.toLocaleString()} VND`;
          case "MULTIPLIER":
            return `x${value}`;
          default:
            return value.toString();
        }
      },
    },
    {
      title: "Sử dụng",
      dataIndex: "usageCount",
      key: "usageCount",
      render: (count: number, record: Reward) => (
        <div>
          <div>{count}</div>
          {record.maxUsageCount && (
            <div className="text-xs text-gray-500">
              / {record.maxUsageCount}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: Reward) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              console.log("[DEBUG] Editing reward:", record);
              setEditingReward(record);
              form.setFieldsValue(record);
              setShowCreateModal(true);
            }}
          />
          <Popconfirm
            title="Xóa reward này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDeleteReward(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {!selectedEvent ? (
        <Card className="border-2 border-dashed border-gray-300">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="text-4xl mb-2">🎁</div>
              <p className="text-gray-500 font-medium">
                Vui lòng chọn event để xem rewards
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Search
                placeholder="Tìm kiếm reward..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
              />
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: 200 }}
                options={[
                  { value: "all", label: "Tất cả loại" },
                  ...rewardTypes,
                ]}
              />
            </div>
            <div className="flex gap-2">
              <Button icon={<ReloadOutlined />} onClick={fetchRewards}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingReward(null);
                  form.resetFields();
                  setShowCreateModal(true);
                }}
              >
                Tạo Reward
              </Button>
            </div>
          </div>

          {/* Rewards Table */}
          <Card>
            <Table
              columns={columns}
              dataSource={filteredRewards}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} rewards`,
              }}
            />
          </Card>

          {/* Create/Edit Modal */}
          <Modal
            title={editingReward ? "Chỉnh sửa Reward" : "Tạo Reward Mới"}
            open={showCreateModal}
            onCancel={() => {
              setShowCreateModal(false);
              setEditingReward(null);
              form.resetFields();
            }}
            footer={null}
            width={700}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={editingReward ? handleUpdateReward : handleCreateReward}
              initialValues={{
                type: "PERCENTAGE_DISCOUNT",
                isActive: true,
              }}
            >
              {/* Row 1: Name và Description */}
              <div className="grid grid-cols-1 gap-4">
                <Form.Item
                  name="name"
                  label="Tên Reward"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên reward" },
                  ]}
                >
                  <Input placeholder="Ví dụ: Giảm 20% cho đơn hàng đầu tiên" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea
                    rows={2}
                    placeholder="Mô tả chi tiết về reward..."
                  />
                </Form.Item>
              </div>

              {/* Row 2: Type và ItemType */}
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="type"
                  label="Loại Reward"
                  rules={[
                    { required: true, message: "Vui lòng chọn loại reward" },
                  ]}
                >
                  <Select options={rewardTypes} />
                </Form.Item>

                <Form.Item
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.type !== currentValues.type
                  }
                >
                  {({ getFieldValue }) => {
                    const type = getFieldValue("type");
                    return (
                      <Form.Item name="itemType" label="Loại Item">
                        <Select
                          placeholder="Chọn loại item"
                          disabled={
                            type !== "FREE_ITEM" && type !== "FREE_TIME"
                          }
                          options={[
                            { value: "HOURS", label: "Giờ chơi" },
                            { value: "DRINK", label: "Nước uống" },
                            { value: "FOOD", label: "Đồ ăn" },
                            { value: "SNACK", label: "Đồ ăn vặt" },
                            { value: "VOUCHER", label: "Voucher" },
                          ]}
                        />
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </div>

              {/* Row 3: Value và MinOrderAmount */}
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="value"
                  label="Giá trị"
                  rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    placeholder="Giá trị reward"
                  />
                </Form.Item>

                <Form.Item
                  name="minOrderAmount"
                  label="Đơn hàng tối thiểu (VND)"
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    placeholder="Đơn hàng tối thiểu"
                  />
                </Form.Item>
              </div>

              {/* Row 4: MaxDiscountAmount và MaxUsageCount */}
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="maxDiscountAmount"
                  label="Giảm giá tối đa (VND)"
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    placeholder="Giảm giá tối đa"
                  />
                </Form.Item>

                <Form.Item name="maxUsageCount" label="Số lần sử dụng tối đa">
                  <InputNumber
                    className="w-full"
                    min={1}
                    placeholder="Không giới hạn"
                  />
                </Form.Item>
              </div>

              {/* Row 5: Status */}
              <div className="grid grid-cols-1 gap-4">
                <Form.Item name="isActive" label="Trạng thái">
                  <Select
                    options={[
                      { value: true, label: "Hoạt động" },
                      { value: false, label: "Tạm dừng" },
                    ]}
                  />
                </Form.Item>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingReward(null);
                    form.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingReward ? "Cập nhật" : "Tạo"}
                </Button>
              </div>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
}
