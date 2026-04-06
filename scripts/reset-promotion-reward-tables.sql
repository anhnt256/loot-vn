-- Script: Reset PromotionReward tables
-- Run this when tables exist with wrong schema (e.g. missing columns)
-- WARNING: This will DELETE all existing data in these tables

DROP TABLE IF EXISTS PromotionRewardRedemption;
DROP TABLE IF EXISTS PromotionRewardCategory;
DROP TABLE IF EXISTS PromotionRewardRecipe;
DROP TABLE IF EXISTS PromotionReward;

CREATE TABLE PromotionReward (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    type ENUM('PLAY_TIME','FOOD','DRINK','VOUCHER','OTHER') NOT NULL,
    starsCost INT NOT NULL,
    walletType VARCHAR(10),
    moneyAmount INT,
    imageUrl VARCHAR(500),
    isActive BOOLEAN DEFAULT true,
    displayOrder INT DEFAULT 0,
    maxPerDay INT,
    maxPerMonth INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE PromotionRewardRecipe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    promotionRewardId INT NOT NULL,
    recipeId INT NOT NULL,
    quantity INT DEFAULT 1,
    UNIQUE KEY uq_reward_recipe (promotionRewardId, recipeId),
    INDEX idx_reward (promotionRewardId),
    INDEX idx_recipe (recipeId)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE PromotionRewardCategory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    promotionRewardId INT NOT NULL,
    categoryId INT NOT NULL,
    UNIQUE KEY uq_reward_category (promotionRewardId, categoryId),
    INDEX idx_reward (promotionRewardId),
    INDEX idx_category (categoryId)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE PromotionRewardRedemption (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    promotionRewardId INT NOT NULL,
    starsCost INT NOT NULL,
    status ENUM('PENDING','APPROVED','COMPLETED','REJECTED') DEFAULT 'PENDING',
    rewardType ENUM('PLAY_TIME','FOOD','DRINK','VOUCHER','OTHER') NOT NULL,
    chosenRecipeId INT,
    chosenQuantity INT DEFAULT 1,
    walletType VARCHAR(10),
    moneyAmount INT,
    actualCost DECIMAL(12,2),
    workShiftId INT,
    approvedBy INT,
    note VARCHAR(500),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    INDEX idx_rewardType (rewardType),
    INDEX idx_createdAt (createdAt),
    INDEX idx_workShiftId (workShiftId),
    INDEX idx_promotionRewardId (promotionRewardId)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
