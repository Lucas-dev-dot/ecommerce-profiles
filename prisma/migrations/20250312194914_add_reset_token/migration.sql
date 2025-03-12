/*
  Warnings:

  - Added the required column `content` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `stock` ADD COLUMN `content` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` INTEGER NULL,
    MODIFY `isUsed` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `quantity` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `resetToken` VARCHAR(191) NULL,
    ADD COLUMN `resetTokenExpiry` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Stock_userId_idx` ON `Stock`(`userId`);

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
