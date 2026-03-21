import { Body, Controller, Patch, Headers, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('note')
  async updateNote(@Headers('x-tenant-id') tenantId: string, @Body() body: { userId: number; note: string }) {
    if (!tenantId) throw new BadRequestException('Missing x-tenant-id header');
    if (!body.userId || typeof body.note !== 'string') {
      return { success: false, message: 'Thiếu userId hoặc note không hợp lệ' };
    }
    return this.userService.updateNote(tenantId, Number(body.userId), body.note);
  }

  @Patch('is-use-app')
  async updateIsUseApp(@Headers('x-tenant-id') tenantId: string, @Body() body: { userId: number; isUseApp: boolean }) {
    if (!tenantId) throw new BadRequestException('Missing x-tenant-id header');
    if (!body.userId || typeof body.isUseApp !== 'boolean') {
      return { success: false, message: 'Thiếu userId hoặc isUseApp không hợp lệ' };
    }
    return this.userService.updateIsUseApp(tenantId, Number(body.userId), body.isUseApp);
  }
}
