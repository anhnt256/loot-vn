-- Ensure all Phase 3 Event Promotion tables exist
-- Safe: CREATE TABLE IF NOT EXISTS

CREATE TABLE IF NOT EXISTS `EventTargetRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` VARCHAR(191) NOT NULL,
    `type` ENUM('RANK', 'MIN_TOTAL_PAYMENT', 'ZONE', 'SPECIFIC_USER') NOT NULL,
    `operator` VARCHAR(10) NOT NULL,
    `value` VARCHAR(500) NOT NULL,
    INDEX `EventTargetRule_eventId_idx`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `EventPromotion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `priority` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX `EventPromotion_eventId_idx`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `PromotionCondition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `promotionId` INTEGER NOT NULL,
    `triggerAction` ENUM('TOPUP', 'ORDER_FOOD', 'PLAY_TIME', 'TOTAL_SPEND') NOT NULL,
    `operator` VARCHAR(10) NOT NULL,
    `value` DOUBLE NOT NULL,
    INDEX `PromotionCondition_promotionId_idx`(`promotionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `PromotionRewardBundle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `promotionId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    INDEX `PromotionRewardBundle_promotionId_idx`(`promotionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `PromotionRewardItem` (
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

CREATE TABLE IF NOT EXISTS `CouponBatch` (
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
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX `CouponBatch_promotionId_idx`(`promotionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CouponCode` (
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

CREATE TABLE IF NOT EXISTS `EventAnalytics` (
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
