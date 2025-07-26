// hooks/usePolling.ts
import { useState, useEffect, useRef } from "react";

interface PollingOptions {
  interval?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

interface PollingState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export function usePolling<T>(url: string, options: PollingOptions = {}) {
  const {
    interval = 10000, // 10 seconds default
    enabled = true,
    onError,
    onSuccess,
  } = options;

  const [state, setState] = useState<PollingState<T>>({
    data: null,
    error: null,
    isLoading: false,
    lastUpdated: null,
  });

  const isInitialMount = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchData = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setState({
        data,
        error: null,
        isLoading: false,
        lastUpdated: new Date(),
      });

      onSuccess?.(data);
    } catch (error) {
      const errorObject =
        error instanceof Error ? error : new Error(String(error));

      setState((prev) => ({
        ...prev,
        error: errorObject,
        isLoading: false,
        lastUpdated: new Date(),
      }));

      onError?.(errorObject);
    }
  };

  useEffect(() => {
    console.log("usePolling effect running with:", { url, interval, enabled });

    if (!enabled) return;

    // Chỉ gọi fetchData lần đầu tiên khi component mount
    if (isInitialMount.current) {
      console.log("Initial fetch");
      fetchData();
      isInitialMount.current = false;
    } else {
      // Nếu không phải lần đầu, vẫn fetch data khi URL thay đổi
      fetchData();
    }

    // Set up polling interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(fetchData, interval);
    console.log("New interval set up:", intervalRef.current);

    // Cleanup on unmount or when enabled changes
    return () => {
      console.log("Cleaning up interval:", intervalRef.current);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [url, interval, enabled]);

  // Return state and manual fetch trigger
  return {
    ...state,
    refetch: fetchData,
  };
}
