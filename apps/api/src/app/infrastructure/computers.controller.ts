import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ComputersService } from './computers.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('computers')
export class ComputersController {
  constructor(private readonly computersService: ComputersService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Req() req: any) {
    const branch = req.headers['x-branch'] || 'GoVap';
    const data = await this.computersService.findAll(branch);
    return data;
  }
}
