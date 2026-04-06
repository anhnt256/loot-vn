import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Headers,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser, UserRequestContext } from '../../auth/user-request-context';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('fund')
  async getFund(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.gameService.getFund(tenantId);
  }

  @Get('items')
  async getItems(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.gameService.getItems(tenantId);
  }

  @Get('admin-items')
  @UseGuards(AuthGuard)
  async getItemsAdmin(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.gameService.getItemsAdmin(tenantId);
  }

  @Put('bulk-items')
  @UseGuards(AuthGuard)
  async bulkUpdateItems(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { items: { id: number; title: string; value: number; background: string; textColor: string; rating: number; showOnWheel: boolean; displayOrder: number }[] },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new BadRequestException('items array is required');
    }
    return this.gameService.bulkUpdateItems(tenantId, body.items);
  }

  @Put('items/:id')
  @UseGuards(AuthGuard)
  async updateItem(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') idParam: string,
    @Body() body: { title?: string; value?: number; background?: string; textColor?: string; rating?: number },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const id = parseInt(idParam, 10);
    if (isNaN(id)) throw new BadRequestException('Invalid item ID');
    return this.gameService.updateItem(tenantId, id, body);
  }

  @Get('result')
  @UseGuards(AuthGuard)
  async getServerResults(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.gameService.getServerResults(tenantId);
  }

  @Get(':userId/result')
  @UseGuards(AuthGuard)
  async getUserResults(
    @Headers('x-tenant-id') tenantId: string,
    @Param('userId') userIdParam: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) throw new BadRequestException('Invalid user ID format');
    return this.gameService.getUserResults(tenantId, userId);
  }

  @Post('result')
  @UseGuards(AuthGuard)
  async createGameResult(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() body: { userId: number; rolls: number; type: 'Wish' | 'Gift' },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const { userId, rolls, type } = body;
    if (!userId || !rolls || !type) {
      throw new BadRequestException('userId, rolls, and type are required');
    }
    if (rolls !== 1 && rolls !== 10) {
      throw new BadRequestException('Chỉ cho phép quay 1 hoặc 10 lần.');
    }
    if (type !== 'Wish' && type !== 'Gift') {
      throw new BadRequestException('type must be Wish or Gift');
    }
    return this.gameService.createGameResult(tenantId, userId, rolls, type);
  }
}
