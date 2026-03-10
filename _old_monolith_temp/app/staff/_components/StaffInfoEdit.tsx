"use client";

import { useState } from "react";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Modal,
  message,
} from "antd";
import {
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  DollarSign,
  Save,
  X,
} from "lucide-react";
import dayjs from "@/lib/dayjs";
import { toast } from "sonner";

interface StaffInfoEditProps {
  staffData: any;
  onRefresh: () => void;
}

export default function StaffInfoEdit({
  staffData,
  onRefresh,
}: StaffInfoEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const canEdit =
    staffData?.staffType === "MANAGER" ||
    staffData?.staffType === "SUPER_ADMIN" ||
    staffData?.staffType === "BRANCH_ADMIN";

  const handleEdit = () => {
    if (!canEdit) {
      toast.warning("Chỉ quản lý hoặc admin mới được chỉnh sửa thông tin");
      return;
    }
    setIsEditing(true);
    form.setFieldsValue({
      fullName: staffData.fullName,
      phone: staffData.phone,
      email: staffData.email,
      address: staffData.address,
      dateOfBirth: staffData.dateOfBirth ? dayjs(staffData.dateOfBirth) : null,
      hireDate: staffData.hireDate ? dayjs(staffData.hireDate) : null,
      idCard: staffData.idCard,
      idCardExpiryDate: staffData.idCardExpiryDate
        ? dayjs(staffData.idCardExpiryDate)
        : null,
      idCardIssueDate: staffData.idCardIssueDate
        ? dayjs(staffData.idCardIssueDate)
        : null,
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
      const response = await fetch(
        `/api/staff/${staffData.id}/update-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            dateOfBirth: values.dateOfBirth
              ? values.dateOfBirth.format("YYYY-MM-DD")
              : null,
            hireDate: values.hireDate
              ? values.hireDate.format("YYYY-MM-DD")
              : null,
            idCardExpiryDate: values.idCardExpiryDate
              ? values.idCardExpiryDate.format("YYYY-MM-DD")
              : null,
            idCardIssueDate: values.idCardIssueDate
              ? values.idCardIssueDate.format("YYYY-MM-DD")
              : null,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit update request");
      }

      const result = await response.json();
      if (result.success) {
        toast.success("Yêu cầu cập nhật đã được gửi, chờ admin/manager duyệt");
        setIsEditing(false);
        form.resetFields();
        onRefresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể gửi yêu cầu cập nhật");
    } finally {
      setLoading(false);
    }
  };

  if (!staffData) {
    return (
      <div className="text-center py-8 text-gray-500">Không có thông tin</div>
    );
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
          className="shadow-sm"
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Họ tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item label="Số điện thoại" name="phone">
              <Input />
            </Form.Item>

            <Form.Item label="Email" name="email">
              <Input type="email" />
            </Form.Item>

            <Form.Item label="Địa chỉ" name="address">
              <Input.TextArea rows={2} />
            </Form.Item>

            <Form.Item label="Ngày sinh" name="dateOfBirth">
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item label="Ngày vào làm" name="hireDate">
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item label="CMND/CCCD" name="idCard">
              <Input />
            </Form.Item>

            <Form.Item label="Ngày cấp CMND/CCCD" name="idCardIssueDate">
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item label="Ngày hết hạn CMND/CCCD" name="idCardExpiryDate">
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea rows={3} />
            </Form.Item>

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-3">Thông tin thanh toán</h3>
              <Form.Item label="Tên tài khoản ngân hàng" name="bankAccountName">
                <Input />
              </Form.Item>

              <Form.Item label="Số tài khoản" name="bankAccountNumber">
                <Input />
              </Form.Item>

              <Form.Item label="Tên ngân hàng" name="bankName">
                <Input />
              </Form.Item>
            </div>

            <Form.Item className="mt-4">
              <Button
                type="primary"
                htmlType="submit"
                icon={<Save size={16} />}
                loading={loading}
                block
              >
                Gửi yêu cầu cập nhật
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <Card
        className="shadow-sm"
        extra={
          canEdit ? (
            <Button
              type="primary"
              icon={<Edit size={16} />}
              onClick={handleEdit}
            >
              Chỉnh sửa
            </Button>
          ) : null
        }
      >
        <Descriptions
          column={1}
          bordered
          size="small"
          labelStyle={{ fontWeight: 600, width: "40%" }}
        >
          <Descriptions.Item label="Họ tên">
            {staffData.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Tên đăng nhập">
            {staffData.userName}
          </Descriptions.Item>
          <Descriptions.Item label="Loại nhân viên">
            <Tag color="blue">
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
            <Descriptions.Item
              label={
                <span className="flex items-center gap-1">
                  <Phone size={14} />
                  Số điện thoại
                </span>
              }
            >
              {staffData.phone}
            </Descriptions.Item>
          )}
          {staffData.email && (
            <Descriptions.Item
              label={
                <span className="flex items-center gap-1">
                  <Mail size={14} />
                  Email
                </span>
              }
            >
              {staffData.email}
            </Descriptions.Item>
          )}
          {staffData.address && (
            <Descriptions.Item
              label={
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  Địa chỉ
                </span>
              }
            >
              {staffData.address}
            </Descriptions.Item>
          )}
          {staffData.dateOfBirth && (
            <Descriptions.Item
              label={
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Ngày sinh
                </span>
              }
            >
              {dayjs(staffData.dateOfBirth).format("DD/MM/YYYY")}
            </Descriptions.Item>
          )}
          {staffData.hireDate && (
            <Descriptions.Item
              label={
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Ngày vào làm
                </span>
              }
            >
              {dayjs(staffData.hireDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
          )}
          {staffData.baseSalary !== undefined && (
            <Descriptions.Item
              label={
                <span className="flex items-center gap-1">
                  <DollarSign size={14} />
                  Lương cơ bản
                </span>
              }
            >
              {staffData.baseSalary.toLocaleString("vi-VN")} ₫/giờ
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Thông tin thanh toán */}
      {(staffData.bankAccountName ||
        staffData.bankAccountNumber ||
        staffData.bankName) && (
        <Card title="Thông tin thanh toán" className="shadow-sm">
          <Descriptions
            column={1}
            bordered
            size="small"
            labelStyle={{ fontWeight: 600, width: "40%" }}
          >
            {staffData.bankAccountName && (
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <CreditCard size={14} />
                    Tên tài khoản
                  </span>
                }
              >
                {staffData.bankAccountName}
              </Descriptions.Item>
            )}
            {staffData.bankAccountNumber && (
              <Descriptions.Item label="Số tài khoản">
                {staffData.bankAccountNumber}
              </Descriptions.Item>
            )}
            {staffData.bankName && (
              <Descriptions.Item label="Ngân hàng">
                {staffData.bankName}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {staffData.note && (
        <Card title="Ghi chú" className="shadow-sm">
          <p className="text-gray-700 whitespace-pre-wrap">{staffData.note}</p>
        </Card>
      )}
    </div>
  );
}
