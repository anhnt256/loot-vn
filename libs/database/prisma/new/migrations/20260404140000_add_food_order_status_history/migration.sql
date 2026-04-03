-- CreateTable FoodOrderStatusHistory
-- Lưu lịch sử từng bước chuyển trạng thái để tracking thời gian xử lý của nhân viên
CREATE TABLE `FoodOrderStatusHistory` (
    `id`        INT          NOT NULL AUTO_INCREMENT,
    `orderId`   INT          NOT NULL,
    `status`    VARCHAR(20)  NOT NULL  COMMENT 'Trạng thái mới sau khi chuyển',
    `changedBy` INT          NULL      COMMENT 'staffId — null nếu do hệ thống',
    `note`      VARCHAR(255) NULL,
    `changedAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm chuyển trạng thái',

    INDEX `FoodOrderStatusHistory_orderId_idx`(`orderId`),
    INDEX `FoodOrderStatusHistory_changedAt_idx`(`changedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
