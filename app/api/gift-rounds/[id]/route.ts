import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const updateGiftRoundSchema = z.object({
  amount: z.number().min(1).optional(),
  reason: z.string().min(1).optional(),
  expiredAt: z.string().optional().nullable(),
  isUsed: z.boolean().optional(),
});

// GET /api/gift-rounds/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const giftRound = await db.giftRound.findUnique({
      where: { id },
    });

    if (!giftRound) {
      return NextResponse.json(
        { error: "GiftRound not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(giftRound);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PATCH /api/gift-rounds/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const json = await request.json();
    const body = updateGiftRoundSchema.parse(json);

    const giftRound = await db.giftRound.update({
      where: { id },
      data: {
        ...body,
        expiredAt: body.expiredAt ? new Date(body.expiredAt) : null,
      },
    });

    return NextResponse.json(giftRound);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE /api/gift-rounds/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await db.giftRound.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
