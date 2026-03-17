import React, { useState, useMemo, useEffect } from 'react';
import { 
  Table, 
  Input, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Modal, 
  message 
} from 'antd';
import axios from '@gateway-workspace/shared/utils/apiClient';
import { 
  SearchOutlined, 
  PlusOutlined, 
} from '@ant-design/icons';
import CreateOrgModal from '../components/CreateOrgModal';

const { Title } = Typography;

interface Organization {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  _count?: {
     tenants: number;
  };
  tenants?: any[];
}

const OrgManagement: React.FC = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/tenant-admin/org-management/organizations');
      if (Array.isArray(response.data)) {
        setOrgs(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setOrgs(response.data.data);
      } else {
        setOrgs([]);
      }
    } catch (error) {
      console.error('Fetch orgs error:', error);
      message.error('Failed to fetch organizations');
      setOrgs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const filteredOrgs = useMemo(() => {
    if (!Array.isArray(orgs)) return [];
    return orgs.filter(o => 
      o?.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [orgs, searchText]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this organization?',
      content: 'This action will soft-delete the org.',
      async onOk() {
        try {
          await axios.delete(`/api/tenant-admin/org-management/organizations/${id}`);
          message.success('Organization deleted successfully');
          fetchOrgs();
        } catch (error) {
          console.error('Delete error:', error);
          message.error('Failed to delete organization');
        }
      },
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
    });
  };

  const handleCreateOrUpdate = async (values: any) => {
    try {
      if (editingOrg) {
        await axios.patch(`/api/tenant-admin/org-management/organizations/${editingOrg.id}`, values);
        message.success('Organization updated successfully');
      } else {
        await axios.post('/api/tenant-admin/org-management/organizations', values);
        message.success('Organization created successfully');
      }
      fetchOrgs();
      setIsModalVisible(false);
      setEditingOrg(null);
    } catch (error) {
      console.error('Create/Update org error', error);
      message.error(editingOrg ? 'Failed to update organization' : 'Failed to create organization');
    }
  };

  const openLinkTenantsModal = async (record: Organization) => {
    try {
      const { data } = await axios.get(`/api/tenant-admin/org-management/organizations/${record.id}`);
      setEditingOrg({ ...record, tenants: data.tenants ?? [] });
      setIsModalVisible(true);
    } catch (e) {
      console.error('Load organization failed', e);
      message.error('Failed to load organization');
    }
  };

  const columns = [
    {
      title: 'Organization Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-semibold text-[#1e293b]">{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <span className="text-[#64748b]">{text || '-'}</span>,
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
      title: 'Linked Tenants',
      key: 'tenants',
      render: (_: any, record: Organization) => (
        <Button
          type="link"
          className="p-0 h-auto font-medium text-[#003594] hover:text-[#002870]"
          onClick={() => openLinkTenantsModal(record)}
        >
          {record._count?.tenants ?? 0} tenants
        </Button>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Organization) => (
        <Space size="middle">
          <Button 
            type="text" 
            className="text-[#003594] hover:text-[#002870] font-medium p-0"
            onClick={async () => {
              try {
                const { data } = await axios.get(`/api/tenant-admin/org-management/organizations/${record.id}`);
                setEditingOrg(data);
                setIsModalVisible(true);
              } catch (e) {
                message.error('Failed to load organization');
              }
            }}
          >
            Edit
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
        <Title level={4} style={{ margin: 0 }}>Organization Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className="bg-[#e2eafc] text-[#003594] border-none hover:!bg-[#d1dcfa] hover:!text-[#003594] shadow-none font-semibold px-6 h-10 rounded-lg"
          onClick={() => {
            setEditingOrg(null);
            setIsModalVisible(true);
          }}
        >
          Create Organization
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
          dataSource={filteredOrgs} 
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredOrgs.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            position: ['bottomRight'],
          }}
        />
      </div>

      <CreateOrgModal 
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingOrg(null);
        }}
        onOk={handleCreateOrUpdate}
        initialValues={editingOrg}
      />
    </div>
  );
};

export default OrgManagement;
