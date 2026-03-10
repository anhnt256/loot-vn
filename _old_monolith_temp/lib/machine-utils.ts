// Machine utility functions for Fnet DB integration

export interface MachineDetail {
  machineName: string;
  macAddress: string | null;
  price: number;
  netInfo: any;
  machineGroupName: string;
  machineGroupId: number;
  priceDefault?: number;
  description?: any;
}

export interface MachineGroup {
  MachineGroupId: number;
  MachineGroupName: string;
  PriceDefault: number;
  Active: number;
  Description: any;
  machineCount: number;
}

export interface NetInfo {
  Cpu?: string;
  Gpu?: string;
  Memory?: string;
  Motherboard?: string;
  Network?: string;
  Storage?: string;
  macAddress?: string;
  cpu_core_num?: string;
  cpu_core_temp?: string;
  cpu_load?: string;
  cpu_power?: string;
  cpu_temp?: string;
  cpu_thread_num?: string;
  disk_load?: string;
  gpu_fan_load?: string;
  gpu_load?: string;
  gpu_mem?: string;
  gpu_mem_load?: string;
  gpu_temp?: string;
  gpu_hotspot_temp?: string;
  net_download?: string;
  net_upload?: string;
  ram_available?: string;
  ram_load?: string;
  ram_used?: string;
  stt?: string;
  ts?: string;
}

/**
 * Fetch all machine details from Fnet DB
 */
export async function fetchMachineDetails(): Promise<MachineDetail[]> {
  try {
    const response = await fetch("/api/machine-details");
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch machine details");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching machine details:", error);
    throw error;
  }
}

/**
 * Fetch machine details by group from Fnet DB
 */
export async function fetchMachineDetailsByGroup(
  machineGroupId?: number,
): Promise<MachineDetail[]> {
  try {
    const url = machineGroupId
      ? `/api/machine-details/by-group?machineGroupId=${machineGroupId}`
      : "/api/machine-details/by-group";

    const response = await fetch(url);
    const result = await response.json();

    if (!result.success) {
      throw new Error(
        result.error || "Failed to fetch machine details by group",
      );
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching machine details by group:", error);
    throw error;
  }
}

/**
 * Fetch machine groups from Fnet DB
 */
export async function fetchMachineGroups(): Promise<MachineGroup[]> {
  try {
    const response = await fetch("/api/machine-groups");
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch machine groups");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching machine groups:", error);
    throw error;
  }
}

/**
 * Parse NetInfo JSON string to object
 */
export function parseNetInfo(netInfoString: string): NetInfo | null {
  try {
    return JSON.parse(netInfoString);
  } catch (error) {
    console.error("Error parsing NetInfo:", error);
    return null;
  }
}

/**
 * Extract machine specifications from NetInfo
 */
export function extractMachineSpecs(netInfo: NetInfo): {
  cpu: string;
  gpu: string;
  memory: string;
  motherboard: string;
  network: string;
  storage: string;
} {
  return {
    cpu: netInfo.Cpu || "Unknown",
    gpu: netInfo.Gpu || "Unknown",
    memory: netInfo.Memory || "Unknown",
    motherboard: netInfo.Motherboard || "Unknown",
    network: netInfo.Network || "Unknown",
    storage: netInfo.Storage || "Unknown",
  };
}

/**
 * Extract performance metrics from NetInfo
 */
export function extractPerformanceMetrics(netInfo: NetInfo): {
  cpuLoad: number;
  cpuTemp: number;
  gpuLoad: number;
  gpuTemp: number;
  ramLoad: number;
  ramUsed: number;
  ramAvailable: number;
} {
  return {
    cpuLoad: parseFloat(netInfo.cpu_load || "0"),
    cpuTemp: parseFloat(netInfo.cpu_temp || "0"),
    gpuLoad: parseFloat(netInfo.gpu_load || "0"),
    gpuTemp: parseFloat(netInfo.gpu_temp || "0"),
    ramLoad: parseFloat(netInfo.ram_load || "0"),
    ramUsed: parseFloat(netInfo.ram_used || "0"),
    ramAvailable: parseFloat(netInfo.ram_available || "0"),
  };
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

/**
 * Get machine status based on performance metrics
 */
export function getMachineStatus(
  netInfo: NetInfo,
): "online" | "offline" | "busy" | "idle" {
  if (!netInfo.ts) return "offline";

  const lastUpdate = parseInt(netInfo.ts) * 1000; // Convert to milliseconds
  const now = Date.now();
  const timeDiff = now - lastUpdate;

  // If last update was more than 5 minutes ago, consider offline
  if (timeDiff > 5 * 60 * 1000) return "offline";

  const cpuLoad = parseFloat(netInfo.cpu_load || "0");
  const gpuLoad = parseFloat(netInfo.gpu_load || "0");

  // If CPU or GPU load is high, consider busy
  if (cpuLoad > 80 || gpuLoad > 80) return "busy";

  // If load is very low, consider idle
  if (cpuLoad < 10 && gpuLoad < 10) return "idle";

  return "online";
}

/**
 * Parse machine display name to extract actual machine name
 * Handles formats like "Máy VIP01", "VIP01", etc.
 */
export function parseMachineDisplayName(displayName: string): {
  name: string;
  displayName: string;
} {
  if (!displayName) {
    return { name: "", displayName: "" };
  }

  // Remove "Máy " prefix if present
  const cleanName = displayName.replace(/^Máy\s+/i, "").trim();

  return {
    name: cleanName,
    displayName: cleanName ? `Máy ${cleanName}` : displayName,
  };
}
