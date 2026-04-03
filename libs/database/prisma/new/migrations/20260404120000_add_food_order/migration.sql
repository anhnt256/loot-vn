-- CreateTable FoodOrder
CREATE TABLE IF NOT EXISTS `FoodOrder` (
    `id`           INT           NOT NULL AUTO_INCREMENT,
    `userId`       INT           NOT NULL,
    `macAddress`   VARCHAR(100)  NOT NULL COMMENT 'Định danh máy ổn định, không đổi theo tên/IP',
    `computerName` VARCHAR(100)  NULL     COMMENT 'Tên hiển thị, có thể thay đổi',
    `tenantId`     INT           NOT NULL,
    `status`       VARCHAR(20)   NULL,
    `totalAmount`  DECIMAL(12,2) NOT NULL,
    `note`         TEXT          NULL,
    `createdAt`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `FoodOrder_userId_idx`(`userId`),
    INDEX `FoodOrder_tenantId_idx`(`tenantId`),
    INDEX `FoodOrder_status_idx`(`status`),
    INDEX `FoodOrder_macAddress_idx`(`macAddress`),
    INDEX `FoodOrder_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable FoodOrderDetail
CREATE TABLE IF NOT EXISTS `FoodOrderDetail` (
    `id`              INT           NOT NULL AUTO_INCREMENT,
    `orderId`         INT           NOT NULL,
    `recipeId`        INT           NOT NULL,
    `recipeVersionId` INT           NOT NULL,
    `recipeName`      VARCHAR(255)  NOT NULL,
    `salePrice`       DECIMAL(12,2) NOT NULL,
    `quantity`        INT           NOT NULL,
    `subtotal`        DECIMAL(12,2) NOT NULL,
    `note`            VARCHAR(500)  NULL,
    `recipeSnapshot`  LONGTEXT      NOT NULL,

    INDEX `FoodOrderDetail_orderId_idx`(`orderId`),
    INDEX `FoodOrderDetail_recipeId_idx`(`recipeId`),
    INDEX `FoodOrderDetail_recipeVersionId_idx`(`recipeVersionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
