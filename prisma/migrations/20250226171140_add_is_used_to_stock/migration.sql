/*
  Warnings:

  - You are about to drop the column `content` on the `stock` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` MODIFY `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `stock` DROP COLUMN `content`,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ALTER COLUMN `isUsed` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
