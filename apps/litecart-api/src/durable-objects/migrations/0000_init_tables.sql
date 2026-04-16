CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `accounts_userId_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `sessions_userId_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`role` text DEFAULT 'customer'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verifications_identifier_idx` ON `verifications` (`identifier`);--> statement-breakpoint
CREATE TABLE `countries` (
	`id` text PRIMARY KEY NOT NULL,
	`iso_2` text NOT NULL,
	`iso_3` text NOT NULL,
	`display_name` text NOT NULL,
	`region_id` text,
	FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `countries_iso_2_unique` ON `countries` (`iso_2`);--> statement-breakpoint
CREATE UNIQUE INDEX `countries_iso_3_unique` ON `countries` (`iso_3`);--> statement-breakpoint
CREATE INDEX `countries_region_id_idx` ON `countries` (`region_id`);--> statement-breakpoint
CREATE TABLE `currencies` (
	`code` text PRIMARY KEY NOT NULL,
	`symbol` text NOT NULL,
	`symbol_native` text NOT NULL,
	`name` text NOT NULL,
	`decimal_digits` integer DEFAULT 2
);
--> statement-breakpoint
CREATE TABLE `regions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`currency_code` text NOT NULL,
	`tax_rate` integer,
	`includes_tax` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`currency_code`) REFERENCES `currencies`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `regions_currency_code_idx` ON `regions` (`currency_code`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`handle` text NOT NULL,
	`description` text,
	`parent_id` text,
	`rank` integer DEFAULT 0,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_handle_unique` ON `categories` (`handle`);--> statement-breakpoint
CREATE INDEX `categories_parent_id_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `categories_handle_idx` ON `categories` (`handle`);--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`handle` text NOT NULL,
	`description` text,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collections_handle_unique` ON `collections` (`handle`);--> statement-breakpoint
CREATE INDEX `collections_handle_idx` ON `collections` (`handle`);--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`url` text NOT NULL,
	`alt` text,
	`rank` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_images_product_id_idx` ON `product_images` (`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`handle` text NOT NULL,
	`description` text,
	`subtitle` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`thumbnail` text,
	`is_discountable` integer DEFAULT true,
	`external_id` text,
	`category_id` text,
	`collection_id` text,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_handle_unique` ON `products` (`handle`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `products_category_id_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `products_collection_id_idx` ON `products` (`collection_id`);--> statement-breakpoint
CREATE INDEX `products_handle_idx` ON `products` (`handle`);--> statement-breakpoint
CREATE INDEX `products_created_at_idx` ON `products` (`created_at`);--> statement-breakpoint
CREATE TABLE `product_option_values` (
	`id` text PRIMARY KEY NOT NULL,
	`option_id` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`option_id`) REFERENCES `product_options`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_option_values_option_id_idx` ON `product_option_values` (`option_id`);--> statement-breakpoint
CREATE TABLE `product_options` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`title` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_options_product_id_idx` ON `product_options` (`product_id`);--> statement-breakpoint
CREATE TABLE `variant_option_values` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` text NOT NULL,
	`option_id` text NOT NULL,
	`option_value_id` text NOT NULL,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`option_id`) REFERENCES `product_options`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`option_value_id`) REFERENCES `product_option_values`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `variant_option_values_variant_id_idx` ON `variant_option_values` (`variant_id`);--> statement-breakpoint
CREATE INDEX `variant_option_values_option_id_idx` ON `variant_option_values` (`option_id`);--> statement-breakpoint
CREATE INDEX `variant_option_values_option_value_id_idx` ON `variant_option_values` (`option_value_id`);--> statement-breakpoint
CREATE TABLE `variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`title` text NOT NULL,
	`sku` text,
	`barcode` text,
	`ean` text,
	`upc` text,
	`allow_backorder` integer DEFAULT false,
	`manage_inventory` integer DEFAULT true,
	`weight` integer,
	`length` integer,
	`height` integer,
	`width` integer,
	`origin_country` text,
	`hs_code` text,
	`mid_code` text,
	`material` text,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `variants_sku_unique` ON `variants` (`sku`);--> statement-breakpoint
CREATE INDEX `variants_product_id_idx` ON `variants` (`product_id`);--> statement-breakpoint
CREATE INDEX `variants_sku_idx` ON `variants` (`sku`);--> statement-breakpoint
CREATE TABLE `prices` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` text NOT NULL,
	`currency_code` text NOT NULL,
	`amount` integer NOT NULL,
	`min_quantity` integer DEFAULT 1,
	`max_quantity` integer,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`currency_code`) REFERENCES `currencies`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `prices_variant_id_idx` ON `prices` (`variant_id`);--> statement-breakpoint
