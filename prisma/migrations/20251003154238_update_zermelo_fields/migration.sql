-- AlterTable
ALTER TABLE `User` ADD COLUMN `zermeloSchool` VARCHAR(191) NULL,
    ADD COLUMN `zermeloToken` VARCHAR(191) NULL,
    ADD COLUMN `zermeloTokenExpiresAt` DATETIME(3) NULL;
