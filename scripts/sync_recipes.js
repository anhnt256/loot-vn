/**
 * Sync recipes (sale items + material mappings) from GCP API to local database.
 *
 * For each GCP sale_item that has materials:
 *   - Creates/updates a Recipe (productId = GCP item id)
 *   - Creates a RecipeVersion with RecipeItems linking to local Material records
 *
 * Prerequisites: run sync_materials.js first so Material records exist.
 *
 * Usage:
 *   node scripts/sync_recipes.js
 *
 * Env (auto-loaded from .env):
 *   DATABASE_URL  - MySQL connection string
 *   GCP_TOKEN     - GCP API token
 *   TENANT_ID     - Tenant ID (default: 1)
 */

const { readFileSync } = require('fs');
const { resolve } = require('path');

// Load .env
const envPath = resolve(__dirname, '..', '.env');
try {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w]+)\s*=\s*['"]?(.+?)['"]?\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
} catch {}

const { PrismaClient } = require('../libs/database/src/lib/generated/prisma-client');

const prisma = new PrismaClient();
const TENANT_ID = parseInt(process.env.TENANT_ID || '1', 10);

/**
 * Clean GCP material name to match local Material.name
 * Same logic as sync_materials.js: strip prefix before " - "
 */
function cleanMaterialName(gcpName) {
  const name = (gcpName || '').trim();
  return name.includes(' - ') ? name.split(' - ').pop().trim() : name;
}

async function syncRecipes() {
  const url = 'https://core.gcpvn.com/api/dashboard/general/sale_item/list/';
  const token = process.env.GCP_TOKEN;

  if (!token) {
    console.error('Missing GCP_TOKEN.');
    process.exit(1);
  }

  console.log('---------------------------------------------------------');
  console.log(`Syncing recipes (tenant: ${TENANT_ID})...`);
  console.log('---------------------------------------------------------');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'accept': 'application/json', 'x-token': token },
    });

    if (!response.ok) throw new Error(`API failed: ${response.status}`);

    const json = await response.json();
    if (json.status === 'failed') throw new Error(`API error: ${json.reason}`);

    const saleItems = json.data?.data || [];
    console.log(`Found ${saleItems.length} sale items from API.`);

    // Load all local materials into a lookup map: name -> Material
    const allMaterials = await prisma.material.findMany({
      where: { tenantId: TENANT_ID, isActive: true },
    });
    const materialByName = new Map();
    for (const m of allMaterials) {
      materialByName.set(m.name.toUpperCase(), m);
    }

    let created = 0, updated = 0, skipped = 0, errors = 0, materialNotFound = [];

    for (const item of saleItems) {
      // Skip items without materials
      if (!item.materials || item.materials.length === 0) {
        skipped++;
        continue;
      }

      // Skip disabled items
      if (!item.enable) {
        skipped++;
        continue;
      }

      try {
        // Resolve GCP materials to local Material IDs
        const recipeItems = [];
        let allResolved = true;

        for (const gcpMat of item.materials) {
          const cleanName = cleanMaterialName(gcpMat.name);
          const localMat = materialByName.get(cleanName.toUpperCase());

          if (!localMat) {
            allResolved = false;
            if (!materialNotFound.includes(cleanName)) {
              materialNotFound.push(cleanName);
            }
            continue;
          }

          recipeItems.push({
            materialId: localMat.id,
            quantity: gcpMat.use_quantity || 1,
            unit: localMat.baseUnit,
          });
        }

        if (recipeItems.length === 0) {
          skipped++;
          continue;
        }

        // Check if recipe already exists for this productId
        const existingRecipe = await prisma.recipe.findFirst({
          where: { productId: item.id, tenantId: TENANT_ID },
          include: { versions: { where: { isActive: true }, take: 1 } },
        });

        if (existingRecipe) {
          // Deactivate old versions, create new one
          if (existingRecipe.versions.length > 0) {
            await prisma.recipeVersion.updateMany({
              where: { recipeId: existingRecipe.id, isActive: true },
              data: { isActive: false, effectiveTo: new Date() },
            });
          }

          await prisma.recipe.update({
            where: { id: existingRecipe.id },
            data: { name: item.item_name },
          });

          const version = await prisma.recipeVersion.create({
            data: {
              recipeId: existingRecipe.id,
              versionName: `V${(existingRecipe.versions.length || 0) + 1}`,
              isActive: true,
              tenantId: TENANT_ID,
            },
          });

          for (const ri of recipeItems) {
            await prisma.recipeItem.create({
              data: { recipeVersionId: version.id, tenantId: TENANT_ID, ...ri },
            });
          }

          console.log(`  [UPD] ${item.item_name} (${recipeItems.length} materials)`);
          updated++;
        } else {
          // Create new recipe + version + items
          const recipe = await prisma.recipe.create({
            data: { productId: item.id, name: item.item_name, tenantId: TENANT_ID },
          });

          const version = await prisma.recipeVersion.create({
            data: {
              recipeId: recipe.id,
              versionName: 'V1',
              isActive: true,
              tenantId: TENANT_ID,
            },
          });

          for (const ri of recipeItems) {
            await prisma.recipeItem.create({
              data: { recipeVersionId: version.id, tenantId: TENANT_ID, ...ri },
            });
          }

          console.log(`  [NEW] ${item.item_name} (${recipeItems.length} materials)`);
          created++;
        }
      } catch (err) {
        console.error(`  Error "${item.item_name}":`, err.message);
        errors++;
      }
    }

    console.log('---------------------------------------------------------');
    console.log(`Done! Created: ${created} | Updated: ${updated} | Skipped: ${skipped} | Errors: ${errors}`);

    if (materialNotFound.length > 0) {
      console.log(`\nMaterials not found in DB (${materialNotFound.length}):`);
      materialNotFound.forEach(n => console.log(`  - ${n}`));
      console.log('\nRun sync_materials.js first if these are missing.');
    }

    console.log('---------------------------------------------------------');
  } catch (error) {
    console.error('Critical error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncRecipes();
