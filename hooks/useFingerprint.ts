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
  const getLocalIp = async () => {
    new Promise((resolve, reject) => {
      window.RTCPeerConnection =
        window.RTCPeerConnection ||
        window.mozRTCPeerConnection ||
        window.webkitRTCPeerConnection;

      if (typeof window.RTCPeerConnection == "undefined")
        return reject("WebRTC not supported by browser");

      const pc = new RTCPeerConnection();
      const ips: any[] = [];

      pc.createDataChannel("");
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((err) => reject(err));
      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) {
          // All ICE candidates have been sent.
          if (ips.length == 0)
            return reject("WebRTC disabled or restricted by browser");

          return resolve(ips);
        }

        const parts = event.candidate.candidate.split(" ");
        const [
          base,
          componentId,
          protocol,
          priority,
          ip,
          port,
          ,
          type,
          ...attr
        ] = parts;
        const component = ["rtp", "rtpc"];

        // if (!ips.some((e) => e === ip)) ips.push('4090310242'); //4090310242
        ips.push(ip);
        // ips.push("192.168.1.119");

        console.group("computer statistic");
        console.log(" candidate: " + base.split(":")[1]);
        console.log(" component: " + component[componentId - 1]);
        console.log("  protocol: " + protocol);
        console.log("  priority: " + priority);
        console.log("        ip: " + ip);
        console.log("      port: " + port);
        console.log("      type: " + type);
        console.groupEnd();
      };
    });
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

      console.log("visitorId", visitorId);

      // 2. Lấy thông tin hệ thống
      const systemInfo = getSystemInfo();

      console.log("systemInfo", systemInfo);

      // 3. Lấy địa chỉ IP local
      const localIp = await getLocalIp();

      console.log("localIp", localIp);

      // const networkInfo = localIp[0]
      //   ? {
      //       localIp,
      //       subnet: localIp.split(".").slice(0, 3).join("."), // Lấy subnet
      //     }
      //   : undefined;
      //
      // console.log("networkInfo", networkInfo);

      // 4. Kết hợp tất cả thông tin để tạo hash duy nhất
      // const combinedData = JSON.stringify({
      //   visitorId,
      //   systemInfo,
      //   networkInfo,
      //   timestamp: Date.now(), // Thêm timestamp để tăng độ chính xác
      // });
      //
      // console.log("combinedData", combinedData);
      //
      // const combinedHash = await hashData(combinedData);
      // console.log("combinedHash", combinedHash);
      //
      // const enhancedFp: EnhancedFingerprint = {
      //   visitorId,
      //   systemInfo,
      // {localIp: "192.168.1.119"; subnet: "1"}
      //   1,
      // };
      //
      // setFingerprint(enhancedFp);
      // return enhancedFp;
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
