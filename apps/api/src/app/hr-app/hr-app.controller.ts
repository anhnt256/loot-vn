import { Controller, Get, Post, Body, Query, Req, UseGuards, Delete, Param, BadRequestException, Patch } from '@nestjs/common';
import { HrAppService } from './hr-app.service';
import { AuthGuard } from '../auth/auth.guard';
import { getTenantSlugFromRequest } from './tenant-from-request';

@Controller('hr-app')
export class HrAppController {
  constructor(private readonly hrAppService: HrAppService) {}

  private getTenantId(req: any): string {
    const id = (req.headers['x-tenant-id'] as string)?.trim() || getTenantSlugFromRequest(req);
    if (!id) throw new BadRequestException('x-tenant-id header is required');
    return id;
  }

  @Post('login')
  async login(@Body() body: { userName: string; password?: string, loginMethod?: string }, @Req() req: any) {
    if (body.loginMethod && body.loginMethod !== 'staff') {
        throw new BadRequestException('Phương thức đăng nhập không hợp lệ');
    }
    const tenantId =
      (req.headers['x-tenant-id'] as string)?.trim() ||
      getTenantSlugFromRequest(req) ||
      undefined;
    const result = await this.hrAppService.login(body.userName, body.password, tenantId);
    return { success: true, ...result };
  }

  @Get('my-info')
  @UseGuards(AuthGuard)
  async getMyInfo(@Req() req: any) {
    const { userName } = req.user;
    const tenantId = this.getTenantId(req);
    const staff = await this.hrAppService.getMyInfo(userName, tenantId);
    return { success: true, data: staff };
  }

  @Post('time-tracking')
  @UseGuards(AuthGuard)
  async handleTimeTracking(@Body() body: { staffId: number; action?: string; recordId?: number; month?: string; year?: string; date?: string }, @Req() req: any) {
    const tenantId = this.getTenantId(req);
    if (body.action) {
      const result = await this.hrAppService.postTimeTracking(body.staffId, body.action, body.recordId, tenantId);
      return { success: true, ...result };
    }
    const data = await this.hrAppService.getTimeTracking({
      staffId: body.staffId,
      month: body.month,
      year: body.year,
      date: body.date
    }, tenantId);
    return { success: true, data };
  }

  @Post('salary')
  @UseGuards(AuthGuard)
  async getSalary(
    @Body() body: { staffId: number; month: string; year: string },
    @Req() req: any
  ) {
    const tenantId = this.getTenantId(req);
    const data = await this.hrAppService.getSalary({
      staffId: body.staffId,
      month: body.month,
      year: body.year,
    }, tenantId);
    return { success: true, data };
  }

  @Post('salary/history')
  @UseGuards(AuthGuard)
  async getSalaryHistory(
    @Body() body: { staffId: number; month: string; year: string },
    @Req() req: any
  ) {
    const tenantId = this.getTenantId(req);
    const data = await this.hrAppService.getSalaryHistory({
      staffId: body.staffId,
      month: body.month,
      year: body.year,
    }, tenantId);
    return { success: true, data };
  }

  @Get('requests')
  @UseGuards(AuthGuard)
  async getRequests(@Req() req: any) {
    const { userName } = req.user;
    const tenantId = this.getTenantId(req);
    const data = await this.hrAppService.getRequests(userName, tenantId);
    return { success: true, data };
  }

  @Post('requests')
  @UseGuards(AuthGuard)
  async createRequest(@Req() req: any, @Body() body: { type: string; metadata?: Record<string, unknown> }) {
    const { userName } = req.user;
    const tenantId = this.getTenantId(req);
    const data = await this.hrAppService.createRequest(userName, body, tenantId);
    return { success: true, data };
  }

  @Delete('requests/:id')
  @UseGuards(AuthGuard)
  async deleteRequest(@Req() req: any, @Param('id') id: string) {
    const { userName } = req.user;
    const tenantId = this.getTenantId(req);
    await this.hrAppService.deleteRequest(userName, id, tenantId);
    return { success: true };
  }

  @Get('all-requests')
  @UseGuards(AuthGuard)
  async getAllRequests(@Req() req: any) {
    const tenantId = this.getTenantId(req);
    const data = await this.hrAppService.getAllRequests(tenantId);
    return { success: true, data };
  }

  @Patch('requests/:id/status')
  @UseGuards(AuthGuard)
  async updateRequestStatus(@Param('id') id: string, @Body() body: { status: 'APPROVED' | 'REJECTED' }, @Req() req: any) {
    const tenantId = this.getTenantId(req);
    await this.hrAppService.updateRequestStatus(id, body.status, tenantId);
    return { success: true };
  }
}
