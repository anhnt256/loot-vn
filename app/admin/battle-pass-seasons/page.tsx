"use client";

import { useEffect, useState } from "react";
import { Table, Modal, Input, Button, DatePicker } from "antd";
import { toast } from "sonner";
import dayjs from "@/lib/dayjs";
import { useUserInfo } from "@/hooks/use-user-info";

interface Season {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxLevel: number;
}

export default function BattlePassSeasonsAdmin() {
  const { userData } = useUserInfo();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    maxLevel: 30,
  });

  // Fetch list
  const fetchSeasons = async () => {
    setIsLoading(true);
    const res = await fetch("/api/battle-pass/seasons");
    const data = await res.json();
    setSeasons(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSeasons();
  }, []);

  // Open modal for create/edit
  const openModal = (season?: Season) => {
    if (season) {
      setEditing(season);
      setForm({
        name: season.name,
        description: season.description || "",
        startDate: season.startDate?.slice(0, 10) || "",
        endDate: season.endDate?.slice(0, 10) || "",
        maxLevel: season.maxLevel,
      });
    } else {
      setEditing(null);
      setForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        maxLevel: 30,
      });
    }
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = async () => {
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `/api/battle-pass/seasons/${editing.id}`
      : "/api/battle-pass/seasons";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success(editing ? "Cập nhật thành công" : "Tạo mới thành công");
      setShowModal(false);
      setEditing(null);
      fetchSeasons();
    } else {
      toast.error("Có lỗi xảy ra");
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Xóa season này?")) return;
    await fetch(`/api/battle-pass/seasons/${id}`, { method: "DELETE" });
    fetchSeasons();
    toast.success("Đã xóa season");
  };

  // Table columns
  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD"),
    },
    {
      title: "Level",
      dataIndex: "maxLevel",
      key: "maxLevel",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Season) => (
        <div className="space-x-2">
          <Button type="link" onClick={() => openModal(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">
          Quản lý Battle Pass Season
        </h2>
        <Button type="primary" onClick={() => openModal()}>
          Tạo mới
        </Button>
      </div>

      {/* Modal form */}
      <Modal
        open={showModal}
        title={editing ? "Cập nhật Season" : "Tạo mới Season"}
        onCancel={() => setShowModal(false)}
        onOk={handleSubmit}
        okText={editing ? "Cập nhật" : "Tạo mới"}
      >
        <div className="space-y-3">
          <Input
            placeholder="Tên mùa"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <DatePicker
            className="w-full"
            placeholder="Ngày bắt đầu"
            value={form.startDate ? dayjs(form.startDate) : undefined}
            onChange={(d) =>
              setForm((f) => ({
                ...f,
                startDate: d ? d.format("YYYY-MM-DD") : "",
              }))
            }
          />
          <DatePicker
            className="w-full"
            placeholder="Ngày kết thúc"
            value={form.endDate ? dayjs(form.endDate) : undefined}
            onChange={(d) =>
              setForm((f) => ({
                ...f,
                endDate: d ? d.format("YYYY-MM-DD") : "",
              }))
            }
          />
          <Input
            type="number"
            min={1}
            placeholder="Max Level"
            value={form.maxLevel}
            onChange={(e) =>
              setForm((f) => ({ ...f, maxLevel: +e.target.value }))
            }
          />
        </div>
      </Modal>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table
          columns={columns}
          dataSource={seasons}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: seasons.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} season`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          className="[&_.ant-table-cell]:!p-4 [&_.ant-table-thead_.ant-table-cell]:!bg-gray-50 [&_.ant-table-thead_.ant-table-cell]:!text-gray-500 [&_.ant-table-thead_.ant-table-cell]:!font-medium [&_.ant-table-thead_.ant-table-cell]:!text-xs [&_.ant-table-thead_.ant-table-cell]:!uppercase"
        />
      </div>
    </div>
  );
}
