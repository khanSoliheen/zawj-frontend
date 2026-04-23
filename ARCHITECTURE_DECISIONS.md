# ARCHITECTURE_DECISIONS.md

## Purpose

Use this file to record project-level architectural decisions that affect how agents and contributors should extend the codebase.

## Decision Template

### Title

Short decision title.

### Status

Accepted | Superseded | Proposed

### Context

What problem or constraint led to this decision.

### Decision

What was chosen.

### Consequences

What this improves, constrains, or requires.

## Current Decisions

### Route Tree Isolation

Status: Accepted

Context:
Expo Router treated shared modules under `app/` as route files and produced route warnings.

Decision:
Keep `app/` route-only and move shared code into `src/`.

Consequences:
- fewer route warnings
- cleaner routing model
- stricter separation between route modules and shared code

### Shared Import Strategy

Status: Accepted

Context:
The project needs a stable import path for both shared modules and route tests.

Decision:
Use `@/` imports with `src/*` resolution first and `app/*` fallback for route modules.

Consequences:
- shared code stays outside the route tree
- tests can still import route modules cleanly

### Frontend Session Hydration Safety

Status: Accepted

Context:
App boot was failing when no authenticated session existed.

Decision:
Session hydration must use flows that are safe when logged out.

Consequences:
- app boot is stable without an active user
- auth/session logic should remain centralized in the session layer
