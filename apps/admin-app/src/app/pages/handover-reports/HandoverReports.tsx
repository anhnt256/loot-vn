import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { SearchOutlined, DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { DatePicker, Select, Button, Table, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { apiClient } from "@gateway-workspace/shared/utils/client";

import { REPORT_TYPE_ENUM, REPORT_TYPE_LABELS, SHIFT_LABELS, SHIFT_ENUM, ReportType } from "./constants";
import SendReportDrawer from "./components/SendReportDrawer";

interface ReportData {
  id: number;
  date: string;
  reportType: ReportType;
  morningStaffName: string | null;
  afternoonStaffName: string | null;
  eveningStaffName: string | null;
  metadata?: Record<string, {
    start?: { at?: string };
    end?: { at?: string };
  }>;
  materials: {
    id: number;
    materialName: string;
    morning: { beginning: number; received: number; issued: number; ending: number };
    afternoon: { beginning: number; received: number; issued: number; ending: number };
    evening: { beginning: number; received: number; issued: number; ending: number };
  }[];
}

export default function HandoverReports() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedReportType, setSelectedReportType] = useState<ReportType>(
    REPORT_TYPE_ENUM.BAO_CAO_BEP
  );
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [workShifts, setWorkShifts] = useState<any[]>([]);

  const [isSendReportDrawerOpen, setIsSendReportDrawerOpen] = useState(false);

  const SHIFT_NAME_KEYWORDS: Record<string, string[]> = {
    [SHIFT_ENUM.SANG]: ['sáng', 'sang'],
    [SHIFT_ENUM.CHIEU]: ['đêm', 'dem', 'chiều', 'chieu'],
    [SHIFT_ENUM.TOI]: ['tối', 'toi'],
  };

  /** Map WorkShift name → SHIFT_ENUM key */
  const mapWorkShiftToEnum = (ws: any): string | null => {
    const name = ws.name?.toLowerCase() || '';
    for (const [enumKey, keywords] of Object.entries(SHIFT_NAME_KEYWORDS)) {
      if (keywords.some((kw) => name.includes(kw))) return enumKey;
    }
    return null;
  };

  /** Thứ tự logic: sáng → tối → đêm (SANG → TOI → CHIEU) */
  const sortedShifts: string[] = useMemo(() => {
    return [SHIFT_ENUM.SANG, SHIFT_ENUM.TOI, SHIFT_ENUM.CHIEU];
  }, []);

  const getWorkShiftName = (shift: string) => {
    const keywords = SHIFT_NAME_KEYWORDS[shift];
    const ws = workShifts.find((w: any) =>
      keywords?.some((kw) => w.name?.toLowerCase().includes(kw))
    );
    return ws?.name || SHIFT_LABELS[shift as keyof typeof SHIFT_LABELS];
  };

  const fetchReports = async () => {
    if (!selectedDate || !selectedReportType) return;
    
    setLoading(true);
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const res = await apiClient.get<any>("/admin/handover-reports", {
        params: {
          date: formattedDate,
          reportType: selectedReportType,
        },
      });
      if (res.data?.success) {
        setReports(res.data.data);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedDate, selectedReportType]);

  useEffect(() => {
    apiClient.get<any>("/admin/handover-reports/work-shifts").then((res) => {
      if (res.data?.success) setWorkShifts(res.data.data);
    }).catch(() => {});
  }, []);

  const handleExportCSV = () => {
    if (!reports || reports.length === 0) return;
    const report = reports[0];
    
    let csvContent = "";
    csvContent += `Báo cáo: ${REPORT_TYPE_LABELS[report.reportType]}\n`;
    csvContent += `Ngày: ${format(new Date(report.date), "dd/MM/yyyy")}\n\n`;
    
    const shiftStaffName = (shift: string) => {
      if (shift === SHIFT_ENUM.SANG) return report.morningStaffName;
      if (shift === SHIFT_ENUM.CHIEU) return report.afternoonStaffName;
      return report.eveningStaffName;
    };

    csvContent += "Nhân viên trực:\n";
    for (const shift of sortedShifts) {
      csvContent += `${getWorkShiftName(shift)}: ${shiftStaffName(shift) || "Chưa có"}\n`;
    }
    csvContent += "\n";

    csvContent += `Tên HH,${sortedShifts.map(s => `${getWorkShiftName(s)} (Tồn Đ,Nhập,Xuất/Hủy,Tồn C)`).join(',')}\n`;

    report.materials.forEach((mat: any) => {
      csvContent += `${mat.materialName},`;
      csvContent += sortedShifts.map(s => {
        const d = mat[shiftDataField(s)] || {};
        return `${d.beginning || 0},${d.received || 0},${d.issued || 0},${d.ending || 0}`;
      }).join(',');
      csvContent += '\n';
    });
    
    const blob = new Blob([`\ufeff${  csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bao_cao_${selectedReportType}_${format(selectedDate!, "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /** Map shift enum → data field name (morning/afternoon/evening) */
  const shiftDataField = (shift: string): string =>
    shift === SHIFT_ENUM.SANG ? 'morning' : shift === SHIFT_ENUM.CHIEU ? 'afternoon' : 'evening';

  const columns: ColumnsType<any> = useMemo(() => {
    const report = reports[0];
    const metadata = report?.metadata || {};

    const renderShiftCell = (shift: string, field: string, val: any, record: any) => {
      const isStarted = metadata[shift]?.start;
      const isEnded = metadata[shift]?.end;

      if (field === "beginning") {
         if (!isStarted) return "";

         const beginningVal = val || 0;
         let isDiff = false;

         // Compare with previous shift ending (based on sorted order)
         const idx = sortedShifts.indexOf(shift);
         if (idx > 0) {
            const prevShift = sortedShifts[idx - 1];
            const prevEnded = metadata[prevShift]?.end;
            if (prevEnded) {
               const prevField = shiftDataField(prevShift);
               if (beginningVal !== (record[prevField]?.ending || 0)) {
                  isDiff = true;
               }
            }
         }

         return (
            <span style={isDiff ? { color: '#ff4d4f', fontWeight: 'bold' } : {}}>
               {beginningVal}
            </span>
         );
      }

      // For received, issued, ending, only show if shift is ended
      return isEnded ? (val || 0) : "";
    };

    const shiftColumns = sortedShifts.map((shift, i) => {
      const dataField = shiftDataField(shift);
      const isLast = i === sortedShifts.length - 1;
      return {
        title: getWorkShiftName(shift),
        children: [
          { title: "Tồn Đ.", dataIndex: [dataField, "beginning"], width: 80, align: 'center' as const, render: (val: any, record: any) => renderShiftCell(shift, "beginning", val, record) },
          { title: "Nhập", dataIndex: [dataField, "received"], width: 80, align: 'center' as const, render: (val: any, record: any) => renderShiftCell(shift, "received", val, record) },
          { title: "Xuất", dataIndex: [dataField, "issued"], width: 80, align: 'center' as const, render: (val: any, record: any) => renderShiftCell(shift, "issued", val, record) },
          { title: "Tồn C.", dataIndex: [dataField, "ending"], width: 80, align: 'center' as const, className: !isLast ? 'border-r-2 border-r-gray-600' : '', render: (val: any, record: any) => renderShiftCell(shift, "ending", val, record) },
        ],
      };
    });

    return [
      {
        title: "Mặt hàng",
        dataIndex: "materialName",
        key: "materialName",
        width: 200,
        fixed: 'left' as const,
        className: 'border-r-2 border-r-gray-600',
      },
      ...shiftColumns,
    ];
  }, [reports, workShifts, sortedShifts]);

  return (
    <div className="p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-white">
          Kê Khai NVL / Báo Cáo
        </h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleExportCSV}
            icon={<DownloadOutlined />}
            disabled={!reports || reports.length === 0}
          >
            Xuất file File (CSV)
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsSendReportDrawerOpen(true)}
          >
            Kê khai bàn giao
          </Button>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-700 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Ngày
          </label>
          <DatePicker 
             className="w-full" 
             value={selectedDate ? dayjs(selectedDate) : null} 
             onChange={(d) => setSelectedDate(d ? d.toDate() : null)} 
             format="DD/MM/YYYY"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Loại Báo Cáo
          </label>
          <Select 
             className="w-full"
             value={selectedReportType}
             onChange={(v) => setSelectedReportType(v)}
             options={Object.values(REPORT_TYPE_ENUM).map(t => ({
                value: t,
                label: REPORT_TYPE_LABELS[t as ReportType]
             }))}
          />
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
        {loading ? (
           <div className="text-center py-10 text-white">Đang tải báo cáo...</div>
        ) : reports.length === 0 ? (
           <div className="text-center py-10 text-gray-400 font-medium text-lg">
             Chưa có dữ liệu báo cáo cho ngày này.
           </div>
        ) : (
           <div>
             <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {sortedShifts.map((shift) => {
                   const m = reports[0].metadata || {};
                   const startTime = m[shift]?.start?.at;
                   const endTime = m[shift]?.end?.at;
                   const staffName = shift === SHIFT_ENUM.SANG ? reports[0].morningStaffName :
                                    shift === SHIFT_ENUM.CHIEU ? reports[0].afternoonStaffName :
                                    reports[0].eveningStaffName;
                                    
                   return (
                      <div key={shift} className="p-3 bg-gray-900 border border-gray-700 rounded-md">
                         <div className="flex justify-between items-start mb-1">
                            <div className="text-sm text-gray-400">Người trực {getWorkShiftName(shift)}</div>
                            <div className="text-[11px] text-gray-400 italic flex flex-col items-end leading-tight">
                               <div>Đầu ca: <span className="text-white">{startTime ? format(new Date(startTime), "HH:mm:ss") : "--:--:--"}</span></div>
                               <div>Kết ca: <span className="text-white">{endTime ? format(new Date(endTime), "HH:mm:ss") : "--:--:--"}</span></div>
                            </div>
                         </div>
                         <div className="font-bold text-lg" style={{ color: 'var(--primary-color)' }}>
                            {staffName || "Chưa có"}
                         </div>
                      </div>
                   );
                })}
             </div>
             <Table 
                columns={columns} 
                dataSource={reports[0].materials} 
                rowKey="id" 
                pagination={false}
                bordered
                scroll={{ x: 'max-content' }}
                sticky={{ offsetHeader: 64 }}
             />
           </div>
        )}
      </div>


      <SendReportDrawer
        isOpen={isSendReportDrawerOpen}
        onClose={() => setIsSendReportDrawerOpen(false)}
        selectedDate={selectedDate}
        selectedReportType={selectedReportType}
        onSuccess={fetchReports}
      />
    </div>
  );
}
