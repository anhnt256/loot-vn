import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { apiClient as axios } from '@gateway-workspace/shared/utils';

const { TextArea } = Input;

interface Tenant {
  id: string;
  name: string;
  tenantId?: string;
}

interface CreateOrgModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
  initialValues?: any;
}

interface ColorInputProps {
  value?: string;
  onChange?: (value: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ value, onChange }) => {
  return (
    <div className="flex bg-white border border-[#d9d9d9] rounded-lg overflow-hidden h-10 w-full focus-within:border-[#ff721f] focus-within:ring-1 focus-within:ring-[#ff721f] shadow-sm transition-all hover:border-[#ff721f]">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange?.(e.target.value)}
        className="p-0 border-0 w-10 h-full cursor-pointer shrink-0 bg-transparent"
      />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="#HexCode"
        className="flex-1 px-3 border-none outline-none bg-transparent font-mono text-sm uppercase"
        maxLength={7}
      />
    </div>
  );
};

const CreateOrgModal: React.FC<CreateOrgModalProps> = ({
  visible,
  onCancel,
  onOk,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [tenantList, setTenantList] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        const tenantIds = initialValues.tenants?.map((t: { id: string }) => t.id) ?? initialValues.tenantIds ?? [];
        form.setFieldsValue({
          name: initialValues.name,
          description: initialValues.description,
          status: initialValues.status,
          rootDomain: initialValues.rootDomain ?? '',
          primaryColor: initialValues.primaryColor ?? '#ea580c',
          secondaryColor: initialValues.secondaryColor ?? '#003594',
          tenantIds,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  useEffect(() => {
    if (!visible) return;
    setLoadingTenants(true);
    axios
      .get('/tenant-admin/tenant-management/tenants')
      .then((res: any) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setTenantList(data);
      })
      .catch(() => setTenantList([]))
      .finally(() => setLoadingTenants(false));
  }, [visible]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onOk(values);
    }).catch(() => {});
  };

  return (
    <Modal
      title={initialValues ? 'Edit Organization' : 'Create New Organization'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      okText={initialValues ? 'Save Changes' : 'Create Organization'}
      okButtonProps={{ className: 'bg-[#003594]' }}
    >
      <Form form={form} layout="vertical" name="orgForm" className="mt-4">
        <Form.Item
          name="name"
          label="Organization Name"
          rules={[{ required: true, message: 'Please input the organization name!' }]}
        >
          <Input placeholder="e.g. CoverGo Asia" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={3} placeholder="A short description about this organization..." />
        </Form.Item>

        <Form.Item name="rootDomain" label="Domain gốc">
          <Input placeholder="e.g. loot.vn" />
        </Form.Item>

        <div className="flex gap-4">
          <Form.Item name="primaryColor" label="Primary Color" initialValue="#ea580c" className="flex-1">
            <ColorInput />
          </Form.Item>

          <Form.Item name="secondaryColor" label="Secondary Color" initialValue="#003594" className="flex-1">
            <ColorInput />
          </Form.Item>
        </div>

        <Form.Item
          name="status"
          label="Status"
          initialValue="Active"
          rules={[{ required: true, message: 'Please select a status!' }]}
        >
          <Select
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
        </Form.Item>

        <Form.Item name="tenantIds" label="Linked Tenants">
          <Select
            mode="multiple"
            placeholder="Select tenants to link to this organization"
            loading={loadingTenants}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }
            options={tenantList.map((t) => ({
              value: t.id,
              label: t.name || t.tenantId || t.id,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateOrgModal;
