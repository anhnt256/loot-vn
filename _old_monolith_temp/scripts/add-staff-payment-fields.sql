-- Add payment fields to Staff table
-- Run this manually on your database

ALTER TABLE `Staff` 
ADD COLUMN `bankAccountName` VARCHAR(255) NULL AFTER `needCheckMacAddress`,
ADD COLUMN `bankAccountNumber` VARCHAR(50) NULL AFTER `bankAccountName`,
ADD COLUMN `bankName` VARCHAR(255) NULL AFTER `bankAccountNumber`;

