"use client";

import { useState, useEffect } from "react";
import { GiftRoundForm } from "./_components/gift-round-form";
import { toast } from "sonner";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

interface GiftRound {
  id: number;
  userId: number;
  amount: number;
  reason: string;
  staffId: number;
  createdAt: string;
  expiredAt: string | null;
  isUsed: boolean;
  user: {
    userName: string | null;
  };
}

export default function GiftRoundsPage() {
  const [giftRounds, setGiftRounds] = useState<GiftRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedGiftRound, setSelectedGiftRound] = useState<GiftRound | null>(null);

  const columns: ColumnsType<GiftRound> = [
    {
      title: "Người dùng",
      dataIndex: ["user", "userName"],
      key: "userName",
      render: (text: string) => (
        <span className="text-sm font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: "Số lượt",
      dataIndex: "amount",
      key: "amount",
      render: (text: number) => (
        <span className="text-sm text-gray-900">{text}</span>
      ),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      render: (text: string) => (
        <span className="text-sm text-gray-900">{text}</span>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => (
        <span className="text-sm text-gray-900">
          {new Date(text).toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isUsed",
      key: "isUsed",
      render: (isUsed: boolean) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            isUsed
              ? "bg-gray-100 text-gray-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {isUsed ? "Đã sử dụng" : "Còn hiệu lực"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: GiftRound) => (
        <div className="space-x-2">
          <button
            onClick={() => handleEdit(record)}
            className="text-blue-600 hover:text-blue-900"
          >
            Sửa
          </button>
          <button
            onClick={() => handleDelete(record.id)}
            className="text-red-600 hover:text-red-900"
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  // Fetch gift rounds
  const fetchGiftRounds = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/gift-rounds");
      if (!response.ok) {
        throw new Error("Failed to fetch gift rounds");
      }
      const data = await response.json();
      // Convert dates to strings
      const formattedData = data.map((round: any) => ({
        ...round,
        createdAt: new Date(round.createdAt).toISOString(),
        expiredAt: round.expiredAt ? new Date(round.expiredAt).toISOString() : null,
      }));
      setGiftRounds(formattedData);
    } catch (error) {
      toast.error("Không thể tải danh sách lượt chơi");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete gift round
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa?")) {
      return;
    }

    try {
      const response = await fetch(`/api/gift-rounds/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete gift round");
      }

      toast.success("Xóa thành công");
      fetchGiftRounds();
    } catch (error) {
      toast.error("Không thể xóa lượt chơi");
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedGiftRound(null);
    fetchGiftRounds();
  };

  // Edit gift round
  const handleEdit = (giftRound: GiftRound) => {
    setSelectedGiftRound(giftRound);
    setShowForm(true);
  };

  useEffect(() => {
    fetchGiftRounds();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Quản lý lượt chơi</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Tặng lượt mới
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {selectedGiftRound ? "Cập nhật lượt chơi" : "Tặng lượt mới"}
            </h3>
            <GiftRoundForm
              initialData={selectedGiftRound || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setSelectedGiftRound(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Danh sách lượt tặng */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table
          columns={columns}
          dataSource={giftRounds}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: giftRounds.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} lượt`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          className="[&_.ant-table-cell]:!p-4 [&_.ant-table-thead_.ant-table-cell]:!bg-gray-50 [&_.ant-table-thead_.ant-table-cell]:!text-gray-500 [&_.ant-table-thead_.ant-table-cell]:!font-medium [&_.ant-table-thead_.ant-table-cell]:!text-xs [&_.ant-table-thead_.ant-table-cell]:!uppercase"
        />
      </div>
    </div>
  );
} 