# ADR 0004: Use A Shared Pure TypeScript Costing Engine

## Status

Accepted

## Context

The application needs:

- instant costing previews while editing
- authoritative saved production-run and recipe snapshots
- reproducible and testable calculations

Putting calculations only in the client risks drift and trust issues. Putting them only on the server risks a sluggish editing UX.

## Decision

Implement the costing engine as a pure TypeScript library that:

- accepts normalized inputs
- performs no I/O
- is reusable in both server and client contexts

The server remains authoritative when persisting snapshots.

## Consequences

### Positive

- one calculation implementation
- strong unit and regression testability
- fast client previews
- less risk of server/client divergence

### Negative

- input normalization must be done carefully outside the engine
- boundaries between querying and calculation must stay disciplined
