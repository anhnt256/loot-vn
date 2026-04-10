-- Convert WorkShift.startTime and endTime from TIME(0) to VARCHAR(5)
-- Existing TIME values like "18:30:00" will be converted to "18:30"

-- Step 1: Add temp columns
ALTER TABLE `WorkShift` ADD COLUMN `startTime_tmp` VARCHAR(5) NOT NULL DEFAULT '00:00';
ALTER TABLE `WorkShift` ADD COLUMN `endTime_tmp` VARCHAR(5) NOT NULL DEFAULT '00:00';

-- Step 2: Copy data with HH:mm format
UPDATE `WorkShift` SET `startTime_tmp` = DATE_FORMAT(`startTime`, '%H:%i'), `endTime_tmp` = DATE_FORMAT(`endTime`, '%H:%i');

-- Step 3: Drop old columns and rename
ALTER TABLE `WorkShift` DROP COLUMN `startTime`;
ALTER TABLE `WorkShift` DROP COLUMN `endTime`;
ALTER TABLE `WorkShift` CHANGE COLUMN `startTime_tmp` `startTime` VARCHAR(5) NOT NULL;
ALTER TABLE `WorkShift` CHANGE COLUMN `endTime_tmp` `endTime` VARCHAR(5) NOT NULL;
