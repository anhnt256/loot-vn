import React, { useState } from 'react';
import { Button, App, Modal, DatePicker, Input, Spin, Tag } from 'antd';
import {
  PlayCircleOutlined,
  PoweroffOutlined,
  LockOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import { useShift } from '../hooks/useShift';
import { useShiftGuard } from '../hooks/useShiftGuard';
import PauseOrderButton from './PauseOrderButton';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:    { label: 'Chờ xác nhận', color: 'gold' },
  CHAP_NHAN:  { label: 'Chấp nhận',   color: 'blue' },
  THU_TIEN:   { label: 'Thu tiền',     color: 'purple' },
  PHUC_VU:    { label: 'Phục vụ',      color: 'orange' },
  HOAN_THANH: { label: 'Hoàn thành',   color: 'green' },
  HUY:        { label: 'Đã hủy',       color: 'red' },
};

interface ShiftSummary {
  shift: { id: number; staffName: string; startedAt: string };
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  byStatus: Record<string, number>;
}

function fmtMoney(v: number) {
  return v.toLocaleString('vi-VN') + ' đ';
}

const ShiftButton: React.FC = () => {
  const { notification } = App.useApp();
  const { currentShift, hasShift, isShiftOwner, canStartShift, startShift, endShift } = useShift();
  const { confirmShiftStart } = useShiftGuard();
  const [loading, setLoading] = useState(false);

  // End-shift modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [summary, setSummary] = useState<ShiftSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [pauseUntil, setPauseUntil] = useState<Dayjs | null>(null);
  const [pauseNote, setPauseNote] = useState('');
  const [ending, setEnding] = useState(false);

  const handleStart = async () => {
    const confirmed = await confirmShiftStart();
    if (!confirmed) return;
    setLoading(true);
    try {
      await startShift();
      notification.success({ message: 'Đã nhận ca!', placement: 'topRight' });
    } catch (err: any) {
      notification.error({
        message: err?.response?.data?.message ?? 'Không thể nhận ca',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const hasUnfinishedOrders = (s: ShiftSummary) => {
    return !!(s.byStatus['PENDING'] || s.byStatus['CHAP_NHAN'] || s.byStatus['THU_TIEN'] || s.byStatus['PHUC_VU']);
  };

  const openEndModal = async () => {
    setModalOpen(true);
    setSummaryLoading(true);
    setSummary(null);
    setPauseUntil(null);
    setPauseNote('');
    try {
      const res = await apiClient.get('/admin/orders/shift/summary');
      setSummary(res.data);
    } catch (err: any) {
      notification.error({
        message: err?.response?.data?.message ?? 'Không thể lấy thông tin ca',
        placement: 'topRight',
      });
      setModalOpen(false);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleConfirmEnd = async () => {
    // Chặn kết ca nếu còn đơn chưa hoàn thành
    if (summary && hasUnfinishedOrders(summary)) {
      notification.warning({
        message: 'Bạn cần hoàn thành tất cả đơn hàng trước khi kết ca',
        placement: 'topRight',
        duration: 5,
      });
      setModalOpen(false);
      // Fire event để OrderDrawer/OrderManagementPage tự filter đơn chưa hoàn thành
      window.dispatchEvent(new CustomEvent('shift:filter-unfinished'));
      return;
    }

    setEnding(true);
    try {
      // If user set a pause time, pause orders first
      if (pauseUntil) {
        await apiClient.post('/admin/orders/pause', {
          resumeAt: pauseUntil.toISOString(),
          note: pauseNote.trim() || undefined,
        });
      }

      await endShift();
      notification.success({ message: 'Đã kết ca thành công', placement: 'topRight' });
      setModalOpen(false);
    } catch (err: any) {
      notification.error({
        message: err?.response?.data?.message ?? 'Không thể kết ca',
        placement: 'topRight',
      });
    } finally {
      setEnding(false);
    }
  };

  const closeModal = () => {
    if (!ending) {
      setModalOpen(false);
      setSummary(null);
    }
  };

  // Đang có ca nhưng KHÔNG phải người nhận ca → chỉ hiển thị thông tin, khoá thao tác
  if (hasShift && !isShiftOwner) {
    return (
      <div className="flex items-center gap-2">
        <LockOutlined className="text-yellow-400" />
        <span className="text-xs text-yellow-400">
          {currentShift!.staffName} đang nhận ca ({dayjs(currentShift!.startedAt).format('HH:mm')})
        </span>
      </div>
    );
  }

  // Đang có ca VÀ là shift owner → hiển thị controls
  if (hasShift && isShiftOwner) {
    return (
      <>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:inline">
            {currentShift!.staffName} · {dayjs(currentShift!.startedAt).format('HH:mm')}
          </span>
          <PauseOrderButton />
          <Button
            icon={<PoweroffOutlined />}
            onClick={openEndModal}
            loading={loading}
            style={{ borderColor: '#ef4444', color: '#ef4444' }}
          >
            KẾT CA
          </Button>
        </div>

        <Modal
          open={modalOpen}
          title={
            <div className="flex items-center gap-2">
              <PoweroffOutlined style={{ color: '#ef4444' }} />
              <span>Kết thúc ca làm việc</span>
            </div>
          }
          onCancel={closeModal}
          footer={null}
          width={480}
          maskClosable={!ending}
          closable={!ending}
        >
          {summaryLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" />
            </div>
          ) : summary ? (
            <div className="flex flex-col gap-4 pt-2">
              {/* Shift info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Thông tin ca</p>
                <p className="text-sm font-medium">
                  {summary.shift.staffName} — từ {dayjs(summary.shift.startedAt).format('HH:mm DD/MM/YYYY')}
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <ShoppingCartOutlined style={{ fontSize: 20, color: '#3b82f6' }} />
                  <p className="text-2xl font-bold text-blue-600 mt-1">{summary.totalOrders}</p>
                  <p className="text-xs text-gray-500">Tổng đơn hàng</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <DollarOutlined style={{ fontSize: 20, color: '#22c55e' }} />
                  <p className="text-2xl font-bold text-green-600 mt-1">{fmtMoney(summary.totalRevenue)}</p>
                  <p className="text-xs text-gray-500">Doanh thu (hoàn thành)</p>
                </div>
              </div>

              {/* Status breakdown */}
              {Object.keys(summary.byStatus).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-2">Chi tiết theo trạng thái</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(summary.byStatus).map(([status, count]) => {
                      const cfg = STATUS_LABELS[status] ?? { label: status, color: 'default' };
                      return (
                        <Tag key={status} color={cfg.color}>
                          {cfg.label}: {count}
                        </Tag>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {hasUnfinishedOrders(summary) ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <CloseCircleOutlined style={{ color: '#ef4444', marginTop: 2 }} />
                  <div>
                    <p className="text-xs text-red-700 font-medium">
                      Bạn cần hoàn thành tất cả đơn hàng trước khi kết ca
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      Còn {(summary.byStatus['PENDING'] ?? 0) + (summary.byStatus['CHAP_NHAN'] ?? 0) + (summary.byStatus['THU_TIEN'] ?? 0) + (summary.byStatus['PHUC_VU'] ?? 0)} đơn chưa hoàn thành.
                      Nhấn "Xử lý đơn" để xem và xử lý các đơn này.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                  <CheckCircleOutlined style={{ color: '#22c55e', marginTop: 2 }} />
                  <p className="text-xs text-green-700">Tất cả đơn hàng đã được xử lý xong.</p>
                </div>
              )}

              {/* Optional pause — chỉ hiện khi đã hoàn thành hết đơn */}
              {!hasUnfinishedOrders(summary) && (
                <div className="border rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <ClockCircleOutlined />
                    Ngưng nhận đơn đến
                    <span className="text-gray-400 font-normal text-xs">(tùy chọn)</span>
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
              <div className="flex gap-3 pt-1">
                <Button className="flex-1" onClick={closeModal} disabled={ending}>
                  Hủy
                </Button>
                {hasUnfinishedOrders(summary) ? (
                  <Button
                    type="primary"
                    className="flex-1"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleConfirmEnd}
                    style={{ background: '#f97316', borderColor: '#f97316' }}
                  >
                    Xử lý đơn
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    danger
                    className="flex-1"
                    icon={<PoweroffOutlined />}
                    loading={ending}
                    onClick={handleConfirmEnd}
                  >
                    Xác nhận kết ca
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </Modal>
      </>
    );
  }

  // User không nằm trong ca làm việc → không hiện nút
  if (!canStartShift) {
    return null;
  }

  // Chưa có ca → nút nhận ca
  return (
    <Button
      type="primary"
      icon={<PlayCircleOutlined />}
      onClick={handleStart}
      loading={loading}
      style={{ background: '#22c55e', borderColor: '#22c55e' }}
    >
      NHẬN CA
    </Button>
  );
};

export default ShiftButton;
