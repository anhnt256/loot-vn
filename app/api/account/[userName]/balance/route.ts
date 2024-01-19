import { NextResponse } from "next/server";

import apiClient from "@/lib/apiClient";
import { getCookie } from "cookies-next";

export async function GET(
  req: Request,
  { params }: { params: { userName: string } },
) {
  const cookie = getCookie("branch", { req });

  try {
    const result = await apiClient({
      method: "get",
      url: `/account/${params.userName}/balance-history/?format=json`,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
    });

    return NextResponse.json(result.data);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
