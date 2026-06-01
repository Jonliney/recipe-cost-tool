# ADR 0001: Use A Single Next.js Application Initially

## Status

Accepted

## Context

The product needs:

- authentication
- organization-scoped business data
- form-heavy CRUD
- a shared costing engine
- private authenticated routes

There is future interest in mobile and tablet clients, but no immediate need for a separate public API platform.

## Decision

Build the first version as a single `Next.js` App Router application with:

- server actions for core authenticated mutations
- route handlers for integration-style endpoints and future API-shaped seams
- Drizzle for database access
- Better Auth at the app boundary

## Consequences

### Positive

- fast delivery with low operational overhead
- one deployment surface
- fewer cross-service auth and consistency problems
- easier sharing of types and costing logic

### Negative

- future API extraction will still require deliberate refactoring
- careless implementation could over-couple business logic to UI

## Guardrails

- keep costing and domain workflows outside React components
- keep route handlers available where a future external API is likely
- keep auth and org resolution at the boundary
