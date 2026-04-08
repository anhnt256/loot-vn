-- Phase 3: Event Promotion System + Sync all pending schema changes
-- Production-safe migration

-- ===== 1. FIX: FoodOrder missing columns (blocking error) =====

ALTER TABLE `FoodOrder`
    ADD COLUMN `campaign_id` INTEGER NULL,
    ADD COLUMN `discount_amount` DECIMAL(10, 0) NULL DEFAULT 0;

-- ===== 2. CREATE: MenuCampaign system (was in schema but not in DB) =====

CREATE TABLE IF NOT EXISTS `MenuCampaign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'BUDGET_EXCEEDED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `discountType` ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'FLAT_PRICE', 'COMBO_DEAL') NOT NULL,
    `discountValue` DECIMAL(10, 2) NOT NULL,
    `max_discount_amount` INTEGER NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `total_budget` INTEGER NULL,
    `spent_budget` INTEGER NOT NULL DEFAULT 0,
    `total_usage_count` INTEGER NOT NULL DEFAULT 0,
    `max_uses_per_user_campaign` INTEGER NULL,
    `max_uses_per_user_day` INTEGER NULL,
    `min_order_value` INTEGER NULL,
    `priority` INTEGER NOT NULL DEFAULT 1,
    `test_group` VARCHAR(10) NULL,
    `required_bp_level` INTEGER NULL,
    `required_bp_season_id` INTEGER NULL,
    `new_member_days_threshold` INTEGER NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `MenuCampaign_tenant_id_idx`(`tenant_id`),
    INDEX `MenuCampaign_status_idx`(`status`),
    INDEX `MenuCampaign_start_date_idx`(`start_date`),
    INDEX `MenuCampaign_end_date_idx`(`end_date`),
    INDEX `MenuCampaign_test_group_idx`(`test_group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `MenuCampaignMenuScope` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaign_id` INTEGER NOT NULL,
    `scopeType` ENUM('ALL', 'CATEGORY', 'RECIPE') NOT NULL,
    `target_id` INTEGER NULL,

    INDEX `MenuCampaignMenuScope_campaign_id_idx`(`campaign_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `MenuCampaignCustomerScope` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaign_id` INTEGER NOT NULL,
    `scopeType` ENUM('ALL_CUSTOMERS', 'RANK', 'MACHINE_GROUP', 'SPECIFIC_USER', 'NEW_MEMBER') NOT NULL,
    `target_id` INTEGER NULL,

    INDEX `MenuCampaignCustomerScope_campaign_id_idx`(`campaign_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `MenuCampaignTimeSlot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaign_id` INTEGER NOT NULL,
    `day_of_week` INTEGER NULL,
    `start_time` VARCHAR(5) NOT NULL,
    `end_time` VARCHAR(5) NOT NULL,

    INDEX `MenuCampaignTimeSlot_campaign_id_idx`(`campaign_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `MenuCampaignComboRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaign_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `min_quantity` INTEGER NOT NULL DEFAULT 1,

    INDEX `MenuCampaignComboRule_campaign_id_idx`(`campaign_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `MenuCampaignUsage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaign_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `order_id` INTEGER NOT NULL,
    `discount_amount` DECIMAL(10, 0) NOT NULL,
    `applied_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MenuCampaignUsage_campaign_id_idx`(`campaign_id`),
    INDEX `MenuCampaignUsage_user_id_idx`(`user_id`),
    INDEX `MenuCampaignUsage_order_id_idx`(`order_id`),
    INDEX `MenuCampaignUsage_applied_at_idx`(`applied_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `MenuCampaignAnalytics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaign_id` INTEGER NOT NULL,
    `snapshot_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total_usages` INTEGER NOT NULL DEFAULT 0,
    `unique_users` INTEGER NOT NULL DEFAULT 0,
    `total_discount_given` DECIMAL(12, 0) NOT NULL DEFAULT 0,
    `total_revenue_generated` DECIMAL(12, 0) NOT NULL DEFAULT 0,
    `average_order_value` DECIMAL(10, 0) NULL,
    `conversion_rate` DOUBLE NULL,

    INDEX `MenuCampaignAnalytics_campaign_id_idx`(`campaign_id`),
    INDEX `MenuCampaignAnalytics_snapshot_date_idx`(`snapshot_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ===== 3. CREATE: Event Promotion System (Phase 3) =====

CREATE TABLE `EventTargetRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` VARCHAR(191) NOT NULL,
    `type` ENUM('RANK', 'MIN_TOTAL_PAYMENT', 'ZONE', 'SPECIFIC_USER') NOT NULL,
    `operator` VARCHAR(10) NOT NULL,
    `value` VARCHAR(500) NOT NULL,

    INDEX `EventTargetRule_eventId_idx`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `EventPromotion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `priority` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EventPromotion_eventId_idx`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PromotionCondition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `promotionId` INTEGER NOT NULL,
    `triggerAction` ENUM('TOPUP', 'ORDER_FOOD', 'PLAY_TIME', 'TOTAL_SPEND') NOT NULL,
    `operator` VARCHAR(10) NOT NULL,
    `value` DOUBLE NOT NULL,

    INDEX `PromotionCondition_promotionId_idx`(`promotionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PromotionRewardBundle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `promotionId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    INDEX `PromotionRewardBundle_promotionId_idx`(`promotionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PromotionRewardItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bundleId` INTEGER NOT NULL,
    `rewardType` ENUM('BONUS_PERCENT', 'TOPUP_FIXED', 'SPIN_TURNS', 'FREE_DRINK', 'FREE_FOOD', 'COUPON') NOT NULL,
    `value` DOUBLE NOT NULL,
    `walletType` VARCHAR(10) NULL,
    `maxValue` INTEGER NULL,
    `metadata` TEXT NULL,

    INDEX `PromotionRewardItem_bundleId_idx`(`bundleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CouponBatch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `promotionId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `discountType` ENUM('PERCENT', 'FIXED') NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `maxDiscountValue` INTEGER NULL,
    `totalCodes` INTEGER NOT NULL,
    `validDays` INTEGER NULL,
    `validFrom` DATETIME(3) NULL,
    `validTo` DATETIME(3) NULL,
    `usageFrequency` ENUM('PER_WEEK', 'PER_MONTH', 'PER_EVENT', 'ONE_TIME') NOT NULL,
    `maxUsagePerUser` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CouponBatch_promotionId_idx`(`promotionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CouponCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batchId` INTEGER NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `usedBy` INTEGER NULL,
    `usedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CouponCode_code_key`(`code`),
    INDEX `CouponCode_batchId_idx`(`batchId`),
    INDEX `CouponCode_code_idx`(`code`),
    INDEX `CouponCode_usedBy_idx`(`usedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `EventAnalytics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` VARCHAR(191) NOT NULL,
    `snapshotDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `totalEligible` INTEGER NOT NULL DEFAULT 0,
    `totalParticipants` INTEGER NOT NULL DEFAULT 0,
    `totalRewardsClaimed` INTEGER NOT NULL DEFAULT 0,
    `totalCouponsIssued` INTEGER NOT NULL DEFAULT 0,
    `totalCouponsUsed` INTEGER NOT NULL DEFAULT 0,
    `totalRevenue` DECIMAL(12, 0) NOT NULL DEFAULT 0,
    `totalRewardCost` DECIMAL(12, 0) NOT NULL DEFAULT 0,
    `conversionRate` DOUBLE NULL,
    `revenueBeforeEvent` DECIMAL(12, 0) NULL,

    INDEX `EventAnalytics_eventId_idx`(`eventId`),
    INDEX `EventAnalytics_snapshotDate_idx`(`snapshotDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ===== 4. DROP deprecated Event tables =====

DROP TABLE IF EXISTS `EventReport`;
DROP TABLE IF EXISTS `EventReward`;

-- ===== 5. CLEAN UP Event table (remove old columns) =====

ALTER TABLE `Event`
    DROP COLUMN IF EXISTS `approvedAt`,
    DROP COLUMN IF EXISTS `approvedBy`,
    DROP COLUMN IF EXISTS `conditions`,
    DROP COLUMN IF EXISTS `expectedParticipants`,
    DROP COLUMN IF EXISTS `generateCodesAhead`,
    DROP COLUMN IF EXISTS `registrationEnd`,
    DROP COLUMN IF EXISTS `registrationStart`,
    DROP COLUMN IF EXISTS `rules`,
    DROP COLUMN IF EXISTS `targetAudience`,
    DROP COLUMN IF EXISTS `totalCodesGenerated`,
    DROP COLUMN IF EXISTS `totalCodesUsed`,
    DROP COLUMN IF EXISTS `totalParticipants`,
    DROP COLUMN IF EXISTS `totalRewardsDistributed`;

-- ===== 6. MINOR: Alter defaults & add indexes (safe) =====

ALTER TABLE `ChatLastSeen` MODIFY `updatedAt` DATETIME(3) NOT NULL;
ALTER TABLE `FoodOrder` ALTER COLUMN `updatedAt` DROP DEFAULT;

ALTER TABLE `PromotionReward`
    MODIFY `isActive` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `displayOrder` INTEGER NOT NULL DEFAULT 0,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL;

ALTER TABLE `PromotionRewardRecipe` MODIFY `quantity` INTEGER NOT NULL DEFAULT 1;

ALTER TABLE `PromotionRewardRedemption`
    MODIFY `status` ENUM('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL;

CREATE INDEX `PromotionReward_type_idx` ON `PromotionReward`(`type`);
CREATE INDEX `PromotionReward_isActive_idx` ON `PromotionReward`(`isActive`);
