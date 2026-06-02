import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { organization, user } from "./auth";

export const roundingModeEnum = pgEnum("rounding_mode", [
  "none",
  "increment",
  "price_ending",
]);

export const purchasableItemCategoryEnum = pgEnum("purchasable_item_category", [
  "ingredient",
  "packaging",
]);

export const recipeVersionStatusEnum = pgEnum("recipe_version_status", [
  "draft",
  "active",
  "archived",
]);

export const productionRunStatusEnum = pgEnum("production_run_status", [
  "draft",
  "planned",
  "completed",
]);

export const organizationSettings = pgTable("organization_settings", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  countryCode: text("country_code").notNull().default("GB"),
  locale: text("locale").notNull().default("en-GB"),
  currencyCode: text("currency_code").notNull().default("GBP"),
  vatRegistered: boolean("vat_registered").notNull().default(false),
  defaultTaxRate: numeric("default_tax_rate", {
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default("0.00"),
  defaultMarkupPercentage: numeric("default_markup_percentage", {
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default("0.00"),
  roundingMode: roundingModeEnum("rounding_mode").notNull().default("none"),
  roundingIncrement: numeric("rounding_increment", {
    precision: 10,
    scale: 2,
  }),
  roundingPriceEnding: numeric("rounding_price_ending", {
    precision: 10,
    scale: 2,
  }),
  handledAllergens: text("handled_allergens")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  updatedBy: text("updated_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const purchasableItem = pgTable(
  "purchasable_item",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    category: purchasableItemCategoryEnum("category").notNull(),
    name: text("name").notNull(),
    nameNormalized: text("name_normalized").notNull(),
    canonicalUnit: text("canonical_unit").notNull(),
    notes: text("notes"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    uniqueIndex("purchasable_item_org_category_name_uidx")
      .on(table.organizationId, table.category, table.nameNormalized)
      .where(sql`${table.deletedAt} IS NULL`),
    index("purchasable_item_org_idx").on(table.organizationId),
  ],
);

export const purchasableItemAllergen = pgTable(
  "purchasable_item_allergen",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id")
      .notNull()
      .references(() => purchasableItem.id, { onDelete: "cascade" }),
    allergenCode: text("allergen_code").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("purchasable_item_allergen_item_code_uidx").on(
      table.itemId,
      table.allergenCode,
    ),
  ],
);

export const purchasableItemConversion = pgTable(
  "purchasable_item_conversion",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id")
      .notNull()
      .references(() => purchasableItem.id, { onDelete: "cascade" }),
    fromUnit: text("from_unit").notNull(),
    canonicalQuantity: numeric("canonical_quantity", {
      precision: 12,
      scale: 4,
    }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("purchasable_item_conversion_item_unit_uidx").on(
      table.itemId,
      table.fromUnit,
    ),
  ],
);

export const purchaseEntry = pgTable(
  "purchase_entry",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    itemId: text("item_id")
      .notNull()
      .references(() => purchasableItem.id, { onDelete: "cascade" }),
    supplierName: text("supplier_name"),
    packCount: integer("pack_count").notNull().default(1),
    packQuantity: numeric("pack_quantity", {
      precision: 12,
      scale: 4,
    }).notNull(),
    packUnit: text("pack_unit").notNull(),
    totalQuantityCanonical: numeric("total_quantity_canonical", {
      precision: 12,
      scale: 4,
    }).notNull(),
    totalPrice: numeric("total_price", {
      precision: 12,
      scale: 2,
    }).notNull(),
    purchasedAt: timestamp("purchased_at").notNull(),
    notes: text("notes"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("purchase_entry_org_idx").on(table.organizationId),
    index("purchase_entry_item_purchased_at_idx").on(
      table.itemId,
      table.purchasedAt,
    ),
  ],
);

export const recipe = pgTable(
  "recipe",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    forkedFromRecipeId: text("forked_from_recipe_id"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [index("recipe_org_idx").on(table.organizationId)],
);

export const recipeVersion = pgTable(
  "recipe_version",
  {
    id: text("id").primaryKey(),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipe.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    status: recipeVersionStatusEnum("status").notNull().default("draft"),
    batchYieldQuantity: numeric("batch_yield_quantity", {
      precision: 12,
      scale: 4,
    }).notNull(),
    batchYieldUnit: text("batch_yield_unit").notNull(),
    saleUnitName: text("sale_unit_name").notNull(),
    portionsPerBatch: numeric("portions_per_batch", {
      precision: 12,
      scale: 4,
    }).notNull(),
    markupPercentageOverride: numeric("markup_percentage_override", {
      precision: 5,
      scale: 2,
    }),
    costSnapshot: jsonb("cost_snapshot").$type<Record<string, unknown> | null>(),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    uniqueIndex("recipe_version_recipe_version_number_uidx").on(
      table.recipeId,
      table.versionNumber,
    ),
    index("recipe_version_org_idx").on(table.organizationId),
  ],
);

export const recipeVersionItemLine = pgTable(
  "recipe_version_item_line",
  {
    id: text("id").primaryKey(),
    recipeVersionId: text("recipe_version_id")
      .notNull()
      .references(() => recipeVersion.id, { onDelete: "cascade" }),
    itemId: text("item_id")
      .notNull()
      .references(() => purchasableItem.id, { onDelete: "restrict" }),
    quantity: numeric("quantity", {
      precision: 12,
      scale: 4,
    }).notNull(),
    unit: text("unit").notNull(),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("recipe_version_item_line_recipe_idx").on(table.recipeVersionId),
  ],
);

export const recipeVersionSubRecipeLine = pgTable(
  "recipe_version_sub_recipe_line",
  {
    id: text("id").primaryKey(),
    recipeVersionId: text("recipe_version_id")
      .notNull()
      .references(() => recipeVersion.id, { onDelete: "cascade" }),
    subRecipeVersionId: text("sub_recipe_version_id")
      .notNull()
      .references(() => recipeVersion.id, { onDelete: "restrict" }),
    quantity: numeric("quantity", {
      precision: 12,
      scale: 4,
    }).notNull(),
    unit: text("unit").notNull(),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("recipe_version_sub_recipe_line_recipe_idx").on(table.recipeVersionId),
  ],
);

export const productionRun = pgTable(
  "production_run",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    recipeVersionId: text("recipe_version_id")
      .notNull()
      .references(() => recipeVersion.id, { onDelete: "restrict" }),
    status: productionRunStatusEnum("status").notNull().default("draft"),
    targetOutputQuantity: numeric("target_output_quantity", {
      precision: 12,
      scale: 4,
    }).notNull(),
    targetOutputUnit: text("target_output_unit").notNull(),
    scaleFactor: numeric("scale_factor", {
      precision: 12,
      scale: 4,
    }).notNull(),
    wholeBatchesOnly: boolean("whole_batches_only").notNull().default(false),
    resolvedBatchCount: numeric("resolved_batch_count", {
      precision: 12,
      scale: 4,
    }).notNull(),
    costSnapshot: jsonb("cost_snapshot").$type<Record<string, unknown> | null>(),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    completedAt: timestamp("completed_at"),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("production_run_org_idx").on(table.organizationId),
    index("production_run_recipe_version_idx").on(table.recipeVersionId),
  ],
);

export const organizationSettingsRelations = relations(
  organizationSettings,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationSettings.organizationId],
      references: [organization.id],
    }),
  }),
);

