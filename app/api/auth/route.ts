import { NextResponse } from "next/server";
import apiClient from "@/lib/apiClient";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const result = await apiClient({
      method: "post",
      url: `/login/`,
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
    });
    return NextResponse.json(result.data);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
