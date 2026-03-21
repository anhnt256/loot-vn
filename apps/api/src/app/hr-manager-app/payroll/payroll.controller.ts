import { Controller, Get, Req, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { getTenantIdFromRequest } from '../../hr-app/tenant-from-request';

@Controller('hr-manager/payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  private getTenantId(req: any): string {
    const id = getTenantIdFromRequest(req);
    if (!id) throw new BadRequestException('Missing x-tenant-id or invalid Origin/Referer');
    return id;
  }

  @Get()
  async getPayrollList(
    @Req() req: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.payrollService.getPayrollList(this.getTenantId(req), month, year);
  }
}
