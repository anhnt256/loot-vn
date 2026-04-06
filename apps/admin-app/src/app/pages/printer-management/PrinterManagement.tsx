import React, { useState } from 'react';
import {
  Button, Card, Tag, App, Tabs, Divider, Tooltip,
} from 'antd';
import {
  PrinterOutlined, UsbOutlined, DisconnectOutlined,
  CheckCircleOutlined, SettingOutlined, ExperimentOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { usePrinterStore, UsbPrinter, printReceipt } from '../../services/print';
import type { ReceiptData } from '../../services/print';
import TemplateEditor from './TemplateEditor';

const PrinterManagement: React.FC = () => {
  const { notification } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'printer';
  const { device, connecting, error, connect, reconnect, disconnect, clearError } = usePrinterStore();
  const [testPrinting, setTestPrinting] = useState(false);
  const webUsbSupported = UsbPrinter.isWebUsbSupported();

  // Note: auto-reconnect is handled globally in AdminLayout

  const handleConnect = async () => {
    try {
      await connect();
      notification.success({ message: 'Kết nối máy in thành công!', placement: 'topRight' });
    } catch (err: any) {
      notification.error({
        message: 'Kết nối thất bại',
        description: err.message,
        placement: 'topRight',
      });
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    notification.info({ message: 'Đã ngắt kết nối máy in', placement: 'topRight' });
  };

  const handleTestPrint = async () => {
    setTestPrinting(true);
    try {
      const testData: ReceiptData = {
        storeName: 'TEST PRINT',
        storeAddress: 'Kiem tra may in',
        dateTime: new Date().toLocaleString('vi-VN'),
        staffName: 'Admin',
        machineName: 'TEST-01',
        items: [
          { name: 'Mon test 1', quantity: 2, price: 25000, subtotal: 50000 },
          { name: 'Mon test 2', note: 'khong da', quantity: 1, price: 15000, subtotal: 15000 },
        ],
        totalAmount: 65000,
        footerLine1: 'In thu thanh cong!',
      };
      await printReceipt(testData);
      notification.success({ message: 'In thử thành công!', placement: 'topRight' });
    } catch (err: any) {
      notification.error({
        message: 'In thử thất bại',
        description: err.message,
        placement: 'topRight',
      });
    } finally {
      setTestPrinting(false);
    }
  };

  const tabItems = [
    {
      key: 'printer',
      label: (
        <span className="flex items-center gap-2">
          <PrinterOutlined />
          Máy In
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Connection status */}
          <Card
            className="border-gray-700"
            style={{ background: '#1f2937' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: device ? '#166534' : '#374151' }}
                >
                  <PrinterOutlined
                    className={device ? 'text-green-400' : 'text-gray-500'}
                    style={{ fontSize: 24 }}
                  />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base m-0">
                    {device ? device.name : 'Chưa kết nối máy in'}
                  </h3>
                  {device ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Tag color="green" icon={<CheckCircleOutlined />}>Đã kết nối</Tag>
                      <span className="text-xs text-gray-400">
                        VID: 0x{device.vendorId.toString(16).padStart(4, '0')} |
                        PID: 0x{device.productId.toString(16).padStart(4, '0')}
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm m-0 mt-1">
                      Kết nối máy in qua cổng USB để bắt đầu in bill
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {device ? (
                  <>
                    <Button
                      icon={<ExperimentOutlined />}
                      onClick={handleTestPrint}
                      loading={testPrinting}
                    >
                      In thử
                    </Button>
                    <Button
                      danger
                      icon={<DisconnectOutlined />}
                      onClick={handleDisconnect}
                    >
                      Ngắt kết nối
                    </Button>
                  </>
                ) : (
                  <Button
                    type="primary"
                    icon={<UsbOutlined />}
                    onClick={handleConnect}
                    loading={connecting}
                    disabled={!webUsbSupported}
                    style={{ background: '#22c55e', borderColor: '#22c55e' }}
                  >
                    Kết nối máy in USB
                  </Button>
                )}
              </div>
            </div>

            {!webUsbSupported && (
              <div
                className="mt-4 p-3 rounded-lg border"
                style={{ background: '#7f1d1d', borderColor: '#991b1b' }}
              >
                <p className="text-red-300 text-sm m-0">
                  Trình duyệt không hỗ trợ Web USB. Vui lòng sử dụng <strong>Google Chrome</strong> hoặc <strong>Microsoft Edge</strong>.
                  Khi không kết nối được USB, hệ thống sẽ sử dụng chế độ in qua hệ điều hành (CSS Print).
                </p>
              </div>
            )}

            {error && (
              <div
                className="mt-4 p-3 rounded-lg border cursor-pointer"
                style={{ background: '#7f1d1d', borderColor: '#991b1b' }}
                onClick={clearError}
              >
                <p className="text-red-300 text-sm m-0">{error}</p>
              </div>
            )}
          </Card>

          {/* Instructions */}
          <Card
            className="border-gray-700"
            style={{ background: '#1f2937' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <h3 className="text-white font-bold text-sm m-0 mb-4">Hướng dẫn kết nối máy in XP-80C</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Cắm cáp USB từ máy in XP-80C vào máy tính</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Bật nguồn máy in và đợi đèn sẵn sàng</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Nhấn nút <strong>"Kết nối máy in USB"</strong> ở trên, chọn thiết bị từ danh sách</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <span>Nhấn <strong>"In thử"</strong> để kiểm tra kết nối</span>
              </div>
            </div>

            <Divider className="border-gray-600 my-4" />

            <div className="text-xs text-gray-500">
              <p className="m-0">
                <strong>Lưu ý:</strong> Web USB chỉ hoạt động trên Chrome/Edge.
                Lần đầu kết nối cần cấp quyền cho trình duyệt.
                Sau đó máy in sẽ tự động kết nối lại khi mở trang.
              </p>
              <p className="m-0 mt-1">
                Nếu không kết nối được qua USB, hệ thống sẽ sử dụng chế độ in qua hệ điều hành (cần cài driver máy in).
              </p>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'template',
      label: (
        <span className="flex items-center gap-2">
          <SettingOutlined />
          Mẫu In
        </span>
      ),
      children: <TemplateEditor />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white m-0">Quản lý Máy In</h1>
      </div>

      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={(key) => setSearchParams({ tab: key }, { replace: true })}
      />
    </div>
  );
};

export default PrinterManagement;
