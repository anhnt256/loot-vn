import { db, getFnetDBByBranch } from "@/lib/db";
import { mapWorkShiftNameToShiftEnum } from "@/lib/work-shift-utils";

// Prisma ShiftRevenueType: MORNING | AFTERNOON | EVENING
function workShiftNameToShiftRevenueType(name: string): "MORNING" | "AFTERNOON" | "EVENING" {
  const s = mapWorkShiftNameToShiftEnum(name).toUpperCase();
  if (s === "SANG") return "MORNING";
  if (s === "CHIEU") return "AFTERNOON";
  if (s === "TOI") return "EVENING";
  return "MORNING"; // fallback
}

export type FnetShiftVerifyRow = {
  workShiftId: number;
  workShiftName: string;
  FnetStaffId: number;
  fnetSum: number; // SUM(Amount) from paymenttb where StaffId = FnetStaffId and ServeDate = date
  shift: "MORNING" | "AFTERNOON" | "EVENING";
  gamingRevenue: number; // from WorkShiftRevenueReport
  diff: number; // fnetSum - gamingRevenue
};

export type FnetShiftVerifyResult = {
  success: boolean;
  error?: string;
  serveDate?: string; // YYYY-MM-DD, maps to ServeDate
  branch?: string;
  rows?: FnetShiftVerifyRow[];
};

type WorkShiftRow = { id: number; name: string; FnetStaffId: number | null };
type RevenueRow = { shift: string; gamingRevenue: unknown };

/**
 * Verify Fnet paymenttb data vs WorkShiftRevenueReport.gamingRevenue.
 * - Gets WorkShift list (FnetStaffId) for branch.
 * - For each shift: SUM(Amount) from fnet.paymenttb where StaffId = FnetStaffId and ServeDate = serveDate.
 * - Maps to WorkShiftRevenueReport.gamingRevenue by shift (SANG->MORNING, CHIEU->AFTERNOON, TOI->EVENING).
 */
export async function verifyFnetShifts(branch: string, serveDate: string): Promise<FnetShiftVerifyResult> {
  const workShiftRows = (await db.$queryRawUnsafe(
    "SELECT id, name, FnetStaffId FROM WorkShift WHERE branch = ? ORDER BY startTime, id",
    branch
  )) as WorkShiftRow[];

  const revenueRows = (await db.$queryRawUnsafe(
    "SELECT shift, gamingRevenue FROM WorkShiftRevenueReport WHERE branch = ? AND reportDate = ?",
    branch,
    serveDate
  )) as RevenueRow[];

  const revenueByShift = new Map<string, number>();
  for (const r of revenueRows) {
    const rev = r.gamingRevenue != null ? Number(r.gamingRevenue) : 0;
    revenueByShift.set(r.shift, rev);
  }

  const fnetDB = getFnetDBByBranch(branch);
  const rows: FnetShiftVerifyRow[] = [];

  for (const ws of workShiftRows) {
    if (ws.FnetStaffId == null) continue;

    const sumResult = (await fnetDB.$queryRawUnsafe(
      "SELECT COALESCE(SUM(Amount), 0) AS total FROM fnet.paymenttb WHERE StaffId = ? AND ServeDate = ?",
      Number(ws.FnetStaffId),
      serveDate
    )) as { total: unknown }[];

    const fnetSum = sumResult[0]?.total != null ? Number(sumResult[0].total) : 0;
    const shift = workShiftNameToShiftRevenueType(ws.name);
    const gamingRevenue = revenueByShift.get(shift) ?? 0;
    rows.push({
      workShiftId: ws.id,
      workShiftName: ws.name,
      FnetStaffId: Number(ws.FnetStaffId),
      fnetSum,
      shift,
      gamingRevenue,
      diff: fnetSum - gamingRevenue,
    });
  }

  return {
    success: true,
    serveDate,
    branch,
    rows,
  };
}
