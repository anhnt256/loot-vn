import { useState, useEffect } from "react";

function getStoredValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

export function useLocalStorageValue<T = any>(key: string, defaultValue: T): T {
  const [storedValue, setStoredValue] = useState<T>(() => getStoredValue(key, defaultValue));

  useEffect(() => {
    function handleStorage() {
      setStoredValue(getStoredValue(key, defaultValue));
    }
    window.addEventListener("storage", handleStorage);
    // Listen for local changes (same tab)
    const origSetItem = localStorage.setItem;
    localStorage.setItem = function (...args) {
      origSetItem.apply(this, args);
      window.dispatchEvent(new Event("storage"));
    };
    return () => {
      window.removeEventListener("storage", handleStorage);
      localStorage.setItem = origSetItem;
    };
  }, [key, defaultValue]);

  return storedValue;
} 