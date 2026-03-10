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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Gamepad2,
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Crown,
  Gift,
  UserPlus,
  UserMinus,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface GameAppointment {
  id: string;
  title: string;
  description?: string;
  game: string;
  gameType: string;
  rankLevel?: string;
  startTime: string;
  endTime: string;
  minMembers: number;
  maxMembers: number;
  minCost: number;
  currentMembers: number;
  status: string;
  tier?:
    | {
        tierName: string;
        questName: string;
        minMembers: number;
        maxMembers?: number;
        minHours: number;
        lockedAmount: number;
        tasks: any[];
      }
    | string; // Allow tier to be object or string
  totalLockedAmount: number;
  createdAt: string;
  members: Array<{
    id: string;
    userId: number;
    status: string;
    joinedAt: string;
  }>;
  promotion?: {
    promotion: string;
    description: string;
    businessLogic: string;
    minNetProfit: number;
  };
}

interface GameAppointmentDetailProps {
  appointmentId: string;
}

export function GameAppointmentDetail({
  appointmentId,
}: GameAppointmentDetailProps) {
  const [appointment, setAppointment] = useState<GameAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
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

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const handleJoin = async () => {
    setIsJoining(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/game-appointments/${appointmentId}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            computerCount: 1,
            pricePerHour: 10000,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setSuccess("Tham gia hẹn chơi thành công!");
        if (result.data.tierChange) {
          setSuccess(
            (prev) =>
              prev +
              ` Tier đã thay đổi từ ${result.data.tierChange.oldTier} sang ${result.data.tierChange.newTier}`,
          );
        }
        fetchAppointment(); // Refresh data
      } else {
        setError(result.error || "Không thể tham gia hẹn chơi");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tham gia hẹn chơi");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/game-appointments/${appointmentId}/leave`,
        {
          method: "POST",
        },
      );

      const result = await response.json();

      if (result.success) {
        setSuccess("Rời hẹn chơi thành công!");
        if (result.data.tierChange) {
          setSuccess(
            (prev) =>
              prev +
              ` Tier đã thay đổi từ ${result.data.tierChange.oldTier} sang ${result.data.tierChange.newTier}`,
          );
        }
        fetchAppointment(); // Refresh data
      } else {
        setError(result.error || "Không thể rời hẹn chơi");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi rời hẹn chơi");
    } finally {
      setIsLeaving(false);
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

  const getTierBadge = (
    tier?:
      | {
          tierName: string;
          questName: string;
          minMembers: number;
          maxMembers?: number;
          minHours: number;
          lockedAmount: number;
          tasks: any[];
        }
      | string,
  ) => {
    if (!tier) return <Badge variant="outline">Chưa kích hoạt</Badge>;

    // Handle tier object
    if (typeof tier === "object") {
      return (
        <Badge className="bg-purple-100 text-purple-800">
          {tier.questName}
        </Badge>
      );
    }

    // Handle tier string (legacy)
    const tierConfig = {
      tier_3p_3h: { label: "Bronze", color: "bg-amber-100 text-amber-800" },
      tier_3p_5h: { label: "Silver", color: "bg-gray-100 text-gray-800" },
      tier_5p_3h: { label: "Silver", color: "bg-gray-100 text-gray-800" },
      tier_5p_5h: { label: "Gold", color: "bg-yellow-100 text-yellow-800" },
      tier_allnight: { label: "Diamond", color: "bg-blue-100 text-blue-800" },
    };

    const config = tierConfig[tier as keyof typeof tierConfig] || {
      label: tier,
      color: "bg-gray-100 text-gray-800",
    };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60),
    );
    return `${hours} giờ`;
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{appointment.title}</h1>
          <p className="text-muted-foreground">Chi tiết hẹn chơi game</p>
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
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                Thông tin cơ bản
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
                  <p className="text-lg">
                    {appointment.gameType === "CASUAL" && "Casual - Chơi vui"}
                    {appointment.gameType === "RANKED" && "Ranked - Cày rank"}
                    {appointment.gameType === "COMPETITIVE" &&
                      "Competitive - Thi đấu"}
                  </p>
                </div>
                {appointment.rankLevel && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Mức rank
                    </p>
                    <p className="text-lg flex items-center gap-1">
                      <Crown className="h-4 w-4" />
                      {appointment.rankLevel}
                    </p>
                  </div>
                )}
              </div>

              {appointment.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Mô tả
                  </p>
                  <p className="text-sm">{appointment.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Thời gian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Bắt đầu
                  </p>
                  <p className="text-lg">
                    {formatDateTime(appointment.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Kết thúc
                  </p>
                  <p className="text-lg">
                    {formatDateTime(appointment.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Thời lượng
                  </p>
                  <p className="text-lg flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(appointment.startTime, appointment.endTime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Thành viên ({appointment.currentMembers}/
                {appointment.maxMembers})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {appointment.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">User #{member.userId}</p>
                        <p className="text-sm text-muted-foreground">
                          Tham gia:{" "}
                          {new Date(member.joinedAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        member.status === "JOINED" ? "default" : "secondary"
                      }
                    >
                      {member.status === "JOINED"
                        ? "Đã tham gia"
                        : member.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Promotion */}
          {appointment.promotion && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Gift className="h-5 w-5" />
                  Phần thưởng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-green-800">
                      {appointment.promotion.promotion}
                    </p>
                    <p className="text-sm text-green-700">
                      {appointment.promotion.description}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      Lợi nhuận tối thiểu
                    </p>
                    <p className="text-lg font-bold text-green-900">
                      {appointment.promotion.minNetProfit.toLocaleString()} VNĐ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Chi phí
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Chi phí tối thiểu
                </p>
                <p className="text-lg font-bold">
                  {appointment.minCost.toLocaleString()} VNĐ
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tổng số tiền lock
                </p>
                <p className="text-lg font-bold">
                  {appointment.totalLockedAmount.toLocaleString()} VNĐ
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointment.status === "ACTIVE" && (
                <>
                  {appointment.currentMembers < appointment.maxMembers ? (
                    <Button
                      onClick={handleJoin}
                      disabled={isJoining}
                      className="w-full"
                    >
                      {isJoining ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang tham gia...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Tham gia
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      <Users className="mr-2 h-4 w-4" />
                      Đã đủ thành viên
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleLeave}
                    disabled={isLeaving}
                    className="w-full"
                  >
                    {isLeaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang rời...
                      </>
                    ) : (
                      <>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Rời hẹn chơi
                      </>
                    )}
                  </Button>
                </>
              )}

              <Button variant="outline" className="w-full">
                <MapPin className="mr-2 h-4 w-4" />
                Chia sẻ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
