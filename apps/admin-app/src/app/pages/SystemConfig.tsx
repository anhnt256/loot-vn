import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Button, Card, Typography, message, Skeleton, Descriptions, Spin } from 'antd';
import { SettingOutlined, SaveOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { apiClient } from '@gateway-workspace/shared/utils/client';

const { Title } = Typography;

interface ServerTime {
  now: string;
  dayOfWeek: string;
  startDay: string;
  endDay: string;
  startWeek: string;
  endWeek: string;
  startMonth: string;
  endMonth: string;
}

export default function SystemConfig() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverTime, setServerTime] = useState<ServerTime | null>(null);
  const [checkingTime, setCheckingTime] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/system-config');
      const data = res.data || {};
      form.setFieldsValue({
        SPEND_PER_ROUND: data.SPEND_PER_ROUND ? Number(data.SPEND_PER_ROUND) : 5000,
        JACKPOT_AMOUNT: data.JACKPOT_AMOUNT ? Number(data.JACKPOT_AMOUNT) : 0,
        GAME_FUND_RATE: data.GAME_FUND_RATE ? Number(data.GAME_FUND_RATE) : 1.5,
      });
    } catch (err) {
      console.error('Lỗi khi tải cấu hình', err);
      message.error('Không thể tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setSaving(true);
      await apiClient.post('/system-config', values);
      message.success('Cập nhật cấu hình thành công!');
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình', err);
      message.error('Không thể lưu cấu hình hệ thống');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckServerTime = async () => {
    try {
      setCheckingTime(true);
      const res = await apiClient.get('/system-config/server-time');
      setServerTime(res.data);
    } catch (err) {
      console.error('Lỗi khi kiểm tra giờ hệ thống', err);
      message.error('Không thể kiểm tra giờ hệ thống');
    } finally {
      setCheckingTime(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-3 mb-8">
        <SettingOutlined className="text-2xl" style={{ color: 'var(--primary-color, #1677ff)' }} />
        <Title level={2} style={{ margin: 0, color: 'white' }}>
          Cấu hình hệ thống
        </Title>
      </div>

      <Card 
        className="border-gray-700 shadow-xl"
        style={{ backgroundColor: '#1f2937' }}
        bodyStyle={{ padding: '32px' }}
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            requiredMark={false}
          >
            <Form.Item
              name="SPEND_PER_ROUND"
              label={<span className="text-gray-200 font-medium">Số tiền mỗi lượt quay (VNĐ)</span>}
              rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
              extra={<span className="text-gray-400 text-xs">Phản ánh số tiền người chơi cần sử dụng/nạp để được cộng 1 lượt quay</span>}
            >
              <InputNumber 
                className="w-full text-lg" 
                size="large"
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
              />
            </Form.Item>

            <Form.Item
              name="JACKPOT_AMOUNT"
              label={<span className="text-gray-200 font-medium">Khoản thưởng Nổ Hũ (Jackpot VNĐ)</span>}
              rules={[{ required: true, message: 'Vui lòng thiết lập khoản thưởng Jackpot' }]}
              extra={<span className="text-gray-400 text-xs">Số tiền này sẽ được thưởng / cộng dồn khi người chơi trúng Jackpot</span>}
            >
              <InputNumber 
                className="w-full text-lg" 
                size="large"
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
              />
            </Form.Item>

            <Form.Item
              name="GAME_FUND_RATE"
              label={<span className="text-gray-200 font-medium">Tỷ lệ cộng quỹ Nổ Hũ (%)</span>}
              rules={[{ required: true, message: 'Vui lòng thiết lập tỷ lệ cộng dồn quỹ' }]}
              extra={<span className="text-gray-400 text-xs">Mỗi lượt quay sẽ trích phần trăm này từ giá trị vòng quay (SPEND_PER_ROUND) để cộng vào Tổng Quỹ</span>}
            >
              <InputNumber 
                className="w-full text-lg" 
                size="large"
                min={0}
                max={100}
                step={0.1}
                addonAfter="%"
              />
            </Form.Item>

            <div className="flex justify-end mt-8 border-t border-gray-700 pt-6">
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                icon={<SaveOutlined />}
                loading={saving}
                className="font-bold px-8 shadow-md"
              >
                Lưu cấu hình
              </Button>
            </div>
          </Form>
        )}
      </Card>

      <Card
        className="border-gray-700 shadow-xl mt-6"
        style={{ backgroundColor: '#1f2937' }}
        bodyStyle={{ padding: '32px' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-200 font-medium text-base">Kiểm tra giờ hệ thống (Server)</span>
          <Button
            icon={<ClockCircleOutlined />}
            onClick={handleCheckServerTime}
            loading={checkingTime}
          >
            Kiểm tra
          </Button>
        </div>

        {checkingTime && !serverTime && <Spin />}

        {serverTime && (
          <Descriptions
            bordered
            size="small"
            column={1}
            labelStyle={{ color: '#9ca3af', backgroundColor: '#111827', width: 160 }}
            contentStyle={{ color: '#f3f4f6', backgroundColor: '#1f2937' }}
          >
            <Descriptions.Item label="Giờ hiện tại">{serverTime.now}</Descriptions.Item>
            <Descriptions.Item label="Thứ">{serverTime.dayOfWeek}</Descriptions.Item>
            <Descriptions.Item label="Start Day">{serverTime.startDay}</Descriptions.Item>
            <Descriptions.Item label="End Day">{serverTime.endDay}</Descriptions.Item>
            <Descriptions.Item label="Start Week">{serverTime.startWeek}</Descriptions.Item>
            <Descriptions.Item label="End Week">{serverTime.endWeek}</Descriptions.Item>
            <Descriptions.Item label="Start Month">{serverTime.startMonth}</Descriptions.Item>
            <Descriptions.Item label="End Month">{serverTime.endMonth}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
}
