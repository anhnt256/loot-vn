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

    const { searchParams } = new URL(request.url);
    const machineGroupId = searchParams.get("machineGroupId");

    // Query machine details by group from Fnet DB
    const machineDetails = await getMachineDetailsByGroup(
      branch,
      machineGroupId,
    );

    return NextResponse.json({
      success: true,
      data: machineDetails,
    });
  } catch (error) {
    console.error("Error in GET /api/machine-details/by-group:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function getMachineDetailsByGroup(
  branch: string,
  machineGroupId?: string | null,
) {
  try {
    const fnetDB = await getFnetDB();

    let query = `
      SELECT 
        u.UserName as machineName,
        cs.NetInfo as netInfo,
        pm.Price as price,
        mg.MachineGroupName as machineGroupName,
        mg.MachineGroupId as machineGroupId,
        mg.PriceDefault as priceDefault,
        mg.Description as description
      FROM usertb u
      LEFT JOIN machinegrouptb mg ON u.MachineGroupId = mg.MachineGroupId
      LEFT JOIN pricemachinetb pm ON mg.MachineGroupId = pm.MachineGroupId AND pm.PriceId = 1
      LEFT JOIN clientsystb cs ON u.UserName = cs.PCName
      WHERE pm.Price > 0 AND cs.NetInfo IS NOT NULL
    `;

    const params: any[] = [];

    if (machineGroupId) {
      query += ` AND mg.MachineGroupId = ?`;
      params.push(machineGroupId);
    }

    query += ` ORDER BY mg.MachineGroupId, u.UserName`;

    const result = await fnetDB.$queryRawUnsafe(query, ...params);

    // Parse NetInfo JSON and extract macAddress, convert BigInt to Number
    const processedData = (result as any[]).map((row: any) => {
      let netInfo = null;
      let macAddress = null;

      try {
        if (row.netInfo) {
          netInfo = JSON.parse(row.netInfo);
          // Extract macAddress from NetInfo if available
          macAddress = netInfo.macAddress || null;
        }
      } catch (error) {
        console.error("Error parsing NetInfo:", error);
      }

      return {
        machineName: row.machineName,
        macAddress: macAddress,
        price: Number(row.price),
        netInfo: netInfo,
        machineGroupName: row.machineGroupName,
        machineGroupId: Number(row.machineGroupId),
        priceDefault: Number(row.priceDefault),
        description: row.description,
      };
    });

    return processedData;
  } catch (error) {
    console.error("Error in getMachineDetailsByGroup:", error);
    throw error;
  }
}
