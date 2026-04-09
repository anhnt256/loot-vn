import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, App } from 'antd';
import {
  FileTextOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  FireOutlined,
  CoffeeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { apiClient, removeToken } from '@gateway-workspace/shared/utils/client';

import { useShift } from '../hooks/useShift';
import { useShiftGuard } from '../hooks/useShiftGuard';
import SendReportDrawer from '../pages/handover-reports/components/SendReportDrawer';
import { REPORT_TYPE_ENUM } from '../pages/handover-reports/constants';

interface WorkShiftJwt {
  id: number;
  name: string;
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
  isOvernight: boolean;
  staffId?: number | null;
}

interface ShiftWelcomeGateProps {
  staffName: string;
  tenantLogo: string | null;
  primaryColor: string;
  workShifts: WorkShiftJwt[];
}

/** Match current time to a WorkShift (same logic as backend) */
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
  return workShifts[0] || null; // fallback
}

/** Strip Vietnamese diacritics to plain ASCII */
function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/g, 'd').replace(/\u0110/g, 'D');
}

/** Map WorkShift.name ("Ca sáng", "Ca tối", "CASANG"...) to shift enum (SANG, CHIEU, TOI) */
function mapWorkShiftNameToEnum(name: string): string {
  const normalized = removeDiacritics(name).toUpperCase();
  if (normalized.includes('SANG')) return 'SANG';
  if (normalized.includes('CHIEU') || normalized.includes('DEM')) return 'CHIEU';
  if (normalized.includes('TOI')) return 'TOI';
  return 'SANG'; // fallback
}

/** Detect which WorkShift the account name refers to */
function detectAccountWorkShift(accountName: string, workShifts: WorkShiftJwt[]): WorkShiftJwt | null {
  const accountNorm = removeDiacritics(accountName).toLowerCase();
  // Match account name against each WorkShift name (both normalized to no-diacritics)
  for (const ws of workShifts) {
    const wsNorm = removeDiacritics(ws.name).toLowerCase().replace(/\s/g, '');
    if (accountNorm.includes(wsNorm) || wsNorm.includes(accountNorm.replace(/\s/g, ''))) {
      return ws;
    }
  }
  // Keyword fallback
  const keywords: Array<{ words: string[]; shiftWord: string }> = [
    { words: ['sang'], shiftWord: 'SANG' },
    { words: ['toi'], shiftWord: 'TOI' },
    { words: ['dem'], shiftWord: 'DEM' },
    { words: ['chieu'], shiftWord: 'CHIEU' },
  ];
  for (const kw of keywords) {
    if (kw.words.some((w) => accountNorm.includes(w))) {
      const found = workShifts.find((ws) => removeDiacritics(ws.name).toUpperCase().includes(kw.shiftWord));
      if (found) return found;
    }
  }
  return null;
}

/** Format WorkShift name for display: "CASANG" -> "Ca S\u00e1ng", or use as-is if already readable */
function formatShiftName(ws: WorkShiftJwt): string {
  const n = ws.name;
  // If already contains spaces or Vietnamese chars, use as-is
  if (n.includes(' ') || /[\u00C0-\u1EF9]/.test(n)) return n;
  // Convert machine names
  const upper = n.toUpperCase();
  if (upper === 'CASANG') return 'Ca S\u00e1ng';
  if (upper === 'CACHIEU') return 'Ca Chi\u1ec1u';
  if (upper === 'CATOI') return 'Ca T\u1ed1i';
  if (upper === 'CADEM') return 'Ca \u0110\u00eam';
  // Fallback: add "Ca " prefix
  return `Ca ${n}`;
}

