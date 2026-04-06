import React, { useState, useEffect } from 'react';
import { Drawer, Tabs, Button, Checkbox, Form, Input, Radio, Modal, message } from 'antd';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import { 
  DesktopOutlined, 
  AppstoreOutlined, 
  ControlOutlined, 
  CustomerServiceOutlined, 
  SkinOutlined, 
  WifiOutlined,
  EyeOutlined
} from '@ant-design/icons';

interface ComputerDetailDrawerProps {
  computer: any; // We can use 'any' or the imported interface if needed
  open: boolean;
  onClose: () => void;
  onUpdate?: (updates?: any) => void;
}

const ComputerDetailDrawer: React.FC<ComputerDetailDrawerProps> = ({ computer, open, onClose, onUpdate }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editedNote, setEditedNote] = useState('');
  const [localIsUseApp, setLocalIsUseApp] = useState(true);
  const [localNote, setLocalNote] = useState('Không có ghi chú');
  const [reportForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  useEffect(() => {
    if (computer) {
      const noteStr = computer.note !== undefined ? computer.note : (computer.user?.note || '');
      const isUseAppVal = computer.isUseApp !== undefined ? computer.isUseApp : (computer.user?.isUseApp !== undefined ? computer.user?.isUseApp : true);
      
      setEditedNote(noteStr);
      setLocalIsUseApp(isUseAppVal);
      setLocalNote(noteStr || 'Không có ghi chú');
    }
  }, [computer]);

  if (!computer) return null;

  const netInfo = computer.machineDetails?.netInfo || {};
  const machineGroupName = computer.machineDetails?.machineGroupName || 'Mặc định';
  const pricePerHour = computer.machineDetails?.pricePerHour || 0;

  const deviceList = [
    { key: 'monitor', label: 'Màn hình', icon: <DesktopOutlined /> },
    { key: 'keyboard', label: 'Bàn phím', icon: <AppstoreOutlined /> },
    { key: 'mouse', label: 'Chuột', icon: <ControlOutlined /> },
    { key: 'headphone', label: 'Tai nghe', icon: <CustomerServiceOutlined /> },
    { key: 'chair', label: 'Ghế', icon: <SkinOutlined /> },
    { key: 'network', label: 'Mạng', icon: <WifiOutlined /> },
  ];

  const deviceStatusOptions = [
    { label: 'Tốt', value: 'GOOD', color: 'text-green-500' },
    { label: 'Xài tạm', value: 'DAMAGED_BUT_USABLE', color: 'text-yellow-500' },
    { label: 'Lỗi', value: 'COMPLETELY_DAMAGED', color: 'text-red-500' },
  ];

  const handleUpdateIsUseApp = async (e: any) => {
    if (!computer.userId) return;
    const isUseApp = e.target.checked;
    try {
      const res = await apiClient.patch('/user/is-use-app', {
        userId: computer.userId,
        isUseApp,
      });
      if (res.data?.success) {
        setLocalIsUseApp(isUseApp);
        message.success(`Đã cập nhật trạng thái quan tâm app thành ${isUseApp ? "có" : "không"}!`);
        if (onUpdate) {
          // Send back updates formatted correctly for DashboardOverview
          onUpdate({ isUseApp, user: { ...(computer.user || {}), isUseApp } });
        }
      } else {
        message.error(res.data?.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật trạng thái quan tâm app');
    }
  };

  const handleUpdateNoteModal = async () => {
    try {
      const res = await apiClient.patch('/user/note', {
        userId: computer.userId,
        note: editedNote,
      });
      if (res.data?.success) {
        setLocalNote(editedNote);
        message.success('Đã cập nhật ghi chú thành công!');
        setShowNoteModal(false);
        if (onUpdate) {
          onUpdate({ note: editedNote, user: { ...(computer.user || {}), note: editedNote } });
        }
      } else {
        message.error(res.data?.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật ghi chú');
    }
  };

  const handleReportSubmit = async (values: any) => {
    try {
      const payload = {
        type: 'REPORT',
        status: 'PENDING',
        issue: values.note,
        monitorStatus: values.monitorStatus,
        keyboardStatus: values.keyboardStatus,
        mouseStatus: values.mouseStatus,
        headphoneStatus: values.headphoneStatus,
        chairStatus: values.chairStatus,
        networkStatus: values.networkStatus,
      };
      
      const res = await apiClient.post(`/devices/${computer.id}`, payload);
      if (res.data?.success) {
        message.success('Báo cáo đã được gửi thành công');
        setShowReportModal(false);
        reportForm.resetFields();
        if (onUpdate) onUpdate({ device: { ...computer.device, ...payload } });
      } else {
        message.error(res.data?.message || 'Có lỗi xảy ra khi gửi báo cáo');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi gửi báo cáo');
    }
  };

  const handleUpdateDeviceStatus = async (values: any) => {
    try {
      const payload = {
        type: 'REPAIR',
        status: 'RESOLVED',
        issue: values.note,
        monitorStatus: values.monitorStatus,
        keyboardStatus: values.keyboardStatus,
        mouseStatus: values.mouseStatus,
        headphoneStatus: values.headphoneStatus,
        chairStatus: values.chairStatus,
        networkStatus: values.networkStatus,
      };
      
      const res = await apiClient.post(`/devices/${computer.id}`, payload);
      if (res.data?.success) {
        message.success('Cập nhật trạng thái thiết bị thành công');
        setShowUpdateModal(false);
        updateForm.resetFields();
        if (onUpdate) onUpdate({ device: { ...computer.device, ...payload } });
      } else {
        message.error(res.data?.message || 'Có lỗi xảy ra khi cập nhật thiết bị');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật thiết bị');
    }
  };

  // Helper values
  const rawUsed = netInfo.ram_used || netInfo.mem_used || 0;
  const rawAvailable = netInfo.ram_available || netInfo.mem_available || 0;
  
  // Decide unit based on value (if > 100, assume MB and convert to GB; if < 100, assume already in GB)
  const memUsed = Number(rawUsed) > 100 ? Number(rawUsed) / 1024 : Number(rawUsed);
  const memAvailable = Number(rawAvailable) > 100 ? Number(rawAvailable) / 1024 : Number(rawAvailable);

  const netDownload = netInfo.net_download || netInfo.net_download_rate || '0';
  const netUpload = netInfo.net_upload || netInfo.net_upload_rate || '0';

  const Tab1Content = () => (
    <div className="mt-4">
      <h3 className="text-white font-bold text-base mb-4">Thông tin phần cứng</h3>
      
      <div className="grid grid-cols-3 gap-3 mb-8">
        
        {/* CPU */}
        <div className="bg-[#1a365d] bg-opacity-30 p-3 rounded-lg border border-blue-800/60 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-blue-400 font-bold text-xs uppercase">CPU</span>
          </div>
          <div className="text-white font-bold text-[13px] leading-tight mb-2 min-h-[30px]">
            {netInfo.Cpu || '-'}
          </div>
          <div className="text-[11px] text-gray-300">
            Load: <span className="text-green-400 font-bold">{netInfo.cpu_load || '0'}%</span>
          </div>
          <div className="text-[11px] text-gray-300">
            Nhiệt độ: <span className="text-blue-400 font-bold">{netInfo.cpu_temp || '0'}°C</span>
          </div>
        </div>

        {/* GPU */}
        <div className="bg-[#3b214d] bg-opacity-30 p-3 rounded-lg border border-purple-900/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="text-purple-400 font-bold text-xs uppercase">GPU</span>
          </div>
          <div className="text-white font-bold text-[13px] leading-tight mb-2 min-h-[30px]">
            {netInfo.Gpu || '-'}
          </div>
          <div className="text-[11px] text-gray-300">
            Load: <span className="text-green-400 font-bold">{netInfo.gpu_load || '0.00'}%</span>
          </div>
          <div className="text-[11px] text-gray-300">
            Nhiệt độ: <span className="text-blue-400 font-bold">{netInfo.gpu_temp || '0'}°C</span>
          </div>
        </div>

        {/* RAM */}
        <div className="bg-[#4d1f35] bg-opacity-30 p-3 rounded-lg border border-pink-900/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-pink-400" />
            <span className="text-pink-400 font-bold text-xs uppercase">RAM</span>
          </div>
          <div className="text-white font-bold text-[13px] leading-tight mb-2 min-h-[30px]">
            {netInfo.Memory || 'Generic Memory'}
          </div>
          <div className="text-[11px] text-gray-300">
            Load: <span className="text-pink-400 font-bold">{netInfo.ram_load || netInfo.mem_load || '0'}%</span>
          </div>
          <div className="text-[11px] text-gray-300">
            Đã dùng: <span className="text-yellow-500 font-bold">{memUsed > 0 ? memUsed.toFixed(2) : '0'}GB</span>
          </div>
          <div className="text-[11px] text-gray-300">
            Còn lại: <span className="text-green-400 font-bold">{memAvailable > 0 ? memAvailable.toFixed(2) : '0'}GB</span>
          </div>
        </div>

        {/* Mainboard */}
        <div className="bg-[#143d26] bg-opacity-30 p-3 rounded-lg border border-green-900/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="text-green-400 font-bold text-xs uppercase">Mainboard</span>
          </div>
          <div className="text-white font-bold text-[13px] leading-tight mb-2 min-h-[30px]">
            {netInfo.Motherboard || '-'}
          </div>
        </div>

        {/* Storage */}
        <div className="bg-[#4a3613] bg-opacity-30 p-3 rounded-lg border border-yellow-900/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="text-yellow-400 font-bold text-xs uppercase">Storage</span>
          </div>
          <div className="text-white font-bold text-[13px] leading-tight mb-2 min-h-[30px]">
            {netInfo.Storage || '-'}
          </div>
          <div className="text-[11px] text-gray-300">
            Load: <span className="text-yellow-500 font-bold">{netInfo.disk_load || '0'}%</span>
          </div>
        </div>

        {/* Network */}
        <div className="bg-[#113f47] bg-opacity-30 p-3 rounded-lg border border-cyan-900/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-cyan-400 font-bold text-xs uppercase">Network</span>
          </div>
          <div className="text-white font-bold text-[13px] leading-tight mb-2 min-h-[30px]">
            {netInfo.Network || 'Ethernet'}
          </div>
          <div className="text-[11px] text-gray-300">
            Download: <span className="text-green-400 font-bold">{netDownload}</span>
          </div>
          <div className="text-[11px] text-gray-300">
            Upload: <span className="text-blue-400 font-bold">{netUpload}</span>
          </div>
        </div>

      </div>

      <div className="h-[1px] w-full bg-gray-700 mb-6"></div>

      <h3 className="text-white font-bold text-base mb-4">Thông tin nhóm máy</h3>
      <div className="flex flex-col gap-3">
        <div className="flex items-center">
          <span className="text-gray-400 w-28 text-[13px]">Nhóm máy:</span>
          <span className="text-white font-bold text-[13px] uppercase">{machineGroupName}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400 w-28 text-[13px]">Giá/giờ:</span>
          <span className="text-green-500 font-bold text-[13px]">
            {pricePerHour.toLocaleString('vi-VN')} VNĐ
          </span>
        </div>
        {computer?.macAddress && (
          <div className="flex items-center">
            <span className="text-gray-400 w-28 text-[13px]">MAC Address:</span>
            <span className="text-cyan-400 font-mono font-bold text-[13px]">{computer.macAddress}</span>
          </div>
        )}
      </div>
    </div>
  );

  const Tab2Content = () => {
    const isCombo = computer?.userType === 5;
    const isMember = computer?.userType === 2 || (computer?.userType >= 6 && computer?.userType <= 9);
    const userTypeName = isCombo ? 'Combo' : computer?.userType === 1 ? 'Khách' : isMember ? 'Hội viên' : 'Giao dịch viên';
    const displayName = isCombo ? 'Combo' : (computer?.userName || 'Không xác định');
    const checkIn = computer?.availableCheckIn || computer?.totalCheckIn || 0;
    const round = computer?.round || 0;
    const stars = computer?.stars || 0;
    const magicStone = computer?.magicStone || 0;
    const hasBattlePass = computer?.battlePass?.isUsed;
    const isUseApp = computer?.isUseApp !== false;
    const note = computer?.note || 'Không có ghi chú';

    // Use latest history record for device status (matches "Lịch sử máy" tab)
    const histories = (computer?.devices?.[0]?.histories || []).filter(Boolean);
    const latestHistory = histories[0] || {};
    const device = {
      monitorStatus: latestHistory.monitorStatus,
      keyboardStatus: latestHistory.keyboardStatus,
      mouseStatus: latestHistory.mouseStatus,
      headphoneStatus: latestHistory.headphoneStatus,
      chairStatus: latestHistory.chairStatus,
      networkStatus: latestHistory.networkStatus,
    };

    const getStatusDisplay = (statusVal?: string) => {
      const s = statusVal || 'GOOD';
      if (s === 'GOOD') return { text: 'Tốt', color: 'text-green-500' };
      if (s === 'DAMAGED_BUT_USABLE') return { text: 'Xài tạm', color: 'text-yellow-500' };
      return { text: 'Lỗi', color: 'text-red-500' };
    };

    const monitor = getStatusDisplay(device.monitorStatus);
    const keyboard = getStatusDisplay(device.keyboardStatus);
    const mouse = getStatusDisplay(device.mouseStatus);
    const headphone = getStatusDisplay(device.headphoneStatus);
    const chair = getStatusDisplay(device.chairStatus);
    const network = getStatusDisplay(device.networkStatus);

    return (
      <div className="mt-4">
        <h3 className="text-white font-bold text-base mb-4">Thông tin cơ bản</h3>
        
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-[13px] w-1/3">Trạng thái:</span>
            <span className="text-purple-400 font-bold text-[13px] w-2/3">{userTypeName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-[13px] w-1/3">Tên người dùng:</span>
            <span className="text-white font-bold text-[13px] w-2/3">{displayName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-[13px] w-1/3">ID người dùng:</span>
            <span className="text-orange-400 font-bold text-[13px] w-2/3">{computer?.userId || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-[13px] w-1/3">Điểm danh:</span>
            <span className="text-purple-400 font-bold text-[13px] w-2/3">{checkIn.toLocaleString('vi-VN')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-[13px] w-1/3">Lượt quay:</span>
            <span className="text-blue-400 font-bold text-[13px] w-2/3">{round.toLocaleString('vi-VN')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-[13px] w-1/3">Stars:</span>
            <span className="text-yellow-500 font-bold text-[13px] w-2/3">⭐ {stars.toLocaleString('vi-VN')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-[13px] w-1/3">Magic Stone:</span>
            <span className="text-green-500 font-bold text-[13px] w-2/3">💎 {magicStone.toLocaleString('vi-VN')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-[13px] w-1/3">Battle Pass:</span>
            <span className="text-gray-500 font-bold text-[13px] w-2/3">{hasBattlePass ? 'Đang tham gia' : 'Chưa tham gia'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-[13px] w-1/3">Quan tâm App:</span>
            <span className="text-white font-bold text-[13px] w-2/3 flex items-center gap-2">
              <Checkbox 
                checked={localIsUseApp} 
                onChange={handleUpdateIsUseApp} 
                className="custom-dark-checkbox" 
                disabled={!computer.userId}
              /> Có
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-[13px] w-1/3">Ghi chú:</span>
            <span className="text-white font-bold text-[13px] w-2/3 flex items-center justify-between">
              <span className="truncate">{localNote}</span>
              {!!computer.userId && (
                <EyeOutlined className="text-gray-400 cursor-pointer hover:text-white ml-2 shrink-0" onClick={() => setShowNoteModal(true)} />
              )}
            </span>
          </div>
        </div>

        <div className="h-[1px] w-full bg-gray-700 mb-6"></div>

        <h3 className="text-white font-bold text-base mb-4">Trạng thái thiết bị</h3>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 w-1/2`}>
              <DesktopOutlined className={`${monitor.color}`} />
              <span className="text-white text-[13px]">Màn hình</span>
            </div>
            <span className={`w-1/2 font-medium text-[13px] ${monitor.color}`}>{monitor.text}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 w-1/2`}>
              <AppstoreOutlined className={`${keyboard.color}`} />
              <span className="text-white text-[13px]">Bàn phím</span>
            </div>
            <span className={`w-1/2 font-medium text-[13px] ${keyboard.color}`}>{keyboard.text}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 w-1/2`}>
              <ControlOutlined className={`${mouse.color}`} />
              <span className="text-white text-[13px]">Chuột</span>
            </div>
            <span className={`w-1/2 font-medium text-[13px] ${mouse.color}`}>{mouse.text}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 w-1/2`}>
              <CustomerServiceOutlined className={`${headphone.color}`} />
              <span className="text-white text-[13px]">Tai nghe</span>
            </div>
            <span className={`w-1/2 font-medium text-[13px] ${headphone.color}`}>{headphone.text}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 w-1/2`}>
              <SkinOutlined className={`${chair.color}`} />
              <span className="text-white text-[13px]">Ghế</span>
            </div>
            <span className={`w-1/2 font-medium text-[13px] ${chair.color}`}>{chair.text}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 w-1/2`}>
              <WifiOutlined className={`${network.color}`} />
              <span className="text-white text-[13px]">Mạng</span>
            </div>
            <span className={`w-1/2 font-medium text-[13px] ${network.color}`}>{network.text}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button danger type="primary" className="border-none font-medium px-6" onClick={() => setShowReportModal(true)}>Báo hỏng</Button>
          <Button type="primary" className="bg-blue-600 border-none font-medium px-6" onClick={() => setShowUpdateModal(true)}>Sửa chữa</Button>
        </div>
      </div>
    );
  };

  const Tab3Content = () => {
    const histories = (computer?.devices?.[0]?.histories || []).filter(Boolean);
    const latestReport = histories.find((h: any) => h.type === 'REPORT');
    const latestRepair = histories.find((h: any) => h.type === 'REPAIR');

    const formatDate = (dateString?: string) => {
      if (!dateString) return 'Không xác định';
      return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusDisplay = (statusVal?: string) => {
      const s = statusVal || 'GOOD'; 
      if (s === 'GOOD') return { text: 'Tốt', color: 'text-green-500' };
      if (s === 'DAMAGED_BUT_USABLE') return { text: 'Xài tạm', color: 'text-yellow-500' };
      return { text: 'Lỗi', color: 'text-red-500' }; 
    };

    const renderDeviceStatus = (history: any) => {
      const monitor = getStatusDisplay(history?.monitorStatus);
      const keyboard = getStatusDisplay(history?.keyboardStatus);
      const mouse = getStatusDisplay(history?.mouseStatus);
      const headphone = getStatusDisplay(history?.headphoneStatus);
      const chair = getStatusDisplay(history?.chairStatus);
      const network = getStatusDisplay(history?.networkStatus);
      const comp = getStatusDisplay(history?.computerStatus);

      return (
        <div className="mt-4 border-t border-gray-600 pt-4">
          <div className="mb-4">
            <span className="text-white font-bold">Thời gian:</span>{' '}
            <span className="text-gray-200">{formatDate(history?.createdAt)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <div className="flex items-center gap-2">
              <DesktopOutlined className="text-gray-400" />
              <span className="text-white text-[13px] w-20">Màn hình:</span>
              <span className={`text-[13px] ${monitor.color}`}>{monitor.text}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <AppstoreOutlined className="text-gray-400" />
              <span className="text-white text-[13px] w-20">Bàn phím:</span>
              <span className={`text-[13px] ${keyboard.color}`}>{keyboard.text}</span>
            </div>

            <div className="flex items-center gap-2">
              <ControlOutlined className="text-gray-400" />
              <span className="text-white text-[13px] w-20">Chuột:</span>
              <span className={`text-[13px] ${mouse.color}`}>{mouse.text}</span>
            </div>

            <div className="flex items-center gap-2">
              <CustomerServiceOutlined className="text-gray-400" />
              <span className="text-white text-[13px] w-20">Tai nghe:</span>
              <span className={`text-[13px] ${headphone.color}`}>{headphone.text}</span>
            </div>

            <div className="flex items-center gap-2">
              <SkinOutlined className="text-gray-400" />
              <span className="text-white text-[13px] w-20">Ghế:</span>
              <span className={`text-[13px] ${chair.color}`}>{chair.text}</span>
            </div>

            <div className="flex items-center gap-2">
              <WifiOutlined className="text-gray-400" />
              <span className="text-white text-[13px] w-20">Mạng:</span>
              <span className={`text-[13px] ${network.color}`}>{network.text}</span>
            </div>
            
            <div className="flex items-center gap-2 col-span-2">
              <DesktopOutlined className="text-gray-400" />
              <span className="text-white text-[13px] w-20">Máy tính:</span>
              <span className={`text-[13px] ${comp.color}`}>{comp.text}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 text-[13px]">
            <span className="text-white font-bold">Mô tả:</span>{' '}
            <span className="text-gray-300">{history?.issue || "Không có mô tả"}</span>
          </div>
        </div>
      );
    };

    return (
      <div className="mt-4 flex flex-col gap-4">
        {/* Report Block */}
        <div className="bg-[#1f2937] p-4 rounded-lg border-l-4 border-l-red-500 border border-transparent border-t-gray-700 border-r-gray-700 border-b-gray-700 shadow-md">
          <h3 className="text-red-500 font-bold text-[16px] mb-2">Báo hỏng mới nhất</h3>
          {latestReport ? (
            renderDeviceStatus(latestReport)
          ) : (
            <div className="text-gray-400 mt-4 border-t border-gray-600 pt-4">Không có dữ liệu</div>
          )}
        </div>

        {/* Repair Block */}
        <div className="bg-[#1f2937] p-4 rounded-lg border-l-4 border-l-blue-500 border border-transparent border-t-gray-700 border-r-gray-700 border-b-gray-700 shadow-md">
          <h3 className="text-[#3b82f6] font-bold text-[16px] mb-2">Sửa chữa mới nhất</h3>
          {latestRepair ? (
            renderDeviceStatus(latestRepair)
          ) : (
            <div className="text-gray-400 mt-4 border-t border-gray-600 pt-4">Không có dữ liệu</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Drawer
      title={<span className="text-white">Chi tiết máy {computer.name}</span>}
      placement="right"
      width={600}
      onClose={onClose}
      open={open}
      styles={{
        header: { background: '#1f2937', borderBottom: '1px solid #374151' },
        body: { background: '#1f2937', padding: '0' },
        mask: { background: 'rgba(0, 0, 0, 0.6)' }
      }}
      closeIcon={<span className="text-gray-400 font-bold">✕</span>}
    >
      <div className="px-6 py-2 text-white">
        <Tabs 
          defaultActiveKey="1"
          className="config-tabs-dark custom-drawer-tabs"
          items={[
            {
              key: '1',
              label: <span className="px-4 py-1">Thông tin máy</span>,
              children: <Tab1Content />
            },
            {
              key: '2',
              label: <span className="px-4 py-1">Thông tin cơ bản</span>,
              children: <Tab2Content />
            },
            {
              key: '3',
              label: <span className="px-4 py-1">Lịch sử máy</span>,
              children: <Tab3Content />
            }
          ]}
        />
      </div>

      <style>{`
        .custom-drawer-tabs .ant-tabs-nav::before {
          border-bottom: 1px solid #374151 !important;
        }
        .custom-drawer-tabs .ant-tabs-tab {
          padding: 8px 0;
          color: #9ca3af;
        }
        .custom-drawer-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #f97316 !important;
          background-color: #fb923c33;
          border-radius: 6px;
        }
        .custom-drawer-tabs .ant-tabs-ink-bar {
          display: none;
        }
        .custom-dark-checkbox .ant-checkbox-inner {
          background-color: transparent;
          border-color: #4b5563;
        }
        .custom-dark-checkbox.ant-checkbox-wrapper:hover .ant-checkbox-inner,
        .custom-dark-checkbox:hover .ant-checkbox-inner {
          border-color: #1677ff;
        }
      `}</style>

      {/* Report Issue Modal */}
      <Modal
        title={<span className="text-white">Báo cáo sự cố thiết bị</span>}
        open={showReportModal}
        onCancel={() => {
          setShowReportModal(false);
          reportForm.resetFields();
        }}
        footer={null}
        width={900}
        styles={{
          header: { background: "#1f2937", color: "white", borderBottom: "1px solid #374151", paddingBottom: "12px" },
          body: { background: "#1f2937", padding: "20px" },
          mask: { background: "rgba(0, 0, 0, 0.6)" },
        }}
      >
        <Form
          form={reportForm}
          layout="vertical"
          onFinish={handleReportSubmit}
          className="text-gray-200"
          initialValues={{
            monitorStatus: computer?.device?.monitorStatus || "GOOD",
            keyboardStatus: computer?.device?.keyboardStatus || "GOOD",
            mouseStatus: computer?.device?.mouseStatus || "GOOD",
            headphoneStatus: computer?.device?.headphoneStatus || "GOOD",
            chairStatus: computer?.device?.chairStatus || "GOOD",
            networkStatus: computer?.device?.networkStatus || "GOOD",
          }}
        >
          <div className="space-y-4">
            {deviceList.map((device) => (
              <div key={device.key} className="border-b border-gray-700 pb-4 last:border-b-0">
                <div className="flex items-center gap-2 mb-2">
                  {device.icon}
                  <span className="text-sm font-medium">{device.label}</span>
                </div>
                <Form.Item name={`${device.key}Status`} className="mb-0">
                  <Radio.Group className="w-full">
                    <div className="grid grid-cols-3 gap-4">
                      {deviceStatusOptions.map((status) => (
                        <Radio key={status.value} value={status.value}>
                          <span className={`${status.color} text-sm`}>{status.label}</span>
                        </Radio>
                      ))}
                    </div>
                  </Radio.Group>
                </Form.Item>
              </div>
            ))}
          </div>

          <Form.Item label={<span className="text-gray-200">Ghi chú (Tùy chọn)</span>} name="note" className="mb-0 mt-6">
            <Input.TextArea placeholder="Mô tả chi tiết vấn đề..." rows={3} className="bg-gray-800 text-white border-gray-600" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-700">
            <Button onClick={() => setShowReportModal(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-red-600 hover:bg-red-700 border-none">Gửi báo cáo</Button>
          </div>
        </Form>
      </Modal>

      {/* Repair Issue Modal */}
      <Modal
        title={<span className="text-white">Cập nhật thiết bị sau sửa chữa</span>}
        open={showUpdateModal}
        onCancel={() => {
          setShowUpdateModal(false);
          updateForm.resetFields();
        }}
        footer={null}
        width={900}
        styles={{
          header: { background: "#1f2937", color: "white", borderBottom: "1px solid #374151", paddingBottom: "12px" },
          body: { background: "#1f2937", padding: "20px" },
          mask: { background: "rgba(0, 0, 0, 0.6)" },
        }}
      >
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdateDeviceStatus}
          className="text-gray-200"
          initialValues={{
            monitorStatus: computer?.device?.monitorStatus || "GOOD",
            keyboardStatus: computer?.device?.keyboardStatus || "GOOD",
            mouseStatus: computer?.device?.mouseStatus || "GOOD",
            headphoneStatus: computer?.device?.headphoneStatus || "GOOD",
            chairStatus: computer?.device?.chairStatus || "GOOD",
            networkStatus: computer?.device?.networkStatus || "GOOD",
          }}
        >
          <div className="space-y-4">
            {deviceList.map((device) => (
              <div key={device.key} className="border-b border-gray-700 pb-4 last:border-b-0">
                <div className="flex items-center gap-2 mb-2">
                  {device.icon}
                  <span className="text-sm font-medium">{device.label}</span>
                </div>
                <Form.Item name={`${device.key}Status`} className="mb-0">
                  <Radio.Group className="w-full">
                    <div className="grid grid-cols-3 gap-4">
                      {deviceStatusOptions.map((status) => (
                        <Radio key={status.value} value={status.value}>
                          <span className={`${status.color} text-sm`}>{status.label}</span>
                        </Radio>
                      ))}
                    </div>
                  </Radio.Group>
                </Form.Item>
              </div>
            ))}
          </div>

          <Form.Item label={<span className="text-gray-200">Ghi chú sửa chữa</span>} name="note" className="mb-0 mt-6">
            <Input.TextArea placeholder="Mô tả kết quả sửa chữa..." rows={3} className="bg-gray-800 text-white border-gray-600" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-700">
            <Button onClick={() => setShowUpdateModal(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-700 border-none">Xác nhận sửa</Button>
          </div>
        </Form>
      </Modal>

      {/* Note Modal */}
      <Modal
        title={<span className="text-white">Chỉnh sửa ghi chú</span>}
        open={showNoteModal}
        onCancel={() => setShowNoteModal(false)}
        footer={null}
        width={600}
        styles={{
          header: { background: "#1f2937", color: "white", borderBottom: "1px solid #374151" },
          body: { background: "#1f2937", padding: "20px" },
          mask: { background: "rgba(0, 0, 0, 0.6)" },
        }}
      >
        <div className="flex flex-col gap-4">
          <Input.TextArea
            value={editedNote}
            onChange={(e) => setEditedNote(e.target.value)}
            rows={6}
            className="bg-gray-800 text-white border-gray-600"
            placeholder="Nhập ghi chú chi tiết..."
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setShowNoteModal(false)}>Hủy</Button>
            <Button type="primary" onClick={handleUpdateNoteModal} className="bg-blue-600 hover:bg-blue-700 border-none">Lưu Ghi Chú</Button>
          </div>
        </div>
      </Modal>
    </Drawer>
  );
};

export default ComputerDetailDrawer;
