import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';

interface CreateTenantModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
  initialValues?: any;
}

const CreateTenantModal: React.FC<CreateTenantModalProps> = ({ 
  visible, 
  onCancel, 
  onOk, 
  initialValues 
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        const c = initialValues.clients;
        const fromClients = typeof c === 'object' && c && !Array.isArray(c);
        form.setFieldsValue({
          ...initialValues,
          dbUrl: initialValues.dbUrl ?? (fromClients ? c.dbUrl : null) ?? '',
          fnetUrl: initialValues.fnetUrl ?? (fromClients ? c.fnetUrl : null) ?? '',
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        onOk(values);
        form.resetFields();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title={initialValues ? "Edit Tenant" : "Create Tenant"}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText={initialValues ? "Save Changes" : "Create"}
      cancelText="Cancel"
      centered
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        name="tenant_form"
        initialValues={{ status: 'Active' }}
        className="mt-6"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input the tenant name!' }]}
        >
          <Input placeholder="Enter tenant name" />
        </Form.Item>

        <Form.Item
          name="tenantId"
          label="Tenant ID"
          rules={[{ required: true, message: 'Please input the tenant ID!' }]}
        >
          <Input placeholder="e.g. admin, ktaxa" disabled={!!initialValues} />
        </Form.Item>

        <Form.Item
          name="domain"
          label="Domain"
          rules={[{ required: true, message: 'Please input the domain!' }]}
        >
          <Input placeholder="e.g. admin-ai.dev.asia.covergo.cloud" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} placeholder="Enter tenant description" />
        </Form.Item>

        <Form.Item
          name="dbUrl"
          label="DB URL"
        >
          <Input placeholder="e.g. postgresql://user:pass@host:5432/db_tenant_id" />
        </Form.Item>

        <Form.Item
          name="fnetUrl"
          label="FNET URL"
        >
          <Input placeholder="e.g. https://govap.loot.vn/api/fnet" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          valuePropName="value"
        >
          <Select
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTenantModal;
