-- AlterTable
ALTER TABLE `MenuCategory`
  ADD COLUMN `scheduleEnabled` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `scheduleTimeStart` VARCHAR(5) NULL,
  ADD COLUMN `scheduleTimeEnd` VARCHAR(5) NULL,
  ADD COLUMN `scheduleDateStart` DATETIME(3) NULL,
  ADD COLUMN `scheduleDateEnd` DATETIME(3) NULL,
  ADD COLUMN `scheduleMachineGroupIds` TEXT NULL;
