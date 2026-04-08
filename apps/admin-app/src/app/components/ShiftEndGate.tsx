import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, App, Spin, Tag, DatePicker, Input } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PoweroffOutlined,
  FireOutlined,
  CoffeeOutlined,
  SnippetsOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { apiClient, getToken } from '@gateway-workspace/shared/utils/client';
import { useNavigate } from 'react-router-dom';

import { useShift } from '../hooks/useShift';
import SendReportDrawer from '../pages/handover-reports/components/SendReportDrawer';
import { REPORT_TYPE_ENUM } from '../pages/handover-reports/constants';

interface WorkShiftJwt {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  staffId?: number | null;
}

interface ShiftEndGateProps {
  onClose: () => void;
  primaryColor: string;
  workShifts: WorkShiftJwt[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:    { label: 'Chờ xác nhận', color: 'gold' },
  CHAP_NHAN:  { label: 'Chấp nhận',   color: 'blue' },
  THU_TIEN:   { label: 'Thu tiền',     color: 'purple' },
  PHUC_VU:    { label: 'Phục vụ',      color: 'orange' },
  HOAN_THANH: { label: 'Hoàn thành',   color: 'green' },
  HUY:        { label: 'Đã hủy',       color: 'red' },
};

function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/g, 'd').replace(/\u0110/g, 'D');
}

function mapWorkShiftNameToEnum(name: string): string {
  const normalized = removeDiacritics(name).toUpperCase();
  if (normalized.includes('SANG')) return 'SANG';
  if (normalized.includes('CHIEU') || normalized.includes('DEM')) return 'CHIEU';
  if (normalized.includes('TOI')) return 'TOI';
  return 'SANG';
}

function findCurrentWorkShift(workShifts: WorkShiftJwt[]): WorkShiftJwt | null {
  if (!workShifts?.length) return null;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const ws of workShifts) {
    const [sH, sM] = String(ws.startTime).split(':').map(Number);
    const [eH, eM] = String(ws.endTime).split(':').map(Number);
    const start = sH * 60 + sM;
    const end = eH * 60 + eM;
    const inShift = ws.isOvernight
      ? (currentMinutes >= start || currentMinutes <= end)
      : (currentMinutes >= start && currentMinutes <= end);
    if (inShift) return ws;
  }
  return workShifts[0] || null;
}

function fmtMoney(v: number) {
  return `${v.toLocaleString('vi-VN')  } đ`;
}

interface ShiftSummary {
  shift: { id: number; staffName: string; startedAt: string };
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  byStatus: Record<string, number>;
}

