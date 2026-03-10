import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(computerId?: number) {
    return this.prisma.device.findMany({
      where: computerId ? { computerId } : undefined,
      include: {
        computer: true,
        histories: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(computerId: number) {
    const computer = await this.prisma.computer.findUnique({
      where: { id: computerId },
    });
    if (!computer) throw new NotFoundException('Computer not found');

    const existingDevice = await this.prisma.device.findFirst({
      where: { computerId },
    });
    if (existingDevice)
      throw new BadRequestException(
        'Device record already exists for this computer',
      );

    return this.prisma.device.create({ data: { computerId } });
  }
}
