import { Controller, Get, Post, Patch, Delete, Body, Param, Headers, BadRequestException, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import { MenuService } from './menu.service';

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

  // --- Categories ---
  @Get('categories')
  async findAllCategories(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.findAllCategories(tenantId);
  }

  @Post('categories')
  async createCategory(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { name: string; sortOrder?: number }
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.createCategory(tenantId, dto);
  }

  @Patch('categories/:id')
  async updateCategory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { name?: string; sortOrder?: number; isActive?: boolean }
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.updateCategory(tenantId, id, dto);
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
  async findAllMenuItems(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.findAllMenuItems(tenantId);
  }

  @Post('items')
  async createMenuItem(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { name: string; salePrice?: number; categoryId?: number; imageUrl?: string }
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.menuService.createMenuItem(tenantId, dto);
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
