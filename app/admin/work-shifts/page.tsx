"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Table,
  Modal,
  Drawer,
  Form,
  Input,
  Switch,
  Button,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Edit, Trash2 } from "lucide-react";
import "../admin-tabs.css";

export interface WorkShiftRow {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  branch: string;
  FnetStaffId?: number | null;
  FfoodStaffId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function WorkShiftsManagementPage() {
  const [list, setList] = useState<WorkShiftRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<WorkShiftRow | null>(null);
  const [form] = Form.useForm();

  const fetchList = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/work-shifts");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch");
      setList(data.data || []);
    } catch (e: any) {
      toast.error(e.message || "Không tải được danh sách ca");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const columns: ColumnsType<WorkShiftRow> = [
    {
      title: "Tên ca",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span className="font-medium text-gray-900">{name ?? ""}</span>
      ),
    },
    {
      title: "Giờ bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      render: (t: string) => (t ? t.slice(0, 8) : "-"),
    },
    {
      title: "Giờ kết thúc",
      dataIndex: "endTime",
      key: "endTime",
      render: (t: string) => (t ? t.slice(0, 8) : "-"),
    },
    {
      title: "Qua đêm",
      dataIndex: "isOvernight",
      key: "isOvernight",
      render: (v: boolean) => (v ? "Có" : "Không"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: unknown, record: WorkShiftRow) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Sửa">
            <button
              onClick={() => handleEdit(record)}
              className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
            >
              <Edit size={16} />
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
        </div>
      ),
    },
  ];

  const handleEdit = (row: WorkShiftRow) => {
    setSelected(row);
    form.setFieldsValue({
      name: row.name,
      startTime: row.startTime?.slice(0, 5) || "07:00",
      endTime: row.endTime?.slice(0, 5) || "14:00",
      isOvernight: row.isOvernight,
    });
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelected(null);
    form.setFieldsValue({
      name: undefined,
      startTime: "07:00",
      endTime: "14:00",
      isOvernight: false,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Xác nhận xóa ca làm việc",
      content: "Bạn có chắc muốn xóa ca này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const res = await fetch(`/api/work-shifts?id=${id}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");
          toast.success("Đã xóa ca");
          fetchList();
        } catch (e: any) {
          toast.error(e.message || "Không xóa được ca");
        }
      },
    });
  };

  const onFinish = async (values: {
    name: string;
    startTime: string;
    endTime: string;
    isOvernight: boolean;
  }) => {
    try {
      const payload = {
        name: values.name,
        startTime: values.startTime?.length === 5 ? values.startTime + ":00" : values.startTime,
        endTime: values.endTime?.length === 5 ? values.endTime + ":00" : values.endTime,
        isOvernight: values.isOvernight,
      };
      if (selected) {
        const res = await fetch("/api/work-shifts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: selected.id }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Update failed");
        toast.success("Đã cập nhật ca");
      } else {
        const res = await fetch("/api/work-shifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Create failed");
        toast.success("Đã thêm ca");
      }
      setShowForm(false);
      setSelected(null);
      form.resetFields();
      fetchList();
    } catch (e: any) {
      toast.error(e.message || "Lưu thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Quản lý ca làm việc</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Thêm ca
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: list.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} ca`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          className="[&_.ant-table-cell]:!p-4 [&_.ant-table-thead_.ant-table-cell]:!bg-gray-50 [&_.ant-table-thead_.ant-table-cell]:!text-gray-500 [&_.ant-table-thead_.ant-table-cell]:!font-medium [&_.ant-table-thead_.ant-table-cell]:!text-xs [&_.ant-table-thead_.ant-table-cell]:!uppercase"
        />
      </div>

      <Drawer
        title={selected ? "Chỉnh sửa ca làm việc" : "Thêm ca làm việc"}
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelected(null);
          form.resetFields();
        }}
        width={400}
        placement="right"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="[&_.ant-form-item]:mb-3"
        >
          <Form.Item
            label="Tên ca"
            name="name"
            rules={[{ required: true, message: "Nhập tên ca" }]}
          >
            <Input
              placeholder="VD: CASANG, CACHIEU, CATOI"
              disabled={!!selected}
            />
          </Form.Item>
          <Form.Item
            label="Giờ bắt đầu"
            name="startTime"
            rules={[{ required: true, message: "Nhập giờ bắt đầu" }]}
          >
            <Input type="time" />
          </Form.Item>
          <Form.Item
            label="Giờ kết thúc"
            name="endTime"
            rules={[{ required: true, message: "Nhập giờ kết thúc" }]}
          >
            <Input type="time" />
          </Form.Item>
          <Form.Item
            label="Ca qua đêm (kết thúc sau 24h)"
            name="isOvernight"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item className="mb-0 mt-4">
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowForm(false);
                  setSelected(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {selected ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
