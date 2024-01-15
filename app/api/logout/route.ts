import apiClient from "@/lib/apiClient";
import { NextResponse } from "next/server";
import { getCookie } from "cookies-next";
import { ACCESS_TOKEN_KEY } from "@/constants/token.constant";

export async function POST(req: Request, res: Response): Promise<any> {
  try {
    const cookie = getCookie("branch", { req, res });
    const token = getCookie(ACCESS_TOKEN_KEY, { req, res });
    const result = await apiClient({
      method: "post",
      url: `/logout/`,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
        Token: token,
      },
    });
    return NextResponse.json(result.data);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
