-- Add baseSalary column to Staff table
-- Run this manually on your database

ALTER TABLE `Staff` 
ADD COLUMN IF NOT EXISTS `baseSalary` FLOAT NOT NULL DEFAULT 0 AFTER `bankName`;

