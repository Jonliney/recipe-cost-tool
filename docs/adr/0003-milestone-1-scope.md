# ADR 0003: Ship Ingredient-First Costing Before Labor And Equipment

## Status

Accepted

## Context

The full product vision includes:

- ingredients and packaging
- labor roles and timed steps
- equipment capacities and utility cost
- production run planning
- actual-vs-planned comparison

Trying to ship all of this together would increase both math complexity and UI complexity materially.

## Decision

Milestone 1 includes:

- orgs and auth
- purchasable items for ingredients and packaging
- dated purchase history
- recipe versioning
- sub-recipes
- production runs with target output
- markup, rounding, and VAT

Milestone 2 adds:

- staff role costing
- equipment and electricity costing
- passive timed steps
- actual-vs-planned production runs

## Consequences

### Positive

- earlier usable release
- smaller initial domain surface
- clearer TDD focus on the core cost engine

### Negative

- milestone 1 costings will omit labor and utility costs unless entered later
- some users will need a second milestone before the tool matches their full process
