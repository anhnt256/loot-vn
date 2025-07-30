import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBranchFromCookie } from "@/lib/server-utils";

// GET - Lấy danh sách materials theo report type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("reportType");
    const branch = await getBranchFromCookie();

    if (!reportType) {
      return NextResponse.json(
        { success: false, error: "Report type is required" },
        { status: 400 },
      );
    }

    // Lấy materials từ bảng Material
    const materials = await db.$queryRaw<any[]>`
      SELECT 
        id,
        name,
        reportType,
        isActive,
        isOnFood
      FROM Material
      WHERE reportType = ${reportType}
        AND isActive = true
      ORDER BY name ASC
    `;

    return NextResponse.json({
      success: true,
      data: materials.map((material) => ({
        id: material.id,
        materialName: material.name,
        materialType: material.reportType,
        isDeleted: !material.isActive,
        isFood: material.isOnFood,
      })),
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch materials" },
      { status: 500 },
    );
  }
}

// POST - Thêm material mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      materialName,
      materialType,
      isDeleted = false,
      isFood = true,
    } = body;

    if (!materialName || !materialType) {
      return NextResponse.json(
        { success: false, error: "Material name and type are required" },
        { status: 400 },
      );
    }

    // Kiểm tra material đã tồn tại chưa
    const existingMaterial = await db.$queryRaw<any[]>`
      SELECT id FROM Material 
      WHERE name = ${materialName} 
        AND reportType = ${materialType}
      LIMIT 1
    `;

    if (existingMaterial.length > 0) {
      return NextResponse.json(
        { success: false, error: "Material already exists" },
        { status: 400 },
      );
    }

    // Tạo material mới
    const newMaterial = await db.$queryRaw<any[]>`
      INSERT INTO Material (name, reportType, isActive, isOnFood, createdAt, updatedAt)
      VALUES (${materialName}, ${materialType}, ${!isDeleted}, ${isFood}, NOW(), NOW())
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: {
        id: newMaterial[0].id,
        materialName: newMaterial[0].name,
        materialType: newMaterial[0].reportType,
        isDeleted: !newMaterial[0].isActive,
        isFood: newMaterial[0].isOnFood,
      },
    });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create material" },
      { status: 500 },
    );
  }
}

// PUT - Cập nhật material
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id,
      materialName,
      materialType,
      isDeleted = false,
      isFood = true,
    } = body;

    if (!id || !materialName || !materialType) {
      return NextResponse.json(
        { success: false, error: "Material ID, name and type are required" },
        { status: 400 },
      );
    }

    // Kiểm tra material có tồn tại không
    const existingMaterial = await db.$queryRaw<any[]>`
      SELECT id FROM Material WHERE id = ${parseInt(id)} LIMIT 1
    `;

    if (existingMaterial.length === 0) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 },
      );
    }

    // Kiểm tra tên material đã tồn tại chưa (trừ material hiện tại)
    const duplicateMaterial = await db.$queryRaw<any[]>`
      SELECT id FROM Material 
      WHERE name = ${materialName} 
        AND reportType = ${materialType}
        AND id != ${parseInt(id)}
      LIMIT 1
    `;

    if (duplicateMaterial.length > 0) {
      return NextResponse.json(
        { success: false, error: "Material name already exists" },
        { status: 400 },
      );
    }

    // Cập nhật material
    const updatedMaterial = await db.$queryRaw<any[]>`
      UPDATE Material 
      SET name = ${materialName}, 
          reportType = ${materialType}, 
          isActive = ${!isDeleted}, 
          isOnFood = ${isFood}, 
          updatedAt = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: {
        id: updatedMaterial[0].id,
        materialName: updatedMaterial[0].name,
        materialType: updatedMaterial[0].reportType,
        isDeleted: !updatedMaterial[0].isActive,
        isFood: updatedMaterial[0].isOnFood,
      },
    });
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update material" },
      { status: 500 },
    );
  }
}
