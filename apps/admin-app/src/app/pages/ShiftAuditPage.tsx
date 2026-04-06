import React, { useState, useEffect, useCallback } from "react";
import {
  ReloadOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FilterOutlined,
  DownloadOutlined,
  ImportOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  Table,
  Tag,
  Button,
  Card,
  Breadcrumb,
  Space,
  Modal,
  Spin,
  DatePicker,
  Select,
  Descriptions,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { apiClient } from "@gateway-workspace/shared/utils/client";
import dayjs, { Dayjs } from "dayjs";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/* ── types ── */
interface ShiftAuditRow {
  id: number;
  staffName: string;
  staffId: number;
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  receiptCount: number;
  saleCount: number;
}

interface ReceiptItem {
  id: number;
  materialId: number;
  materialName: string;
  baseUnit: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  staffId: number;
  createdAt: string;
}

interface SaleItem {
  id: number;
  materialId: number;
  materialName: string;
  baseUnit: string;
  quantityChange: number;
  reason: string;
  referenceId: string;
  createdAt: string;
}

interface OrderDetail {
  id: number;
  computerName?: string;
  macAddress?: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  details: Array<{
    id: number;
    recipeName: string;
    quantity: number;
    salePrice: number;
    subtotal: number;
    note?: string;
  }>;
  statusHistory: Array<{
    status: string;
    changedAt: string;
    changedBy: number;
    note?: string;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CHAP_NHAN: "Chấp nhận",
  THU_TIEN: "Thu tiền",
  PHUC_VU: "Phục vụ",
  HOAN_THANH: "Hoàn thành",
  HUY: "Huỷ",
};

export default function InventoryAuditPage() {
  /* ── shift list ── */
  const [shifts, setShifts] = useState<ShiftAuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  /* ── filters ── */
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [filterStaff, setFilterStaff] = useState<string | undefined>(undefined);

  /* ── Nhập kho modal ── */
  const [receiptModal, setReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<{ shift: any; data: ReceiptItem[] } | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  /* ── Xuất kho modal ── */
  const [saleModal, setSaleModal] = useState(false);
  const [saleData, setSaleData] = useState<{ shift: any; data: SaleItem[]; orders: Record<number, OrderDetail> } | null>(null);
  const [saleLoading, setSaleLoading] = useState(false);

  /* ── Order detail modal ── */
  const [orderModal, setOrderModal] = useState(false);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  /* ── Orders list modal ── */
  const [ordersModal, setOrdersModal] = useState(false);
  const [ordersData, setOrdersData] = useState<{ shift: any; data: OrderDetail[] } | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersTitle, setOrdersTitle] = useState("");

  /* ── export ── */
  const [exporting, setExporting] = useState(false);

  const fetchShifts = useCallback(
    async (p = 1, range?: [Dayjs | null, Dayjs | null] | null, staff?: string | undefined) => {
      setLoading(true);
      try {
        const params: any = { page: p, limit: 15 };
        const r = range !== undefined ? range : dateRange;
        if (r && r[0]) params.from = r[0].startOf("day").toISOString();
        if (r && r[1]) params.to = r[1].endOf("day").toISOString();
        const s = staff !== undefined ? staff : filterStaff;
        if (s) params.staffName = s;
        const res = await apiClient.get("/admin/materials/shift-audit", { params });
        setShifts(res.data.data);
        setTotal(res.data.total);
        setPage(p);
      } catch (err) {
        console.error("Shift audit API fail:", err);
      } finally {
        setLoading(false);
      }
    },
    [dateRange, filterStaff]
  );

  useEffect(() => { fetchShifts(); }, [fetchShifts]);

  /* ── Open orders list ── */
  const openOrdersModal = async (e: React.MouseEvent, shiftId: number, status: string | undefined, title: string) => {
    e.stopPropagation();
    setOrdersTitle(title);
    setOrdersModal(true);
    setOrdersLoading(true);
    try {
      const params: any = {};
      if (status) params.status = status;
      const res = await apiClient.get(`/admin/materials/shift-audit/${shiftId}/orders`, { params });
      setOrdersData(res.data);
    } catch (err) {
      console.error(err);
      message.error("Không tải được danh sách đơn hàng");
    } finally {
      setOrdersLoading(false);
    }
  };

  /* ── Open Nhập kho detail ── */
  const openReceiptModal = async (e: React.MouseEvent, shiftId: number) => {
    e.stopPropagation();
    setReceiptModal(true);
    setReceiptLoading(true);
    try {
      const res = await apiClient.get(`/admin/materials/shift-audit/${shiftId}/receipts`);
      setReceiptData(res.data);
    } catch (err) {
      console.error(err);
      message.error("Không tải được chi tiết nhập kho");
    } finally {
      setReceiptLoading(false);
    }
  };

  /* ── Open Xuất kho detail ── */
  const openSaleModal = async (e: React.MouseEvent, shiftId: number) => {
    e.stopPropagation();
    setSaleModal(true);
    setSaleLoading(true);
    try {
      const res = await apiClient.get(`/admin/materials/shift-audit/${shiftId}/sales`);
      setSaleData(res.data);
    } catch (err) {
      console.error(err);
      message.error("Không tải được chi tiết xuất kho");
    } finally {
      setSaleLoading(false);
    }
  };

  /* ── Open order detail ── */
  const openOrderDetail = async (orderId: number) => {
    setOrderModal(true);
    setOrderLoading(true);
    try {
      const res = await apiClient.get(`/admin/materials/order-detail/${orderId}`);
      setOrderDetail(res.data);
    } catch (err) {
      console.error(err);
      message.error("Không tải được chi tiết đơn hàng");
    } finally {
      setOrderLoading(false);
    }
  };

  /* ── Export danh sách ca ── */
  const exportShiftListToExcel = async () => {
    setExporting(true);
    try {
      const params: any = { page: 1, limit: 9999 };
      if (dateRange && dateRange[0]) params.from = dateRange[0].startOf("day").toISOString();
      if (dateRange && dateRange[1]) params.to = dateRange[1].endOf("day").toISOString();
      const res = await apiClient.get("/admin/materials/shift-audit", { params });
      const all: ShiftAuditRow[] = res.data.data;
      if (all.length === 0) { message.warning("Không có dữ liệu"); return; }

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Báo cáo kết ca", { views: [{ state: "frozen", ySplit: 1 }] });
      const headers = ["STT", "Nhân viên", "Nhận ca", "Kết ca", "Tổng đơn", "Hoàn thành", "Huỷ", "Đang xử lý", "Nhập kho", "Xuất kho", "Doanh thu (VND)"];
      const hr = ws.addRow(headers);
      hr.eachCell((c) => {
        c.font = { bold: true, color: { argb: "FFFFFFFF" } };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF333333" } };
        c.alignment = { horizontal: "center" };
      });
      all.forEach((s, i) => {
        ws.addRow([
          i + 1, s.staffName,
          dayjs(s.startedAt).format("DD/MM/YYYY HH:mm"),
          s.endedAt ? dayjs(s.endedAt).format("DD/MM/YYYY HH:mm") : "Đang hoạt động",
          s.totalOrders, s.completedOrders, s.cancelledOrders,
          s.totalOrders - s.completedOrders - s.cancelledOrders,
          s.receiptCount, s.saleCount, s.totalRevenue,
        ]);
      });
      ws.columns = [{ width: 6 }, { width: 18 }, { width: 20 }, { width: 20 }, { width: 10 }, { width: 12 }, { width: 8 }, { width: 12 }, { width: 10 }, { width: 10 }, { width: 18 }];

      const buf = await wb.xlsx.writeBuffer();
      const rangeStr = dateRange?.[0] ? `${dateRange[0].format("DD_MM")}_${dateRange[1]?.format("DD_MM") ?? ""}` : dayjs().format("MM_YYYY");
      saveAs(new Blob([buf as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `BaoCao_KetCa_${rangeStr}.xlsx`);
      message.success("Xuất Excel thành công!");
    } catch (err) {
      message.error("Xuất Excel thất bại");
    } finally {
      setExporting(false);
    }
  };

  /* ── Table columns ── */
  const shiftColumns: ColumnsType<ShiftAuditRow> = [
    {
      title: "Ca làm việc",
      key: "time",
      width: 200,
      render: (_, r) => {
        const start = dayjs(r.startedAt);
        const end = r.endedAt ? dayjs(r.endedAt) : null;
        const isOvernight = end && !end.isSame(start, "day");
        return (
          <div>
            <div className="font-semibold text-gray-100">
              <ClockCircleOutlined className="mr-1" />
              {start.format("DD/MM/YYYY")}
            </div>
            <div className="text-gray-400 text-xs mt-1">
              Nhận ca: {start.format("HH:mm")}
              {end ? ` — Kết ca: ${isOvernight ? end.format("HH:mm (DD/MM)") : end.format("HH:mm")}` : ""}
              {r.isActive && <Tag color="green" className="ml-1">Đang hoạt động</Tag>}
            </div>
          </div>
        );
      },
    },
    {
      title: "Nhân viên",
      key: "staff",
      width: 150,
      render: (_, r) => <span><UserOutlined className="mr-1" />{r.staffName}</span>,
    },
    {
      title: "Tổng đơn",
      key: "totalOrders",
      align: "center",
      width: 90,
      render: (_, r) =>
        r.totalOrders > 0 ? (
          <Button type="link" size="small" className="p-0 text-gray-100" onClick={(e) => openOrdersModal(e, r.id, undefined, "Tất cả đơn hàng")}>
            {r.totalOrders}
          </Button>
        ) : <span className="text-gray-500">0</span>,
    },
    {
      title: "Hoàn thành",
      key: "completed",
      align: "center",
      width: 100,
      render: (_, r) =>
        r.completedOrders > 0 ? (
          <Button type="link" size="small" className="p-0" style={{ color: "#52c41a" }} onClick={(e) => openOrdersModal(e, r.id, "HOAN_THANH", "Đơn hoàn thành")}>
            <CheckCircleOutlined /> {r.completedOrders}
          </Button>
        ) : <span className="text-gray-500">0</span>,
    },
    {
      title: "Huỷ",
      key: "cancelled",
      align: "center",
      width: 70,
      render: (_, r) =>
        r.cancelledOrders > 0 ? (
          <Button type="link" size="small" className="p-0" style={{ color: "#f5222d" }} onClick={(e) => openOrdersModal(e, r.id, "HUY", "Đơn đã huỷ")}>
            <CloseCircleOutlined /> {r.cancelledOrders}
          </Button>
        ) : <span className="text-gray-500">0</span>,
    },
    {
      title: "Đang xử lý",
      key: "pending",
      align: "center",
      width: 100,
      render: (_, r) => {
        const pending = r.totalOrders - r.completedOrders - r.cancelledOrders;
        return pending > 0 ? (
          <Button type="link" size="small" className="p-0" style={{ color: "#faad14" }} onClick={(e) => openOrdersModal(e, r.id, "PENDING", "Đơn đang xử lý")}>
            {pending}
          </Button>
        ) : <span className="text-gray-500">0</span>;
      },
    },
    {
      title: "Nhập kho",
      key: "receipt",
      align: "center",
      width: 110,
      render: (_, r) =>
        r.receiptCount > 0 ? (
          <Button type="link" size="small" className="p-0" style={{ color: "#52c41a" }} onClick={(e) => openReceiptModal(e, r.id)}>
            <ImportOutlined /> {r.receiptCount} items
          </Button>
        ) : <span className="text-gray-500">—</span>,
    },
    {
      title: "Xuất kho",
      key: "sale",
      align: "center",
      width: 110,
      render: (_, r) =>
        r.saleCount > 0 ? (
          <Button type="link" size="small" className="p-0" style={{ color: "#fa8c16" }} onClick={(e) => openSaleModal(e, r.id)}>
            <ExportOutlined /> {r.saleCount} items
          </Button>
        ) : <span className="text-gray-500">—</span>,
    },
    {
      title: "Doanh thu",
      key: "revenue",
      align: "right",
      width: 140,
      render: (_, r) => (
        <span className="text-green-400 font-semibold">{r.totalRevenue.toLocaleString("vi-VN")} VND</span>
      ),
    },
  ];

  /* ── Receipt (Nhập kho) table columns ── */
  const receiptColumns: ColumnsType<ReceiptItem> = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 90,
      render: (val) => dayjs(val).format("HH:mm:ss"),
    },
    {
      title: "Nguyên liệu",
      dataIndex: "materialName",
      key: "materialName",
      width: 160,
      render: (name, r) => <span className="font-semibold">{name} <span className="text-gray-400 text-xs">({r.baseUnit})</span></span>,
    },
    {
      title: "SL trước",
      dataIndex: "quantityBefore",
      key: "quantityBefore",
      align: "right",
      width: 100,
      render: (val) => <span className="text-gray-300">{Number(val).toLocaleString()}</span>,
    },
    {
      title: "SL nhập",
      dataIndex: "quantityChange",
      key: "quantityChange",
      align: "right",
      width: 100,
      render: (val) => <span className="text-green-400 font-semibold">+{Number(val).toLocaleString()}</span>,
    },
    {
      title: "SL sau",
      dataIndex: "quantityAfter",
      key: "quantityAfter",
      align: "right",
      width: 100,
      render: (val) => <span className="text-blue-400 font-semibold">{Number(val).toLocaleString()}</span>,
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
    },
  ];

  /* ── Sale (Xuất kho) table columns ── */
  const saleColumns: ColumnsType<SaleItem> = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 90,
      render: (val) => dayjs(val).format("HH:mm:ss"),
    },
    {
      title: "Nguyên liệu",
      dataIndex: "materialName",
      key: "materialName",
      width: 150,
      render: (name, r) => <span className="font-semibold">{name} <span className="text-gray-400 text-xs">({r.baseUnit})</span></span>,
    },
    {
      title: "SL xuất",
      dataIndex: "quantityChange",
      key: "quantityChange",
      align: "right",
      width: 100,
      render: (val) => <span className="text-red-400 font-semibold">{Number(val).toLocaleString()}</span>,
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Đơn hàng",
      dataIndex: "referenceId",
      key: "referenceId",
      align: "center",
      width: 120,
      render: (refId) =>
        refId ? (
          <Button type="link" size="small" className="p-0" onClick={() => openOrderDetail(Number(refId))}>
            <EyeOutlined /> #{refId}
          </Button>
        ) : <span className="text-gray-500">—</span>,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Breadcrumb className="mb-2" items={[{ title: "Dashboard" }, { title: "Báo cáo kết ca" }]} />
          <h1 className="text-2xl font-bold text-white m-0">Báo cáo kết ca</h1>
          <p className="text-gray-400 text-sm mt-1 mb-0">
            Mỗi dòng tương ứng 1 ca. Click vào số items Nhập kho / Xuất kho để xem chi tiết.
          </p>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={exportShiftListToExcel} loading={exporting}>Xuất Excel</Button>
          <Button icon={<ReloadOutlined />} onClick={() => fetchShifts(page)} loading={loading}>Làm mới</Button>
        </Space>
      </div>

      <Card className="bg-gray-800 border-gray-700 mb-6 py-2 px-4">
        <Space size={20}>
          <div className="text-gray-300">Bộ lọc:</div>
          <DatePicker.RangePicker
            value={dateRange as any}
            onChange={(val) => setDateRange(val as [Dayjs | null, Dayjs | null] | null)}
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
            allowClear
          />
          <Select
            placeholder="Nhân viên"
            value={filterStaff}
            onChange={(val) => setFilterStaff(val)}
            allowClear
            style={{ width: 180 }}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={[...new Set(shifts.map((s) => s.staffName))].map((name) => ({
              value: name,
              label: name,
            }))}
          />
          <Button type="primary" icon={<FilterOutlined />} onClick={() => fetchShifts(1, dateRange, filterStaff)}>Lọc dữ liệu</Button>
        </Space>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <Table
          columns={shiftColumns}
          dataSource={shifts}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 15,
            total,
            onChange: (p) => fetchShifts(p),
            showTotal: (t) => `${t} ca`,
          }}
          className="custom-table"
        />
      </Card>

      {/* ── Modal Nhập kho ── */}
      <Modal
        title={receiptData ? `Nhập kho — Ca của ${receiptData.shift.staffName} (${dayjs(receiptData.shift.startedAt).format("DD/MM HH:mm")}${receiptData.shift.endedAt ? ` → ${dayjs(receiptData.shift.endedAt).format("HH:mm")}` : ""})` : "Nhập kho"}
        open={receiptModal}
        onCancel={() => { setReceiptModal(false); setReceiptData(null); }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {receiptLoading ? (
          <div className="flex justify-center py-10"><Spin size="large" /></div>
        ) : receiptData && receiptData.data.length > 0 ? (
          <Table columns={receiptColumns} dataSource={receiptData.data} rowKey="id" pagination={false} size="small" />
        ) : (
          <div className="text-center text-gray-400 py-10">Không có giao dịch nhập kho trong ca này</div>
        )}
      </Modal>

      {/* ── Modal Xuất kho ── */}
      <Modal
        title={saleData ? `Xuất kho — Ca của ${saleData.shift.staffName} (${dayjs(saleData.shift.startedAt).format("DD/MM HH:mm")}${saleData.shift.endedAt ? ` → ${dayjs(saleData.shift.endedAt).format("HH:mm")}` : ""})` : "Xuất kho"}
        open={saleModal}
        onCancel={() => { setSaleModal(false); setSaleData(null); }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {saleLoading ? (
          <div className="flex justify-center py-10"><Spin size="large" /></div>
        ) : saleData && saleData.data.length > 0 ? (
          <Table columns={saleColumns} dataSource={saleData.data} rowKey="id" pagination={false} size="small" />
        ) : (
          <div className="text-center text-gray-400 py-10">Không có giao dịch xuất kho trong ca này</div>
        )}
      </Modal>

      {/* ── Modal danh sách đơn hàng ── */}
      <Modal
        title={ordersData ? `${ordersTitle} — Ca của ${ordersData.shift.staffName} (${dayjs(ordersData.shift.startedAt).format("DD/MM HH:mm")}${ordersData.shift.endedAt ? ` → ${dayjs(ordersData.shift.endedAt).format("HH:mm")}` : ""})` : ordersTitle}
        open={ordersModal}
        onCancel={() => { setOrdersModal(false); setOrdersData(null); }}
        footer={null}
        width={900}
        destroyOnClose
      >
        {ordersLoading ? (
          <div className="flex justify-center py-10"><Spin size="large" /></div>
        ) : ordersData && ordersData.data.length > 0 ? (
          <Table
            dataSource={ordersData.data}
            rowKey="id"
            pagination={false}
            size="small"
            columns={[
              {
                title: "Mã đơn",
                dataIndex: "id",
                key: "id",
                width: 80,
                render: (id) => `#${id}`,
              },
              {
                title: "Máy",
                key: "computer",
                width: 120,
                render: (_, o: any) => o.computerName || o.macAddress || "—",
              },
              {
                title: "Sản phẩm",
                key: "items",
                render: (_, o: any) => (
                  <div>
                    {(o.details || []).map((d: any, i: number) => (
                      <div key={i} className="text-xs">
                        {d.recipeName} x{d.quantity}
                        {d.note && <span className="text-gray-400 ml-1">({d.note})</span>}
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                title: "Trạng thái",
                dataIndex: "status",
                key: "status",
                width: 120,
                render: (s: string) => (
                  <Tag color={s === "HOAN_THANH" ? "green" : s === "HUY" ? "red" : "blue"}>
                    {STATUS_LABELS[s] || s}
                  </Tag>
                ),
              },
              {
                title: "Tổng tiền",
                dataIndex: "totalAmount",
                key: "total",
                align: "right",
                width: 120,
                render: (v) => <span className="font-semibold">{Number(v).toLocaleString("vi-VN")} đ</span>,
              },
              {
                title: "Thời gian",
                dataIndex: "createdAt",
                key: "createdAt",
                width: 100,
                render: (v) => dayjs(v).format("HH:mm:ss"),
              },
              {
                title: "",
                key: "action",
                width: 50,
                render: (_, o: any) => (
                  <Button type="link" size="small" className="p-0" onClick={() => openOrderDetail(o.id)}>
                    <EyeOutlined />
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <div className="text-center text-gray-400 py-10">Không có đơn hàng</div>
        )}
      </Modal>

      {/* ── Modal chi tiết đơn hàng (đối chiếu) ── */}
      <Modal
        title={orderDetail ? `Đơn hàng #${orderDetail.id}` : "Chi tiết đơn hàng"}
        open={orderModal}
        onCancel={() => { setOrderModal(false); setOrderDetail(null); }}
        footer={null}
        width={600}
        destroyOnClose
      >
        {orderLoading ? (
          <div className="flex justify-center py-10"><Spin size="large" /></div>
        ) : orderDetail ? (
          <div>
            <Descriptions column={2} size="small" bordered className="mb-4">
              <Descriptions.Item label="Mã đơn">#{orderDetail.id}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={orderDetail.status === "HOAN_THANH" ? "green" : orderDetail.status === "HUY" ? "red" : "blue"}>
                  {STATUS_LABELS[orderDetail.status] || orderDetail.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Máy">{orderDetail.computerName || orderDetail.macAddress || "—"}</Descriptions.Item>
              <Descriptions.Item label="Thời gian">{dayjs(orderDetail.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                <span className="text-green-400 font-bold">{Number(orderDetail.totalAmount).toLocaleString("vi-VN")} VND</span>
              </Descriptions.Item>
            </Descriptions>

            <div className="font-semibold mb-2">Sản phẩm:</div>
            <Table
              dataSource={orderDetail.details}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: "Tên", dataIndex: "recipeName", key: "name" },
                { title: "SL", dataIndex: "quantity", key: "qty", align: "center", width: 60 },
                { title: "Đơn giá", dataIndex: "salePrice", key: "price", align: "right", width: 100, render: (v) => `${Number(v).toLocaleString()} đ` },
                { title: "Thành tiền", dataIndex: "subtotal", key: "sub", align: "right", width: 110, render: (v) => <span className="font-semibold">{Number(v).toLocaleString()} đ</span> },
              ]}
            />

            {orderDetail.statusHistory?.length > 0 && (
              <>
                <div className="font-semibold mb-2 mt-4">Lịch sử trạng thái:</div>
                {orderDetail.statusHistory.map((h, i) => (
                  <div key={i} className="text-xs text-gray-400 mb-1">
                    {dayjs(h.changedAt).format("HH:mm:ss")} — <Tag>{STATUS_LABELS[h.status] || h.status}</Tag>
                    {h.note && <span className="ml-1">({h.note})</span>}
                  </div>
                ))}
              </>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
