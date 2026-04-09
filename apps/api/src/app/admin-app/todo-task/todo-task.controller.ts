import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { TodoTaskService } from './todo-task.service';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser, UserRequestContext } from '../../auth/user-request-context';
import { getTenantIdFromRequest } from '../../hr-app/tenant-from-request';

@Controller('admin/schedule-tasks')
@UseGuards(AuthGuard)
export class TodoTaskController {
  constructor(private readonly service: TodoTaskService) {}

  private getTenantId(req: any): string {
    const id = getTenantIdFromRequest(req);
    if (!id) throw new BadRequestException('Missing x-tenant-id');
    return id;
  }

  @Get('staff-list')
  getStaffList(@Req() req: any) {
    return this.service.getStaffList(this.getTenantId(req));
  }

  @Get('shift-list')
  getShiftList(@Req() req: any) {
    return this.service.getShiftList(this.getTenantId(req));
  }

  @Get('daily-report')
  getDailyReport(@Req() req: any, @Query('date') date?: string) {
    return this.service.getDailyReport(this.getTenantId(req), date);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(this.getTenantId(req));
  }

  @Post()
  create(@Req() req: any, @CurrentUser() user: UserRequestContext, @Body() body: any) {
    return this.service.create(this.getTenantId(req), {
      ...body,
      createdById: user.staffId,
    });
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.update(this.getTenantId(req), +id, body);
  }

  @Post('logs/:logId/acknowledge')
  acknowledge(@Req() req: any, @Param('logId') logId: string) {
    return this.service.acknowledgeLog(this.getTenantId(req), +logId);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(this.getTenantId(req), +id);
  }
}
