import { getShiftDateTimeRange, WorkShift } from "@/lib/work-shift-utils";

const MOMO_LOGIN_URL = "https://business.momo.vn/api/authentication/login";
const MOMO_STATISTICS_URL =
  "https://business.momo.vn/api/transaction/v2/transactions/statistics";

export type MomoCredential = {
  username: string;
  password: string;
};

export type MomoLoginResult = { token: string; expired: Date } | null;

type MomoLoginResponse = {
  status: number;
  message: string;
  data?: {
    username: string;
    token: string;
    isResetPassword: number;
    expiresIn: number; // milliseconds
  };
};

export type MomoStatisticsParams = {
  token: string;
  merchantId: string;
  storeId: string;
  fromDate: string; // ISO format: 2026-02-01T00:00:00
  toDate: string; // ISO format: 2026-02-01T06:59:59
};

export type MomoStatisticsParamsWithShift = {
  token: string;
  merchantId: string;
  storeId: string;
  shift: WorkShift;
  date?: string; // YYYY-MM-DD, defaults to today
};

type MomoStatisticsResponse = {
  status: number;
  message: string;
  data?: {
    totalSuccessAmount: number;
    totalFailAmount: number;
    totalTrans: number;
    totalSuccessTrans: number;
    totalPendingAmount: number;
    totalPendingTrans: number;
    totalRefundAmount: number;
    totalRefundTrans: number;
  };
  yesterdayStats?: {
    totalSuccessAmount: number;
    totalFailAmount: number;
    totalTrans: number;
    totalSuccessTrans: number;
  };
};

export type MomoStatisticsResult = {
  totalSuccessAmount: number;
  totalFailAmount: number;
  totalTrans: number;
  totalSuccessTrans: number;
} | null;

/**
 * Login to Momo merchant portal via API.
 * POST https://business.momo.vn/api/authentication/login
 */
export async function loginAndGetMomoToken(
  cred: MomoCredential,
): Promise<MomoLoginResult> {
  try {
    const response = await fetch(MOMO_LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: cred.username,
        password: cred.password,
      }),
    });

    if (!response.ok) {
      console.error(
        "[MomoLogin] HTTP error:",
        response.status,
        response.statusText,
      );
      return null;
    }

    const data: MomoLoginResponse = await response.json();

    if (data.status !== 0 || !data.data?.token) {
      console.error("[MomoLogin] API error:", data.message);
      return null;
    }

    // expiresIn is in milliseconds (e.g., 10800000 = 3 hours)
    const expired = new Date(Date.now() + data.data.expiresIn);

    console.log("[MomoLogin] Login success for:", data.data.username);
    return {
      token: data.data.token,
      expired,
    };
  } catch (err) {
    console.error("[MomoLogin] error:", err);
    return null;
  }
}

/**
 * Get Momo transaction statistics for a given time range.
 * GET https://business.momo.vn/api/transaction/v2/transactions/statistics
 */
export async function getMomoTransactionStatistics(
  params: MomoStatisticsParams,
): Promise<MomoStatisticsResult> {
  try {
    const { token, merchantId, storeId, fromDate, toDate } = params;

    const searchParams = new URLSearchParams({
      pageSize: "20",
      pageNumber: "0",
      fromDate,
      toDate,
      dateId: "CUSTOM",
      status: "ALL",
      storeId,
      reportId: "0",
      merchantId,
      language: "vi",
    });

    const requestId = `M4B_${merchantId}_${Date.now()}`;

    const response = await fetch(`${MOMO_STATISTICS_URL}?${searchParams}`, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        merchantid: merchantId,
        "x-api-request-id": requestId,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(
        "[MomoStatistics] HTTP error:",
        response.status,
        response.statusText,
        errorText,
      );
      return null;
    }

    const data: MomoStatisticsResponse = await response.json();

    if (data.status !== 0 || !data.data) {
      console.error("[MomoStatistics] API error:", data.message);
      return null;
    }

    console.log("[MomoStatistics] Success:", {
      totalSuccessAmount: data.data.totalSuccessAmount,
      totalTrans: data.data.totalTrans,
    });

    return {
      totalSuccessAmount: data.data.totalSuccessAmount,
      totalFailAmount: data.data.totalFailAmount,
      totalTrans: data.data.totalTrans,
      totalSuccessTrans: data.data.totalSuccessTrans,
    };
  } catch (err) {
    console.error("[MomoStatistics] error:", err);
    return null;
  }
}

/**
 * Get Momo transaction statistics for a shift on a given date.
 * Automatically calculates fromDate and toDate based on shift times.
 */
export async function getMomoStatisticsByShift(
  params: MomoStatisticsParamsWithShift,
): Promise<MomoStatisticsResult> {
  const { token, merchantId, storeId, shift, date } = params;
  const { fromDate, toDate } = getShiftDateTimeRange(shift, date);

  console.log(
    "[MomoStatistics] Shift:",
    shift.name,
    "Range:",
    fromDate,
    "->",
    toDate,
  );

  return getMomoTransactionStatistics({
    token,
    merchantId,
    storeId,
    fromDate,
    toDate,
  });
}

export type FetchMomoReportInBackgroundParams = {
  momoUrl: string;
  username: string;
  password: string;
};

/**
 * Start Momo report fetch in background. Returns immediately.
 * Runs login (token refresh) in background; momoUrl is for future use.
 */
export function fetchMomoReportInBackground(
  params: FetchMomoReportInBackgroundParams,
): void {
  const { username, password } = params;
  void loginAndGetMomoToken({ username, password }).then((result) => {
    if (result) {
      console.log("[MomoReport] Background token refresh OK");
    }
  });
}
