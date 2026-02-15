"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Table, DatePicker, Button, Space, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import { ShieldAlert, UserCog, CalendarDays } from "lucide-react";
import dayjs from "@/lib/dayjs";
import RevenueCalendar from "@/components/admin/RevenueCalendar";
import "../admin-tabs.css";

const { RangePicker } = DatePicker;

interface FraudAlertRow {
  id: number;
  branch: string;
  serverLogId: number | null;
  actor: string;
  loginAt: string;
  note: string | null;
  createdAt: string;
}

interface AdminLoginRow {
  serverLogId: number;
  status: string;
  recordDate: string;
  recordTime: string;
  note: string | null;
  actor: string;
}

function formatDateTime(s: string | Date | null): string {
  if (!s) return "-";
  const d = typeof s === "string" ? s : (s as Date).toISOString?.() ?? "";
  if (d.length >= 19) return d.slice(0, 19).replace("T", " ");
  return d;
}

const defaultFrom = dayjs().subtract(1, "month").startOf("day");
const defaultTo = dayjs().endOf("day");

export default function FraudAlertsPage() {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([defaultFrom, defaultTo]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlertRow[]>([]);
  const [adminLogins, setAdminLogins] = useState<AdminLoginRow[]>([]);
  const [workShiftNames, setWorkShiftNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const queryParams = useMemo(() => {
    const from = dateRange[0].format("YYYY-MM-DD");
    const to = dateRange[1].format("YYYY-MM-DD");
    return `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/fraud-login-alerts?${queryParams}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch");
      setFraudAlerts(data.data?.fraudAlerts ?? []);
      setAdminLogins(data.data?.adminLogins ?? []);
      setWorkShiftNames(data.data?.workShiftNames ?? []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [queryParams]);

  const fraudColumns: ColumnsType<FraudAlertRow> = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Tài khoản", dataIndex: "actor", key: "actor", width: 120 },
    { title: "Thời gian đăng nhập", dataIndex: "loginAt", key: "loginAt", render: formatDateTime },
    { title: "Ghi chú", dataIndex: "note", key: "note", ellipsis: true },
    { title: "Ghi nhận lúc", dataIndex: "createdAt", key: "createdAt", render: formatDateTime, width: 160 },
  ];

  const adminColumns: ColumnsType<AdminLoginRow> = [
    { title: "ServerLogId", dataIndex: "serverLogId", key: "serverLogId", width: 100 },
    { title: "Tài khoản", dataIndex: "actor", key: "actor", width: 120 },
    { title: "Ngày", dataIndex: "recordDate", key: "recordDate" },
    { title: "Giờ", dataIndex: "recordTime", key: "recordTime" },
    { title: "Ghi chú", dataIndex: "note", key: "note", ellipsis: true },
  ];

  const tabItems = [
    {
      key: "revenue",
      label: (
        <span className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          Bất thường tiền bàn giao
        </span>
      ),
      children: (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            So sánh tiền bàn giao (tính toán) với tiền bàn giao thực tế. Các ngày có chênh lệch sẽ được đánh dấu màu đỏ.
          </p>
          <RevenueCalendar />
        </div>
      ),
    },
    {
      key: "login",
      label: (
        <span className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          Đăng nhập bất thường
        </span>
      ),
      children: (
        <div className="space-y-8">
          <div className="flex justify-end">
            <Space wrap>
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) setDateRange([dates[0], dates[1]]);
                }}
                format="DD/MM/YYYY"
                className="[&_.ant-picker-input>input]:!text-gray-900 [&_.ant-picker-separator]:!text-gray-500"
              />
              <Button type="primary" onClick={fetchData}>
                Lọc
              </Button>
            </Space>
          </div>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-white">Đăng nhập ngoài giờ làm việc</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Các tài khoản đăng nhập không thuộc bất kỳ ca làm việc nào đã cấu hình
              {workShiftNames.length > 0 ? ` (${workShiftNames.join(", ")})` : "."}
            </p>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table
                columns={fraudColumns}
                dataSource={fraudAlerts}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} bản ghi` }}
                size="small"
              />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <UserCog className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Lịch sử đăng nhập ADMIN</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">Các lần đăng nhập tài khoản ADMIN (từ serverlogtb).</p>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table
                columns={adminColumns}
                dataSource={adminLogins}
                rowKey="serverLogId"
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} bản ghi` }}
                size="small"
              />
            </div>
          </section>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Cảnh báo giao dịch bất thường</h2>
      <Tabs
        defaultActiveKey="revenue"
        items={tabItems}
        className="admin-tabs"
      />
    </div>
  );
}
