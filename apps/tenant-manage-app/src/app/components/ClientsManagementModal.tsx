import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Form, Input, Space, Divider, Typography, message, Tooltip, Select, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined, EditOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface Client {
  domain: string;
  clientId: string;
  portalId: string;
  clientPrefix: string;
  displayName?: string;
  allowedRoles?: string[];
}

const roleOptions = [
  { label: 'All (*)', value: '*' },
  {
    label: 'Level 1',
    options: [
      { label: 'STAFF', value: 'STAFF' },
      { label: 'KITCHEN', value: 'KITCHEN' },
      { label: 'CASHIER', value: 'CASHIER' },
      { label: 'SECURITY', value: 'SECURITY' },
    ],
  },
  {
    label: 'Level 2',
    options: [
      { label: 'MANAGER', value: 'MANAGER' },
    ],
  },
  {
    label: 'Level 3',
    options: [
      { label: 'BRANCH_ADMIN', value: 'BRANCH_ADMIN' },
    ],
  },
];

interface ClientsManagementModalProps {
  visible: boolean;
  tenant: any;
  onCancel: () => void;
  onSave: (updatedClients: Client[]) => Promise<void>;
}

const ClientsManagementModal: React.FC<ClientsManagementModalProps> = ({
  visible,
  tenant,
  onCancel,
  onSave
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && tenant) {
      const raw = tenant.clients;
      setClients(Array.isArray(raw) ? raw : (raw?.list ?? []));
      setIsAdding(false);
      setEditingIndex(null);
      form.resetFields();
    }
  }, [visible, tenant, form]);

  const handleAddClient = (values: Client) => {
    if (editingIndex !== null) {
      const newClients = [...clients];
      newClients[editingIndex] = values;
      setClients(newClients);
    } else {
      setClients([...clients, values]);
    }
    setIsAdding(false);
    setEditingIndex(null);
    form.resetFields();
  };

  const handleEditClient = (index: number) => {
    setEditingIndex(index);
    form.setFieldsValue(clients[index]);
    setIsAdding(true);
  };

  const handleDeleteClient = (index: number) => {
    const newClients = [...clients];
    newClients.splice(index, 1);
    setClients(newClients);
  };

  const handleSave = async () => {
    let finalClients = [...clients];

    if (isAdding) {
      try {
        const values = await form.validateFields();
        if (editingIndex !== null) {
          finalClients[editingIndex] = values as Client;
        } else {
          finalClients.push(values as Client);
        }
        // Locally update just in case, though onCancel clears soon.
        setClients(finalClients);
      } catch (error) {
        // Form validation failed, user needs to fix form errors before saving.
        return;
      }
    }

    setLoading(true);
    try {
      await onSave(finalClients);
      message.success('Clients updated successfully');
      onCancel();
    } catch (error) {
      console.error('Update clients error:', error);
      message.error('Failed to update clients');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      render: (text: string) => <Text className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 block w-full">{text}</Text>,
    },
    {
      title: 'Client ID',
      dataIndex: 'clientId',
      key: 'clientId',
      render: (text: string) => <Text className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 block w-full">{text}</Text>,
    },
    {
      title: 'Portal ID',
      dataIndex: 'portalId',
      key: 'portalId',
      render: (text: string) => <Text className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 block w-full">{text}</Text>,
    },
    {
      title: 'Client Prefix',
      dataIndex: 'clientPrefix',
      key: 'clientPrefix',
      render: (text: string) => <Text className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 block w-full">{text}</Text>,
    },
    {
      title: 'Display Name',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text: string) => <Text className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 block w-full">{text || '—'}</Text>,
    },
    {
      title: 'Allowed Roles',
      dataIndex: 'allowedRoles',
      key: 'allowedRoles',
      render: (roles?: string[]) => {
        if (!roles || roles.length === 0) return null;
        if (roles.includes('*')) {
          return (
            <Tag color="cyan" className="m-0 border-cyan-200">
              * (All)
            </Tag>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <Tag key={role} color="blue" className="m-0 border-blue-200">
                {role}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, __: any, index: number) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined className="text-[#003594]" />}
            onClick={() => handleEditClient(index)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClient(index)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      closable={false}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave} className="bg-[#003594]">
          Save Changes
        </Button>,
      ]}
      width={900}
      centered
      className="clients-modal"
    >
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Title level={4} style={{ margin: 0 }}>Clients</Title>
          <Tooltip title="Manage clients for this tenant">
            <InfoCircleOutlined className="text-[#003594]" />
          </Tooltip>
        </Space>
        {!isAdding && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAdding(true)}
            className="bg-[#e2eafc] text-[#003594] border-none hover:!bg-[#d1dcfa] hover:!text-[#003594] shadow-none font-semibold rounded-lg"
          >
            Add Client
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-[#f8fafc] p-4 rounded-xl mb-6 border border-[#e2e8f0]">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddClient}
          >
            <div className="grid grid-cols-4 gap-4">
              <Form.Item
                name="domain"
                label="Domain"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="admin-ai.de" />
              </Form.Item>
              <Form.Item
                name="clientId"
                label="Client ID"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="admin_porta" />
              </Form.Item>
              <Form.Item
                name="portalId"
                label="Portal ID"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="admin" />
              </Form.Item>
              <Form.Item
                name="clientPrefix"
                label="Client Prefix"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="admin" />
              </Form.Item>
              <Form.Item
                name="displayName"
                label="Display Name"
              >
                <Input placeholder="e.g. HR Portal, Master App" />
              </Form.Item>
              <Form.Item
                name="allowedRoles"
                label="Allowed Roles"
                className="col-span-4"
              >
                <Select
                  mode="multiple"
                  placeholder="Select allowed roles"
                  options={roleOptions}
                  allowClear
                />
              </Form.Item>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => { setIsAdding(false); setEditingIndex(null); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" className="bg-[#003594]">
                {editingIndex !== null ? 'Save Client' : 'Add Client'}
              </Button>
            </div>
          </Form>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={clients.map((c, i) => ({ ...c, key: i }))}
        pagination={false}
        className="client-table-no-border"
      />
    </Modal>
  );
};

export default ClientsManagementModal;
