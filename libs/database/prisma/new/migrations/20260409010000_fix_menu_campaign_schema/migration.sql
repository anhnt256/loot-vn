-- Fix Menu Campaign schema: camelCase columns + tenantId VARCHAR(100)
-- Safe to run: feature mới, chưa có data production

-- 1. Drop old tables (child tables first due to FK)
DROP TABLE IF EXISTS `MenuCampaignAnalytics`;
DROP TABLE IF EXISTS `MenuCampaignUsage`;
DROP TABLE IF EXISTS `MenuCampaignComboRule`;
DROP TABLE IF EXISTS `MenuCampaignTimeSlot`;
DROP TABLE IF EXISTS `MenuCampaignCustomerScope`;
DROP TABLE IF EXISTS `MenuCampaignMenuScope`;
DROP TABLE IF EXISTS `MenuCampaign`;

-- 2. Drop FoodOrder columns added by mistake (not managed by Prisma)
ALTER TABLE `FoodOrder` DROP COLUMN IF EXISTS `campaign_id`;
ALTER TABLE `FoodOrder` DROP COLUMN IF EXISTS `discount_amount`;

-- 3. Recreate with correct schema: camelCase + tenantId VARCHAR
CREATE TABLE `MenuCampaign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'BUDGET_EXCEEDED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `discountType` ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'FLAT_PRICE', 'COMBO_DEAL') NOT NULL,
    `discountValue` DECIMAL(10, 2) NOT NULL,
    `maxDiscountAmount` INTEGER NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `totalBudget` INTEGER NULL,
    `spentBudget` INTEGER NOT NULL DEFAULT 0,
    `totalUsageCount` INTEGER NOT NULL DEFAULT 0,
    `maxUsesPerUserPerCampaign` INTEGER NULL,
    `maxUsesPerUserPerDay` INTEGER NULL,
    `minOrderValue` INTEGER NULL,
    `priority` INTEGER NOT NULL DEFAULT 1,
    `testGroup` VARCHAR(10) NULL,
    `requiredBpLevel` INTEGER NULL,
    `requiredBpSeasonId` INTEGER NULL,
    `newMemberDaysThreshold` INTEGER NULL,
    `createdBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `MenuCampaign_tenantId_idx`(`tenantId`),
    INDEX `MenuCampaign_status_idx`(`status`),
    INDEX `MenuCampaign_startDate_idx`(`startDate`),
    INDEX `MenuCampaign_endDate_idx`(`endDate`),
    INDEX `MenuCampaign_testGroup_idx`(`testGroup`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MenuCampaignMenuScope` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignId` INTEGER NOT NULL,
    `scopeType` ENUM('ALL', 'CATEGORY', 'RECIPE') NOT NULL,
    `targetId` INTEGER NULL,

    INDEX `MenuCampaignMenuScope_campaignId_idx`(`campaignId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_menu_scope_campaign` FOREIGN KEY (`campaignId`) REFERENCES `MenuCampaign`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MenuCampaignCustomerScope` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignId` INTEGER NOT NULL,
    `scopeType` ENUM('ALL_CUSTOMERS', 'RANK', 'MACHINE_GROUP', 'SPECIFIC_USER', 'NEW_MEMBER') NOT NULL,
    `targetId` INTEGER NULL,

    INDEX `MenuCampaignCustomerScope_campaignId_idx`(`campaignId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_customer_scope_campaign` FOREIGN KEY (`campaignId`) REFERENCES `MenuCampaign`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MenuCampaignTimeSlot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignId` INTEGER NOT NULL,
    `dayOfWeek` INTEGER NULL,
    `startTime` VARCHAR(5) NOT NULL,
    `endTime` VARCHAR(5) NOT NULL,

    INDEX `MenuCampaignTimeSlot_campaignId_idx`(`campaignId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_time_slot_campaign` FOREIGN KEY (`campaignId`) REFERENCES `MenuCampaign`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MenuCampaignComboRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `minQuantity` INTEGER NOT NULL DEFAULT 1,

    INDEX `MenuCampaignComboRule_campaignId_idx`(`campaignId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_combo_rule_campaign` FOREIGN KEY (`campaignId`) REFERENCES `MenuCampaign`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MenuCampaignUsage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,
    `discountAmount` DECIMAL(10, 0) NOT NULL,
    `appliedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MenuCampaignUsage_campaignId_idx`(`campaignId`),
    INDEX `MenuCampaignUsage_userId_idx`(`userId`),
    INDEX `MenuCampaignUsage_orderId_idx`(`orderId`),
    INDEX `MenuCampaignUsage_appliedAt_idx`(`appliedAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_usage_campaign` FOREIGN KEY (`campaignId`) REFERENCES `MenuCampaign`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MenuCampaignAnalytics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaignId` INTEGER NOT NULL,
    `snapshotDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `totalUsages` INTEGER NOT NULL DEFAULT 0,
    `uniqueUsers` INTEGER NOT NULL DEFAULT 0,
    `totalDiscountGiven` DECIMAL(12, 0) NOT NULL DEFAULT 0,
    `totalRevenueGenerated` DECIMAL(12, 0) NOT NULL DEFAULT 0,
    `averageOrderValue` DECIMAL(10, 0) NULL,
    `conversionRate` DOUBLE NULL,

    INDEX `MenuCampaignAnalytics_campaignId_idx`(`campaignId`),
    INDEX `MenuCampaignAnalytics_snapshotDate_idx`(`snapshotDate`),
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_analytics_campaign` FOREIGN KEY (`campaignId`) REFERENCES `MenuCampaign`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Add campaignId + discountAmount to FoodOrder (safe: skip if already exists)
-- Note: ensureSchema may have added these columns with different names before
ALTER TABLE `FoodOrder` DROP COLUMN IF EXISTS `campaign_id`;
ALTER TABLE `FoodOrder` DROP COLUMN IF EXISTS `discount_amount`;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'FoodOrder' AND COLUMN_NAME = 'campaignId');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `FoodOrder` ADD COLUMN `campaignId` INTEGER NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'FoodOrder' AND COLUMN_NAME = 'discountAmount');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `FoodOrder` ADD COLUMN `discountAmount` DECIMAL(10, 0) NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
