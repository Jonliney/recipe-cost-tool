# Architecture

## High-Level Shape

The app starts as a single `Next.js` codebase with clear internal boundaries:

- `app/`: routes, layouts, forms, server actions, route handlers
- `lib/auth/`: Better Auth integration and org-context resolution
- `lib/db/`: Drizzle schema, queries, migrations, transaction helpers
- `lib/domain/`: business rules and service orchestration
- `lib/costing/`: pure calculation logic shared by client and server
- `components/`: composed `shadcn/ui` views without modifying generated primitives

## Core Architectural Rules

- All business data is scoped by `organization_id`.
- The active bakery context is resolved server-side.
- Recipe definitions are append-only through `recipe_versions`.
- Production runs store cost snapshots when saved.
- Costing logic is pure and reusable across client previews and server persistence.
- Soft deletion is preferred over hard deletion for business records.

## Tenancy

Users may belong to multiple bakeries, but all screens operate in one active bakery context at a time.

Every business record must carry `organization_id`, including:

- purchasable items
- purchase entries
- recipes
- recipe versions
- production runs
- staff roles
- equipment
- utility rates

## Domain Model

### Organizations

- `users`
- `organizations`
- `memberships`
- `invitations`

Roles for the first release:

- `owner`
- `member`

### Purchasable Catalog

Shared base model:

- `purchasable_items`
  - `category`: `ingredient | packaging`
  - canonical unit
  - soft delete fields
  - audit metadata

Supporting records:

- `purchase_entries`
  - supplier
  - pack count
  - pack size
  - normalized total quantity
  - total price
  - purchased at timestamp
- `ingredient_allergens`
- `ingredient_conversions`

Key rules:

- active purchasable item names are unique case-insensitively per bakery
- purchase entries are append-only historical facts
- recipe costing uses the latest applicable purchase on or before the costing date

### Recipes

- `recipes`
  - stable lineage identity
  - display name
- `recipe_versions`
  - append-only saved definitions
  - status: `draft | active | archived`
  - sale unit metadata
  - yield metadata
  - calculation snapshot
- `recipe_version_item_lines`
  - direct ingredient/packaging references
- `recipe_version_sub_recipe_lines`
  - pinned `recipe_version_id`

Key rules:

- every save creates a new recipe version
- duplicate recipe names are allowed
- sub-recipes are pinned to specific versions
- sub-recipes are acyclic
- nesting depth is capped at 5

### Production Runs

- `production_runs`
  - target output
  - resolved scale factor
  - optional whole-batches mode
  - status: `draft | planned | completed`
  - saved calculation snapshot
  - stale/outdated markers or source fingerprints

Key rules:

- drafts may be recalculated
- saved runs do not change silently when prices or sub-recipes change
- recalculation is explicit

### Pricing

Organization-level pricing settings:

- default markup percentage
- default rounding strategy
- VAT registration state
- default tax rate
- currency
- locale/country

Recipe versions may override pricing defaults later without breaking the core inheritance model.

## Costing Engine Responsibilities

The costing engine should accept normalized domain inputs and return:

- total cost
- cost breakdown by bucket
- cost per sale unit
- markup output
- rounded selling price
- VAT/tax outputs
- trace data explaining which purchases and sub-recipes were used

The engine should not:

- query the database directly
- resolve auth or tenancy
- mutate persistent records

## Validation Model

Block costing when:

- yield is missing
- a required conversion is missing
- a referenced purchasable item has no applicable price
- a sub-recipe cycle would be created

Allow drafts with warnings for:

- missing labor/equipment details
- missing packaging
- missing markup

## Soft Delete Strategy

Use `deleted_at` timestamps broadly. Default queries exclude deleted rows. Historical references remain intact.

For milestone 1, deleted records do not need restore UI.

## Internationalization Strategy

The first release is UK-first:

- UK copy and defaults
- VAT terminology
- UK allergen baseline
- metric-first assumptions

But the domain model remains parameterized by bakery locale, currency, and tax settings.
