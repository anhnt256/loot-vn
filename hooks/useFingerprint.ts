// hooks/useEnhancedFingerprint.ts
import { useState, useEffect } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

interface EnhancedFingerprint {
  visitorId: string;
  localIp: string;
}

export function useEnhancedFingerprint() {
  const [fingerprint, setFingerprint] = useState<EnhancedFingerprint | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Lấy địa chỉ IP local thông qua WebRTC
  const getLocalIp = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window.RTCPeerConnection == "undefined") {
        return reject("WebRTC not supported by browser");
      }

      const pc = new RTCPeerConnection();
      pc.createDataChannel("");

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((err) => reject(err));

      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) {
          return reject("WebRTC disabled or restricted by browser");
        }

        const parts = event.candidate.candidate.split(" ");
        const ip = parts[4]; // IP address is the 5th element

        if (ip) {
          pc.close(); // Clean up RTCPeerConnection
          resolve(ip);
        }
      };
    });
  };

  const getEnhancedFingerprint = async () => {
    try {
      setLoading(true);
      setError(null);

      const fp = await FingerprintJS.load();
      const { visitorId } = await fp.get();

      // const localIp = await getLocalIp();
      const localIp = "e9b949a9-0697-44c4-90fd-81b6396d7099.local";

      const enhancedFp = {
        visitorId,
        localIp,
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
