import React, { useState, useEffect } from "react";
import { Card, List, Tag, Spin, Empty, Button, Modal, Form, Input, Select, InputNumber, DatePicker } from "antd";
import { Send, Clock, Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { apiClient } from "@gateway-workspace/shared/utils";

interface RequestTabProps {
  staffId: string;
}

interface RequestItem {
  id: string;
  type: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  metadata: any;
  createdAt: string;
}

export default function RequestTab({ staffId }: RequestTabProps) {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<string>("late_arrival");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRequests();
  }, [staffId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const result = await apiClient.get(`/hr-app/requests`);
      if (result.data.success) {
        setRequests(result.data.data);
      }
    } catch (error: any) {
      toast.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (values: any) => {
    try {
      const payload = {
        type: requestType,
        metadata: values
      };
      
      const result = await apiClient.post(`/hr-app/requests`, payload);
      if (result.data.success) {
        toast.success("Gửi yêu cầu thành công");
        setIsModalOpen(false);
        form.resetFields();
        fetchRequests();
      } else {
        throw new Error(result.data.error || "Gửi yêu cầu thất bại");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCancelRequest = async (id: string) => {
    try {
      const result = await apiClient.delete(`/hr-app/requests/${id}`);
      if (result.data.success) {
        toast.success("Đã hủy yêu cầu");
        fetchRequests();
      }
    } catch (error: any) {
      toast.error("Không thể hủy yêu cầu");
    }
  };

  const renderMetadata = (type: string, metadata: any) => {
    switch (type) {
      case 'late_arrival':
        return `Dự kiến: ${metadata.expected_time} | Lý do: ${metadata.reason}`;
      case 'shift_change':
        return `Từ ca: ${metadata.from_shift_id} sang ${metadata.to_shift_id} (${metadata.date})`;
      case 'salary_advance':
        return `Số tiền: ${metadata.amount?.toLocaleString('vi-VN')}₫ | PT: ${metadata.payment_method}`;
      case 'leave':
        return `Loại: ${metadata.leave_type} | Từ: ${metadata.from_date} đến ${metadata.to_date}`;
      default:
        return JSON.stringify(metadata);
    }
  };

  const getTypeName = (type: string) => {
    const types: any = {
      late_arrival: "Xin đi muộn",
      shift_change: "Đổi ca làm",
      salary_advance: "Ứng lương",
      leave: "Xin nghỉ phép"
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-4 pb-4">
      <Card
        title={
          <div className="flex justify-between items-center w-full">
            <span className="flex items-center gap-2">
              <Send size={18} className="text-[var(--primary-color)]" />
              Yêu cầu của tôi
            </span>
            <Button 
              type="primary" 
              icon={<Plus size={16} />} 
              onClick={() => setIsModalOpen(true)}
              className="bg-[var(--primary-color)] border-none hover:opacity-90 hover:!bg-[var(--primary-color)]"
            >
              Tạo mới
            </Button>
          </div>
        }
        className="shadow-sm"
      >
        {loading ? (
          <div className="flex justify-center py-8"><Spin /></div>
        ) : requests.length === 0 ? (
          <Empty description="Bạn chưa gửi yêu cầu nào" />
        ) : (
          <List
            dataSource={requests}
            renderItem={(item) => (
              <List.Item
                actions={[
                  item.status === 'PENDING' && (
                    <Button 
                      type="text" 
                      danger 
                      icon={<Trash2 size={16} />} 
                      onClick={() => handleCancelRequest(item.id)}
                    >
                      Hủy
                    </Button>
                  )
                ].filter(Boolean)}
              >
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">{getTypeName(item.type)}</span>
                    <Tag color={
                      item.status === 'APPROVED' ? 'green' : 
                      item.status === 'REJECTED' ? 'red' : 'orange'
                    }>
                      {item.status === 'APPROVED' ? 'Đã duyệt' : 
                       item.status === 'REJECTED' ? 'Bị từ chối' : 'Chờ duyệt'}
                    </Tag>
                  </div>
                  <div className="text-sm text-gray-600">
                    {renderMetadata(item.type, item.metadata)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar size={12} />
                    {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title="Gửi yêu cầu mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleCreateRequest}
          initialValues={{ expected_time: "09:00", payment_method: "transfer" }}
        >
          <Form.Item label="Loại yêu cầu" name="type">
            <Select 
              value={requestType} 
              onChange={(v) => {
                setRequestType(v);
              }}
              options={[
                { value: 'late_arrival', label: 'Xin đi muộn' },
                { value: 'shift_change', label: 'Đổi ca làm' },
                { value: 'salary_advance', label: 'Ứng lương' },
                { value: 'leave', label: 'Xin nghỉ phép' },
              ]}
            />
          </Form.Item>

          {requestType === 'late_arrival' && (
            <>
              <Form.Item label="Giờ đến dự kiến" name="expected_time" rules={[{ required: true }]}>
                <Input placeholder="Ví dụ: 09:30" />
              </Form.Item>
              <Form.Item label="Lý do" name="reason" rules={[{ required: true }]}>
                <Input.TextArea placeholder="Nhập lý do xin đi muộn" />
              </Form.Item>
            </>
          )}

          {requestType === 'shift_change' && (
            <>
              <Form.Item label="Ngày đổi" name="date" rules={[{ required: true }]}>
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
              <Form.Item label="Từ ca (ID)" name="from_shift_id" rules={[{ required: true }]}>
                <InputNumber prefix="ID" className="w-full" />
              </Form.Item>
              <Form.Item label="Sang ca (ID)" name="to_shift_id" rules={[{ required: true }]}>
                <InputNumber className="w-full" />
              </Form.Item>
            </>
          )}

          {requestType === 'salary_advance' && (
            <>
              <Form.Item label="Số tiền muốn ứng" name="amount" rules={[{ required: true }]}>
                <InputNumber 
                  className="w-full" 
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  suffix="₫"
                />
              </Form.Item>
              <Form.Item label="Phương thức nhận" name="payment_method">
                <Select options={[
                  { value: 'transfer', label: 'Chuyển khoản' },
                  { value: 'cash', label: 'Tiền mặt' },
                ]} />
              </Form.Item>
            </>
          )}

          {requestType === 'leave' && (
            <>
              <Form.Item label="Loại nghỉ" name="leave_type" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'sick', label: 'Nghỉ ốm' },
                  { value: 'personal', label: 'Nghỉ việc riêng' },
                  { value: 'annual', label: 'Nghỉ phép năm' },
                ]} />
              </Form.Item>
              <Form.Item label="Từ ngày" name="from_date" rules={[{ required: true }]}>
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
              <Form.Item label="Đến ngày" name="to_date" rules={[{ required: true }]}>
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
              <Form.Item label="Lý do" name="reason" rules={[{ required: true }]}>
                <Input.TextArea placeholder="Nhập lý do xin nghỉ" />
              </Form.Item>
            </>
          )}

          <Form.Item className="mb-0 flex justify-end">
            <Button onClick={() => setIsModalOpen(false)} className="mr-2">Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-[var(--primary-color)] border-none hover:opacity-90 hover:!bg-[var(--primary-color)]">Gửi yêu cầu</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
