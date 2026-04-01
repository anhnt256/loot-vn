import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, DatePicker, Select, Card, Modal, Form, InputNumber, Typography, message, Tag, Input, Space, Row, Col } from 'antd';
import { PlusOutlined, FileTextOutlined, ReloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

dayjs.locale('vi');

const { Title } = Typography;
const { TextArea } = Input;

export default function ShiftReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [workShifts, setWorkShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterDate, setFilterDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [filterShiftId, setFilterShiftId] = useState<string | null>(null);

  // Modal Create
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [form] = Form.useForm();

  // Watch fields for automatic calculation inside the form helper
  const cashRevenue = Form.useWatch('cashRevenue', form) || 0;
  const cashExpense = Form.useWatch('cashExpense', form) || 0;
  const afterExpense = cashRevenue - cashExpense;

  const actualReceived = Form.useWatch('actualReceived', form) || 0;
  const difference = actualReceived - afterExpense;

  const formDate = Form.useWatch('date', form);
  const formWorkShiftId = Form.useWatch('workShiftId', form);

  useEffect(() => {
    if (formDate && formWorkShiftId && isModalVisible) {
      fetchAutofillData(formDate, formWorkShiftId);
    }
  }, [formDate, formWorkShiftId, isModalVisible]);

  const fetchAutofillData = async (date: any, workShiftId: number) => {
    try {
      setIsAutofilling(true);
      const res = await apiClient.get('/admin-app/shift-reports/autofill', { 
        params: { date: date.format('YYYY-MM-DD'), workShiftId }
      });
      if (res.data?.success && res.data?.data) {
        form.setFieldsValue({
          fnetRevenue: res.data.data.fnetRevenue,
          gcpRevenue: res.data.data.gcpRevenue,
          momoRevenue: res.data.data.momoRevenue
        });
      }
    } catch (e) {
      console.error('Failed to get autofill', e);
      message.error('Không thể lấy dữ liệu tự động. Vui lòng thử lại.');
    } finally {
      setIsAutofilling(false);
    }
  };

  useEffect(() => {
    fetchWorkShifts();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filterDate, filterShiftId]);

  const fetchWorkShifts = async () => {
    try {
      const res = await apiClient.get('/hr-manager/work-shifts');
      setWorkShifts(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch(e) {
      console.error('Failed to fetch work shifts', e);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterDate) params.filterDate = filterDate.format('YYYY-MM'); // Get full month reports
      if (filterShiftId) params.filterShiftId = filterShiftId;

      const res = await apiClient.get('/admin-app/shift-reports', { params });
      setReports(res.data.data || []);
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi tải danh sách báo cáo kết ca');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      if (reports.length === 0) {
        message.warning('Không có báo cáo nào để xuất Excel');
        return;
      }

      setLoading(true);
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Kết Ca', {
        views: [{ state: 'frozen', ySplit: 2 }],
      });

      sheet.columns = [
        { header: 'Ngày', key: 'ngay', width: 14 },
        { header: 'CA', key: 'ca', width: 12 },
        { header: 'FNET', key: 'fnet', width: 15 },
        { header: 'GCP', key: 'gcp', width: 15 },
        { header: 'MOMO', key: 'momo', width: 15 },
        { header: 'Tiền mặt', key: 'tienmat', width: 15 },
        { header: 'Chi TM', key: 'chitm', width: 15 },
        { header: 'Sau chi', key: 'sauchi', width: 15 },
        { header: 'Thực nhận', key: 'thucnhan', width: 15 },
        { header: 'Chênh lệch', key: 'chenhlech', width: 15 },
        { header: 'Tổng thực nhận', key: 'tongthucnhan', width: 18 },
        { header: 'Ghi chú', key: 'note', width: 25 },
      ];

      const headerRow = sheet.getRow(1);
      headerRow.height = 30;
      headerRow.eachCell((cell, colNumber) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B9BD5' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 12 };
        if (colNumber === 1 || colNumber === 11) {
           cell.font = { color: { argb: 'FFFFD966' }, bold: true, size: 12 };
        }
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' },
        };
      });

      const dataRows = groupedReports.filter((g: any) => !g.isGrandTotal);
      let currentRowNum = 2; 

      dataRows.forEach((dayGroup: any) => {
        const children = dayGroup.children || [];
        const startRow = currentRowNum;
        
        const sortedChildren = [...children].sort((a: any, b: any) => {
          const aId = a.workShift?.id || 0;
          const bId = b.workShift?.id || 0;
          return aId - bId;
        });

        sortedChildren.forEach((child: any) => {
          const row = sheet.addRow({
            ngay: dayjs(dayGroup.date).format('DD/MM'),
            ca: child.workShift?.name || 'Unknown',
            fnet: child.fnetRevenue || 0,
            gcp: child.gcpRevenue || 0,
            momo: child.momoRevenue || 0,
            tienmat: child.cashRevenue || 0,
            chitm: child.cashExpense || 0,
            sauchi: child.sauChi || 0,
            thucnhan: child.actualReceived || 0,
            chenhlech: child.chenhLech || 0,
            tongthucnhan: dayGroup.actualReceived || 0,
            note: child.note || '',
          });

          row.eachCell((cell, colNumber) => {
            cell.border = {
              top: { style: 'thin' }, left: { style: 'thin' },
              bottom: { style: 'thin' }, right: { style: 'thin' },
            };
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            
            if (colNumber === 1 || colNumber === 2) {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
            if (colNumber === 12) {
              cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }

            if (colNumber >= 3 && colNumber <= 11) {
              cell.numFmt = '#,##0';
            }

            if (colNumber === 2) {
              const ca = cell.value?.toString().toLowerCase();
              if (ca?.includes('sáng')) {
                cell.font = { color: { argb: 'FF0070C0' }, size: 12 };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F6FE' } };
              } else if (ca?.includes('tối')) {
                cell.font = { color: { argb: 'FF00B050' }, size: 12 };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBFCEB' } };
              } else if (ca?.includes('đêm')) {
                cell.font = { color: { argb: 'FF7030A0' }, size: 12 };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5ECFC' } };
              }
            }

            if (colNumber === 7 && typeof cell.value === 'number' && cell.value > 0) {
              cell.font = { color: { argb: 'FFFF0000' } };
            }

            if (colNumber === 10 && typeof cell.value === 'number' && cell.value < 0) {
              cell.font = { color: { argb: 'FFFF0000' } };
            }
            
            if (colNumber === 11) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
            }
            if (colNumber === 1) {
              cell.font = { bold: true, size: 12 };
            }
          });
          currentRowNum++;
        });

        if (children.length > 1) {
           sheet.mergeCells(`A${startRow}:A${currentRowNum - 1}`);
           sheet.mergeCells(`K${startRow}:K${currentRowNum - 1}`);
        }
      });
      
      const grandTotalGroup = groupedReports.find((g: any) => g.isGrandTotal);
      if (grandTotalGroup) {
         const summaryRow = sheet.addRow({
            ngay: 'TỔNG CỘNG', ca: '',
            fnet: grandTotalGroup.fnetRevenue, gcp: grandTotalGroup.gcpRevenue,
            momo: grandTotalGroup.momoRevenue, tienmat: grandTotalGroup.cashRevenue,
            chitm: grandTotalGroup.cashExpense, sauchi: grandTotalGroup.sauChi,
            thucnhan: grandTotalGroup.actualReceived, chenhlech: grandTotalGroup.chenhLech,
            tongthucnhan: grandTotalGroup.actualReceived, note: ''
         });
         sheet.mergeCells(`A${currentRowNum}:B${currentRowNum}`);
         
         summaryRow.eachCell((cell, colNum) => {
            cell.font = { bold: true, color: { argb: 'FF000000' } };
            if (colNum >= 3 && colNum <= 11) cell.numFmt = '#,##0';
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE599' } };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            if (colNum <= 2) cell.alignment = { vertical: 'middle', horizontal: 'center' };
         });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const monthStr = filterDate ? filterDate.format('MM_YYYY') : dayjs().format('MM_YYYY');
      saveAs(blob, `BaoCao_KetCa_${monthStr}.xlsx`);
      
    } catch (error) {
      console.error('Export Excel failed:', error);
      message.error('Có lỗi xảy ra khi xuất file Excel');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      setSubmitting(true);
      const payload = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };
      await apiClient.post('/admin-app/shift-reports', payload);
      message.success('Tạo báo cáo kết ca thành công');
      setIsModalVisible(false);
      form.resetFields();
      fetchReports();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo báo cáo');
    } finally {
      setSubmitting(false);
    }
  };

  const formatMoney = (val: number) => {
    return val?.toLocaleString('en-US') || '0';
  };

  const numberFormatter = (val: any) => {
    if (!val) return '';
    return `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const numberParser = (val: any) => {
    if (!val) return '';
    return val.replace(/\$\s?|(,*)/g, '') as any;
  };

  const getShiftColor = (name: string) => {
    if (!name) return 'default';
    if (name.toLowerCase().includes('sáng')) return 'blue';
    if (name.toLowerCase().includes('trưa')) return 'green';
    if (name.toLowerCase().includes('chiều')) return 'orange';
    if (name.toLowerCase().includes('tối')) return 'geekblue';
    if (name.toLowerCase().includes('đêm')) return 'purple';
    return 'default';
  };

  const getShortDayName = (dateStr: string) => {
    const d = dayjs(dateStr);
    const days = ['CN', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'];
    return days[d.day()];
  };

  // Group data to build a Tree Table (Expandable Rows)
  const groupedReports = useMemo(() => {
    const groups: Record<string, any> = {};
    const grandTotals = {
      isGrandTotal: true,
      key: 'grand-total',
      date: 'Tổng',
      fnetRevenue: 0,
      gcpRevenue: 0,
      momoRevenue: 0,
      cashRevenue: 0,
      cashExpense: 0,
      sauChi: 0,
      actualReceived: 0,
      chenhLech: 0,
      shiftCount: 0,
    };

    reports.forEach(r => {
      const d = r.date;
      if (!groups[d]) {
        groups[d] = {
          key: `group-${d}`,
          id: `group-${d}`,
          date: d,
          isParent: true,
          fnetRevenue: 0,
          gcpRevenue: 0,
          momoRevenue: 0,
          cashRevenue: 0,
          cashExpense: 0,
          sauChi: 0,
          actualReceived: 0,
          chenhLech: 0,
          shiftCount: 0,
          children: [],
        };
      }
      
      const g = groups[d];
      g.fnetRevenue += (r.fnetRevenue || 0);
      g.gcpRevenue += (r.gcpRevenue || 0);
      g.momoRevenue += (r.momoRevenue || 0);
      g.cashRevenue += (r.cashRevenue || 0);
      g.cashExpense += (r.cashExpense || 0);
      g.sauChi += (r.sauChi || 0);
      g.actualReceived += (r.actualReceived || 0);
      g.chenhLech += (r.chenhLech || 0);
      g.shiftCount++;
      
      grandTotals.fnetRevenue += (r.fnetRevenue || 0);
      grandTotals.gcpRevenue += (r.gcpRevenue || 0);
      grandTotals.momoRevenue += (r.momoRevenue || 0);
      grandTotals.cashRevenue += (r.cashRevenue || 0);
      grandTotals.cashExpense += (r.cashExpense || 0);
      grandTotals.sauChi += (r.sauChi || 0);
      grandTotals.actualReceived += (r.actualReceived || 0);
      grandTotals.chenhLech += (r.chenhLech || 0);
      grandTotals.shiftCount++;

      g.children.push({
        ...r,
        key: `child-${r.id}`,
        isChild: true,
      });
    });

    const sortedGroups = Object.values(groups).sort((a: any, b: any) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
    if (sortedGroups.length > 0) {
      return [grandTotals, ...sortedGroups];
    }
    return [];
  }, [reports]);

  const columns = [
    {
      title: 'Thứ',
      dataIndex: 'date',
      key: 'dayOfWeek',
      width: 90,
      render: (val: string, record: any) => {
        if (record.isGrandTotal) {
          return {
            children: <span className="uppercase text-yellow-500 font-extrabold text-[14px] whitespace-nowrap tracking-wider">TỔNG THÁNG</span>,
            props: { colSpan: 2 }
          };
        }
        if (record.isParent) {
          return <strong className="text-gray-300 text-[13px] whitespace-nowrap">{getShortDayName(val)}</strong>;
        }
        return null;
      },
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'dateStr',
      width: 110,
      render: (val: string, record: any) => {
        if (record.isGrandTotal) return { props: { colSpan: 0 } };
        if (record.isParent) {
          return <span className="text-gray-300 text-[13px] whitespace-nowrap">{dayjs(val).format('DD/MM/YYYY')}</span>;
        }
        return null;
      },
    },
    {
      title: 'CA',
      dataIndex: 'workShiftId',
      key: 'workShiftId',
      width: 100,
      render: (_: any, record: any) => {
        if (record.isGrandTotal) return <span className="text-yellow-500 text-xs tracking-wider font-bold whitespace-nowrap">{record.shiftCount} CA</span>;
        if (record.isParent) {
          return <span className="text-gray-400 text-xs tracking-wider uppercase whitespace-nowrap">{record.shiftCount} CA</span>;
        }
        const shiftName = record.workShift?.name || 'Unknown';
        return <Tag color={getShiftColor(shiftName)} className="font-bold border-0 px-2 py-0.5 text-xs tracking-wider w-full text-center whitespace-nowrap">{shiftName}</Tag>
      },
    },
    { 
      title: 'Tiền Giờ', 
      dataIndex: 'fnetRevenue', 
      key: 'fnetRevenue', 
      align: 'right' as const, 
      render: (val: number, record: any) => {
        if (record.isGrandTotal) return <span className="font-extrabold text-yellow-500 text-[14px]">{formatMoney(val)}</span>;
        return <span className={record.isParent ? 'font-bold text-gray-300 text-[13px]' : 'text-gray-400 text-[13px]'}>{formatMoney(val)}</span>;
      }
    },
    { 
      title: 'Tiền DV', 
      dataIndex: 'gcpRevenue', 
      key: 'gcpRevenue', 
      align: 'right' as const, 
      render: (val: number, record: any) => {
        if (record.isGrandTotal) return <span className="font-extrabold text-yellow-500 text-[14px]">{formatMoney(val)}</span>;
        return <span className={record.isParent ? 'font-bold text-gray-300 text-[13px]' : 'text-gray-400 text-[13px]'}>{formatMoney(val)}</span>;
      }
    },
    { 
      title: 'MOMO', 
      dataIndex: 'momoRevenue', 
      key: 'momoRevenue', 
      align: 'right' as const, 
      render: (val: number, record: any) => {
        if (record.isGrandTotal) return <span className="font-extrabold text-yellow-500 text-[14px]">{formatMoney(val)}</span>;
        return <span className={record.isParent ? 'font-bold text-gray-300 text-[13px]' : 'text-gray-400 text-[13px]'}>{formatMoney(val)}</span>;
      }
    },
    { 
      title: 'Tiền mặt', 
      dataIndex: 'cashRevenue', 
      key: 'cashRevenue', 
      align: 'right' as const, 
      render: (val: number, record: any) => {
        if (record.isGrandTotal) return <span className="font-extrabold text-yellow-400 text-[14px]">{formatMoney(val)}</span>;
        return <span className={record.isParent ? 'font-bold text-gray-200 text-[13px]' : 'text-gray-400 text-[13px]'}>{formatMoney(val)}</span>;
      }
    },
    { 
      title: 'Chi TM', 
      dataIndex: 'cashExpense', 
      key: 'cashExpense', 
      align: 'right' as const, 
      render: (val: number, record: any) => {
        if (record.isGrandTotal) return <span className="font-extrabold text-[#f87171] text-[14px]">{formatMoney(val)}</span>;
        return <span className={record.isParent ? 'font-bold text-red-400 text-[13px]' : 'text-red-400/80 text-[13px]'}>{formatMoney(val)}</span>;
      }
    },
    { 
      title: 'Sau chi', 
      dataIndex: 'sauChi', 
      key: 'sauChi', 
      align: 'right' as const, 
      render: (val: number, record: any) => {
        if (record.isGrandTotal) return <span className="font-extrabold text-yellow-500 text-[14px]">{formatMoney(val)}</span>;
        return <span className={record.isParent ? 'font-bold text-yellow-500 text-[13px]' : 'text-yellow-600/80 text-[13px]'}>{formatMoney(val)}</span>;
      }
    },
    { 
      title: 'Thực nhận', 
      dataIndex: 'actualReceived', 
      key: 'actualReceived', 
      align: 'right' as const, 
      render: (val: number, record: any) => {
        if (record.isGrandTotal) return <strong className="text-green-400 text-[16px]">{formatMoney(val)}</strong>;
        return <strong className={record.isParent ? 'text-green-500 text-[14px]' : 'text-green-500/80 text-[13px]'}>{formatMoney(val)}</strong>;
      }
    },
    { 
      title: 'Chênh lệch', 
      dataIndex: 'chenhLech', 
      key: 'chenhLech', 
      align: 'right' as const, 
      render: (val: number, record: any) => {
        if (!val || val === 0) return <span className={`text-gray-500 font-bold ${record.isGrandTotal ? 'text-[14px]' : 'text-[13px]'}`}>0</span>;
        return <span className={`${val < 0 ? 'text-red-500' : 'text-green-500'} font-bold ${record.isGrandTotal ? 'text-[14px]' : 'text-[13px]'} whitespace-nowrap`}>
          {val > 0 ? `+${formatMoney(val)}` : formatMoney(val)}
        </span>;
      }
    },
    { 
      title: 'Ghi chú', 
      dataIndex: 'note', 
      key: 'note', 
      ellipsis: true,
      render: (val: string, record: any) => record.isParent ? null : <span className="text-gray-400 text-sm">{val}</span>
    },
  ];

  return (
    <div className="max-w-[1550px] mx-auto py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-3">
            <FileTextOutlined className="text-3xl" style={{ color: 'var(--primary-color, #eb2f96)' }} />
            <Title level={2} style={{ margin: 0, color: 'white', fontWeight: 700 }}>Báo cáo kết ca</Title>
          </div>
          
          <div className="flex items-center gap-3 ml-2 bg-gray-800/80 p-[4px] rounded-lg border border-gray-700/50 shadow-sm">
            <DatePicker 
              picker="month"
              value={filterDate}
              onChange={(val) => setFilterDate(val)}
              format="MM/YYYY"
              allowClear
              placeholder="Chọn tháng"
              className="w-32 border-gray-600 text-white hover:border-blue-500 focus:border-blue-500 bg-transparent shadow-none"
            />
            <Select
              allowClear
              placeholder="Tất cả ca trực"
              className="w-36 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!shadow-none"
              value={filterShiftId}
              onChange={(val) => setFilterShiftId(val)}
              options={workShifts.map((ws: any) => ({ label: ws.name, value: ws.id }))}
              dropdownStyle={{ backgroundColor: '#1f2937', color: 'white' }}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchReports} type="text" className="text-gray-400 hover:text-white flex items-center justify-center">Làm mới</Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            className="border-green-500/30 text-green-400 hover:text-green-300 hover:border-green-400 bg-green-500/10 shadow-lg shadow-green-500/10 font-medium h-[36px]"
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            loading={loading}
          >
            Xuất Excel
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            className="font-bold shadow-lg shadow-pink-500/20 tracking-wide rounded border-0 h-[36px]"
            style={{ backgroundColor: '#db2777' }}
            onClick={() => {
              form.resetFields();
              form.setFieldsValue({
                date: dayjs(),
                fnetRevenue: 0,
                gcpRevenue: 0,
                momoRevenue: 0,
                cashRevenue: 0,
                cashExpense: 0,
                actualReceived: 0,
              });
              setIsModalVisible(true);
            }}
          >
            Tạo báo cáo kết ca
          </Button>
        </div>
      </div>

      <Table 
        columns={columns} 
        dataSource={groupedReports} 
        rowKey="key" 
        loading={loading}
        pagination={false}
        sticky={{ offsetHeader: 64 }}
        scroll={{ x: 'max-content' }}
        rowClassName={(record) => {
          if (record.isGrandTotal) return "bg-gray-800/90 hover:bg-gray-800/80 transition-colors border-b-2 border-yellow-500/30";
          return record.isParent ? "bg-gray-800/60 font-medium hover:bg-gray-700/80 transition-colors cursor-pointer" : "bg-transparent hover:bg-gray-800/40 transition-colors";
        }}
        className="custom-dark-table shadow-2xl"
        defaultExpandAllRows={true}
        expandable={{
          expandRowByClick: true,
        }}
      />

      <Modal
        title={<div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent uppercase tracking-wider">Tạo Báo Cáo Kết Ca</div>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        centered
        className="dark-modal"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          className="mt-6"
        >
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label={<span className="text-gray-300 font-medium">Ngày báo cáo</span>} name="date" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
                <DatePicker disabled={isAutofilling} format="DD/MM/YYYY" size="large" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span className="text-gray-300 font-medium">Ca trực kết thúc</span>} name="workShiftId" rules={[{ required: true, message: 'Vui lòng chọn ca!' }]}>
                <Select disabled={isAutofilling} size="large" placeholder="Chọn ca từ hệ thống" style={{ width: '100%' }}>
                  {workShifts.map((ws: any) => (
                    <Select.Option key={ws.id} value={ws.id}>{ws.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Card className={`mb-6 border-gray-700 bg-gray-900/40 shadow-inner overflow-hidden ${isAutofilling ? 'opacity-60' : ''}`} bodyStyle={{ padding: '20px', position: 'relative' }}>
            {isAutofilling && (
               <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/20 backdrop-blur-[1px]">
                  <ReloadOutlined spin className="text-2xl text-pink-500" />
                  <span className="ml-3 text-pink-400 font-medium tracking-tight">Đang tải dữ liệu ca trực...</span>
               </div>
            )}
            <Row gutter={20}>
              <Col span={8}>
                <Form.Item label={<span className="text-gray-400 text-xs">Tiền Giờ</span>} name="fnetRevenue">
                  <InputNumber disabled style={{ width: '100%' }} className="text-lg disabled-input-dark" size="large" min={0} formatter={numberFormatter} parser={numberParser} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={<span className="text-gray-400 text-xs">Tiền DV</span>} name="gcpRevenue">
                  <InputNumber disabled style={{ width: '100%' }} className="text-lg disabled-input-dark" size="large" min={0} formatter={numberFormatter} parser={numberParser} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={<span className="text-gray-400 text-xs">MOMO</span>} name="momoRevenue">
                  <InputNumber disabled style={{ width: '100%' }} className="text-lg disabled-input-dark" size="large" min={0} formatter={numberFormatter} parser={numberParser} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card className="mb-6 border-gray-700 bg-gray-900/40 shadow-inner" bodyStyle={{ padding: '20px' }}>
             <Row gutter={20}>
                <Col span={8}>
                  <Form.Item label={<span className="text-gray-300">Tiền mặt</span>} name="cashRevenue">
                    <InputNumber style={{ width: '100%' }} className="font-bold text-lg" size="large" min={0} formatter={numberFormatter} parser={numberParser} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label={<span className="text-gray-300">Chi TM</span>} name="cashExpense">
                    <InputNumber style={{ width: '100%' }} className="font-bold text-lg text-red-500" size="large" min={0} formatter={numberFormatter} parser={numberParser} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <div className="flex flex-col h-full pt-1 pb-6 px-4 bg-gray-800 rounded-lg border border-gray-700">
                    <span className="text-gray-400 mb-1 text-xs uppercase pt-2">Sau chi</span>
                    <strong className="text-2xl text-yellow-400 mt-1">{formatMoney(afterExpense)}</strong>
                  </div>
                </Col>
             </Row>
             <div className="my-5 border-t border-dashed border-gray-600"></div>
             <Row gutter={20} className="items-center">
                <Col span={12}>
                  <Form.Item label={<span className="text-gray-300 text-base">Thực nhận</span>} name="actualReceived" rules={[{ required: true, message: 'Vui lòng điền thực nhận' }]} style={{ marginBottom: 0 }}>
                    <InputNumber className="font-extrabold text-green-500" size="large" min={0} style={{ width: '100%', height: '50px', fontSize: '20px' }} formatter={numberFormatter} parser={numberParser} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <div className="flex flex-col h-full p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <span className="text-gray-400 text-xs uppercase">Chênh lệch</span>
                    <strong className={`text-xl mt-1 ${difference < 0 ? 'text-red-500' : difference > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                      {difference > 0 ? '+' : ''}{formatMoney(difference)}
                    </strong>
                  </div>
                </Col>
             </Row>
          </Card>

          <Form.Item label={<span className="text-gray-300">Ghi chú</span>} name="note">
            <TextArea rows={2} className="bg-gray-800 border-gray-700 text-gray-200 text-lg hover:border-blue-500 focus:border-blue-500" />
          </Form.Item>

          <div className="flex gap-4 justify-end mt-8 border-t border-gray-700 pt-6">
            <Button size="large" disabled={isAutofilling} onClick={() => setIsModalVisible(false)} className="bg-transparent border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 w-32">
              Hủy
            </Button>
            <Button size="large" type="primary" htmlType="submit" loading={submitting || isAutofilling} className="font-bold w-48 shadow-lg shadow-blue-500/30 text-base">
              Lưu Báo Cáo
            </Button>
          </div>
        </Form>
      </Modal>

      <style>{`
        .custom-dark-table .ant-table { background: transparent !important; color: #d1d5db !important; }
        .custom-dark-table .ant-table-thead > tr > th { 
          background-color: rgba(31, 41, 55, 0.95) !important; 
          color: #e5e7eb !important; 
          border-bottom: 2px solid #4b5563 !important; 
          font-weight: 600; 
          padding: 16px; 
          border-radius: 0 !important; 
          backdrop-filter: blur(8px);
        }
        .custom-dark-table .ant-table-tbody > tr > td { border-bottom: 1px solid #374151 !important; padding: 14px 16px; transition: background-color 0.2s; }
        .custom-dark-table .ant-table-tbody > tr.ant-table-row-level-0 > td { border-top: 2px solid #374151 !important; }
        .custom-dark-table .ant-table-row-expand-icon { color: white; background-color: #374151; border-color: #4b5563; border-radius: 4px; }
        .custom-dark-table .ant-table-row-expand-icon:hover { color: #1677ff; border-color: #1677ff; }
        .custom-dark-table .ant-table-expanded-row > td { background-color: transparent !important; padding: 0 !important; }
        .custom-dark-table .ant-table-pagination.ant-pagination { margin-right: 24px; margin-bottom: 24px; margin-top: 24px; }
        
        .dark-modal .ant-modal-content { background-color: #111827; border: 1px solid #374151; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8); }
        .dark-modal .ant-modal-header { background-color: transparent; border-bottom: 1px solid #374151; padding-bottom: 16px; }
        .dark-modal .ant-modal-title { color: white; }
        .dark-modal .ant-modal-close-x { color: #9ca3af; transition: color 0.2s; }
        .dark-modal .ant-modal-close:hover .ant-modal-close-x { color: white; }
        
        .dark-modal .ant-input-number, .dark-modal .ant-input, .dark-modal .ant-picker, .dark-modal .ant-select-selector { 
          background-color: #1f2937 !important; 
          border-color: #4b5563 !important; 
          color: white !important; 
        }
        .dark-modal .disabled-input-dark { color: #d1d5db !important; background-color: #374151 !important; outline: none !important; }
        .dark-modal .disabled-input-dark input { color: #818cf8 !important; font-weight: 700 !important; cursor: not-allowed !important; }
        
        .dark-modal .ant-input-number-input { color: white !important; font-weight: 500; }
        .dark-modal .ant-select-arrow { color: #9ca3af; }
        .dark-modal .ant-picker-input > input { color: white !important; }
        .dark-modal .ant-picker-suffix { color: #9ca3af; }
        .dark-modal .ant-select-selection-item { color: white !important; }
      `}</style>
    </div>
  );
}
