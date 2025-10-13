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
  DatePicker,
  Switch,
  Tooltip,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  CopyOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Search, TextArea } = Input;
const { Text } = Typography;

interface PromotionCode {
  id: string;
  code: string;
  name: string;
  description: string;
  type: string;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  maxUsageCount?: number;
  usageCount: number;
  isActive: boolean;
  eventId?: string;
  eventName?: string;
  createdAt: string;
}

interface PromotionCodesTabProps {
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

export default function PromotionCodesTab({
  selectedBranch,
  selectedEvent,
}: PromotionCodesTabProps) {
  const [codes, setCodes] = useState<PromotionCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingCode, setEditingCode] = useState<PromotionCode | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [form] = Form.useForm();
  const [generateForm] = Form.useForm();

  const codeTypes = [
    { value: "PERCENTAGE_DISCOUNT", label: "Giảm giá %" },
    { value: "FIXED_DISCOUNT", label: "Giảm giá cố định" },
    { value: "FREE_SHIPPING", label: "Miễn phí vận chuyển" },
    { value: "FREE_TIME", label: "Tặng thời gian chơi" },
    { value: "BONUS_POINTS", label: "Tặng điểm thưởng" },
  ];

  const fetchCodes = async () => {
    try {
      setLoading(true);

      if (!selectedEvent) {
        setCodes([]);
        return;
      }

      const response = await fetch(
        `/api/promotion-codes?eventId=${selectedEvent.id}`,
      );
      const data = await response.json();
      if (data.success) {
        setCodes(data.codes);
      }
    } catch (error) {
      console.error("Error fetching promotion codes:", error);
      message.error("Lỗi khi tải danh sách mã khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [selectedBranch, selectedEvent]);

  const handleCreateCode = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch("/api/promotion-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        message.success("Tạo mã khuyến mãi thành công!");
        setShowCreateModal(false);
        form.resetFields();
        fetchCodes();
      } else {
        message.error(data.error || "Lỗi khi tạo mã khuyến mãi");
      }
    } catch (error) {
      console.error("Error creating promotion code:", error);
      message.error("Lỗi khi tạo mã khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCodes = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch("/api/promotion-codes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        message.success(`Tạo thành công ${data.generatedCount} mã khuyến mãi!`);
        setShowGenerateModal(false);
        generateForm.resetFields();
        fetchCodes();
      } else {
        message.error(data.error || "Lỗi khi tạo mã khuyến mãi");
      }
    } catch (error) {
      console.error("Error generating promotion codes:", error);
      message.error("Lỗi khi tạo mã khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCode = async (values: any) => {
    if (!editingCode) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/promotion-codes/${editingCode.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        message.success("Cập nhật mã khuyến mãi thành công!");
        setEditingCode(null);
        form.resetFields();
        fetchCodes();
        setShowCreateModal(false);
      } else {
        message.error(data.error || "Lỗi khi cập nhật mã khuyến mãi");
      }
    } catch (error) {
      console.error("Error updating promotion code:", error);
      message.error("Lỗi khi cập nhật mã khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/promotion-codes/${codeId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ branch: selectedBranch }),
      });

      const data = await response.json();
      if (data.success) {
        message.success("Xóa mã khuyến mãi thành công!");
        fetchCodes();
      } else {
        message.error(data.error || "Lỗi khi xóa mã khuyến mãi");
      }
    } catch (error) {
      console.error("Error deleting promotion code:", error);
      message.error("Lỗi khi xóa mã khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success("Đã sao chép mã!");
  };

  const handleExportCodes = async () => {
    try {
      const response = await fetch(`/api/promotion-codes/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `promotion-codes-${dayjs().format("YYYY-MM-DD")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      message.success("Xuất file thành công!");
    } catch (error) {
      console.error("Error exporting codes:", error);
      message.error("Lỗi khi xuất file");
    }
  };

  const getTypeText = (type: string) => {
    const typeMap = {
      PERCENTAGE_DISCOUNT: "Giảm giá %",
      FIXED_DISCOUNT: "Giảm giá cố định",
      FREE_SHIPPING: "Miễn phí vận chuyển",
      FREE_TIME: "Tặng thời gian chơi",
      BONUS_POINTS: "Tặng điểm thưởng",
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getTypeColor = (type: string) => {
    const colorMap = {
      PERCENTAGE_DISCOUNT: "blue",
      FIXED_DISCOUNT: "green",
      FREE_SHIPPING: "purple",
      FREE_TIME: "orange",
      BONUS_POINTS: "cyan",
    };
    return colorMap[type as keyof typeof colorMap] || "default";
  };

  const getStatusColor = (code: PromotionCode) => {
    const now = dayjs();
    const start = dayjs(code.startDate);
    const end = dayjs(code.endDate);

    if (!code.isActive) return "default";
    if (now.isBefore(start)) return "warning";
    if (now.isAfter(end)) return "error";
    if (code.maxUsageCount && code.usageCount >= code.maxUsageCount)
      return "error";
    return "success";
  };

  const getStatusText = (code: PromotionCode) => {
    const now = dayjs();
    const start = dayjs(code.startDate);
    const end = dayjs(code.endDate);

    if (!code.isActive) return "Tạm dừng";
    if (now.isBefore(start)) return "Chưa bắt đầu";
    if (now.isAfter(end)) return "Hết hạn";
    if (code.maxUsageCount && code.usageCount >= code.maxUsageCount)
      return "Hết lượt";
    return "Hoạt động";
  };

  const filteredCodes = codes.filter((code) => {
    const matchesSearch =
      code.code.toLowerCase().includes(searchText.toLowerCase()) ||
      code.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === "all" || code.type === filterType;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && getStatusText(code) === "Hoạt động") ||
      (filterStatus === "expired" && getStatusText(code) === "Hết hạn") ||
      (filterStatus === "inactive" && getStatusText(code) === "Tạm dừng");
    return matchesSearch && matchesType && matchesStatus;
  });

  const columns = [
    {
      title: "Mã khuyến mãi",
      dataIndex: "code",
      key: "code",
      render: (_: any, record: PromotionCode) => (
        <div>
          <div className="flex items-center gap-2">
            <Text code className="font-bold">
              {record.code}
            </Text>
            <Tooltip title="Sao chép mã">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopyCode(record.code)}
              />
            </Tooltip>
          </div>
          <div className="text-sm text-gray-600">{record.name}</div>
          {record.eventName && (
            <div className="text-xs text-blue-600">
              Event: {record.eventName}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (_: any, record: PromotionCode) => (
        <Tag color={getTypeColor(record.type)}>{getTypeText(record.type)}</Tag>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (_: any, record: PromotionCode) => {
        switch (record.type) {
          case "PERCENTAGE_DISCOUNT":
            return `${record.value}%`;
          case "FIXED_DISCOUNT":
          case "FREE_TIME":
            return `${record.value.toLocaleString()} VND`;
          case "BONUS_POINTS":
            return `${record.value} điểm`;
          default:
            return record.value.toString();
        }
      },
    },
    {
      title: "Thời gian",
      key: "period",
      render: (_: any, record: PromotionCode) => (
        <div className="text-sm">
          <div>Từ: {dayjs(record.startDate).format("DD/MM/YYYY HH:mm")}</div>
          <div>Đến: {dayjs(record.endDate).format("DD/MM/YYYY HH:mm")}</div>
        </div>
      ),
    },
    {
      title: "Sử dụng",
      dataIndex: "usageCount",
      key: "usageCount",
      render: (count: number, record: PromotionCode) => (
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
      key: "status",
      render: (_: any, record: PromotionCode) => (
        <Tag color={getStatusColor(record)}>{getStatusText(record)}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: PromotionCode) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingCode(record);
                form.setFieldsValue({
                  ...record,
                  startDate: dayjs(record.startDate),
                  endDate: dayjs(record.endDate),
                });
                setShowCreateModal(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa mã khuyến mãi này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDeleteCode(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Tooltip>
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
              <div className="text-4xl mb-2">🎫</div>
              <p className="text-gray-500 font-medium">
                Vui lòng chọn event để xem promotion codes
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
                placeholder="Tìm kiếm mã khuyến mãi..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
              />
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: 200 }}
                options={[{ value: "all", label: "Tất cả loại" }, ...codeTypes]}
              />
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 150 }}
                options={[
                  { value: "all", label: "Tất cả" },
                  { value: "active", label: "Hoạt động" },
                  { value: "expired", label: "Hết hạn" },
                  { value: "inactive", label: "Tạm dừng" },
                ]}
              />
            </div>
            <div className="flex gap-2">
              <Button icon={<DownloadOutlined />} onClick={handleExportCodes}>
                Xuất file
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchCodes}>
                Làm mới
              </Button>
              <Button
                icon={<PlusOutlined />}
                onClick={() => {
                  setShowGenerateModal(true);
                  generateForm.resetFields();
                }}
              >
                Tạo hàng loạt
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCode(null);
                  form.resetFields();
                  setShowCreateModal(true);
                }}
              >
                Tạo mã mới
              </Button>
            </div>
          </div>

          {/* Codes Table */}
          <Card>
            <Table
              columns={columns}
              dataSource={filteredCodes}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} mã`,
              }}
            />
          </Card>

          {/* Create/Edit Modal */}
          <Modal
            title={
              editingCode ? "Chỉnh sửa mã khuyến mãi" : "Tạo mã khuyến mãi mới"
            }
            open={showCreateModal}
            onCancel={() => {
              setShowCreateModal(false);
              setEditingCode(null);
              form.resetFields();
            }}
            footer={null}
            width={700}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={editingCode ? handleUpdateCode : handleCreateCode}
              initialValues={{
                type: "PERCENTAGE_DISCOUNT",
                isActive: true,
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="code"
                  label="Mã khuyến mãi"
                  rules={[{ required: true, message: "Vui lòng nhập mã" }]}
                >
                  <Input placeholder="WELCOME2024" />
                </Form.Item>

                <Form.Item
                  name="name"
                  label="Tên mã"
                  rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                >
                  <Input placeholder="Chào mừng năm mới 2024" />
                </Form.Item>
              </div>

              <Form.Item name="description" label="Mô tả">
                <TextArea
                  rows={2}
                  placeholder="Mô tả chi tiết về mã khuyến mãi..."
                />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="type"
                  label="Loại mã"
                  rules={[{ required: true, message: "Vui lòng chọn loại" }]}
                >
                  <Select options={codeTypes} />
                </Form.Item>

                <Form.Item
                  name="value"
                  label="Giá trị"
                  rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    placeholder="Nhập giá trị"
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="startDate"
                  label="Ngày bắt đầu"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                  ]}
                >
                  <DatePicker showTime className="w-full" />
                </Form.Item>

                <Form.Item
                  name="endDate"
                  label="Ngày kết thúc"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày kết thúc" },
                  ]}
                >
                  <DatePicker showTime className="w-full" />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="maxUsageCount" label="Số lần sử dụng tối đa">
                  <InputNumber
                    className="w-full"
                    min={1}
                    placeholder="Để trống = không giới hạn"
                  />
                </Form.Item>

                <Form.Item
                  name="isActive"
                  label="Kích hoạt"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCode(null);
                    form.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingCode ? "Cập nhật" : "Tạo"}
                </Button>
              </div>
            </Form>
          </Modal>

          {/* Generate Codes Modal */}
          <Modal
            title="Tạo mã khuyến mãi hàng loạt"
            open={showGenerateModal}
            onCancel={() => {
              setShowGenerateModal(false);
              generateForm.resetFields();
            }}
            footer={null}
            width={600}
          >
            <Form
              form={generateForm}
              layout="vertical"
              onFinish={handleGenerateCodes}
              initialValues={{
                type: "PERCENTAGE_DISCOUNT",
                quantity: 100,
                codeLength: 8,
                prefix: "",
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="baseName"
                  label="Tên cơ bản"
                  rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                >
                  <Input placeholder="Mã giảm giá tháng 12" />
                </Form.Item>

                <Form.Item
                  name="quantity"
                  label="Số lượng mã"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng" },
                  ]}
                >
                  <InputNumber className="w-full" min={1} max={1000} />
                </Form.Item>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Form.Item name="prefix" label="Tiền tố">
                  <Input placeholder="SALE" />
                </Form.Item>

                <Form.Item
                  name="codeLength"
                  label="Độ dài mã"
                  rules={[{ required: true, message: "Vui lòng nhập độ dài" }]}
                >
                  <InputNumber className="w-full" min={4} max={20} />
                </Form.Item>

                <Form.Item
                  name="type"
                  label="Loại mã"
                  rules={[{ required: true, message: "Vui lòng chọn loại" }]}
                >
                  <Select options={codeTypes} />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="value"
                  label="Giá trị"
                  rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
                >
                  <InputNumber className="w-full" min={0} />
                </Form.Item>

                <Form.Item
                  name="maxUsageCount"
                  label="Số lần sử dụng tối đa mỗi mã"
                >
                  <InputNumber className="w-full" min={1} />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="startDate"
                  label="Ngày bắt đầu"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                  ]}
                >
                  <DatePicker showTime className="w-full" />
                </Form.Item>

                <Form.Item
                  name="endDate"
                  label="Ngày kết thúc"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày kết thúc" },
                  ]}
                >
                  <DatePicker showTime className="w-full" />
                </Form.Item>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => {
                    setShowGenerateModal(false);
                    generateForm.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Tạo mã hàng loạt
                </Button>
              </div>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
}
