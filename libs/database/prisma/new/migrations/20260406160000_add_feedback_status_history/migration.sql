-- CreateTable FeedbackStatusHistory
-- Lưu lịch sử chuyển trạng thái feedback để tracking thời gian xử lý
CREATE TABLE `FeedbackStatusHistory` (
    `id`         INT          NOT NULL AUTO_INCREMENT,
    `feedbackId` INT          NOT NULL,
    `fromStatus` VARCHAR(20)  NOT NULL  COMMENT 'Trạng thái trước khi chuyển',
    `toStatus`   VARCHAR(20)  NOT NULL  COMMENT 'Trạng thái sau khi chuyển',
    `changedBy`  INT          NULL      COMMENT 'staffId — null nếu do hệ thống',
    `note`       VARCHAR(500) NULL,
    `changedAt`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FeedbackStatusHistory_feedbackId_idx`(`feedbackId`),
    INDEX `FeedbackStatusHistory_changedAt_idx`(`changedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
