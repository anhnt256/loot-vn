import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const tierId = parseInt(params.id);
    const { isActive } = await request.json();

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid isActive value" },
        { status: 400 },
      );
    }

    await db.$executeRaw`
      UPDATE BirthdayTier 
      SET isActive = ${isActive}, updatedAt = NOW()
      WHERE id = ${tierId}
    `;

    return NextResponse.json({
      success: true,
      data: {
        message: "Tier updated successfully",
      },
    });
  } catch (error) {
    console.error("Error updating birthday tier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update tier" },
      { status: 500 },
    );
  }
}
