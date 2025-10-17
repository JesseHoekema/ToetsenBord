/*
  Warnings:

  - You are about to drop the column `zermeloSchool` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `zermeloToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `zermeloTokenExpiresAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `zermeloSchool`,
    DROP COLUMN `zermeloToken`,
    DROP COLUMN `zermeloTokenExpiresAt`,
    ADD COLUMN `somtodayToken` VARCHAR(191) NULL;
