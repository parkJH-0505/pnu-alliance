-- Add eventNumber and related columns to events table
ALTER TABLE `events` 
ADD COLUMN `eventNumber` INT NOT NULL UNIQUE AFTER `id`,
ADD COLUMN `theme` VARCHAR(255) AFTER `location`,
ADD COLUMN `status` ENUM('recruiting', 'recruiting_complete', 'ongoing', 'completed') DEFAULT 'recruiting' NOT NULL AFTER `capacity`,
ADD COLUMN `googleSheetTabId` VARCHAR(255) AFTER `status`,
MODIFY COLUMN `description` TEXT,
MODIFY COLUMN `location` VARCHAR(255) NOT NULL,
MODIFY COLUMN `capacity` INT DEFAULT 0,
DROP COLUMN IF EXISTS `registeredCount`;

-- Add phone column to memberProfiles table
ALTER TABLE `memberProfiles` 
ADD COLUMN `phone` VARCHAR(20) UNIQUE AFTER `applicationId`,
ADD COLUMN `name` VARCHAR(255) AFTER `phone`;

-- Create eventRegistrations table
CREATE TABLE IF NOT EXISTS `eventRegistrations` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `eventId` INT NOT NULL,
  `memberId` INT,
  `name` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255),
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(320),
  `additionalInfo` TEXT,
  `registrationType` ENUM('existing_member', 'new_participant') NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`memberId`) REFERENCES `memberProfiles`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `unique_registration` (`eventId`, `memberId`, `phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
