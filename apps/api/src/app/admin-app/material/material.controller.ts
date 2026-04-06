import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Headers, BadRequestException, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser, UserRequestContext } from '../../auth/user-request-context';

@Controller('admin/materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  async findAll(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.findAll(tenantId);
  }

  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateMaterialDto
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.create(tenantId, dto);
  }

  // --- Fixed routes MUST come before :id routes ---
  @Post('stock-adjust')
  @UseGuards(AuthGuard)
  async adjustStock(
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: UserRequestContext,
    @Body() dto: { materialId: number; type: 'RECEIPT' | 'ISSUE'; quantity: number; reason?: string }
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    const staffId = user.staffId ?? user.userId;
    return this.materialService.adjustStock(tenantId, dto, staffId);
  }

  @Get('recipes')
  async findAllRecipes(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.findAllRecipes(tenantId);
  }

  @Get('transactions')
  async findAllTransactions(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.findAllTransactions(tenantId);
  }

  @Get('shift-audit')
  async getShiftAuditList(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('staffName') staffName?: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.findShiftAuditList(
      tenantId,
      parseInt(page ?? '1') || 1,
      parseInt(limit ?? '20') || 20,
      from,
      to,
      staffName,
    );
  }

  @Get('shift-audit/:shiftId/orders')
  async getShiftOrders(
    @Headers('x-tenant-id') tenantId: string,
    @Param('shiftId', ParseIntPipe) shiftId: number,
    @Query('status') status?: string,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.findShiftOrders(tenantId, shiftId, status);
  }

  @Get('shift-audit/:shiftId/receipts')
  async getShiftReceiptDetail(
    @Headers('x-tenant-id') tenantId: string,
    @Param('shiftId', ParseIntPipe) shiftId: number,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.findShiftReceiptDetail(tenantId, shiftId);
  }

  @Get('shift-audit/:shiftId/sales')
  async getShiftSaleDetail(
    @Headers('x-tenant-id') tenantId: string,
    @Param('shiftId', ParseIntPipe) shiftId: number,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.findShiftSaleDetail(tenantId, shiftId);
  }

  @Get('order-detail/:orderId')
  async getOrderDetail(
    @Headers('x-tenant-id') tenantId: string,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.findOrderDetail(tenantId, orderId);
  }

  @Get('profit-reports')
  async getProfitAnalysis(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.getProfitAnalysis(tenantId);
  }

  @Post('recipes')
  async createRecipe(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: any
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.createRecipe(tenantId, dto);
  }

  @Patch('recipes/:id')
  async updateRecipe(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.updateRecipe(tenantId, id, dto);
  }

  // --- :id routes AFTER fixed routes ---
  @Get(':id')
  async findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseIntPipe) id: number
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.findOne(tenantId, id);
  }

  @Patch(':id')
  async update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaterialDto
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.update(tenantId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseIntPipe) id: number
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.remove(tenantId, id);
  }

  @Get(':id/conversions')
  async getConversions(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseIntPipe) id: number
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.getConversions(tenantId, id);
  }

  @Post(':id/conversions')
  async addConversion(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.addConversion(tenantId, id, dto);
  }
}
