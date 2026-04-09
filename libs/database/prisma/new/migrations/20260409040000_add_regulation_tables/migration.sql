-- CreateTable
CREATE TABLE `Regulation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `version` INTEGER NOT NULL DEFAULT 1,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdBy` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Regulation_version_idx`(`version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegulationAcknowledgment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `regulationId` INTEGER NOT NULL,
    `staffId` INTEGER NOT NULL,
    `acknowledgedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RegulationAcknowledgment_regulationId_idx`(`regulationId`),
    INDEX `RegulationAcknowledgment_staffId_idx`(`staffId`),
    UNIQUE INDEX `RegulationAcknowledgment_regulationId_staffId_key`(`regulationId`, `staffId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RegulationAcknowledgment` ADD CONSTRAINT `RegulationAcknowledgment_regulationId_fkey` FOREIGN KEY (`regulationId`) REFERENCES `Regulation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegulationAcknowledgment` ADD CONSTRAINT `RegulationAcknowledgment_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staff`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
