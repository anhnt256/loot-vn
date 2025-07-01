"use client";

import { useEffect, useState } from "react";
import { Table, Modal, Input, Button, Select } from "antd";
import { toast } from "sonner";
import { useUserInfo } from "@/hooks/use-user-info";

interface Season {
  id: number;
  name: string;
}

interface PremiumPackage {
  id: number;
  seasonId: number;
  name: string;
  basePrice: number;
  description?: string;
  benefits?: string;
  maxQuantity?: number;
  sold: number;
}

export default function BattlePassPremiumPackagesAdmin() {
  const [packages, setPackages] = useState<PremiumPackage[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PremiumPackage | null>(null);
  const [form, setForm] = useState({
    seasonId: undefined as number | undefined,
    name: "",
    basePrice: 0,
    description: "",
    benefits: "",
    maxQuantity: undefined as number | undefined,
  });

  // Fetch list
  const fetchData = async () => {
    setIsLoading(true);
    const [pkgRes, seasonRes] = await Promise.all([
      fetch("/api/battle-pass/premium-packages"),
      fetch("/api/battle-pass/seasons"),
    ]);
    setPackages(await pkgRes.json());
    setSeasons(await seasonRes.json());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open modal for create/edit
  const openModal = (pkg?: PremiumPackage) => {
    if (pkg) {
      setEditing(pkg);
      setForm({
        seasonId: pkg.seasonId,
        name: pkg.name,
        basePrice: pkg.basePrice,
        description: pkg.description || "",
        benefits: pkg.benefits || "",
        maxQuantity: pkg.maxQuantity,
      });
    } else {
      setEditing(null);
      setForm({
        seasonId: undefined,
        name: "",
        basePrice: 0,
        description: "",
        benefits: "",
        maxQuantity: undefined,
      });
    }
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!form.seasonId) {
      toast.error("Chọn season!");
      return;
    }
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `/api/battle-pass/premium-packages/${editing.id}`
      : "/api/battle-pass/premium-packages";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success(editing ? "Cập nhật thành công" : "Tạo mới thành công");
      setShowModal(false);
      setEditing(null);
      fetchData();
    } else {
      toast.error("Có lỗi xảy ra");
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Xóa package này?")) return;
    await fetch(`/api/battle-pass/premium-packages/${id}`, {
      method: "DELETE",
    });
    fetchData();
    toast.success("Đã xóa package");
  };

  // Table columns
  const columns = [
    {
      title: "Tên gói",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Season",
      dataIndex: "seasonId",
      key: "seasonId",
      render: (id: number) => seasons.find((s) => s.id === id)?.name || id,
    },
    {
      title: "Giá gốc",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (v: number) => v.toLocaleString() + "đ",
    },
    {
      title: "Số lượng",
      dataIndex: "maxQuantity",
      key: "maxQuantity",
      render: (v: number, r: PremiumPackage) =>
        v ? `${r.sold}/${v}` : "Không giới hạn",
    },
    {
      title: "Quyền lợi",
      dataIndex: "benefits",
      key: "benefits",
      render: (v: string) => <span className="text-xs">{v}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: PremiumPackage) => (
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
          Quản lý Premium Battle Pass
        </h2>
        <Button type="primary" onClick={() => openModal()}>
          Tạo mới
        </Button>
      </div>

      {/* Modal form */}
      <Modal
        open={showModal}
        title={editing ? "Cập nhật Premium Package" : "Tạo mới Premium Package"}
        onCancel={() => setShowModal(false)}
        onOk={handleSubmit}
        okText={editing ? "Cập nhật" : "Tạo mới"}
      >
        <div className="space-y-3">
          <Select
            className="w-full"
            placeholder="Chọn season"
            value={form.seasonId}
            onChange={(v) => setForm((f) => ({ ...f, seasonId: v }))}
            options={seasons.map((s) => ({ value: s.id, label: s.name }))}
          />
          <Input
            placeholder="Tên gói"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            type="number"
            min={0}
            placeholder="Giá gốc"
            value={form.basePrice}
            onChange={(e) =>
              setForm((f) => ({ ...f, basePrice: +e.target.value }))
            }
          />
          <Input
            type="number"
            min={0}
            placeholder="Số lượng tối đa (bỏ trống = không giới hạn)"
            value={form.maxQuantity ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                maxQuantity: e.target.value ? +e.target.value : undefined,
              }))
            }
          />
          <Input.TextArea
            placeholder="Quyền lợi"
            value={form.benefits}
            onChange={(e) =>
              setForm((f) => ({ ...f, benefits: e.target.value }))
            }
            rows={3}
          />
          <Input.TextArea
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={2}
          />
        </div>
      </Modal>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table
          columns={columns}
          dataSource={packages}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: packages.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} package`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          className="[&_.ant-table-cell]:!p-4 [&_.ant-table-thead_.ant-table-cell]:!bg-gray-50 [&_.ant-table-thead_.ant-table-cell]:!text-gray-500 [&_.ant-table-thead_.ant-table-cell]:!font-medium [&_.ant-table-thead_.ant-table-cell]:!text-xs [&_.ant-table-thead_.ant-table-cell]:!uppercase"
        />
      </div>
    </div>
  );
}
