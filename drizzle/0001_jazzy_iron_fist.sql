ALTER TABLE `images` ADD `file_name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `images` ADD `width` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `images` ADD `height` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `images` DROP COLUMN `dimensions`;