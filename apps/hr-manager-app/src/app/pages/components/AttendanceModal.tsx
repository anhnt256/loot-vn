import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, DatePicker, message, Space } from 'antd';
import dayjs from 'dayjs';
import { apiClient } from '@gateway-workspace/shared/utils';

interface AttendanceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ open, onClose, onSuccess, initialData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchStaff();
      if (initialData) {
        form.setFieldsValue({
          staffId: initialData.staffId,
          checkInTime: dayjs(initialData.checkInTime),
          checkOutTime: initialData.checkOutTime ? dayjs(initialData.checkOutTime) : null,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
            checkInTime: dayjs(),
        });
      }
    }
  }, [open, initialData, form]);

  const fetchStaff = async () => {
    try {
      const response = await apiClient.get('/api/staff'); // Adjust path if needed
      setStaffList(response.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        ...values,
        checkInTime: values.checkInTime.toISOString(),
        checkOutTime: values.checkOutTime ? values.checkOutTime.toISOString() : null,
      };

      if (initialData) {
        await apiClient.patch(`/api/hr-manager/attendance/${initialData.id}`, payload);
        message.success('Cập nhật bản ghi thành công');
      } else {
        await apiClient.post('/api/hr-manager/attendance', payload);
        message.success('Thêm bản ghi chấm công thành công');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error submitting attendance:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialData ? 'Sửa bản ghi chấm công' : 'Check-in thủ công'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={initialData ? 'Lưu thay đổi' : 'Tạo bản ghi'}
      cancelText="Hủy"
      width={400}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="staffId"
          label="Nhân viên"
          rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
        >
          <Select
            placeholder="Chọn nhân viên"
            showSearch
            optionFilterProp="children"
            loading={staffList.length === 0}
          >
            {staffList.map((staff: any) => (
              <Select.Option key={staff.id} value={staff.id}>
                {staff.fullName} (ID: {staff.id})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="checkInTime"
          label="Giờ vào"
          rules={[{ required: true, message: 'Vui lòng chọn giờ vào' }]}
        >
          <DatePicker showTime format="DD/MM/YYYY HH:mm:ss" className="w-full" />
        </Form.Item>

        <Form.Item
          name="checkOutTime"
          label="Giờ ra (Tùy chọn)"
        >
          <DatePicker showTime format="DD/MM/YYYY HH:mm:ss" className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AttendanceModal;
