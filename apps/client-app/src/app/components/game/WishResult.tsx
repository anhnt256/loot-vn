import { Modal, Table, Tabs } from 'antd';
import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import { useUser } from '../../contexts/UserContext';

dayjs.extend(utc);

interface WishResultProps {
  isModalOpen: boolean;
  closeModal: () => void;
}

const getRarityStyle = (itemId: number) => {
  switch (itemId) {
    case 8:
      return 'animate-pulse font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500';
    case 7:
    case 6:
      return 'animate-pulse font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500';
    case 5:
    case 4:
      return 'font-semibold text-purple-400';
    case 3:
    case 2:
      return 'font-medium text-blue-400';
    default:
      return 'text-gray-400';
  }
};

export function WishResult({ isModalOpen, closeModal }: WishResultProps) {
  const [activeTab, setActiveTab] = useState<string>('1');
  const { user } = useUser();
  const [gameResults, setGameResults] = useState<any[]>([]);
  const [serverResults, setServerResults] = useState<any[]>([]);
  const [loadingGame, setLoadingGame] = useState(false);
  const [loadingServer, setLoadingServer] = useState(false);

  const fetchPersonalResults = useCallback(async () => {
    if (!user?.userId) return;
    setLoadingGame(true);
    try {
      const res = await apiClient.get(`/game/${user.userId}/result`);
      setGameResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      setGameResults([]);
    } finally {
      setLoadingGame(false);
    }
  }, [user?.userId]);

  const fetchServerResults = useCallback(async () => {
    setLoadingServer(true);
    try {
      const res = await apiClient.get('/game/result');
      setServerResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      setServerResults([]);
    } finally {
      setLoadingServer(false);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen && user?.userId) {
      fetchPersonalResults();
    }
  }, [isModalOpen, user?.userId, fetchPersonalResults]);

  useEffect(() => {
    if (isModalOpen && activeTab === '2') {
      fetchServerResults();
    }
  }, [isModalOpen, activeTab, fetchServerResults]);

  const columns: any[] = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      defaultSortOrder: 'descend' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Tên người chơi',
      dataIndex: 'maskedUsername',
      key: 'maskedUsername',
      ellipsis: true,
      width: 140,
      render: (text: string) => {
        const name = (activeTab === '2' ? text : user?.userName) || '';
        return <span title={name}>{name.length > 15 ? name.slice(0, 15) + '...' : name}</span>;
      },
    },
    {
      title: 'Thời gian trúng giải',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).utc().format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Giải thưởng',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <span className={getRarityStyle(record.itemId)}>{text}</span>
      ),
    },
    {
      title: 'Phần thưởng',
      dataIndex: 'value',
      key: 'value',
      render: (_: string, record: any) => {
        const value = record.newStars - record.oldStars;
        return <span className={getRarityStyle(record.itemId)}>{value.toLocaleString()}</span>;
      },
    },
    ...(activeTab === '1'
      ? [
          {
            title: 'Sao ban đầu',
            dataIndex: 'oldStars',
            key: 'oldStars',
            render: (text: number) => <span className="text-gray-400">{text.toLocaleString()}</span>,
          },
          {
            title: 'Sao hiện tại',
            dataIndex: 'newStars',
            key: 'newStars',
            render: (text: number) => (
              <span className="font-semibold text-green-400">{text.toLocaleString()}</span>
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
      <Tabs
        defaultActiveKey="1"
        onChange={setActiveTab}
        items={[
          {
            key: '1',
            label: 'Lịch sử quay thưởng cá nhân',
            children: (
              <Table
                loading={loadingGame}
                dataSource={gameResults.map((item, idx) => ({
                  ...item,
                  key: item.id ?? idx,
                }))}
                columns={columns}
                className="[&_td]:!text-[11px] [&_th]:!text-[11px]"
                pagination={{ pageSize: 6, position: ['bottomCenter'], size: 'small' }}
                size="small"
                scroll={{ x: 'max-content' }}
                sortDirections={['descend']}
                bordered
              />
            ),
          },
          {
            key: '2',
            label: `Lịch sử quay thưởng ${(window as any).__TENANT_CONFIG__?.name || 'GateWay'}`,
            children: (
              <Table
                loading={loadingServer}
                dataSource={serverResults.map((item, idx) => ({
                  ...item,
                  key: item.id ?? idx,
                }))}
                columns={columns}
                className="[&_td]:!text-[11px] [&_th]:!text-[11px]"
                pagination={{ pageSize: 6, position: ['bottomCenter'], size: 'small' }}
                size="small"
                scroll={{ x: 'max-content' }}
                sortDirections={['descend']}
                bordered
              />
            ),
          },
        ]}
      />
    </Modal>
  );
}
