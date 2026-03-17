import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Empty, Tag } from 'antd';
import { 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  AlertCircle,
  Activity
} from 'lucide-react';
import { apiClient } from '@gateway-workspace/shared/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const { Title, Text } = Typography;

interface DashboardStats {
  totalStaff: number;
  staffChange: number;
  totalSalary: number;
  salaryChange: number;
  totalBonus: number;
  totalPenalty: number;
  totalHours: number;
  chartData: { label: string; value: number; salaryValue: number }[];
}

const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/hr-manager/dashboard/stats');
      console.log('[DashboardHome] API Response:', response.data);
      if (response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Đang tải dữ liệu tổng quan..." />
      </div>
    );
  }

  if (!stats) {
    return <Empty description="Không có dữ liệu thống kê" />;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end mb-4">
        <div>
          <Title level={2} className="!mb-1">Tổng quan sức khỏe doanh nghiệp</Title>
          <Text type="secondary">Phân tích hiệu suất nhân sự và tài chính tháng này</Text>
        </div>
        <Tag color="blue" icon={<Activity size={14} className="mr-1" />} className="px-3 py-1 text-sm font-medium rounded-full">
          Cập nhật: {new Date().toLocaleTimeString('vi-VN')}
        </Tag>
      </div>

      {/* Main Stats Row */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card className="h-full hover:shadow-md transition-shadow border-none bg-gradient-to-br from-orange-50 to-white" styles={{ body: { padding: '24px' } }}>
            <div className="flex justify-between items-start">
              <Statistic
                title={<span className="text-orange-600 font-bold text-lg flex items-center gap-2"><DollarSign size={22} /> Tổng quỹ lương tháng này</span>}
                value={stats.totalSalary}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ fontWeight: 900, color: '#ea580c', fontSize: '32px' }}
              />
              <div className="pt-2">
                {stats.salaryChange > 0 ? (
                  <Tag color="error" icon={<TrendingUp size={14} />} className="rounded-full font-bold">
                    +{stats.salaryChange}%
                  </Tag>
                ) : stats.salaryChange < 0 ? (
                  <Tag color="success" icon={<TrendingDown size={14} />} className="rounded-full font-bold">
                    {stats.salaryChange}%
                  </Tag>
                ) : (
                  <Tag color="blue" className="rounded-full font-bold">
                    0%
                  </Tag>
                )}
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/50 rounded-lg border border-orange-100">
              <div className="flex justify-between items-center mb-1">
                <Text type="secondary" className="text-xs">Lương cứng dự kiến:</Text>
                <Text className="font-semibold text-sm">{formatCurrency(stats.totalSalary - stats.totalBonus + stats.totalPenalty)}</Text>
              </div>
              <Text type="secondary" className="text-[11px] italic">Đã bao gồm điều chỉnh Thưởng (+{formatCurrency(stats.totalBonus)}) và Phạt (-{formatCurrency(stats.totalPenalty)})</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={16}>
          <Row gutter={[24, 24]} className="h-full">
            <Col span={12}>
              <div className="flex flex-col h-full justify-between">
                <Card 
                  className="hover:shadow-md transition-shadow border-none bg-emerald-50" 
                  style={{ height: '40%', display: 'flex', flexDirection: 'column' }}
                  styles={{ body: { padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' } }}
                >
                  <Statistic
                    title={<span className="text-emerald-600 font-semibold flex items-center gap-2 text-xs"><Clock size={16} /> TỔNG GIỜ LÀM</span>}
                    value={stats.totalHours}
                    suffix={<span className="text-gray-400 text-xs font-normal">giờ</span>}
                    valueStyle={{ fontWeight: 800, color: '#059669', fontSize: '24px' }}
                  />
                </Card>
                <Card 
                  className="hover:shadow-md transition-shadow border-none bg-blue-50" 
                  style={{ height: '40%', display: 'flex', flexDirection: 'column' }}
                  styles={{ body: { padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' } }}
                >
                  <Statistic
                    title={<span className="text-blue-600 font-semibold flex items-center gap-2 text-xs"><Users size={16} /> NHÂN SỰ</span>}
                    value={stats.totalStaff}
                    suffix={<span className="text-gray-400 text-xs font-normal">người</span>}
                    valueStyle={{ fontWeight: 800, color: '#1a73e8', fontSize: '24px' }}
                  />
                </Card>
              </div>
            </Col>
            <Col span={12}>
              <div className="flex flex-col h-full justify-between">
                <Card 
                  className="hover:shadow-md transition-shadow border-none bg-amber-50" 
                  style={{ height: '40%', display: 'flex', flexDirection: 'column' }}
                  styles={{ body: { padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' } }}
                >
                  <Statistic
                    title={<span className="text-amber-600 font-semibold flex items-center gap-2 text-xs"><Award size={16} /> TỔNG THƯỞNG</span>}
                    value={stats.totalBonus}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{ fontWeight: 800, color: '#d97706', fontSize: '24px' }}
                  />
                </Card>
                <Card 
                  className="hover:shadow-md transition-shadow border-none bg-red-50" 
                  style={{ height: '40%', display: 'flex', flexDirection: 'column' }}
                  styles={{ body: { padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' } }}
                >
                  <Statistic
                    title={<span className="text-red-600 font-semibold flex items-center gap-2 text-xs"><AlertCircle size={16} /> TỔNG PHẠT</span>}
                    value={stats.totalPenalty}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{ fontWeight: 800, color: '#dc2626', fontSize: '24px' }}
                  />
                </Card>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Chart and Detail Row */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title={<span className="flex items-center gap-2"><TrendingUp size={18} className="text-orange-500" /> Biến động quỹ lương 6 tháng qua</span>}
            className="shadow-sm border-gray-100 rounded-xl overflow-hidden"
          >
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#ea580c', fontWeight: 'bold' }}
                    formatter={(value) => [formatCurrency(Number(value)), "Quỹ lương"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="salaryValue" 
                    stroke="#ea580c" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSalary)" 
                    name="Quỹ lương"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title="Thông tin nhanh" 
            className="h-full shadow-sm border-gray-100 rounded-xl"
          >
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">Chỉ số tuyển dụng</div>
                  <Text type="secondary" className="text-xs">Số lượng nhân viên mới tháng này đang tăng ổn định.</Text>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">Hiệu suất làm việc</div>
                  <Text type="secondary" className="text-xs">Tổng giờ làm đạt {(stats.totalHours / (stats.totalStaff || 1)).toFixed(1)}h/người.</Text>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                  <DollarSign size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">Chi phí nhân sự</div>
                  <Text type="secondary" className="text-xs">Quỹ lương chiếm phần lớn chi phí vận hành tiệm.</Text>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase mb-3">Tỉ lệ thưởng/phạt</div>
                <div className="flex h-2 w-full rounded-full overflow-hidden bg-gray-200">
                  <div 
                    className="bg-amber-400 h-full" 
                    style={{ width: `${(stats.totalBonus / (stats.totalBonus + stats.totalPenalty || 1)) * 100}%` }} 
                  />
                  <div 
                    className="bg-red-400 h-full" 
                    style={{ width: `${(stats.totalPenalty / (stats.totalBonus + stats.totalPenalty || 1)) * 100}%` }} 
                  />
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold">
                  <span className="text-amber-600">THƯỞNG: {Math.round((stats.totalBonus / (stats.totalBonus + stats.totalPenalty || 1)) * 100)}%</span>
                  <span className="text-red-600">PHẠT: {Math.round((stats.totalPenalty / (stats.totalBonus + stats.totalPenalty || 1)) * 100)}%</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardHome;
