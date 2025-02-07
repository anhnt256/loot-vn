import { Modal, Table, Tabs } from "antd";
import React, { useState } from "react";
import dayjs from "dayjs";
import type { TabsProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useUserInfo } from "@/hooks/use-user-info";
import TabPane from "antd/es/tabs/TabPane";

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

const getRarityStyle = (itemId: number) => {
  switch (itemId) {
    case 8:
      return "animate-pulse font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500";
    case 7:
    case 6:
      return "animate-pulse font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500";
    case 5:
    case 4:
      return "font-semibold text-purple-600";
    case 3:
    case 2:
      return "font-medium text-blue-500";
    default:
      return "text-gray-600";
  }
};

export function WishResult({ isModalOpen, closeModal }: WishResultProps) {
  const { userData, userName } = useUserInfo();
  const [activeTab, setActiveTab] = useState<string>("1");

  const { userId } = userData || {};

  const { data: gameResults, isLoading: isLoadingGame } = useQuery({
    queryKey: ["game-results", userId],
    enabled: !!userId,
    queryFn: () => fetcher(`/api/game/${userId}/result`),
  });

  const { data: serverResults, isLoading: isLoadingServer } = useQuery({
    queryKey: ["server-results"],
    enabled: activeTab === "2",
    queryFn: () => fetcher(`/api/game/result`),
  });

  const columns: any[] = [
    {
      title: "Số thứ tự",
      dataIndex: "id",
      key: "id",
      defaultSortOrder: "descend",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tên người chơi",
      dataIndex: "maskedUsername",
      key: "maskedUsername",
      render: (text: string) => (
        <span>{activeTab === "2" ? text : userName}</span>
      ),
    },
    {
      title: "Thời gian trúng giải",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => {
        return dayjs(text).utc().format("DD-MM-YYYY HH:mm:ss");
      },
    },
    {
      title: "Giải thưởng",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <span className={getRarityStyle(record.itemId)}>{text}</span>
      ),
    },
    {
      title: "Phần thưởng",
      dataIndex: "value",
      key: "value",
      render: (text: string, record: any) => (
        <span className={getRarityStyle(record.itemId)}>
          {text.toLocaleString()}
        </span>
      ),
    },
    ...(activeTab === "1"
      ? [
          {
            title: "Sao ban đầu",
            dataIndex: "oldStars",
            key: "oldStars",
            render: (text: number) => (
              <span className="text-gray-500">{text.toLocaleString()}</span>
            ),
          },
          {
            title: "Sao hiện tại",
            dataIndex: "newStars",
            key: "newStars",
            render: (text: number) => (
              <span className="font-semibold text-green-600">
                {text.toLocaleString()}
              </span>
            ),
          },
        ]
      : []),
  ];

  return (
    <Modal
      title="Lịch sử quay thưởng"
      open={isModalOpen}
      onCancel={closeModal}
      footer={null}
      width={850}
    >
      <Tabs defaultActiveKey="1" onChange={setActiveTab}>
        <TabPane tab="Lịch sử quay thưởng cá nhân" key="1">
          <Table<TableItem>
            key={activeTab}
            loading={isLoadingGame}
            dataSource={gameResults}
            columns={columns}
            className="[&_td]:!text-[11px] [&_th]:!text-[11px]"
            pagination={{
              pageSize: 10,
              position: ["bottomCenter"],
            }}
            sortDirections={["descend"]}
            bordered
          />
        </TabPane>
        <TabPane tab="Lịch sử quay thưởng GateWay" key="2">
          <Table<TableItem>
            key={activeTab}
            loading={isLoadingServer}
            dataSource={serverResults}
            columns={columns}
            className="[&_td]:!text-[11px] [&_th]:!text-[11px]"
            pagination={{
              pageSize: 10,
              position: ["bottomCenter"],
            }}
            sortDirections={["descend"]}
            bordered
          />
        </TabPane>
      </Tabs>
    </Modal>
  );
}
