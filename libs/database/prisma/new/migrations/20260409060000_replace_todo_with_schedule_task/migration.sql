-- DropTable
DROP TABLE IF EXISTS `TodoTask`;

-- CreateTable
CREATE TABLE `ScheduleTask` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(500) NOT NULL,
    `description` TEXT NULL,
    `startTime` VARCHAR(5) NOT NULL,
    `daysOfWeek` JSON NOT NULL,
    `assigneeId` INTEGER NOT NULL,
    `createdById` INTEGER NOT NULL,
    `color` VARCHAR(20) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ScheduleTask_assigneeId_idx`(`assigneeId`),
    INDEX `ScheduleTask_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScheduleTask` ADD CONSTRAINT `ScheduleTask_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleTask` ADD CONSTRAINT `ScheduleTask_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `Staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
