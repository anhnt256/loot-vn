-- Add rootDomain (camelCase) to Organization. Run this if the column does not exist yet.
-- If you already have root_domain, run instead: ALTER TABLE `Organization` CHANGE COLUMN `root_domain` `rootDomain` VARCHAR(255) NULL;
ALTER TABLE `Organization` ADD COLUMN `rootDomain` VARCHAR(255) NULL;
