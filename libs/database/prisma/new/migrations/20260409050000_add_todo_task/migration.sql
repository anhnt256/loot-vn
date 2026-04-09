-- CreateTable
CREATE TABLE `TodoTask` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(500) NOT NULL,
    `description` TEXT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `dueDate` DATETIME(3) NULL,
    `remindAt` DATETIME(3) NULL,
    `createdById` INTEGER NOT NULL,
    `assigneeId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,

    INDEX `TodoTask_assigneeId_idx`(`assigneeId`),
    INDEX `TodoTask_createdById_idx`(`createdById`),
    INDEX `TodoTask_status_idx`(`status`),
    INDEX `TodoTask_dueDate_idx`(`dueDate`),
    INDEX `TodoTask_remindAt_idx`(`remindAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TodoTask` ADD CONSTRAINT `TodoTask_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TodoTask` ADD CONSTRAINT `TodoTask_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `Staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
