import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { MachineDetailsService } from './machine-details.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('machine-details')
export class MachineDetailsController {
  constructor(private readonly machineDetailsService: MachineDetailsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Req() req: any) {
    const branch = req.headers['x-branch'] || 'GoVap';
    const data = await this.machineDetailsService.getMachineDetails(branch);
    return { success: true, data };
  }
}
