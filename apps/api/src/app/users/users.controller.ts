import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Req,
  UseGuards,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

export class CreateUserDto {
  userId: number;
  branch?: string;
  rankId?: number;
  stars?: number;
}

export class UpdateUserDto {
  id: number;
  branch: string;
  rankId?: number;
  magicStone?: number;
  stars?: number;
  userName?: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile/:userId/:branch')
  @UseGuards(AuthGuard)
  async getProfile(
    @Param('userId') userId: string,
    @Param('branch') branch: string,
  ) {
    const user = await this.usersService.findOne(parseInt(userId, 10), branch);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Get('wallet')
  @UseGuards(AuthGuard)
  async getWallet(@Req() req: any) {
    const userId = req.user.userId;
    const branch = req.headers['x-branch'] || 'GoVap';
    const wallet = await this.usersService.getWallet(userId, branch);
    if (!wallet) throw new NotFoundException('Wallet not found');
    return { wallet };
  }

  @Get('search')
  @UseGuards(AuthGuard)
  async search(@Query('q') query: string, @Req() req: any) {
    const branch = req.headers['x-branch'] || 'GoVap';
    return this.usersService.search(query, branch);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const branch = createUserDto.branch || 'GoVap';
    return this.usersService.createUser({
      userId: createUserDto.userId,
      branch: branch,
      rankId: createUserDto.rankId,
      stars: createUserDto.stars,
    });
  }

  @Put()
  async update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(updateUserDto);
  }

  @Post('calculate')
  @UseGuards(AuthGuard)
  async calculate(@Body() body: { listUsers: number[] }, @Req() req: any) {
    const branch = req.user.branch;
    return this.usersService.calculateActiveUsers(body.listUsers, branch);
  }
}
