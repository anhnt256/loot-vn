-- Refactor FnetHistory table to use separate columns for MAIN and SUB money
-- This allows tracking both wallet types in a single record

-- Step 1: Add new columns
ALTER TABLE `FnetHistory` 
ADD COLUMN `oldMainMoney` FLOAT NULL AFTER `moneyType`,
ADD COLUMN `newMainMoney` FLOAT NULL AFTER `oldMainMoney`;

-- Step 2: Rename oldMoney/newMoney to oldSubMoney/newSubMoney
ALTER TABLE `FnetHistory` 
CHANGE COLUMN `oldMoney` `oldSubMoney` FLOAT NOT NULL,
CHANGE COLUMN `newMoney` `newSubMoney` FLOAT NOT NULL;

-- Step 3: Migrate existing data (optional - if you have existing data)
-- Assuming all existing records are SUB type
-- UPDATE `FnetHistory` 
-- SET `oldMainMoney` = 0, `newMainMoney` = 0 
-- WHERE `oldMainMoney` IS NULL;

-- Step 4: Verify the structure
-- DESCRIBE `FnetHistory`;

