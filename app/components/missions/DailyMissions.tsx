import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Clock,
  Star,
  Trophy,
  GamepadIcon,
  ShoppingCart,
  Timer,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import dayjs from "@/lib/dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

interface Mission {
  id: number;
  name: string;
  description: string;
  reward: number;
  startHours: number;
  endHours: number;
  quantity: number;
  type: string;
  createdAt: string;
  userCompletion?: {
    id: number;
    isDone: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
}

interface DailyMissionsProps {
  className?: string;
}

type MissionTab = "ALL" | "HOURS" | "ORDER" | "TOPUP";

export function DailyMissions({ className }: DailyMissionsProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [activeTab, setActiveTab] = useState<MissionTab>("HOURS");
  const queryClient = useQueryClient();

  // Get mission type config (colors, icons, labels)
  const getMissionTypeConfig = (type: string) => {
    switch (type) {
      case "HOURS":
        return {
          label: "Giờ Chơi",
          color: "from-blue-500 to-sky-500",
          bgColor: "bg-blue-900/30",
          borderColor: "border-blue-500/30",
          textColor: "text-blue-400",
          icon: Timer,
        };
      case "ORDER":
        return {
          label: "Order",
          color: "from-emerald-500 to-green-500",
          bgColor: "bg-emerald-900/30",
          borderColor: "border-emerald-500/30",
          textColor: "text-emerald-400",
          icon: ShoppingCart,
        };
      case "TOPUP":
        return {
          label: "Nạp Tiền",
          color: "from-indigo-500 to-purple-500",
          bgColor: "bg-indigo-900/30",
          borderColor: "border-indigo-500/30",
          textColor: "text-indigo-400",
          icon: Zap,
        };
      default:
        return {
          label: "Khác",
          color: "from-gray-500 to-gray-600",
          bgColor: "bg-gray-900/30",
          borderColor: "border-gray-500/30",
          textColor: "text-gray-400",
          icon: Star,
        };
    }
  };

  // Fetch daily missions
  const { data: missions = [], isLoading } = useQuery<Mission[]>({
    queryKey: ["dailyMissions"],
    queryFn: async () => {
      let token = localStorage.getItem("token");

      // Demo token if none exists
      if (!token) {
        const { signJWT } = await import("@/lib/jwt");
        token = await signJWT({ userId: 2969, userName: "demo_user" });
        localStorage.setItem("token", token);
      }

      const response = await fetch("/api/missions", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Không thể tải nhiệm vụ");
      const data = await response.json();
      console.log("Missions API response:", data);
      return data;
    },
    refetchInterval: 60000,
  });

  console.log("Missions data:", missions);

  // Get current time period and sort logic
  const getCurrentTimePeriod = () => {
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const currentHour = now.hour();

    if (currentHour >= 6 && currentHour < 12) return "MORNING";
    if (currentHour >= 12 && currentHour < 18) return "AFTERNOON";
    return "EVENING"; // 18-6h
  };

  const getTimePeriodFromMission = (mission: Mission) => {
    const { startHours, endHours } = mission;

    // If spans across periods or 24h mission
    if (startHours === 0 && endHours === 23) return "ALL_DAY";

    const avgHour = (startHours + endHours) / 2;
    if (avgHour >= 6 && avgHour < 12) return "MORNING";
    if (avgHour >= 12 && avgHour < 18) return "AFTERNOON";
    return "EVENING";
  };

  const isMissionActive = (mission: Mission) => {
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const currentHour = now.hour();
    const { startHours, endHours } = mission;

    // All day missions are always active
    if (startHours === 0 && endHours === 23) return true;

    // Handle overnight missions (e.g., 22-6)
    if (startHours > endHours) {
      return currentHour >= startHours || currentHour <= endHours;
    }

    // Normal time range
    return currentHour >= startHours && currentHour <= endHours;
  };

  const getMissionStatus = (mission: Mission) => {
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const currentHour = now.hour();
    const { startHours, endHours } = mission;

    // All day missions are always active
    if (startHours === 0 && endHours === 23) return "ACTIVE";

    // Handle overnight missions (e.g., 22-6)
    if (startHours > endHours) {
      if (currentHour >= startHours || currentHour <= endHours) {
        return "ACTIVE";
      }
      // For overnight missions, if not active, it's upcoming
      return "UPCOMING";
    }

    // Normal time range missions
    if (currentHour < startHours) {
      return "UPCOMING"; // Chưa đến giờ
    } else if (currentHour >= startHours && currentHour <= endHours) {
      return "ACTIVE"; // Đang trong khung giờ
    } else {
      return "EXPIRED"; // Đã qua khung giờ trong ngày
    }
  };

  const sortMissionsByTimePriority = (missions: Mission[]) => {
    const currentPeriod = getCurrentTimePeriod();

    // Priority order based on current time
    const getPriorityOrder = () => {
      switch (currentPeriod) {
        case "MORNING":
          return ["MORNING", "AFTERNOON", "EVENING", "ALL_DAY"];
        case "AFTERNOON":
          return ["AFTERNOON", "EVENING", "MORNING", "ALL_DAY"];
        case "EVENING":
          return ["EVENING", "MORNING", "AFTERNOON", "ALL_DAY"];
        default:
          return ["ALL_DAY", "MORNING", "AFTERNOON", "EVENING"];
      }
    };

    const priorityOrder = getPriorityOrder();

    return missions.sort((a, b) => {
      const aPeriod = getTimePeriodFromMission(a);
      const bPeriod = getTimePeriodFromMission(b);
      const aStatus = getMissionStatus(a);
      const bStatus = getMissionStatus(b);

      // Status priority: ACTIVE > UPCOMING > EXPIRED
      const statusPriority = { ACTIVE: 0, UPCOMING: 1, EXPIRED: 2 };
      const aStatusPriority = statusPriority[aStatus];
      const bStatusPriority = statusPriority[bStatus];

      if (aStatusPriority !== bStatusPriority) {
        return aStatusPriority - bStatusPriority;
      }

      // Then sort by time period priority
      const aPriority = priorityOrder.indexOf(aPeriod);
      const bPriority = priorityOrder.indexOf(bPeriod);

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Finally sort by mission ID for consistent ordering
      return a.id - b.id;
    });
  };

  // Filter and sort missions by tab and time priority
  const filteredMissions = missions.filter((mission) => {
    if (activeTab === "ALL") return true;
    return mission.type === activeTab;
  });

  const sortedMissions = sortMissionsByTimePriority(filteredMissions);

  // Get tab counts
  const getTabCount = (type: MissionTab) => {
    if (type === "ALL") return missions.length;
    return missions.filter((m) => m.type === type).length;
  };

  // Get tab config for display
  const getTabConfig = (tab: MissionTab) => {
    switch (tab) {
      case "ALL":
        return {
          label: "Tất Cả",
          icon: Star,
          color: "from-yellow-500 to-amber-500",
        };
      case "HOURS":
        return getMissionTypeConfig("HOURS");
      case "ORDER":
        return getMissionTypeConfig("ORDER");
      case "TOPUP":
        return getMissionTypeConfig("TOPUP");
      default:
        return {
          label: "Khác",
          icon: Star,
          color: "from-gray-500 to-gray-600",
        };
    }
  };

  // Claim mission mutation
  const claimMissionMutation = useMutation({
    mutationFn: async (missionId: number) => {
      let token = localStorage.getItem("token");

      if (!token) {
        const { signJWT } = await import("@/lib/jwt");
        token = await signJWT({ userId: 2969, userName: "demo_user" });
        localStorage.setItem("token", token);
      }

      const response = await fetch(`/api/missions/${missionId}/claim`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Không thể hoàn thành nhiệm vụ");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dailyMissions"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
      toast.success(`🎉 Hoàn thành nhiệm vụ! +${data.xpReward} XP`);
    },
    onError: (error) => {
      toast.error("Không thể hoàn thành nhiệm vụ");
      console.error("Failed to claim mission:", error);
    },
  });

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = dayjs().tz("Asia/Ho_Chi_Minh");
      const tomorrow = now.add(1, "day");

      const diff = tomorrow.diff(now, "minutes");
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;

      setTimeLeft(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to get mission XP
  const getMissionXP = (mission: Mission): number => {
    return mission.reward || 50;
  };

  // Calculate progress
  const totalMissions = sortedMissions.length;
  const totalAvailableXP = sortedMissions.reduce(
    (sum, m) => sum + getMissionXP(m),
    0,
  );

  // Calculate completion status from userCompletion data
  const completedMissions = missions.filter(
    (m) => m.userCompletion?.isDone,
  ).length;
  const earnedXP = missions
    .filter((m) => m.userCompletion?.isDone)
    .reduce((sum, m) => sum + getMissionXP(m), 0);

  const handleClaimMission = (missionId: number) => {
    claimMissionMutation.mutate(missionId);
  };

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`bg-gray-900/50 backdrop-blur-sm border-gray-700 ${className}`}
    >
      <div className="p-4">
        {/* Header - Đơn giản hóa */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">
            Nhiệm Vụ Ngày {dayjs().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")}
          </h2>
        </div>

        {/* Mission Type Tabs - 3 tabs trên 1 hàng */}
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-2">
            {(["HOURS", "ORDER", "TOPUP"] as MissionTab[]).map((tab) => {
              const config = getTabConfig(tab);
              const Icon = config.icon;
              const isActive = activeTab === tab;

              return (
                <Button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center justify-center gap-2 transition-all text-sm py-3 px-3 font-medium ${
                    isActive
                      ? `bg-gradient-to-r ${config.color} text-white border-0 shadow-lg transform scale-105`
                      : "bg-gray-800/70 border border-gray-600 text-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{config.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Summary with Progress và Reset Timer */}
        <div className="mb-4 p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg border border-slate-600/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-white font-medium text-base">
                {activeTab === "ALL"
                  ? "Tất Cả Nhiệm Vụ"
                  : getTabConfig(activeTab).label}
              </span>
              <div className="text-sm text-gray-300 mt-1">
                <span className="text-green-400 font-semibold">
                  {completedMissions}
                </span>
                <span className="text-gray-400">
                  /{totalMissions} nhiệm vụ hoàn thành
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-300 font-bold text-lg">
                <span className="text-green-400">{earnedXP}</span>
                <span className="text-gray-400">/{totalAvailableXP} XP</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-500"
                style={{
                  width: `${totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Reset Timer - Đổi màu để tránh trùng */}
          <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-lg p-3">
            <div className="text-center">
              <div className="text-amber-400 font-bold text-sm mb-2">
                Nhiệm Vụ Reset Sau: {timeLeft || "Đang tải..."}
              </div>
              <div className="text-xs">
                <span className="text-red-400 font-bold">
                  ⚠️ NHIỆM VỤ LÀM MỚI MỖI NGÀY
                </span>
                <span className="text-amber-300 ml-1">
                  - Phần thưởng chưa nhận sẽ bị mất!
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Missions List */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto missions-scroll">
          {sortedMissions && sortedMissions.length > 0 ? (
            sortedMissions.map((mission) => {
              if (!mission || !mission.name || !mission.description) {
                console.warn("Invalid mission object:", mission);
                return null;
              }

              const config = getMissionTypeConfig(mission.type);
              const Icon = config.icon;
              const isActive = isMissionActive(mission);
              const missionStatus = getMissionStatus(mission);
              const timePeriod = getTimePeriodFromMission(mission);

              const getTimeRangeText = (mission: Mission) => {
                const { startHours, endHours } = mission;
                if (startHours === 0 && endHours === 23) return "Cả ngày";
                return `${startHours}h-${endHours}h`;
              };

              const getStatusInfo = (status: string) => {
                switch (status) {
                  case "ACTIVE":
                    return { canComplete: true };
                  case "UPCOMING":
                    return { canComplete: false };
                  case "EXPIRED":
                    return { canComplete: false };
                  default:
                    return { canComplete: false };
                }
              };

              const statusInfo = getStatusInfo(missionStatus);
              const isCompleted = mission.userCompletion?.isDone || false;
              const canClaim = statusInfo.canComplete && !isCompleted;

              return (
                <div
                  key={mission.id}
                  className={`mission-card p-4 rounded-lg border transition-all ${
                    isCompleted
                      ? "bg-green-900/30 border-green-500/30"
                      : missionStatus === "ACTIVE"
                        ? `${config.bgColor} ${config.borderColor}`
                        : missionStatus === "UPCOMING"
                          ? `${config.bgColor} ${config.borderColor} opacity-75`
                          : "bg-gray-800/30 border-gray-700/50 opacity-75"
                  }`}
                >
                  {/* Header compact - 1 dòng */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 ${
                          missionStatus === "ACTIVE"
                            ? `bg-gradient-to-r ${config.color}`
                            : missionStatus === "UPCOMING"
                              ? `bg-gradient-to-r ${config.color} opacity-75`
                              : "bg-gray-600"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            missionStatus === "EXPIRED"
                              ? "text-gray-400"
                              : "text-white"
                          }`}
                        />
                      </div>
                      <div>
                        <h3
                          className={`font-semibold text-base ${
                            missionStatus === "ACTIVE"
                              ? "text-white"
                              : missionStatus === "UPCOMING"
                                ? "text-gray-200"
                                : "text-gray-400"
                          }`}
                        >
                          {mission.name}
                        </h3>
                        {/* Chỉ hiển thị khung thời gian */}
                        <div className="mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded border ${
                              missionStatus === "ACTIVE"
                                ? `${config.bgColor} ${config.textColor} ${config.borderColor}`
                                : missionStatus === "UPCOMING"
                                  ? `${config.bgColor} ${config.textColor} ${config.borderColor} opacity-75`
                                  : "bg-gray-700/50 text-gray-500 border-gray-600"
                            }`}
                          >
                            {getTimeRangeText(mission)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        missionStatus === "ACTIVE"
                          ? config.textColor
                          : missionStatus === "UPCOMING"
                            ? config.textColor + " opacity-75"
                            : "text-gray-500"
                      }`}
                    >
                      +{getMissionXP(mission)} XP
                    </span>
                  </div>

                  {/* Description full width */}
                  <div className="mb-4">
                    <p
                      className={`text-sm leading-relaxed ${
                        missionStatus === "ACTIVE"
                          ? "text-gray-300"
                          : missionStatus === "UPCOMING"
                            ? "text-gray-400"
                            : "text-gray-500"
                      }`}
                    >
                      {mission.description}
                    </p>
                  </div>

                  {/* Button claim phần thưởng */}
                  <div className="flex justify-end">
                    {isCompleted ? (
                      <Button
                        disabled
                        className="bg-green-600/50 text-green-200 px-6 py-2 text-sm font-medium cursor-not-allowed"
                      >
                        ✓ Đã Hoàn Thành
                      </Button>
                    ) : canClaim ? (
                      <Button
                        onClick={() =>
                          handleClaimMission(
                            mission.userCompletion?.id || mission.id,
                          )
                        }
                        disabled={claimMissionMutation.isPending}
                        className={`bg-gradient-to-r ${config.color} text-white px-6 py-2 text-sm font-medium transition-all ${
                          claimMissionMutation.isPending
                            ? "opacity-75"
                            : "hover:opacity-90"
                        }`}
                      >
                        {claimMissionMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Đang nhận thưởng...
                          </span>
                        ) : (
                          "Nhận Thưởng"
                        )}
                      </Button>
                    ) : (
                      <Button
                        disabled
                        className="bg-gray-600/50 text-gray-400 px-6 py-2 text-sm font-medium cursor-not-allowed"
                      >
                        {missionStatus === "UPCOMING"
                          ? "Chưa Đến Giờ"
                          : "Không Khả Dụng"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="mb-2">
                <Star className="w-12 h-12 mx-auto text-gray-600" />
              </div>
              <p>Không có nhiệm vụ nào trong danh mục này</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
