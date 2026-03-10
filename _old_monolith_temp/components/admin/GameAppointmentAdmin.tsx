"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Users,
  DollarSign,
  Crown,
  Gift,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Zap,
} from "lucide-react";

interface GameAppointment {
  id: string;
  title: string;
  game: string;
  gameType: string;
  startTime: string;
  endTime: string;
  minMembers: number;
  maxMembers: number;
  minCost: number;
  currentMembers: number;
  status: string;
  tierId?: number;
  totalLockedAmount: number;
  members: Array<{
    id: string;
    userId: number;
    status: string;
    joinedAt: string;
  }>;
  tier?: {
    tierName: string;
    questName: string;
    minMembers: number;
    maxMembers?: number;
    minHours: number;
    lockedAmount: number;
    tasks: Array<{
      taskId: string;
      taskName: string;
      challenge: string;
      rewardAmount: number;
      requiredQuantity: number;
      itemType: string;
    }>;
  };
}

interface TierOption {
  tierName: string;
  questName: string;
  minMembers: number;
  maxMembers?: number;
  minHours: number;
  lockedAmount: number;
  tasks: Array<{
    taskId: string;
    taskName: string;
    challenge: string;
    rewardAmount: number;
    requiredQuantity: number;
    itemType: string;
  }>;
}

interface GameAppointmentAdminProps {
  appointmentId: string;
}

