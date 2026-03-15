import React, { useEffect } from 'react';
import { Modal, Form, Input, TimePicker, Switch, message } from 'antd';
import dayjs from 'dayjs';
import { apiClient } from '@gateway-workspace/shared/utils';

interface WorkShiftModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const WorkShiftModal: React.FC<WorkShiftModalProps> = ({ open, onClose, onSuccess, initialData }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
          startTime: initialData.startTime ? dayjs(initialData.startTime) : null,
          endTime: initialData.endTime ? dayjs(initialData.endTime) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        FnetStaffId: values.FnetStaffId ? Number(values.FnetStaffId) : undefined,
      };

      if (initialData) {
        await apiClient.patch(`/api/hr-manager/work-shifts/${initialData.id}`, payload);
        message.success('Cập nhật ca làm việc thành công');
      } else {
        await apiClient.post('/api/hr-manager/work-shifts', payload);
        message.success('Thêm ca làm việc thành công');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving work shift:', error);
      if (error.name !== 'ValidationError') {
        message.error(error.response?.data?.message || 'Không thể lưu ca làm việc');
      }
    }
  };

  return (
    <Modal
      title={initialData ? 'Chỉnh sửa ca làm việc' : 'Thêm ca làm việc mới'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={initialData ? 'Cập nhật' : 'Thêm mới'}
      cancelText="Hủy"
      width={400}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ isOvernight: false }}
        className="mt-4"
      >
        <Form.Item
          name="name"
          label="Tên ca làm việc"
          rules={[{ required: true, message: 'Vui lòng nhập tên ca làm việc' }]}
        >
          <Input placeholder="Ví dụ: Ca sáng, Ca tối..." />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="startTime"
            label="Giờ bắt đầu"
            rules={[{ required: true, message: 'Chọn giờ bắt đầu' }]}
          >
            <TimePicker format="HH:mm" className="w-full" />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="Giờ kết thúc"
            rules={[{ required: true, message: 'Chọn giờ kết thúc' }]}
          >
            <TimePicker format="HH:mm" className="w-full" />
          </Form.Item>
        </div>
        <Form.Item
          name="isOvernight"
          label="Ca qua đêm"
          valuePropName="checked"
          extra="Bật nếu ca kết thúc vào ngày hôm sau"
        >
          <Switch size="small" />
        </Form.Item>

        <div className="border-t border-[#e2e8f0] my-4 pt-4">
          <p className="text-xs font-semibold text-[#64748b] mb-4 uppercase tracking-wider">Thông tin tích hợp hệ thống</p>
          
          <Form.Item
            name="FnetStaffId"
            label="Fnet ID"
          >
            <Input placeholder="Nhập ID nhân viên trên hệ thống Fnet" type="number" />
          </Form.Item>

          <Form.Item
            name="ffoodId"
            label="Ffood ID"
          >
            <Input placeholder="Nhập ID trên hệ thống Ffood" />
          </Form.Item>

          <Form.Item
            name="gcpId"
            label="GCP ID"
          >
            <Input placeholder="Nhập ID trên hệ thống GCP (Google Cloud)" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default WorkShiftModal;
