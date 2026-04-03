/**
 * Sync danh mục + sản phẩm từ GCP API vào MenuCategory + Recipe
 * Tải hình ảnh về apps/api/images/menu/
 * Usage: node scripts/sync_menu.js
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const GCP_BASE = 'https://core.gcpvn.com/api/dashboard/gc';
const GCP_TOKEN = 'b3083aaa125b0cdc335c75d957a4f055';
const GCP_CDN = 'https://cdn.gcpvn.com';
const DB_URL = process.env.DATABASE_URL || 'mysql://gateway:BzhmGqGyuTNsxVYqJgYFpgpfDzhOBlAp@51.79.145.188:3306/hifriends_tohieu';
const TENANT_ID = 1;
const IMAGES_DIR = path.join(__dirname, '..', 'apps', 'api', 'images', 'menu');
const API_IMAGE_PREFIX = '/images/menu';

const headers = {
  accept: 'application/json',
  origin: 'https://menu.gcp.vn',
  referer: 'https://menu.gcp.vn/',
  'x-token': GCP_TOKEN,
};

async function fetchGCP(apiPath) {
  const res = await fetch(`${GCP_BASE}${apiPath}`, { headers });
  const json = await res.json();
  return json.data;
}

function parseDbUrl(url) {
  const u = new URL(url.replace('mysql://', 'http://'));
  return {
    host: u.hostname,
    port: parseInt(u.port) || 3306,
    user: u.username,
    password: u.password,
    database: u.pathname.slice(1),
  };
}

async function downloadImage(imagePathOnCdn) {
  const filename = path.basename(imagePathOnCdn);
  const localPath = path.join(IMAGES_DIR, filename);

  if (fs.existsSync(localPath)) {
    return `${API_IMAGE_PREFIX}/${filename}`;
  }

  try {
    const url = `${GCP_CDN}/${imagePathOnCdn}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`    [WARN] Failed to download: ${url} (${res.status})`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(localPath, buffer);
    return `${API_IMAGE_PREFIX}/${filename}`;
  } catch (err) {
    console.warn(`    [WARN] Download error: ${err.message}`);
    return null;
  }
}

async function main() {
  // Ensure images dir
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const conn = await mysql.createConnection(parseDbUrl(DB_URL));

  // ========== 1. Sync Categories ==========
  console.log('=== Syncing categories ===');
  const catData = await fetchGCP('/category/list/');
  const gcpCategories = catData.categories;
  console.log(`GCP: ${gcpCategories.length} categories`);

  const catMap = new Map();
  let catCreated = 0, catUpdated = 0;

  for (let i = 0; i < gcpCategories.length; i++) {
    const cat = gcpCategories[i];
    const [rows] = await conn.execute(
      'SELECT id FROM MenuCategory WHERE name = ? AND tenantId = ?',
      [cat.name, TENANT_ID]
    );

    let dbId;
    if (rows.length > 0) {
      dbId = rows[0].id;
      await conn.execute(
        'UPDATE MenuCategory SET sortOrder = ?, isActive = ?, updatedAt = NOW() WHERE id = ?',
        [i, cat.visible, dbId]
      );
      catUpdated++;
    } else {
      const [result] = await conn.execute(
        'INSERT INTO MenuCategory (name, sortOrder, isActive, tenantId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [cat.name, i, cat.visible, TENANT_ID]
      );
      dbId = result.insertId;
      catCreated++;
    }
    catMap.set(cat.id, dbId);
    console.log(`  ${rows.length > 0 ? 'Updated' : 'Created'}: ${cat.name}`);
  }
  console.log(`Categories - Created: ${catCreated}, Updated: ${catUpdated}\n`);

  // ========== 2. Sync Sale Items -> Recipe ==========
  console.log('=== Syncing products ===');
  const itemData = await fetchGCP('/sale_item/list/');
  const gcpItems = itemData.data;
  console.log(`GCP: ${gcpItems.length} products\n`);

  let itemCreated = 0, itemUpdated = 0, imgDownloaded = 0;

  for (const item of gcpItems) {
    const name = item.item_name;
    const salePrice = item.item_price || 0;
    const categoryId = catMap.get(item.category_id) || null;
    const isActive = item.visible && item.enable;

    // Download image
    let imageUrl = null;
    if (item.image) {
      imageUrl = await downloadImage(item.image);
      if (imageUrl) imgDownloaded++;
    }

    const [rows] = await conn.execute(
      'SELECT id FROM Recipe WHERE name = ? AND tenantId = ?',
      [name, TENANT_ID]
    );

    if (rows.length > 0) {
      await conn.execute(
        'UPDATE Recipe SET salePrice = ?, imageUrl = ?, categoryId = ?, isActive = ?, updatedAt = NOW() WHERE id = ?',
        [salePrice, imageUrl, categoryId, isActive, rows[0].id]
      );
      itemUpdated++;
    } else {
      await conn.execute(
        'INSERT INTO Recipe (name, salePrice, imageUrl, categoryId, isActive, tenantId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [name, salePrice, imageUrl, categoryId, isActive, TENANT_ID]
      );
      itemCreated++;
    }
  }

  console.log(`\nProducts - Created: ${itemCreated}, Updated: ${itemUpdated}`);
  console.log(`Images downloaded: ${imgDownloaded}`);
  console.log(`Images directory: ${IMAGES_DIR}`);
  console.log(`\nDone!`);
  await conn.end();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
