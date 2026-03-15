import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Button, 
  Typography, 
  Card, 
  message, 
  Tooltip,
  Modal,
  Descriptions,
  Input,
  Select,
  Row,
  Col
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EyeOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Send, Filter } from 'lucide-react';
import dayjs from 'dayjs';
import { apiClient } from '@gateway-workspace/shared/utils';

const { Title, Text } = Typography;

interface Request {
  id: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  metadata: any;
  createdAt: string;
  userId: string;
  staff: {
    fullName: string;
    userName: string;
  };
}

const RequestManagement: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  
  // Filters
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/hr-app/all-requests');
      setRequests(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      message.error('Không thể tải danh sách yêu cầu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => {
    const matchType = !filterType || req.type === filterType;
    const matchStatus = !filterStatus || req.status === filterStatus;
    const matchSearch = !searchText || 
      req.staff?.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      req.staff?.userName.toLowerCase().includes(searchText.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const handleUpdateStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    const actionText = status === 'APPROVED' ? 'phê duyệt' : 'từ chối';
    Modal.confirm({
      title: `Xác nhận ${actionText}`,
      content: `Bạn có chắc chắn muốn ${actionText} yêu cầu này?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.patch(`/api/hr-app/requests/${id}/status`, { status });
          message.success(`Đã ${actionText} yêu cầu thành công`);
          fetchRequests();
          if (selectedRequest?.id === id) {
            setIsPreviewVisible(false);
          }
        } catch (error: any) {
          message.error('Không thể cập nhật trạng thái yêu cầu');
        }
      },
    });
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'late_arrival': return 'Xin đi muộn';
      case 'shift_change': return 'Đổi ca';
      case 'salary_advance': return 'Ứng lương';
      case 'leave': return 'Nghỉ phép';
      default: return type;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'PENDING': return <Tag icon={<ClockCircleOutlined />} color="warning">Chờ duyệt</Tag>;
      case 'APPROVED': return <Tag icon={<CheckCircleOutlined />} color="success">Đã duyệt</Tag>;
      case 'REJECTED': return <Tag icon={<CloseCircleOutlined />} color="error">Từ chối</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const renderMetadata = (request: Request) => {
    const { metadata, type } = request;
    if (!metadata) return null;

    if (type === 'late_arrival') {
      return (
        <Space direction="vertical" size={0}>
          <Text size="small">Giờ dự kiến: <Badge status="processing" text={metadata.expected_time} /></Text>
          <Text size="small" type="secondary">Lý do: {metadata.reason}</Text>
        </Space>
      );
    }

    if (type === 'salary_advance') {
      return (
        <Space direction="vertical" size={0}>
          <Text size="small" strong>Số tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(metadata.amount)}</Text>
          <Text size="small" type="secondary">Hình thức: {metadata.payment_method === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt'}</Text>
        </Space>
      );
    }

    if (type === 'leave') {
      return (
        <Space direction="vertical" size={0}>
          <Text size="small">Từ: {metadata.startDate} đến {metadata.endDate}</Text>
          <Text size="small" type="secondary">Lý do: {metadata.reason}</Text>
        </Space>
      );
    }

    return <pre className="text-[10px]">{JSON.stringify(metadata, null, 2)}</pre>;
  };

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'staff',
      key: 'staff',
      render: (staff: any) => (
        <Space>
          <div className="w-8 h-8 rounded-full bg-[#ff721f] flex items-center justify-center text-white text-[10px] font-bold">
            {staff?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <Text className="font-semibold text-[#1e293b]">{staff?.fullName}</Text>
            <Text type="secondary" className="text-[11px] -mt-1">@{staff?.userName}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Text strong className="text-[#003594]">{getRequestTypeLabel(type)}</Text>,
    },
    {
      title: 'Chi tiết',
      key: 'details',
      render: (_: any, record: Request) => renderMetadata(record),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Request) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => {
                setSelectedRequest(record);
                setIsPreviewVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'PENDING' && (
            <>
              <Tooltip title="Phê duyệt">
                <Button 
                  type="text" 
                  icon={<CheckCircleOutlined />} 
                  className="text-green-500 hover:text-green-600"
                  onClick={() => handleUpdateStatus(record.id, 'APPROVED')}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button 
                  type="text" 
                  danger 
                  icon={<CloseCircleOutlined />} 
                  onClick={() => handleUpdateStatus(record.id, 'REJECTED')}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <Title level={4} style={{ margin: 0 }}>Quản lý yêu cầu</Title>
          <p className="text-[#64748b] text-sm">Phê duyệt hoặc từ chối các yêu cầu từ nhân viên (Nghỉ phép, ứng lương, đổi ca...)</p>
        </div>
      </div>

      <Card className="shadow-sm border-[#e2e8f0] rounded-xl">
        <div className="mb-6 space-y-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Input.Search
                placeholder="Tìm theo nhân viên..."
                allowClear
                className="w-full"
                onChange={e => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Select
                placeholder="Loại yêu cầu"
                allowClear
                className="w-full"
                onChange={v => setFilterType(v)}
                options={[
                  { value: 'late_arrival', label: 'Xin đi muộn' },
                  { value: 'shift_change', label: 'Đổi ca' },
                  { value: 'salary_advance', label: 'Ứng lương' },
                  { value: 'leave', label: 'Nghỉ phép' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Select
                placeholder="Trạng thái"
                allowClear
                className="w-full"
                onChange={v => setFilterStatus(v)}
                options={[
                  { value: 'PENDING', label: 'Chờ duyệt' },
                  { value: 'APPROVED', label: 'Đã duyệt' },
                  { value: 'REJECTED', label: 'Từ chối' },
                ]}
              />
            </Col>
            <Col xs={24} sm={24} lg={6}>
              <Button 
                icon={<Filter size={16} />} 
                className="w-full"
                onClick={() => {
                  setSearchText('');
                  setFilterType(null);
                  setFilterStatus(null);
                }}
              >
                Xóa lọc
              </Button>
            </Col>
          </Row>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredRequests} 
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 'max-content' }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total}`,
          }}
        />
      </Card>

      <Modal
        title="Chi tiết yêu cầu"
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewVisible(false)}>
            Đóng
          </Button>,
          selectedRequest?.status === 'PENDING' && (
            <React.Fragment key="actions">
              <Button 
                key="reject" 
                danger 
                onClick={() => handleUpdateStatus(selectedRequest.id, 'REJECTED')}
              >
                Từ chối
              </Button>
              <Button 
                key="approve" 
                type="primary" 
                className="bg-green-600 hover:bg-green-700 border-none"
                onClick={() => handleUpdateStatus(selectedRequest.id, 'APPROVED')}
              >
                Phê duyệt
              </Button>
            </React.Fragment>
          )
        ]}
      >
        {selectedRequest && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Nhân viên">{selectedRequest.staff?.fullName}</Descriptions.Item>
            <Descriptions.Item label="Loại yêu cầu">{getRequestTypeLabel(selectedRequest.type)}</Descriptions.Item>
            <Descriptions.Item label="Ngày gửi">{dayjs(selectedRequest.createdAt).format('DD/MM/YYYY HH:mm:ss')}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{getStatusTag(selectedRequest.status)}</Descriptions.Item>
            <Descriptions.Item label="Chi tiết">
              <div className="bg-slate-50 p-3 rounded border border-slate-100">
                {Object.entries(selectedRequest.metadata || {}).map(([key, value]: [string, any]) => (
                  <div key={key} className="mb-1">
                    <Text type="secondary" className="capitalize">{key.replace(/_/g, ' ')}: </Text>
                    <Text strong>{typeof value === 'number' ? value.toLocaleString() : String(value)}</Text>
                  </div>
                ))}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default RequestManagement;
