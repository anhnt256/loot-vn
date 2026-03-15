import { Controller, Get, Post, Body, Query, Req, UseGuards, Delete, Param, BadRequestException, Patch } from '@nestjs/common';
import { HrAppService } from './hr-app.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('hr-app')
export class HrAppController {
  constructor(private readonly hrAppService: HrAppService) {}

  @Post('login')
  async login(@Body() body: { userName: string; password?: string, loginMethod?: string }, @Req() req: any) {
    if (body.loginMethod && body.loginMethod !== 'staff') {
        throw new BadRequestException('Phương thức đăng nhập không hợp lệ');
    }
    const tenantId = req.headers['x-tenant-id'];
    const result = await this.hrAppService.login(body.userName, body.password, tenantId);
    return { success: true, ...result };
  }

  @Get('my-info')
  @UseGuards(AuthGuard)
  async getMyInfo(@Req() req: any) {
    // AuthGuard puts user payload in req.user
    const { userName } = req.user;
    const staff = await this.hrAppService.getMyInfo(userName);
    return { success: true, data: staff };
  }

  @Post('time-tracking')
  @UseGuards(AuthGuard)
  async handleTimeTracking(@Body() body: { staffId: number; action?: string; recordId?: number; month?: string; year?: string; date?: string }) {
    if (body.action) {
      const result = await this.hrAppService.postTimeTracking(body.staffId, body.action, body.recordId);
      return { success: true, ...result };
    }
    const data = await this.hrAppService.getTimeTracking({
      staffId: body.staffId,
      month: body.month,
      year: body.year,
      date: body.date
    });
    return { success: true, data };
  }

  @Post('salary')
  @UseGuards(AuthGuard)
  async getSalary(
    @Body() body: { staffId: number; month: string; year: string },
    @Req() req: any
  ) {
    const data = await this.hrAppService.getSalary({
      staffId: body.staffId,
      month: body.month,
      year: body.year,
    });
    return { success: true, data };
  }

  @Post('salary/history')
  @UseGuards(AuthGuard)
  async getSalaryHistory(
    @Body() body: { staffId: number; month: string; year: string },
    @Req() req: any
  ) {
    const data = await this.hrAppService.getSalaryHistory({
      staffId: body.staffId,
      month: body.month,
      year: body.year,
    });
    return { success: true, data };
  }

  @Get('requests')
  @UseGuards(AuthGuard)
  async getRequests(@Req() req: any) {
    const { userId } = req.user;
    const tenantId = req.headers['x-tenant-id'];
    console.log('DEBUG: getRequests', { userId, tenantId });
    if (!tenantId) {
      throw new BadRequestException('Missing x-tenant-id header');
    }
    const data = await this.hrAppService.getRequests(userId, tenantId);
    return { success: true, data };
  }

  @Post('requests')
  @UseGuards(AuthGuard)
  async createRequest(@Body() body: { type: string; metadata: any }, @Req() req: any) {
    const { userId } = req.user;
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('Missing x-tenant-id header');
    }
    const data = await this.hrAppService.createRequest(userId, tenantId, body);
    return { success: true, data };
  }

  @Delete('requests/:id')
  @UseGuards(AuthGuard)
  async deleteRequest(@Param('id') id: string, @Req() req: any) {
    const { userId } = req.user;
    await this.hrAppService.deleteRequest(id, userId);
    return { success: true, message: 'Đã xóa yêu cầu' };
  }

  @Get('all-requests')
  @UseGuards(AuthGuard)
  async getAllRequests(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('Missing x-tenant-id header');
    }
    // TODO: Verify if the user is actually a manager/admin
    const data = await this.hrAppService.getAllRequests(tenantId);
    return { success: true, data };
  }

  @Patch('requests/:id/status')
  @UseGuards(AuthGuard)
  async updateRequestStatus(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED' },
    @Req() req: any
  ) {
    const { userId } = req.user;
    if (!['APPROVED', 'REJECTED'].includes(body.status)) {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }
    const data = await this.hrAppService.updateRequestStatus(id, body.status, userId);
    return { success: true, data };
  }
}