export function GameAppointmentAdmin({
  appointmentId,
}: GameAppointmentAdminProps) {
  const [appointment, setAppointment] = useState<GameAppointment | null>(null);
  const [tierOptions, setTierOptions] = useState<TierOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAppointment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/game-appointments/${appointmentId}`);
      const result = await response.json();

      if (result.success) {
        setAppointment(result.data);
      } else {
        setError(result.error || "Không thể tải thông tin hẹn chơi");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tải thông tin hẹn chơi");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTierOptions = async () => {
    try {
      const response = await fetch(
        `/api/admin/game-appointments/${appointmentId}/activate-tier`,
      );
      const result = await response.json();

      if (result.success) {
        setTierOptions(result.data.availableTiers);
      }
    } catch (error) {
      console.error("Error fetching tier options:", error);
    }
  };

  useEffect(() => {
    fetchAppointment();
    fetchTierOptions();
  }, [appointmentId]);

  const handleManualActivation = async () => {
    if (!selectedTier) {
      setError("Vui lòng chọn tier để kích hoạt");
      return;
    }

    setIsActivating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/admin/game-appointments/${appointmentId}/activate-tier`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tierName: selectedTier }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setSuccess(`Đã kích hoạt tier ${selectedTier} thành công!`);
        fetchAppointment(); // Refresh data
      } else {
        setError(result.error || "Không thể kích hoạt tier");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi kích hoạt tier");
    } finally {
      setIsActivating(false);
    }
  };

  const handleBatchUpdate = async () => {
    setIsBatchUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        "/api/admin/game-appointments/batch-update-tiers",
        {
          method: "POST",
        },
      );

      const result = await response.json();

      if (result.success) {
        setSuccess(
          `Đã cập nhật ${result.data.updated} appointments thành công!`,
        );
        fetchAppointment(); // Refresh data
      } else {
        setError(result.error || "Không thể cập nhật batch");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi cập nhật batch");
    } finally {
      setIsBatchUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: "Hoạt động", variant: "default" as const },
      COMPLETED: { label: "Hoàn thành", variant: "secondary" as const },
      CANCELLED: { label: "Đã hủy", variant: "destructive" as const },
      EXPIRED: { label: "Hết hạn", variant: "outline" as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTierBadge = (tier?: GameAppointment["tier"]) => {
    if (!tier) return <Badge variant="outline">Chưa kích hoạt</Badge>;

    const tierConfig = {
      tier_tam_ho: { label: "Tam Hổ", color: "bg-orange-100 text-orange-800" },
      tier_ngu_long: {
        label: "Ngũ Long",
        color: "bg-purple-100 text-purple-800",
      },
    };

    const config = tierConfig[tier.tierName as keyof typeof tierConfig] || {
      label: tier.questName,
      color: "bg-gray-100 text-gray-800",
    };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Không thể tải thông tin hẹn chơi. Vui lòng thử lại.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý hẹn chơi</h1>
          <p className="text-muted-foreground">
            Admin panel - {appointment.title}
          </p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(appointment.status)}
          {getTierBadge(appointment.tier)}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Thông tin hẹn chơi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Game
                  </p>
                  <p className="text-lg">{appointment.game}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Thể loại
                  </p>
                  <p className="text-lg">{appointment.gameType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Thời gian
                  </p>
                  <p className="text-lg">
                    {formatDateTime(appointment.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Thành viên
                  </p>
                  <p className="text-lg">
                    {appointment.currentMembers}/{appointment.maxMembers}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Chi phí
                  </p>
                  <p className="text-lg">
                    {appointment.minCost?.toLocaleString() || "0"} VNĐ
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tổng lock
                  </p>
                  <p className="text-lg">
                    {appointment.totalLockedAmount?.toLocaleString() || "0"} VNĐ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Quest */}
          {appointment.tier && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Gift className="h-5 w-5" />
                  Quest hiện tại: {appointment.tier.questName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      Cam kết bắt buộc
                    </p>
                    <p className="text-lg font-bold text-blue-900">
                      Khóa{" "}
                      {appointment.tier?.lockedAmount?.toLocaleString() || "0"}{" "}
                      VNĐ từ mỗi thành viên
                    </p>
                    <p className="text-sm text-blue-700">
                      Chơi tối thiểu {appointment.tier.minHours} giờ để được
                      hoàn tiền
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-blue-800 mb-3">
                      Nhiệm vụ:
                    </p>
                    <div className="space-y-2">
                      {appointment.tier.tasks.map((task, index) => (
                        <div
                          key={task.taskId}
                          className="p-3 bg-white rounded-lg border border-blue-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-blue-800">
                              {task.taskName}
                            </span>
                            <Badge variant="outline" className="text-blue-600">
                              {task.rewardAmount?.toLocaleString() || "0"} VNĐ
                            </Badge>
                          </div>
                          <p className="text-sm text-blue-700">
                            {task.challenge}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      Tổng phần thưởng có thể nhận
                    </p>
                    <p className="text-lg font-bold text-blue-900">
                      {appointment.tier?.tasks
                        ?.reduce(
                          (sum, task) => sum + (task.rewardAmount || 0),
                          0,
                        )
                        ?.toLocaleString() || "0"}{" "}
                      VNĐ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Admin Actions */}
        <div className="space-y-6">
          {/* Manual Tier Activation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Kích hoạt tier thủ công
              </CardTitle>
              <CardDescription>
                Kích hoạt tier khi không đạt điều kiện tự động
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="tier-select" className="text-sm font-medium">
                  Chọn tier
                </label>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger id="tier-select">
                    <SelectValue placeholder="Chọn tier để kích hoạt" />
                  </SelectTrigger>
                  <SelectContent>
                    {tierOptions.map((tier) => (
                      <SelectItem key={tier.tierName} value={tier.tierName}>
                        <div className="flex flex-col">
                          <span className="font-medium">{tier.questName}</span>
                          <span className="text-xs text-muted-foreground">
                            {tier.minMembers}-{tier.maxMembers || "∞"} người,{" "}
                            {tier.minHours}+ giờ
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Khóa {tier.lockedAmount?.toLocaleString() || "0"}{" "}
                            VNĐ/người
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleManualActivation}
                disabled={isActivating || !selectedTier}
                className="w-full"
              >
                {isActivating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang kích hoạt...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Kích hoạt tier
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Batch Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Cập nhật batch
              </CardTitle>
              <CardDescription>
                Cập nhật tier cho tất cả appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleBatchUpdate}
                disabled={isBatchUpdating}
                className="w-full"
              >
                {isBatchUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Cập nhật tất cả
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Tier Options */}
          <Card>
            <CardHeader>
              <CardTitle>Tier có sẵn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tierOptions.map((tier) => (
                  <div key={tier.tierName} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{tier.questName}</span>
                      <Badge variant="outline">{tier.tierName}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      <p>
                        Yêu cầu: {tier.minMembers}-{tier.maxMembers || "∞"}{" "}
                        người, {tier.minHours}+ giờ
                      </p>
                      <p>
                        Khóa: {tier.lockedAmount?.toLocaleString() || "0"}{" "}
                        VNĐ/người
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Nhiệm vụ:</p>
                      {tier.tasks.map((task) => (
                        <div
                          key={task.taskId}
                          className="text-xs text-muted-foreground"
                        >
                          • {task.taskName}:{" "}
                          {task.rewardAmount?.toLocaleString() || "0"} VNĐ
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
