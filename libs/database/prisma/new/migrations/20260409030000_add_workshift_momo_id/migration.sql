-- AlterTable
ALTER TABLE `WorkShift` ADD COLUMN `momo_id` VARCHAR(100) NULL;

-- AlterTable: Change merchant_id from INT to VARCHAR(100)
ALTER TABLE `MomoCredential` MODIFY COLUMN `merchant_id` VARCHAR(100) NULL;
