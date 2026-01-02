import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { getBranchFromCookie } from "@/lib/server-utils";
import { getCurrentTimeVNDB } from "@/lib/timezone-utils";

// GET: Get all income/expense transactions
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "staff") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const branch = await getBranchFromCookie();
    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Missing branch" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const branchParam = searchParams.get("branch");

    const queryBranch = branchParam || branch;

    let query = `
      SELECT 
        m.id, m.type, m.amount, m.reason, m.description, m.transactionDate, m.branch, m.createdAt,
        m.createdBy, s.fullName as createdByName, s.userName as createdByUserName
      FROM ManagerIncomeExpense m
      LEFT JOIN Staff s ON m.createdBy = s.id AND s.branch = ?
      WHERE m.branch = ?
    `;

    const params: any[] = [queryBranch, queryBranch];

    if (month && year) {
      query += ` AND YEAR(m.transactionDate) = ? AND MONTH(m.transactionDate) = ?`;
      params.push(parseInt(year), parseInt(month));
    }

    query += ` ORDER BY m.transactionDate DESC, m.createdAt DESC LIMIT 100`;

    try {
      const transactions = (await db.$queryRawUnsafe(
        query,
        ...params,
      )) as any[];

      return NextResponse.json({
        success: true,
        data: transactions || [],
      });
    } catch (error: any) {
      if (error.message?.includes("doesn't exist")) {
        return NextResponse.json({
          success: true,
          data: [],
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error fetching income/expense:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch transactions",
      },
      { status: 500 },
    );
  }
}

// POST: Create new income/expense transaction
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "staff") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const branch = await getBranchFromCookie();
    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Missing branch" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const {
      type,
      amount,
      reason,
      description,
      transactionDate,
      branch: bodyBranch,
    } = body;

    if (!type || !amount || !reason || !transactionDate) {
      return NextResponse.json(
        {
          success: false,
          error: "type, amount, reason, and transactionDate are required",
        },
        { status: 400 },
      );
    }

    if (type !== "INCOME" && type !== "EXPENSE") {
      return NextResponse.json(
        { success: false, error: "type must be INCOME or EXPENSE" },
        { status: 400 },
      );
    }

    const transactionBranch = bodyBranch || branch;
    const nowVN = getCurrentTimeVNDB();
    const transactionDateValue = new Date(transactionDate);
    const createdBy = payload.userId || payload.id;

    if (!createdBy) {
      return NextResponse.json(
        { success: false, error: "Unable to identify creator" },
        { status: 400 },
      );
    }

    try {
      await db.$executeRawUnsafe(
        `INSERT INTO ManagerIncomeExpense (type, amount, reason, description, transactionDate, branch, createdBy, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        type,
        parseFloat(amount),
        reason,
        description || null,
        transactionDateValue,
        transactionBranch,
        createdBy,
        nowVN,
      );

      return NextResponse.json({
        success: true,
        message: "Giao dịch đã được thêm thành công",
      });
    } catch (error: any) {
      if (error.message?.includes("doesn't exist")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Table ManagerIncomeExpense does not exist. Please create it first.",
          },
          { status: 500 },
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error creating income/expense:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create transaction",
      },
      { status: 500 },
    );
  }
}
