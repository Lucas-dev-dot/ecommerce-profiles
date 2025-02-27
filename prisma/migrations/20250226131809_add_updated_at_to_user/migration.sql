/*
  Warnings:

  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `isUsed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `profileFile` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('PROFILE', 'PROXY') NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` INTEGER NULL,
    MODIFY `price` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE INDEX `Product_userId_fkey` ON `Product`(`userId`);

-- RenameIndex
ALTER TABLE `_userproducts` RENAME INDEX `_userproducts_AB_unique` TO `_UserProducts_AB_unique`;

-- RenameIndex
ALTER TABLE `_userproducts` RENAME INDEX `_userproducts_B_index` TO `_UserProducts_B_index`;
