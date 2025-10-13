"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Tabs,
  Button,
  Card,
  Badge,
  Input,
  Form,
  DatePicker,
  InputNumber,
  message,
  Select,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import RewardsTab from "../../../components/admin/RewardsTab";
import PromotionCodesTab from "../../../components/admin/PromotionCodesTab";
import { useBranch } from "@/components/providers/BranchProvider";

const { TextArea } = Input;

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

export default function EventManagementDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<"events" | "rewards" | "codes">(
    "events",
  );
  const [form] = Form.useForm();
  const { branch: selectedBranch } = useBranch();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events");
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      message.error("Lỗi khi tải danh sách events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedBranch, fetchEvents]);

  const handleRefresh = useCallback(() => {
    fetchEvents();
    message.success("Đã cập nhật dữ liệu");
  }, [fetchEvents]);

  const createEvent = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch("/api/events", {
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
        message.success("Tạo event thành công!");
        setShowCreateForm(false);
        form.resetFields();
        fetchEvents();
      } else {
        message.error(data.error || "Lỗi khi tạo event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      message.error("Lỗi khi tạo event");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: "default", text: "Nháp" },
      PENDING_APPROVAL: { color: "warning", text: "Chờ duyệt" },
      ACTIVE: { color: "success", text: "Hoạt động" },
      PAUSED: { color: "processing", text: "Tạm dừng" },
      COMPLETED: { color: "cyan", text: "Hoàn thành" },
      CANCELLED: { color: "error", text: "Hủy bỏ" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge color={config.color} text={config.text} />;
  };

  const getTypeText = (type: string) => {
    const typeMap = {
      NEW_USER_WELCOME: "Chào mừng user mới",
      BIRTHDAY_EVENT: "Sự kiện sinh nhật",
      HOLIDAY_EVENT: "Sự kiện ngày lễ",
      SEASONAL_EVENT: "Sự kiện theo mùa",
      BATTLE_PASS_EVENT: "Sự kiện Battle Pass",
      LUCKY_WHEEL_EVENT: "Sự kiện vòng quay",
      PROMOTIONAL_CAMPAIGN: "Chiến dịch khuyến mãi",
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const eventTypeOptions = [
    { value: "NEW_USER_WELCOME", label: "Chào mừng user mới" },
    { value: "BIRTHDAY_EVENT", label: "Sự kiện sinh nhật" },
    { value: "HOLIDAY_EVENT", label: "Sự kiện ngày lễ" },
    { value: "SEASONAL_EVENT", label: "Sự kiện theo mùa" },
    { value: "BATTLE_PASS_EVENT", label: "Sự kiện Battle Pass" },
    { value: "LUCKY_WHEEL_EVENT", label: "Sự kiện vòng quay" },
    { value: "PROMOTIONAL_CAMPAIGN", label: "Chiến dịch khuyến mãi" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý Event
          </h1>
          <p className="text-gray-600 text-lg">
            Quản lý các sự kiện và chiến dịch khuyến mãi
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 ml-auto">
            <Button
              onClick={handleRefresh}
              icon={<ReloadOutlined />}
              className="flex items-center gap-2"
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateForm(true)}
            >
              Tạo Event Mới
            </Button>
          </div>
        </div>

        {showCreateForm && (
          <Card title="Tạo Event Mới" className="mb-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={createEvent}
              initialValues={{
                type: "NEW_USER_WELCOME",
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="name"
                  label="Tên Event"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên event" },
                  ]}
                >
                  <Input placeholder="Event mừng user mới 2024" />
                </Form.Item>

                <Form.Item
                  name="type"
                  label="Loại Event"
                  rules={[
                    { required: true, message: "Vui lòng chọn loại event" },
                  ]}
                >
                  <Select options={eventTypeOptions} />
                </Form.Item>
              </div>

              <Form.Item name="description" label="Mô tả">
                <TextArea rows={3} placeholder="Mô tả chi tiết về event..." />
              </Form.Item>

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
                <Form.Item name="budget" label="Ngân sách (VND)">
                  <InputNumber
                    className="w-full"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>

                <Form.Item
                  name="expectedParticipants"
                  label="Số người tham gia dự kiến"
                >
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
              </div>

              <div className="flex gap-2">
                <Button type="primary" htmlType="submit" loading={loading}>
                  Tạo Event
                </Button>
                <Button onClick={() => setShowCreateForm(false)}>Hủy</Button>
              </div>
            </Form>
          </Card>
        )}

        {/* Main Content Card */}
        <Card className="shadow-lg border-0">
          <div className="bg-white border-b border-gray-200 p-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("events")}
                className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "events"
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Danh sách Events ({events.length})
              </button>
              <button
                onClick={() => setActiveTab("rewards")}
                className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "rewards"
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Rewards
              </button>
              <button
                onClick={() => setActiveTab("codes")}
                className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "codes"
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Promotion Codes
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Events Tab */}
            {activeTab === "events" && (
              <>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">Đang tải...</div>
                  </div>
                ) : events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <Card
                        key={event.id}
                        className="border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-medium">
                                {event.name}
                              </h3>
                              {getStatusBadge(event.status)}
                            </div>
                            <p className="text-gray-600 mb-2">
                              {getTypeText(event.type)}
                            </p>
                            <p className="text-sm text-gray-700 mb-4">
                              {event.description}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button icon={<EyeOutlined />} />
                            <Button icon={<DownloadOutlined />} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                          <div>
                            <span className="font-medium">Ngân sách:</span>
                            <div>{event.budget?.toLocaleString()} VND</div>
                          </div>
                          <div>
                            <span className="font-medium">Tham gia:</span>
                            <div>
                              {event.totalParticipants}/
                              {event.expectedParticipants}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Mã đã tạo:</span>
                            <div>{event.totalCodesGenerated}</div>
                          </div>
                          <div>
                            <span className="font-medium">Mã đã dùng:</span>
                            <div>{event.totalCodesUsed}</div>
                          </div>
                        </div>

                        <div className="mt-4 text-xs text-gray-500">
                          Tạo lúc:{" "}
                          {new Date(event.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed border-gray-300">
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🎪</div>
                        <p className="text-gray-500 font-medium">
                          Chưa có event nào được tạo
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* Rewards Tab */}
            {activeTab === "rewards" && (
              <div className="space-y-4">
                {/* Event Selection */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="event-select-rewards"
                      className="font-medium text-gray-700"
                    >
                      Chọn Event:
                    </label>
                    <Select
                      id="event-select-rewards"
                      placeholder="Chọn event để xem rewards"
                      value={selectedEvent?.id}
                      onChange={(eventId) => {
                        const event = events.find((e) => e.id === eventId);
                        setSelectedEvent(event || null);
                      }}
                      style={{ width: 300 }}
                      allowClear
                    >
                      {events.map((event) => (
                        <Select.Option key={event.id} value={event.id}>
                          {event.name} ({getStatusBadge(event.status)})
                        </Select.Option>
                      ))}
                    </Select>
                    {selectedEvent && (
                      <div className="text-sm text-gray-600">
                        Đang xem rewards của:{" "}
                        <span className="font-medium">
                          {selectedEvent.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <RewardsTab
                  selectedBranch={selectedBranch}
                  selectedEvent={selectedEvent}
                />
              </div>
            )}

            {/* Promotion Codes Tab */}
            {activeTab === "codes" && (
              <div className="space-y-4">
                {/* Event Selection */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="event-select-codes"
                      className="font-medium text-gray-700"
                    >
                      Chọn Event:
                    </label>
                    <Select
                      id="event-select-codes"
                      placeholder="Chọn event để xem promotion codes"
                      value={selectedEvent?.id}
                      onChange={(eventId) => {
                        const event = events.find((e) => e.id === eventId);
                        setSelectedEvent(event || null);
                      }}
                      style={{ width: 300 }}
                      allowClear
                    >
                      {events.map((event) => (
                        <Select.Option key={event.id} value={event.id}>
                          {event.name} ({getStatusBadge(event.status)})
                        </Select.Option>
                      ))}
                    </Select>
                    {selectedEvent && (
                      <div className="text-sm text-gray-600">
                        Đang xem promotion codes của:{" "}
                        <span className="font-medium">
                          {selectedEvent.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <PromotionCodesTab
                  selectedBranch={selectedBranch}
                  selectedEvent={selectedEvent}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
