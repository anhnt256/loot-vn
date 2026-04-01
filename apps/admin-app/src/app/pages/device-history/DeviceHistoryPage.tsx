import React, { useState, useEffect } from 'react';
import { DatePicker, Select, Button, Typography, message, Row, Col, Empty, Pagination } from 'antd';
import { ReloadOutlined, DesktopOutlined, AppstoreOutlined, ControlOutlined, CustomerServiceOutlined, SkinOutlined, WifiOutlined, HistoryOutlined } from '@ant-design/icons';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function DeviceHistoryPage() {
  const getStartOfWeek = () => {
    const d = dayjs();
    const day = d.day();
    const diff = day === 0 ? -6 : 1 - day;
    return d.add(diff, 'day').startOf('day');
  };

  const [histories, setHistories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterDates, setFilterDates] = useState<any>([
    getStartOfWeek(),
    getStartOfWeek().add(6, 'day').endOf('day')
  ]);
  const [filterType, setFilterType] = useState<string | null>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchHistory(1);
  }, [filterDates, filterType]);

  const fetchHistory = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const params: any = { page, limit: pageSize };
      if (filterDates && filterDates.length === 2) {
        params.startDate = filterDates[0].format('YYYY-MM-DD');
        params.endDate = filterDates[1].format('YYYY-MM-DD');
      }
      if (filterType && filterType !== 'ALL') params.type = filterType;

      const res = await apiClient.get('/devices/history', { params });
      setHistories(res.data?.data || []);
      setTotalItems(res.data?.meta?.total || 0);
      setCurrentPage(page);
    } catch (e) {
      console.error('Failed to fetch histories:', e);
      message.error('Lỗi tải danh sách lịch sử máy');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (statusVal?: string) => {
    const s = statusVal || 'GOOD'; 
    if (s === 'GOOD') return { text: 'Tốt', color: 'text-green-500' };
    if (s === 'DAMAGED_BUT_USABLE') return { text: 'Xài tạm', color: 'text-yellow-500' };
    return { text: 'Lỗi', color: 'text-red-500' }; 
  };

  const renderDeviceStatus = (history: any) => {
    const monitor = getStatusDisplay(history.monitorStatus);
    const keyboard = getStatusDisplay(history.keyboardStatus);
    const mouse = getStatusDisplay(history.mouseStatus);
    const headphone = getStatusDisplay(history.headphoneStatus);
    const chair = getStatusDisplay(history.chairStatus);
    const network = getStatusDisplay(history.networkStatus);
    const comp = getStatusDisplay(history.computerStatus);

    const isReport = history.type === 'REPORT';
    const borderColor = isReport ? 'border-red-500' : 'border-blue-500';
    const titleColor = isReport ? 'text-red-500' : 'text-[#3b82f6]';
    const titleText = isReport ? 'Báo hỏng' : 'Sửa chữa';

    return (
      <div 
        key={history.id} 
        className={`bg-[#1f2937] p-5 rounded-lg border-l-[5px] ${borderColor} border-t border-t-gray-700 border-r border-r-gray-700 border-b border-b-gray-700 shadow-xl w-full transition-transform hover:-translate-y-1 mb-6`}
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700/80">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h3 className={`${titleColor} font-bold text-lg m-0 flex items-center gap-2`}>
              {titleText}: {history.computer?.name || 'Máy ảo'}
            </h3>
            <span className="text-gray-400 text-sm bg-gray-800 px-3 py-1 rounded-[12px] border border-gray-600">
              <HistoryOutlined className="mr-2" />
              {dayjs(history.createdAt).format('HH:mm:ss DD/MM/YYYY')}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-y-4 gap-x-6 items-center">
          <div className="flex items-center gap-3">
            <DesktopOutlined className="text-gray-400 text-lg" />
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs">Màn hình</span>
              <span className={`text-[14px] font-bold ${monitor.color}`}>{monitor.text}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <AppstoreOutlined className="text-gray-400 text-lg" />
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs">Bàn phím</span>
              <span className={`text-[14px] font-bold ${keyboard.color}`}>{keyboard.text}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ControlOutlined className="text-gray-400 text-lg" />
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs">Chuột</span>
              <span className={`text-[14px] font-bold ${mouse.color}`}>{mouse.text}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CustomerServiceOutlined className="text-gray-400 text-lg" />
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs">Tai nghe</span>
              <span className={`text-[14px] font-bold ${headphone.color}`}>{headphone.text}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SkinOutlined className="text-gray-400 text-lg" />
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs">Ghế</span>
              <span className={`text-[14px] font-bold ${chair.color}`}>{chair.text}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <WifiOutlined className="text-gray-400 text-lg" />
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs">Mạng</span>
              <span className={`text-[14px] font-bold ${network.color}`}>{network.text}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-5 pt-4 border-t border-gray-700/50 bg-[#171e2b] p-3 rounded">
          <span className="text-white font-bold text-sm">Mô tả:</span>{' '}
          <span className="text-gray-300 ml-1 text-[15px]">{history.issue || "Không có mô tả chi tiết"}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1550px] mx-auto py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 bg-gray-800/60 p-5 rounded-2xl border border-gray-700/50 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <HistoryOutlined className="text-2xl text-white" />
          </div>
          <div>
            <Title level={3} style={{ margin: 0, color: 'white', fontWeight: 800 }}>Lịch sử Máy</Title>
            <p className="text-gray-400 m-0 text-sm font-medium mt-1">
              Quản lý toàn bộ ghi nhận báo hỏng và sửa chữa
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-xl border border-gray-700/80">
          <DatePicker.RangePicker 
            value={filterDates}
            onChange={(vals) => setFilterDates(vals)}
            format="DD/MM/YYYY"
            allowClear={false}
            className="w-64 border-gray-600 hover:border-blue-500 focus:border-blue-500 bg-transparent shadow-none [&_.ant-picker-input_input]:text-white [&_.ant-picker-separator]:text-gray-400"
          />
          <Select
            placeholder="Loại báo cáo"
            className="w-40 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!shadow-none [&_.ant-select-selection-item]:text-white"
            value={filterType}
            onChange={(val) => setFilterType(val)}
            options={[
              { label: <span className="text-white font-medium">Tất cả</span>, value: 'ALL' },
              { label: <span className="text-red-400 font-medium">Báo hỏng</span>, value: 'REPORT' },
              { label: <span className="text-blue-400 font-medium">Sửa chữa</span>, value: 'REPAIR' }
            ]}
            dropdownStyle={{ backgroundColor: '#1f2937' }}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => fetchHistory(1)} 
            loading={loading}
            type="primary" 
            className="bg-gray-700 hover:bg-gray-600 border-0 flex items-center justify-center shadow-none text-white h-[32px] w-[32px] p-0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 relative min-h-[400px]">
        {loading && histories.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : histories.length > 0 ? (
          <div className="flex flex-col h-full w-full">
            <div className="flex-1">
              {histories.map(h => renderDeviceStatus(h))}
            </div>
            {totalItems > pageSize && (
              <div className="flex justify-end mt-4 mb-4">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalItems}
                  onChange={(page) => fetchHistory(page)}
                  showSizeChanger={false}
                  className="[&_.ant-pagination-item]:bg-gray-800 [&_.ant-pagination-item]:border-gray-700 [&_.ant-pagination-item>a]:text-gray-300 [&_.ant-pagination-item-active]:border-blue-500 [&_.ant-pagination-item-active]:bg-blue-500/20 [&_.ant-pagination-item-active>a]:text-blue-400 [&_.ant-pagination-prev>button]:text-gray-400 [&_.ant-pagination-next>button]:text-gray-400"
                />
              </div>
            )}
          </div>
        ) : (
          <Empty 
            description={<span className="text-gray-400">Không có dữ liệu lịch sử máy nào</span>} 
            className="bg-gray-800/40 p-12 rounded-2xl border border-gray-700/50"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>

    </div>
  );
}
