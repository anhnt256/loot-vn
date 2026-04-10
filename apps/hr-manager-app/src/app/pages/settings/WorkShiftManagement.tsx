import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Tag, message, Modal, Input, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Clock } from 'lucide-react';
import { apiClient } from '@gateway-workspace/shared/utils';

import WorkShiftModal from './components/WorkShiftModal';

const { Title, Text } = Typography;

interface WorkShift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  FnetStaffId?: number;
  ffoodId?: string;
  staffId?: number;
}

const WorkShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<WorkShift | null>(null);
  const [searchText, setSearchText] = useState('');

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/hr-manager/work-shifts');
      setShifts(response.data);
    } catch (error: any) {
      console.error('Error fetching work shifts:', error);
      message.error('Không thể tải danh sách ca làm việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xóa ca làm việc',
      content: 'Bạn có chắc chắn muốn xóa ca làm việc này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.delete(`/hr-manager/work-shifts/${id}`);
          message.success('Đã xóa ca làm việc');
          fetchShifts();
        } catch (error: any) {
          message.error('Không thể xóa ca làm việc');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tên ca làm việc',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text className="font-semibold text-[#1e293b]">{text}</Text>,
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_: any, record: WorkShift) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Tag color="blue" className="rounded-full font-medium">
              {record.startTime} - {record.endTime}
            </Tag>
            {record.isOvernight && <Tag color="orange" className="rounded-full text-[10px]">Qua đêm</Tag>}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Hệ thống tích hợp',
      key: 'integration',
      render: (_: any, record: WorkShift) => (
        <Space direction="vertical" size={4}>
          {record.FnetStaffId && (
            <Tooltip title="Fnet Staff ID">
              <Tag color="cyan" className="m-0 text-[11px]">FNET: {record.FnetStaffId}</Tag>
            </Tooltip>
          )}
          {record.ffoodId && (
            <Tooltip title="Ffood ID">
              <Tag color="purple" className="m-0 text-[11px]">FOOD: {record.ffoodId.substring(0, 8)}...</Tag>
            </Tooltip>
          )}
          {record.staffId && (
            <Tooltip title="Staff ID">
              <Tag color="geekblue" className="m-0 text-[11px]">Staff: {record.staffId}</Tag>
            </Tooltip>
          )}
          {!record.FnetStaffId && !record.ffoodId && !record.staffId && (
            <Text type="secondary" className="text-[11px]">Chưa thiết lập</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: WorkShift) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              className="text-[#003594] hover:text-[#002870]" 
              onClick={() => {
                setEditingShift(record);
                setModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredShifts = shifts.filter(s => 
    s.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <Title level={4} style={{ margin: 0 }} className="flex items-center gap-2">
            <Clock className="text-[#003594]" size={20} />
            Quản lý Ca làm việc
          </Title>
          <p className="text-[#64748b] text-sm">Thiết lập thời gian làm việc tiêu chuẩn cho hệ thống.</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className="bg-[#003594] text-white border-none hover:!bg-[#002870] shadow-sm font-semibold px-6 h-10 rounded-lg w-full sm:w-auto"
          onClick={() => {
            setEditingShift(null);
            setModalOpen(true);
          }}
        >
          Thêm ca mới
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
        <div className="mb-6 w-full sm:max-w-md">
          <Input
            placeholder="Tìm kiếm ca làm việc..."
            prefix={<SearchOutlined className="text-[#9ca3af]" />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="bg-[#f8fafc] border-none h-11 rounded-lg w-full"
            allowClear
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredShifts} 
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total}`,
            position: ['bottomRight'],
            defaultPageSize: 10,
          }}
        />
      </div>

      <WorkShiftModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchShifts}
        initialData={editingShift}
      />
    </div>
  );
};

export default WorkShiftManagement;
