-- Migration for Handover Reports
-- Add new enums and tables for handover reporting system

-- Add new enum values for HandoverReportType
ALTER TABLE `HandoverReport` MODIFY COLUMN `reportType` ENUM('BAO_CAO_BEP', 'BAO_CAO_NUOC') NOT NULL;

-- Add new enum values for MaterialType  
ALTER TABLE `HandoverMaterial` MODIFY COLUMN `materialType` ENUM('NGUYEN_VAT_LIEU', 'NUOC_UONG') NOT NULL;

-- Create HandoverReport table
CREATE TABLE IF NOT EXISTS `HandoverReport` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date` DATETIME(3) NOT NULL,
  `shift` ENUM('SANG', 'CHIEU', 'TOI') NOT NULL,
  `reportType` ENUM('BAO_CAO_BEP', 'BAO_CAO_NUOC') NOT NULL,
  `branch` VARCHAR(191) NOT NULL DEFAULT 'GO_VAP',
  `staffId` INT NOT NULL,
  `note` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `HandoverReport_date_shift_reportType_idx` (`date`, `shift`, `reportType`),
  INDEX `HandoverReport_staffId_idx` (`staffId`),
  CONSTRAINT `HandoverReport_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create HandoverMaterial table
CREATE TABLE IF NOT EXISTS `HandoverMaterial` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `handoverReportId` INT NOT NULL,
  `materialName` VARCHAR(191) NOT NULL,
  `materialType` ENUM('NGUYEN_VAT_LIEU', 'NUOC_UONG') NOT NULL,
  `morningBeginning` DOUBLE NOT NULL DEFAULT 0,
  `morningReceived` DOUBLE NOT NULL DEFAULT 0,
  `morningIssued` DOUBLE NOT NULL DEFAULT 0,
  `morningEnding` DOUBLE NOT NULL DEFAULT 0,
  `afternoonBeginning` DOUBLE NOT NULL DEFAULT 0,
  `afternoonReceived` DOUBLE NOT NULL DEFAULT 0,
  `afternoonIssued` DOUBLE NOT NULL DEFAULT 0,
  `afternoonEnding` DOUBLE NOT NULL DEFAULT 0,
  `eveningBeginning` DOUBLE NOT NULL DEFAULT 0,
  `eveningReceived` DOUBLE NOT NULL DEFAULT 0,
  `eveningIssued` DOUBLE NOT NULL DEFAULT 0,
  `eveningEnding` DOUBLE NOT NULL DEFAULT 0,
  `morningAfterConfirmation` DOUBLE NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `HandoverMaterial_handoverReportId_idx` (`handoverReportId`),
  INDEX `HandoverMaterial_materialName_idx` (`materialName`),
  CONSTRAINT `HandoverMaterial_handoverReportId_fkey` FOREIGN KEY (`handoverReportId`) REFERENCES `HandoverReport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add indexes for better performance
CREATE INDEX `HandoverReport_branch_idx` ON `HandoverReport`(`branch`);
CREATE INDEX `HandoverMaterial_materialType_idx` ON `HandoverMaterial`(`materialType`); 