-- AlterTable
ALTER TABLE `User` ADD COLUMN `totalFoodPayment` FLOAT NULL,
    ADD COLUMN `totalSpend` FLOAT NULL,
    ADD COLUMN `lastLogin` DATETIME(3) NULL;
