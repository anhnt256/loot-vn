import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  loginAndGetMomoToken,
  fetchMomoReportInBackground,
} from '../lib/momo-report';

@Injectable()
export class MomoService {
  private readonly logger = new Logger(MomoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getToken(branch: string, forceRefresh = false) {
    const cred = await this.prisma.momoCredential.findFirst({
      where: { branch },
    });
    if (!cred) throw new NotFoundException('MomoCredential not found');

    if (
      !forceRefresh &&
      cred.token &&
      cred.expired &&
      new Date(cred.expired) > new Date()
    ) {
      return { token: cred.token, expired: cred.expired };
    }

    const result = await loginAndGetMomoToken({
      username: cred.username,
      password: cred.password,
    });
    if (!result) throw new Error('Momo login failed');

    await this.prisma.momoCredential.update({
      where: { id: cred.id },
      data: {
        token: result.token,
        expired: result.expired,
        updatedAt: new Date(),
      },
    });

    return result;
  }

  async fetchReport(branch: string) {
    const cred = await this.prisma.momoCredential.findFirst({
      where: { branch },
    });
    if (!cred?.momoUrl) throw new NotFoundException('Momo URL not set');

    fetchMomoReportInBackground({
      momoUrl: cred.momoUrl,
      username: cred.username,
      password: cred.password,
    });

    return {
      started: true,
      message: 'Momo report fetch started in background',
    };
  }
}
