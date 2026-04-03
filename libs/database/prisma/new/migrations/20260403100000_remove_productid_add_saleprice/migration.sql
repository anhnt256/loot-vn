-- AlterTable: Add salePrice, remove productId from Recipe
ALTER TABLE `Recipe` ADD COLUMN `salePrice` DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE `Recipe` DROP COLUMN `productId`;
