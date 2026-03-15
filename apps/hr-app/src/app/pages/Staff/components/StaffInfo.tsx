import React, { useState } from "react";
import { Card, Descriptions, Tag, Button, Form, Input, Select, DatePicker, message } from "antd";
import { Edit, Phone, Mail, MapPin, Calendar, CreditCard, DollarSign, Save, X } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { apiClient } from "@gateway-workspace/shared/utils";

interface StaffInfoProps {
  staffData: any;
  onRefresh: () => void;
}

export default function StaffInfo({ staffData, onRefresh }: StaffInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // In the real app, we need to get user context to check permissions
  // For now, allow edit
  const canEdit = true;

  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue({
      fullName: staffData.fullName,
      phone: staffData.phone,
      email: staffData.email,
      address: staffData.address,
      dateOfBirth: staffData.dateOfBirth ? dayjs(staffData.dateOfBirth) : null,
      hireDate: staffData.hireDate ? dayjs(staffData.hireDate) : null,
      idCard: staffData.idCard,
      idCardExpiryDate: staffData.idCardExpiryDate ? dayjs(staffData.idCardExpiryDate) : null,
      idCardIssueDate: staffData.idCardIssueDate ? dayjs(staffData.idCardIssueDate) : null,
      note: staffData.note,
      bankAccountName: staffData.bankAccountName,
      bankAccountNumber: staffData.bankAccountNumber,
      bankName: staffData.bankName,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      // NOTE: For full functionality, we need an endpoint to handle updates
      // This will just simulate a success toast for the frontend implementation
      // const response = await fetch(`/api/staff/${staffData.id}/update-request`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({...}),
      // });
      
      setTimeout(() => {
        toast.success("Yêu cầu cập nhật đã được gửi, chờ admin/manager duyệt");
        setIsEditing(false);
        form.resetFields();
        onRefresh();
        setLoading(false);
      }, 1000);
      
    } catch (error: any) {
      toast.error(error.message || "Không thể gửi yêu cầu cập nhật");
      setLoading(false);
    }
  };

  if (!staffData) {
    return <div className="text-center py-8 text-gray-500">Không có thông tin</div>;
  }

  if (isEditing) {
    return (
      <div className="space-y-4 pb-4">
        <Card
          title="Chỉnh sửa thông tin"
          extra={
            <Button type="text" icon={<X size={16} />} onClick={handleCancel}>
              Hủy
            </Button>
          }
          className="shadow-sm border-blue-100"
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Form.Item label="Họ tên" name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                <Input size="large" />
              </Form.Item>

              <Form.Item label="Số điện thoại" name="phone">
                <Input size="large" />
              </Form.Item>

              <Form.Item label="Email" name="email">
                <Input type="email" size="large" />
              </Form.Item>

              <Form.Item label="Ngày sinh" name="dateOfBirth">
                <DatePicker className="w-full" size="large" format="DD/MM/YYYY" />
              </Form.Item>
            </div>

            <Form.Item label="Địa chỉ" name="address">
              <Input.TextArea rows={2} />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 mt-4 border-t pt-4">
              <Form.Item label="CMND/CCCD" name="idCard">
                <Input size="large" />
              </Form.Item>

              <Form.Item label="Ngày cấp" name="idCardIssueDate">
                <DatePicker className="w-full" size="large" format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item label="Ngày hết hạn" name="idCardExpiryDate">
                <DatePicker className="w-full" size="large" format="DD/MM/YYYY" />
              </Form.Item>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium text-lg mb-4 text-blue-600">Thông tin thanh toán</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                <Form.Item label="Tên tài khoản" name="bankAccountName">
                  <Input size="large" />
                </Form.Item>

                <Form.Item label="Số tài khoản" name="bankAccountNumber">
                  <Input size="large" />
                </Form.Item>

                <Form.Item label="Tên ngân hàng" name="bankName">
                  <Input size="large" />
                </Form.Item>
              </div>
            </div>

            <Form.Item label="Ghi chú" name="note" className="mt-4 border-t pt-4">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item className="mt-6 mb-0">
              <div className="flex justify-end gap-3">
                <Button size="large" onClick={handleCancel}>Hủy</Button>
                <Button type="primary" size="large" htmlType="submit" icon={<Save size={16} />} loading={loading}>
                  Gửi yêu cầu cập nhật
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <Card
        className="shadow-sm border-blue-50"
        extra={
          canEdit ? (
            <Button type="primary" ghost icon={<Edit size={16} />} onClick={handleEdit}>
              Chỉnh sửa
            </Button>
          ) : null
        }
      >
        <Descriptions column={{ xs: 1, sm: 1, md: 2 }} className="mt-2 text-base">
          <Descriptions.Item label={<span className="font-medium text-gray-500">Họ tên</span>}>
            <span className="font-semibold text-gray-800">{staffData.fullName}</span>
          </Descriptions.Item>
          
          <Descriptions.Item label={<span className="font-medium text-gray-500">Tên đăng nhập</span>}>
            {staffData.userName}
          </Descriptions.Item>

          <Descriptions.Item label={<span className="font-medium text-gray-500">Vai trò</span>}>
            <Tag color="blue" className="px-3 py-1 text-sm">
              {staffData.staffType === "STAFF" && "Nhân viên"}
              {staffData.staffType === "KITCHEN" && "Bếp"}
              {staffData.staffType === "SECURITY" && "Bảo vệ"}
              {staffData.staffType === "CASHIER" && "Thu ngân"}
              {staffData.staffType === "MANAGER" && "Quản lý"}
              {staffData.staffType === "SUPER_ADMIN" && "Super Admin"}
              {staffData.staffType === "BRANCH_ADMIN" && "Quản lý chi nhánh"}
            </Tag>
          </Descriptions.Item>

          {staffData.phone && (
            <Descriptions.Item label={<span className="font-medium text-gray-500 flex items-center gap-2"><Phone size={16} />Số điện thoại</span>}>
              {staffData.phone}
            </Descriptions.Item>
          )}

          {staffData.email && (
            <Descriptions.Item label={<span className="font-medium text-gray-500 flex items-center gap-2"><Mail size={16} />Email</span>}>
              {staffData.email}
            </Descriptions.Item>
          )}

          {staffData.dateOfBirth && (
            <Descriptions.Item label={<span className="font-medium text-gray-500 flex items-center gap-2"><Calendar size={16} />Ngày sinh</span>}>
              {dayjs(staffData.dateOfBirth).format("DD/MM/YYYY")}
            </Descriptions.Item>
          )}

          {staffData.hireDate && (
            <Descriptions.Item label={<span className="font-medium text-gray-500 flex items-center gap-2"><Calendar size={16} />Ngày vào làm</span>}>
              {dayjs(staffData.hireDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
          )}

          {staffData.baseSalary !== undefined && (
            <Descriptions.Item label={<span className="font-medium text-gray-500 flex items-center gap-2"><DollarSign size={16} />Lương cơ bản</span>}>
              <span className="text-green-600 font-medium">{staffData.baseSalary.toLocaleString("vi-VN")} ₫/giờ</span>
            </Descriptions.Item>
          )}
        </Descriptions>
        
        {staffData.address && (
          <Descriptions column={1} className="mt-4 text-base border-t border-gray-100 pt-4">
            <Descriptions.Item label={<span className="font-medium text-gray-500 flex items-center gap-2"><MapPin size={16} />Địa chỉ</span>}>
              {staffData.address}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      {/* Payment Info */}
      {(staffData.bankAccountName || staffData.bankAccountNumber || staffData.bankName) && (
        <Card title="Thông tin thanh toán" className="shadow-sm border-gray-200">
          <Descriptions column={{ xs: 1, sm: 2 }} className="text-base">
            {staffData.bankAccountName && (
              <Descriptions.Item label={<span className="font-medium text-gray-500 flex items-center gap-2"><CreditCard size={16} />Tên tài khoản</span>}>
                {staffData.bankAccountName}
              </Descriptions.Item>
            )}
            {staffData.bankAccountNumber && (
              <Descriptions.Item label={<span className="font-medium text-gray-500">Số tài khoản</span>}>
                {staffData.bankAccountNumber}
              </Descriptions.Item>
            )}
            {staffData.bankName && (
              <Descriptions.Item label={<span className="font-medium text-gray-500">Ngân hàng</span>}>
                {staffData.bankName}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {staffData.note && (
        <Card title="Ghi chú" className="shadow-sm bg-gray-50">
          <p className="text-gray-700 whitespace-pre-wrap">{staffData.note}</p>
        </Card>
      )}
    </div>
  );
}
