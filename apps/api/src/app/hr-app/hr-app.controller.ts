import { Controller, Get, Post, Body, Query, Req, UseGuards, Delete, Param, BadRequestException, Patch, Headers } from '@nestjs/common';
import { HrAppService } from './hr-app.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, UserRequestContext } from '../auth/user-request-context';
import { getTenantSlugFromRequest } from './tenant-from-request';

@Controller('hr-app')
export class HrAppController {
  constructor(private readonly hrAppService: HrAppService) {}

  private getTenantId(req: any): string {
    const id = (req.headers['x-tenant-id'] as string)?.trim() || getTenantSlugFromRequest(req);
    if (!id) throw new BadRequestException('x-tenant-id header is required');
    return id;
  }

  @Get('my-info')
  @UseGuards(AuthGuard)
  async getMyInfo(@Req() req: any, @CurrentUser() user: UserRequestContext) {
    const tenantId = this.getTenantId(req);
    const staff = await this.hrAppService.getMyInfo(user.userName, tenantId);
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
  async getRequests(@Req() req: any, @CurrentUser() user: UserRequestContext) {
    const tenantId = this.getTenantId(req);
    const data = await this.hrAppService.getRequests(user.userName, tenantId);
    return { success: true, data };
  }

  @Post('requests')
  @UseGuards(AuthGuard)
  async createRequest(@Req() req: any, @CurrentUser() user: UserRequestContext, @Body() body: { type: string; metadata?: Record<string, unknown> }) {
    const tenantId = this.getTenantId(req);
    const data = await this.hrAppService.createRequest(user.userName, body, tenantId);
    return { success: true, data };
  }

  @Delete('requests/:id')
  @UseGuards(AuthGuard)
  async deleteRequest(@Req() req: any, @CurrentUser() user: UserRequestContext, @Param('id') id: string) {
    const tenantId = this.getTenantId(req);
    await this.hrAppService.deleteRequest(user.userName, id, tenantId);
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

  @Post('change-password')
  @UseGuards(AuthGuard)
  async changePassword(@Req() req: any, @CurrentUser() user: UserRequestContext, @Body() body: any) {
    const tenantId = this.getTenantId(req);
    const data = await this.hrAppService.changePassword(user.userName, body, tenantId);
    return { success: true, ...data };
  }
}
