-- Add REDEMPTION to UserStarHistory type enum
ALTER TABLE `UserStarHistory` MODIFY COLUMN `type` ENUM('CHECK_IN','MISSION','REWARD','GAME','RETURN_GIFT','GIFT_ROUND','FEEDBACK','BATTLE_PASS','REDEMPTION');

-- CreateTable PromotionReward
CREATE TABLE IF NOT EXISTS `PromotionReward` (
    `id`           INT          NOT NULL AUTO_INCREMENT,
    `name`         VARCHAR(100) NOT NULL,
    `description`  VARCHAR(500) NULL,
    `type`         ENUM('PLAY_TIME','FOOD','DRINK','VOUCHER','OTHER') NOT NULL,
    `starsCost`    INT          NOT NULL,
    `walletType`   VARCHAR(10)  NULL,
    `moneyAmount`  INT          NULL,
    `imageUrl`     VARCHAR(500) NULL,
    `isActive`     BOOLEAN      NOT NULL DEFAULT true,
    `displayOrder` INT          NOT NULL DEFAULT 0,
    `maxPerDay`    INT          NULL,
    `maxPerMonth`  INT          NULL,
    `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `PromotionReward_type_idx`(`type`),
    INDEX `PromotionReward_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable PromotionRewardRecipe
CREATE TABLE IF NOT EXISTS `PromotionRewardRecipe` (
    `id`                INT NOT NULL AUTO_INCREMENT,
    `promotionRewardId` INT NOT NULL,
    `recipeId`          INT NOT NULL,
    `quantity`          INT NOT NULL DEFAULT 1,

    UNIQUE KEY `uq_reward_recipe` (`promotionRewardId`, `recipeId`),
    INDEX `PromotionRewardRecipe_promotionRewardId_idx`(`promotionRewardId`),
    INDEX `PromotionRewardRecipe_recipeId_idx`(`recipeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable PromotionRewardCategory
CREATE TABLE IF NOT EXISTS `PromotionRewardCategory` (
    `id`                INT NOT NULL AUTO_INCREMENT,
    `promotionRewardId` INT NOT NULL,
    `categoryId`        INT NOT NULL,

    UNIQUE KEY `uq_reward_category` (`promotionRewardId`, `categoryId`),
    INDEX `PromotionRewardCategory_promotionRewardId_idx`(`promotionRewardId`),
    INDEX `PromotionRewardCategory_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable PromotionRewardRedemption
CREATE TABLE IF NOT EXISTS `PromotionRewardRedemption` (
    `id`                INT          NOT NULL AUTO_INCREMENT,
    `userId`            INT          NOT NULL,
    `promotionRewardId` INT          NOT NULL,
    `starsCost`         INT          NOT NULL,
    `status`            ENUM('PENDING','APPROVED','COMPLETED','REJECTED') NOT NULL DEFAULT 'PENDING',
    `rewardType`        ENUM('PLAY_TIME','FOOD','DRINK','VOUCHER','OTHER') NOT NULL,
    `chosenRecipeId`    INT          NULL,
    `chosenQuantity`    INT          NULL DEFAULT 1,
    `walletType`        VARCHAR(10)  NULL,
    `moneyAmount`       INT          NULL,
    `actualCost`        DECIMAL(12,2) NULL,
    `workShiftId`       INT          NULL,
    `approvedBy`        INT          NULL,
    `note`              VARCHAR(500) NULL,
    `createdAt`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `PromotionRewardRedemption_userId_idx`(`userId`),
    INDEX `PromotionRewardRedemption_status_idx`(`status`),
    INDEX `PromotionRewardRedemption_rewardType_idx`(`rewardType`),
    INDEX `PromotionRewardRedemption_createdAt_idx`(`createdAt`),
    INDEX `PromotionRewardRedemption_workShiftId_idx`(`workShiftId`),
    INDEX `PromotionRewardRedemption_promotionRewardId_idx`(`promotionRewardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
