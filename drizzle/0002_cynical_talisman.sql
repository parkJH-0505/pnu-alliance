CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`content` text NOT NULL,
	`status` enum('pending','answered','closed') NOT NULL DEFAULT 'pending',
	`response` text,
	`respondedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('UPDATE','INTERVIEW','RECAP') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`excerpt` varchar(500),
	`imageUrl` varchar(512),
	`imageKey` varchar(255),
	`author` varchar(255),
	`publishedAt` timestamp NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `news_id` PRIMARY KEY(`id`)
);
