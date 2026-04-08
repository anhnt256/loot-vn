import React, { useEffect, useState, useRef } from 'react';
import { ToolOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { apiClient } from '@gateway-workspace/shared/utils/client';

function calcRemaining(endIso: string): { total: number; h: number; m: number; s: number } {
  const diff = Math.max(0, Math.floor((new Date(endIso).getTime() - Date.now()) / 1000));
  return {
    total: diff,
    h: Math.floor(diff / 3600),
    m: Math.floor((diff % 3600) / 60),
    s: diff % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

const Maintenance: React.FC = () => {
  const [note, setNote] = useState('');
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [scheduledEnd, setScheduledEnd] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<{ total: number; h: number; m: number; s: number } | null>(null);
  const [elapsed, setElapsed] = useState('');
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tenantConfig = (window as any).__TENANT_CONFIG__ ?? {};
  const primaryColor = tenantConfig.primaryColor || '#eb2b90';
  const tenantName = tenantConfig.name || 'Hệ thống';
  const logo = typeof tenantConfig.logo === 'string' ? tenantConfig.logo : tenantConfig.logo?.url;

  useEffect(() => {
    const check = async () => {
      try {
        const res = await apiClient.get('/maintenance/status');
        console.log('[Maintenance] status response:', res.data);
        if (!res.data?.enabled) {
          window.location.href = '/login';
          return;
        }
        setNote(res.data.note || '');
        setStartedAt(res.data.startedAt || null);
        // Ensure scheduledEnd is a valid ISO string, not empty/null
        const end = res.data.scheduledEnd;
        setScheduledEnd(end && typeof end === 'string' ? end : null);
      } catch {
        // keep showing maintenance
      }
    };

    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  // Countdown / elapsed ticker
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);

    const tick = () => {
      if (scheduledEnd) {
        // Có thời gian kết thúc → countdown
        const r = calcRemaining(scheduledEnd);
        setRemaining(r);
        setElapsed('');
        if (r.total <= 0) {
          window.location.href = '/login';
        }
      } else if (startedAt) {
        // Không có thời gian kết thúc → hiện đã bảo trì bao lâu
        setRemaining(null);
        const diff = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
        const m = Math.floor(diff / 60);
        const s = diff % 60;
        setElapsed(`${pad(m)}:${pad(s)}`);
      }
    };

    tick();
    tickRef.current = setInterval(tick, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [scheduledEnd, startedAt]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        {logo && (
          <img src={logo} alt="Logo" className="w-20 h-20 rounded-full mx-auto mb-6 object-cover shadow-lg" />
        )}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <ToolOutlined style={{ fontSize: 40, color: primaryColor }} />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          {tenantName} đang bảo trì
        </h1>

        <p className="text-gray-400 mb-4">
          Hệ thống đang được bảo trì để nâng cấp và cải thiện dịch vụ. Vui lòng quay lại sau.
        </p>

        {/* Note chỉ dùng nội bộ, không hiển thị cho client */}

        {/* Countdown - có scheduledEnd */}
        {remaining && remaining.total > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-3">
              <ClockCircleOutlined />
              <span>Dự kiến hoàn thành sau</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              {remaining.h > 0 && (
                <>
                  <div className="flex flex-col items-center">
                    <div
                      className="text-3xl font-bold rounded-xl w-16 h-16 flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      {pad(remaining.h)}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">giờ</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-600 -mt-4">:</span>
                </>
              )}
              <div className="flex flex-col items-center">
                <div
                  className="text-3xl font-bold rounded-xl w-16 h-16 flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  {pad(remaining.m)}
                </div>
                <span className="text-xs text-gray-500 mt-1">phút</span>
              </div>
              <span className="text-2xl font-bold text-gray-600 -mt-4">:</span>
              <div className="flex flex-col items-center">
                <div
                  className="text-3xl font-bold rounded-xl w-16 h-16 flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  {pad(remaining.s)}
                </div>
                <span className="text-xs text-gray-500 mt-1">giây</span>
              </div>
            </div>
          </div>
        )}

        {/* Không có scheduledEnd → hiện thời gian đã bảo trì */}
        {!scheduledEnd && elapsed && (
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-3">
              <ClockCircleOutlined />
              <span>Đã bảo trì được</span>
            </div>
            <div
              className="inline-block text-2xl font-mono font-bold rounded-xl px-6 py-3"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              {elapsed}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Hệ thống sẽ tự động chuyển hướng khi hoàn tất.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
