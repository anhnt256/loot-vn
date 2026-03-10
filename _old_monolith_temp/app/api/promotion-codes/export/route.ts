import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const branch = cookieStore.get("branch")?.value;

    if (!branch) {
      return NextResponse.json(
        { error: "Branch cookie is required" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const isUsed = searchParams.get("isUsed");

    // Build where conditions
    const whereConditions: any = {
      branch: branch,
    };

    if (eventId) {
      whereConditions.eventId = eventId;
    }

    if (isUsed !== null) {
      whereConditions.isUsed = isUsed === "true";
    }

    // Get codes using Prisma ORM
    const codes = await db.promotionCode.findMany({
      where: whereConditions,
      orderBy: { createdAt: "desc" },
    });

    // Convert to CSV format
    const csvHeaders = [
      "ID",
      "Name",
      "Code",
      "Value",
      "Branch",
      "Is Used",
      "Event ID",
      "Reward Type",
      "Reward Value",
      "Expiration Date",
      "Created At",
      "Updated At",
    ];

    const csvRows = codes.map((code) => [
      code.id,
      code.name || "",
      code.code || "",
      code.value || "",
      code.branch || "",
      code.isUsed ? "Yes" : "No",
      code.eventId || "",
      code.rewardType || "",
      code.rewardValue || "",
      code.expirationDate ? new Date(code.expirationDate).toISOString() : "",
      code.createdAt ? new Date(code.createdAt).toISOString() : "",
      code.updatedAt ? new Date(code.updatedAt).toISOString() : "",
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="promotion-codes-${branch}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("[PROMOTION_CODES_EXPORT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
