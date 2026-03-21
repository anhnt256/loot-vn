import { Controller, Get, Req, Headers, Query } from '@nestjs/common';
import { ComputerService } from './computer.service';
import { getTenantIdFromRequest } from '../../hr-app/tenant-from-request';

@Controller('computer')
export class ComputerController {
  constructor(private readonly computerService: ComputerService) {}

  @Get()
  async getComputers(
    @Req() req: any, 
    @Headers('x-tenant-id') xTenantId: string, 
    @Query('branch') branch?: string
  ) {
    const tenantId = xTenantId || getTenantIdFromRequest(req);
    // Determine the branch to use (priority: query param -> cookie -> x-tenant-id -> default)
    const resolvedBranch = branch || req.cookies?.['branch'] || tenantId || 'default';
    
    return this.computerService.getComputers(tenantId, resolvedBranch);
  }
}
