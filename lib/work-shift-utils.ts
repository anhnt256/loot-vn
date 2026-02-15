import dayjs from "@/lib/dayjs";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

export interface WorkShift {
  id: number;
  name: string; // CASANG, CACHIEU, CATOI (match Fnet Actor)
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
 * Map WorkShift.name (CASANG, CACHIEU, CATOI) to Shift enum (SANG, CHIEU, TOI)
 */
export function mapWorkShiftNameToShiftEnum(workShiftName: string): string {
  const nameUpper = workShiftName.toUpperCase();
  if (nameUpper.includes("SANG")) return "SANG";
  if (nameUpper.includes("CHIEU")) return "CHIEU";
  if (nameUpper.includes("TOI")) return "TOI";
  return workShiftName; // Fallback
}

/**
 * Map Shift enum (SANG, CHIEU, TOI) to WorkShift.name (CASANG, CACHIEU, CATOI)
 */
export function mapShiftEnumToWorkShiftName(shiftEnum: string): string {
  const shiftUpper = shiftEnum.toUpperCase();
  if (shiftUpper === "SANG") return "CASANG";
  if (shiftUpper === "CHIEU") return "CACHIEU";
  if (shiftUpper === "TOI") return "CATOI";
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

/**
 * Check if a given date+time falls within any work shift.
 * recordDate: YYYY-MM-DD string or Date; recordTime: HH:mm or HH:mm:ss string or minutes-since-midnight.
 */
export function isTimeInAnyShift(
  workShifts: WorkShift[],
  recordDate: string | Date,
  recordTime: string | { hours: number; minutes: number },
): boolean {
  if (!workShifts || workShifts.length === 0) return false;

  const d = dayjs(recordDate).tz("Asia/Ho_Chi_Minh");
  let currentMinutes: number;
  if (typeof recordTime === "string") {
    const parts = recordTime.trim().split(/[:\s]/).map((p) => parseInt(p, 10) || 0);
    const [h = 0, m = 0] = parts;
    currentMinutes = h * 60 + m;
  } else {
    currentMinutes = recordTime.hours * 60 + recordTime.minutes;
  }

  for (const shift of workShifts) {
    const [startHour, startMin] = shift.startTime.split(":").map(Number);
    const [endHour, endMin] = shift.endTime.split(":").map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (shift.isOvernight) {
      if (currentMinutes >= startTime || currentMinutes <= endTime) return true;
    } else {
      if (currentMinutes >= startTime && currentMinutes <= endTime) return true;
    }
  }
  return false;
}

export type ShiftDateTimeRange = {
  fromDate: string; // ISO format: YYYY-MM-DDTHH:mm:ss
  toDate: string;   // ISO format: YYYY-MM-DDTHH:mm:ss
};

/**
 * Get fromDate and toDate for a shift on a given date.
 * Handles overnight shifts correctly.
 * @param shift WorkShift object
 * @param date Optional date string (YYYY-MM-DD), defaults to today
 * @returns { fromDate, toDate } in ISO format without timezone
 */
export function getShiftDateTimeRange(
  shift: WorkShift,
  date?: string
): ShiftDateTimeRange {
  const baseDate = date
    ? dayjs(date).tz("Asia/Ho_Chi_Minh")
    : dayjs().tz("Asia/Ho_Chi_Minh");

  const [startHour, startMin, startSec = 0] = shift.startTime.split(":").map(Number);
  const [endHour, endMin, endSec = 0] = shift.endTime.split(":").map(Number);

  // fromDate is always on the base date
  const fromDate = baseDate
    .hour(startHour)
    .minute(startMin)
    .second(startSec)
    .format("YYYY-MM-DDTHH:mm:ss");

  // toDate: if overnight, add 1 day; endTime should be -1 second for range (e.g., 06:59:59)
  let toDateTime = baseDate.hour(endHour).minute(endMin).second(endSec);
  
  if (shift.isOvernight) {
    toDateTime = toDateTime.add(1, "day");
  }
  
  // If endTime is like 07:00:00, convert to 06:59:59 for API range query
  // Subtract 1 second to get the last moment of the shift
  if (endSec === 0 && endMin === 0) {
    toDateTime = toDateTime.subtract(1, "second");
  }

  const toDate = toDateTime.format("YYYY-MM-DDTHH:mm:ss");

  return { fromDate, toDate };
}
