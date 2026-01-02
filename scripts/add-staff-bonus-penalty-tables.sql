-- Update StaffBonus table and add StaffPenalty table
-- Run this manually on your database

-- Update StaffBonus table to add new fields
ALTER TABLE `StaffBonus` 
ADD COLUMN IF NOT EXISTS `description` TEXT NULL AFTER `reason`,
ADD COLUMN IF NOT EXISTS `imageUrl` VARCHAR(500) NULL AFTER `description`,
ADD COLUMN IF NOT EXISTS `note` TEXT NULL AFTER `imageUrl`,
ADD COLUMN IF NOT EXISTS `rewardDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `note`;

-- Add index for rewardDate if not exists
CREATE INDEX IF NOT EXISTS `idx_rewardDate` ON `StaffBonus` (`rewardDate`);

-- StaffPenalty table
CREATE TABLE IF NOT EXISTS `StaffPenalty` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `staffId` INT NOT NULL,
  `amount` FLOAT NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `imageUrl` VARCHAR(500) NULL,
  `note` TEXT NULL,
  `penaltyDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_staffId` (`staffId`),
  INDEX `idx_penaltyDate` (`penaltyDate`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`staffId`) REFERENCES `Staff`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

