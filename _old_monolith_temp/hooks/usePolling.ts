// hooks/usePolling.ts
import { useState, useEffect, useRef } from "react";

// Global registry to track active polling instances
const activePollingInstances = new Map<string, NodeJS.Timeout>();

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

  // Create a unique key for this polling instance
  const pollingKey = useRef<string>(`polling_${Date.now()}_${Math.random()}`);

  const [state, setState] = useState<PollingState<T>>({
    data: null,
    error: null,
    isLoading: false,
    lastUpdated: null,
  });

  const isInitialMount = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  const abortControllerRef = useRef<AbortController>();

  const fetchData = async () => {
    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        // console.log(`[${pollingKey.current}] Cancelling previous request`);
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState((prev) => ({ ...prev, isLoading: true }));
      // console.log(`[${pollingKey.current}] Fetching data from:`, url);
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

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
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

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
    console.log(`[${pollingKey.current}] usePolling effect running with:`, { url, interval, enabled });

    if (!enabled) {
      // Clear interval if disabled
      if (intervalRef.current) {
        console.log(`[${pollingKey.current}] Clearing interval (disabled):`, intervalRef.current);
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
        activePollingInstances.delete(pollingKey.current);
      }
      return;
    }

    // Check if there's already an active polling instance for this URL
    const existingInstance = Array.from(activePollingInstances.keys()).find(key => 
      key.includes(url.split('?')[0]) // Match base URL
    );
    
    if (existingInstance && existingInstance !== pollingKey.current) {
      console.log(`[${pollingKey.current}] Found existing polling instance for URL:`, existingInstance);
      // Don't create new instance if one already exists
      return;
    }

    // Clear existing interval before setting new one
    if (intervalRef.current) {
      console.log(`[${pollingKey.current}] Clearing existing interval:`, intervalRef.current);
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
      activePollingInstances.delete(pollingKey.current);
    }

    // Initial fetch
    console.log(`[${pollingKey.current}] Initial fetch`);
    fetchData();

    // Set up new polling interval
    intervalRef.current = setInterval(() => {
      console.log(`[${pollingKey.current}] Polling fetch`);
      fetchData();
    }, interval);
    
    // Register this instance
    activePollingInstances.set(pollingKey.current, intervalRef.current);
    console.log(`[${pollingKey.current}] New interval set up:`, intervalRef.current);

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log(`[${pollingKey.current}] Cleaning up interval:`, intervalRef.current);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      activePollingInstances.delete(pollingKey.current);
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, interval, enabled]);

  // Return state and manual fetch trigger
  return {
    ...state,
    refetch: fetchData,
  };
}
