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
  
  const [reportData, setReportData] = useState<any>(null);
  const [materials, setMaterials] = useState<MaterialData[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (!selectedDate || !selectedReportType) {
        message.warning("Vui lòng chọn ngày và loại báo cáo trước");
        onClose();
        return;
      }
      fetchStaffs();
      fetchReportData();
    } else {
      setSelectedStaff(null);
      setSelectedShift(null);
      setMaterials([]);
      setReportData(null);
    }
  }, [isOpen, selectedDate, selectedReportType]);

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

  useEffect(() => {
    if (reportData && selectedShift) {
      mapMaterialData(selectedShift);
    } else {
      setMaterials([]);
    }
  }, [reportData, selectedShift]);

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
    if (shift === SHIFT_ENUM.SANG) return tracking.isMorningComplete;
    if (shift === SHIFT_ENUM.CHIEU) return tracking.isAfternoonComplete;
    if (shift === SHIFT_ENUM.TOI) return tracking.isEveningComplete;
    return false;
  };

  const shouldDisableReceivedIssued = (submissionCount: number, shift: ShiftType) => {
    return submissionCount >= 2 || getShiftCompleteStatus(shift);
  };

  const mapMaterialData = (shift: ShiftType) => {
    if (!reportData) return;

    const {
       materials: { currentDay, previousDay, currentMorning, currentAfternoon, availableMaterials },
       isInitialData,
       submissionTracking
    } = reportData;

    const count = getShiftSubmissionCount(shift);
    const mapped = availableMaterials.map((mat: any) => {
      let beginning = 0;
      let received: number | undefined = undefined;
      let issued: number | undefined = undefined;

      const currentDayMat = currentDay.find((m: any) => m.id === mat.id);
      const previousDayMat = previousDay.find((m: any) => m.id === mat.id);
      const currentMorningMat = currentMorning.find((m: any) => m.id === mat.id);
      const currentAfternoonMat = currentAfternoon.find((m: any) => m.id === mat.id);

      if (isInitialData) {
         beginning = 0;
      } else {
         if (count === 0) {
            if (shift === SHIFT_ENUM.SANG) {
               beginning = previousDayMat ? previousDayMat.ending : 0;
            } else if (shift === SHIFT_ENUM.CHIEU) {
               beginning = currentMorningMat ? currentMorningMat.ending : 0;
            } else {
               beginning = currentAfternoonMat ? currentAfternoonMat.ending : 0;
            }
         } else if (count >= 1 && currentDayMat) {
            let shiftData;
            if (shift === SHIFT_ENUM.SANG) shiftData = currentDayMat.morning;
            else if (shift === SHIFT_ENUM.CHIEU) shiftData = currentDayMat.afternoon;
            else shiftData = currentDayMat.evening;

            beginning = shiftData.beginning || 0;
            received = shiftData.received;
            issued = shiftData.issued;
         }
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

  const handleMaterialChange = (id: string, field: "received" | "issued", value: string) => {
    const numericValue = value === "" ? undefined : parseFloat(value);
    setMaterials((prev) => 
      prev.map((m) => {
        if (m.id === id) {
          return { ...m, [field]: numericValue };
        }
        return m;
      })
    );
  };

  const handleSubmit = async () => {
    if (!selectedShift || !selectedStaff) {
       message.error("Vui lòng chọn ca và nhân viên");
       return;
    }

    const invalidMaterial = materials.find(
      (m) =>
        m.received === undefined ||
        m.issued === undefined ||
        isNaN(Number(m.received)) ||
        isNaN(Number(m.issued))
    );

    if (invalidMaterial) {
      message.error(`Vui lòng nhập đầy đủ số liệu cho: ${invalidMaterial.materialName}`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
         date: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
         shift: selectedShift,
         reportType: selectedReportType,
         staffId: selectedStaff,
         materials: materials.map(m => ({
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

  const columns: ColumnsType<MaterialData> = [
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
      title: "Tồn đẩu",
      dataIndex: "beginning",
      key: "beginning",
      width: 100,
      render: (val) => val || 0,
    },
    {
      title: "Nhập",
      dataIndex: "received",
      key: "received",
      width: 120,
      render: (val, record) => {
        const disabled = selectedShift ? shouldDisableReceivedIssued(getShiftSubmissionCount(selectedShift), selectedShift) : true;
        return (
          <Input 
             type="number"
             value={val === undefined ? "" : val}
             onChange={(e) => handleMaterialChange(record.id, "received", e.target.value)}
             disabled={disabled}
             placeholder="Nhập"
             className={val === undefined && !disabled ? "border-red-500" : ""}
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
        const disabled = selectedShift ? shouldDisableReceivedIssued(getShiftSubmissionCount(selectedShift), selectedShift) : true;
        return (
          <Input 
             type="number"
             value={val === undefined ? "" : val}
             onChange={(e) => handleMaterialChange(record.id, "issued", e.target.value)}
             disabled={disabled}
             placeholder="Xuất/Hủy"
             className={val === undefined && !disabled ? "border-red-500" : ""}
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
        const ending = beginning + received - issued;
        return ending;
      }
    }
  ];

  const shiftOptions = Object.values(SHIFT_ENUM).map(t => ({
     label: SHIFT_LABELS[t as ShiftType],
     value: t
  }));

  const staffOptions = staffs.map(st => ({
     label: st.fullName,
     value: st.id
  }));

  const disableSubmit = !selectedShift || !selectedStaff || 
      (selectedShift && shouldDisableReceivedIssued(getShiftSubmissionCount(selectedShift), selectedShift));

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
                       <label className="block text-sm font-medium text-gray-300 mb-1">Nhân viên nhận bàn giao</label>
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
              className="bg-blue-600 hover:bg-blue-700"
              disabled={disableSubmit}
           >
              Gửi báo cáo
           </Button>
        </div>
      </div>
    </div>
  );
}
