import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response): Promise<any> {
  try {
    const macAddress = getCookie("macAddress", { req, res });
    // const macAddress = "A4-0C-66-0B-E6-DE";

    if (macAddress) {
      const result = await db.computer.findFirst({
        where: {
          localIp: macAddress.replaceAll(":", "-").toUpperCase(),
        },
        select: {
          name: true,
          branch: true,
        },
      });

      const response = NextResponse.json({
        status: "success",
        machineName: result?.name,
      });

      // @ts-ignore
      response.cookies.set({
        name: "branch",
        value: result?.branch,
        maxAge: 86400,
      });
      return response;
    }
  } catch (error) {
    return NextResponse.json({
      status: error,
    });
  }
}
