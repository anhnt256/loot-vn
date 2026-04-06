import React, { useState, useEffect, useMemo } from "react";
import { CloseOutlined, SendOutlined } from "@ant-design/icons";
import { Table, Button, Select, Form, Input, message, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { apiClient } from "@gateway-workspace/shared/utils/client";
import { 
  REPORT_TYPE_ENUM, 
  SHIFT_ENUM, 
  SHIFT_LABELS, 
  ShiftType 
} from "../constants";

interface SendReportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedReportType: string;
  onSuccess: () => void;
}

interface Staff {
  id: number;
  fullName: string;
  userName: string;
}

interface MaterialData {
  id: string; // usually ID from availableMaterials
  materialName: string;
  beginning?: number;
  received?: number;
  issued?: number;
  ending?: number;
}

export default function SendReportDrawer({
  isOpen,
  onClose,
  selectedDate,
  selectedReportType,
  onSuccess,
}: SendReportDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftType | null>(null);
  const [workShifts, setWorkShifts] = useState<any[]>([]);

  const [reportData, setReportData] = useState<any>(null);
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [step, setStep] = useState<'START' | 'END'>('START');

  useEffect(() => {
    if (isOpen) {
      if (!selectedDate || !selectedReportType) {
        message.warning("Vui lòng chọn ngày và loại báo cáo trước");
        onClose();
        return;
      }
      fetchStaffs();
      fetchWorkShifts();
      fetchReportData();
    } else {
      setSelectedStaff(null);
      setSelectedShift(null);
      setMaterials([]);
      setReportData(null);
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-select shift/staff if possible
    if (reportData && !selectedShift) {
       const metadata = reportData.submissionTracking?.metadata || {};
       
       // Try finding a shift that is already started but not ended yet
       const activeShift = (Object.values(SHIFT_ENUM) as ShiftType[]).find(s => 
          metadata[s]?.start && !metadata[s]?.end
       );

       if (activeShift) {
          setSelectedShift(activeShift);
          if (metadata[activeShift]?.start?.staffId) {
             setSelectedStaff(metadata[activeShift].start.staffId);
          }
       } else {
          // If none active, find first not started yet
          const nextShift = (Object.values(SHIFT_ENUM) as ShiftType[]).find(s => 
             !metadata[s]?.start
          );
          if (nextShift) setSelectedShift(nextShift);
       }
    }
  }, [reportData, selectedShift]);

  const fetchStaffs = async () => {
    try {
      const res = await apiClient.get<any>("/admin/handover-reports/staffs");
      if (res.data?.success) {
        setStaffs(res.data.data);
      }
    } catch (e) {
      console.error("Failed to load staffs", e);
    }
  };

  const fetchWorkShifts = async () => {
    try {
      const res = await apiClient.get<any>("/admin/handover-reports/work-shifts");
      if (res.data?.success) {
        setWorkShifts(res.data.data);
      }
    } catch (e) {
      console.error("Failed to load work shifts", e);
    }
  };

  // Map WorkShift name to SANG/CHIEU/TOI by keyword matching
  const SHIFT_NAME_KEYWORDS: Record<ShiftType, string[]> = {
    [SHIFT_ENUM.SANG]: ['sáng', 'sang'],
    [SHIFT_ENUM.CHIEU]: ['đêm', 'dem', 'chiều', 'chieu'],
    [SHIFT_ENUM.TOI]: ['tối', 'toi'],
  };

  const getWorkShiftForShift = (shift: ShiftType) => {
    const keywords = SHIFT_NAME_KEYWORDS[shift];
    return workShifts.find((ws: any) =>
      keywords.some((kw) => ws.name?.toLowerCase().includes(kw))
    ) || null;
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate ? selectedDate.toISOString().split("T")[0] : "";
      const res = await apiClient.get<any>(
        `/admin/handover-reports/get-report-data`,
        { params: { date: dateStr, reportType: selectedReportType } }
      );
      if (res.data?.success) {
        setReportData(res.data.data);
      } else {
         message.error("Lỗi khi tải dữ liệu báo cáo");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi gọi API");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-map staff when shift is selected based on WorkShift.staffId
  useEffect(() => {
    if (selectedShift && workShifts.length > 0 && staffs.length > 0) {
      const ws = getWorkShiftForShift(selectedShift);
      if (ws?.staffId) {
        const matched = staffs.find((s) => s.id === ws.staffId);
        if (matched) {
          setSelectedStaff(matched.id);
        }
      }
    }
  }, [selectedShift, workShifts, staffs]);

  useEffect(() => {
    if (reportData && selectedShift) {
      mapMaterialData(selectedShift);
    } else {
      setMaterials([]);
    }
  }, [reportData, selectedShift]);

  // Auto-fill Nhập/Xuất from InventoryTransaction when switching to END step
  useEffect(() => {
    if (step === 'END' && selectedShift && selectedDate && !getShiftCompleteStatus(selectedShift)) {
      fetchShiftInventorySummary();
    }
  }, [step, selectedShift]);

  const fetchShiftInventorySummary = async () => {
    try {
      const dateStr = selectedDate ? selectedDate.toISOString().split("T")[0] : "";
      const res = await apiClient.get<any>("/admin/handover-reports/shift-inventory-summary", {
        params: { date: dateStr, shift: selectedShift, reportType: selectedReportType }
      });

      if (res.data?.success && res.data.data.length > 0) {
        const summaryMap = new Map<number, { totalReceived: number; totalIssued: number }>(
          res.data.data.map((s: any) => [s.materialId, s])
        );

        setMaterials(prev => prev.map(m => {
          const summary = summaryMap.get(Number(m.id));
          if (summary) {
            const received = summary.totalReceived || 0;
            const issued = summary.totalIssued || 0;
            return {
              ...m,
              received: received > 0 ? received : (m.received || 0),
              issued: issued > 0 ? issued : (m.issued || 0),
            };
          }
          return m;
        }));
      }
    } catch (e) {
      console.error("Failed to fetch shift inventory summary", e);
    }
  };

  const getShiftSubmissionCount = (shift: ShiftType) => {
    if (!reportData?.submissionTracking) return 0;
    const tracking = reportData.submissionTracking;
    if (shift === SHIFT_ENUM.SANG) return tracking.morningSubmissionCount;
    if (shift === SHIFT_ENUM.CHIEU) return tracking.afternoonSubmissionCount;
    if (shift === SHIFT_ENUM.TOI) return tracking.eveningSubmissionCount;
    return 0;
  };

  const getShiftCompleteStatus = (shift: ShiftType) => {
    if (!reportData?.submissionTracking) return false;
    const tracking = reportData.submissionTracking;
    const metadata = tracking.metadata || {};
    return metadata[shift]?.end ? true : false;
  };

  const getShiftStartedStatus = (shift: ShiftType) => {
    if (!reportData?.submissionTracking) return false;
    const tracking = reportData.submissionTracking;
    const metadata = tracking.metadata || {};
    return metadata[shift]?.start ? true : false;
  };

  const mapMaterialData = (shift: ShiftType) => {
    if (!reportData) return;

    const {
       materials: { currentDay, availableMaterials, suggestedBeginning },
    } = reportData;

    const isStarted = getShiftStartedStatus(shift);
    const isEnded = getShiftCompleteStatus(shift);

    // Auto-select step based on status
    if (isEnded) setStep('END');
    else if (isStarted) setStep('END');
    else setStep('START');

    const mapped = availableMaterials.map((mat: any) => {
      let beginning = 0;
      let received: number | undefined = undefined;
      let issued: number | undefined = undefined;

      const currentDayMat = currentDay.find((m: any) => m.id === mat.id);
      
      if (isStarted || isEnded) {
         // Data already exists in DB for this shift
         let shiftData;
         if (shift === SHIFT_ENUM.SANG) shiftData = currentDayMat?.morning;
         else if (shift === SHIFT_ENUM.CHIEU) shiftData = currentDayMat?.afternoon;
         else shiftData = currentDayMat?.evening;

         beginning = shiftData?.beginning || 0;
         received = shiftData?.received;
         issued = shiftData?.issued;
      } else {
         // New shift - use suggested beginning
         const suggested = suggestedBeginning[shift]?.find((s: any) => s.id === mat.id);
         beginning = suggested?.ending || 0;
      }

      return {
        id: mat.id,
        materialName: mat.materialName,
        beginning,
        received,
        issued,
      };
    });

    setMaterials(mapped);
  };

  const handleMaterialChange = (id: string, field: "beginning" | "received" | "issued", value: string) => {
    const numericValue = value === "" ? 0 : parseFloat(value);

    if (numericValue < 0) {
      message.warning("Số lượng không được là số âm");
      return;
    }

    setMaterials((prev) => {
      const material = prev.find(m => m.id === id);
      if (!material) return prev;
      
      const newM = { ...material, [field]: numericValue };
      const beginning = newM.beginning || 0;
      const received = newM.received || 0;
      const issued = newM.issued || 0;
      
      const ending = beginning + received - issued;
      if (ending < 0) {
         message.error(`Tồn cuối của ${material.materialName} không thể âm (Hiện tại: ${ending}). Vui lòng kiểm tra lại số liệu Nhập/Xuất.`);
         return prev; // Discard the change
      }
      
      return prev.map((m) => (m.id === id ? newM : m));
    });
  };

  const handleSubmit = async () => {
    if (!selectedShift || !selectedStaff) {
       message.error("Vui lòng chọn ca và nhân viên");
       return;
    }

    const invalidMaterial = materials.find(
      (m) =>
        (m.received !== undefined && (isNaN(m.received) || m.received < 0)) ||
        (m.issued !== undefined && (isNaN(m.issued) || m.issued < 0))
    );

    if (invalidMaterial) {
      message.error(`Vui lòng nhập số liệu hợp lệ và không âm cho: ${invalidMaterial.materialName}`);
      return;
    }

    const negativeStockMaterial = materials.find((m) => {
      const beginning = m.beginning || 0;
      const received = m.received || 0;
      const issued = m.issued || 0;
      return beginning + received - issued < 0;
    });

    if (negativeStockMaterial) {
      message.error(`Tồn cuối của ${negativeStockMaterial.materialName} không thể âm`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
         date: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
         shift: selectedShift,
         reportType: selectedReportType,
         staffId: selectedStaff,
         step: step,
         materials: materials.map(m => ({
            id: m.id,
            materialName: m.materialName,
            beginning: m.beginning || 0,
            received: m.received || 0,
            issued: m.issued || 0
         }))
      };

      const res = await apiClient.post("/admin/handover-reports/submit-report", payload);
      if (res.data?.success) {
         message.success("Báo cáo bàn giao đã được gửi thành công");
         onSuccess();
         onClose();
      } else {
         message.error("Lỗi khi gửi báo cáo");
      }
    } catch (e: any) {
      console.error(e);
      message.error(e.response?.data?.message || "Có lỗi xảy ra khi gửi báo cáo");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<MaterialData> = useMemo(() => {
    const baseColumns: ColumnsType<MaterialData> = [
      {
        title: "STT",
        width: 60,
        render: (_, __, index) => index + 1,
      },
      {
        title: "Tên hàng",
        dataIndex: "materialName",
        key: "materialName",
      },
      {
        title: "Tồn đầu",
        dataIndex: "beginning",
        key: "beginning",
        width: 120,
        render: (val, record) => {
          const isEnded = selectedShift ? getShiftCompleteStatus(selectedShift) : false;
          const disabled = isEnded || step !== 'START';
          return (
            <Input 
               type="number"
               value={val}
               onChange={(e) => handleMaterialChange(record.id, "beginning", e.target.value)}
               disabled={disabled}
               className="bg-transparent text-white"
            />
          );
        },
      },
    ];

    if (step === 'END') {
      baseColumns.push(
        {
          title: "Nhập",
          dataIndex: "received",
          key: "received",
          width: 120,
          render: (val, record) => {
            const isEnded = selectedShift ? getShiftCompleteStatus(selectedShift) : false;
            const disabled = isEnded;
            return (
              <Input 
                 type="number"
                 value={val === undefined ? "" : val}
                 onChange={(e) => handleMaterialChange(record.id, "received", e.target.value)}
                 disabled={disabled}
                 placeholder="Nhập"
              />
            );
          }
        },
        {
          title: "Xuất/Hủy",
          dataIndex: "issued",
          key: "issued",
          width: 120,
          render: (val, record) => {
            const isEnded = selectedShift ? getShiftCompleteStatus(selectedShift) : false;
            const disabled = isEnded;
            return (
              <Input 
                 type="number"
                 value={val === undefined ? "" : val}
                 onChange={(e) => handleMaterialChange(record.id, "issued", e.target.value)}
                 disabled={disabled}
                 placeholder="Xuất/Hủy"
              />
            );
          }
        },
        {
          title: "Tồn cuối",
          key: "ending",
          width: 100,
          render: (_, record) => {
            const beginning = record.beginning || 0;
            const received = record.received || 0;
            const issued = record.issued || 0;
            return beginning + received - issued;
          }
        }
      );
    }

    return baseColumns;
  }, [step, selectedShift, reportData, materials]);

  const shiftOptions = (Object.values(SHIFT_ENUM) as ShiftType[]).map((shiftKey) => {
     const ws = getWorkShiftForShift(shiftKey);
     return {
       label: ws ? ws.name : SHIFT_LABELS[shiftKey],
       value: shiftKey,
     };
  });

  const staffOptions = staffs.map(st => ({
     label: st.fullName,
     value: st.id
  }));

  const isShiftEnded = selectedShift ? getShiftCompleteStatus(selectedShift) : false;
  const disableSubmit = !selectedShift || !selectedStaff || isShiftEnded;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-70 transition-opacity"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-gray-900 shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            Kê Khai Bàn Giao
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <CloseOutlined className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
           {loading ? (
              <div className="flex justify-center items-center h-full">
                 <Spin size="large" />
              </div>
           ) : (
              <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-300 mb-1">Ca làm việc</label>
                       <Select 
                          className="w-full"
                          placeholder="Chọn ca"
                          options={shiftOptions}
                          value={selectedShift}
                          onChange={(v) => setSelectedShift(v as ShiftType)}
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-300 mb-1">Nhân viên thực hiện</label>
                       <Select 
                          className="w-full"
                          placeholder="Chọn nhân viên"
                          options={staffOptions}
                          value={selectedStaff}
                          onChange={(v) => setSelectedStaff(v)}
                          showSearch
                          optionFilterProp="label"
                       />
                    </div>
                 </div>

                 {selectedShift && (
                    <div className="flex justify-center my-2 p-1 bg-gray-800 rounded-lg border border-gray-700">
                       <button
                          onClick={() => setStep('START')}
                          disabled={getShiftStartedStatus(selectedShift)}
                          className={`flex-1 py-2 px-4 rounded-md transition-all ${
                             step === 'START' 
                             ? 'text-white shadow-lg' 
                             : 'text-gray-400 hover:text-gray-200'
                          } ${getShiftStartedStatus(selectedShift) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={step === 'START' ? { backgroundColor: 'var(--primary-color)' } : {}}
                       >
                          1. Báo cáo Đầu ca
                       </button>
                       <button
                          onClick={() => setStep('END')}
                          disabled={!getShiftStartedStatus(selectedShift) || getShiftCompleteStatus(selectedShift)}
                          className={`flex-1 py-2 px-4 rounded-md transition-all ${
                             step === 'END' 
                             ? 'text-white shadow-lg' 
                             : 'text-gray-400 hover:text-gray-200'
                          } ${(!getShiftStartedStatus(selectedShift) || getShiftCompleteStatus(selectedShift)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={step === 'END' ? { backgroundColor: 'var(--primary-color)' } : {}}
                       >
                          2. Báo cáo Cuối ca
                       </button>
                    </div>
                 )}

                 {selectedShift && (
                    <div className="text-xs text-gray-400 flex justify-between px-2">
                       <span>{getShiftStartedStatus(selectedShift) ? `✅ Đã bắt đầu: ${reportData.submissionTracking?.metadata[selectedShift]?.start?.at ? new Date(reportData.submissionTracking.metadata[selectedShift].start.at).toLocaleTimeString() : ''}` : '⚪ Chưa bắt đầu'}</span>
                       <span>{getShiftCompleteStatus(selectedShift) ? `✅ Đã kết thúc: ${reportData.submissionTracking?.metadata[selectedShift]?.end?.at ? new Date(reportData.submissionTracking.metadata[selectedShift].end.at).toLocaleTimeString() : ''}` : '⚪ Chưa kết thúc'}</span>
                    </div>
                 )}

                 {selectedShift && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 mt-2 flex-1">
                       <Table 
                          columns={columns}
                          dataSource={materials}
                          rowKey="id"
                          pagination={false}
                          size="middle"
                          scroll={{ y: 'calc(100vh - 350px)' }}
                       />
                    </div>
                 )}
              </>
           )}
        </div>

        <div className="border-t border-gray-700 p-4 flex justify-end">
           <Button onClick={onClose} className="mr-3 text-white border-gray-600 hover:border-gray-500">
              Hủy
           </Button>
           <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSubmit} 
              loading={submitting}
              style={{ backgroundColor: 'var(--primary-color)' }}
              disabled={disableSubmit}
           >
              Gửi báo cáo
           </Button>
        </div>
      </div>
    </div>
  );
}
