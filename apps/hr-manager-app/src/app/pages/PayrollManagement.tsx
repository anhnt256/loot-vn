import React, { useState, useEffect } from 'react';
import {
  Table,
  Typography,
  Card,
  message,
  Row,
  Col,
  DatePicker,
  Space,
  Tag,
  Input,
  Modal,
  List
} from 'antd';
import { Filter, Search } from 'lucide-react';
import { apiClient } from '@gateway-workspace/shared/utils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface AdvanceDetail {
  id: string;
  amount: number;
  date: string;
}

interface PayrollRecord {
  staffId: number;
  fullName: string;
  userName: string;
  baseSalary: number;
  totalHours: number;
  salaryFromHours: number;
  bonus: number;
  penalty: number;
  advanceSalary: number;
  advanceDetails: AdvanceDetail[];
  netSalary: number;
  isFinalized: boolean;
}

const PayrollManagement: React.FC = () => {
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isAdvanceModalVisible, setIsAdvanceModalVisible] = useState(false);
  const [selectedAdvanceDetails, setSelectedAdvanceDetails] = useState<AdvanceDetail[]>([]);
  const [selectedStaffName, setSelectedStaffName] = useState('');

  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());

  const fetchPayroll = async (date: dayjs.Dayjs) => {
    try {
      setIsLoading(true);
      const month = date.month() + 1;
      const year = date.year();
      const response = await apiClient.get(`/hr-manager/payroll?month=${month}&year=${year}`);
      
      const data = response.data.data || response.data || [];
      setPayrollData(data);
    } catch (error: any) {
      console.error('Error fetching payroll:', error);
      message.error('Không thể tải dữ liệu Bảng lương');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll(selectedDate);
  }, [selectedDate]);

  const columns = [
    {
      title: 'Nhân viên',
      key: 'staff',
      render: (_: any, record: PayrollRecord) => (
        <Space>
          <div className="w-8 h-8 rounded-full bg-[#003594] flex items-center justify-center text-white text-[10px] font-bold">
            {record.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <Text className="font-semibold text-[#1e293b]">{record.fullName}</Text>
            <Text type="secondary" className="text-[11px] -mt-1">@{record.userName}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Giờ làm',
      dataIndex: 'totalHours',
      key: 'totalHours',
      render: (val: number) => <Text>{val}h</Text>,
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      key: 'baseSalary',
      render: (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val),
    },
    {
      title: 'Lương theo giờ',
      dataIndex: 'salaryFromHours',
      key: 'salaryFromHours',
      render: (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val),
    },
    {
      title: 'Thưởng',
      dataIndex: 'bonus',
      key: 'bonus',
      render: (val: number) => (
        <Text type="success">
          +{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
        </Text>
      ),
    },
    {
      title: 'Phạt',
      dataIndex: 'penalty',
      key: 'penalty',
      render: (val: number) => (
        <Text type="danger">
          -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
        </Text>
      ),
    },
    {
      title: 'Ứng lương',
      dataIndex: 'advanceSalary',
      key: 'advanceSalary',
      render: (val: number, record: PayrollRecord) => (
        <Text
          className={val > 0 ? "text-[#f59e0b] cursor-pointer hover:underline" : "text-[#f59e0b]"}
          onClick={() => {
            if (val > 0 && record.advanceDetails?.length > 0) {
              setSelectedAdvanceDetails(record.advanceDetails);
              setSelectedStaffName(record.fullName);
              setIsAdvanceModalVisible(true);
            }
          }}
        >
          -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
        </Text>
      ),
    },
    {
      title: 'Thực nhận',
      dataIndex: 'netSalary',
      key: 'netSalary',
      render: (val: number) => (
        <Text strong className="text-[#003594]">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'isFinalized',
      render: (_: any, record: PayrollRecord) => (
        record.isFinalized
          ? <Tag color="success">Đã chốt</Tag>
          : <Tag color="processing">Tạm tính</Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <Title level={4} style={{ margin: 0 }}>Bảng lương</Title>
          <p className="text-[#64748b] text-sm">Xem chi tiết lương, thưởng và phạt của từng nhân viên.</p>
        </div>
      </div>

      <Card className="shadow-sm border-[#e2e8f0] rounded-xl">
        <div className="mb-6 space-y-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Input
                placeholder="Tìm kiếm nhân viên..."
                prefix={<Search size={16} className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <DatePicker 
                picker="month" 
                className="w-full"
                value={selectedDate}
                onChange={(val) => {
                  if (val) setSelectedDate(val);
                }}
                format="MM/YYYY"
                allowClear={false}
              />
            </Col>
          </Row>
        </div>

        <Table 
          columns={columns} 
          dataSource={payrollData.filter(record => 
            !searchText || 
            record.fullName.toLowerCase().includes(searchText.toLowerCase()) || 
            record.userName.toLowerCase().includes(searchText.toLowerCase())
          )} 
          rowKey="staffId"
          loading={isLoading}
          scroll={{ x: 'max-content' }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total}`,
          }}
        />
      </Card>

      <Modal
        title={`Chi tiết ứng lương - ${selectedStaffName}`}
        open={isAdvanceModalVisible}
        onCancel={() => setIsAdvanceModalVisible(false)}
        footer={null}
      >
        <List
          itemLayout="horizontal"
          dataSource={selectedAdvanceDetails}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={<Text strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}</Text>}
                description={`Ngày yêu cầu: ${dayjs(item.date).format('DD/MM/YYYY HH:mm')}`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default PayrollManagement;
