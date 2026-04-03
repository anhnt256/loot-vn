import { Controller, Get, Post, Patch, Delete, Body, Param, Headers, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

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
  async adjustStock(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { materialId: number; type: 'RECEIPT' | 'ISSUE'; quantity: number; reason?: string }
  ) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header is missing');
    return this.materialService.adjustStock(tenantId, dto);
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
