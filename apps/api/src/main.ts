/**
 * This is not a production server yet!
 * This is only a minimal api to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigins: any[] = process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean) ?? [
    'http://localhost:7700',
    'http://127.0.0.1:7700',
    'http://localhost:7300',
    'http://localhost:7400',
    'http://localhost:7500',
    'http://localhost:7600',
    'https://tenant-manage.loot.vn'
  ];

  if (process.env.BASE_DOMAIN) {
    const baseDomain = process.env.BASE_DOMAIN.replace(/^\./, '');
    corsOrigins.push(new RegExp(`^https?:\\/\\/([a-zA-Z0-9-]+\\.)*${baseDomain.replace(/\\./g, '\\.')}$`));
  }

  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-tenant-id'],
    credentials: true,
  });
  const port = process.env.API_PORT || process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
