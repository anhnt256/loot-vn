// hooks/useFingerprint.ts
import { useState, useEffect } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

interface UseFingerprintOptions {
  immediate?: boolean; // Có lấy fingerprint ngay khi mount không
  onSuccess?: (id: string) => void; // Callback khi lấy fingerprint thành công
  onError?: (error: Error) => void; // Callback khi có lỗi
}

export function useFingerprint(options: UseFingerprintOptions = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [visitorId, setVisitorId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Hàm lấy fingerprint
  const getFingerprint = async () => {
    try {
      setLoading(true);
      setError(null);

      // Khởi tạo FingerprintJS
      const fp = await FingerprintJS.load();

      // Lấy visitor id
      const result = await fp.get();

      console.log("Fingerprint:", result);

      // Cập nhật state và gọi callback
      setVisitorId(result.visitorId);
      onSuccess?.(result.visitorId);

      return result.visitorId;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to get fingerprint");
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Tự động lấy fingerprint khi mount nếu immediate = true
  useEffect(() => {
    if (immediate) {
      getFingerprint();
    }
  }, [immediate]);

  return {
    visitorId,
    loading,
    error,
    getFingerprint,
  };
}
