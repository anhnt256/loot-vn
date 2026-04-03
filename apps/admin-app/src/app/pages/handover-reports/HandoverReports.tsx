import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { SearchOutlined, DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { DatePicker, Select, Button, Table, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import { REPORT_TYPE_ENUM, REPORT_TYPE_LABELS, SHIFT_LABELS, SHIFT_ENUM, ReportType } from "./constants";
import SendReportDrawer from "./components/SendReportDrawer";
import { apiClient } from "@gateway-workspace/shared/utils/client";

interface ReportData {
  id: number;
  date: string;
  reportType: ReportType;
  morningStaffName: string | null;
  afternoonStaffName: string | null;
  eveningStaffName: string | null;
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
  
  const [isSendReportDrawerOpen, setIsSendReportDrawerOpen] = useState(false);

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

  const handleExportCSV = () => {
    if (!reports || reports.length === 0) return;
    const report = reports[0];
    
    let csvContent = "";
    csvContent += `Báo cáo: ${REPORT_TYPE_LABELS[report.reportType]}\n`;
    csvContent += `Ngày: ${format(new Date(report.date), "dd/MM/yyyy")}\n\n`;
    
    csvContent += "Nhân viên trực:\n";
    csvContent += `Ca sáng: ${report.morningStaffName || "Chưa có"}\n`;
    csvContent += `Ca chiều: ${report.afternoonStaffName || "Chưa có"}\n`;
    csvContent += `Ca tối: ${report.eveningStaffName || "Chưa có"}\n\n`;
    
    csvContent += "Tên HH,Ca Sáng (Tồn Đ,Nhập,Xuất/Hủy,Tồn C),Ca Chiều (Tồn Đ,Nhập,Xuất/Hủy,Tồn C),Ca Tối (Tồn Đ,Nhập,Xuất/Hủy,Tồn C)\n";
    
    report.materials.forEach((mat) => {
      const { morning: m, afternoon: a, evening: e } = mat;
      csvContent += `${mat.materialName},`;
      csvContent += `${m.beginning || 0},${m.received || 0},${m.issued || 0},${m.ending || 0},`;
      csvContent += `${a.beginning || 0},${a.received || 0},${a.issued || 0},${a.ending || 0},`;
      csvContent += `${e.beginning || 0},${e.received || 0},${e.issued || 0},${e.ending || 0}\n`;
    });
    
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bao_cao_${selectedReportType}_${format(selectedDate!, "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
         
         // Compare with previous shift ending if available
         if (shift === SHIFT_ENUM.CHIEU) {
            const morningEnded = metadata[SHIFT_ENUM.SANG]?.end;
            if (morningEnded && beginningVal !== (record.morning?.ending || 0)) {
               isDiff = true;
            }
         } else if (shift === SHIFT_ENUM.TOI) {
            const afternoonEnded = metadata[SHIFT_ENUM.CHIEU]?.end;
            if (afternoonEnded && beginningVal !== (record.afternoon?.ending || 0)) {
               isDiff = true;
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

    return [
      {
        title: "Mặt hàng",
        dataIndex: "materialName",
        key: "materialName",
        width: 200,
        fixed: 'left',
        className: 'border-r-2 border-r-gray-600',
      },
      {
        title: 'Ca Sáng',
        children: [
           { title: "Tồn Đ.", dataIndex: ["morning", "beginning"], width: 80, align: 'center', render: (val, record) => renderShiftCell(SHIFT_ENUM.SANG, "beginning", val, record) },
           { title: "Nhập", dataIndex: ["morning", "received"], width: 80, align: 'center', render: (val, record) => renderShiftCell(SHIFT_ENUM.SANG, "received", val, record) },
           { title: "Xuất", dataIndex: ["morning", "issued"], width: 80, align: 'center', render: (val, record) => renderShiftCell(SHIFT_ENUM.SANG, "issued", val, record) },
           { title: "Tồn C.", dataIndex: ["morning", "ending"], width: 80, align: 'center', className: 'border-r-2 border-r-gray-600', render: (val, record) => renderShiftCell(SHIFT_ENUM.SANG, "ending", val, record) },
        ]
      },
      {
        title: 'Ca Chiều',
        children: [
           { title: "Tồn Đ.", dataIndex: ["afternoon", "beginning"], width: 80, align: 'center', render: (val, record) => renderShiftCell(SHIFT_ENUM.CHIEU, "beginning", val, record) },
           { title: "Nhập", dataIndex: ["afternoon", "received"], width: 80, align: 'center', render: (val, record) => renderShiftCell(SHIFT_ENUM.CHIEU, "received", val, record) },
           { title: "Xuất", dataIndex: ["afternoon", "issued"], width: 80, align: 'center', render: (val, record) => renderShiftCell(SHIFT_ENUM.CHIEU, "issued", val, record) },
           { title: "Tồn C.", dataIndex: ["afternoon", "ending"], width: 80, align: 'center', className: 'border-r-2 border-r-gray-600', render: (val, record) => renderShiftCell(SHIFT_ENUM.CHIEU, "ending", val, record) },
        ]
      },
      {
        title: 'Ca Tối',
        children: [
           { title: "Tồn Đ.", dataIndex: ["evening", "beginning"], width: 80, align: 'center', render: (val, record) => renderShiftCell(SHIFT_ENUM.TOI, "beginning", val, record) },
           { title: "Nhập", dataIndex: ["evening", "received"], width: 80, align: 'center', render: (val, record) => renderShiftCell(SHIFT_ENUM.TOI, "received", val, record) },
           { title: "Xuất", dataIndex: ["evening", "issued"], width: 80, align: 'center', render: (val, record) => renderShiftCell(SHIFT_ENUM.TOI, "issued", val, record) },
           { title: "Tồn C.", dataIndex: ["evening", "ending"], width: 80, align: 'center', render: (val, record) => renderShiftCell(SHIFT_ENUM.TOI, "ending", val, record) },
        ]
      }
    ];
  }, [reports]);

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
                {[SHIFT_ENUM.SANG, SHIFT_ENUM.CHIEU, SHIFT_ENUM.TOI].map((shift) => {
                   const m = reports[0].metadata || {};
                   const startTime = m[shift]?.start?.at;
                   const endTime = m[shift]?.end?.at;
                   const staffName = shift === SHIFT_ENUM.SANG ? reports[0].morningStaffName :
                                    shift === SHIFT_ENUM.CHIEU ? reports[0].afternoonStaffName :
                                    reports[0].eveningStaffName;
                                    
                   return (
                      <div key={shift} className="p-3 bg-gray-900 border border-gray-700 rounded-md">
                         <div className="flex justify-between items-start mb-1">
                            <div className="text-sm text-gray-400">Người trực ca {SHIFT_LABELS[shift as keyof typeof SHIFT_LABELS]}</div>
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
