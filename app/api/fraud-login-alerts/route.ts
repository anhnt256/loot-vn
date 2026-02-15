import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";
import { getFnetDB } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { isTimeInAnyShift } from "@/lib/work-shift-utils";
import type { WorkShift } from "@/lib/work-shift-utils";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";
import dayjs from "@/lib/dayjs";

const LOGIN_STATUS = "Đăng nhập";

async function checkAdminAccess(): Promise<{ isAdmin: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return { isAdmin: false, error: "Unauthorized" };
    const decoded = await verifyJWT(token);
    if (!decoded?.userId) return { isAdmin: false, error: "Invalid token" };
    const userId = parseInt(String(decoded.userId));
    const loginType = cookieStore.get("loginType")?.value;
    const role = decoded.role;
    if (userId === -99 || (role === "admin" && loginType === "username")) return { isAdmin: true };
    return { isAdmin: false, error: "Admin access required" };
  } catch {
    return { isAdmin: false, error: "Error checking admin access" };
  }
}

/** Actor from Fnet serverlogtb.Actor if present, else parse from Note */
function getActor(log: { Actor?: string | null; Note?: string | null }): string {
  if (log.Actor != null && String(log.Actor).trim()) return String(log.Actor).trim();
  const note = log.Note;
  if (!note || typeof note !== "string") return "Unknown";
  const parts = note.trim().split(/\s+/);
  if (parts.length >= 2) return parts[1];
  return note.trim() || "Unknown";
}

function isAdminLogin(log: { Actor?: string | null; Note?: string | null }): boolean {
  if (log.Actor != null && String(log.Actor).toUpperCase() === "ADMIN") return true;
  if (log.Note != null && String(log.Note).toUpperCase().includes("ADMIN")) return true;
  return false;
}

/** Format DB time to HH:mm:ss */
function formatTimeToHHmmss(t: Date | string | null): string {
  if (!t) return "00:00:00";
  const d = typeof t === "string" ? new Date("1970-01-01T" + t + "Z") : t;
  if (isNaN(d.getTime())) return "00:00:00";
  const h = d.getUTCHours?.() ?? d.getHours?.() ?? 0;
  const m = d.getUTCMinutes?.() ?? d.getMinutes?.() ?? 0;
  const s = d.getUTCSeconds?.() ?? d.getSeconds?.() ?? 0;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/** Format RecordDate to YYYY-MM-DD */
function formatRecordDate(d: Date | string | null): string {
  if (!d) return "";
  const x = typeof d === "string" ? d : (d as Date).toISOString?.()?.slice(0, 10) ?? "";
  return x.slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ success: false, error: adminCheck.error ?? "Admin required" }, { status: 403 });
    }
    const branch = await getBranchFromCookie();
    if (!branch) {
      return NextResponse.json({ success: false, error: "Branch is required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    let fromStr = searchParams.get("from");
    let toStr = searchParams.get("to");
    if (!fromStr || !toStr) {
      const nowVN = dayjs().utcOffset(7);
      toStr = nowVN.format("YYYY-MM-DD");
      fromStr = nowVN.subtract(1, "month").format("YYYY-MM-DD");
    }
    const fromDateTime = `${fromStr} 00:00:00`;
    const toDateTime = `${toStr} 23:59:59`;

    const fnet = await getFnetDB();
    const workShiftRows = (await db.$queryRawUnsafe(
      "SELECT id, name, startTime, endTime, isOvernight, branch FROM WorkShift WHERE branch = ? ORDER BY startTime, id",
      branch,
    )) as any[];

    const workShifts: WorkShift[] = workShiftRows.map((r) => ({
      id: r.id,
      name: r.name,
      startTime: formatTimeToHHmmss(r.startTime),
      endTime: formatTimeToHHmmss(r.endTime),
      isOvernight: !!r.isOvernight,
      branch: r.branch,
    }));

    // Fnet DB serverlogtb (branch = cookie -> getFnetDB() = FNet_TP or FNet_GV)
    const loginLogs = (await fnet.$queryRawUnsafe(
      `SELECT ServerLogId, Status, RecordDate, RecordTime, Period, Note, Actor 
       FROM serverlogtb 
       WHERE Status = ? 
       ORDER BY RecordDate DESC, RecordTime DESC 
       LIMIT 500`,
      LOGIN_STATUS,
    )) as any[];

    const existingAlerts = (await db.$queryRawUnsafe(
      "SELECT serverLogId, branch FROM FraudLoginAlert WHERE branch = ?",
      branch,
    )) as { serverLogId: number | null; branch: string }[];
    const existingSet = new Set(existingAlerts.map((a) => (a.serverLogId ?? -1).toString()));

    const nowStr = getCurrentTimeVNDB();
    for (const log of loginLogs) {
      const serverLogId = log.ServerLogId;
      const recordDate = formatRecordDate(log.RecordDate);
      const recordTimeStr = formatTimeToHHmmss(log.RecordTime);
      const actor = getActor(log);
      const inShift = isTimeInAnyShift(workShifts, recordDate, recordTimeStr);
      if (!inShift && !existingSet.has(String(serverLogId))) {
        const loginAt = recordDate + " " + recordTimeStr;
        await db.$executeRawUnsafe(
          `INSERT INTO FraudLoginAlert (branch, serverLogId, actor, loginAt, note, createdAt) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          branch,
          serverLogId,
          actor,
          loginAt,
          log.Note ?? null,
          nowStr,
        );
        existingSet.add(String(serverLogId));
      }
    }

    const fraudAlerts = (await db.$queryRawUnsafe(
      `SELECT id, branch, serverLogId, actor, loginAt, note, createdAt 
       FROM FraudLoginAlert 
       WHERE branch = ? AND loginAt >= ? AND loginAt <= ?
       ORDER BY loginAt DESC 
       LIMIT 200`,
      branch,
      fromDateTime,
      toDateTime,
    )) as any[];

    const adminLogins = loginLogs
      .filter((log) => isAdminLogin(log))
      .filter((log) => {
        const d = formatRecordDate(log.RecordDate);
        return d >= fromStr && d <= toStr;
      })
      .map((log) => ({
        serverLogId: log.ServerLogId,
        status: log.Status,
        recordDate: formatRecordDate(log.RecordDate),
        recordTime: formatTimeToHHmmss(log.RecordTime),
        note: log.Note,
        actor: getActor(log),
      }));

    return NextResponse.json({
      success: true,
      data: {
        fraudAlerts: fraudAlerts.map((a) => ({
          id: a.id,
          branch: a.branch,
          serverLogId: a.serverLogId,
          actor: a.actor,
          loginAt: a.loginAt,
          note: a.note,
          createdAt: a.createdAt,
        })),
        adminLogins,
        workShiftNames: workShifts.map((s) => s.name),
      },
    });
  } catch (error) {
    console.error("Error in fraud-login-alerts GET:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch fraud login alerts" },
      { status: 500 },
    );
  }
}
