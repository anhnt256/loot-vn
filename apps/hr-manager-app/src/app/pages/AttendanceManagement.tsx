import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Tag, message, Modal, Input, DatePicker, Select, Drawer, Tooltip } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  CalendarOutlined,
  FileExcelOutlined,
  EyeOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { Clock, Calendar as CalendarIcon, User, ExternalLink, Download } from 'lucide-react';
import dayjs from 'dayjs';
import { apiClient } from '@gateway-workspace/shared/utils';
import AttendanceModal from './components/AttendanceModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface AttendanceRecord {
  id: number;
  staffId: number;
  checkInTime: string;
  checkOutTime: string | null;
  createdAt: string;
  staff?: {
    fullName: string;
  };
}

interface AggregatedAttendance {
  key: string | number;
  staffId: number;
  fullName: string;
  totalMinutes: number;
  recordCount: number;
}

const AttendanceManagement: React.FC = () => {
  const [aggregatedRecords, setAggregatedRecords] = useState<AggregatedAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([dayjs().startOf('month'), dayjs().endOf('month')]);

  // Detail Drawer State
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<AggregatedAttendance | null>(null);
  const [detailRecords, setDetailRecords] = useState<AttendanceRecord[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchAggregatedRecords = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD HH:mm:ss');
        params.endDate = dateRange[1].format('YYYY-MM-DD HH:mm:ss');
      }
      const response = await apiClient.get('/api/hr-manager/attendance/aggregated', { params });
      setAggregatedRecords(response.data);
    } catch (error: any) {
      console.error('Error fetching aggregated attendance:', error);
      message.error('Không thể tải dữ liệu tổng hợp');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailRecords = async (staffId: number) => {
    try {
      setDetailLoading(true);
      const params: any = { staffId };
      if (dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD HH:mm:ss');
        params.endDate = dateRange[1].format('YYYY-MM-DD HH:mm:ss');
      }
      const response = await apiClient.get('/api/hr-manager/attendance', { params });
      setDetailRecords(response.data);
    } catch (error) {
      message.error('Không thể tải chi tiết chấm công');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchAggregatedRecords();
  }, [dateRange]);

  const handleViewDetails = (record: AggregatedAttendance) => {
    setSelectedStaff(record);
    setDetailVisible(true);
    fetchDetailRecords(record.staffId);
  };

  const handleDeleteDetail = (id: number) => {
    Modal.confirm({
      title: 'Xóa bản ghi chấm công',
      content: 'Bạn có chắc chắn muốn xóa bản ghi ngày này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.delete(`/api/hr-manager/attendance/${id}`);
          message.success('Đã xóa bản ghi');
          if (selectedStaff) fetchDetailRecords(selectedStaff.staffId);
          fetchAggregatedRecords();
        } catch (error: any) {
          message.error('Không thể xóa bản ghi');
        }
      },
    });
  };

  const handleExport = (staffId?: number) => {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('startDate', dateRange[0].format('YYYY-MM-DD HH:mm:ss'));
      params.append('endDate', dateRange[1].format('YYYY-MM-DD HH:mm:ss'));
    }
    if (staffId) {
      params.append('staffId', staffId.toString());
    }
    window.open(`${process.env.VITE_API_URL || 'http://localhost:7300'}/api/hr-manager/attendance/export?${params.toString()}`, '_blank');
  };

  const mainColumns = [
    {
      title: 'Nhân viên (ID)',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string, record: AggregatedAttendance) => (
        <Space>
           <div className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center">
             <User size={16} className="text-[#64748b]" />
           </div>
           <Space direction="vertical" size={0}>
            <Text className="font-semibold text-[#1e293b]">{name}</Text>
            <Text type="secondary" className="text-xs">ID: {record.staffId}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Số buổi làm',
      dataIndex: 'recordCount',
      key: 'recordCount',
      render: (count: number) => <Tag color="blue" className="rounded-full px-3">{count} buổi</Tag>,
      sorter: (a: AggregatedAttendance, b: AggregatedAttendance) => a.recordCount - b.recordCount,
    },
    {
      title: 'Tổng số giờ làm',
      dataIndex: 'totalMinutes',
      key: 'totalMinutes',
      render: (mins: number) => {
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return (
          <Space direction="vertical" size={0}>
             <Text strong className="text-[#003594] text-base">{hours}h {remainingMins}m</Text>
             <Text type="secondary" className="text-[10px]">Tích lũy trong kỳ</Text>
          </Space>
        );
      },
      sorter: (a: AggregatedAttendance, b: AggregatedAttendance) => a.totalMinutes - b.totalMinutes,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, record: AggregatedAttendance) => (
        <Space>
          <Tooltip title="Xuất Excel nhân viên này">
            <Button 
              icon={<Download size={16} />} 
              onClick={() => handleExport(record.staffId)}
              className="rounded-lg border-[#cbd5e1] text-[#475569] hover:!border-[#003594] hover:!text-[#003594] flex items-center justify-center"
            />
          </Tooltip>
          <Button 
            type="primary" 
            ghost
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetails(record)}
            className="rounded-lg border-[#cbd5e1] text-[#475569] hover:!border-[#003594] hover:!text-[#003594]"
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const detailColumns = [
    {
      title: 'Ngày',
      key: 'date',
      render: (_: any, record: AttendanceRecord) => (
        <Text className="font-medium">{dayjs(record.checkInTime).format('DD/MM/YYYY')}</Text>
      ),
    },
    {
      title: 'Giờ vào',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (time: string) => (
        <Tag color="green" className="rounded-full">
          {dayjs(time).format('HH:mm:ss')}
        </Tag>
      ),
    },
    {
      title: 'Giờ ra',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      render: (time: string | null) => (
        time ? (
          <Tag color="orange" className="rounded-full">
            {dayjs(time).format('HH:mm:ss')}
          </Tag>
        ) : (
          <Tag color="default" className="rounded-full">Chưa ra ca</Tag>
        )
      ),
    },
    {
      title: 'Tổng giờ',
      key: 'duration',
      render: (_: any, record: AttendanceRecord) => {
        if (!record.checkOutTime) return '-';
        const start = dayjs(record.checkInTime);
        const end = dayjs(record.checkOutTime);
        const diff = end.diff(start, 'minute');
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return `${hours}h ${minutes}m`;
      },
    },
    {
      title: '',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, record: AttendanceRecord) => (
        <Space>
           <Tooltip title="Sửa">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                className="text-[#64748b] hover:!text-[#003594]"
                onClick={() => {
                   setEditingRecord(record);
                   setModalOpen(true);
                }}
              />
           </Tooltip>
           <Tooltip title="Xóa">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => handleDeleteDetail(record.id)}
              />
           </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredRecords = aggregatedRecords.filter(r => 
    r.fullName.toLowerCase().includes(searchText.toLowerCase()) || 
    r.staffId.toString().includes(searchText)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col gap-1">
          <Title level={4} style={{ margin: 0 }} className="flex items-center gap-2">
            <CalendarIcon className="text-[#003594]" size={20} />
            Quản lý Chấm công
          </Title>
          <p className="text-[#64748b] text-sm">Theo dõi tổng hợp thời gian làm việc và chi tiết từng nhân viên.</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className="w-full sm:w-auto bg-[#003594] text-white border-none hover:!bg-[#002870] shadow-sm font-semibold px-6 h-10 rounded-lg flex items-center justify-center gap-2"
          onClick={() => {
            setEditingRecord(null);
            setModalOpen(true);
          }}
        >
          Check-in thủ công
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
             <Text className="block mb-1 text-xs font-semibold text-[#64748b] uppercase">Tìm kiếm nhân viên</Text>
            <Input
              placeholder="Tên nhân viên hoặc ID..."
              prefix={<SearchOutlined className="text-[#9ca3af]" />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="bg-[#f8fafc] border border-[#e2e8f0] h-10 rounded-lg w-full"
              allowClear
            />
          </div>
          <div className="flex-1 lg:flex-none">
            <Text className="block mb-1 text-xs font-semibold text-[#64748b] uppercase">Khoảng thời gian báo cáo</Text>
            <RangePicker 
              showTime
              value={dateRange}
              onChange={(dates) => setDateRange(dates as any)}
              className="bg-[#f8fafc] border border-[#e2e8f0] h-10 rounded-lg w-full"
              placeholder={['Từ thời điểm', 'Đến thời điểm']}
              format="DD/MM/YYYY HH:mm"
            />
          </div>
        </div>

        <Table 
          columns={mainColumns} 
          dataSource={filteredRecords} 
          rowKey="staffId"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nhân viên`,
            position: ['bottomRight'],
            defaultPageSize: 10,
          }}
          className="attendance-table"
        />
      </div>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <ExternalLink size={18} className="text-[#003594]" />
            <Text strong className="text-[#003594] text-sm sm:text-base">Chi tiết: {selectedStaff?.fullName}</Text>
          </div>
        }
        placement="right"
        width={window.innerWidth < 768 ? '100%' : 720}
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        className="attendance-detail-drawer"
        extra={
            <Space>
               <Button 
                 icon={<Download size={14} />} 
                 onClick={() => handleExport(selectedStaff?.staffId)}
                 className="flex items-center gap-2"
               >
                 Xuất Excel
               </Button>
               <Button onClick={() => fetchDetailRecords(selectedStaff!.staffId)} icon={<CalendarOutlined />}>Tải lại</Button>
            </Space>
        }
      >
        <div className="space-y-6">
           <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                 <Text type="secondary" className="text-[10px] sm:text-xs uppercase font-bold">Tổng tích lũy</Text>
                 <div className="text-xl sm:text-2xl font-bold text-[#003594]">{Math.floor((selectedStaff?.totalMinutes || 0) / 60)}h {(selectedStaff?.totalMinutes || 0) % 60}m</div>
              </div>
              <div>
                 <Text type="secondary" className="text-[10px] sm:text-xs uppercase font-bold">Khoảng thời gian</Text>
                 <div className="text-xs sm:text-sm font-semibold">{dateRange?.[0].format('DD/MM/YYYY HH:mm')} - {dateRange?.[1].format('DD/MM/YYYY HH:mm')}</div>
              </div>
           </div>

           <Table 
             columns={detailColumns}
             dataSource={detailRecords}
             rowKey="id"
             loading={detailLoading}
             scroll={{ x: 'max-content' }}
             pagination={{ pageSize: 15 }}
             size="small"
           />
        </div>
      </Drawer>

      <AttendanceModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={() => {
           fetchAggregatedRecords();
           if (selectedStaff) fetchDetailRecords(selectedStaff.staffId);
        }}
        initialData={editingRecord}
      />
    </div>
  );
};

export default AttendanceManagement;
