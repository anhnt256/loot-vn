/**
 * Script to sync materials from GCP API to local database
 *
 * Usage:
 *   GCP_TOKEN="xxx" DATABASE_URL="mysql://..." node scripts/sync_materials.js
 *
 * Env:
 *   DATABASE_URL  - MySQL connection string (required)
 *   GCP_TOKEN     - GCP API token from core.gcpvn.com (required)
 *   TENANT_ID     - Tenant ID (default: 1)
 */

const { readFileSync } = require('fs');
const { resolve } = require('path');

// Load .env from project root
const envPath = resolve(__dirname, '..', '.env');
try {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w]+)\s*=\s*['"]?(.+?)['"]?\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
} catch {}

const { PrismaClient, HandoverReportType } = require('../libs/database/src/lib/generated/prisma-client');

const prisma = new PrismaClient();
const TENANT_ID = parseInt(process.env.TENANT_ID || '1', 10);

function generateSku(name, reportType) {
  const prefix = reportType === HandoverReportType.BAO_CAO_BEP ? 'BEP' : 'NUOC';
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toUpperCase();
  return `${prefix}-${slug}`;
}

function parseMaterial(item) {
  const name = (item.name || '').trim();
  if (!name) return null;
  if (name.toUpperCase().startsWith('COMBO')) return null;

  const reportType = name.toUpperCase().startsWith('BẾP')
    ? HandoverReportType.BAO_CAO_BEP
    : HandoverReportType.BAO_CAO_NUOC;

  const cleanName = name.includes(' - ') ? name.split(' - ').pop().trim() : name;
  const baseUnit = (item.unit || '').trim() || null;

  return { cleanName, reportType, baseUnit, sku: generateSku(cleanName, reportType) };
}

async function syncMaterials() {
  const url = 'https://core.gcpvn.com/api/dashboard/gc/material/list/';
  const token = process.env.GCP_TOKEN;

  if (!token) {
    console.error('Missing GCP_TOKEN. Get it from core.gcpvn.com (DevTools > Network > x-token header).');
    process.exit(1);
  }

  console.log('---------------------------------------------------------');
  console.log(`Syncing materials (tenant: ${TENANT_ID})...`);
  console.log('---------------------------------------------------------');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'x-token': token,
      }
    });

    if (!response.ok) throw new Error(`API failed: ${response.status}`);

    const json = await response.json();
    if (json.status !== 'ok') throw new Error(`API error: ${json.status}`);

    const items = json.data?.data || [];
    console.log(`Found ${items.length} items from API.`);

    let created = 0, updated = 0, skipped = 0, errors = 0;

    for (const item of items) {
      const parsed = parseMaterial(item);
      if (!parsed) { skipped++; continue; }

      const { cleanName, reportType, baseUnit, sku } = parsed;

      try {
        const existing = await prisma.material.findFirst({
          where: { name: cleanName, reportType, tenantId: TENANT_ID },
        });

        if (existing) {
          await prisma.material.update({
            where: { id: existing.id },
            data: {
              sku: existing.sku || sku,
              baseUnit: baseUnit || existing.baseUnit,
              isActive: true,
            },
          });
          updated++;
        } else {
          await prisma.material.create({
            data: { name: cleanName, sku, reportType, baseUnit, isActive: true, tenantId: TENANT_ID },
          });
          created++;
        }

        const tag = reportType === HandoverReportType.BAO_CAO_BEP ? '[BEP]' : '[NUOC]';
        console.log(`  ${tag} ${existing ? 'Updated' : 'Created'}: ${cleanName} (${sku}) [${baseUnit || '-'}]`);
      } catch (err) {
        console.error(`  Error "${cleanName}":`, err.message);
        errors++;
      }
    }

    // Deactivate combo materials that may exist from old syncs
    const { count: deactivated } = await prisma.material.updateMany({
      where: { name: { startsWith: 'COMBO' }, tenantId: TENANT_ID, isActive: true },
      data: { isActive: false },
    });

    console.log('---------------------------------------------------------');
    console.log(`Done! Created: ${created} | Updated: ${updated} | Skipped: ${skipped} | Deactivated combos: ${deactivated} | Errors: ${errors}`);
    console.log('---------------------------------------------------------');
  } catch (error) {
    console.error('Critical error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncMaterials();
