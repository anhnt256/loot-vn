// hooks/useEnhancedFingerprint.ts
import { useState, useEffect } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

interface SystemInfo {
  cores: number;
  memory: number;
  platform: string;
  userAgent: string;
  screenResolution: string;
  timeZone: string;
  language: string;
  doNotTrack: string | null;
  localIp?: string;
  macAddress?: string;
}

interface EnhancedFingerprint {
  visitorId: string;
  systemInfo: SystemInfo;
  networkInfo?: {
    localIp: string;
    subnet: string;
  };
  combinedHash: string;
}

export function useEnhancedFingerprint() {
  const [fingerprint, setFingerprint] = useState<EnhancedFingerprint | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Lấy thông tin hệ thống cơ bản
  const getSystemInfo = (): SystemInfo => ({
    cores: navigator.hardwareConcurrency,
    memory: (navigator as any).deviceMemory || 0,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    doNotTrack: navigator.doNotTrack,
  });

  // Lấy địa chỉ IP local thông qua WebRTC
  const getLocalIp = async (): Promise<string | undefined> => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      pc.createDataChannel("");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      return new Promise((resolve) => {
        pc.onicecandidate = (ice) => {
          if (!ice.candidate) return;

          // Tìm địa chỉ IP local từ ICE candidate
          const matches = ice.candidate.candidate.match(/([\d.]+)(?!.*[\d.])/g);
          if (matches && matches[0].match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
            resolve(matches[0]);
          }

          pc.close();
        };
      });
    } catch (error) {
      console.error("Failed to get local IP:", error);
      return undefined;
    }
  };

  // Hash tất cả thông tin thành một chuỗi duy nhất
  const hashData = async (data: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const getEnhancedFingerprint = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Lấy fingerprint cơ bản
      const fp = await FingerprintJS.load();
      const { visitorId } = await fp.get();

      // 2. Lấy thông tin hệ thống
      const systemInfo = getSystemInfo();

      // 3. Lấy địa chỉ IP local
      const localIp = await getLocalIp();
      const networkInfo = localIp
        ? {
            localIp,
            subnet: localIp.split(".").slice(0, 3).join("."), // Lấy subnet
          }
        : undefined;

      // 4. Kết hợp tất cả thông tin để tạo hash duy nhất
      const combinedData = JSON.stringify({
        visitorId,
        systemInfo,
        networkInfo,
        timestamp: Date.now(), // Thêm timestamp để tăng độ chính xác
      });

      const combinedHash = await hashData(combinedData);

      const enhancedFp: EnhancedFingerprint = {
        visitorId,
        systemInfo,
        networkInfo,
        combinedHash,
      };

      setFingerprint(enhancedFp);
      return enhancedFp;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to get enhanced fingerprint");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEnhancedFingerprint();
  }, []);

  return {
    fingerprint,
    loading,
    error,
    refresh: getEnhancedFingerprint,
  };
}
