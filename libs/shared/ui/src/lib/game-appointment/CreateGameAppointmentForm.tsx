"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateGameAppointmentSchema,
  CreateGameAppointmentInput,
} from "@gateway-workspace/shared/ui/schema";
import { createGameAppointmentAction } from "@gateway-workspace/shared/ui";
import { Button } from "@gateway-workspace/shared/ui";
import { Input } from "@gateway-workspace/shared/ui";
import { Label } from "@gateway-workspace/shared/ui";
import { Textarea } from "@gateway-workspace/shared/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gateway-workspace/shared/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@gateway-workspace/shared/ui";
import { Alert, AlertDescription } from "@gateway-workspace/shared/ui";
import {
  Loader2,
  Calendar,
  Users,
  Clock,
  DollarSign,
  Gamepad2,
  Crown,
  Gift,
} from "lucide-react";
// Removed direct import of tier-utils to avoid server/client component issues

interface TierInfo {
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

interface TierPreview {
  tierName: string;
  questName: string;
  description: string;
  totalRewards: number;
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

interface CreateGameAppointmentFormProps {
  onSuccess?: () => void;
  onError?: () => void;
  isSubmitting?: boolean;
  setIsSubmitting?: (value: boolean) => void;
}

export function CreateGameAppointmentForm({
  onSuccess,
  onError,
  isSubmitting: externalIsSubmitting,
  setIsSubmitting: setExternalIsSubmitting,
}: CreateGameAppointmentFormProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [tierPreview, setTierPreview] = useState<TierPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableTiers, setAvailableTiers] = useState<TierInfo[]>([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateGameAppointmentInput>({
    resolver: zodResolver(CreateGameAppointmentSchema),
  });

  const watchedValues = watch();

  // Load available tiers on component mount
  useEffect(() => {
    const loadTiers = async () => {
      try {
        setIsLoadingTiers(true);
        const response = await fetch("/api/tiers");
        const result = await response.json();

        if (result.success) {
          setAvailableTiers(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch tiers");
        }
      } catch (error) {
        console.error("Error loading tiers:", error);
        setError("Không thể tải danh sách tier");
      } finally {
        setIsLoadingTiers(false);
      }
    };

    loadTiers();
  }, []);

  // Calculate tier preview when values change
  const calculateTierPreview = () => {
    if (!watchedValues.selectedTier) {
      setTierPreview(null);
      return;
    }

    try {
      const selectedTier = availableTiers.find(
        (tier) => tier.tierName === watchedValues.selectedTier,
      );

      if (selectedTier) {
        const preview = {
          tierName: selectedTier.tierName,
          questName: selectedTier.questName,
          description: `Quest ${selectedTier.questName} với ${selectedTier.minMembers} người`,
          totalRewards: Array.isArray(selectedTier.tasks)
            ? selectedTier.tasks.reduce(
                (sum: number, task: any) => sum + task.rewardAmount,
                0,
              )
            : 0,
          minMembers: selectedTier.minMembers,
          maxMembers: selectedTier.maxMembers,
          minHours: selectedTier.minHours,
          lockedAmount: selectedTier.lockedAmount,
          tasks: Array.isArray(selectedTier.tasks) ? selectedTier.tasks : [],
        };
        console.log("Setting tier preview:", preview);
        setTierPreview(preview);
      } else {
        setTierPreview(null);
      }
    } catch (error) {
      console.error("Error calculating tier preview:", error);
      setTierPreview(null);
    }
  };

  // Watch for changes and calculate tier preview
  useEffect(() => {
    calculateTierPreview();
  }, [watchedValues.selectedTier, availableTiers]);

  const onSubmit = async (data: CreateGameAppointmentInput) => {
    const loadingState =
      externalIsSubmitting !== undefined ? externalIsSubmitting : isLoading;
    const setLoadingState = setExternalIsSubmitting || setIsLoading;

    setLoadingState(true);
    setError(null);

    try {
      const result = await createGameAppointmentAction(data);

      if (!result.error) {
        onSuccess?.();
        // Reset form
        window.location.reload();
      } else {
        setError(result.error || "Có lỗi xảy ra khi tạo hẹn chơi");
        onError?.();
      }
    } catch (error) {
      console.error("Submit error:", error);
      setError("Có lỗi xảy ra khi tạo hẹn chơi");
      onError?.();
    } finally {
      setLoadingState(false);
    }
  };

  const isInModal = onSuccess !== undefined || onError !== undefined;

  if (isInModal) {
    // Render for modal - no wrapper layout
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Thông tin cơ bản</h3>

          <div>
            <Label htmlFor="title" className="text-white">
              Tiêu đề hẹn chơi *
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Ví dụ: Hẹn chơi Valorant Ranked"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
            {errors.title && (
              <p className="text-sm text-red-400 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-white">
              Mô tả
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Mô tả chi tiết về hẹn chơi..."
              rows={3}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Game Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Thông tin game</h3>

          <div>
            <Label htmlFor="game" className="text-white">
              Game *
            </Label>
            <Input
              id="game"
              {...register("game")}
              placeholder="Ví dụ: Valorant, League of Legends"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
            {errors.game && (
              <p className="text-sm text-red-400 mt-1">{errors.game.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="gameType" className="text-white">
              Thể loại *
            </Label>
            <Select
              onValueChange={(value) => setValue("gameType", value as any)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Chọn thể loại game" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="CASUAL" className="text-white">
                  Casual - Chơi vui
                </SelectItem>
                <SelectItem value="RANKED" className="text-white">
                  Ranked - Cày rank
                </SelectItem>
                <SelectItem value="COMPETITIVE" className="text-white">
                  Competitive - Thi đấu
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.gameType && (
              <p className="text-sm text-red-400 mt-1">
                {errors.gameType.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="rankLevel" className="text-white">
              Mức rank
            </Label>
            <Input
              id="rankLevel"
              {...register("rankLevel")}
              placeholder="Ví dụ: Bạc, Vàng, Kim Cương"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Time and Tier */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Thời gian và Tier
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime" className="text-white">
                Thời gian bắt đầu *
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                {...register("startTime")}
                className="bg-gray-700 border-gray-600 text-white"
              />
              {errors.startTime && (
                <p className="text-sm text-red-400 mt-1">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="endTime" className="text-white">
                Thời gian kết thúc *
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                {...register("endTime")}
                className="bg-gray-700 border-gray-600 text-white"
              />
              {errors.endTime && (
                <p className="text-sm text-red-400 mt-1">
                  {errors.endTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Tier Selection */}
          <div>
            <Label htmlFor="selectedTier" className="text-white">
              Tier *
            </Label>
            {isLoadingTiers ? (
              <div className="flex items-center gap-2 p-3 bg-gray-700 border border-gray-600 rounded-md">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                <span className="text-gray-400">
                  Đang tải danh sách tier...
                </span>
              </div>
            ) : (
              <Select
                onValueChange={(value) => setValue("selectedTier", value)}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Chọn tier cho hẹn chơi" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {availableTiers.map((tier) => (
                    <SelectItem
                      key={tier.tierName}
                      value={tier.tierName}
                      className="text-white"
                    >
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        <span>{tier.questName}</span>
                        <span className="text-gray-400">
                          ({tier.minMembers} người)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.selectedTier && (
              <p className="text-sm text-red-400 mt-1">
                {errors.selectedTier.message}
              </p>
            )}
          </div>

          {/* Display tier requirements */}
          {tierPreview && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-blue-300 text-lg">
                  {tierPreview.questName}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-blue-200">
                    <strong>Tối thiểu: {tierPreview.minMembers} người</strong>
                    {tierPreview.maxMembers &&
                      ` (tối đa ${tierPreview.maxMembers})`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-blue-200">
                    <strong>Tối thiểu: {tierPreview.minHours} giờ</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tier Benefits Preview */}
        {tierPreview && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Ưu đãi và phần thưởng
            </h3>
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="h-5 w-5 text-purple-400" />
                <span className="font-semibold text-green-300 text-lg">
                  Các ưu đãi hấp dẫn
                </span>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-green-300">
                    🎯 Nhiệm vụ và phần thưởng:
                  </span>
                </div>
                <div className="space-y-2">
                  {Array.isArray(tierPreview.tasks) &&
                    tierPreview.tasks.map((task, index) => (
                      <div
                        key={task.taskId || index}
                        className="bg-green-800/20 rounded p-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="text-sm text-green-200 font-medium">
                              {task.taskName}
                            </span>
                            <p className="text-xs text-green-300 mt-1">
                              {task.challenge}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <span className="text-sm text-yellow-300 font-bold">
                              {task.rewardAmount.toLocaleString()} VNĐ
                            </span>
                            <p className="text-xs text-green-300">
                              {task.requiredQuantity} {task.itemType}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="border-t border-green-600 pt-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-300">
                    💰 Số tiền khóa:{" "}
                    <strong>
                      {tierPreview.lockedAmount.toLocaleString()} VNĐ/người
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={
            externalIsSubmitting !== undefined
              ? externalIsSubmitting
              : isLoading
          }
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {(
            externalIsSubmitting !== undefined
              ? externalIsSubmitting
              : isLoading
          ) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tạo hẹn chơi...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Tạo hẹn chơi
            </>
          )}
        </Button>
      </form>
    );
  }

  // Render for standalone page - with wrapper layout
  return (
    <div className="flex flex-col p-3 gap-2 h-screen">
      <div className="flex-1 bg-gray-900/95 rounded-xl p-4 border border-gray-800 shadow-lg overflow-auto">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                <Gamepad2 className="h-6 w-6" />
                Tạo Hẹn Chơi Mới
              </h1>
              <p className="text-gray-400">
                Tạo hẹn chơi game cùng bạn bè và nhận phần thưởng hấp dẫn
              </p>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Thông tin cơ bản
                  </h3>

                  <div>
                    <Label htmlFor="title" className="text-white">
                      Tiêu đề hẹn chơi *
                    </Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="Ví dụ: Hẹn chơi Valorant Ranked"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-400 mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">
                      Mô tả
                    </Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Mô tả chi tiết về hẹn chơi..."
                      rows={3}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Game Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Thông tin game
                  </h3>

                  <div>
                    <Label htmlFor="game" className="text-white">
                      Game *
                    </Label>
                    <Input
                      id="game"
                      {...register("game")}
                      placeholder="Ví dụ: Valorant, League of Legends"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                    {errors.game && (
                      <p className="text-sm text-red-400 mt-1">
                        {errors.game.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gameType" className="text-white">
                      Thể loại *
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("gameType", value as any)
                      }
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Chọn thể loại game" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="CASUAL" className="text-white">
                          Casual - Chơi vui
                        </SelectItem>
                        <SelectItem value="RANKED" className="text-white">
                          Ranked - Cày rank
                        </SelectItem>
                        <SelectItem value="COMPETITIVE" className="text-white">
                          Competitive - Thi đấu
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gameType && (
                      <p className="text-sm text-red-400 mt-1">
                        {errors.gameType.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="rankLevel" className="text-white">
                      Mức rank
                    </Label>
                    <Input
                      id="rankLevel"
                      {...register("rankLevel")}
                      placeholder="Ví dụ: Bạc, Vàng, Kim Cương"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Time and Tier */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Thời gian và Tier
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime" className="text-white">
                        Thời gian bắt đầu *
                      </Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        {...register("startTime")}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      {errors.startTime && (
                        <p className="text-sm text-red-400 mt-1">
                          {errors.startTime.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="endTime" className="text-white">
                        Thời gian kết thúc *
                      </Label>
                      <Input
                        id="endTime"
                        type="datetime-local"
                        {...register("endTime")}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      {errors.endTime && (
                        <p className="text-sm text-red-400 mt-1">
                          {errors.endTime.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tier Selection */}
                  <div>
                    <Label htmlFor="selectedTier" className="text-white">
                      Tier *
                    </Label>
                    {isLoadingTiers ? (
                      <div className="flex items-center gap-2 p-3 bg-gray-700 border border-gray-600 rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <span className="text-gray-400">
                          Đang tải danh sách tier...
                        </span>
                      </div>
                    ) : (
                      <Select
                        onValueChange={(value) =>
                          setValue("selectedTier", value)
                        }
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Chọn tier cho hẹn chơi" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {availableTiers.map((tier) => (
                            <SelectItem
                              key={tier.tierName}
                              value={tier.tierName}
                              className="text-white"
                            >
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4" />
                                <span>{tier.questName}</span>
                                <span className="text-gray-400">
                                  ({tier.minMembers} người)
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {errors.selectedTier && (
                      <p className="text-sm text-red-400 mt-1">
                        {errors.selectedTier.message}
                      </p>
                    )}
                  </div>

                  {/* Display tier requirements */}
                  {tierPreview && (
                    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Crown className="h-5 w-5 text-yellow-400" />
                        <span className="font-semibold text-blue-300 text-lg">
                          {tierPreview.questName}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-blue-200">
                            <strong>
                              Tối thiểu: {tierPreview.minMembers} người
                            </strong>
                            {tierPreview.maxMembers &&
                              ` (tối đa ${tierPreview.maxMembers})`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-400" />
                          <span className="text-sm text-blue-200">
                            <strong>
                              Tối thiểu: {tierPreview.minHours} giờ
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tier Benefits Preview */}
                {tierPreview && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Ưu đãi và phần thưởng
                    </h3>
                    <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Gift className="h-5 w-5 text-purple-400" />
                        <span className="font-semibold text-green-300 text-lg">
                          Các ưu đãi hấp dẫn
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-green-300">
                            🎯 Nhiệm vụ và phần thưởng:
                          </span>
                        </div>
                        <div className="space-y-2">
                          {Array.isArray(tierPreview.tasks) &&
                            tierPreview.tasks.map((task, index) => (
                              <div
                                key={task.taskId || index}
                                className="bg-green-800/20 rounded p-3"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <span className="text-sm text-green-200 font-medium">
                                      {task.taskName}
                                    </span>
                                    <p className="text-xs text-green-300 mt-1">
                                      {task.challenge}
                                    </p>
                                  </div>
                                  <div className="text-right ml-4">
                                    <span className="text-sm text-yellow-300 font-bold">
                                      {task.rewardAmount.toLocaleString()} VNĐ
                                    </span>
                                    <p className="text-xs text-green-300">
                                      {task.requiredQuantity} {task.itemType}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="border-t border-green-600 pt-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-green-300">
                            💰 Số tiền khóa:{" "}
                            <strong>
                              {tierPreview.lockedAmount.toLocaleString()}{" "}
                              VNĐ/người
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                    <p className="text-red-300">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo hẹn chơi...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Tạo hẹn chơi
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
