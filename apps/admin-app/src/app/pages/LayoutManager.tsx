import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, Button, Input, List, Select, message, Checkbox, Modal, Form, Typography, Popconfirm, Tabs } from 'antd';
import { PlusOutlined, SaveOutlined, DeleteOutlined, SwapRightOutlined } from '@ant-design/icons';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import RGL, { Layout, LayoutItem, WidthProvider } from 'react-grid-layout/legacy';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ComputerCard from '../components/ComputerCard';

const ResponsiveGridLayout = WidthProvider(RGL);
const { Title } = Typography;

interface Zone {
  id: number;
  name: string;
  description: string | null;
}

interface Computer {
  computerName: string;
  macAddress: string;
  groupName: string;
  zoneId: number | null;
  layout: { x: number; y: number; w: number; h: number } | null;
}

const LayoutManager: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [activeZoneId, setActiveZoneId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isNewZoneModalVisible, setIsNewZoneModalVisible] = useState(false);
  const [selectedMacs, setSelectedMacs] = useState<string[]>([]);
  const [dstZoneId, setDstZoneId] = useState<number | null>(null);
  const [form] = Form.useForm();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let isPanActive = false;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Tránh drag đè lên các item máy móc
      if (target.closest('.react-grid-item')) return;
      if (e.button === 0 || e.button === 1) {
        isPanActive = true;
        setIsPanning(true);
        startX = e.clientX;
        startY = e.clientY;
        startScrollLeft = el.scrollLeft;
        startScrollTop = el.scrollTop;
        console.log('PAN START:', { startX, startY, startScrollTop, startScrollLeft });
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPanActive) return;
      e.preventDefault();
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      // Update start coordinates for next tick
      startX = e.clientX;
      startY = e.clientY;
      
      // Find and precisely scroll the nearest vertically active container
      let yNode: HTMLElement | null = el;
      let scrolledY = false;
      while (yNode) {
        if (yNode.scrollHeight > yNode.clientHeight) {
          const prevY = yNode.scrollTop;
          yNode.scrollTop -= dy;
          if (yNode.scrollTop !== prevY) {
            scrolledY = true;
            break;
          }
        }
        if (yNode === document.documentElement || yNode === document.body) break;
        yNode = yNode.parentElement;
      }
      if (!scrolledY) window.scrollBy(0, -dy);

      // Find and precisely scroll the nearest horizontally active container
      let xNode: HTMLElement | null = el;
      let scrolledX = false;
      while (xNode) {
        if (xNode.scrollWidth > xNode.clientWidth) {
          const prevX = xNode.scrollLeft;
          xNode.scrollLeft -= dx;
          if (xNode.scrollLeft !== prevX) {
            scrolledX = true;
            break;
          }
        }
        if (xNode === document.documentElement || xNode === document.body) break;
        xNode = xNode.parentElement;
      }
      if (!scrolledX) window.scrollBy(-dx, 0);
      
      console.log('PAN TICK:', { dy, dx, currentScrollTop: yNode?.scrollTop, yScrolledNode: yNode?.tagName });
    };

    const onMouseUp = () => {
      if (isPanActive) {
        isPanActive = false;
        setIsPanning(false);
        console.log('PAN END');
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [activeZoneId]);

  const fetchZonesAndComputers = async () => {
    setLoading(true);
    try {
      const [zRes, cRes] = await Promise.all([
        apiClient.get('/layout/zones'),
        apiClient.get('/layout/computers?prefix=MAY')
      ]);
      setZones(zRes.data);
      setComputers(cRes.data);
      if (zRes.data.length > 0 && !activeZoneId) {
        setActiveZoneId(zRes.data[0].id);
      }
    } catch (err) {
      message.error('Lỗi khi tải dữ liệu sơ đồ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZonesAndComputers();
  }, []);

  const handleCreateZone = async (values: any) => {
    try {
      await apiClient.post('/layout/zones', values);
      message.success('Thêm khu vực thành công');
      setIsNewZoneModalVisible(false);
      form.resetFields();
      fetchZonesAndComputers();
    } catch (err) {
      message.error('Lỗi khi thêm khu vực');
    }
  };

  const handleDeleteZone = async (id: number) => {
    try {
      await apiClient.delete(`/layout/zones/${id}`);
      message.success('Xóa khu vực thành công');
      if (activeZoneId === id) setActiveZoneId(null);
      fetchZonesAndComputers();
    } catch (err) {
      message.error('Lỗi khi xóa khu vực');
    }
  };

  const handleMoveComputers = async () => {
    if (!dstZoneId) {
      message.warning('Vui lòng chọn khu vực đích');
      return;
    }
    if (selectedMacs.length === 0) {
      message.warning('Vui lòng chọn các máy cần di chuyển');
      return;
    }
    
    // Check if moving to "Unassigned" (null handling if implemented, or real zoneId)
    const isUnassign = dstZoneId === -1;
    const realZoneId = isUnassign ? null : dstZoneId;

    try {
      await apiClient.post('/layout/computers/move', { zoneId: realZoneId, macAddresses: selectedMacs });
      message.success('Chuyển máy thành công');
      setSelectedMacs([]);
      fetchZonesAndComputers();
    } catch (err) {
      message.error('Lỗi khi chuyển máy');
    }
  };

  // Convert computer data to react-grid-layout format
  const activeZoneComputers = useMemo(() => {
    if (!activeZoneId) return [];
    return computers.filter(c => c.zoneId === activeZoneId);
  }, [computers, activeZoneId]);

  const gridLayouts: LayoutItem[] = useMemo(() => activeZoneComputers.map((c, index) => {
      // Provide default position if null
      const l = c.layout || { x: (index * 3) % 24, y: Math.floor(index / 8) * 3, w: 3, h: 3 };
      const isLegacy = l.w === 2 && l.h === 2;
      return {
        i: c.macAddress,
        x: isLegacy ? Math.round((l.x / 2) * 3) : l.x,
        y: isLegacy ? Math.round((l.y / 2) * 3) : l.y,
        w: 3,
        h: 3,
        isResizable: false,
      };
    }), [activeZoneComputers]);

  const getGroupColor = (groupName: string) => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
    ];
    if (!groupName) return '#374151';
    let hash = 0;
    for (let i = 0; i < groupName.length; i++) {
        hash = groupName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const [currentLayout, setCurrentLayout] = useState<Layout>([]);
  const onLayoutChange = (layout: Layout) => {
    setCurrentLayout(layout);
  };

  const handleSaveLayout = async () => {
    if (!activeZoneId || currentLayout.length === 0) return;
    try {
      const payload = currentLayout.map(l => ({
        macAddress: l.i,
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
      }));
      await apiClient.post('/layout/layouts/save', { layouts: payload });
      message.success('Lưu cấu hình thành công!');
      fetchZonesAndComputers(); // Refresh
    } catch (err) {
      message.error('Lỗi khi lưu cấu hình');
    }
  };

  const onNodeDragStop = async (layout: Layout, oldItem: LayoutItem | null, newItem: LayoutItem | null, placeholder: LayoutItem | null, e: Event, element: HTMLElement | undefined) => {
    const clientX = (e as MouseEvent).clientX ?? (e as any).changedTouches?.[0]?.clientX;
    if (clientX !== undefined && clientX < 350 && newItem) {
      try {
        await apiClient.post('/layout/computers/move', { zoneId: null, macAddresses: [newItem.i] });
        message.success('Đã đưa máy về Danh sách chưa phân bổ');
        fetchZonesAndComputers();
      } catch (err) {
        message.error('Lỗi khi gỡ máy');
      }
    }
  };

  const onDropLayout = async (layout: Layout, layoutItem: LayoutItem | undefined, e: Event) => {
    const dragEvent = e as unknown as React.DragEvent;
    const macAddress = dragEvent.dataTransfer?.getData('text/plain');
    if (!macAddress || !activeZoneId || !layoutItem) return;
    
    // Check if it's already in the zone
    const computer = computers.find(c => c.macAddress === macAddress);
    if (computer && computer.zoneId === activeZoneId) return;

    try {
      // First, add it to the zone via API Move
      await apiClient.post('/layout/computers/move', { zoneId: activeZoneId, macAddresses: [macAddress] });
      // Then quickly set its exact layout via Save API so it lands right where dropped
      await apiClient.post('/layout/layouts/save', { 
        layouts: [{
          macAddress,
          x: layoutItem.x,
          y: layoutItem.y,
          w: 3,
          h: 3
        }] 
      });
      message.success('Đã thêm máy vào lưới');
      fetchZonesAndComputers();
    } catch (err) {
      message.error('Lỗi khi thêm máy vào lưới');
    }
  };

  const unassignedComputers = useMemo(() => computers.filter(c => !c.zoneId), [computers]);

  const maxRight = Math.max(
    0,
    ...gridLayouts.map(l => l.x + l.w),
    ...currentLayout.map(l => l.x + l.w)
  );
  let dynamicCols = 36;
  while (dynamicCols < maxRight + 4) {
    dynamicCols += 12;
  }
  const dynamicWidth = Math.round((dynamicCols * 920) / 24) + (dynamicCols - 1) * 10;

  const maxBottom = Math.max(
    0,
    ...gridLayouts.map(l => l.y + l.h),
    ...currentLayout.map(l => l.y + l.h)
  );
  let dynamicRows = 36;
  while (dynamicRows < maxBottom + 3) {
    dynamicRows += 6;
  }
  const dynamicHeight = dynamicRows * 34 + (dynamicRows - 1) * 10;

  return (
    <div className="flex h-full gap-4">
      {/* Left panel: Zones and Unassigned computers */}
      <div className="w-[350px] flex flex-col gap-4">
        <Card title="Các khu vực" size="small" className="bg-[#1f2937] text-white border-gray-700"
          extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setIsNewZoneModalVisible(true)}>Thêm</Button>}
          styles={{ body: { maxHeight: '260px', overflowY: 'auto' } }}>
          <List
            dataSource={zones}
            renderItem={item => (
              <List.Item
                style={{ background: activeZoneId === item.id ? '#374151' : 'transparent', cursor: 'pointer', padding: '10px' }}
                onClick={() => setActiveZoneId(item.id)}
                className="hover:bg-[#374151] rounded mb-1 border-b border-gray-700"
                actions={[
                  <Popconfirm title="Chắc chắn xóa?" onConfirm={() => handleDeleteZone(item.id)}>
                    <Button danger type="text" icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>
                ]}
              >
                <div className="font-bold text-white">{item.name}</div>
              </List.Item>
            )}
            locale={{ emptyText: <div className="text-gray-400">Chưa có khu vực nào</div> }}
          />
        </Card>

        <Card title="Danh sách máy" size="small" className="bg-[#1f2937] text-white border-gray-700 flex-1 flex flex-col"
          styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'hidden', padding: '12px' } }}>
          <div className="text-xs text-gray-400 block mb-2">Chưa phân bổ ({unassignedComputers.length} máy)</div>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 grid grid-cols-2 gap-3 auto-rows-max place-items-center">
            {unassignedComputers.map(c => (
              <div 
                key={c.macAddress}
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  e.dataTransfer.setData('text/plain', c.macAddress);
                }}
                className="cursor-move hover:scale-105 transition-transform"
                title="Kéo thả vào lưới bên phải để xếp máy"
                style={{ width: '140px', height: '120px' }}
              >
                <div className="pointer-events-none origin-top-left">
                  <ComputerCard 
                    computer={{
                      id: 0,
                      name: c.computerName,
                      status: 2, // OFF
                      userId: 0,
                      userName: '',
                      round: 0,
                      totalCheckIn: 0,
                      claimedCheckIn: 0,
                      availableCheckIn: 0,
                      stars: 0,
                      magicStone: 0,
                      devices: [{ monitorStatus: 'GOOD', keyboardStatus: 'GOOD', mouseStatus: 'GOOD', headphoneStatus: 'GOOD', chairStatus: 'GOOD', networkStatus: 'GOOD' } as any],
                      userType: 1,
                      isUseApp: false,
                    }}
                    onClick={() => {}}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right panel: Grid Layout */}
      <div className="flex-1 bg-[#1f2937] border border-gray-700 rounded p-4 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="!text-white !m-0">
            {activeZoneId ? zones.find(z => z.id === activeZoneId)?.name : 'Vui lòng chọn khu vực'}
            {activeZoneId && <span className="text-sm font-normal text-gray-400 ml-3 font-sans italic">- Click chuột phải vào máy để hủy phân bổ</span>}
          </Title>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveLayout} disabled={!activeZoneId || currentLayout.length === 0}>
            Lưu cấu hình Layout
          </Button>
        </div>

        {activeZoneId ? (
          <div 
            className={`flex-1 overflow-auto bg-gray-900 rounded border border-gray-700 p-2 select-none ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
            ref={scrollContainerRef}
          >
              <ResponsiveGridLayout
                className="layout"
                style={{ 
                  width: `${dynamicWidth}px`, 
                  minHeight: `${Math.max(dynamicHeight, 2400)}px`,
                  backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
                layout={gridLayouts}
                cols={dynamicCols}
                rowHeight={34}
                onLayoutChange={onLayoutChange}
                onDragStop={onNodeDragStop}
                compactType={null} 
                preventCollision
                isResizable={false}
                isDraggable
                isDroppable
                onDrop={onDropLayout}
                droppingItem={{ i: 'dropping-new', x: 0, y: 0, w: 3, h: 3 }}
              >
              {activeZoneComputers.map(c => (
                <div 
                  key={c.macAddress} 
                  className="cursor-move hover:brightness-110"
                  onContextMenu={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      await apiClient.post('/layout/computers/move', { zoneId: null, macAddresses: [c.macAddress] });
                      message.success(`Đã gỡ máy ${c.computerName} về kho Chưa phân bổ`);
                      fetchZonesAndComputers();
                    } catch (err) {
                      message.error('Lỗi khi gỡ máy');
                    }
                  }}
                >
                  <div className="pointer-events-none w-full h-full">
                    {/* Render a mock ComputerCard for visual reference */}
                    <ComputerCard 
                      computer={{
                        id: 0,
                        name: c.computerName,
                        status: 3, // ON
                        userId: 10000,
                        userName: 'PLAYER_1000',
                        round: 0,
                        totalCheckIn: 500,
                        claimedCheckIn: 0,
                        availableCheckIn: 500,
                        stars: 125000,
                        magicStone: 0,
                        devices: [{ monitorStatus: 'GOOD', keyboardStatus: 'GOOD', mouseStatus: 'GOOD', headphoneStatus: 'GOOD', chairStatus: 'GOOD', networkStatus: 'GOOD' } as any],
                        userType: 1,
                        isUseApp: true,
                        battlePass: { isUsed: true, isPremium: true, data: { level: 1, exp: 850 } },
                        machineDetails: { machineGroupName: c.groupName }
                      }}
                      onClick={() => {}}
                      className="w-full h-[120px] m-0"
                    />
                  </div>
                </div>
              ))}
            </ResponsiveGridLayout>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Chưa có khu vực nào được chọn
          </div>
        )}
      </div>

      <Modal
        title="Thêm khu vực mới"
        open={isNewZoneModalVisible}
        onCancel={() => setIsNewZoneModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateZone}>
          <Form.Item name="name" label="Tên khu vực" rules={[{ required: true, message: 'Vui lòng nhập tên khu vực' }]}>
            <Input placeholder="Ví dụ: Sân vườn, Lầu 1..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Nhập mô tả..." />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsNewZoneModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Xác nhận</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default LayoutManager;
