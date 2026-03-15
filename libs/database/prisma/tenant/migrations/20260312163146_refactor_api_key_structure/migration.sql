/*
  Warnings:

  - You are about to drop the column `key` on the `api_keys` table. All the data in the column will be lost.
  - You are about to drop the column `key_hash` on the `api_keys` table. All the data in the column will be lost.
  - You are about to drop the column `key_label` on the `api_keys` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key_id]` on the table `api_keys` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key_id` to the `api_keys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secret_hash` to the `api_keys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `api_keys` DROP COLUMN `key`,
    DROP COLUMN `key_hash`,
    DROP COLUMN `key_label`,
    ADD COLUMN `key_id` VARCHAR(255) NOT NULL,
    ADD COLUMN `name` VARCHAR(255) NULL,
    ADD COLUMN `secret_hash` VARCHAR(255) NOT NULL,
    MODIFY `user_id` CHAR(36) NULL,
    MODIFY `tenant_id` CHAR(36) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `api_keys_key_id_key` ON `api_keys`(`key_id`);
