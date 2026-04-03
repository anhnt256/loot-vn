-- AlterTable: update FoodOrderStatus enum values
ALTER TABLE `FoodOrder`
  MODIFY COLUMN `status` ENUM('PENDING','CHAP_NHAN','THU_TIEN','PHUC_VU','HOAN_THANH','HUY') NULL;

-- AlterTable: update FoodOrderStatusHistory status column (stored as VARCHAR, no enum constraint)
