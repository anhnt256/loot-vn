-- AlterTable
ALTER TABLE `ScheduleTask` ADD COLUMN `repeatInterval` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `ScheduleTask` ADD COLUMN `repeatMaxTimes` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `ScheduleTaskLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taskId` INTEGER NOT NULL,
    `notifiedAt` DATETIME(3) NOT NULL,
    `acknowledgedAt` DATETIME(3) NULL,
    `repeatCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `ScheduleTaskLog_taskId_idx`(`taskId`),
    INDEX `ScheduleTaskLog_notifiedAt_idx`(`notifiedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScheduleTaskLog` ADD CONSTRAINT `ScheduleTaskLog_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `ScheduleTask`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
