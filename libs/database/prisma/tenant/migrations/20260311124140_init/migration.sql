-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdBy` CHAR(36) NULL,
    `updatedAt` TIMESTAMP(0) NOT NULL,
    `updatedBy` CHAR(36) NULL,
    `deletedAt` TIMESTAMP(0) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    INDEX `users_username_idx`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
