# ADR 0002: Make Business Data Org-Scoped And Historically Versioned

## Status

Accepted

## Context

The product must support:

- solo bakers and shared bakeries
- historical price tracking
- historical recipe costing
- future invoices and labels
- multi-user collaboration

Mutable in-place business records would make historical results unstable.

## Decision

Adopt these rules:

- every business record carries `organization_id`
- purchasable items are org-scoped
- purchase entries are append-only historical facts
- every recipe save creates a new `recipe_version`
- sub-recipes pin to specific versions
- production runs save calculation snapshots when persisted

## Consequences

### Positive

- reliable historical costing
- safer multi-user collaboration
- cleaner basis for future invoices and labels
- clear boundaries for multi-bakery membership

### Negative

- more tables and write-path complexity
- version management UX must be handled intentionally
- snapshot invalidation and outdated-draft states must be surfaced clearly
