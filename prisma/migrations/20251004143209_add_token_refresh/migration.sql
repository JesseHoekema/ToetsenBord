-- AlterTable
ALTER TABLE `User` ADD COLUMN `somtodayRefreshToken` LONGTEXT NULL,
    ADD COLUMN `somtodayTokenExpires` INTEGER NULL;
