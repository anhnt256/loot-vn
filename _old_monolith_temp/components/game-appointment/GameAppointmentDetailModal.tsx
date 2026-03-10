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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  X,
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
  minCost: number | null;
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
    | string;
  totalLockedAmount: number | null;
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
    minNetProfit: number | null;
  };
}

interface GameAppointmentDetailModalProps {
  appointmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GameAppointmentDetailModal({
  appointmentId,
  isOpen,
  onClose,
}: GameAppointmentDetailModalProps) {
  const [appointment, setAppointment] = useState<GameAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAppointment = async () => {
    if (!appointmentId) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

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
    if (isOpen && appointmentId) {
      fetchAppointment();
    }
  }, [isOpen, appointmentId]);

  const handleJoin = async () => {
    if (!appointmentId) return;

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
    if (!appointmentId) return;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-3">
              <span>{appointment?.title || "Chi tiết hẹn chơi"}</span>
              {appointment && (
                <div className="flex gap-1.5">
                  {getStatusBadge(appointment.status)}
                  {getTierBadge(appointment.tier)}
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !appointment ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Không thể tải thông tin hẹn chơi. Vui lòng thử lại.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-y-auto flex-1 -mr-2 pr-2">
            <div className="space-y-3">
              {/* Success/Error Messages */}
              {success && (
                <Alert className="border-green-200 bg-green-50 py-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 text-sm">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-3">
                  {/* Basic Info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Gamepad2 className="h-4 w-4" />
                        Thông tin cơ bản
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pb-3">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Game</p>
                          <p className="font-medium">{appointment.game}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Thể loại
                          </p>
                          <p className="font-medium">
                            {appointment.gameType === "CASUAL" &&
                              "Casual - Chơi vui"}
                            {appointment.gameType === "RANKED" &&
                              "Ranked - Cày rank"}
                            {appointment.gameType === "COMPETITIVE" &&
                              "Competitive - Thi đấu"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Time & Cost - Combined */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        Thời gian - Chi phí
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pb-3">
                      <div className="grid grid-cols-3 gap-x-3 gap-y-1.5 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Bắt đầu
                          </p>
                          <p className="text-xs font-medium">
                            {new Date(appointment.startTime).toLocaleString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Kết thúc
                          </p>
                          <p className="text-xs font-medium">
                            {new Date(appointment.endTime).toLocaleString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Thời lượng
                          </p>
                          <p className="text-xs font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(
                              appointment.startTime,
                              appointment.endTime,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Chi phí tối thiểu
                          </p>
                          <p className="text-xs font-bold">
                            {appointment.minCost?.toLocaleString() || "0"} VNĐ
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground">
                            Tổng số tiền lock
                          </p>
                          <p className="text-xs font-bold">
                            {appointment.totalLockedAmount?.toLocaleString() ||
                              "0"}{" "}
                            VNĐ
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Promotion */}
                  {appointment.promotion && (
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-green-800 text-sm">
                          <Gift className="h-4 w-4" />
                          Phần thưởng
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-green-800">
                            {appointment.promotion.promotion}
                          </p>
                          <div className="p-2 bg-green-100 rounded">
                            <p className="text-xs text-green-700">
                              Lợi nhuận tối thiểu
                            </p>
                            <p className="text-sm font-bold text-green-900">
                              {appointment.promotion.minNetProfit?.toLocaleString() ||
                                "0"}{" "}
                              VNĐ
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-3">
                  {/* Members */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        Thành viên ({appointment.currentMembers}/
                        {appointment.maxMembers})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {appointment.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-1.5 border rounded text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                <Users className="h-3 w-3" />
                              </div>
                              <p className="font-medium text-xs">
                                User #{member.userId}
                              </p>
                            </div>
                            <Badge
                              variant={
                                member.status === "JOINED"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs py-0 h-5"
                            >
                              {member.status === "JOINED"
                                ? "Tham gia"
                                : member.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Hành động</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pb-3">
                      {appointment.status === "ACTIVE" && (
                        <>
                          {appointment.currentMembers <
                          appointment.maxMembers ? (
                            <Button
                              onClick={handleJoin}
                              disabled={isJoining}
                              className="w-full h-8 text-xs"
                            >
                              {isJoining ? (
                                <>
                                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                  Đang tham gia...
                                </>
                              ) : (
                                <>
                                  <UserPlus className="mr-1.5 h-3 w-3" />
                                  Tham gia
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button disabled className="w-full h-8 text-xs">
                              <Users className="mr-1.5 h-3 w-3" />
                              Đã đủ thành viên
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            onClick={handleLeave}
                            disabled={isLeaving}
                            className="w-full h-8 text-xs"
                          >
                            {isLeaving ? (
                              <>
                                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                Đang rời...
                              </>
                            ) : (
                              <>
                                <UserMinus className="mr-1.5 h-3 w-3" />
                                Rời hẹn chơi
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
