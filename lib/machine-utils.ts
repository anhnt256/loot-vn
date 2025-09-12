/**
 * Utility functions for machine name formatting and display
 */

/**
 * Get branch from cookie
 * @returns Branch name from cookie or empty string
 */
export function getBranchFromCookie(): string {
  if (typeof window === "undefined") return "";

  const cookies = document.cookie.split(";");
  const branchCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("branch="),
  );
  return branchCookie ? branchCookie.split("=")[1] : "";
}

export interface MachineInfo {
  name: string;
  branch: string;
  displayName: string;
}

/**
 * Format machine name with branch for display
 * @param machineName - The machine name (e.g., "MAY42")
 * @param branch - The branch name (e.g., "TAN_PHU")
 * @returns Formatted display name (e.g., "MAY42 (TAN_PHU)")
 */
export function formatMachineDisplayName(
  machineName: string,
  branch: string,
): string {
  if (!machineName || !branch) {
    return machineName || "Unknown Machine";
  }

  return `${machineName} (${branch})`;
}

/**
 * Parse machine display name back to components
 * @param displayName - The formatted display name (e.g., "MAY42 (TAN_PHU)")
 * @returns Object with name and branch
 */
export function parseMachineDisplayName(displayName: string): {
  name: string;
  branch: string;
} {
  if (!displayName || typeof displayName !== "string") {
    return { name: "", branch: "" };
  }

  // Match pattern: "MAY42 (TAN_PHU)" or "MAY42 (QUAN_7)"
  const match = displayName.match(/^(.+?)\s*\((.+)\)$/);
  if (match && match[1] && match[2]) {
    const name = match[1].trim();
    const branch = match[2].trim();

    // Ensure both name and branch are not empty
    if (name && branch) {
      return { name, branch };
    }
  }

  // If no parentheses found or invalid format, treat as just machine name
  return {
    name: displayName.trim(),
    branch: "",
  };
}

/**
 * Get machine info from user data
 * @param userData - User data from localStorage
 * @returns Machine info object
 */
export function getMachineInfoFromUserData(userData: any): MachineInfo {
  // Use machineName from userData, not computerId
  const machineName = userData?.machineName || "";

  // Try to get branch from multiple sources
  let branch = userData?.branch || "";

  // Fallback: try to get branch from device object
  if (!branch && userData?.device?.branch) {
    branch = userData.device.branch;
  }

  // Fallback: try to get branch from cookie (if available in browser)
  if (!branch) {
    branch = getBranchFromCookie();
  }

  const result = {
    name: machineName,
    branch: branch,
    displayName: formatMachineDisplayName(machineName, branch),
  };

  return result;
}
