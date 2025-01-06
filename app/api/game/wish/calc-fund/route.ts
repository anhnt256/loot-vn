import { NextResponse } from "next/server";

export async function GET() {
  const test = new Date().getTime();

  try {
    return NextResponse.json(test);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
