import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AutoComplete } from "antd";
import debounce from "lodash/debounce";
import Cookies from "js-cookie";

const giftRoundSchema = z.object({
  userId: z.number().min(1, "Vui lòng chọn người dùng"),
  amount: z.number().min(1, "Số lượt phải lớn hơn 0"),
  reason: z.string().min(1, "Vui lòng nhập lý do"),
  expiredAt: z.string().optional(),
});

type GiftRoundInput = z.infer<typeof giftRoundSchema>;

interface GiftRoundFormProps {
  initialData?: {
    id: number;
    userId: number;
    amount: number;
    reason: string;
    expiredAt: string | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface UserOption {
  value: number;
  label: string;
}

export function GiftRoundForm({
  initialData,
  onSuccess,
  onCancel,
}: GiftRoundFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<UserOption[]>([]);
  const currentBranch = Cookies.get("branch") || "GO_VAP";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GiftRoundInput>({
    resolver: zodResolver(giftRoundSchema),
    defaultValues: initialData
      ? {
          userId: initialData.userId,
          amount: initialData.amount,
          reason: initialData.reason,
          expiredAt: initialData.expiredAt || undefined,
        }
      : undefined,
  });

  const searchUsers = async (query: string) => {
    if (!query) {
      setOptions([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) throw new Error("Search failed");

      const users = await response.json();
      setOptions(
        users.map((user: any) => ({
          value: user.userId,
          label: `${user.userId} - ${user.userName || "Không có tên"}`,
        })),
      );
    } catch (error) {
      console.error("Search error:", error);
      setOptions([]);
    }
  };

  const debouncedSearch = debounce(searchUsers, 300);

  const onSubmit = async (data: GiftRoundInput) => {
    try {
      setIsLoading(true);
      console.log("Submitting data:", data);
      console.log("Form errors:", errors);

      const url = initialData
        ? `/api/gift-rounds/${initialData.id}`
        : "/api/gift-rounds";
      const method = initialData ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("API error:", error);
        throw new Error(error.error || "Có lỗi xảy ra");
      }

      const result = await response.json();
      console.log("Success result:", result);

      toast.success(initialData ? "Cập nhật thành công" : "Tạo mới thành công");
      onSuccess?.();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="text-sm text-blue-800">
          <strong>Branch hiện tại:</strong>{" "}
          {currentBranch === "GO_VAP" ? "Gò Vấp" : "Tân Phú"}
        </div>
        <div className="text-xs text-blue-600 mt-1">
          Lượt chơi sẽ được tặng cho người dùng thuộc branch này
        </div>
      </div>

      <div>
        <label
          htmlFor="userId"
          className="block text-sm font-medium text-gray-700"
        >
          ID người dùng
        </label>
        <Controller
          name="userId"
          control={control}
          render={({ field }) => (
            <AutoComplete
              {...field}
              options={options}
              onSearch={debouncedSearch}
              placeholder="Nhập ID hoặc tên người dùng"
              className="w-full"
              disabled={isLoading}
              status={errors.userId ? "error" : ""}
            />
          )}
        />
        {errors.userId && (
          <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Số lượt
        </label>
        <input
          type="number"
          id="amount"
          {...register("amount", { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-gray-700"
        >
          Lý do
        </label>
        <input
          type="text"
          id="reason"
          {...register("reason")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.reason && (
          <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="expiredAt"
          className="block text-sm font-medium text-gray-700"
        >
          Ngày hết hạn
        </label>
        <input
          type="datetime-local"
          id="expiredAt"
          {...register("expiredAt")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.expiredAt && (
          <p className="mt-1 text-sm text-red-600">
            {errors.expiredAt.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : initialData ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
}
