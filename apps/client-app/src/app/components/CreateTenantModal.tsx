import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Upload, message } from 'antd';
import { UploadOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { apiClient } from '@gateway-workspace/shared/utils/client';

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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        const c = initialValues.clients;
        const fromClients = typeof c === 'object' && c && !Array.isArray(c);
        let logo = initialValues.logo;
        if (typeof logo === 'object') {
          logo = logo?.url || null;
        }
        setLogoUrl(logo || null);
        form.setFieldsValue({
          ...initialValues,
          logo: logo || '',
          dbUrl: initialValues.dbUrl ?? (fromClients ? c.dbUrl : null) ?? '',
          fnetUrl: initialValues.fnetUrl ?? (fromClients ? c.fnetUrl : null) ?? '',
        });
      } else {
        setLogoUrl(null);
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleLogoUpload = (options: any) => {
    const { file, onSuccess, onError } = options;
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error('Logo phải nhỏ hơn 1MB!');
      onError(new Error('File quá lớn'));
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      setLogoUrl(base64String);
      form.setFieldValue('logo', base64String);
      message.success('Chọn logo thành công');
      setUploading(false);
      onSuccess('ok');
    };
    reader.onerror = (error) => {
      console.error('Lỗi đọc file:', error);
      message.error('Không thể đọc file');
      setUploading(false);
      onError(error);
    };
  };

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

        <Form.Item name="logo" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="Logo">
          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={handleLogoUpload}
            className="logo-uploader"
          >
            <div className="border border-dashed border-[#30363d] rounded-lg p-4 text-center cursor-pointer hover:border-[#ff721f] transition-colors w-full flex flex-col items-center">
              {logoUrl ? (
                <img
                  src={logoUrl.startsWith('data:') || logoUrl.startsWith('http') ? logoUrl : `${apiClient.defaults.baseURL || ''}${logoUrl}`}
                  alt="logo"
                  style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div>
                  {uploading ? <LoadingOutlined className="text-xl text-[#8b949e]" /> : <PlusOutlined className="text-xl text-[#8b949e]" />}
                  <div style={{ marginTop: 8 }} className="text-[#8b949e]">Upload Logo</div>
                </div>
              )}
            </div>
          </Upload>
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
