CREATE TABLE `order_returns` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`fulfillment_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`reason` text,
	`received_at` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fulfillment_id`) REFERENCES `order_fulfillments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_returns_order_id_idx` ON `order_returns` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_returns_fulfillment_id_idx` ON `order_returns` (`fulfillment_id`);--> statement-breakpoint
CREATE INDEX `order_returns_status_idx` ON `order_returns` (`status`);--> statement-breakpoint
CREATE TABLE `return_items` (
	`id` text PRIMARY KEY NOT NULL,
	`return_id` text NOT NULL,
	`order_item_id` text NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`return_id`) REFERENCES `order_returns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `return_items_return_id_idx` ON `return_items` (`return_id`);--> statement-breakpoint
CREATE INDEX `return_items_order_item_id_idx` ON `return_items` (`order_item_id`);--> statement-breakpoint
CREATE TABLE `payment_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`config` text,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `payment_providers_enabled_idx` ON `payment_providers` (`enabled`);--> statement-breakpoint
ALTER TABLE `payment_sessions` ADD `order_id` text REFERENCES orders(id);--> statement-breakpoint
ALTER TABLE `payment_sessions` ADD `session_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `payment_sessions` ADD `payment_intent_id` text;--> statement-breakpoint
ALTER TABLE `payment_sessions` ADD `captured_at` integer;--> statement-breakpoint
CREATE INDEX `payment_sessions_order_id_idx` ON `payment_sessions` (`order_id`);--> statement-breakpoint
CREATE INDEX `payment_sessions_session_id_idx` ON `payment_sessions` (`session_id`);--> statement-breakpoint
ALTER TABLE `transactions` ADD `payment_session_id` text REFERENCES payment_sessions(id);--> statement-breakpoint
CREATE INDEX `transactions_payment_session_id_idx` ON `transactions` (`payment_session_id`);--> statement-breakpoint
CREATE INDEX `transactions_reference_id_idx` ON `transactions` (`reference_id`);--> statement-breakpoint
CREATE INDEX `transactions_type_idx` ON `transactions` (`type`);