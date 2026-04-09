import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MasterPrismaService, TenantPrismaService } from '../../database/prisma.service';
import { getTenantDbUrl } from '../../database/tenant-gateway.service';

const VALID_STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'BUDGET_EXCEEDED', 'EXPIRED', 'CANCELLED'];
const EDITABLE_STATUSES = ['DRAFT', 'PAUSED'];

@Injectable()
export class MenuCampaignService {
  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly tenantPrisma: TenantPrismaService,
  ) {}

  async getClients(tenantId: string) {
    let tenant = await this.masterPrisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
    });
    if (!tenant) {
      tenant = await this.masterPrisma.tenant.findFirst({
        where: { tenantId: tenantId, deletedAt: null },
      });
    }
    if (!tenant) throw new BadRequestException('Tenant không hợp lệ');

    const dbUrl = getTenantDbUrl(tenant);
    if (!dbUrl) throw new BadRequestException('Tenant chưa cấu hình DB URL');
    const gateway = await this.tenantPrisma.getClient(dbUrl);

    return { gateway: gateway as any, tenant };
  }

  private _schemaReadySet = new Set<string>();
  async ensureSchema(gateway: any, tenantId: string) {
    if (this._schemaReadySet.has(tenantId)) return;

    await gateway.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS MenuCampaign (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('DRAFT','ACTIVE','PAUSED','BUDGET_EXCEEDED','EXPIRED','CANCELLED') DEFAULT 'DRAFT',
        discountType ENUM('PERCENTAGE','FIXED_AMOUNT','FLAT_PRICE','COMBO_DEAL') NOT NULL,
        discountValue DECIMAL(10,2) NOT NULL,
        maxDiscountAmount INT,
        startDate DATETIME NOT NULL,
        endDate DATETIME NOT NULL,
        totalBudget INT,
        spentBudget INT DEFAULT 0,
        totalUsageCount INT DEFAULT 0,
        maxUsesPerUserPerCampaign INT,
        maxUsesPerUserPerDay INT,
        minOrderValue INT,
        priority INT DEFAULT 1,
        testGroup VARCHAR(10),
        requiredBpLevel INT,
        requiredBpSeasonId INT,
        newMemberDaysThreshold INT,
        createdBy INT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_start (startDate),
        INDEX idx_end (endDate),
        INDEX idx_test_group (testGroup)
      )
    `);

    await gateway.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS MenuCampaignMenuScope (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaignId INT NOT NULL,
        scopeType ENUM('ALL','CATEGORY','RECIPE') NOT NULL,
        targetId INT,
        INDEX idx_campaign (campaignId),
        CONSTRAINT fk_menu_scope_campaign FOREIGN KEY (campaignId) REFERENCES MenuCampaign(id) ON DELETE CASCADE
      )
    `);

    await gateway.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS MenuCampaignCustomerScope (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaignId INT NOT NULL,
        scopeType ENUM('ALL_CUSTOMERS','RANK','MACHINE_GROUP','SPECIFIC_USER','NEW_MEMBER') NOT NULL,
        targetId INT,
        INDEX idx_campaign (campaignId),
        CONSTRAINT fk_customer_scope_campaign FOREIGN KEY (campaignId) REFERENCES MenuCampaign(id) ON DELETE CASCADE
      )
    `);

    await gateway.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS MenuCampaignTimeSlot (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaignId INT NOT NULL,
        dayOfWeek INT,
        startTime VARCHAR(5) NOT NULL,
        endTime VARCHAR(5) NOT NULL,
        INDEX idx_campaign (campaignId),
        CONSTRAINT fk_time_slot_campaign FOREIGN KEY (campaignId) REFERENCES MenuCampaign(id) ON DELETE CASCADE
      )
    `);

    await gateway.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS MenuCampaignComboRule (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaignId INT NOT NULL,
        categoryId INT NOT NULL,
        minQuantity INT DEFAULT 1,
        INDEX idx_campaign (campaignId),
        CONSTRAINT fk_combo_rule_campaign FOREIGN KEY (campaignId) REFERENCES MenuCampaign(id) ON DELETE CASCADE
      )
    `);

    await gateway.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS MenuCampaignUsage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaignId INT NOT NULL,
        userId INT NOT NULL,
        orderId INT NOT NULL,
        discountAmount DECIMAL(10,0) NOT NULL,
        appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_campaign (campaignId),
        INDEX idx_user (userId),
        INDEX idx_order (orderId),
        INDEX idx_applied (appliedAt),
        CONSTRAINT fk_usage_campaign FOREIGN KEY (campaignId) REFERENCES MenuCampaign(id) ON DELETE CASCADE
      )
    `);

    await gateway.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS MenuCampaignAnalytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaignId INT NOT NULL,
        snapshotDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        totalUsages INT DEFAULT 0,
        uniqueUsers INT DEFAULT 0,
        totalDiscountGiven DECIMAL(12,0) DEFAULT 0,
        totalRevenueGenerated DECIMAL(12,0) DEFAULT 0,
        averageOrderValue DECIMAL(10,0),
        conversionRate FLOAT,
        INDEX idx_campaign (campaignId),
        INDEX idx_snapshot (snapshotDate),
        CONSTRAINT fk_analytics_campaign FOREIGN KEY (campaignId) REFERENCES MenuCampaign(id) ON DELETE CASCADE
      )
    `);

    try {
      await gateway.$executeRawUnsafe(`ALTER TABLE FoodOrder ADD COLUMN campaignId INT`);
    } catch { /* already exists */ }
    try {
      await gateway.$executeRawUnsafe(`ALTER TABLE FoodOrder ADD COLUMN discountAmount DECIMAL(10,0) DEFAULT 0`);
    } catch { /* already exists */ }

    this._schemaReadySet.add(tenantId);
  }

  // ─── Helpers ───

  private validateDate(value: any, fieldName: string): Date {
    if (!value) throw new BadRequestException(`${fieldName} là bắt buộc`);
    const d = new Date(value);
    if (isNaN(d.getTime())) throw new BadRequestException(`${fieldName} không hợp lệ`);
    return d;
  }

  private normalize(c: any) {
    return {
      id: Number(c.id),
      name: c.name,
      description: c.description,
      status: c.status,
      discountType: c.discountType,
      discountValue: Number(c.discountValue),
      maxDiscountAmount: c.maxDiscountAmount != null ? Number(c.maxDiscountAmount) : null,
      startDate: c.startDate,
      endDate: c.endDate,
      totalBudget: c.totalBudget != null ? Number(c.totalBudget) : null,
      spentBudget: Number(c.spentBudget),
      totalUsageCount: Number(c.totalUsageCount),
      maxUsesPerUserPerCampaign: c.maxUsesPerUserPerCampaign != null ? Number(c.maxUsesPerUserPerCampaign) : null,
      maxUsesPerUserPerDay: c.maxUsesPerUserPerDay != null ? Number(c.maxUsesPerUserPerDay) : null,
      minOrderValue: c.minOrderValue != null ? Number(c.minOrderValue) : null,
      priority: Number(c.priority),
      testGroup: c.testGroup,
      requiredBpLevel: c.requiredBpLevel != null ? Number(c.requiredBpLevel) : null,
      requiredBpSeasonId: c.requiredBpSeasonId != null ? Number(c.requiredBpSeasonId) : null,
      newMemberDaysThreshold: c.newMemberDaysThreshold != null ? Number(c.newMemberDaysThreshold) : null,
      createdBy: c.createdBy != null ? Number(c.createdBy) : null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  private async loadChildren(gateway: any, campaignId: number) {
    const norm = (s: any) => ({ id: Number(s.id), scopeType: s.scopeType, targetId: s.targetId != null ? Number(s.targetId) : null });
    const menuScopes = (await gateway.$queryRawUnsafe(`SELECT * FROM MenuCampaignMenuScope WHERE campaignId = ?`, campaignId)).map(norm);
    const customerScopes = (await gateway.$queryRawUnsafe(`SELECT * FROM MenuCampaignCustomerScope WHERE campaignId = ?`, campaignId)).map(norm);
    const timeSlots = (await gateway.$queryRawUnsafe(`SELECT * FROM MenuCampaignTimeSlot WHERE campaignId = ?`, campaignId))
      .map((s: any) => ({ id: Number(s.id), dayOfWeek: s.dayOfWeek != null ? Number(s.dayOfWeek) : null, startTime: s.startTime, endTime: s.endTime }));
    const comboRules = (await gateway.$queryRawUnsafe(`SELECT * FROM MenuCampaignComboRule WHERE campaignId = ?`, campaignId))
      .map((s: any) => ({ id: Number(s.id), categoryId: Number(s.categoryId), minQuantity: Number(s.minQuantity) }));
    return { menuScopes, customerScopes, timeSlots, comboRules };
  }

  private async insertChildren(gateway: any, campaignId: number, data: any) {
    for (const s of data.menuScopes ?? []) {
      await gateway.$executeRawUnsafe(`INSERT INTO MenuCampaignMenuScope (campaignId, scopeType, targetId) VALUES (?, ?, ?)`,
        campaignId, s.scopeType, s.targetId ?? null);
    }
    for (const s of data.customerScopes ?? []) {
      await gateway.$executeRawUnsafe(`INSERT INTO MenuCampaignCustomerScope (campaignId, scopeType, targetId) VALUES (?, ?, ?)`,
        campaignId, s.scopeType, s.targetId ?? null);
    }
    for (const s of data.timeSlots ?? []) {
      await gateway.$executeRawUnsafe(`INSERT INTO MenuCampaignTimeSlot (campaignId, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?)`,
        campaignId, s.dayOfWeek ?? null, s.startTime, s.endTime);
    }
    for (const r of data.comboRules ?? []) {
      if (r.categoryId == null) throw new BadRequestException('comboRule.categoryId là bắt buộc');
      await gateway.$executeRawUnsafe(`INSERT INTO MenuCampaignComboRule (campaignId, categoryId, minQuantity) VALUES (?, ?, ?)`,
        campaignId, r.categoryId, r.minQuantity ?? 1);
    }
  }

  // ─── CRUD ───

  async getAll(tenantId: string, status?: string) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway, tenantId);
    if (status && !VALID_STATUSES.includes(status)) {
      throw new BadRequestException(`Status không hợp lệ. Chấp nhận: ${VALID_STATUSES.join(', ')}`);
    }
    let query = `SELECT * FROM MenuCampaign WHERE 1=1`;
    const params: any[] = [];
    if (status) { query += ` AND status = ?`; params.push(status); }
    query += ` ORDER BY priority DESC, createdAt DESC`;
    const campaigns: any[] = await gateway.$queryRawUnsafe(query, ...params);
    const results = [];
    for (const c of campaigns) {
      const n = this.normalize(c);
      results.push({ ...n, ...(await this.loadChildren(gateway, n.id)) });
    }
    return results;
  }

  async getById(tenantId: string, id: number) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway, tenantId);
    const rows: any[] = await gateway.$queryRawUnsafe(`SELECT * FROM MenuCampaign WHERE id = ?`, id);
    if (!rows.length) throw new NotFoundException('Campaign không tồn tại');
    const n = this.normalize(rows[0]);
    const children = await this.loadChildren(gateway, id);
    const stats: any[] = await gateway.$queryRawUnsafe(`
      SELECT COUNT(*) as totalUsages, COUNT(DISTINCT userId) as uniqueUsers, COALESCE(SUM(discountAmount), 0) as totalDiscount
      FROM MenuCampaignUsage WHERE campaignId = ?
    `, id);
    return {
      ...n, ...children,
      usageStats: {
        totalUsages: Number(stats[0]?.totalUsages ?? 0),
        uniqueUsers: Number(stats[0]?.uniqueUsers ?? 0),
        totalDiscount: Number(stats[0]?.totalDiscount ?? 0),
      },
    };
  }

  async create(tenantId: string, data: any) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway, tenantId);
    const { name, description, discountType, discountValue, maxDiscountAmount,
      startDate, endDate, totalBudget, maxUsesPerUserPerCampaign, maxUsesPerUserPerDay,
      minOrderValue, priority, testGroup, requiredBattlePassLevel, requiredBattlePassSeasonId,
      newMemberDaysThreshold, createdBy, menuScopes, customerScopes, timeSlots, comboRules } = data;
    if (!name) throw new BadRequestException('name là bắt buộc');
    if (!discountType) throw new BadRequestException('discountType là bắt buộc');
    if (discountValue == null) throw new BadRequestException('discountValue là bắt buộc');
    const s = this.validateDate(startDate, 'startDate');
    const e = this.validateDate(endDate, 'endDate');
    if (s >= e) throw new BadRequestException('startDate phải trước endDate');

    await gateway.$executeRawUnsafe(`START TRANSACTION`);
    try {
      await gateway.$executeRawUnsafe(`
        INSERT INTO MenuCampaign (name, description, discountType, discountValue, maxDiscountAmount,
          startDate, endDate, totalBudget, maxUsesPerUserPerCampaign, maxUsesPerUserPerDay, minOrderValue,
          priority, testGroup, requiredBpLevel, requiredBpSeasonId, newMemberDaysThreshold, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        name, description ?? null, discountType, discountValue, maxDiscountAmount ?? null,
        s, e, totalBudget ?? null, maxUsesPerUserPerCampaign ?? null, maxUsesPerUserPerDay ?? null,
        minOrderValue ?? null, priority ?? 1, testGroup ?? null, requiredBattlePassLevel ?? null,
        requiredBattlePassSeasonId ?? null, newMemberDaysThreshold ?? null, createdBy ?? null);
      const lastId: any[] = await gateway.$queryRawUnsafe(`SELECT LAST_INSERT_ID() as lastId`);
      const campaignId = Number(lastId[0]?.lastId);
      await this.insertChildren(gateway, campaignId, { menuScopes, customerScopes, timeSlots, comboRules });
      await gateway.$executeRawUnsafe(`COMMIT`);
      return { success: true, id: campaignId };
    } catch (err) { await gateway.$executeRawUnsafe(`ROLLBACK`); throw err; }
  }

  async update(tenantId: string, id: number, data: any) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway, tenantId);
    const existing: any[] = await gateway.$queryRawUnsafe(`SELECT id, status FROM MenuCampaign WHERE id = ?`, id);
    if (!existing.length) throw new NotFoundException('Campaign không tồn tại');
    if (!EDITABLE_STATUSES.includes(existing[0].status)) {
      throw new BadRequestException(`Chỉ chỉnh sửa được campaign ${EDITABLE_STATUSES.join('/')}. Hiện: ${existing[0].status}`);
    }
    const { name, description, discountType, discountValue, maxDiscountAmount,
      startDate, endDate, totalBudget, maxUsesPerUserPerCampaign, maxUsesPerUserPerDay,
      minOrderValue, priority, testGroup, requiredBattlePassLevel, requiredBattlePassSeasonId,
      newMemberDaysThreshold, menuScopes, customerScopes, timeSlots, comboRules } = data;
    const s = this.validateDate(startDate, 'startDate');
    const e = this.validateDate(endDate, 'endDate');
    if (s >= e) throw new BadRequestException('startDate phải trước endDate');

    await gateway.$executeRawUnsafe(`START TRANSACTION`);
    try {
      await gateway.$executeRawUnsafe(`
        UPDATE MenuCampaign SET name=?, description=?, discountType=?, discountValue=?, maxDiscountAmount=?,
          startDate=?, endDate=?, totalBudget=?, maxUsesPerUserPerCampaign=?, maxUsesPerUserPerDay=?,
          minOrderValue=?, priority=?, testGroup=?, requiredBpLevel=?, requiredBpSeasonId=?, newMemberDaysThreshold=?
        WHERE id=?`,
        name, description ?? null, discountType, discountValue, maxDiscountAmount ?? null,
        s, e, totalBudget ?? null, maxUsesPerUserPerCampaign ?? null, maxUsesPerUserPerDay ?? null,
        minOrderValue ?? null, priority ?? 1, testGroup ?? null, requiredBattlePassLevel ?? null,
        requiredBattlePassSeasonId ?? null, newMemberDaysThreshold ?? null, id);
      for (const t of ['MenuCampaignMenuScope', 'MenuCampaignCustomerScope', 'MenuCampaignTimeSlot', 'MenuCampaignComboRule']) {
        await gateway.$executeRawUnsafe(`DELETE FROM ${t} WHERE campaignId = ?`, id);
      }
      await this.insertChildren(gateway, id, { menuScopes, customerScopes, timeSlots, comboRules });
      await gateway.$executeRawUnsafe(`COMMIT`);
      return { success: true };
    } catch (err) { await gateway.$executeRawUnsafe(`ROLLBACK`); throw err; }
  }

  async updateStatus(tenantId: string, id: number, status: string) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway, tenantId);
    if (!VALID_STATUSES.includes(status)) throw new BadRequestException(`Status không hợp lệ: ${VALID_STATUSES.join(', ')}`);
    const existing: any[] = await gateway.$queryRawUnsafe(`SELECT id FROM MenuCampaign WHERE id = ?`, id);
    if (!existing.length) throw new NotFoundException('Campaign không tồn tại');
    await gateway.$executeRawUnsafe(`UPDATE MenuCampaign SET status = ? WHERE id = ?`, status, id);
    return { success: true, status };
  }

  async delete(tenantId: string, id: number) {
    const { gateway } = await this.getClients(tenantId);
    await this.ensureSchema(gateway, tenantId);
    const existing: any[] = await gateway.$queryRawUnsafe(`SELECT id, status FROM MenuCampaign WHERE id = ?`, id);
    if (!existing.length) throw new NotFoundException('Campaign không tồn tại');
    if (existing[0].status !== 'DRAFT') throw new BadRequestException('Chỉ xoá được campaign DRAFT');
    await gateway.$executeRawUnsafe(`DELETE FROM MenuCampaign WHERE id = ?`, id);
    return { success: true };
  }
}
