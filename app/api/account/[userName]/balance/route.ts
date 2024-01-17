import { NextResponse } from "next/server";

import apiClient from "@/lib/apiClient";

export async function GET(
  req: Request,
  { params }: { params: { userName: string } },
) {
  try {
    const result = await apiClient({
      method: "get",
      url: `/account/${params.userName}/balance-history/?format=json`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(result.data);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
