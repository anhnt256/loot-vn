import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, 
  Input, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Modal, 
  message, 
  Tooltip,
  Drawer,
  Form,
  Select,
  DatePicker,
  Switch,
  Tabs,
  InputNumber
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  LockOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { Users, Filter, LayoutGrid, List } from 'lucide-react';
import dayjs from 'dayjs';
import { apiClient } from '@gateway-workspace/shared/utils';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Staff {
  id: number;
  userName: string;
  fullName: string;
  staffType: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  dateOfBirth: string | null;
  gender: string;
  hireDate: string | null;
  idCard: string | null;
  idCardExpiryDate: string | null;
  idCardIssueDate: string | null;
  note: string | null;
  resignDate: string | null;
  needCheckMacAddress: boolean;
  isDeleted: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  baseSalary: number;
  workShiftId: number | null;
  workShift: WorkShift | null;
}

interface WorkShift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [form] = Form.useForm();

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/hr-manager/staff`, {
        params: {
          includeDeleted,
        }
      });
      setStaff(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      message.error(error.response?.data?.message || 'Không thể tải danh sách nhân viên');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkShifts = async () => {
    try {
      const response = await apiClient.get('/hr-manager/work-shifts');
      setWorkShifts(response.data);
    } catch (error) {
      console.error('Error fetching work shifts:', error);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchWorkShifts();
  }, [includeDeleted]);

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Cho thôi việc nhân viên',
      content: 'Bạn có chắc chắn muốn cho nhân viên này thôi việc? Họ sẽ không thể đăng nhập vào hệ thống nữa.',
      okText: 'Cho thôi việc',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.delete(`/hr-manager/staff/${id}`);
          message.success('Đã cho nhân viên thôi việc thành công');
          fetchStaff();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Không thể xóa nhân viên');
        }
      },
    });
  };

  const [resetPwdStaffId, setResetPwdStaffId] = useState<number | null>(null);
  const [resetPwdLoading, setResetPwdLoading] = useState(false);
  const [resetPwdForm] = Form.useForm();

  const handleResetPassword = async (values: any) => {
    if (!resetPwdStaffId) return;
    try {
      setResetPwdLoading(true);
      await apiClient.post(`/hr-manager/staff/${resetPwdStaffId}/reset-password`, {
        newPassword: values.newPassword,
      });
      message.success('Đặt lại mật khẩu thành công');
      setResetPwdStaffId(null);
      resetPwdForm.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setResetPwdLoading(false);
    }
  };

  const handleEdit = (record: Staff) => {
    setSelectedStaff(record);
    form.setFieldsValue({
      ...record,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : null,
      hireDate: record.hireDate ? dayjs(record.hireDate) : null,
      idCardExpiryDate: record.idCardExpiryDate ? dayjs(record.idCardExpiryDate) : null,
      idCardIssueDate: record.idCardIssueDate ? dayjs(record.idCardIssueDate) : null,
      resignDate: record.resignDate ? dayjs(record.resignDate) : null,
      password: '', // Hidden for security
    });
    setShowDrawer(true);
  };

  const handleAdd = () => {
    setSelectedStaff(null);
    form.resetFields();
    setShowDrawer(true);
  };

  const handleFormFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth?.toISOString(),
        hireDate: values.hireDate?.toISOString(),
        idCardExpiryDate: values.idCardExpiryDate?.toISOString(),
        idCardIssueDate: values.idCardIssueDate?.toISOString(),
        resignDate: values.resignDate?.toISOString(),
      };

      if (selectedStaff) {
        await apiClient.put(`/hr-manager/staff/${selectedStaff.id}`, payload);
        message.success('Cập nhật thông tin nhân viên thành công');
      } else {
        await apiClient.post('/hr-manager/staff', payload);
        message.success('Thêm nhân viên thành công');
      }
      setShowDrawer(false);
      fetchStaff();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể lưu thông tin nhân viên');
    }
  };

  const filteredStaff = useMemo(() => {
    if (!Array.isArray(staff)) return [];
    return staff.filter(s => 
      s.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      s.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      s.phone?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [staff, searchText]);

  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: Staff) => (
        <Space>
          <div className="w-8 h-8 rounded-full bg-[#003594] flex items-center justify-center text-white text-[10px] font-bold">
            {text.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <Text className="font-semibold text-[#1e293b]">{text}</Text>
            <Text type="secondary" className="text-[11px] -mt-1">{record.userName}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_: any, record: Staff) => (
        <div className="flex flex-col">
          <Text className="text-xs text-[#475569]">{record.email || '-'}</Text>
          <Text className="text-xs text-[#475569]">{record.phone || '-'}</Text>
        </div>
      ),
    },
    {
      title: 'Vị trí',
      dataIndex: 'staffType',
      key: 'staffType',
      render: (type: string) => {
        const colors: Record<string, string> = {
          STAFF: 'blue',
          KITCHEN: 'orange',
          SECURITY: 'purple',
          CASHIER: 'green',
          MANAGER: 'gold',
          SUPER_ADMIN: 'red',
        };
        const labels: Record<string, string> = {
          STAFF: 'Nhân viên',
          KITCHEN: 'Bếp',
          SECURITY: 'Bảo vệ',
          CASHIER: 'Thu ngân',
          MANAGER: 'Quản lý',
          BRANCH_ADMIN: 'Quản trị chi nhánh',
          SUPER_ADMIN: 'Quản trị cấp cao',
        };
        return <Tag color={colors[type] || 'default'}>{labels[type] || type}</Tag>;
      },
    },
    {
      title: 'Ca làm việc',
      key: 'workShift',
      render: (_: any, record: Staff) => (
        record.workShift ? (
          <Tag color="purple" className="rounded-full border-none px-3 font-medium">
            {record.workShift.name}
          </Tag>
        ) : <Text type="secondary">-</Text>
      ),
    },
    {
      title: 'Ngày vào làm',
      dataIndex: 'hireDate',
      key: 'hireDate',
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      key: 'status',
      render: (isDeleted: boolean) => (
        <Tag color={isDeleted ? 'error' : 'success'} className="rounded-full px-3">
          {isDeleted ? 'Đã nghỉ việc' : 'Đang làm việc'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Staff) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              className="text-[#003594] hover:text-[#002870]" 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {!record.isDeleted && (
            <>
              <Tooltip title="Đặt lại mật khẩu">
                <Button
                  type="text"
                  icon={<LockOutlined />}
                  className="text-orange-500 hover:text-orange-600"
                  onClick={() => setResetPwdStaffId(record.id)}
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
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col gap-1">
          <Title level={4} style={{ margin: 0 }}>Danh mục nhân viên</Title>
          <p className="text-[#64748b] text-sm">Quản lý hồ sơ, quyền truy cập và phân quyền nhân viên.</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className="w-full sm:w-auto bg-[#003594] text-white border-none hover:!bg-[#002870] shadow-sm font-semibold px-6 h-10 rounded-lg"
          onClick={handleAdd}
        >
          Thêm nhân viên
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm theo tên, tên đăng nhập, email hoặc số điện thoại"
              prefix={<SearchOutlined className="text-[#9ca3af]" />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="bg-[#f8fafc] border-none h-11 rounded-lg w-full"
              allowClear
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-4 p-2 bg-[#f8fafc] rounded-lg lg:bg-transparent lg:p-0">
              <Text className="text-sm font-medium">Hiển thị nhân viên đã nghỉ</Text>
              <Switch checked={includeDeleted} onChange={setIncludeDeleted} size="small" />
            </div>
            <Button icon={<FilterOutlined size={16} />} className="flex items-center justify-center gap-2 h-11 px-6 rounded-lg font-medium border-[#e2e8f0] text-[#64748b] hover:text-[#003594]">
              Bộ lọc nâng cao
            </Button>
          </div>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredStaff} 
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 'max-content' }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total}`,
            position: ['bottomRight'],
            defaultPageSize: 10,
          }}
          className="staff-table"
        />
      </div>

      <Drawer
        title={selectedStaff ? 'Chỉnh sửa thông tin nhân viên' : 'Thêm mới nhân viên'}
        width={window.innerWidth < 768 ? '100%' : 720}
        onClose={() => setShowDrawer(false)}
        open={showDrawer}
        styles={{ body: { paddingBottom: 80 } }}
        extra={
          <Space>
            <Button onClick={() => setShowDrawer(false)}>Hủy</Button>
            <Button onClick={() => form.submit()} type="primary" className="bg-[#003594]">
              {selectedStaff ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormFinish}
          initialValues={{
            staffType: 'STAFF',
            gender: 'MALE',
            needCheckMacAddress: true,
            baseSalary: 0,
          }}
        >
          <Tabs 
            defaultActiveKey="basic"
            items={[
              {
                key: 'basic',
                label: "Thông tin cơ bản",
                children: (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <Form.Item
                        name="userName"
                        label="Tên đăng nhập"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                      >
                        <Input placeholder="Nhập tên đăng nhập" disabled={!!selectedStaff} />
                      </Form.Item>
                      
                      {!selectedStaff && (
                        <Form.Item
                          name="password"
                          label="Mật khẩu"
                          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                        >
                          <Input.Password placeholder="Nhập mật khẩu" />
                        </Form.Item>
                      )}

                      <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                      >
                        <Input placeholder="Nhập họ và tên" />
                      </Form.Item>

                      <Form.Item
                        name="staffType"
                        label="Loại nhân viên"
                        rules={[{ required: true, message: 'Vui lòng chọn loại nhân viên' }]}
                      >
                        <Select 
                          placeholder="Chọn loại nhân viên"
                          options={[
                            { label: 'Nhân viên', value: 'STAFF' },
                            { label: 'Bếp', value: 'KITCHEN' },
                            { label: 'Bảo vệ', value: 'SECURITY' },
                            { label: 'Thu ngân', value: 'CASHIER' },
                            { label: 'Quản lý', value: 'MANAGER' },
                            { label: 'Quản trị chi nhánh', value: 'BRANCH_ADMIN' },
                            { label: 'Quản trị cấp cao', value: 'SUPER_ADMIN' },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item name="email" label="Địa chỉ email">
                        <Input placeholder="Nhập email" type="email" />
                      </Form.Item>

                      <Form.Item name="phone" label="Số điện thoại">
                        <Input placeholder="Nhập số điện thoại" />
                      </Form.Item>

                      <Form.Item name="gender" label="Giới tính">
                        <Select 
                          placeholder="Chọn giới tính"
                          options={[
                            { label: 'Nam', value: 'MALE' },
                            { label: 'Nữ', value: 'FEMALE' },
                            { label: 'Khác', value: 'OTHER' },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item name="dateOfBirth" label="Ngày sinh">
                        <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
                      </Form.Item>

                      <Form.Item name="hireDate" label="Ngày vào làm">
                        <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày vào làm" />
                      </Form.Item>

                      {selectedStaff && (
                        <Form.Item name="resignDate" label="Ngày thôi việc">
                          <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày thôi việc" />
                        </Form.Item>
                      )}
                    </div>

                    <Form.Item name="address" label="Địa chỉ thường trú">
                      <TextArea rows={2} placeholder="Nhập địa chỉ đầy đủ" />
                    </Form.Item>

                    <Form.Item name="note" label="Ghi chú thêm">
                      <TextArea rows={3} placeholder="Các chi tiết cụ thể khác..." />
                    </Form.Item>

                    <Form.Item name="needCheckMacAddress" label="Kiểm tra địa chỉ MAC" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </>
                )
              },
              {
                key: 'employment',
                label: "Chi tiết công việc",
                children: (
                  <div className="grid grid-cols-1 gap-x-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item 
                        name="baseSalary" 
                        label="Mức lương cơ bản (₫/giờ)"
                        rules={[{ required: true, message: 'Vui lòng nhập lương cơ bản' }]}
                      >
                        <InputNumber 
                          className="w-full" 
                          formatter={value => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value!.replace(/₫\s?|(,*)/g, '')}
                          placeholder="Nhập mức lương theo giờ"
                        />
                      </Form.Item>

                      <Form.Item 
                        name="workShiftId" 
                        label="Ca làm việc"
                      >
                        <Select 
                          placeholder="Chọn ca làm việc"
                          allowClear
                          options={workShifts.map(shift => ({
                            label: `${shift.name} (${shift.startTime} - ${shift.endTime})`,
                            value: shift.id
                          }))}
                        />
                      </Form.Item>
                    </div>

                    <Form.Item name="idCard" label="Số CMND/CCCD/Hộ chiếu">
                      <Input placeholder="Nhập số CMND/Hộ chiếu" />
                    </Form.Item>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item name="idCardIssueDate" label="Ngày cấp">
                        <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày cấp" />
                      </Form.Item>
                      <Form.Item name="idCardExpiryDate" label="Ngày hết hạn">
                        <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày hết hạn" />
                      </Form.Item>
                    </div>

                    <div className="border-t border-slate-100 mt-4 pt-4">
                      <Title level={5}>Thông tin tài khoản ngân hàng</Title>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Form.Item name="bankName" label="Tên ngân hàng">
                          <Input placeholder="Ví dụ: Vietcombank" />
                        </Form.Item>
                        <Form.Item name="bankAccountName" label="Tên chủ tài khoản">
                          <Input placeholder="Họ tên đầy đủ trên thẻ" />
                        </Form.Item>
                      </div>
                      <Form.Item name="bankAccountNumber" label="Số tài khoản">
                        <Input placeholder="Nhập số tài khoản" />
                      </Form.Item>
                    </div>
                  </div>
                )
              }
            ]}
          />
        </Form>
      </Drawer>

      <Modal
        title="Đặt lại mật khẩu"
        open={resetPwdStaffId !== null}
        onCancel={() => { setResetPwdStaffId(null); resetPwdForm.resetFields(); }}
        footer={null}
        width={400}
        destroyOnClose
      >
        <Form form={resetPwdForm} layout="vertical" onFinish={handleResetPassword} requiredMark={false}>
          <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Bắt buộc' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}>
            <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Bắt buộc' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setResetPwdStaffId(null); resetPwdForm.resetFields(); }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={resetPwdLoading}>Đặt lại</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
