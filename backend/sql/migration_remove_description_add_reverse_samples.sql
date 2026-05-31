-- Migration: remove Description from Albums and Samples, add reverse samples tracking
-- Запускать на существующей БД:
-- mysql -u root samplewiki < backend/sql/migration_remove_description_add_reverse_samples.sql

ALTER TABLE `Albums` DROP COLUMN `Description`;
ALTER TABLE `Samples` DROP COLUMN `Description`;
