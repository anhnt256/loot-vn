import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCookie } from "cookies-next";
import { getDebugMacAddress, logDebugInfo } from "@/lib/debug-utils";
import { getCurrentTimeVNISO } from "@/lib/timezone-utils";

export async function GET(req: Request, res: Response): Promise<any> {
  const originalMacAddress = getCookie("macAddress", { req, res });
  const macAddress = getDebugMacAddress(originalMacAddress);

  logDebugInfo("check-branch", { originalMacAddress, macAddress });

  try {
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

      console.log('----DEBUG----', getCurrentTimeVNISO())

      return response;
    }
  } catch (error) {
    return NextResponse.json({
      status: error,
    });
  }
}