const ShiftWelcomeGate: React.FC<ShiftWelcomeGateProps> = ({ staffName, tenantLogo, primaryColor, workShifts }) => {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const { startShift, workShiftSchedule } = useShift();
  const { confirmShiftStart } = useShiftGuard();

  const [reportStatus, setReportStatus] = useState<{ bep: boolean; nuoc: boolean } | null>(null);
  const [checking, setChecking] = useState(true);
  const [startingShift, setStartingShift] = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerReportType, setDrawerReportType] = useState<string>(REPORT_TYPE_ENUM.BAO_CAO_BEP);

  // Ưu tiên workShiftSchedule từ API (match theo staffId), fallback tìm theo giờ
  const currentWorkShift = useMemo(() => {
    if (workShiftSchedule) return workShiftSchedule as WorkShiftJwt;
    return findCurrentWorkShift(workShifts);
  }, [workShiftSchedule, workShifts]);
  const currentShiftEnum = currentWorkShift ? mapWorkShiftNameToEnum(currentWorkShift.name) : 'SANG';
  const currentShiftDisplay = currentWorkShift ? formatShiftName(currentWorkShift) : 'Ca';

  // Detect account/shift mismatch
  const accountWorkShift = useMemo(() => detectAccountWorkShift(staffName, workShifts), [staffName, workShifts]);
  const isShiftMismatch = accountWorkShift !== null && currentWorkShift !== null && accountWorkShift.id !== currentWorkShift.id;
  const accountShiftDisplay = accountWorkShift ? formatShiftName(accountWorkShift) : '';

  const checkReports = useCallback(async () => {
    setChecking(true);
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const res = await apiClient.get('/admin/handover-reports/check-start-reports', {
        params: { date: today, shift: currentShiftEnum },
      });
      setReportStatus({ bep: res.data.bep, nuoc: res.data.nuoc });
    } catch {
      setReportStatus({ bep: false, nuoc: false });
    } finally {
      setChecking(false);
    }
  }, [currentShiftEnum]);

  useEffect(() => {
    checkReports();
  }, [checkReports]);

  const handleOpenDrawer = (reportType: string) => {
    setDrawerReportType(reportType);
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    checkReports();
  };

  const handleStartShift = async () => {
    const confirmed = await confirmShiftStart();
    if (!confirmed) return;

    setStartingShift(true);
    try {
      await startShift();
      notification.success({ title: '\u0110\u00e3 nh\u1eadn ca!', placement: 'topRight' });
    } catch (err: any) {
      notification.error({
        title: err?.response?.data?.message ?? 'Kh\u00f4ng th\u1ec3 nh\u1eadn ca',
        placement: 'topRight',
      });
    } finally {
      setStartingShift(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const allReady = reportStatus?.bep && reportStatus?.nuoc;
  const shiftTimeRange = currentWorkShift
    ? `${currentWorkShift.startTime.slice(0, 5)} - ${currentWorkShift.endTime.slice(0, 5)}`
    : '';

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {tenantLogo && (
            <div className="flex justify-center">
              <img
                src={tenantLogo}
                alt="Logo"
                className="w-20 h-20 rounded-full object-cover shadow-lg border-2"
                style={{ borderColor: primaryColor }}
              />
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">
              {'Xin ch\u00e0o, '}{staffName}!
            </h1>
            <p className="text-sm text-gray-400">
              {currentShiftDisplay}{shiftTimeRange ? ` (${shiftTimeRange})` : ''}{' \u2014 '}{dayjs().format('DD/MM/YYYY')}
            </p>
          </div>

          {/* C\u1ea3nh b\u00e1o sai ca */}
          {isShiftMismatch && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 flex items-start gap-3 text-left">
              <WarningOutlined style={{ fontSize: 20, color: '#ef4444', marginTop: 2 }} />
              <div>
                <p className="text-sm text-red-300 font-medium">
                  {'Sai t\u00e0i kho\u1ea3n ca l\u00e0m vi\u1ec7c!'}
                </p>
                <p className="text-xs text-red-400/80 mt-1">
                  {'Hi\u1ec7n t\u1ea1i \u0111ang l\u00e0 khung gi\u1edd '}
                  <strong>{currentShiftDisplay}</strong>
                  {', nh\u01b0ng b\u1ea1n \u0111ang s\u1eed d\u1ee5ng t\u00e0i kho\u1ea3n '}
                  <strong>{accountShiftDisplay}</strong>
                  {'. Vui l\u00f2ng ki\u1ec3m tra l\u1ea1i v\u00e0 \u0111\u0103ng nh\u1eadp \u0111\u00fang t\u00e0i kho\u1ea3n.'}
                </p>
              </div>
            </div>
          )}

          {/* Report status cards */}
          <div className="space-y-3">
            <p className="text-sm text-yellow-200 font-medium">
              {'G\u1eedi b\u00e1o c\u00e1o \u0111\u1ea7u ca \u0111\u1ec3 b\u1eaft \u0111\u1ea7u l\u00e0m vi\u1ec7c:'}
            </p>

            {/* B\u00e1o c\u00e1o B\u1ebfp */}
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
                  <p className="text-white font-medium">{'B\u00e1o c\u00e1o B\u1ebfp'}</p>
                  <p className="text-xs text-gray-400">{'NVL B\u1ebfp \u0111\u1ea7u ca'}</p>
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
                  {'K\u00ea khai'}
                </Button>
              )}
            </div>

            {/* B\u00e1o c\u00e1o N\u01b0\u1edbc */}
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
                  <p className="text-white font-medium">{'B\u00e1o c\u00e1o N\u01b0\u1edbc'}</p>
                  <p className="text-xs text-gray-400">{'NVL N\u01b0\u1edbc \u0111\u1ea7u ca'}</p>
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
                  {'K\u00ea khai'}
                </Button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-2">
            {allReady ? (
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleStartShift}
                loading={startingShift}
                className="w-full h-12 text-base font-bold"
                style={{ background: '#22c55e', borderColor: '#22c55e' }}
              >
                {'NH\u1eacN CA'}
              </Button>
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                <p className="text-xs text-yellow-200/70">
                  {'Vui l\u00f2ng g\u1eedi \u0111\u1ee7 c\u1ea3 2 b\u00e1o c\u00e1o \u0111\u1ec3 nh\u1eadn ca'}
                </p>
              </div>
            )}
            <Button
              size="large"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="w-full h-12 text-base"
              danger
            >
              {'Tho\u00e1t'}
            </Button>
          </div>
        </div>
      </div>

      {/* SendReportDrawer */}
      <SendReportDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedDate={new Date()}
        selectedReportType={drawerReportType}
        onSuccess={handleDrawerSuccess}
        defaultShift={currentShiftEnum as any}
      />
    </>
  );
};

export default ShiftWelcomeGate;
