CREATE TYPE "public"."production_run_status" AS ENUM('draft', 'planned', 'completed');--> statement-breakpoint
CREATE TYPE "public"."purchasable_item_category" AS ENUM('ingredient', 'packaging');--> statement-breakpoint
CREATE TYPE "public"."recipe_version_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."rounding_mode" AS ENUM('none', 'increment', 'price_ending');--> statement-breakpoint
CREATE TABLE "organization_settings" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"country_code" text DEFAULT 'GB' NOT NULL,
	"locale" text DEFAULT 'en-GB' NOT NULL,
	"currency_code" text DEFAULT 'GBP' NOT NULL,
	"vat_registered" boolean DEFAULT false NOT NULL,
	"default_tax_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"default_markup_percentage" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"rounding_mode" "rounding_mode" DEFAULT 'none' NOT NULL,
	"rounding_increment" numeric(10, 2),
	"rounding_price_ending" numeric(10, 2),
	"handled_allergens" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "production_run" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"recipe_version_id" text NOT NULL,
	"status" "production_run_status" DEFAULT 'draft' NOT NULL,
	"target_output_quantity" numeric(12, 4) NOT NULL,
	"target_output_unit" text NOT NULL,
	"scale_factor" numeric(12, 4) NOT NULL,
	"whole_batches_only" boolean DEFAULT false NOT NULL,
	"resolved_batch_count" numeric(12, 4) NOT NULL,
	"cost_snapshot" jsonb,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "purchasable_item" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"category" "purchasable_item_category" NOT NULL,
	"name" text NOT NULL,
	"name_normalized" text NOT NULL,
	"canonical_unit" text NOT NULL,
	"notes" text,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "purchasable_item_allergen" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"allergen_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchasable_item_conversion" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"from_unit" text NOT NULL,
	"canonical_quantity" numeric(12, 4) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"item_id" text NOT NULL,
	"supplier_name" text,
	"pack_count" integer DEFAULT 1 NOT NULL,
	"pack_quantity" numeric(12, 4) NOT NULL,
	"pack_unit" text NOT NULL,
	"total_quantity_canonical" numeric(12, 4) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"purchased_at" timestamp NOT NULL,
	"notes" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "recipe" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"forked_from_recipe_id" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "recipe_version" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"status" "recipe_version_status" DEFAULT 'draft' NOT NULL,
	"batch_yield_quantity" numeric(12, 4) NOT NULL,
	"batch_yield_unit" text NOT NULL,
	"sale_unit_name" text NOT NULL,
	"portions_per_batch" numeric(12, 4) NOT NULL,
	"markup_percentage_override" numeric(5, 2),
	"cost_snapshot" jsonb,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "recipe_version_item_line" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_version_id" text NOT NULL,
	"item_id" text NOT NULL,
	"quantity" numeric(12, 4) NOT NULL,
	"unit" text NOT NULL,
	"notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_version_sub_recipe_line" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_version_id" text NOT NULL,
	"sub_recipe_version_id" text NOT NULL,
	"quantity" numeric(12, 4) NOT NULL,
	"unit" text NOT NULL,
	"notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_run" ADD CONSTRAINT "production_run_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_run" ADD CONSTRAINT "production_run_recipe_version_id_recipe_version_id_fk" FOREIGN KEY ("recipe_version_id") REFERENCES "public"."recipe_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_run" ADD CONSTRAINT "production_run_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchasable_item" ADD CONSTRAINT "purchasable_item_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchasable_item" ADD CONSTRAINT "purchasable_item_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchasable_item" ADD CONSTRAINT "purchasable_item_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchasable_item_allergen" ADD CONSTRAINT "purchasable_item_allergen_item_id_purchasable_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."purchasable_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchasable_item_conversion" ADD CONSTRAINT "purchasable_item_conversion_item_id_purchasable_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."purchasable_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_entry" ADD CONSTRAINT "purchase_entry_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_entry" ADD CONSTRAINT "purchase_entry_item_id_purchasable_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."purchasable_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_entry" ADD CONSTRAINT "purchase_entry_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe" ADD CONSTRAINT "recipe_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe" ADD CONSTRAINT "recipe_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_version" ADD CONSTRAINT "recipe_version_recipe_id_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_version" ADD CONSTRAINT "recipe_version_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_version" ADD CONSTRAINT "recipe_version_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_version_item_line" ADD CONSTRAINT "recipe_version_item_line_recipe_version_id_recipe_version_id_fk" FOREIGN KEY ("recipe_version_id") REFERENCES "public"."recipe_version"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_version_item_line" ADD CONSTRAINT "recipe_version_item_line_item_id_purchasable_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."purchasable_item"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_version_sub_recipe_line" ADD CONSTRAINT "recipe_version_sub_recipe_line_recipe_version_id_recipe_version_id_fk" FOREIGN KEY ("recipe_version_id") REFERENCES "public"."recipe_version"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_version_sub_recipe_line" ADD CONSTRAINT "recipe_version_sub_recipe_line_sub_recipe_version_id_recipe_version_id_fk" FOREIGN KEY ("sub_recipe_version_id") REFERENCES "public"."recipe_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "production_run_org_idx" ON "production_run" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "production_run_recipe_version_idx" ON "production_run" USING btree ("recipe_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "purchasable_item_org_category_name_uidx" ON "purchasable_item" USING btree ("organization_id","category","name_normalized");--> statement-breakpoint
CREATE INDEX "purchasable_item_org_idx" ON "purchasable_item" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "purchasable_item_allergen_item_code_uidx" ON "purchasable_item_allergen" USING btree ("item_id","allergen_code");--> statement-breakpoint
CREATE UNIQUE INDEX "purchasable_item_conversion_item_unit_uidx" ON "purchasable_item_conversion" USING btree ("item_id","from_unit");--> statement-breakpoint
CREATE INDEX "purchase_entry_org_idx" ON "purchase_entry" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "purchase_entry_item_purchased_at_idx" ON "purchase_entry" USING btree ("item_id","purchased_at");--> statement-breakpoint
CREATE INDEX "recipe_org_idx" ON "recipe" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_version_recipe_version_number_uidx" ON "recipe_version" USING btree ("recipe_id","version_number");--> statement-breakpoint
CREATE INDEX "recipe_version_org_idx" ON "recipe_version" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "recipe_version_item_line_recipe_idx" ON "recipe_version_item_line" USING btree ("recipe_version_id");--> statement-breakpoint
CREATE INDEX "recipe_version_sub_recipe_line_recipe_idx" ON "recipe_version_sub_recipe_line" USING btree ("recipe_version_id");