export const purchasableItemRelations = relations(
  purchasableItem,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [purchasableItem.organizationId],
      references: [organization.id],
    }),
    purchaseEntries: many(purchaseEntry),
    allergens: many(purchasableItemAllergen),
    conversions: many(purchasableItemConversion),
  }),
);

export const purchaseEntryRelations = relations(purchaseEntry, ({ one }) => ({
  item: one(purchasableItem, {
    fields: [purchaseEntry.itemId],
    references: [purchasableItem.id],
  }),
  organization: one(organization, {
    fields: [purchaseEntry.organizationId],
    references: [organization.id],
  }),
}));

export const recipeRelations = relations(recipe, ({ one, many }) => ({
  organization: one(organization, {
    fields: [recipe.organizationId],
    references: [organization.id],
  }),
  versions: many(recipeVersion),
}));

export const recipeVersionRelations = relations(recipeVersion, ({ one, many }) => ({
  recipe: one(recipe, {
    fields: [recipeVersion.recipeId],
    references: [recipe.id],
  }),
  organization: one(organization, {
    fields: [recipeVersion.organizationId],
    references: [organization.id],
  }),
  itemLines: many(recipeVersionItemLine),
  subRecipeLines: many(recipeVersionSubRecipeLine),
  productionRuns: many(productionRun),
}));

export const productionRunRelations = relations(productionRun, ({ one }) => ({
  organization: one(organization, {
    fields: [productionRun.organizationId],
    references: [organization.id],
  }),
  recipeVersion: one(recipeVersion, {
    fields: [productionRun.recipeVersionId],
    references: [recipeVersion.id],
  }),
}));