CREATE INDEX `prices_currency_code_idx` ON `prices` (`currency_code`);--> statement-breakpoint
CREATE TABLE `inventory_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`inventory_level_id` text NOT NULL,
	`change` integer NOT NULL,
	`reference_id` text,
	`reference_type` text,
	`created_at` integer,
	FOREIGN KEY (`inventory_level_id`) REFERENCES `inventory_levels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `inventory_changes_inventory_level_id_idx` ON `inventory_changes` (`inventory_level_id`);--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` text NOT NULL,
	`stocked_quantity` integer DEFAULT 0 NOT NULL,
	`reserved_quantity` integer DEFAULT 0 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `inventory_items_variant_id_idx` ON `inventory_items` (`variant_id`);--> statement-breakpoint
CREATE TABLE `inventory_levels` (
	`id` text PRIMARY KEY NOT NULL,
	`inventory_item_id` text NOT NULL,
	`location_id` text NOT NULL,
	`stocked_quantity` integer DEFAULT 0 NOT NULL,
	`reserved_quantity` integer DEFAULT 0 NOT NULL,
	`incoming_quantity` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `inventory_levels_inventory_item_id_idx` ON `inventory_levels` (`inventory_item_id`);--> statement-breakpoint
CREATE INDEX `inventory_levels_location_id_idx` ON `inventory_levels` (`location_id`);--> statement-breakpoint
CREATE TABLE `addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`address_1` text NOT NULL,
	`address_2` text,
	`city` text NOT NULL,
	`province` text,
	`province_code` text,
	`postal_code` text NOT NULL,
	`country_code` text NOT NULL,
	`phone` text,
	`is_default_shipping` integer DEFAULT false,
	`is_default_billing` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`country_code`) REFERENCES `countries`(`iso_2`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `addresses_customer_id_idx` ON `addresses` (`customer_id`);--> statement-breakpoint
CREATE INDEX `addresses_country_code_idx` ON `addresses` (`country_code`);--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`email` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`phone` text,
	`has_account` integer DEFAULT false,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE INDEX `customers_email_idx` ON `customers` (`email`);--> statement-breakpoint
CREATE INDEX `customers_user_id_idx` ON `customers` (`user_id`);--> statement-breakpoint
CREATE TABLE `cart_addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`cart_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`address_1` text NOT NULL,
	`address_2` text,
	`city` text NOT NULL,
	`province` text,
	`postal_code` text NOT NULL,
	`country_code` text NOT NULL,
	`phone` text,
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `cart_addresses_cart_id_idx` ON `cart_addresses` (`cart_id`);--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` text PRIMARY KEY NOT NULL,
	`cart_id` text NOT NULL,
	`variant_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `cart_items_cart_id_idx` ON `cart_items` (`cart_id`);--> statement-breakpoint
CREATE INDEX `cart_items_variant_id_idx` ON `cart_items` (`variant_id`);--> statement-breakpoint
CREATE TABLE `carts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`customer_id` text,
	`region_id` text NOT NULL,
	`currency_code` text NOT NULL,
	`shipping_address_id` text,
	`billing_address_id` text,
	`completed_at` integer,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`billing_address_id`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `carts_customer_id_idx` ON `carts` (`customer_id`);--> statement-breakpoint
CREATE INDEX `carts_region_id_idx` ON `carts` (`region_id`);--> statement-breakpoint
CREATE INDEX `carts_email_idx` ON `carts` (`email`);--> statement-breakpoint
CREATE TABLE `fulfillment_items` (
	`id` text PRIMARY KEY NOT NULL,
	`fulfillment_id` text NOT NULL,
	`order_item_id` text NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`fulfillment_id`) REFERENCES `order_fulfillments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `fulfillment_items_fulfillment_id_idx` ON `fulfillment_items` (`fulfillment_id`);--> statement-breakpoint
CREATE INDEX `fulfillment_items_order_item_id_idx` ON `fulfillment_items` (`order_item_id`);--> statement-breakpoint
CREATE TABLE `order_addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`address_1` text NOT NULL,
	`address_2` text,
	`city` text NOT NULL,
	`province` text,
	`postal_code` text NOT NULL,
	`country_code` text NOT NULL,
	`phone` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `order_addresses_order_id_idx` ON `order_addresses` (`order_id`);--> statement-breakpoint
CREATE TABLE `order_fulfillments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`status` text DEFAULT 'not_fulfilled' NOT NULL,
	`tracking_number` text,
	`tracking_url` text,
	`shipped_at` integer,
	`delivered_at` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_fulfillments_order_id_idx` ON `order_fulfillments` (`order_id`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`variant_id` text NOT NULL,
	`product_id` text NOT NULL,
	`title` text NOT NULL,
	`variant_title` text,
	`sku` text,
	`quantity` integer NOT NULL,
	`unit_price` integer NOT NULL,
	`subtotal` integer NOT NULL,
	`tax_total` integer DEFAULT 0,
	`total` integer NOT NULL,
	`fulfilled_quantity` integer DEFAULT 0,
	`returned_quantity` integer DEFAULT 0,
	`metadata` text,
	`created_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `order_shipping_methods` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`shipping_option_id` text,
	`name` text NOT NULL,
	`amount` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_shipping_methods_order_id_idx` ON `order_shipping_methods` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_shipping_methods_shipping_option_id_idx` ON `order_shipping_methods` (`shipping_option_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`display_id` integer NOT NULL,
	`customer_id` text,
	`email` text NOT NULL,
	`region_id` text NOT NULL,
	`currency_code` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`fulfillment_status` text DEFAULT 'not_fulfilled' NOT NULL,
	`payment_status` text DEFAULT 'not_paid' NOT NULL,
	`subtotal` integer NOT NULL,
	`shipping_total` integer NOT NULL,
	`tax_total` integer NOT NULL,
	`discount_total` integer DEFAULT 0,
	`total` integer NOT NULL,
	`shipping_address_id` text,
	`billing_address_id` text,
	`metadata` text,
	`deleted_at` integer,
	`canceled_at` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `orders_display_id_idx` ON `orders` (`display_id`);--> statement-breakpoint
CREATE INDEX `orders_customer_id_idx` ON `orders` (`customer_id`);--> statement-breakpoint
CREATE INDEX `orders_email_idx` ON `orders` (`email`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `orders_created_at_idx` ON `orders` (`created_at`);--> statement-breakpoint
CREATE TABLE `payment_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`cart_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`amount` integer NOT NULL,
	`currency_code` text NOT NULL,
	`data` text,
	`expires_at` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `payment_sessions_cart_id_idx` ON `payment_sessions` (`cart_id`);--> statement-breakpoint
CREATE INDEX `payment_sessions_status_idx` ON `payment_sessions` (`status`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`amount` integer NOT NULL,
	`currency_code` text NOT NULL,
	`reference_id` text,
	`provider_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`metadata` text,
	`created_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `transactions_order_id_idx` ON `transactions` (`order_id`);--> statement-breakpoint
CREATE INDEX `transactions_status_idx` ON `transactions` (`status`);--> statement-breakpoint
CREATE TABLE `shipping_options` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`region_id` text NOT NULL,
	`provider_id` text,
	`price_type` text DEFAULT 'flat_rate' NOT NULL,
	`amount` integer,
	`is_enabled` integer DEFAULT true,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_id`) REFERENCES `shipping_providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `shipping_options_region_id_idx` ON `shipping_options` (`region_id`);--> statement-breakpoint
CREATE INDEX `shipping_options_provider_id_idx` ON `shipping_options` (`provider_id`);--> statement-breakpoint
CREATE TABLE `shipping_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`is_enabled` integer DEFAULT true,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shipping_providers_code_unique` ON `shipping_providers` (`code`);--> statement-breakpoint
CREATE INDEX `shipping_providers_code_idx` ON `shipping_providers` (`code`);