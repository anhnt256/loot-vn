import { Modal, Table } from "antd";
import React from "react";
import dayjs from "@/lib/dayjs";

interface TableItem {
  key: number;
  id: number;
  date: string;
  name: string;
  total: string;
}

interface WishResultProps {
  isModalOpen: boolean;
  closeModal: () => void;
}

const rewards = [
  "4,000",
  "6,000",
  "8,000",
  "10,000",
  "15,000",
  "30,000",
  "80,000",
  "Jackpot",
];

export function WishResult({ isModalOpen, closeModal }: WishResultProps) {
  const data: TableItem[] = Array.from({ length: 100 }, (_, i) => {
    const randomName =
      i === 5 ? "Jackpot" : rewards[Math.floor(Math.random() * rewards.length)];
    const total = randomName === "Jackpot" ? "500,000" : randomName;

    return {
      key: i,
      id: i + 1,
      date: dayjs(
        `2025-01-${(i % 30) + 1} ${dayjs().format("HH:mm:ss")}`,
      ).format("DD/MM/YYYY HH:mm:ss"),
      name: randomName,
      total: total,
    };
  });

  const columns: any[] = [
    {
      title: "Số thứ tự",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Thời gian trúng giải",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Giải thưởng",
      dataIndex: "name",
      key: "name",
      render: (text: string) =>
        text === "Jackpot" ? (
          <span className="animate-pulse font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            {text}
          </span>
        ) : (
          text
        ),
    },
    {
      title: "Phần thưởng",
      dataIndex: "total",
      key: "total",
      render: (text: string, record: TableItem) =>
        record.name === "Jackpot" ? (
          <span className="animate-pulse font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            {text}
          </span>
        ) : (
          text
        ),
    },
  ];

  return (
    <Modal
      title="Lịch sử quay thưởng"
      open={isModalOpen}
      onCancel={closeModal}
      footer={null}
      width={800}
    >
      <Table<TableItem>
        dataSource={data}
        columns={columns}
        pagination={{
          pageSize: 10,
          position: ["bottomCenter"],
        }}
        bordered
      />
    </Modal>
  );
}
