-- CreateTable
CREATE TABLE `Rank` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `fromValue` DOUBLE NOT NULL,
    `toValue` DOUBLE NOT NULL,
    `discount` DOUBLE NULL,
    `foodVoucher` INTEGER NULL,
    `drinkVoucher` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Game` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `starsPerRound` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `balance_rate` FLOAT NULL,
    `play_rate` FLOAT NULL,
    `jackpot` FLOAT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckInResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckInItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayName` VARCHAR(191) NOT NULL,
    `stars` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckInPromotion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `checkInItemId` INTEGER NOT NULL,
    `coefficient` DOUBLE NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `rating` FLOAT NOT NULL,
    `value` FLOAT NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `title` VARCHAR(500) NOT NULL,
    `background` VARCHAR(7) NULL,
    `textColor` VARCHAR(7) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameItemMap` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gameId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GameItemMap_gameId_key`(`gameId`),
    UNIQUE INDEX `GameItemMap_itemId_key`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GameResult_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userName` VARCHAR(45) NULL,
    `userId` INTEGER NOT NULL,
    `rankId` INTEGER NOT NULL,
    `stars` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `magicStone` INTEGER NOT NULL DEFAULT 0,
    `totalPayment` FLOAT NULL,
    `note` VARCHAR(1000) NULL DEFAULT '',
    `isUseApp` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `reward` DOUBLE NOT NULL,
    `startHours` INTEGER NOT NULL,
    `endHours` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `quantity` INTEGER NOT NULL,
    `type` ENUM('HOURS', 'ORDER', 'TOPUP') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserMissionCompletion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `missionId` INTEGER NOT NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualValue` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UserMissionCompletion_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRewardMap` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `rewardId` INTEGER NULL,
    `promotionCodeId` INTEGER NULL,
    `duration` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `note` TEXT NULL,
    `status` ENUM('INITIAL', 'APPROVE', 'REJECT') NULL DEFAULT 'INITIAL',
    `type` ENUM('STARS', 'EVENT') NOT NULL DEFAULT 'STARS',

    INDEX `UserRewardMap_promotionCodeId_idx`(`promotionCodeId`),
    INDEX `UserRewardMap_userId_idx`(`userId`),
    INDEX `UserRewardMap_rewardId_idx`(`rewardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NULL,
    `stars` INTEGER NULL,
    `value` INTEGER NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromotionCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NULL,
    `code` VARCHAR(45) NULL,
    `value` INTEGER NULL,
    `isUsed` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `eventId` VARCHAR(191) NULL,
    `expirationDate` DATETIME(3) NULL,
    `promotionSettingId` INTEGER NULL,
    `rewardType` VARCHAR(191) NULL,
    `rewardValue` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserStarHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `oldStars` INTEGER NULL,
    `newStars` INTEGER NULL,
    `type` ENUM('CHECK_IN', 'MISSION', 'REWARD', 'GAME', 'RETURN_GIFT', 'GIFT_ROUND', 'FEEDBACK', 'BATTLE_PASS') NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `targetId` INTEGER NULL,
    `gameResultId` INTEGER NULL,

    INDEX `UserStarHistory_userId_idx`(`userId`),
    INDEX `UserStarHistory_gameResultId_idx`(`gameResultId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SavingPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` TEXT NOT NULL,
    `name` TEXT NOT NULL,
    `price` INTEGER NOT NULL,
    `description` LONGTEXT NULL,
    `isDelete` BIT(1) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Computer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fingerprintId` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(191) NULL,
    `name` VARCHAR(45) NOT NULL,
    `status` INTEGER NOT NULL,
    `localIp` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Staff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `address` TEXT NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `email` VARCHAR(255) NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `hireDate` DATETIME(3) NULL,
    `idCard` VARCHAR(20) NULL,
    `idCardExpiryDate` DATETIME(3) NULL,
    `idCardIssueDate` DATETIME(3) NULL,
    `note` TEXT NULL,
    `phone` VARCHAR(15) NULL,
    `resignDate` DATETIME(3) NULL,
    `staffType` ENUM('STAFF', 'KITCHEN', 'SECURITY', 'CASHIER', 'MANAGER', 'SUPER_ADMIN', 'BRANCH_ADMIN') NOT NULL DEFAULT 'STAFF',
    `needCheckMacAddress` BOOLEAN NOT NULL DEFAULT true,
    `bankAccountName` VARCHAR(255) NULL,
    `bankAccountNumber` VARCHAR(50) NULL,
    `bankName` VARCHAR(255) NULL,
    `baseSalary` DOUBLE NOT NULL DEFAULT 0,

    UNIQUE INDEX `Staff_userName_key`(`userName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StaffTimeTracking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staffId` INTEGER NOT NULL,
    `checkInTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `checkOutTime` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StaffTimeTracking_staffId_idx`(`staffId`),
    INDEX `StaffTimeTracking_checkInTime_idx`(`checkInTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkShift` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `startTime` TIME(0) NOT NULL,
    `endTime` TIME(0) NOT NULL,
    `FnetStaffId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isOvernight` BOOLEAN NOT NULL DEFAULT false,
    `ffood_id` CHAR(36) NULL,

    INDEX `WorkShift_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkShiftRevenueReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportDate` DATE NOT NULL,
    `shift` ENUM('MORNING', 'AFTERNOON', 'EVENING') NOT NULL,
    `totalFood` DECIMAL(12, 0) NOT NULL DEFAULT 0,
    `deduction` DECIMAL(12, 0) NOT NULL DEFAULT 0,
    `actualFfood` DECIMAL(12, 0) NOT NULL DEFAULT 0,
    `gamingRevenue` DECIMAL(12, 0) NOT NULL DEFAULT 0,
    `actualShiftRevenue` DECIMAL(12, 0) NOT NULL DEFAULT 0,
    `momoRevenue` DECIMAL(12, 0) NOT NULL DEFAULT 0,
    `incidentalAmount` DECIMAL(12, 0) NULL,
    `handoverAmount` DECIMAL(12, 0) NOT NULL DEFAULT 0,
    `confirmedHeldAmount` DECIMAL(12, 0) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WorkShiftRevenueReport_reportDate_idx`(`reportDate`),
    UNIQUE INDEX `WorkShiftRevenueReport_reportDate_shift_key`(`reportDate`, `shift`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FraudLoginAlert` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serverLogId` INTEGER NULL,
    `actor` VARCHAR(100) NOT NULL,
    `loginAt` DATETIME(3) NOT NULL,
    `note` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FraudLoginAlert_loginAt_idx`(`loginAt`),
    INDEX `FraudLoginAlert_serverLogId_idx`(`serverLogId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StaffSalary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staffId` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `totalHours` DOUBLE NOT NULL DEFAULT 0,
    `hourlySalary` DOUBLE NOT NULL DEFAULT 0,
    `salaryFromHours` DOUBLE NOT NULL DEFAULT 0,
    `advance` DOUBLE NOT NULL DEFAULT 0,
    `bonus` DOUBLE NOT NULL DEFAULT 0,
    `penalty` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `paidAt` DATETIME(3) NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StaffSalary_staffId_idx`(`staffId`),
    INDEX `StaffSalary_year_month_idx`(`year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StaffBonus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staffId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` VARCHAR(500) NULL,
    `note` TEXT NULL,
    `rewardDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StaffBonus_staffId_idx`(`staffId`),
    INDEX `StaffBonus_rewardDate_idx`(`rewardDate`),
    INDEX `StaffBonus_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StaffPenalty` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staffId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` VARCHAR(500) NULL,
    `note` TEXT NULL,
    `penaltyDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StaffPenalty_staffId_idx`(`staffId`),
    INDEX `StaffPenalty_penaltyDate_idx`(`penaltyDate`),
    INDEX `StaffPenalty_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ManagerIncomeExpense` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(20) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `transactionDate` DATETIME(3) NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ManagerIncomeExpense_transactionDate_idx`(`transactionDate`),
    INDEX `ManagerIncomeExpense_type_idx`(`type`),
    INDEX `ManagerIncomeExpense_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GiftRound` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `staffId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiredAt` DATETIME(3) NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usedAmount` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Device` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `computerId` INTEGER NOT NULL,
    `monitorStatus` ENUM('GOOD', 'DAMAGED_BUT_USABLE', 'COMPLETELY_DAMAGED') NOT NULL DEFAULT 'GOOD',
    `keyboardStatus` ENUM('GOOD', 'DAMAGED_BUT_USABLE', 'COMPLETELY_DAMAGED') NOT NULL DEFAULT 'GOOD',
    `mouseStatus` ENUM('GOOD', 'DAMAGED_BUT_USABLE', 'COMPLETELY_DAMAGED') NOT NULL DEFAULT 'GOOD',
    `headphoneStatus` ENUM('GOOD', 'DAMAGED_BUT_USABLE', 'COMPLETELY_DAMAGED') NOT NULL DEFAULT 'GOOD',
    `chairStatus` ENUM('GOOD', 'DAMAGED_BUT_USABLE', 'COMPLETELY_DAMAGED') NOT NULL DEFAULT 'GOOD',
    `networkStatus` ENUM('GOOD', 'DAMAGED_BUT_USABLE', 'COMPLETELY_DAMAGED') NOT NULL DEFAULT 'GOOD',
    `computerStatus` ENUM('GOOD', 'DAMAGED_BUT_USABLE', 'COMPLETELY_DAMAGED') NOT NULL DEFAULT 'GOOD',
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Device_computerId_idx`(`computerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeviceHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `computerId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `issue` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `monitorStatus` ENUM('GOOD', 'DAMAGED_BUT_USABLE', 'COMPLETELY_DAMAGED') NOT NULL DEFAULT 'GOOD',
    `keyboardStatus` ENUM('GOOD', 'DAMAGED_BUT_USABLE', 'COMPLETELY_DAMAGED') NOT NULL DEFAULT 'GOOD',
    `mouseStatus` ENUM('GOOD', 'DAMAGED_BUT_USABLE', 'COMPLETELY_DAMAGED') NOT NULL DEFAULT 'GOOD',
    `headphoneStatus` ENUM('GOOD', 'DAMAGED_BUT_USABLE', 'COMPLETELY_DAMAGED') NOT NULL DEFAULT 'GOOD',
    `chairStatus` ENUM('GOOD', 'DAMAGED_BUT_USABLE', 'COMPLETELY_DAMAGED') NOT NULL DEFAULT 'GOOD',
    `networkStatus` ENUM('GOOD', 'DAMAGED_BUT_USABLE', 'COMPLETELY_DAMAGED') NOT NULL DEFAULT 'GOOD',
    `deviceId` INTEGER NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DeviceHistory_computerId_idx`(`computerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BattlePassSeason` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `maxLevel` INTEGER NOT NULL DEFAULT 100,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BattlePassReward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seasonId` INTEGER NOT NULL,
    `level` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `rewardType` VARCHAR(191) NOT NULL,
    `rewardValue` INTEGER NULL,
    `imageUrl` VARCHAR(191) NULL,
    `isBonus` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `experience` INTEGER NOT NULL DEFAULT 0,
    `eventRewardId` INTEGER NULL,

    INDEX `BattlePassReward_seasonId_idx`(`seasonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserBattlePass` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `seasonId` INTEGER NOT NULL,
    `level` INTEGER NOT NULL DEFAULT 0,
    `experience` INTEGER NOT NULL DEFAULT 0,
    `isPremium` BOOLEAN NOT NULL DEFAULT false,
    `totalSpent` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UserBattlePass_userId_idx`(`userId`),
    INDEX `UserBattlePass_seasonId_idx`(`seasonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserBattlePassReward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `seasonId` INTEGER NOT NULL,
    `rewardId` INTEGER NOT NULL,
    `claimedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserBattlePassReward_seasonId_idx`(`seasonId`),
    INDEX `UserBattlePassReward_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BattlePassPremiumPackage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seasonId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `basePrice` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `benefits` VARCHAR(191) NULL,
    `maxQuantity` INTEGER NULL,
    `sold` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromotionSetting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('BATTLE_PASS', 'VOUCHER', 'TOPUP') NOT NULL,
    `targetId` INTEGER NULL,
    `discountType` ENUM('PERCENT', 'FIXED') NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `maxQuantity` INTEGER NULL,
    `used` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `rule` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `eventId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BattlePassPremiumOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `packageId` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approvedAt` DATETIME(3) NULL,
    `approvedBy` INTEGER NULL,
    `note` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `userId` INTEGER NULL,
    `machineName` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `staffId` INTEGER NULL,

    INDEX `ChatMessage_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BirthdayTier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tierName` VARCHAR(100) NOT NULL,
    `discountPercent` INTEGER NOT NULL,
    `milestoneAmount` INTEGER NOT NULL,
    `additionalAmount` INTEGER NOT NULL,
    `bonusAmount` INTEGER NOT NULL,
    `totalAtTier` INTEGER NOT NULL,
    `totalReceived` INTEGER NOT NULL,
    `freeSpins` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserBirthdayProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `tierId` INTEGER NOT NULL,
    `isClaimed` BOOLEAN NOT NULL DEFAULT false,
    `claimedAt` DATETIME(3) NULL,
    `totalSpent` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UserBirthdayProgress_userId_idx`(`userId`),
    UNIQUE INDEX `UserBirthdayProgress_userId_tierId_key`(`userId`, `tierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BirthdayTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `tierId` INTEGER NULL,
    `transactionType` ENUM('TOPUP', 'BONUS', 'FREE_SPIN') NOT NULL,
    `description` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BirthdayTransaction_userId_idx`(`userId`),
    INDEX `BirthdayTransaction_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReportDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportId` INTEGER NOT NULL,
    `type` ENUM('GIO', 'DICH_VU', 'MOMO', 'CHI', 'TONG') NOT NULL,
    `value` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `shift` ENUM('SANG', 'CHIEU', 'TOI') NOT NULL,
    `fileUrl` LONGTEXT NOT NULL,
    `note` VARCHAR(191) NULL,
    `counterStaffId` INTEGER NOT NULL,
    `kitchenStaffId` INTEGER NOT NULL,
    `securityStaffId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HandoverReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `reportType` ENUM('BAO_CAO_BEP', 'BAO_CAO_NUOC') NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `afternoonStaffId` INTEGER NULL,
    `eveningStaffId` INTEGER NULL,
    `morningStaffId` INTEGER NULL,
    `afternoonSubmissionCount` INTEGER NOT NULL DEFAULT 0,
    `eveningSubmissionCount` INTEGER NOT NULL DEFAULT 0,
    `isAfternoonComplete` BOOLEAN NOT NULL DEFAULT false,
    `isEveningComplete` BOOLEAN NOT NULL DEFAULT false,
    `isMorningComplete` BOOLEAN NOT NULL DEFAULT false,
    `morningSubmissionCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `HandoverReport_date_shift_reportType_idx`(`date`, `reportType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HandoverMaterial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `handoverReportId` INTEGER NOT NULL,
    `morningBeginning` DOUBLE NULL,
    `morningReceived` DOUBLE NULL,
    `morningIssued` DOUBLE NULL,
    `morningEnding` DOUBLE NULL,
    `afternoonBeginning` DOUBLE NULL,
    `afternoonReceived` DOUBLE NULL,
    `afternoonIssued` DOUBLE NULL,
    `afternoonEnding` DOUBLE NULL,
    `eveningBeginning` DOUBLE NULL,
    `eveningReceived` DOUBLE NULL,
    `eveningIssued` DOUBLE NULL,
    `eveningEnding` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `materialId` INTEGER NULL,

    INDEX `HandoverMaterial_handoverReportId_idx`(`handoverReportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Material` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isOnFood` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `reportType` ENUM('BAO_CAO_BEP', 'BAO_CAO_NUOC') NOT NULL,

    UNIQUE INDEX `Material_name_key`(`name`),
    INDEX `Material_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `type` ENUM('IMPROVEMENT', 'BUG_REPORT', 'FEATURE_REQUEST', 'GENERAL') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `priority` VARCHAR(20) NOT NULL,
    `category` VARCHAR(50) NULL,
    `rating` INTEGER NULL DEFAULT 0,
    `image` TEXT NULL,
    `note` TEXT NULL,
    `isAnonymous` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('SUBMITTED', 'RECEIVED', 'PROCESSING', 'COMPLETED') NOT NULL DEFAULT 'SUBMITTED',
    `response` TEXT NULL,
    `stars` INTEGER NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `computerId` INTEGER NULL,

    INDEX `Feedback_userId_idx`(`userId`),
    INDEX `Feedback_computerId_idx`(`computerId`),
    INDEX `Feedback_status_idx`(`status`),
    INDEX `Feedback_createdAt_idx`(`createdAt`),
    INDEX `Feedback_category_idx`(`category`),
    INDEX `Feedback_priority_idx`(`priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FnetHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `oldSubMoney` DOUBLE NOT NULL,
    `newSubMoney` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `targetId` INTEGER NULL,
    `type` VARCHAR(191) NULL,
    `moneyType` VARCHAR(191) NULL DEFAULT 'SUB',
    `oldMainMoney` DOUBLE NULL,
    `newMainMoney` DOUBLE NULL,

    INDEX `FnetHistory_userId_idx`(`userId`),
    INDEX `FnetHistory_targetId_idx`(`targetId`),
    INDEX `FnetHistory_type_idx`(`type`),
    INDEX `FnetHistory_createdAt_idx`(`createdAt`),
    INDEX `FnetHistory_moneyType_idx`(`moneyType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromotionReward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `value` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `starsValue` INTEGER NOT NULL,

    INDEX `PromotionReward_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameAppointmentTier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tierName` VARCHAR(100) NOT NULL,
    `minMembers` INTEGER NOT NULL,
    `minHours` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lockedAmount` INTEGER NOT NULL,
    `maxMembers` INTEGER NULL,
    `questName` VARCHAR(100) NOT NULL,
    `tasks` LONGTEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GameAppointmentTier_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameAppointment` (
    `id` VARCHAR(191) NOT NULL,
    `creatorId` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `game` VARCHAR(100) NOT NULL,
    `gameType` VARCHAR(50) NOT NULL,
    `rankLevel` VARCHAR(50) NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `minMembers` INTEGER NOT NULL DEFAULT 1,
    `maxMembers` INTEGER NOT NULL,
    `minCost` DECIMAL(10, 2) NOT NULL,
    `currentMembers` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `totalLockedAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `tierId` INTEGER NULL,

    INDEX `GameAppointment_creatorId_idx`(`creatorId`),
    INDEX `GameAppointment_status_idx`(`status`),
    INDEX `GameAppointment_startTime_idx`(`startTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameAppointmentMember` (
    `id` VARCHAR(191) NOT NULL,
    `appointmentId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `lockedAmount` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'joined',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `machineGroupId` INTEGER NULL,
    `machineName` VARCHAR(100) NULL,

    INDEX `GameAppointmentMember_userId_idx`(`userId`),
    INDEX `GameAppointmentMember_appointmentId_idx`(`appointmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameAppointmentReward` (
    `id` VARCHAR(191) NOT NULL,
    `appointmentId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `distributedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rewardAmount` INTEGER NOT NULL,
    `taskId` VARCHAR(50) NOT NULL,
    `taskName` VARCHAR(100) NOT NULL,

    INDEX `GameAppointmentReward_userId_idx`(`userId`),
    INDEX `GameAppointmentReward_appointmentId_idx`(`appointmentId`),
    INDEX `GameAppointmentReward_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('NEW_USER_WELCOME', 'BIRTHDAY_EVENT', 'HOLIDAY_EVENT', 'SEASONAL_EVENT', 'BATTLE_PASS_EVENT', 'LUCKY_WHEEL_EVENT', 'GAME_TOURNAMENT', 'REFERRAL_PROGRAM', 'LOYALTY_PROGRAM', 'PROMOTIONAL_CAMPAIGN') NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `registrationStart` DATETIME(3) NULL,
    `registrationEnd` DATETIME(3) NULL,
    `targetAudience` LONGTEXT NULL,
    `conditions` LONGTEXT NULL,
    `rules` LONGTEXT NULL,
    `budget` INTEGER NULL,
    `expectedParticipants` INTEGER NULL,
    `totalParticipants` INTEGER NOT NULL DEFAULT 0,
    `totalCodesGenerated` INTEGER NOT NULL DEFAULT 0,
    `totalCodesUsed` INTEGER NOT NULL DEFAULT 0,
    `totalRewardsDistributed` INTEGER NOT NULL DEFAULT 0,
    `createdBy` INTEGER NULL,
    `approvedBy` INTEGER NULL,
    `approvedAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `generateCodesAhead` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Event_status_idx`(`status`),
    INDEX `Event_type_idx`(`type`),
    INDEX `Event_startDate_idx`(`startDate`),
    INDEX `Event_endDate_idx`(`endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventParticipant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `status` ENUM('REGISTERED', 'PARTICIPATING', 'COMPLETED', 'DISQUALIFIED', 'WITHDRAWN') NOT NULL DEFAULT 'REGISTERED',
    `registeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `participatedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `participationData` LONGTEXT NULL,
    `rewardsReceived` LONGTEXT NULL,
    `totalSpent` INTEGER NOT NULL DEFAULT 0,

    INDEX `EventParticipant_eventId_idx`(`eventId`),
    INDEX `EventParticipant_userId_idx`(`userId`),
    INDEX `EventParticipant_status_idx`(`status`),
    UNIQUE INDEX `EventParticipant_eventId_userId_key`(`eventId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventReward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `rewardType` ENUM('PERCENTAGE_DISCOUNT', 'FIXED_DISCOUNT', 'FREE_ITEM', 'BONUS_ITEM', 'CASH_BACK', 'MULTIPLIER', 'CONDITIONAL_REWARD', 'MAIN_ACCOUNT_TOPUP', 'TOPUP_BONUS_PERCENTAGE') NOT NULL,
    `rewardConfig` LONGTEXT NOT NULL,
    `conditions` LONGTEXT NULL,
    `eligibility` LONGTEXT NULL,
    `maxQuantity` INTEGER NULL,
    `used` INTEGER NOT NULL DEFAULT 0,
    `maxPerUser` INTEGER NULL,
    `maxPerDay` INTEGER NULL,
    `validFrom` DATETIME(3) NULL,
    `validTo` DATETIME(3) NULL,
    `priority` INTEGER NOT NULL DEFAULT 1,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EventReward_eventId_idx`(`eventId`),
    INDEX `EventReward_rewardType_idx`(`rewardType`),
    INDEX `EventReward_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` VARCHAR(191) NOT NULL,
    `reportType` VARCHAR(191) NOT NULL,
    `reportDate` DATETIME(3) NOT NULL,
    `data` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EventReport_eventId_idx`(`eventId`),
    INDEX `EventReport_reportDate_idx`(`reportDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FfoodCredential` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ffood_url` VARCHAR(500) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(500) NOT NULL,
    `token` TEXT NULL,
    `expired` DATETIME(0) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,
    `shop_id` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MomoCredential` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_id` VARCHAR(100) NULL,
    `momo_url` VARCHAR(500) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(500) NOT NULL,
    `token` TEXT NULL,
    `expired` DATETIME(0) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,
    `merchant_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
