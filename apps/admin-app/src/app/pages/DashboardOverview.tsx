import React, { useState, useEffect, useRef } from 'react';
import { Button, message, Drawer, Tabs, Select, Radio } from 'antd';
import { UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import ComputerCard from '../components/ComputerCard';
import ComputerDetailDrawer from '../components/ComputerDetailDrawer';
import PanContainer from '../components/PanContainer';
// @ts-expect-error type resolution issue
import RGL, { WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(RGL);

const EnumComputerStatus = {
  READY: 1,
  OFF: 2,
  ON: 3
};

const DashboardOverview: React.FC = () => {
  const [computers, setComputers] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [layouts, setLayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(90);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentComputer, setCurrentComputer] = useState<any | undefined>();
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchComputers = async () => {
    setLoading(true);
    try {
      const [compRes, zoneRes, layoutRes] = await Promise.all([
        apiClient.get('/computer').catch(() => ({ data: [] })),
        apiClient.get('/layout/zones').catch(() => ({ data: [] })),
        apiClient.get('/layout/computers').catch(() => ({ data: [] }))
      ]);
      // Sort naturally, or just by name
      const sorted = (compRes.data || []).sort((a: any, b: any) => a.name?.localeCompare(b.name));
      setComputers(sorted);
      setZones(zoneRes.data || []);
      setLayouts(layoutRes.data || []);
      setCountdown(90);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComputers();

    // Setup polling every 90s
    const interval = setInterval(() => {
      fetchComputers();
    }, 90000);

    return () => clearInterval(interval);
  }, []);

  // Ensure currentComputer stays in sync with live DB updates when the drawer is open
  useEffect(() => {
    if (showDetailDrawer && currentComputer) {
      const live = computers.find(c => c.name === currentComputer.name);
      if (live) {
        // Deep compare or just set directly to ensure data consistency
        setCurrentComputer((prev: any) => ({ ...prev, ...live }));
      }
    }
  }, [computers, showDetailDrawer]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const total = computers.length;
  const countReady = computers.filter((c) => Number(c.status) === EnumComputerStatus.READY).length;
  const countOn = computers.filter((c) => Number(c.status) === EnumComputerStatus.ON && c.userType !== 5).length;
  const countOff = computers.filter((c) => Number(c.status) !== EnumComputerStatus.READY && Number(c.status) !== EnumComputerStatus.ON).length;
  const countCombo = computers.filter((c) => c.userType === 5).length;
  const countActive = countOn + countCombo;

  const mergedComputers = React.useMemo(() => {
    return computers.map((c, index) => {
      const layoutData = layouts.find((l: any) => l.computerName === c.name);

      return {
        ...c,
        zoneId: layoutData?.zoneId || null,
        layout: layoutData?.layout || null,
      };
    });
  }, [computers, layouts]);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-100px)] pt-2 pb-6">
      <div className="shadow-xl rounded-xl w-full h-full flex flex-col overflow-hidden bg-gray-800 border border-gray-700 px-6 pt-4 pb-2 relative">
        
        {/* Header Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 shrink-0 mb-2 bg-gray-800 z-10 pb-4 border-b border-gray-700">
          <div className="flex flex-1 items-center justify-between flex-wrap gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <Select 
                value={activeTab} 
                onChange={(val) => {
                  setActiveTab(val);
                  if (val === 'all' || isMobile) setViewMode('list');
                }} 
                className="w-full sm:w-[250px]"
                options={[
                  { value: 'all', label: 'Tất cả máy (Danh sách)' },
                  ...zones.map(z => ({ value: String(z.id), label: z.name }))
                ]}
              />
              {!isMobile && activeTab !== 'all' && (
                <Radio.Group 
                  className="shrink-0 hidden lg:inline-flex"
                  value={viewMode} 
                  onChange={(e) => setViewMode(e.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value="grid" aria-label="Sơ đồ"><AppstoreOutlined /> Sơ đồ</Radio.Button>
                  <Radio.Button value="list" aria-label="Danh sách"><UnorderedListOutlined /> Danh sách</Radio.Button>
                </Radio.Group>
              )}
            </div>
            
            <div className="flex items-center gap-5 flex-wrap text-sm">
              <div className="text-gray-300">Dữ liệu sẽ cập nhật sau: {countdown}s</div>
              <div className="text-[#06b6d4] font-bold">Hoạt động: {countActive}/{total}</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#f97316]"></div>
                <span className="text-gray-300">Đang khởi động ({countReady})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>
                <span className="text-gray-300">Đang sử dụng ({countOn})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#a855f7]"></div>
                <span className="text-gray-300">Combo ({countCombo})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#9ca3af]"></div>
                <span className="text-gray-300">Máy tắt ({countOff})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Computer Grid */}
        <div className="flex-1 min-h-0 relative">
          {(activeTab === 'all' || viewMode === 'list' || isMobile) ? (
            <div className="flex flex-wrap justify-start items-start gap-2 h-full overflow-y-auto content-start pr-1 sm:pr-2">
            {loading ? (
              Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg bg-gray-700/60 border border-gray-600/40"
                  style={{ width: 90, height: 72 }}
                />
              ))
            ) : (
              <>
                {(activeTab === 'all' ? mergedComputers : mergedComputers.filter(c => String(c.zoneId) === activeTab)).map((item, index) => (
                  <ComputerCard
                    key={item.name || index}
                    computer={item}
                    onClick={() => {
                      setCurrentComputer(item);
                      setShowDetailDrawer(true);
                    }}
                  />
                ))}
                {(activeTab === 'all' ? mergedComputers : mergedComputers.filter(c => String(c.zoneId) === activeTab)).length === 0 && (
                  <div className="w-full py-20 text-center text-gray-500">
                    Không có dữ liệu máy tính
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          (() => {
            const z = zones.find(z => String(z.id) === activeTab);
            if (!z) return null;
            const zoneComputers = mergedComputers.filter(c => c.zoneId === z.id);
            const gridLayouts = zoneComputers.map((c, index) => {
              const l = c.layout || { x: (index * 3) % 24, y: Math.floor(index / 8) * 3, w: 3, h: 3 };
              const isLegacy = l.w === 2 && l.h === 2;
              return {
                i: c.name,
                x: isLegacy ? Math.round((l.x / 2) * 3) : l.x,
                y: isLegacy ? Math.round((l.y / 2) * 3) : l.y,
                w: 3,
                h: 3,
                isResizable: false,
                isDraggable: false,
              };
            });

            const maxRight = Math.max(0, ...gridLayouts.map((l: any) => l.x + l.w));
            let dynamicCols = 36;
            while (dynamicCols < maxRight + 4) {
              dynamicCols += 12;
            }
            const dynamicWidth = Math.round((dynamicCols * 920) / 24) + (dynamicCols - 1) * 10;

            const maxBottom = Math.max(0, ...gridLayouts.map((l: any) => l.y + l.h));
            let dynamicRows = 36;
            while (dynamicRows < maxBottom + 3) {
              dynamicRows += 6;
            }
            const dynamicHeight = dynamicRows * 34 + (dynamicRows - 1) * 10;

            return (
              <div key={z.id} className="w-full h-full bg-gray-900 rounded border border-gray-700">
                <PanContainer width={`${dynamicWidth}px`} minHeight={`${Math.max(dynamicHeight, 2400)}px`} className="w-full h-full rounded">
                  <ResponsiveGridLayout
                    className="layout"
                    layout={gridLayouts}
                    cols={dynamicCols}
                    rowHeight={34}
                    compactType={null}
                    preventCollision={true}
                    isDraggable={false}
                    isResizable={false}
                    style={{ minHeight: `${Math.max(dynamicHeight, 2400)}px`, width: `${dynamicWidth}px` }}
                  >
                    {zoneComputers.map(c => (
                      <div key={c.name}>
                          <ComputerCard
                            computer={c}
                            className="w-full h-full m-0"
                            onClick={() => {
                              setCurrentComputer(c);
                              setShowDetailDrawer(true);
                            }}
                          />
                      </div>
                    ))}
                  </ResponsiveGridLayout>
                  {zoneComputers.length === 0 && (
                    <div className="w-full absolute inset-y-[20%] text-center text-gray-500 pointer-events-none">
                      Khu vực này chưa có máy nào
                    </div>
                  )}
                </PanContainer>
              </div>
            );
          })()
        )}
        </div>
      </div>

      <ComputerDetailDrawer 
        computer={currentComputer} 
        open={showDetailDrawer} 
        onClose={() => setShowDetailDrawer(false)} 
        onUpdate={(updates) => {
          if (updates) {
             setCurrentComputer((prev: any) => {
                if (!prev) return prev;
                const newC = { ...prev, ...updates };
                if (updates.user) newC.user = { ...(prev.user || {}), ...updates.user };
                if (updates.device) newC.device = { ...(prev.device || {}), ...updates.device };
                if (updates.isUseApp !== undefined) newC.isUseApp = updates.isUseApp;
                if (updates.note !== undefined) newC.note = updates.note;
                return newC;
             });
             
             setComputers(prev => prev.map(c => {
               if (c.name === currentComputer?.name) {
                 const newC = { ...c, ...updates };
                 if (updates.user) newC.user = { ...(c.user || {}), ...updates.user };
                 if (updates.device) newC.device = { ...(c.device || {}), ...updates.device };
                 if (updates.isUseApp !== undefined) newC.isUseApp = updates.isUseApp;
                 if (updates.note !== undefined) newC.note = updates.note;
                 return newC;
               }
               return c;
             }));
          }
          fetchComputers();
        }}
      />
    </div>
  );
};

export default DashboardOverview;
