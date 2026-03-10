-- Add StaffTimeTracking, StaffSalary, and StaffBonus tables
-- Run this manually on your database

-- StaffTimeTracking table
CREATE TABLE IF NOT EXISTS `StaffTimeTracking` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `staffId` INT NOT NULL,
  `checkInTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `checkOutTime` DATETIME NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_staffId` (`staffId`),
  INDEX `idx_checkInTime` (`checkInTime`),
  FOREIGN KEY (`staffId`) REFERENCES `Staff`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add baseSalary column to Staff table
ALTER TABLE `Staff` 
ADD COLUMN IF NOT EXISTS `baseSalary` FLOAT NOT NULL DEFAULT 0 AFTER `bankName`;

-- StaffSalary table
CREATE TABLE IF NOT EXISTS `StaffSalary` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `staffId` INT NOT NULL,
  `month` INT NOT NULL,
  `year` INT NOT NULL,
  `totalHours` FLOAT NOT NULL DEFAULT 0,
  `hourlySalary` FLOAT NOT NULL DEFAULT 0,
  `salaryFromHours` FLOAT NOT NULL DEFAULT 0 COMMENT 'A: Số giờ làm * lương = tổng lương',
  `advance` FLOAT NOT NULL DEFAULT 0 COMMENT 'B: Tạm ứng',
  `bonus` FLOAT NOT NULL DEFAULT 0 COMMENT 'C: Thưởng',
  `penalty` FLOAT NOT NULL DEFAULT 0 COMMENT 'D: Phạt',
  `total` FLOAT NOT NULL DEFAULT 0 COMMENT 'Tổng thu nhập = A + C - B - D',
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `paidAt` DATETIME NULL,
  `note` TEXT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_staffId` (`staffId`),
  INDEX `idx_year_month` (`year`, `month`),
  FOREIGN KEY (`staffId`) REFERENCES `Staff`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- StaffBonus table
CREATE TABLE IF NOT EXISTS `StaffBonus` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `staffId` INT NOT NULL,
  `amount` FLOAT NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_staffId` (`staffId`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`staffId`) REFERENCES `Staff`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

