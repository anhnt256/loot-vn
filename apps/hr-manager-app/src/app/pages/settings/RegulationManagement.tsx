import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Modal,
  message,
  Drawer,
  Form,
  Input,
  Tag,
  Space,
  Table,
  Empty,
  Popconfirm,
  Skeleton,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { FileText } from 'lucide-react';
import { apiClient } from '@gateway-workspace/shared/utils';

const { Title, Text, Paragraph } = Typography;

interface Regulation {
  id: number;
  version: number;
  title: string;
  content: string;
  publishedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  acknowledgments: Acknowledgment[];
}

interface Acknowledgment {
  id: number;
  regulationId: number;
  staffId: number;
  acknowledgedAt: string;
  staff: {
    id: number;
    fullName: string;
    userName: string;
    phone?: string;
  };
}

const RegulationManagement: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [ackList, setAckList] = useState<Acknowledgment[]>([]);
  const [unackList, setUnackList] = useState<{ id: number; fullName: string; userName: string; phone?: string }[]>([]);
  const [ackLoading, setAckLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRegulation, setPreviewRegulation] = useState<Regulation | null>(null);
  const [form] = Form.useForm();

  const fetchRegulations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/hr-manager/regulations');
      setRegulations(res.data);
    } catch {
      message.error('Không thể tải danh sách nội quy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegulations();
  }, []);

  const handleAdd = () => {
    setSelectedRegulation(null);
    form.resetFields();
    setDrawerOpen(true);
  };

  const handleEdit = (reg: Regulation) => {
    setSelectedRegulation(reg);
    form.setFieldsValue({ title: reg.title, content: reg.content });
    setDrawerOpen(true);
  };

  const handleSave = async (values: { title: string; content: string }) => {
    try {
      if (selectedRegulation) {
        await apiClient.put(`/hr-manager/regulations/${selectedRegulation.id}`, values);
        message.success('Cập nhật nội quy thành công');
      } else {
        await apiClient.post('/hr-manager/regulations', values);
        message.success('Tạo nội quy mới thành công');
      }
      setDrawerOpen(false);
      fetchRegulations();
    } catch {
      message.error('Lỗi khi lưu nội quy');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await apiClient.post(`/hr-manager/regulations/${id}/publish`);
      message.success('Đã phát hành nội quy');
      fetchRegulations();
    } catch {
      message.error('Không thể phát hành nội quy');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xóa nội quy',
      content: 'Bạn có chắc chắn muốn xóa nội quy này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.delete(`/hr-manager/regulations/${id}`);
          message.success('Đã xóa nội quy');
          fetchRegulations();
        } catch {
          message.error('Không thể xóa nội quy');
        }
      },
    });
  };

  const handleViewAcknowledgments = async (reg: Regulation) => {
    setAckModalOpen(true);
    setAckLoading(true);
    setPreviewRegulation(reg);
    try {
      const [ackRes, unackRes] = await Promise.all([
        apiClient.get(`/hr-manager/regulations/${reg.id}/acknowledgments`),
        apiClient.get(`/hr-manager/regulations/${reg.id}/unacknowledged`),
      ]);
      setAckList(ackRes.data);
      setUnackList(unackRes.data);
    } catch {
      message.error('Không thể tải danh sách xác nhận');
    } finally {
      setAckLoading(false);
    }
  };

  const columns = [
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      render: (v: number, record: Regulation) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue" className="font-bold text-sm">v{v}</Tag>
          {record.publishedAt ? (
            <Tag color="green" className="text-[10px] border-none mt-1 font-bold">
              <CheckCircleOutlined /> Đang áp dụng
            </Tag>
          ) : (
            <Tag color="default" className="text-[10px] border-none mt-1">Bản nháp</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Regulation) => (
        <Space direction="vertical" size={0}>
          <Text className="font-semibold text-[#1e293b]">{title}</Text>
          <Text type="secondary" className="text-[11px]">
            Tạo: {new Date(record.createdAt).toLocaleDateString('vi-VN')}
            {record.createdBy && ` - bởi ${record.createdBy}`}
          </Text>
          {record.updatedAt !== record.createdAt && (
            <Text type="secondary" className="text-[11px]">
              <HistoryOutlined /> Sửa lần cuối: {new Date(record.updatedAt).toLocaleString('vi-VN')}
            </Text>
          )}
          {record.publishedAt && (
            <Text type="secondary" className="text-[11px] text-green-600">
              Phát hành: {new Date(record.publishedAt).toLocaleString('vi-VN')}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Xác nhận',
      key: 'acknowledgments',
      width: 140,
      render: (_: unknown, record: Regulation) => {
        const ackCount = record.acknowledgments?.length || 0;
        return (
          <Button
            type="link"
            icon={<TeamOutlined />}
            onClick={() => handleViewAcknowledgments(record)}
            className="text-[#003594] p-0"
          >
            {ackCount} đã xác nhận
          </Button>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: Regulation) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => { setPreviewRegulation(record); setPreviewOpen(true); }}
            className="text-[#003594]"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-[#003594]"
          />
          {!record.publishedAt && (
            <Popconfirm
              title="Phát hành nội quy này?"
              description="Sau khi phát hành, nhân viên sẽ thấy nội quy mới."
              onConfirm={() => handlePublish(record.id)}
              okText="Phát hành"
              cancelText="Hủy"
            >
              <Button type="text" icon={<SendOutlined />} className="text-green-600" />
            </Popconfirm>
          )}
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const ackColumns = [
    {
      title: 'Nhân viên',
      key: 'staff',
      render: (_: unknown, record: Acknowledgment) => (
        <Space direction="vertical" size={0}>
          <Text className="font-semibold">{record.staff.fullName}</Text>
          <Text type="secondary" className="text-[11px]">@{record.staff.userName}</Text>
        </Space>
      ),
    },
    {
      title: 'SĐT',
      key: 'phone',
      render: (_: unknown, record: Acknowledgment) => (
        <Text type="secondary">{record.staff.phone || '—'}</Text>
      ),
    },
    {
      title: 'Thời gian đồng ý',
      dataIndex: 'acknowledgedAt',
      key: 'acknowledgedAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <Title level={4} style={{ margin: 0 }}>Quản lý Nội quy</Title>
          <p className="text-[#64748b] text-sm">
            Soạn thảo và quản lý nội quy công ty. Mỗi phiên bản mới sẽ yêu cầu nhân viên xác nhận lại.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-[#003594] h-10 px-6 font-semibold rounded-lg w-full sm:w-auto"
          onClick={handleAdd}
        >
          Tạo nội quy mới
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : regulations.length === 0 ? (
          <Empty
            image={<FileText size={48} className="text-[#cbd5e1] mx-auto" />}
            description={
              <span className="text-[#94a3b8]">Chưa có nội quy nào. Hãy tạo nội quy đầu tiên.</span>
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={regulations}
            rowKey="id"
            pagination={{ defaultPageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        )}
      </div>

      {/* Drawer: Tạo/Sửa nội quy */}
      <Drawer
        title={selectedRegulation ? `Chỉnh sửa nội quy (v${selectedRegulation.version})` : 'Tạo nội quy mới'}
        width={720}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        styles={{ body: { paddingBottom: 80 } }}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button
              onClick={() => form.submit()}
              type="primary"
              className="bg-[#003594]"
              icon={<SaveOutlined />}
            >
              Lưu
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input size="large" placeholder="VD: Nội quy công ty 2026" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung nội quy"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <Input.TextArea
              rows={20}
              placeholder="Nhập nội dung nội quy tại đây..."
              style={{ fontFamily: 'monospace', fontSize: 13 }}
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Modal: Xem preview nội quy */}
      <Modal
        title={
          <Space>
            <FileText size={18} />
            <span>{previewRegulation?.title} (v{previewRegulation?.version})</span>
          </Space>
        }
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={<Button onClick={() => setPreviewOpen(false)}>Đóng</Button>}
        width={700}
      >
        <div className="max-h-[60vh] overflow-y-auto py-4">
          <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
            {previewRegulation?.content}
          </Paragraph>
        </div>
      </Modal>

      {/* Modal: Danh sách xác nhận */}
      <Modal
        title={
          <Space>
            <TeamOutlined />
            <span>Xác nhận nội quy — {previewRegulation?.title} (v{previewRegulation?.version})</span>
          </Space>
        }
        open={ackModalOpen}
        onCancel={() => setAckModalOpen(false)}
        footer={<Button onClick={() => setAckModalOpen(false)}>Đóng</Button>}
        width={650}
      >
        <Tabs
          items={[
            {
              key: 'acknowledged',
              label: (
                <span>
                  <CheckCircleOutlined className="text-green-500" /> Đã xác nhận ({ackList.length})
                </span>
              ),
              children: (
                <Table
                  columns={ackColumns}
                  dataSource={ackList}
                  rowKey="id"
                  loading={ackLoading}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'Chưa có nhân viên nào xác nhận' }}
                />
              ),
            },
            {
              key: 'unacknowledged',
              label: (
                <span>
                  <CloseCircleOutlined className="text-red-500" /> Chưa xác nhận ({unackList.length})
                </span>
              ),
              children: (
                <Table
                  columns={[
                    {
                      title: 'Nhân viên',
                      key: 'staff',
                      render: (_: unknown, record: { fullName: string; userName: string }) => (
                        <Space direction="vertical" size={0}>
                          <Text className="font-semibold">{record.fullName}</Text>
                          <Text type="secondary" className="text-[11px]">@{record.userName}</Text>
                        </Space>
                      ),
                    },
                    {
                      title: 'SĐT',
                      dataIndex: 'phone',
                      key: 'phone',
                      render: (phone: string) => <Text type="secondary">{phone || '—'}</Text>,
                    },
                  ]}
                  dataSource={unackList}
                  rowKey="id"
                  loading={ackLoading}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'Tất cả nhân viên đã xác nhận' }}
                />
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default RegulationManagement;
