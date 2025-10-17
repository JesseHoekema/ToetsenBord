-- CreateTable
CREATE TABLE `Test` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `vak` VARCHAR(191) NOT NULL,
    `dateDue` DATETIME(3) NOT NULL,
    `notes` LONGTEXT NULL,
    `links` JSON NOT NULL,
    `books` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
