import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export function getStartOfDayVNISO(): string {
  return dayjs().tz('Asia/Ho_Chi_Minh').startOf('day').toISOString();
}

export function getCurrentTimeVNISO(): string {
  return dayjs().tz('Asia/Ho_Chi_Minh').toISOString();
}

export function getStartOfWeekVNISO(): string {
  return dayjs().tz('Asia/Ho_Chi_Minh').startOf('week').add(1, 'day').toISOString(); // Assuming week starts on Monday
}

export function getEndOfWeekVNISO(): string {
  return dayjs().tz('Asia/Ho_Chi_Minh').endOf('week').add(1, 'day').toISOString();
}

export function getCurrentDayOfWeekVN(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayjs().tz('Asia/Ho_Chi_Minh').day()];
}

export function convertBigIntToString(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (obj && typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      if (typeof obj[key] === "bigint") {
        newObj[key] = obj[key].toString();
      } else if (typeof obj[key] === "object") {
        newObj[key] = convertBigIntToString(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }
  return obj;
}

export function convertBigIntToNumber(value: any): number {
  if (typeof value === "bigint") return Number(value);
  if (value === null || value === undefined) return 0;
  return Number(value);
}

export function safeDateToString(dateValue: any): string | null {
  if (!dateValue) return null;
  try {
    if (typeof dateValue === "string" && dateValue.includes("T")) return dateValue;
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch (error) {
    console.error("Error converting date:", error);
    return null;
  }
}

export function createTimeoutPromise<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

export async function executeQueryWithTimeout<T>(
  queryFn: () => Promise<T>,
  timeoutMs = 8000,
  retries = 1
): Promise<T | null> {
  try {
    return await createTimeoutPromise(queryFn(), timeoutMs);
  } catch (error) {
    if (retries > 0) {
      try {
        return await createTimeoutPromise(queryFn(), timeoutMs);
      } catch (retryError) {
        return null;
      }
    }
    return null;
  }
}

export function combineDateTime(dateVal: string | Date, timeVal: string | Date) {
  const dateStr = typeof dateVal === "string" ? dateVal : dateVal.toISOString();
  const timeStr = typeof timeVal === "string" ? timeVal : timeVal.toISOString();
  const a = dateStr.split("T")[0];
  let b = timeStr;
  if (timeStr.includes("T")) b = timeStr.split("T")[1].replace("Z", "");
  return dayjs(`${a}T${b}`).tz("Asia/Ho_Chi_Minh");
}

export function isUserUsingCombo(combos: any[], userId?: number, isDebug?: boolean): boolean {
  if (!combos || combos.length === 0) return false;
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  for (const combo of combos) {
    const comboStart = combineDateTime(combo.FromDate, combo.FromTime);
    const comboEnd = combineDateTime(combo.ToDate, combo.ToTime);
    if (now.isSameOrAfter(comboStart) && (now.isBefore(comboEnd) || now.isSame(comboEnd))) {
      return true;
    }
  }
  return false;
}

export function calculateCheckInMinutes(sessions: any[], combos: any[], userId?: number, isDebug?: boolean): number {
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const todayStart = now.startOf("day");
  const todayDate = now.format("YYYY-MM-DD");

  const hasActiveSessionToday = sessions.some((s) => {
    if (!s.EnterDate || !s.EnterTime) return false;
    const enterDate = typeof s.EnterDate === "string" ? s.EnterDate : dayjs(s.EnterDate).format("YYYY-MM-DD");
    const endDate = s.EndDate ? typeof s.EndDate === "string" ? s.EndDate : dayjs(s.EndDate).format("YYYY-MM-DD") : todayDate;
    return enterDate === todayDate || endDate === todayDate;
  });

  if (!hasActiveSessionToday) return 0;

  const comboRanges: Array<{ start: dayjs.Dayjs; end: dayjs.Dayjs }> = [];
  for (const combo of combos) {
    const comboStart = combineDateTime(combo.FromDate, combo.FromTime);
    const comboEnd = combineDateTime(combo.ToDate, combo.ToTime);
    const comboStartInToday = comboStart.isBefore(todayStart) ? todayStart : comboStart;
    const comboEndInToday = comboEnd.isAfter(now) ? now : comboEnd;
    if (comboEndInToday.isAfter(comboStartInToday) && comboStartInToday.isBefore(now)) {
      comboRanges.push({ start: comboStartInToday, end: comboEndInToday });
    }
  }

  comboRanges.sort((a, b) => a.start.diff(b.start));
  const mergedComboRanges: Array<{ start: dayjs.Dayjs; end: dayjs.Dayjs }> = [];
  for (const comboRange of comboRanges) {
    if (mergedComboRanges.length === 0) mergedComboRanges.push({ ...comboRange });
    else {
      const lastRange = mergedComboRanges[mergedComboRanges.length - 1];
      if (comboRange.start.isBefore(lastRange.end) || comboRange.start.isSame(lastRange.end)) {
        lastRange.end = comboRange.end.isAfter(lastRange.end) ? comboRange.end : lastRange.end;
      } else mergedComboRanges.push({ ...comboRange });
    }
  }

  let totalMinutes = 0;
  for (const session of sessions) {
    if (!session.EnterDate || !session.EnterTime) continue;
    const enterDate = typeof session.EnterDate === "string" ? session.EnterDate : dayjs(session.EnterDate).format("YYYY-MM-DD");
    const endDate = session.EndDate ? typeof session.EndDate === "string" ? session.EndDate : dayjs(session.EndDate).format("YYYY-MM-DD") : todayDate;
    
    if (enterDate !== todayDate && endDate !== todayDate) continue;

    let sessionMinutes = 0;
    if (enterDate === todayDate) {
      sessionMinutes = session.TimeUsed ?? 0;
    } else if (enterDate !== todayDate && endDate === todayDate) {
      let endTime: dayjs.Dayjs;
      if (session.EndTime) {
        const endTimeStr = typeof session.EndTime === "string" ? session.EndTime : dayjs(session.EndTime).format("HH:mm:ss");
        endTime = dayjs(`${todayDate}T${endTimeStr}`).tz("Asia/Ho_Chi_Minh", true);
      } else {
        endTime = now;
      }
      sessionMinutes = endTime.diff(todayStart, "minute");
    }

    if (sessionMinutes <= 0) continue;

    const enter = combineDateTime(session.EnterDate, session.EnterTime);
    const sessionStart = enter.isBefore(todayStart) ? todayStart : enter;

    let sessionEnd: dayjs.Dayjs;
    if (session.EndDate && session.EndTime) sessionEnd = combineDateTime(session.EndDate, session.EndTime);
    else sessionEnd = now;

    if (sessionEnd.isAfter(now)) sessionEnd = now;

    let remainingMinutes = sessionMinutes;
    for (const comboRange of mergedComboRanges) {
      const overlapStart = sessionStart.isAfter(comboRange.start) ? sessionStart : comboRange.start;
      const overlapEnd = sessionEnd.isBefore(comboRange.end) ? sessionEnd : comboRange.end;
      if (overlapEnd.isAfter(overlapStart)) {
        remainingMinutes -= overlapEnd.diff(overlapStart, "minute");
      }
    }

    if (remainingMinutes > 0) totalMinutes += remainingMinutes;
  }

  return Math.min(Math.max(0, totalMinutes), 1440);
}

export function parseBoolean(val: any): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  if (typeof val === 'string') return val !== '0' && val.toLowerCase() !== 'false' && val !== '';
  if (Buffer.isBuffer(val)) return val[0] !== 0;
  return Boolean(val);
}
