import { Controller, Get, Post, Patch, Delete, Body, Param, Headers, BadRequestException, ParseIntPipe, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import { MenuService } from './menu.service';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser, UserRequestContext } from '../../auth/user-request-context';

const IMAGES_DIR = join(process.cwd(), 'apps', 'api', 'images', 'menu');

@Controller('admin/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // --- Upload image ---
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: IMAGES_DIR,
      filename: (_req, file, cb) => {
        const name = randomBytes(8).toString('hex') + extname(file.originalname);
        cb(null, name);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        cb(new BadRequestException('Chỉ chấp nhận file hình ảnh'), false);
        return;
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Không có file');
    return { imageUrl: `/images/menu/${file.filename}` };
  }

  // --- Machine Groups (from fnetDB) ---
  @Get('machine-groups')
  async getMachineGroups(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.getMachineGroups(tenantId);
  }

  // --- Categories ---
  @Get('categories')
  async findAllCategories(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.findAllCategories(tenantId);
  }

  /** Dành cho client app: trả về categories đã lọc theo lịch hẹn giờ + nhóm máy */
  @Get('categories/client')
  @UseGuards(AuthGuard)
  async findClientCategories(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.findClientCategories(tenantId, user.machineGroupId ?? null);
  }

  @Post('categories')
  async createCategory(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { name: string; sortOrder?: number; requiredCategoryIds?: string | null }
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.createCategory(tenantId, dto);
  }

  @Patch('categories/reorder')
  async reorderCategories(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { orders: { id: number; sortOrder: number }[] }
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.reorderCategories(tenantId, dto.orders);
  }

  @Patch('categories/:id')
  async updateCategory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: {
      name?: string;
      sortOrder?: number;
      isActive?: boolean;
      scheduleEnabled?: boolean;
      scheduleTimeStart?: string | null;
      scheduleTimeEnd?: string | null;
      scheduleDateStart?: string | null;
      scheduleDateEnd?: string | null;
      scheduleDayRules?: string | null;
      scheduleMachineGroupIds?: string | null;
      requiredCategoryIds?: string | null;
    }
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const data: any = { ...dto };
    if (dto.scheduleDateStart !== undefined)
      data.scheduleDateStart = dto.scheduleDateStart ? new Date(dto.scheduleDateStart) : null;
    if (dto.scheduleDateEnd !== undefined)
      data.scheduleDateEnd = dto.scheduleDateEnd ? new Date(dto.scheduleDateEnd) : null;
    return this.menuService.updateCategory(tenantId, id, data);
  }

  @Delete('categories/:id')
  async deleteCategory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseIntPipe) id: number
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.deleteCategory(tenantId, id);
  }

  // --- Menu Items ---
  @Get('items')
  @UseGuards(AuthGuard)
  async findAllMenuItems(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.findAllMenuItems(tenantId, user.userId);
  }

  @Get('items/:id')
  async findMenuItemById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.findMenuItemById(tenantId, id);
  }

  @Post('items')
  async createMenuItem(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { name: string; salePrice?: number; categoryId?: number; imageUrl?: string }
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.createMenuItem(tenantId, dto);
  }

  @Patch('items/bulk-assign')
  async bulkAssignCategory(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { categoryId: number | null; recipeIds: number[] }
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!dto.recipeIds?.length) throw new BadRequestException('recipeIds is required');
    return this.menuService.bulkAssignCategory(tenantId, dto.categoryId, dto.recipeIds);
  }

  /** Thêm danh mục phụ cho các sản phẩm (giữ lại danh mục gốc) */
  @Patch('items/secondary-category/add')
  async addSecondaryCategory(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { categoryId: number; recipeIds: number[] },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!dto.categoryId) throw new BadRequestException('categoryId is required');
    if (!dto.recipeIds?.length) throw new BadRequestException('recipeIds is required');
    await this.menuService.addSecondaryCategory(tenantId, dto.categoryId, dto.recipeIds);
    return { success: true };
  }

  /** Xoá danh mục phụ khỏi các sản phẩm */
  @Patch('items/secondary-category/remove')
  async removeSecondaryCategory(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { categoryId: number; recipeIds: number[] },
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    if (!dto.categoryId) throw new BadRequestException('categoryId is required');
    if (!dto.recipeIds?.length) throw new BadRequestException('recipeIds is required');
    await this.menuService.removeSecondaryCategory(tenantId, dto.categoryId, dto.recipeIds);
    return { success: true };
  }

  @Patch('items/:id')
  async updateMenuItem(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { categoryId?: number | null; salePrice?: number; imageUrl?: string | null; isActive?: boolean; name?: string }
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.updateMenuItem(tenantId, id, dto);
  }
}
