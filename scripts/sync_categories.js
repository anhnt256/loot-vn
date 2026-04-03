/**
 * Sync danh mục từ GCP API vào bảng MenuCategory
 * Usage: node scripts/sync_categories.js
 */
const mysql = require('mysql2/promise');

const GCP_API = 'https://core.gcpvn.com/api/dashboard/gc/category/list/';
const GCP_TOKEN = 'b3083aaa125b0cdc335c75d957a4f055';
const DB_URL = process.env.DATABASE_URL || 'mysql://gateway:BzhmGqGyuTNsxVYqJgYFpgpfDzhOBlAp@51.79.145.188:3306/hifriends_tohieu';
const TENANT_ID = 1;

async function main() {
  // 1. Fetch categories from GCP
  console.log('Fetching categories from GCP API...');
  const res = await fetch(GCP_API, {
    headers: {
      'accept': 'application/json',
      'origin': 'https://menu.gcp.vn',
      'referer': 'https://menu.gcp.vn/',
      'x-token': GCP_TOKEN,
    },
  });
  const json = await res.json();
  const categories = json.data.categories;
  console.log(`Found ${categories.length} categories from GCP`);

  // 2. Connect to DB
  const url = new URL(DB_URL.replace('mysql://', 'http://'));
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: url.port || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  });

  // 3. Upsert categories
  let created = 0, updated = 0;
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const name = cat.name;
    const sortOrder = i;
    const isActive = cat.visible;

    // Check if exists by name
    const [rows] = await conn.execute(
      'SELECT id FROM MenuCategory WHERE name = ? AND tenantId = ?',
      [name, TENANT_ID]
    );

    if (rows.length > 0) {
      await conn.execute(
        'UPDATE MenuCategory SET sortOrder = ?, isActive = ?, updatedAt = NOW() WHERE id = ?',
        [sortOrder, isActive, rows[0].id]
      );
      console.log(`  Updated: ${name}`);
      updated++;
    } else {
      await conn.execute(
        'INSERT INTO MenuCategory (name, sortOrder, isActive, tenantId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [name, sortOrder, isActive, TENANT_ID]
      );
      console.log(`  Created: ${name}`);
      created++;
    }
  }

  console.log(`\nDone! Created: ${created}, Updated: ${updated}`);
  await conn.end();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
