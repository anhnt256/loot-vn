-- AlterTable: Computer - add macAddress column
ALTER TABLE `Computer` ADD COLUMN `macAddress` VARCHAR(50) NULL;

-- AlterTable: User - change PK from `id` to `userId`
-- Step 1: Drop foreign key-like indexes referencing User.id (Prisma relation mode)
-- Step 2: Drop old auto-increment primary key
-- Step 3: Make userId the new primary key
-- Step 4: Drop the old `id` column

-- Drop the old primary key (id auto_increment)
ALTER TABLE `User` MODIFY COLUMN `id` INT NOT NULL;
ALTER TABLE `User` DROP PRIMARY KEY;

-- Set userId as the new primary key
ALTER TABLE `User` ADD PRIMARY KEY (`userId`);

-- Drop the old id column
ALTER TABLE `User` DROP COLUMN `id`;
