import dayjs from "@/lib/dayjs";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

export interface WorkShift {
  id: number;
  name: string; // CA_SANG, CA_CHIEU, CA_TOI
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  isOvernight: boolean;
  branch: string;
  FnetStaffId?: number | null;
  FfoodStaffId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Map WorkShift.name (CA_SANG, CA_CHIEU, CA_TOI) to Shift enum (SANG, CHIEU, TOI)
 */
export function mapWorkShiftNameToShiftEnum(workShiftName: string): string {
  const nameUpper = workShiftName.toUpperCase();
  if (nameUpper.includes("SANG")) return "SANG";
  if (nameUpper.includes("CHIEU")) return "CHIEU";
  if (nameUpper.includes("TOI")) return "TOI";
  return workShiftName; // Fallback
}

/**
 * Map Shift enum (SANG, CHIEU, TOI) to WorkShift.name (CA_SANG, CA_CHIEU, CA_TOI)
 */
export function mapShiftEnumToWorkShiftName(shiftEnum: string): string {
  const shiftUpper = shiftEnum.toUpperCase();
  if (shiftUpper === "SANG") return "CA_SANG";
  if (shiftUpper === "CHIEU") return "CA_CHIEU";
  if (shiftUpper === "TOI") return "CA_TOI";
  return shiftEnum; // Fallback
}

/**
 * Get current shift based on current time and work shifts
 * Returns the WorkShift that matches the current time
 */
export function getCurrentShift(workShifts: WorkShift[]): WorkShift | null {
  if (!workShifts || workShifts.length === 0) {
    return null;
  }

  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const currentHour = now.hour();
  const currentMinute = now.minute();
  const currentTime = currentHour * 60 + currentMinute; // Convert to minutes

  for (const shift of workShifts) {
    const [startHour, startMin, startSec] = shift.startTime
      .split(":")
      .map(Number);
    const [endHour, endMin, endSec] = shift.endTime.split(":").map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (shift.isOvernight) {
      // Overnight shift: e.g., 22:00 -> 06:00
      // Current time is in shift if: currentTime >= startTime OR currentTime <= endTime
      if (currentTime >= startTime || currentTime <= endTime) {
        return shift;
      }
    } else {
      // Normal shift: e.g., 06:00 -> 14:00
      if (currentTime >= startTime && currentTime <= endTime) {
        return shift;
      }
    }
  }

  // If no shift matches, return the first shift as fallback
  return workShifts[0] || null;
}

/**
 * Get shift by name from work shifts array
 */
export function getShiftByName(
  workShifts: WorkShift[],
  name: string,
): WorkShift | null {
  if (!workShifts || workShifts.length === 0) {
    return null;
  }

  return workShifts.find((shift) => shift.name === name) || null;
}

/**
 * Get shift by Shift enum (SANG, CHIEU, TOI) from work shifts array
 */
export function getShiftByEnum(
  workShifts: WorkShift[],
  shiftEnum: string,
): WorkShift | null {
  if (!workShifts || workShifts.length === 0) {
    return null;
  }

  const workShiftName = mapShiftEnumToWorkShiftName(shiftEnum);
  return getShiftByName(workShifts, workShiftName);
}
