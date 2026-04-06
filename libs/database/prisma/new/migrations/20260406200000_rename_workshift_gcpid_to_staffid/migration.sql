-- Rename gcp_id to staff_id and convert from VARCHAR to INT
ALTER TABLE `WorkShift`
  ADD COLUMN `staff_id` INT NULL AFTER `ffood_id`;

UPDATE `WorkShift`
  SET `staff_id` = CAST(`gcp_id` AS UNSIGNED)
  WHERE `gcp_id` IS NOT NULL AND `gcp_id` REGEXP '^[0-9]+$';

ALTER TABLE `WorkShift`
  DROP COLUMN `gcp_id`;
