import { NextResponse } from "next/server";
import apiClient from "@/lib/apiClient";
import { getCookie } from "cookies-next";

export async function POST(req: Request, res: Response): Promise<any> {
  try {
    const cookie = getCookie("branch", { req, res });
    const body = await req.text();
    const result = await apiClient({
      method: "post",
      url: `/login/`,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      data: body,
    });
    return NextResponse.json(result.data);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
