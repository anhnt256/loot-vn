-- AlterTable Recipe: add secondaryCategoryIds for multi-category support
-- JSON array of additional category IDs, e.g. [2,5]
ALTER TABLE `Recipe` ADD COLUMN `secondaryCategoryIds` TEXT NULL;
