import dayjs from "@/lib/dayjs";
import { db } from "@/lib/db";

const POS_API_BASE = "https://pos-api.ffood.com.vn/api/v1";

export type FfoodShiftPayment = {
  paymentMethod: string;
  quantity?: number;
  total: number;
  tip?: number;
  refunded?: number;
};

export type FfoodShiftItem = {
  id: string;
  checkInTime: string;
  checkOutTime?: string;
  employee?: { id: string; firstname?: string; lastname?: string };
  payments?: FfoodShiftPayment[];
  grossTotal?: number;
  cashHandover?: number;
  errorOrders?: number;
  [k: string]: unknown;
};

/**
 * Report date = date user views (e.g. 2026-02-01).
 * API date param = report date - 1 day at 17:00 UTC (e.g. 2026-01-31T17:00:00.000Z).
 */
export function getShiftApiDateParam(reportDate: string): string {
  const d = dayjs.utc(reportDate).startOf("day").subtract(1, "day");
  return d
    .hour(17)
    .minute(0)
    .second(0)
    .millisecond(0)
    .toISOString()
    .replace(/\.\d{3}Z$/, ".000Z");
}

function sumFromPayments(
  payments: FfoodShiftPayment[] | undefined,
  filter: (p: FfoodShiftPayment) => boolean,
): number {
  if (!Array.isArray(payments)) return 0;
  return payments
    .filter(filter)
    .reduce((sum, p) => sum + (Number(p.total) || 0), 0);
}

/**
 * From a single shift item from API:
 * totalFood = cash + deduct
 * deduction = deduct only
 * actualFfood = cash only
 */
export function computePaymentTotals(
  payments: FfoodShiftPayment[] | undefined,
): {
  totalFood: number;
  deduction: number;
  actualFfood: number;
} {
  const cash = sumFromPayments(payments, (p) => p.paymentMethod === "cash");
  const deduct = sumFromPayments(payments, (p) => p.paymentMethod === "deduct");
  return {
    totalFood: cash + deduct,
    deduction: deduct,
    actualFfood: cash,
  };
}

export type VerifiedShiftRow = {
  ffoodShiftId: string;
  workShiftId: number;
  workShiftName: string;
  employeeId: string;
  employeeName?: string;
  checkInTime: string;
  checkOutTime?: string;
  totalFood: number;
  deduction: number;
  actualFfood: number;
  raw?: FfoodShiftItem;
};

export type FfoodShiftVerifyResult = {
  success: boolean;
  error?: string;
  reportDate?: string;
  apiDateParam?: string;
  shopId?: string;
  rawShifts?: FfoodShiftItem[];
  workShifts?: { id: number; name: string; ffood_id: string | null }[];
  verified?: VerifiedShiftRow[];
  unmatched?: FfoodShiftItem[];
};

type FfoodCredentialRow = {
  id: number;
  shop_id: string | null;
  token: string | null;
  expired: Date | null;
  branch: string;
};

/**
 * Fetch shift list from pos-api.ffood.com.vn for given branch and report date.
 * Uses FfoodCredential (token, shop_id) for the branch.
 */
export async function fetchFfoodShifts(
  branch: string,
  reportDate: string,
): Promise<{
  success: boolean;
  error?: string;
  data?: FfoodShiftItem[];
  apiDateParam?: string;
  shopId?: string;
}> {
  const credRows = (await db.$queryRawUnsafe(
    "SELECT id, shop_id, token, expired, branch FROM FfoodCredential WHERE branch = ? LIMIT 1",
    branch,
  )) as FfoodCredentialRow[];

  if (!credRows.length) {
    return { success: false, error: "FfoodCredential not found for branch" };
  }

  const cred = credRows[0];
  const token = cred.token?.trim();
  const shopId = cred.shop_id?.trim();

  if (!token) {
    return {
      success: false,
      error: "Ffood token not set for branch (login or refresh token first)",
    };
  }
  if (!shopId) {
    return {
      success: false,
      error: "Ffood shop_id not set in FfoodCredential",
    };
  }

  const apiDateParam = getShiftApiDateParam(reportDate);
  const url = `${POS_API_BASE}/shift?date=${encodeURIComponent(apiDateParam)}&shopId=${encodeURIComponent(shopId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    return {
      success: false,
      error: `FFood API error ${res.status}: ${text.slice(0, 500)}`,
      apiDateParam,
      shopId,
    };
  }

  const json = (await res.json()) as {
    data?: FfoodShiftItem[];
    isSuccess?: boolean;
    errors?: unknown;
  };
  const data = Array.isArray(json?.data) ? json.data : [];

  return { success: true, data, apiDateParam, shopId };
}

/**
 * Fetch FFood shifts for report date, match employee.id to WorkShift.ffood_id, compute payment totals.
 */
export async function verifyFfoodShifts(
  branch: string,
  reportDate: string,
): Promise<FfoodShiftVerifyResult> {
  const workShiftRows = (await db.$queryRawUnsafe(
    "SELECT id, name, ffood_id FROM WorkShift WHERE branch = ? ORDER BY startTime, id",
    branch,
  )) as { id: number; name: string; ffood_id: string | null }[];

  const workShiftsByFfoodId = new Map<string, { id: number; name: string }>();
  for (const ws of workShiftRows) {
    if (ws.ffood_id)
      workShiftsByFfoodId.set(ws.ffood_id.trim(), { id: ws.id, name: ws.name });
  }

  const fetchResult = await fetchFfoodShifts(branch, reportDate);
  if (!fetchResult.success) {
    return {
      success: false,
      error: fetchResult.error,
      reportDate,
      apiDateParam: fetchResult.apiDateParam,
      shopId: fetchResult.shopId,
      workShifts: workShiftRows.map((r) => ({
        id: r.id,
        name: r.name,
        ffood_id: r.ffood_id,
      })),
    };
  }

  const rawShifts = fetchResult.data ?? [];
  const verified: VerifiedShiftRow[] = [];
  const unmatched: FfoodShiftItem[] = [];

  for (const item of rawShifts) {
    const employeeId = item.employee?.id?.trim();
    if (!employeeId) {
      unmatched.push(item);
      continue;
    }
    const ws = workShiftsByFfoodId.get(employeeId);
    if (!ws) {
      unmatched.push(item);
      continue;
    }
    const { totalFood, deduction, actualFfood } = computePaymentTotals(
      item.payments,
    );
    verified.push({
      ffoodShiftId: item.id,
      workShiftId: ws.id,
      workShiftName: ws.name,
      employeeId,
      employeeName:
        [item.employee?.firstname, item.employee?.lastname]
          .filter(Boolean)
          .join(" ")
          .trim() || undefined,
      checkInTime: item.checkInTime ?? "",
      checkOutTime: item.checkOutTime,
      totalFood,
      deduction,
      actualFfood,
      raw: item,
    });
  }

  return {
    success: true,
    reportDate,
    apiDateParam: fetchResult.apiDateParam,
    shopId: fetchResult.shopId,
    rawShifts,
    workShifts: workShiftRows.map((r) => ({
      id: r.id,
      name: r.name,
      ffood_id: r.ffood_id,
    })),
    verified,
    unmatched,
  };
}
