"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Table, Modal, Drawer, Form, Input, Select, DatePicker, Switch, Button, Tooltip, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useBranch } from "@/components/providers/BranchProvider";
import dayjs from "@/lib/dayjs";
import { Edit, Trash2, KeyRound } from "lucide-react";
import "../admin-tabs.css";

const { TextArea } = Input;

interface Staff {
  id: number;
  userName: string;
  fullName: string;
  staffType: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  dateOfBirth: string | null;
  gender: string;
  hireDate: string | null;
  idCard: string | null;
  idCardExpiryDate: string | null;
  idCardIssueDate: string | null;
  note: string | null;
  resignDate: string | null;
  needCheckMacAddress: boolean;
  isDeleted: boolean;
  isAdmin: boolean;
  branch: string;
  createdAt: string;
  updatedAt: string;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  baseSalary: number;
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [form] = Form.useForm();
  const { branch: selectedBranch } = useBranch();
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const columns: ColumnsType<Staff> = [
    {
      title: "Tên đăng nhập",
      dataIndex: "userName",
      key: "userName",
      render: (text: string) => (
        <span className="text-sm font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => (
        <span className="text-sm text-gray-900">{text}</span>
      ),
    },
    {
      title: "Loại nhân viên",
      dataIndex: "staffType",
      key: "staffType",
      render: (text: string) => {
        const typeMap: Record<string, string> = {
          STAFF: "Nhân viên",
          CASHIER: "Thu ngân",
          MANAGER: "Quản lý",
          BRANCH_ADMIN: "Quản lý chi nhánh",
          SUPER_ADMIN: "Super Admin",
          KITCHEN: "Bếp",
          SECURITY: "Bảo vệ",
        };
        return (
          <span className="text-sm text-gray-900">{typeMap[text] || text}</span>
        );
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (text: string | null) => (
        <span className="text-sm text-gray-900">{text || "-"}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string | null) => (
        <span className="text-sm text-gray-900">{text || "-"}</span>
      ),
    },
    {
      title: "Ngày vào làm",
      dataIndex: "hireDate",
      key: "hireDate",
      render: (text: string | null) => (
        <span className="text-sm text-gray-900">
          {text ? new Date(text).toLocaleDateString("vi-VN") : "-"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: any, record: Staff) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            record.isDeleted
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {record.isDeleted ? "Đã xóa" : "Hoạt động"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Staff) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Sửa">
            <button
              onClick={() => handleEdit(record)}
              className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={record.isDeleted}
            >
              <Edit size={16} />
            </button>
          </Tooltip>
          {!record.isDeleted && (
            <>
              <Tooltip title="Reset mật khẩu">
                <button
                  onClick={() => handleResetPassword(record.id)}
                  className="p-1.5 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded transition-colors"
                >
                  <KeyRound size={16} />
                </button>
              </Tooltip>
              <Tooltip title="Xóa">
                <button
                  onClick={() => handleDelete(record.id)}
                  className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
  ];

  // Fetch staff
  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/staff?includeDeleted=${includeDeleted}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch staff");
      }
      const result = await response.json();
      if (result.success) {
        setStaff(result.data || []);
      } else {
        throw new Error(result.error || "Failed to fetch staff");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải danh sách nhân viên");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete staff
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Xác nhận xóa nhân viên",
      content: "Bạn có chắc chắn muốn xóa nhân viên này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const response = await fetch(`/api/staff?id=${id}`, {
            method: "DELETE",
          });

          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.error || "Failed to delete staff");
          }

          toast.success("Xóa thành công");
          fetchStaff();
        } catch (error: any) {
          toast.error(error.message || "Không thể xóa nhân viên");
        }
      },
    });
  };

  // Reset password
  const handleResetPassword = async (id: number) => {
    Modal.confirm({
      title: "Xác nhận reset mật khẩu",
      content:
        "Bạn có chắc chắn muốn reset mật khẩu? Nhân viên sẽ phải đặt mật khẩu mới khi đăng nhập lần tiếp theo.",
      okText: "Reset",
      okType: "default",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const response = await fetch(`/api/staff/${id}/reset-password`, {
            method: "POST",
          });

          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.error || "Failed to reset password");
          }

          toast.success("Reset mật khẩu thành công");
        } catch (error: any) {
          toast.error(error.message || "Không thể reset mật khẩu");
        }
      },
    });
  };

  // Handle form submit
  const handleFormSubmit = async (values: any) => {
    try {
      const payload: any = {
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
        resignDate: values.resignDate
          ? values.resignDate.format("YYYY-MM-DD")
          : null,
      };

      // Remove password if empty (for update)
      if (selectedStaff && !payload.password) {
        delete payload.password;
      }

      const url = selectedStaff ? "/api/staff" : "/api/staff";
      const method = selectedStaff ? "PUT" : "POST";

      if (selectedStaff) {
        payload.id = selectedStaff.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save staff");
      }

      toast.success(
        selectedStaff ? "Cập nhật thành công" : "Tạo nhân viên thành công",
      );
      setShowForm(false);
      setSelectedStaff(null);
      form.resetFields();
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || "Không thể lưu nhân viên");
    }
  };

  // Edit staff
  const handleEdit = (staffItem: Staff) => {
    setSelectedStaff(staffItem);
    form.setFieldsValue({
      ...staffItem,
      dateOfBirth: staffItem.dateOfBirth
        ? dayjs(staffItem.dateOfBirth)
        : null,
      hireDate: staffItem.hireDate ? dayjs(staffItem.hireDate) : null,
      idCardExpiryDate: staffItem.idCardExpiryDate
        ? dayjs(staffItem.idCardExpiryDate)
        : null,
      idCardIssueDate: staffItem.idCardIssueDate
        ? dayjs(staffItem.idCardIssueDate)
        : null,
      resignDate: staffItem.resignDate ? dayjs(staffItem.resignDate) : null,
      password: "", // Don't show password
    });
    setShowForm(true);
  };

  // Add new staff
  const handleAdd = () => {
    setSelectedStaff(null);
    form.resetFields();
    setShowForm(true);
  };

  useEffect(() => {
    fetchStaff();
  }, [includeDeleted]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Quản lý nhân viên</h2>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="rounded"
            />
            Hiển thị đã xóa
          </label>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Form drawer */}
      <Drawer
        title={selectedStaff ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedStaff(null);
          form.resetFields();
        }}
        width={720}
        placement="right"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          className="[&_.ant-form-item]:mb-3"
        >
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: "Thông tin căn bản",
                children: (
                  <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <Form.Item
              label="Tên đăng nhập"
              name="userName"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
                {
                  min: 3,
                  message: "Tên đăng nhập phải có ít nhất 3 ký tự",
                },
              ]}
            >
              <Input disabled={!!selectedStaff} />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                {
                  required: !selectedStaff,
                  message: "Vui lòng nhập mật khẩu",
                },
                {
                  min: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
              ]}
            >
              <Input.Password
                placeholder={selectedStaff ? "Để trống nếu không đổi" : ""}
              />
            </Form.Item>

            <Form.Item
              label="Họ tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Loại nhân viên"
              name="staffType"
              rules={[
                { required: true, message: "Vui lòng chọn loại nhân viên" },
              ]}
            >
              <Select>
                <Select.Option value="STAFF">Nhân viên</Select.Option>
                <Select.Option value="KITCHEN">Bếp</Select.Option>
                <Select.Option value="SECURITY">Bảo vệ</Select.Option>
                          <Select.Option value="CASHIER">Thu ngân</Select.Option>
                          <Select.Option value="MANAGER">Quản lý</Select.Option>
                          <Select.Option value="BRANCH_ADMIN">Quản lý chi nhánh</Select.Option>
                          <Select.Option value="SUPER_ADMIN">Super Admin</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Số điện thoại" name="phone">
              <Input />
            </Form.Item>

            <Form.Item label="Email" name="email">
              <Input type="email" />
            </Form.Item>

            <Form.Item label="Giới tính" name="gender">
              <Select>
                <Select.Option value="MALE">Nam</Select.Option>
                <Select.Option value="FEMALE">Nữ</Select.Option>
                <Select.Option value="OTHER">Khác</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Ngày sinh" name="dateOfBirth">
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item label="Ngày vào làm" name="hireDate">
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item label="Ngày nghỉ việc" name="resignDate">
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
          </div>

          <Form.Item label="Địa chỉ" name="address">
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Kiểm tra MAC Address"
            name="needCheckMacAddress"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

                    <Form.Item
                      label="Lương cơ bản (₫/giờ)"
                      name="baseSalary"
                      rules={[
                        { required: true, message: "Vui lòng nhập lương cơ bản" },
                        { type: "number", min: 0, message: "Lương phải >= 0" },
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="Nhập lương cơ bản"
                        addonAfter="₫/giờ"
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "2",
                label: "Thông tin thanh toán",
                children: (
                  <div className="grid grid-cols-1 gap-x-4 gap-y-2">
                    <Form.Item label="Tên tài khoản ngân hàng" name="bankAccountName">
                      <Input placeholder="Nhập tên tài khoản ngân hàng" />
                    </Form.Item>

                    <Form.Item label="Số tài khoản" name="bankAccountNumber">
                      <Input placeholder="Nhập số tài khoản" />
                    </Form.Item>

                    <Form.Item label="Tên ngân hàng" name="bankName">
                      <Input placeholder="Nhập tên ngân hàng" />
                    </Form.Item>
                  </div>
                ),
              },
            ]}
          />

          <Form.Item className="mb-0 mt-4">
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowForm(false);
                  setSelectedStaff(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedStaff ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Danh sách nhân viên */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table
          columns={columns}
          dataSource={staff}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: staff.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} nhân viên`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          className="[&_.ant-table-cell]:!p-4 [&_.ant-table-thead_.ant-table-cell]:!bg-gray-50 [&_.ant-table-thead_.ant-table-cell]:!text-gray-500 [&_.ant-table-thead_.ant-table-cell]:!font-medium [&_.ant-table-thead_.ant-table-cell]:!text-xs [&_.ant-table-thead_.ant-table-cell]:!uppercase"
        />
      </div>
    </div>
  );
}

