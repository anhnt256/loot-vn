"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@gateway-workspace/shared/ui";
import { Button } from "@gateway-workspace/shared/ui";
import { Input } from "@gateway-workspace/shared/ui";
import { Label } from "@gateway-workspace/shared/ui";
import { toast } from "sonner";

interface BirthdayTier {
  id: number;
  tierName: string;
  discountPercent: number;
  milestoneAmount: number;
  additionalAmount: number;
  bonusAmount: number;
  totalAtTier: number;
  totalReceived: number;
  freeSpins: number;
  isActive: boolean;
}

interface BirthdayStats {
  totalUsers: number;
  totalClaimed: number;
  totalBonusGiven: number;
  totalFreeSpinsGiven: number;
}

export default function BirthdayAdminPage() {
  const [tiers, setTiers] = useState<BirthdayTier[]>([]);
  const [stats, setStats] = useState<BirthdayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<BirthdayTier | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tiersResponse, statsResponse] = await Promise.all([
        fetch("/api/birthday/tiers"),
        fetch("/api/birthday/stats"),
      ]);

      const tiersData = await tiersResponse.json();
      const statsData = await statsResponse.json();

      if (tiersData.success) {
        setTiers(tiersData.data);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTier = async (tierId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/birthday/tiers/${tierId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Tier updated successfully");
        fetchData();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error updating tier:", error);
      toast.error("Failed to update tier");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎂 Quản Lý Sinh Nhật</h1>
        <p className="text-gray-600">
          Quản lý các tier và thống kê tính năng sinh nhật
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalUsers}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Đã nhận thưởng</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalClaimed}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Tổng tiền thưởng</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.totalBonusGiven)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Lượt quay tặng</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalFreeSpinsGiven}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tiers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Tier Sinh Nhật</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Tier</th>
                  <th className="text-left p-2">Khuyến mãi</th>
                  <th className="text-left p-2">Mốc (VNĐ)</th>
                  <th className="text-left p-2">Tiền thưởng</th>
                  <th className="text-left p-2">Lượt quay</th>
                  <th className="text-left p-2">Trạng thái</th>
                  <th className="text-left p-2">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier) => (
                  <tr key={tier.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{tier.tierName}</td>
                    <td className="p-2">{tier.discountPercent}%</td>
                    <td className="p-2">
                      {formatCurrency(tier.milestoneAmount)}
                    </td>
                    <td className="p-2 text-green-600 font-medium">
                      {formatCurrency(tier.bonusAmount)}
                    </td>
                    <td className="p-2 text-blue-600 font-medium">
                      {tier.freeSpins}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          tier.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tier.isActive ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </td>
                    <td className="p-2">
                      <Button
                        variant={tier.isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleTier(tier.id, tier.isActive)}
                      >
                        {tier.isActive ? "Tạm dừng" : "Kích hoạt"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Thao Tác Nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => fetchData()} className="w-full">
              🔄 Làm mới dữ liệu
            </Button>

            <Button
              variant="outline"
              onClick={() => window.open("/birthday", "_blank")}
              className="w-full"
            >
              👀 Xem trang người dùng
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông Tin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• Tổng cộng {tiers.length} tier sinh nhật</p>
              <p>• Tier cao nhất: {tiers[tiers.length - 1]?.tierName}</p>
              <p>
                • Mốc cao nhất:{" "}
                {formatCurrency(tiers[tiers.length - 1]?.milestoneAmount || 0)}{" "}
                VNĐ
              </p>
              <p>
                • Tổng thưởng tối đa:{" "}
                {formatCurrency(tiers[tiers.length - 1]?.totalReceived || 0)}{" "}
                VNĐ
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
