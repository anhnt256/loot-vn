import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Modal, 
  message, 
  Drawer, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Switch, 
  Radio,
  Tooltip,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  InfoCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { ShieldCheck, AlertTriangle, Settings2, Trash2, Plus } from 'lucide-react';
import { apiClient } from '@gateway-workspace/shared/utils';

const { Title, Text, Paragraph } = Typography;

interface RuleSeverity {
  id?: number;
  occurrenceNumber: number;
  actionType: 'WARNING' | 'MONEY' | 'DISMISSAL';
  amount: number | null;
}

interface RewardPunishRule {
  id?: number;
  name: string;
  type: 'REWARD' | 'PUNISH';
  workShift: string | null;
  maxViolations: number;
  isActive: boolean;
  resetCycle: 'DAILY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'NEVER';
  severities: RuleSeverity[];
}

const RewardPunishRules: React.FC = () => {
  const [rules, setRules] = useState<RewardPunishRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedRule, setSelectedRule] = useState<RewardPunishRule | null>(null);
  const [form] = Form.useForm();

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/hr-manager/reward-punish-rules');
      setRules(response.data);
    } catch (error) {
      console.error('Error fetching rules:', error);
      message.error('Không thể tải danh sách quy tắc');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAdd = () => {
    setSelectedRule(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'PUNISH',
      isActive: true,
      resetCycle: 'MONTHLY',
      maxViolations: 5,
      severities: [{ occurrenceNumber: 1, actionType: 'WARNING' }]
    });
    setShowDrawer(true);
  };

  const handleEdit = (rule: RewardPunishRule) => {
    setSelectedRule(rule);
    form.setFieldsValue(rule);
    setShowDrawer(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xóa quy tắc',
      content: 'Bạn có chắc chắn muốn xóa quy tắc này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.delete(`/hr-manager/reward-punish-rules/${id}`);
          message.success('Đã xóa quy tắc thành công');
          fetchRules();
        } catch (error) {
          message.error('Không thể xóa quy tắc');
        }
      },
    });
  };

  const onFinish = async (values: any) => {
    try {
      if (selectedRule?.id) {
        await apiClient.put(`/hr-manager/reward-punish-rules/${selectedRule.id}`, values);
        message.success('Cập nhật quy tắc thành success');
      } else {
        await apiClient.post('/hr-manager/reward-punish-rules', values);
        message.success('Tạo quy tắc mới thành công');
      }
      setShowDrawer(false);
      fetchRules();
    } catch (error) {
      message.error('Lỗi khi lưu quy tắc');
    }
  };

  const columns = [
    {
      title: 'Tên quy tắc',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: RewardPunishRule) => (
        <Space direction="vertical" size={0}>
          <Text className="font-semibold text-[#1e293b]">{text}</Text>
          <Tag color={record.type === 'REWARD' ? 'green' : 'red'} className="text-[10px] uppercase font-bold border-none">
            {record.type === 'REWARD' ? 'Thưởng' : 'Phạt'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Ca áp dụng',
      dataIndex: 'workShift',
      key: 'workShift',
      render: (shift: string) => shift ? <Tag color="blue">{shift}</Tag> : <Text type="secondary">Tất cả</Text>,
    },
    {
      title: 'Chu kỳ Reset',
      dataIndex: 'resetCycle',
      key: 'resetCycle',
      render: (cycle: string) => {
        const labels: any = {
          DAILY: 'Hàng ngày',
          MONTHLY: 'Hàng tháng',
          QUARTERLY: 'Hàng quý',
          YEARLY: 'Hàng năm',
          NEVER: 'Vĩnh viễn'
        };
        return <Tag color="purple">{labels[cycle]}</Tag>;
      },
    },
    {
      title: 'Mức độ',
      key: 'severities',
      render: (_: any, record: RewardPunishRule) => (
        <Space size={[0, 4]} wrap>
          {record.severities.map((s) => (
            <Tooltip key={s.occurrenceNumber} title={`${s.actionType === 'MONEY' ? (s.amount?.toLocaleString() + 'đ') : s.actionType}`}>
                <Tag className="rounded-full text-[11px]">Lần {s.occurrenceNumber}</Tag>
            </Tooltip>
          ))}
          {record.severities.length > 5 && <Text type="secondary" className="text-[10px]">...</Text>}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'status',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'} className="rounded-full px-3">
          {active ? 'Kích hoạt' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: RewardPunishRule) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} className="text-[#003594]" />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id!)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <Title level={4} style={{ margin: 0 }}>Cấu hình Quy tắc Thưởng/Phạt</Title>
          <p className="text-[#64748b] text-sm">Thiết lập các quy định, mức phạt và chu kỳ tính toán vi phạm cho nhân viên.</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className="bg-[#003594] h-10 px-6 font-semibold rounded-lg"
          onClick={handleAdd}
        >
          Thêm quy tắc
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
        <Table 
          columns={columns} 
          dataSource={rules} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ defaultPageSize: 10 }}
        />
      </div>

      <Drawer
        title={selectedRule ? 'Chỉnh sửa quy tắc' : 'Tạo quy tắc mới'}
        width={640}
        onClose={() => setShowDrawer(false)}
        open={showDrawer}
        styles={{ body: { paddingBottom: 80 } }}
        extra={
          <Space>
            <Button onClick={() => setShowDrawer(false)}>Hủy</Button>
            <Button onClick={() => form.submit()} type="primary" className="bg-[#003594]" icon={<SaveOutlined />}>
              Lưu cấu hình
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            isActive: true,
            resetCycle: 'MONTHLY'
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="type" label="Loại quy tắc" rules={[{ required: true }]}>
              <Radio.Group buttonStyle="solid" className="w-full flex">
                <Radio.Button value="PUNISH" className="flex-1 text-center">Phạt (Punish)</Radio.Button>
                <Radio.Button value="REWARD" className="flex-1 text-center">Thưởng (Reward)</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
              <Switch checkedChildren="Kích hoạt" unCheckedChildren="Tạm dừng" />
            </Form.Item>
          </div>

          <Form.Item name="name" label="Tên quy tắc (Vd: Đi muộn, Vượt KPI...)" rules={[{ required: true, message: 'Vui lòng nhập tên quy tắc' }]}>
            <Input placeholder="Nhập tên quy tắc" size="large" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="workShift" label="Áp dụng cho ca">
              <Select placeholder="Tất cả các ca" allowClear>
                <Select.Option value={null}>Tất cả các ca</Select.Option>
                <Select.Option value="Morning">Ca Sáng</Select.Option>
                <Select.Option value="Afternoon">Ca Chiều</Select.Option>
                <Select.Option value="Evening">Ca Tối</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="maxViolations" label="Ngưỡng cảnh báo cấp cao" tooltip="Gửi thông báo khẩn khi đạt mốc này">
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </div>

          <Divider className="!my-8">
            <Space className="text-[#003594] font-semibold"><Settings2 size={18} /> Cấu hình Chu kỳ & Mức độ</Space>
          </Divider>

          <Form.Item name="resetCycle" label="Chu kỳ làm mới (Reset Logic)" className="mb-8">
            <Radio.Group className="flex flex-col gap-3">
              <Radio value="MONTHLY">
                <div className="inline-flex flex-col ml-1">
                  <Text className="font-semibold">Hàng tháng</Text>
                  <Text type="secondary" className="text-[11px]">Mặc định - Reset về 0 vào ngày 1 hàng tháng</Text>
                </div>
              </Radio>
              <Radio value="QUARTERLY">
                <div className="inline-flex flex-col ml-1">
                  <Text className="font-semibold">Hàng Quý</Text>
                  <Text type="secondary" className="text-[11px]">Reset vào ngày 1 của Tháng 1, 4, 7, 10</Text>
                </div>
              </Radio>
              <Radio value="YEARLY">
                <div className="inline-flex flex-col ml-1">
                  <Text className="font-semibold">Hàng Năm</Text>
                </div>
              </Radio>
              <Radio value="NEVER">
                <div className="inline-flex flex-col ml-1">
                  <Text className="font-semibold">Không bao giờ reset</Text>
                  <Text type="secondary" className="text-[11px]">Cộng dồn vĩnh viễn suốt quá trình làm việc</Text>
                </div>
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Text strong className="block mb-4">Chi tiết các mức độ vi phạm/thành tích:</Text>
          
          <Form.List name="severities">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="bg-[#f8fafc] p-4 rounded-lg border border-[#f1f5f9] relative group">
                    <div className="flex gap-4 items-end">
                      <Form.Item
                        {...restField}
                        name={[name, 'occurrenceNumber']}
                        label="Lần thứ"
                        rules={[{ required: true }]}
                        className="mb-0 w-24"
                      >
                        <InputNumber min={1} className="w-full" placeholder="n" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'actionType']}
                        label="Hình thức"
                        rules={[{ required: true }]}
                        className="mb-0 flex-1"
                      >
                        <Select>
                          <Select.Option value="WARNING">Cảnh cáo</Select.Option>
                          <Select.Option value="MONEY">Tiền mặt</Select.Option>
                          <Select.Option value="DISMISSAL">Sa thải</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => 
                          prevValues.severities?.[name]?.actionType !== currentValues.severities?.[name]?.actionType
                        }
                      >
                        {({ getFieldValue }) => 
                          getFieldValue(['severities', name, 'actionType']) === 'MONEY' ? (
                            <Form.Item
                              {...restField}
                              name={[name, 'amount']}
                              label="Số tiền (₫)"
                              rules={[{ required: true, message: 'Nhập số tiền' }]}
                              className="mb-0 flex-1"
                            >
                              <InputNumber
                                className="w-full"
                                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={v => v!.replace(/\$\s?|(,*)/g, '')}
                              />
                            </Form.Item>
                          ) : <div className="flex-1" />
                        }
                      </Form.Item>

                      <Button 
                        type="text" 
                        danger 
                        icon={<Trash2 size={16} />} 
                        onClick={() => remove(name)}
                        className="mb-1"
                      />
                    </div>
                  </div>
                ))}
                
                <Button 
                  type="dashed" 
                  onClick={() => add({ occurrenceNumber: fields.length + 1, actionType: 'WARNING' })} 
                  block 
                  icon={<Plus size={16} />}
                  className="h-10 hover:border-[#003594] hover:text-[#003594]"
                >
                  Thêm mức độ tiếp theo
                </Button>
              </div>
            )}
          </Form.List>
          
          <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
             <InfoCircleOutlined className="text-blue-500 mt-0.5" />
             <Text className="text-blue-700 text-[12px]">
               Lưu ý: Nếu nhân viên vi phạm vượt quá số lần được cấu hình, hệ thống sẽ tự động áp dụng mức phạt cao nhất (Lần cuối cùng).
             </Text>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default RewardPunishRules;
