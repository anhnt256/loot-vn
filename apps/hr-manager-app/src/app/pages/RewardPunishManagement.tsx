import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Typography,
  Card,
  message,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Tabs,
  DatePicker,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  GiftOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Filter } from 'lucide-react';
import dayjs from 'dayjs';
import { apiClient } from '@gateway-workspace/shared/utils';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Record {
  id: number;
  staffId: number;
  amount: number;
  reason: string;
  note?: string;
  status: string;
  createdAt: string;
  rewardDate?: string;
  penaltyDate?: string;
}

interface Staff {
  id: number;
  fullName: string;
  userName: string;
}

interface RuleSeverity {
  id: number;
  occurrenceNumber: number;
  amount: number | null;
}

interface RewardPunishRule {
  id: number;
  name: string;
  type: 'REWARD' | 'PUNISH';
  severities: RuleSeverity[];
}

const RewardPunishManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('bonus');
  const [bonuses, setBonuses] = useState<Record[]>([]);
  const [penalties, setPenalties] = useState<Record[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [rules, setRules] = useState<RewardPunishRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [filterStaffId, setFilterStaffId] = useState<number | null>(null);

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const url = filterStaffId 
        ? `/hr-manager/staff-bonus-penalty?staffId=${filterStaffId}` 
        : `/hr-manager/staff-bonus-penalty`;
      const response = await apiClient.get(url);
      setBonuses(response.data.bonuses || []);
      setPenalties(response.data.penalties || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      message.error('Không thể tải dữ liệu Thưởng/Phạt');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await apiClient.get('/hr-manager/staff');
      setStaffList(Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []));
    } catch (error: any) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await apiClient.get('/hr-manager/reward-punish-rules');
      setRules(response.data || []);
    } catch (error: any) {
      console.error('Error fetching rules:', error);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchRules();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filterStaffId]);

  const handleDelete = async (id: number, type: 'bonus' | 'penalty') => {
    try {
      await apiClient.delete(`/hr-manager/staff-bonus-penalty/${type}/${id}`);
      message.success('Đã xóa thành công');
      fetchData();
    } catch (error: any) {
      message.error(`Không thể xóa ${type === 'bonus' ? 'thưởng' : 'phạt'}`);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      const url = activeTab === 'bonus' ? '/hr-manager/staff-bonus-penalty/bonus' : '/hr-manager/staff-bonus-penalty/penalty';
      
      const payload = {
        ...values,
        [activeTab === 'bonus' ? 'rewardDate' : 'penaltyDate']: values.date ? values.date.toISOString() : new Date().toISOString()
      };
      
      await apiClient.post(url, payload);
      message.success(`Đã thêm ${activeTab === 'bonus' ? 'thưởng' : 'phạt'} thành công`);
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      message.error(`Không thể thêm ${activeTab === 'bonus' ? 'thưởng' : 'phạt'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStaffName = (staffId: number) => {
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return `Nhân viên #${staffId}`;
    return (
      <Space>
        <div className="flex flex-col">
          <Text className="font-semibold text-[#1e293b]">{staff.fullName}</Text>
          <Text type="secondary" className="text-[11px] -mt-1">@{staff.userName}</Text>
        </div>
      </Space>
    );
  };

  const handleRuleChange = (ruleId: number) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      const firstSeverity = rule.severities && rule.severities.length > 0 ? rule.severities[0] : null;
      form.setFieldsValue({
        reason: rule.name,
        amount: firstSeverity?.amount ? Number(firstSeverity.amount) : undefined,
      });
    }
  };

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'staffId',
      key: 'staffId',
      render: (staffId: number) => getStaffName(staffId),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong className={activeTab === 'bonus' ? 'text-green-600' : 'text-red-600'}>
          {activeTab === 'bonus' ? '+' : '-'}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
        </Text>
      ),
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Ngày áp dụng',
      key: 'date',
      render: (_: any, record: Record) => {
        const date = activeTab === 'bonus' ? record.rewardDate : record.penaltyDate;
        return dayjs(date).format('DD/MM/YYYY');
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa bản ghi này?"
          onConfirm={() => handleDelete(record.id, activeTab as 'bonus' | 'penalty')}
          okText="Có"
          cancelText="Không"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <Title level={4} style={{ margin: 0 }}>Quản lý Thưởng/Phạt</Title>
          <p className="text-[#64748b] text-sm">Quản lý khen thưởng và kỷ luật nhân viên.</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className="bg-[#003594] hover:bg-[#002570] border-none"
          onClick={() => {
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Thêm mới
        </Button>
      </div>

      <Card className="shadow-sm border-[#e2e8f0] rounded-xl">
        <div className="mb-6 space-y-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Select
                showSearch
                placeholder="Lọc theo nhân viên"
                allowClear
                className="w-full"
                onChange={v => setFilterStaffId(v)}
                value={filterStaffId}
                optionFilterProp="label"
                options={staffList.map(staff => ({
                  value: staff.id,
                  label: `${staff.fullName} (@${staff.userName})`
                }))}
              />
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Button 
                icon={<Filter size={16} />} 
                className="w-full"
                onClick={() => setFilterStaffId(null)}
              >
                Xóa lọc
              </Button>
            </Col>
          </Row>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          className="custom-tabs"
        >
          <TabPane 
            tab={
              <span className="flex items-center gap-2">
                <GiftOutlined /> Khen thưởng
              </span>
            } 
            key="bonus"
          >
            <Table 
              columns={columns} 
              dataSource={bonuses} 
              rowKey="id"
              loading={isLoading}
              scroll={{ x: 'max-content' }}
              pagination={{
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total}`,
              }}
            />
          </TabPane>
          <TabPane 
            tab={
              <span className="flex items-center gap-2">
                <WarningOutlined /> Kỷ luật
              </span>
            } 
            key="penalty"
          >
            <Table 
              columns={columns} 
              dataSource={penalties} 
              rowKey="id"
              loading={isLoading}
              scroll={{ x: 'max-content' }}
              pagination={{
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total}`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={`Thêm ${activeTab === 'bonus' ? 'khen thưởng' : 'kỷ luật'}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="staffId"
            label="Nhân viên"
            rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
          >
            <Select
              showSearch
              placeholder="Chọn nhân viên"
              optionFilterProp="label"
              options={staffList.map(staff => ({
                value: staff.id,
                label: `${staff.fullName} (@${staff.userName})`
              }))}
            />
          </Form.Item>

          <Form.Item
            name="ruleId"
            label="Chọn từ quy tắc hiện có (Tùy chọn)"
          >
            <Select
              showSearch
              placeholder="Chọn quy tắc..."
              allowClear
              optionFilterProp="label"
              onChange={handleRuleChange}
              options={rules
                .filter(r => r.type === (activeTab === 'bonus' ? 'REWARD' : 'PUNISH'))
                .map(rule => ({
                  value: rule.id,
                  label: rule.name
                }))
              }
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số tiền (VNĐ)"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền' },
              { type: 'number', min: 1000, message: 'Số tiền phải lớn hơn 1,000' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              placeholder="Ví dụ: 50,000"
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <Input placeholder="Ví dụ: Đạt KPI / Đi làm muộn" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày áp dụng"
            initialValue={dayjs()}
            rules={[{ required: true, message: 'Vui lòng chọn ngày áp dụng' }]}
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" allowClear={false} />
          </Form.Item>

          <Form.Item
            name="note"
            label="Ghi chú thêm"
          >
            <Input.TextArea placeholder="Nhập ghi chú (nếu có)" rows={3} />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalVisible(false)}>
              Hủy bỏ
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={isSubmitting}
              className={activeTab === 'bonus' ? 'bg-[#003594] hover:bg-[#002570]' : 'bg-red-600 hover:bg-red-700'}
            >
              Lưu {activeTab === 'bonus' ? 'thưởng' : 'phạt'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RewardPunishManagement;
