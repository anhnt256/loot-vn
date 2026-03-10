"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Loader2,
  AlertCircle,
  CheckCircle,
  Monitor,
  Settings,
} from "lucide-react";
import { MachineSelector } from "./MachineSelector";
import { MachineDetail } from "@/lib/machine-utils";

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
    | string;
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

interface JoinGameAppointmentSummaryModalProps {
  appointmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: () => void;
}

export function JoinGameAppointmentSummaryModal({
  appointmentId,
  isOpen,
  onClose,
  onJoinSuccess,
}: JoinGameAppointmentSummaryModalProps) {
  const [appointment, setAppointment] = useState<GameAppointment | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<MachineDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isMachineSelectorOpen, setIsMachineSelectorOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAppointment = async () => {
    if (!appointmentId) return;

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
    if (isOpen && appointmentId) {
      fetchAppointment();
      setError(null);
      setSuccess(null);
      setSelectedMachine(null);
    }
  }, [isOpen, appointmentId]);

  const handleJoin = async () => {
    if (!appointmentId || !selectedMachine) return;

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
            pricePerHour: selectedMachine.price,
            machineName: selectedMachine.machineName,
            machineGroupId: selectedMachine.machineGroupId,
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

        // Close modal after 2 seconds and refresh data
        setTimeout(() => {
          onJoinSuccess();
          onClose();
        }, 2000);
      } else {
        setError(result.error || "Không thể tham gia hẹn chơi");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tham gia hẹn chơi");
    } finally {
      setIsJoining(false);
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

    if (typeof tier === "object") {
      return (
        <Badge className="bg-purple-100 text-purple-800">
          {tier.questName}
        </Badge>
      );
    }

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
      weekday: "short",
      year: "numeric",
      month: "short",
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

  const calculateTotalCost = () => {
    if (!selectedMachine || !appointment) return 0;
    const hours = Math.ceil(
      (new Date(appointment.endTime).getTime() -
        new Date(appointment.startTime).getTime()) /
        (1000 * 60 * 60),
    );
    return selectedMachine.price * hours;
  };

  if (!appointment && isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-gray-900 border-gray-700 text-white flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-bold text-white">
              Xác nhận tham gia hẹn chơi
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Vui lòng kiểm tra thông tin trước khi tham gia
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {/* Appointment Info */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {appointment.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Gamepad2 className="h-4 w-4" />
                      {appointment.game}
                    </span>
                    {appointment.rankLevel && (
                      <span className="flex items-center gap-1">
                        <Crown className="h-4 w-4" />
                        {appointment.rankLevel}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(appointment.status)}
                  {getTierBadge(appointment.tier)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span>{formatDateTime(appointment.startTime)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span>
                    {formatDuration(appointment.startTime, appointment.endTime)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span>
                    {appointment.currentMembers}/{appointment.maxMembers} thành
                    viên
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                  <span>{appointment.minCost.toLocaleString()} VNĐ</span>
                </div>
              </div>

              {/* Promotion */}
              {appointment.promotion && (
                <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-4 w-4 text-green-400" />
                    <span className="font-semibold text-green-300">
                      {appointment.promotion.promotion}
                    </span>
                  </div>
                  <p className="text-sm text-green-200">
                    {appointment.promotion.description}
                  </p>
                </div>
              )}
            </div>

            {/* Machine Selection */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4">
                Chọn máy chơi
              </h4>

              {selectedMachine ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-700 rounded">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-blue-400" />
                      <div>
                        <div className="font-semibold text-white">
                          {selectedMachine.machineName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {selectedMachine.machineGroupName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        {selectedMachine.price.toLocaleString()} VNĐ/giờ
                      </div>
                      <div className="text-sm text-gray-400">Giá mỗi giờ</div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setIsMachineSelectorOpen(true)}
                    className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Thay đổi máy
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsMachineSelectorOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  Chọn máy chơi
                </Button>
              )}
            </div>

            {/* Cost Summary */}
            {selectedMachine && (
              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700">
                <h4 className="text-lg font-semibold text-blue-300 mb-3">
                  Tổng chi phí
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Máy:</span>
                    <span>{selectedMachine.machineName}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Giá mỗi giờ:</span>
                    <span>{selectedMachine.price.toLocaleString()} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Thời gian:</span>
                    <span>
                      {formatDuration(
                        appointment.startTime,
                        appointment.endTime,
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-semibold text-white">
                      <span>Tổng cộng:</span>
                      <span>{calculateTotalCost().toLocaleString()} VNĐ</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Số tiền này sẽ được lock từ tài khoản chính và hoàn lại
                      khi đến chơi đúng hẹn
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700 rounded text-red-300">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-700 rounded text-green-300">
                <CheckCircle className="h-4 w-4" />
                <span>{success}</span>
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isJoining}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Hủy
            </Button>
            <Button
              onClick={handleJoin}
              disabled={
                isJoining ||
                !selectedMachine ||
                appointment.status !== "ACTIVE" ||
                appointment.currentMembers >= appointment.maxMembers
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tham gia...
                </>
              ) : (
                "Xác nhận tham gia"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Machine Selector Modal */}
      <MachineSelector
        isOpen={isMachineSelectorOpen}
        onClose={() => setIsMachineSelectorOpen(false)}
        onSelectMachine={setSelectedMachine}
        appointmentDuration={Math.ceil(
          (new Date(appointment?.endTime || 0).getTime() -
            new Date(appointment?.startTime || 0).getTime()) /
            (1000 * 60 * 60),
        )}
      />
    </>
  );
}
