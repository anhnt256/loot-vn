/**
 * Debug utilities for development and testing
 * Provides default values for MacAddress and userId based on environment variables
 */

export interface DebugConfig {
  isDebugGoVap: boolean;
  isDebugTanPhu: boolean;
  useDefaultUserId: boolean;
  defaultMacAddress: string;
  defaultUserId: number;
  defaultMachineName: string;
}

/**
 * Get debug configuration based on environment variables
 */
export function getDebugConfig(): DebugConfig {
  const isDebugGoVap = process.env.IS_DEBUG_GO_VAP === "true";
  const isDebugTanPhu = process.env.IS_DEBUG_TAN_PHU === "true";
  const useDefaultUserId = process.env.USE_DEFAULT_USER_ID === "true";

  // Default values for Go Vap branch
  const goVapDefaults = {
    macAddress: "00-CF-E0-46-C8-37",
    userId: 8503,
    machineName: "GO_VAP_01",
  };

  // Default values for Tan Phu branch
  const tanPhuDefaults = {
    macAddress: "EC-D6-8A-DE-89-55",
    userId: 5262,
    machineName: "TAN_PHU_01",
  };

  // Determine which defaults to use
  let defaultMacAddress: string;
  let defaultUserId: number;
  let defaultMachineName: string;

  if (isDebugGoVap) {
    defaultMacAddress = goVapDefaults.macAddress;
    defaultUserId = goVapDefaults.userId;
    defaultMachineName = goVapDefaults.machineName;
  } else if (isDebugTanPhu) {
    defaultMacAddress = tanPhuDefaults.macAddress;
    defaultUserId = tanPhuDefaults.userId;
    defaultMachineName = tanPhuDefaults.machineName;
  } else {
    // No debug mode active
    defaultMacAddress = "";
    defaultUserId = 0;
    defaultMachineName = "";
  }

  return {
    isDebugGoVap,
    isDebugTanPhu,
    useDefaultUserId,
    defaultMacAddress,
    defaultUserId,
    defaultMachineName,
  };
}

/**
 * Get default MacAddress for debug mode
 * Returns the debug MacAddress if debug mode is active, otherwise returns the provided value
 */
export function getDebugMacAddress(originalMacAddress?: string): string {
  const config = getDebugConfig();

  if (config.isDebugGoVap || config.isDebugTanPhu) {
    console.log(
      `[DEBUG] Using default MacAddress: ${config.defaultMacAddress} for branch: ${getDebugBranch()}`,
    );
    return config.defaultMacAddress;
  }

  return originalMacAddress || "";
}

/**
 * Get default userId for debug mode
 * Returns the debug userId if debug mode is active AND USE_DEFAULT_USER_ID is true,
 * otherwise returns the provided value from DB
 */
export function getDebugUserId(originalUserId?: number): number {
  const config = getDebugConfig();

  if (
    (config.isDebugGoVap || config.isDebugTanPhu) &&
    config.useDefaultUserId
  ) {
    console.log(
      `[DEBUG] Using default userId: ${config.defaultUserId} for branch: ${getDebugBranch()} (USE_DEFAULT_USER_ID=true)`,
    );
    return config.defaultUserId;
  }

  return originalUserId || 0;
}

/**
 * Get default machine name for debug mode
 * Returns the debug machine name if debug mode is active, otherwise returns the provided value
 */
export function getDebugMachineName(originalMachineName?: string): string {
  const config = getDebugConfig();

  if (config.isDebugGoVap || config.isDebugTanPhu) {
    console.log(
      `[DEBUG] Using default machine name: ${config.defaultMachineName} for branch: ${getDebugBranch()}`,
    );
    return config.defaultMachineName;
  }

  return originalMachineName || "";
}

/**
 * Check if debug mode is active
 */
export function isDebugMode(): boolean {
  const config = getDebugConfig();
  return config.isDebugGoVap || config.isDebugTanPhu;
}

/**
 * Get debug branch name
 */
export function getDebugBranch(): string {
  const config = getDebugConfig();

  if (config.isDebugGoVap) {
    return "GO_VAP";
  } else if (config.isDebugTanPhu) {
    return "TAN_PHU";
  }

  return "";
}

/**
 * Log debug information
 */
export function logDebugInfo(context: string, data?: any): void {
  if (isDebugMode()) {
    const config = getDebugConfig();
    console.log(`[DEBUG ${context}] Debug mode active:`, {
      isDebugGoVap: config.isDebugGoVap,
      isDebugTanPhu: config.isDebugTanPhu,
      useDefaultUserId: config.useDefaultUserId,
      branch: getDebugBranch(),
      defaultMacAddress: config.defaultMacAddress,
      defaultUserId: config.defaultUserId,
      defaultMachineName: config.defaultMachineName,
      ...(data && { data }),
    });
  }
}
