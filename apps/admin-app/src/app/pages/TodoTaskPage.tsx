import React, { useState, useEffect, useMemo } from 'react';
import {
  Button, Typography, Modal, Form, Input, Select, TimePicker, Checkbox,
  message, Space, Tag, Popconfirm, Tooltip, Empty, Skeleton, Table, DatePicker,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, ClockCircleOutlined, UserOutlined,
  FileTextOutlined, CheckCircleOutlined, WarningOutlined,
} from '@ant-design/icons';
import { apiClient } from '@gateway-workspace/shared/utils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface ReportItem {
  logId: number;
  taskId: number;
  taskTitle: string;
  taskDescription: string | null;
  startTime: string;
  assigneeId: number;
  assigneeName: string;
  assigneeUserName: string;
  notifiedAt: string;
  acknowledgedAt: string | null;
  repeatCount: number;
  responseTimeSeconds: number | null;
}

interface StaffOption { id: number; fullName: string; userName: string; workShiftId?: number | null }
interface ShiftOption { id: number; name: string; staffId: number | null }

interface ScheduleTask {
  id: number;
  title: string;
  description: string | null;
  startTime: string; // "HH:mm"
  daysOfWeek: number[]; // [0..6]
  assigneeId: number;
  createdById: number;
  color: string | null;
  repeatInterval: number;
  repeatMaxTimes: number;
  isActive: boolean;
  assignee: StaffOption;
  createdBy: StaffOption;
}

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DAY_FULL = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const TASK_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const TodoTaskPage: React.FC = () => {
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [shiftList, setShiftList] = useState<ShiftOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
  const [filterShiftId, setFilterShiftId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportDate, setReportDate] = useState(dayjs());

  const fetchReport = async (date?: dayjs.Dayjs) => {
    try {
      setReportLoading(true);
      const d = (date || reportDate).format('YYYY-MM-DD');
      const res = await apiClient.get(`/admin/schedule-tasks/daily-report?date=${d}`);
      setReportData(res.data);
    } catch {
      message.error('Không thể tải báo cáo');
    } finally {
      setReportLoading(false);
    }
  };

  const openReport = () => {
    setReportOpen(true);
    fetchReport();
  };

  const formatResponseTime = (seconds: number | null) => {
    if (seconds === null) return null;
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}p ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}p`;
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/schedule-tasks');
      setTasks(res.data);
    } catch {
      message.error('Không thể tải lịch công việc');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const [staffRes, shiftRes] = await Promise.all([
        apiClient.get('/admin/schedule-tasks/staff-list'),
        apiClient.get('/admin/schedule-tasks/shift-list'),
      ]);
      setStaffList(staffRes.data);
      setShiftList(shiftRes.data);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchStaff(); fetchTasks(); }, []);

  // Staff IDs thuộc ca đang filter (WorkShift.staffId = staff đại diện ca)
  const filteredStaffIds = useMemo(() => {
    if (!filterShiftId) return null;
    const shift = shiftList.find(s => s.id === filterShiftId);
    if (!shift || !shift.staffId) return new Set<number>();
    return new Set([shift.staffId]);
  }, [filterShiftId, shiftList]);

  // Group tasks by day + hour (có lọc theo ca)
  const taskGrid = useMemo(() => {
    const grid: Record<string, ScheduleTask[]> = {};
    tasks.forEach(task => {
      if (filteredStaffIds && !filteredStaffIds.has(task.assigneeId)) return;
      const hour = parseInt(task.startTime.split(':')[0], 10);
      (task.daysOfWeek as number[]).forEach(day => {
        const key = `${day}-${hour}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(task);
      });
    });
    return grid;
  }, [tasks, filteredStaffIds]);

  const handleAdd = (day?: number, hour?: number) => {
    setEditingTask(null);
    form.resetFields();
    form.setFieldsValue({
      daysOfWeek: day !== undefined ? [day] : [1, 2, 3, 4, 5, 6],
      startTime: hour !== undefined ? dayjs().hour(hour).minute(0) : dayjs().hour(8).minute(0),
      color: TASK_COLORS[tasks.length % TASK_COLORS.length],
    });
    setModalOpen(true);
  };

  const handleEdit = (task: ScheduleTask) => {
    setEditingTask(task);
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      startTime: dayjs(task.startTime, 'HH:mm'),
      daysOfWeek: task.daysOfWeek,
      assigneeId: task.assigneeId,
      color: task.color || TASK_COLORS[0],
      repeatInterval: task.repeatInterval || 0,
      repeatMaxTimes: task.repeatMaxTimes || 0,
    });
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      const payload = {
        title: values.title,
        description: values.description || null,
        startTime: values.startTime.format('HH:mm'),
        daysOfWeek: values.daysOfWeek,
        assigneeId: values.assigneeId,
        color: values.color,
        repeatInterval: values.repeatInterval || 0,
        repeatMaxTimes: values.repeatMaxTimes || 0,
      };
      if (editingTask) {
        await apiClient.put(`/admin/schedule-tasks/${editingTask.id}`, payload);
        message.success('Cập nhật thành công');
      } else {
        await apiClient.post('/admin/schedule-tasks', payload);
        message.success('Tạo lịch công việc thành công');
      }
      setModalOpen(false);
      fetchTasks();
    } catch {
      message.error('Lỗi khi lưu');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/admin/schedule-tasks/${id}`);
      message.success('Đã xoá');
      fetchTasks();
    } catch {
      message.error('Không thể xoá');
    }
  };

  // Current time indicator
  const now = dayjs();
  const currentDay = now.day(); // 0=CN
  const currentHour = now.hour();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Title level={4} style={{ margin: 0 }}>Lịch công việc tuần</Title>
          <p className="text-[#64748b] text-sm mt-1">
            Thời khoá biểu công việc lặp lại hằng tuần. Hệ thống sẽ nhắc nhở đúng giờ.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<FileTextOutlined />}
            className="h-10 px-6 font-semibold rounded-lg"
            onClick={openReport}
          >
            Xem báo cáo
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-[#003594] h-10 px-6 font-semibold rounded-lg"
            onClick={() => handleAdd()}
          >
            Thêm công việc
          </Button>
        </div>
      </div>

      {/* Filter by shift */}
      {shiftList.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center">
          <Tag
            className="cursor-pointer text-xs px-3 py-1"
            color={!filterShiftId ? '#003594' : 'default'}
            onClick={() => setFilterShiftId(null)}
          >
            Tất cả
          </Tag>
          {shiftList.map(shift => (
            <Tag
              key={shift.id}
              className="cursor-pointer text-xs px-3 py-1"
              color={filterShiftId === shift.id ? '#003594' : 'default'}
              onClick={() => setFilterShiftId(filterShiftId === shift.id ? null : shift.id)}
            >
              {shift.name}
            </Tag>
          ))}
        </div>
      )}

      {/* Timetable grid */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-auto">
        {loading ? (
          <div className="p-6"><Skeleton active paragraph={{ rows: 10 }} /></div>
        ) : (
          <table className="w-full border-collapse min-w-[900px]" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th className="w-[60px] p-2 text-center text-[11px] font-bold text-[#64748b] border-b border-r border-[#e2e8f0] bg-[#f8fafc] sticky left-0 z-10">
                  Giờ
                </th>
                {[1, 2, 3, 4, 5, 6, 0].map(day => (
                  <th
                    key={day}
                    className={`p-2 text-center text-[12px] font-bold border-b border-r border-[#e2e8f0] ${
                      day === currentDay ? 'bg-blue-50 text-blue-700' : 'bg-[#f8fafc] text-[#64748b]'
                    }`}
                  >
                    {DAY_FULL[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(hour => (
                <tr key={hour} className={hour === currentHour ? 'bg-blue-50/30' : ''}>
                  <td className="p-1 text-center text-[11px] font-mono text-[#94a3b8] border-b border-r border-[#e2e8f0] bg-[#f8fafc] sticky left-0 z-10">
                    {String(hour).padStart(2, '0')}:00
                  </td>
                  {[1, 2, 3, 4, 5, 6, 0].map(day => {
                    const key = `${day}-${hour}`;
                    const cellTasks = taskGrid[key] || [];
                    const isNow = day === currentDay && hour === currentHour;
                    return (
                      <td
                        key={day}
                        className={`p-1 border-b border-r border-[#e2e8f0] align-top cursor-pointer hover:bg-blue-50/50 transition-colors ${
                          isNow ? 'ring-2 ring-inset ring-blue-400' : ''
                        }`}
                        style={{ minHeight: 40, height: 40 }}
                        onClick={() => handleAdd(day, hour)}
                      >
                        <div className="flex flex-col gap-1">
                          {cellTasks.map(task => (
                            <Tooltip
                              key={task.id}
                              title={
                                <div>
                                  <div className="font-bold">{task.title}</div>
                                  {task.description && <div className="text-xs mt-1">{task.description}</div>}
                                  <div className="text-xs mt-1">
                                    <UserOutlined /> {task.assignee.fullName}
                                  </div>
                                  <div className="text-xs">
                                    <ClockCircleOutlined /> {task.startTime} | {(task.daysOfWeek as number[]).map(d => DAY_LABELS[d]).join(', ')}
                                  </div>
                                </div>
                              }
                            >
                              <div
                                className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white truncate flex items-center justify-between group cursor-pointer"
                                style={{ backgroundColor: task.color || '#3b82f6' }}
                                onClick={(e) => { e.stopPropagation(); handleEdit(task); }}
                              >
                                <span className="truncate">{task.startTime} {task.title}</span>
                                <span className="hidden group-hover:flex gap-0.5 ml-1 flex-shrink-0">
                                  <EditOutlined
                                    className="cursor-pointer hover:opacity-70"
                                    onClick={(e) => { e.stopPropagation(); handleEdit(task); }}
                                  />
                                  <Popconfirm
                                    title="Xoá công việc này?"
                                    onConfirm={() => handleDelete(task.id)}
                                    okText="Xoá"
                                    cancelText="Hủy"
                                  >
                                    <DeleteOutlined
                                      className="cursor-pointer hover:opacity-70"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </Popconfirm>
                                </span>
                              </div>
                            </Tooltip>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal tạo/sửa */}
      <Modal
        title={editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-[#003594]', icon: <SaveOutlined /> }}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} className="mt-4">
          <Form.Item name="title" label="Tên công việc" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="VD: Dọn vệ sinh, Kiểm tra máy, Kết ca..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Chi tiết công việc (nếu cần)" />
          </Form.Item>

          <Form.Item name="assigneeId" label="Giao cho" rules={[{ required: true, message: 'Vui lòng chọn người thực hiện' }]}>
            <Select
              placeholder="Chọn nhân viên"
              showSearch
              optionFilterProp="label"
              options={staffList.map(s => ({ value: s.id, label: `${s.fullName} (@${s.userName})` }))}
            />
          </Form.Item>

          <div className="flex gap-4">
            <Form.Item name="startTime" label="Giờ thực hiện" rules={[{ required: true, message: 'Chọn giờ' }]} className="flex-1">
              <TimePicker format="HH:mm" className="w-full" minuteStep={1} />
            </Form.Item>

            <Form.Item name="color" label="Màu" className="w-[100px]">
              <Select>
                {TASK_COLORS.map(c => (
                  <Select.Option key={c} value={c}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: c }} />
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="daysOfWeek"
            label="Ngày trong tuần"
            rules={[{ required: true, message: 'Chọn ít nhất 1 ngày' }]}
          >
            <Checkbox.Group className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 0].map(day => (
                <Checkbox key={day} value={day} className="!ml-0">
                  {DAY_FULL[day]}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>

          <div className="flex gap-4">
            <Form.Item name="repeatInterval" label="Nhắc lại sau (phút)" className="flex-1">
              <Select
                placeholder="Không nhắc lại"
                allowClear
                options={[
                  { value: 0, label: 'Không nhắc lại' },
                  { value: 1, label: '1 phút' },
                  { value: 3, label: '3 phút' },
                  { value: 5, label: '5 phút' },
                  { value: 10, label: '10 phút' },
                  { value: 15, label: '15 phút' },
                  { value: 30, label: '30 phút' },
                ]}
              />
            </Form.Item>
            <Form.Item name="repeatMaxTimes" label="Tối đa (lần)" className="flex-1">
              <Select
                placeholder="0"
                options={[
                  { value: 0, label: '0' },
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Modal báo cáo */}
      <Modal
        title={`Báo cáo công việc — ${reportDate.format('DD/MM/YYYY')}`}
        open={reportOpen}
        onCancel={() => setReportOpen(false)}
        footer={null}
        width={900}
      >
        <div className="flex items-center gap-3 mb-4">
          <DatePicker
            value={reportDate}
            onChange={(d) => { if (d) { setReportDate(d); fetchReport(d); } }}
            format="DD/MM/YYYY"
            allowClear={false}
          />
          <div className="text-sm text-[#64748b]">
            Tổng: <b>{reportData.length}</b> thông báo
            {' | '}
            Đã xác nhận: <b>{reportData.filter(r => r.acknowledgedAt).length}</b>
            {' | '}
            Chưa xác nhận: <b className="text-red-500">{reportData.filter(r => !r.acknowledgedAt).length}</b>
          </div>
        </div>
        <Table
          dataSource={reportData}
          rowKey="logId"
          loading={reportLoading}
          size="small"
          pagination={false}
          scroll={{ y: 500 }}
          columns={[
            {
              title: 'Giờ',
              dataIndex: 'startTime',
              width: 60,
              sorter: (a: ReportItem, b: ReportItem) => a.startTime.localeCompare(b.startTime),
            },
            {
              title: 'Công việc',
              dataIndex: 'taskTitle',
              ellipsis: true,
            },
            {
              title: 'Nhân viên',
              dataIndex: 'assigneeName',
              width: 130,
              ellipsis: true,
            },
            {
              title: 'Số lần nhắc',
              dataIndex: 'repeatCount',
              width: 100,
              align: 'center' as const,
              render: (val: number) => (
                <Tag color={val === 0 ? 'green' : val <= 2 ? 'orange' : 'red'}>
                  {val + 1} lần
                </Tag>
              ),
              sorter: (a: ReportItem, b: ReportItem) => a.repeatCount - b.repeatCount,
            },
            {
              title: 'Trạng thái',
              width: 110,
              align: 'center' as const,
              render: (_: any, r: ReportItem) => r.acknowledgedAt ? (
                <Tag icon={<CheckCircleOutlined />} color="success">Đã xác nhận</Tag>
              ) : (
                <Tag icon={<WarningOutlined />} color="error">Chưa xác nhận</Tag>
              ),
              filters: [
                { text: 'Đã xác nhận', value: 'ack' },
                { text: 'Chưa xác nhận', value: 'pending' },
              ],
              onFilter: (val: any, r: ReportItem) => val === 'ack' ? !!r.acknowledgedAt : !r.acknowledgedAt,
            },
            {
              title: 'Thời gian phản hồi',
              width: 130,
              align: 'center' as const,
              render: (_: any, r: ReportItem) => {
                if (!r.acknowledgedAt) return <span className="text-[#94a3b8]">—</span>;
                const formatted = formatResponseTime(r.responseTimeSeconds);
                const isLong = r.responseTimeSeconds !== null && r.responseTimeSeconds > 300;
                return <span className={isLong ? 'text-red-500 font-semibold' : 'text-green-600'}>{formatted}</span>;
              },
              sorter: (a: ReportItem, b: ReportItem) => (a.responseTimeSeconds ?? 99999) - (b.responseTimeSeconds ?? 99999),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default TodoTaskPage;
