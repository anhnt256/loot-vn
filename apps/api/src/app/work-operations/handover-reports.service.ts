import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class HandoverReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(branch: string, date?: string, reportType?: string) {
    const whereClause: any = { branch };
    if (reportType) whereClause.reportType = reportType;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      whereClause.date = { gte: startDate, lt: endDate };
    }

    const reports = await this.prisma.handoverReport.findMany({
      where: whereClause,
      include: {
        materials: { include: { material: true } },
        morningStaff: { select: { fullName: true } },
        afternoonStaff: { select: { fullName: true } },
        eveningStaff: { select: { fullName: true } },
      },
      orderBy: [{ date: 'desc' }, { reportType: 'asc' }],
    });

    return reports.map((report) => ({
      id: report.id,
      date: report.date,
      reportType: report.reportType,
      note: report.note,
      morningStaffId: report.morningStaffId,
      morningStaffName: report.morningStaff?.fullName || null,
      afternoonStaffId: report.afternoonStaffId,
      afternoonStaffName: report.afternoonStaff?.fullName || null,
      eveningStaffId: report.eveningStaffId,
      eveningStaffName: report.eveningStaff?.fullName || null,
      materials: report.materials
        .filter((m) => m.material?.reportType === report.reportType)
        .map((m) => ({
          id: m.id,
          materialName: m.material?.name || 'Unknown',
          materialType: m.material?.reportType || 'DAILY',
          morning: {
            beginning: m.morningBeginning,
            received: m.morningReceived,
            issued: m.morningIssued,
            ending: m.morningEnding,
          },
          afternoon: {
            beginning: m.afternoonBeginning,
            received: m.afternoonReceived,
            issued: m.afternoonIssued,
            ending: m.afternoonEnding,
          },
          evening: {
            beginning: m.eveningBeginning,
            received: m.eveningReceived,
            issued: m.eveningIssued,
            ending: m.eveningEnding,
          },
        }))
        .sort((a, b) => a.materialName.localeCompare(b.materialName)),
    }));
  }

  async createOrUpdate(branch: string, body: any) {
    const { date, reportType, note, materials } = body;
    if (!date || !reportType || !materials)
      throw new BadRequestException('Missing required fields');

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const existingReport = await this.prisma.handoverReport.findFirst({
      where: { date: { gte: startDate, lt: endDate }, reportType, branch },
      include: { materials: { include: { material: true } } },
    });

    let handoverReport;
    if (existingReport) {
      handoverReport = existingReport;
      if (note !== undefined) {
        await this.prisma.handoverReport.update({
          where: { id: existingReport.id },
          data: { note },
        });
      }
    } else {
      handoverReport = await this.prisma.handoverReport.create({
        data: { date: new Date(date), reportType, branch, note: note || null },
      });
    }

    for (const mat of materials) {
      const existingMaterial = existingReport?.materials.find(
        (m) => m.material?.name === mat.materialName,
      );
      const materialRecord = await this.prisma.material.findFirst({
        where: { name: mat.materialName },
      });

      const updateData: any = {
        materialId: materialRecord?.id || null,
        morningBeginning: parseFloat(mat.morning?.beginning || 0),
        morningReceived: parseFloat(mat.morning?.received || 0),
        morningIssued: parseFloat(mat.morning?.issued || 0),
        morningEnding: parseFloat(mat.morning?.ending || 0),
        afternoonBeginning: parseFloat(mat.afternoon?.beginning || 0),
        afternoonReceived: parseFloat(mat.afternoon?.received || 0),
        afternoonIssued: parseFloat(mat.afternoon?.issued || 0),
        afternoonEnding: parseFloat(mat.afternoon?.ending || 0),
        eveningBeginning: parseFloat(mat.evening?.beginning || 0),
        eveningReceived: parseFloat(mat.evening?.received || 0),
        eveningIssued: parseFloat(mat.evening?.issued || 0),
        eveningEnding: parseFloat(mat.evening?.ending || 0),
      };

      if (existingMaterial) {
        await this.prisma.handoverMaterial.update({
          where: { id: existingMaterial.id },
          data: updateData,
        });
      } else {
        await this.prisma.handoverMaterial.create({
          data: { handoverReportId: handoverReport.id, ...updateData },
        });
      }
    }

    return { id: handoverReport.id };
  }

  async checkCompletion(
    branch: string,
    date: string,
    shift: string,
    reportType: string,
  ) {
    const report = await this.prisma.$queryRaw<any[]>`
      SELECT id, date, reportType, branch FROM HandoverReport 
      WHERE DATE(date) = ${date} AND reportType = ${reportType} AND branch = ${branch} LIMIT 1
    `;

    if (report.length === 0) return { isCompleted: false, reportId: null };

    const reportId = Number(report[0].id);
    const materialsCompletion = await this.prisma.$queryRaw<any[]>`
      SELECT hm.id, hm.materialId, m.name as materialName,
      CASE 
        WHEN ${shift} = 'SANG' THEN hm.morningBeginning IS NOT NULL AND hm.morningReceived IS NOT NULL AND hm.morningIssued IS NOT NULL AND hm.morningEnding IS NOT NULL
        WHEN ${shift} = 'CHIEU' THEN hm.afternoonBeginning IS NOT NULL AND hm.afternoonReceived IS NOT NULL AND hm.afternoonIssued IS NOT NULL AND hm.afternoonEnding IS NOT NULL
        WHEN ${shift} = 'TOI' THEN hm.eveningBeginning IS NOT NULL AND hm.eveningReceived IS NOT NULL AND hm.eveningIssued IS NOT NULL AND hm.eveningEnding IS NOT NULL
        ELSE FALSE
      END as isComplete
      FROM HandoverMaterial hm
      LEFT JOIN Material m ON hm.materialId = m.id
      WHERE hm.handoverReportId = ${reportId} AND m.reportType = ${reportType} AND m.isActive = true
    `;

    const totalMaterials = materialsCompletion.length;
    const completedMaterials = materialsCompletion.filter(
      (m) => m.isComplete,
    ).length;
    const isCompleted =
      totalMaterials > 0 && totalMaterials === completedMaterials;

    return {
      isCompleted,
      reportId,
      completionDetails: {
        totalMaterials,
        completedMaterials,
        materials: materialsCompletion.map((m) => ({
          id: Number(m.id),
          materialName: m.materialName,
          isComplete: Boolean(m.isComplete),
        })),
      },
    };
  }
}