const ShiftEndGate: React.FC<ShiftEndGateProps> = ({ onClose, primaryColor, workShifts }) => {
  const navigate = useNavigate();
  const { notification, modal } = App.useApp();
  const { endShift, currentShift } = useShift();

  const [reportStatus, setReportStatus] = useState<{ bep: boolean; nuoc: boolean; bandGiao: boolean } | null>(null);
  const [checking, setChecking] = useState(true);
  const [ending, setEnding] = useState(false);

  // Summary
  const [summary, setSummary] = useState<ShiftSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [pendingRewardsCount, setPendingRewardsCount] = useState(0);

  // Pause options
  const [pauseUntil, setPauseUntil] = useState<Dayjs | null>(null);
  const [pauseNote, setPauseNote] = useState('');

  // Drawer state for NVL reports
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerReportType, setDrawerReportType] = useState<string>(REPORT_TYPE_ENUM.BAO_CAO_BEP);

  const currentWorkShift = useMemo(() => findCurrentWorkShift(workShifts), [workShifts]);
  const currentShiftEnum = currentWorkShift ? mapWorkShiftNameToEnum(currentWorkShift.name) : 'SANG';

  // For overnight shifts (e.g. Ca Tối 22:50–06:00), after midnight the NVL
  // reports are stored under yesterday's date. Use the shift-start date.
  const shiftDate = useMemo(() => {
    if (currentWorkShift?.isOvernight) {
      const now = dayjs();
      const [sH, sM] = String(currentWorkShift.startTime).split(':').map(Number);
      const startMinutes = sH * 60 + sM;
      const currentMinutes = now.hour() * 60 + now.minute();
      // If current time is before the shift start time, we're in the "after midnight" portion
      if (currentMinutes < startMinutes) {
        return now.subtract(1, 'day').format('YYYY-MM-DD');
      }
    }
    return dayjs().format('YYYY-MM-DD');
  }, [currentWorkShift]);

  const checkReports = useCallback(async () => {
    setChecking(true);
    try {
      const res = await apiClient.get('/admin/handover-reports/check-end-reports', {
        params: {
          date: shiftDate,
          shift: currentShiftEnum,
          workShiftId: currentWorkShift?.id,
        },
      });
      setReportStatus({ bep: res.data.bep, nuoc: res.data.nuoc, bandGiao: res.data.bandGiao });
    } catch {
      setReportStatus({ bep: false, nuoc: false, bandGiao: false });
    } finally {
      setChecking(false);
    }
  }, [currentShiftEnum, currentWorkShift?.id, shiftDate]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const [summaryRes, rewardsRes] = await Promise.all([
        apiClient.get('/admin/orders/shift/summary'),
        apiClient.get('/promotion-reward/redemptions/pending-count').catch(() => ({ data: { count: 0 } })),
      ]);
      setSummary(summaryRes.data);
      setPendingRewardsCount(rewardsRes.data?.count ?? 0);
    } catch {
      // ignore
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    checkReports();
    fetchSummary();
  }, [checkReports, fetchSummary]);

  const hasUnfinishedOrders = (s: ShiftSummary) => !!(s.byStatus['PENDING'] || s.byStatus['CHAP_NHAN'] || s.byStatus['THU_TIEN'] || s.byStatus['PHUC_VU']);

  const handleOpenDrawer = (reportType: string) => {
    setDrawerReportType(reportType);
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    checkReports();
  };

  const handleGoToShiftReport = () => {
    onClose();
    navigate('/dashboard/reports');
  };

  const handleConfirmEnd = async () => {
    if (summary && hasUnfinishedOrders(summary)) {
      notification.warning({
        title: 'Còn đơn hàng chưa hoàn thành',
        description: 'Bạn cần hoàn thành tất cả đơn hàng trước khi kết ca',
        placement: 'topRight',
        duration: 5,
      });
      onClose();
      window.dispatchEvent(new CustomEvent('shift:filter-unfinished'));
      return;
    }

    if (pendingRewardsCount > 0) {
      notification.warning({
        title: 'Còn yêu cầu đổi thưởng chưa xử lý',
        description: `Còn ${pendingRewardsCount} yêu cầu đổi thưởng đang chờ duyệt.`,
        placement: 'topRight',
        duration: 5,
      });
      onClose();
      navigate('/dashboard/reward-exchange');
      return;
    }

    setEnding(true);
    try {
      if (pauseUntil) {
        await apiClient.post('/admin/orders/pause', {
          resumeAt: pauseUntil.toISOString(),
          note: pauseNote.trim() || undefined,
        });
      }
      await endShift();
      notification.success({ title: 'Đã kết ca thành công', placement: 'topRight' });
      window.dispatchEvent(new CustomEvent('shift:close-end-gate'));
      onClose();
    } catch (err: any) {
      notification.error({
        title: err?.response?.data?.message ?? 'Không thể kết ca',
        placement: 'topRight',
      });
    } finally {
      setEnding(false);
    }
  };

  const allReportsReady = reportStatus?.bep && reportStatus?.nuoc && reportStatus?.bandGiao;
  const ordersClean = summary && !hasUnfinishedOrders(summary) && pendingRewardsCount === 0;
  const canEnd = allReportsReady && ordersClean;

  return (
    <>
      <div className="min-h-screen bg-gray-900 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-lg px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            />
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <PoweroffOutlined style={{ color: '#ef4444' }} />
              Kết thúc ca làm việc
            </h1>
          </div>

          {/* Shift Info */}
          {currentShift && (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-4">
              <p className="text-sm text-gray-400">Thông tin ca</p>
              <p className="text-white font-medium">
                {currentShift.staffName} — từ {dayjs(currentShift.startedAt).format('HH:mm DD/MM/YYYY')}
              </p>
            </div>
          )}

          {/* Summary Stats */}
          {summaryLoading ? (
            <div className="flex justify-center py-8"><Spin /></div>
          ) : summary ? (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
                  <ShoppingCartOutlined style={{ fontSize: 20, color: '#3b82f6' }} />
                  <p className="text-2xl font-bold text-blue-400 mt-1">{summary.totalOrders}</p>
                  <p className="text-xs text-gray-400">Tổng đơn hàng</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
                  <DollarOutlined style={{ fontSize: 20, color: '#22c55e' }} />
                  <p className="text-2xl font-bold text-green-400 mt-1">{fmtMoney(summary.totalRevenue)}</p>
                  <p className="text-xs text-gray-400">Doanh thu</p>
                </div>
              </div>

              {/* Status breakdown */}
              {Object.keys(summary.byStatus).length > 0 && (
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-4">
                  <p className="text-xs text-gray-400 mb-2">Chi tiết theo trạng thái</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(summary.byStatus).map(([status, count]) => {
                      const cfg = STATUS_LABELS[status] ?? { label: status, color: 'default' };
                      return <Tag key={status} color={cfg.color}>{cfg.label}: {count}</Tag>;
                    })}
                  </div>
                </div>
              )}

              {/* Order/Reward warnings */}
              {hasUnfinishedOrders(summary) && (
                <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-4 flex items-start gap-3 mb-3">
                  <CloseCircleOutlined style={{ color: '#ef4444', marginTop: 2 }} />
                  <div>
                    <p className="text-sm text-red-300 font-medium">Còn đơn hàng chưa hoàn thành</p>
                    <p className="text-xs text-red-400/80 mt-1">
                      Cần xử lý hết đơn trước khi kết ca.
                    </p>
                  </div>
                </div>
              )}

              {pendingRewardsCount > 0 && (
                <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-4 flex items-start gap-3 mb-3">
                  <CloseCircleOutlined style={{ color: '#ef4444', marginTop: 2 }} />
                  <div>
                    <p className="text-sm text-red-300 font-medium">Còn {pendingRewardsCount} yêu cầu đổi thưởng</p>
                    <p className="text-xs text-red-400/80 mt-1">
                      Vui lòng duyệt/từ chối hết trước khi kết ca.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* Report checklist */}
          <div className="space-y-3 mb-6">
            <p className="text-sm text-yellow-200 font-medium">
              Gửi đủ báo cáo cuối ca để kết ca:
            </p>

            {/* Báo cáo Bếp cuối ca */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                reportStatus?.bep
                  ? 'bg-green-900/20 border-green-600/40'
                  : 'bg-gray-800 border-gray-600 hover:border-yellow-500/60'
              }`}
              onClick={() => !reportStatus?.bep && handleOpenDrawer(REPORT_TYPE_ENUM.BAO_CAO_BEP)}
            >
              <div className="flex items-center gap-3">
                <FireOutlined style={{ fontSize: 24, color: reportStatus?.bep ? '#22c55e' : '#faad14' }} />
                <div className="text-left">
                  <p className="text-white font-medium">Báo cáo Bếp</p>
                  <p className="text-xs text-gray-400">NVL Bếp cuối ca</p>
                </div>
              </div>
              {reportStatus?.bep ? (
                <CheckCircleOutlined style={{ fontSize: 22, color: '#22c55e' }} />
              ) : (
                <Button
                  type="primary"
                  size="small"
                  icon={<FileTextOutlined />}
                  style={{ background: primaryColor, borderColor: primaryColor }}
                  onClick={(e) => { e.stopPropagation(); handleOpenDrawer(REPORT_TYPE_ENUM.BAO_CAO_BEP); }}
                >
                  Kê khai
                </Button>
              )}
            </div>

            {/* Báo cáo Nước cuối ca */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                reportStatus?.nuoc
                  ? 'bg-green-900/20 border-green-600/40'
                  : 'bg-gray-800 border-gray-600 hover:border-yellow-500/60'
              }`}
              onClick={() => !reportStatus?.nuoc && handleOpenDrawer(REPORT_TYPE_ENUM.BAO_CAO_NUOC)}
            >
              <div className="flex items-center gap-3">
                <CoffeeOutlined style={{ fontSize: 24, color: reportStatus?.nuoc ? '#22c55e' : '#faad14' }} />
                <div className="text-left">
                  <p className="text-white font-medium">Báo cáo Nước</p>
                  <p className="text-xs text-gray-400">NVL Nước cuối ca</p>
                </div>
              </div>
              {reportStatus?.nuoc ? (
                <CheckCircleOutlined style={{ fontSize: 22, color: '#22c55e' }} />
              ) : (
                <Button
                  type="primary"
                  size="small"
                  icon={<FileTextOutlined />}
                  style={{ background: primaryColor, borderColor: primaryColor }}
                  onClick={(e) => { e.stopPropagation(); handleOpenDrawer(REPORT_TYPE_ENUM.BAO_CAO_NUOC); }}
                >
                  Kê khai
                </Button>
              )}
            </div>

            {/* Báo cáo Bàn giao */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                reportStatus?.bandGiao
                  ? 'bg-green-900/20 border-green-600/40'
                  : 'bg-gray-800 border-gray-600 hover:border-yellow-500/60'
              }`}
              onClick={() => !reportStatus?.bandGiao && handleGoToShiftReport()}
            >
              <div className="flex items-center gap-3">
                <SnippetsOutlined style={{ fontSize: 24, color: reportStatus?.bandGiao ? '#22c55e' : '#faad14' }} />
                <div className="text-left">
                  <p className="text-white font-medium">Báo cáo Bàn giao</p>
                  <p className="text-xs text-gray-400">Doanh thu & tiền mặt</p>
                </div>
              </div>
              {reportStatus?.bandGiao ? (
                <CheckCircleOutlined style={{ fontSize: 22, color: '#22c55e' }} />
              ) : (
                <Button
                  type="primary"
                  size="small"
                  icon={<FileTextOutlined />}
                  style={{ background: primaryColor, borderColor: primaryColor }}
                  onClick={(e) => { e.stopPropagation(); handleGoToShiftReport(); }}
                >
                  Tạo báo cáo
                </Button>
              )}
            </div>
          </div>

          {/* Pause option */}
          {canEnd && (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-4">
              <p className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <ClockCircleOutlined />
                Ngưng nhận đơn đến
                <span className="text-gray-500 font-normal text-xs">(tùy chọn)</span>
              </p>
              <DatePicker
                showTime={{ format: 'HH:mm' }}
                format="DD/MM/YYYY HH:mm"
                placeholder="Mặc định: ngưng đến khi ca mới bắt đầu"
                value={pauseUntil}
                onChange={setPauseUntil}
                disabledDate={(d) => d.isBefore(dayjs(), 'day')}
                className="w-full"
              />
              {pauseUntil && (
                <Input.TextArea
                  value={pauseNote}
                  onChange={(e) => setPauseNote(e.target.value)}
                  placeholder="Ghi chú lý do (tùy chọn)"
                  rows={2}
                  maxLength={200}
                  showCount
                  className="mt-2"
                />
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {summary && hasUnfinishedOrders(summary) ? (
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('shift:filter-unfinished')); }}
                className="w-full h-12 text-base font-bold"
                style={{ background: '#f97316', borderColor: '#f97316' }}
              >
                Xử lý đơn hàng
              </Button>
            ) : pendingRewardsCount > 0 ? (
              <Button
                type="primary"
                size="large"
                icon={<SwapOutlined />}
                onClick={() => { onClose(); navigate('/dashboard/reward-exchange'); }}
                className="w-full h-12 text-base font-bold"
                style={{ background: '#f97316', borderColor: '#f97316' }}
              >
                Xử lý đổi thưởng ({pendingRewardsCount})
              </Button>
            ) : canEnd ? (
              <Button
                type="primary"
                danger
                size="large"
                icon={<PoweroffOutlined />}
                onClick={handleConfirmEnd}
                loading={ending}
                className="w-full h-12 text-base font-bold"
              >
                XÁC NHẬN KẾT CA
              </Button>
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                <p className="text-xs text-yellow-200/70 text-center">
                  Vui lòng gửi đủ 3 báo cáo và xử lý hết đơn hàng/đổi thưởng để kết ca
                </p>
              </div>
            )}

            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={onClose}
              className="w-full h-12 text-base"
            >
              Quay lại
            </Button>
          </div>
        </div>
      </div>

      {/* SendReportDrawer for NVL */}
      <SendReportDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedDate={new Date(shiftDate)}
        selectedReportType={drawerReportType}
        onSuccess={handleDrawerSuccess}
        defaultShift={currentShiftEnum as any}
      />
    </>
  );
};

export default ShiftEndGate;
