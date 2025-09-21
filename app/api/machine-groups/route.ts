import { NextRequest, NextResponse } from "next/server";
import { getFnetDB } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const branch = cookieStore.get("branch")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Missing branch information" },
        { status: 400 },
      );
    }

    // Query machine groups from Fnet DB
    const machineGroups = await getMachineGroups();

    return NextResponse.json({
      success: true,
      data: machineGroups,
    });
  } catch (error) {
    console.error("Error in GET /api/machine-groups:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function getMachineGroups() {
  try {
    const fnetDB = await getFnetDB();

    const query = `
      SELECT 
        mg.MachineGroupId,
        mg.MachineGroupName,
        mg.PriceDefault,
        mg.Active,
        mg.Description,
        COUNT(CASE WHEN cs.NetInfo IS NOT NULL THEN u.UserId END) as machineCount
      FROM machinegrouptb mg
      LEFT JOIN usertb u ON mg.MachineGroupId = u.MachineGroupId
      LEFT JOIN clientsystb cs ON u.UserName = cs.PCName
      GROUP BY mg.MachineGroupId, mg.MachineGroupName, mg.PriceDefault, mg.Active, mg.Description
      ORDER BY mg.MachineGroupId
    `;

    const result = await fnetDB.$queryRawUnsafe(query);

    // Convert BigInt to string to avoid serialization error
    const processedResult = (result as any[]).map((row: any) => ({
      MachineGroupId: Number(row.MachineGroupId),
      MachineGroupName: row.MachineGroupName,
      PriceDefault: Number(row.PriceDefault),
      Active: Number(row.Active),
      Description: row.Description,
      machineCount: Number(row.machineCount),
    }));

    return processedResult;
  } catch (error) {
    console.error("Error in getMachineGroups:", error);
    throw error;
  }
}
