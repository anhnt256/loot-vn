/*
  Warnings:

  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `users` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `createdAt`,
    DROP COLUMN `createdBy`,
    DROP COLUMN `deletedAt`,
    DROP COLUMN `deletedBy`,
    DROP COLUMN `isActive`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `updatedBy`,
    ADD COLUMN `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `created_by` CHAR(36) NULL,
    ADD COLUMN `deleted_at` TIMESTAMP(0) NULL,
    ADD COLUMN `deleted_by` CHAR(36) NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `updated_at` TIMESTAMP(0) NOT NULL,
    ADD COLUMN `updated_by` CHAR(36) NULL;

-- CreateTable
CREATE TABLE `api_keys` (
    `id` CHAR(36) NOT NULL,
    `key_label` VARCHAR(255) NOT NULL,
    `key` VARCHAR(255) NOT NULL,
    `key_hash` VARCHAR(255) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `tenant_id` TEXT NOT NULL,
    `scopes` JSON NULL,
    `services` JSON NULL,
    `expires_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `updated_at` TIMESTAMP(0) NOT NULL,
    `deleted_at` TIMESTAMP(0) NULL,
    `deleted_by` CHAR(36) NULL,
    `revoked_by` CHAR(36) NULL,
    `revoked_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feature_flags` (
    `id` CHAR(36) NOT NULL,
    `key` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `tenant_id` VARCHAR(255) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `target` JSON NULL,
    `metadata` JSON NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,
    `deleted_at` TIMESTAMP(0) NULL,
    `created_by` VARCHAR(255) NULL,
    `updated_by` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenant_api_keys` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `api_key` VARCHAR(255) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `entry_code` VARCHAR(255) NOT NULL,
    `pass_code` VARCHAR(255) NOT NULL,
    `attributes` JSON NULL,
    `created_by` VARCHAR(255) NULL,
    `updated_by` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenant_configurations` (
    `id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,
    `deleted_at` TIMESTAMP(0) NULL,
    `created_by` VARCHAR(255) NULL,
    `updated_by` VARCHAR(255) NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500) NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `service_type` VARCHAR(255) NULL,
    `metadata` JSON NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `alt_name` VARCHAR(100) NULL,
    `alt_description` VARCHAR(500) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenants` (
    `id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,
    `deleted_at` TIMESTAMP(0) NULL,
    `created_by` VARCHAR(255) NULL,
    `updated_by` VARCHAR(255) NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500) NULL,
    `domain` VARCHAR(200) NULL,
    `tenant_id` VARCHAR(100) NOT NULL,
    `clients` JSON NULL,
    `logo` JSON NULL,
    `alt_name` VARCHAR(100) NULL,
    `alt_description` VARCHAR(500) NULL,
    `is_workflow_enabled` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
