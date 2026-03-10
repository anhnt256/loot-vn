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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateGameAppointmentModal } from "./CreateGameAppointmentModal";
import { GameAppointmentDetailModal } from "./GameAppointmentDetailModal";
import { JoinGameAppointmentSummaryModal } from "./JoinGameAppointmentSummaryModal";
import {
  Gamepad2,
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Search,
  Filter,
  Loader2,
  Crown,
  Gift,
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

interface GameAppointmentListProps {
  initialAppointments?: GameAppointment[];
}

export function GameAppointmentList({
  initialAppointments = [],
}: GameAppointmentListProps) {
  const [appointments, setAppointments] =
    useState<GameAppointment[]>(initialAppointments);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinAppointmentId, setJoinAppointmentId] = useState<string | null>(
    null,
  );
  const [totalPages, setTotalPages] = useState(1);

  const fetchAppointments = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (searchTerm) params.append("game", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (tierFilter !== "all") {
        // Handle tier filter - convert tier names to tierName values
        const tierNameMap: { [key: string]: string } = {
          tier_3p_3h: "tier_tam_ho",
          tier_3p_5h: "tier_tam_ho",
          tier_5p_3h: "tier_ngu_long",
          tier_5p_5h: "tier_ngu_long",
          tier_allnight: "tier_allnight",
        };
        const tierName = tierNameMap[tierFilter] || tierFilter;
        params.append("tier", tierName);
      }

      const response = await fetch(`/api/game-appointments?${params}`);
      const result = await response.json();

      if (result.success) {
        setAppointments(result.data.appointments);
        setTotalPages(result.data.pagination.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(1);
  }, [searchTerm, statusFilter, tierFilter]);

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchAppointments(1); // Refresh the list
  };

  const handleViewDetail = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAppointmentId(null);
    fetchAppointments(currentPage); // Refresh the list
  };

  const handleJoinAppointment = (appointmentId: string) => {
    setJoinAppointmentId(appointmentId);
    setIsJoinModalOpen(true);
  };

  const handleCloseJoinModal = () => {
    setIsJoinModalOpen(false);
    setJoinAppointmentId(null);
  };

  const handleJoinSuccess = () => {
    fetchAppointments(currentPage); // Refresh the list
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

  return (
    <div className="flex flex-col p-3 gap-2 h-screen">
      <div className="flex-1 bg-gray-900/95 rounded-xl p-4 border border-gray-800 shadow-lg overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Hẹn Chơi Game
                </h1>
                <p className="text-gray-400 text-sm">
                  Tham gia hẹn chơi cùng bạn bè và nhận phần thưởng
                </p>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Gamepad2 className="mr-2 h-4 w-4" />
                Tạo hẹn chơi
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex-shrink-0 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm theo tên game..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all" className="text-white">
                      Tất cả trạng thái
                    </SelectItem>
                    <SelectItem value="ACTIVE" className="text-white">
                      Hoạt động
                    </SelectItem>
                    <SelectItem value="COMPLETED" className="text-white">
                      Hoàn thành
                    </SelectItem>
                    <SelectItem value="CANCELLED" className="text-white">
                      Đã hủy
                    </SelectItem>
                    <SelectItem value="EXPIRED" className="text-white">
                      Hết hạn
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="w-[160px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all" className="text-white">
                      Tất cả tier
                    </SelectItem>
                    <SelectItem value="tier_3p_3h" className="text-white">
                      Bronze
                    </SelectItem>
                    <SelectItem value="tier_3p_5h" className="text-white">
                      Silver (3p-5h)
                    </SelectItem>
                    <SelectItem value="tier_5p_3h" className="text-white">
                      Silver (5p-3h)
                    </SelectItem>
                    <SelectItem value="tier_5p_5h" className="text-white">
                      Gold
                    </SelectItem>
                    <SelectItem value="tier_allnight" className="text-white">
                      Diamond
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="flex-1 min-h-0 overflow-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Gamepad2 className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Không có hẹn chơi nào
                </h3>
                <p className="text-gray-400 text-center">
                  Hãy tạo hẹn chơi đầu tiên của bạn!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {appointment.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
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

                    {/* Simple info display */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span>{formatDateTime(appointment.startTime)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="h-4 w-4 text-green-400" />
                        <span>
                          {formatDuration(
                            appointment.startTime,
                            appointment.endTime,
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-300">
                        <Users className="h-4 w-4 text-purple-400" />
                        <span>
                          {appointment.currentMembers}/{appointment.maxMembers}{" "}
                          thành viên
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-300">
                        <DollarSign className="h-4 w-4 text-yellow-400" />
                        <span>{appointment.minCost.toLocaleString()} VNĐ</span>
                      </div>
                    </div>

                    {/* Promotion */}
                    {appointment.promotion && (
                      <div className="mb-3 p-2 bg-green-900/30 border border-green-700 rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Gift className="h-4 w-4 text-green-400" />
                          <span className="font-semibold text-green-300">
                            {appointment.promotion.promotion}
                          </span>
                        </div>
                        <p className="text-xs text-green-200">
                          {appointment.promotion.description}
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(appointment.id)}
                        className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                      >
                        Xem chi tiết
                      </Button>
                      {appointment.status === "ACTIVE" &&
                        appointment.currentMembers < appointment.maxMembers && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleJoinAppointment(appointment.id)
                            }
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Tham gia
                          </Button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && appointments.length > 0 && totalPages > 1 && (
            <div className="flex-shrink-0 mt-4">
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => fetchAppointments(currentPage - 1)}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 disabled:opacity-50"
                >
                  Trước
                </Button>
                <span className="flex items-center px-4 text-white text-sm">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => fetchAppointments(currentPage + 1)}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 disabled:opacity-50"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Appointment Modal */}
      <CreateGameAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // Refresh the appointments list
          fetchAppointments(currentPage);
        }}
      />

      {/* Detail Modal */}
      <GameAppointmentDetailModal
        appointmentId={selectedAppointmentId}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />

      {/* Join Summary Modal */}
      <JoinGameAppointmentSummaryModal
        appointmentId={joinAppointmentId}
        isOpen={isJoinModalOpen}
        onClose={handleCloseJoinModal}
        onJoinSuccess={handleJoinSuccess}
      />
    </div>
  );
}
