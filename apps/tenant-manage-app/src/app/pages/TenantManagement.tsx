import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Input, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Modal, 
  message, 
  Tooltip 
} from 'antd';
import { apiClient as axios } from '@gateway-workspace/shared/utils';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EyeOutlined, 
  EditOutlined, 
  SettingOutlined, 
  DeleteOutlined,
  KeyOutlined,
  CopyOutlined,
  CheckOutlined
} from '@ant-design/icons';
import CreateTenantModal from '../components/CreateTenantModal';
import ClientsManagementModal from '../components/ClientsManagementModal';

const { Title } = Typography;

interface Tenant {
  id: string;
  name: string;
  tenantId: string;
  domain: string;
  description: string;
  status: 'Active' | 'Inactive';
  clients: any[];
  apiKey?: string;
}

const initialTenants: Tenant[] = [
  {
    id: '1',
    name: 'Admin',
    tenantId: 'admin',
    domain: 'admin-ai.dev.asia.covergo.cloud',
    description: 'Admin tenant',
    status: 'Active',
    clients: [],
  },
  {
    id: '2',
    name: 'Ktaxa',
    tenantId: 'ktaxa',
    domain: 'ktaxa-ai.dev.asia.covergo.cloud',
    description: 'Tenant of Ktaxa',
    status: 'Active',
    clients: [],
  },
  {
    id: '3',
    name: 'Apeiron Dev',
    tenantId: 'apeiron',
    domain: 'ai-workbench.dev.asia.covergo.cloud',
    description: 'Apeiron Dev tenant',
    status: 'Active',
    clients: [],
  },
];

const TenantManagement: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isClientsModalVisible, setIsClientsModalVisible] = useState(false);
  const [selectedTenantForClients, setSelectedTenantForClients] = useState<Tenant | null>(null);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/tenant-admin/tenant-management/tenants');
      if (Array.isArray(response.data)) {
        setTenants(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setTenants(response.data.data);
      } else {
        console.error('Expected array of tenants, got:', response.data);
        message.warning('Failed to load tenants properly.');
        setTenants([]);
      }
    } catch (error) {
      console.error('Fetch tenants error:', error);
      message.error('Failed to fetch tenants');
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = useMemo(() => {
    if (!Array.isArray(tenants)) return [];
    return tenants.filter(t => 
      t?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      t?.tenantId?.toLowerCase().includes(searchText.toLowerCase()) ||
      t?.domain?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [tenants, searchText]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this tenant?',
      content: 'This action cannot be undone.',
      async onOk() {
        try {
          await axios.delete(`/tenant-admin/tenant-management/tenants/${id}`);
          message.success('Tenant deleted successfully');
          fetchTenants();
        } catch (error) {
          console.error('Delete tenant error:', error);
          message.error('Failed to delete tenant');
        }
      },
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
    });
  };

  const handleCreateOrUpdate = async (values: any) => {
    try {
      if (editingTenant) {
        await axios.patch(`/tenant-admin/tenant-management/tenants/${editingTenant.id}`, values);
        message.success('Tenant updated successfully');
      } else {
        await axios.post('/tenant-admin/tenant-management/tenants', values);
        message.success('Tenant created successfully');
      }
      fetchTenants();
      setIsModalVisible(false);
      setEditingTenant(null);
    } catch (error) {
      console.error('Create/Update tenant error:', error);
      message.error(editingTenant ? 'Failed to update tenant' : 'Failed to create tenant');
    }
  };

  const handleSaveClients = async (updatedClients: any[]) => {
    if (!selectedTenantForClients) return;
    try {
      await axios.patch(`/tenant-admin/tenant-management/tenants/${selectedTenantForClients.id}`, {
        clients: updatedClients
      });
      fetchTenants();
    } catch (error) {
      console.error('Save clients error:', error);
      throw error;
    }
  };

  const handleGenerateKey = async (id: string) => {
    try {
      await axios.post(`/tenant-admin/tenant-management/tenants/${id}/generate-key`);
      message.success('API Key generated successfully');
      fetchTenants();
    } catch (error) {
      console.error('Generate key error:', error);
      message.error('Failed to generate API Key');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-semibold text-[#1e293b]">{text}</span>,
    },
    {
      title: 'Tenant ID',
      dataIndex: 'tenantId',
      key: 'tenantId',
      render: (text: string) => <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-[#475569]">{text}</code>,
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      render: (text: string) => <span className="text-[#64748b]">{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <span className="text-[#64748b]">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'success' : 'default'} className="rounded-full px-3">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Clients',
      dataIndex: 'clients',
      key: 'clients',
      render: (clients: any, record: Tenant) => (
        <Space size="middle">
          <span className="text-[#64748b]">
            {(Array.isArray(clients) ? clients : clients?.list)?.length ?? 0} clients
          </span>
          <Tooltip title="View clients">
             <Button 
               type="text" 
               size="small" 
               icon={<EyeOutlined className="text-[#003594]" />} 
               onClick={() => {
                 setSelectedTenantForClients(record);
                 setIsClientsModalVisible(true);
               }}
             />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'API Key',
      dataIndex: 'apiKey',
      key: 'apiKey',
      render: (key: string, record: Tenant) => (
        key ? (
          <Space>
            <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-[#475569] font-mono">
              {key.substring(0, 8)}...{key.substring(key.length - 4)}
            </code>
            <Tooltip title="Copy API Key">
              <Button 
                type="text" 
                size="small" 
                icon={<CopyOutlined className="text-[#64748b]" />} 
                onClick={() => {
                  navigator.clipboard.writeText(key);
                  message.success('Copied to clipboard');
                }}
              />
            </Tooltip>
          </Space>
        ) : (
          <Button 
            type="link" 
            size="small" 
            icon={<KeyOutlined />} 
            onClick={() => handleGenerateKey(record.id)}
            className="text-[#003594]"
          >
            Generate
          </Button>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Tenant) => (
        <Space size="middle">
          <Button 
            type="text" 
            className="text-[#003594] hover:text-[#002870] font-medium p-0"
            onClick={() => {
              setEditingTenant(record);
              setIsModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button type="text" className="text-[#003594] hover:text-[#002870] font-medium p-0">
            Configs
          </Button>
          <Button 
            type="text" 
            danger 
            className="font-medium p-0"
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={4} style={{ margin: 0 }}>Tenant Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className="bg-[#e2eafc] text-[#003594] border-none hover:!bg-[#d1dcfa] hover:!text-[#003594] shadow-none font-semibold px-6 h-10 rounded-lg"
          onClick={() => {
            setEditingTenant(null);
            setIsModalVisible(true);
          }}
        >
          Create Tenant
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
        <div className="mb-6">
          <Input
            placeholder="Search by name"
            prefix={<SearchOutlined className="text-[#9ca3af]" />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="max-w-xs bg-[#f8fafc] border-none h-11 rounded-lg"
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredTenants} 
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredTenants.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            position: ['bottomRight'],
          }}
          className="tenant-table"
        />
      </div>

      <CreateTenantModal 
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTenant(null);
        }}
        onOk={handleCreateOrUpdate}
        initialValues={editingTenant}
      />

      <ClientsManagementModal
        visible={isClientsModalVisible}
        tenant={selectedTenantForClients}
        onCancel={() => {
          setIsClientsModalVisible(false);
          setSelectedTenantForClients(null);
        }}
        onSave={handleSaveClients}
      />
    </div>
  );
};

export default TenantManagement;
