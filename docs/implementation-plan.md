# Implementation Plan

## Goal

Build a UK-first recipe costing tool for independent bakers and bakeries with:

- authentication and bakery membership
- reusable purchasable catalogs for ingredients and packaging
- dated purchase history for reproducible costing
- versioned recipes and pinned sub-recipes
- production runs driven by target output
- markup, rounding, and VAT-aware selling price suggestions

## Product Principles

- Optimize for simple home-baker flows first.
- Keep historical costs reproducible.
- Default to org-scoped data everywhere.
- Make ingredient-only costing valid; labor and equipment are additive.
- Prefer explicit modelling over clever inference when numbers matter.

## Non-Goals For Initial Release

- inventory depletion or stock accounting
- public sharing links
- invoice generation
- label printing
- CSV import/export
- detailed employee payroll modelling
- concurrency-aware production scheduling
- custom theming

## Stack

- `Next.js` App Router
- `TypeScript`
- `Neon Postgres`
- `Drizzle ORM`
- `Better Auth` with organization support
- `shadcn/ui` and Tailwind
- shared pure TypeScript costing library used by client previews and server persistence

## Milestone 1

Milestone 1 ships the first usable costing workflow.

### Included

- auth with email/password
- invite-by-email bakery membership
- bakery onboarding
- active bakery switcher for multi-org users
- org-scoped purchasable catalog
- purchasable categories: `ingredient`, `packaging`
- supplier pack purchases with dated history
- ingredient allergens and unit conversions
- recipe lineage plus append-only recipe versions
- sub-recipes pinned to specific versions
- production runs with:
  - target output
  - optional whole-batches mode
  - saved calculation snapshots
  - outdated-draft detection
- pricing outputs:
  - raw production cost
  - cost per portion / sale unit
  - markup
  - configurable rounding
  - VAT/tax outputs

### Deferred To Milestone 2

- staff role costing
- equipment and electricity costing
- passive timed steps
- planned vs actual production runs
- outdated sub-recipe warnings beyond basic draft stale-state

## Milestone 2

Milestone 2 expands the costing model beyond ingredients and packaging.

### Included

- staff roles and dated wage rates
- labor steps with explicit scaling modes
- equipment catalog and electricity profiles
- utility rates, initially centered on electricity
- passive steps and equipment occupancy time
- production run actuals vs plan

### Still Deferred

- full parallel scheduling
- inventory
- invoices
- labels

## Workstreams

### 1. Foundations

- scaffold Next.js app
- set up Drizzle, Neon, migrations, seed flow
- integrate Better Auth and org membership
- set up testing, linting, and CI baseline

### 2. Domain Model

- orgs, memberships, invites
- purchasable items and purchase entries
- ingredient allergen mappings
- ingredient conversion tables
- recipes, versions, line items, sub-recipe links
- production runs and calculation snapshots

### 3. Costing Engine

- latest applicable purchase lookup
- canonical unit conversion
- recursive sub-recipe expansion
- output scaling
- markup, rounding, VAT calculation
- stale draft detection inputs

### 4. Product Flows

- onboarding
- purchasable item management
- purchase entry management
- recipe editor
- production run creation and review

### 5. Reporting Surface

- item price history
- recipe cost breakdown
- production run snapshot breakdown

## Acceptance Criteria For Milestone 1

- a user can sign up, create a bakery, and invite another member
- a bakery can create ingredients and packaging items
- a bakery can record dated supplier pack purchases
- a bakery can create a recipe version using ingredients and sub-recipes
- the system can cost a recipe using the latest applicable prices
- the system can create a production run from target output
- saved production runs preserve their cost snapshots
- a user can see total cost, per-portion cost, markup output, and VAT output
- the costing engine is covered by regression tests for representative bakery scenarios

## TDD Strategy

- write the costing engine test-first
- keep calculation tests table-driven
- encode regression fixtures for:
  - dated price lookup
  - nested sub-recipes
  - target-output scaling
  - whole-batches mode
  - markup and rounding strategies
  - VAT-inclusive and VAT-exclusive outputs
- use lighter integration coverage for auth and CRUD flows

## Suggested Build Order

1. Scaffold app, auth, org context, and database plumbing.
2. Build purchasable items and dated purchase entries.
3. Build the costing engine around direct ingredient costs.
4. Add recipe lineage, recipe versions, and sub-recipes.
5. Add production runs and snapshot persistence.
6. Add markup, rounding, and VAT outputs.
7. Tighten validation, draft/outdated handling, and regression fixtures.

## Open Later

- invoice generation
- allergen label printing
- global reference ingredient library
- public or semi-public quote sharing
- mobile/tablet API extraction
- richer production scheduling and parallel equipment modelling
