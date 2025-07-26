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
    const materials = await db.material.findMany({
      where: {
        reportType: reportType as any,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        reportType: true,
        isActive: true,
        isOnFood: true,
      },
      orderBy: {
        name: "asc",
      },
    });

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
    const existingMaterial = await db.material.findFirst({
      where: {
        name: materialName,
        reportType: materialType as any,
      },
    });

    if (existingMaterial) {
      return NextResponse.json(
        { success: false, error: "Material already exists" },
        { status: 400 },
      );
    }

    // Tạo material mới
    const newMaterial = await db.material.create({
      data: {
        name: materialName,
        reportType: materialType as any,
        isActive: !isDeleted,
        isOnFood: isFood,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newMaterial.id,
        materialName: newMaterial.name,
        materialType: newMaterial.reportType,
        isDeleted: !newMaterial.isActive,
        isFood: newMaterial.isOnFood,
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
    const existingMaterial = await db.material.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 },
      );
    }

    // Kiểm tra tên material đã tồn tại chưa (trừ material hiện tại)
    const duplicateMaterial = await db.material.findFirst({
      where: {
        name: materialName,
        reportType: materialType as any,
        id: { not: parseInt(id) },
      },
    });

    if (duplicateMaterial) {
      return NextResponse.json(
        { success: false, error: "Material name already exists" },
        { status: 400 },
      );
    }

    // Cập nhật material
    const updatedMaterial = await db.material.update({
      where: { id: parseInt(id) },
      data: {
        name: materialName,
        reportType: materialType as any,
        isActive: !isDeleted,
        isOnFood: isFood,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedMaterial.id,
        materialName: updatedMaterial.name,
        materialType: updatedMaterial.reportType,
        isDeleted: !updatedMaterial.isActive,
        isFood: updatedMaterial.isOnFood,
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
