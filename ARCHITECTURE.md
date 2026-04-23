# ARCHITECTURE.md

## Overview

This file is the short architectural entrypoint for the frontend.

For the detailed current-state map, read `docs/architecture.md`.
For durable project choices, read `ARCHITECTURE_DECISIONS.md`.

## Core Boundaries

- `app/` is the Expo Router route tree and route entry structure.
- `src/` holds shared implementation, reusable UI, hooks, services, store, constants, and utilities.
- `test/` holds the Jest suite.

## Non-Negotiable Rules

- Do not place shared TypeScript modules under `app/`.
- Keep auth/session boot safe when no user is logged in.
- Reuse the existing provider stack in `app/_layout.tsx`.
- Prefer existing services, hooks, stores, and components before adding new patterns.
- Preserve Expo-managed assumptions unless a task explicitly requires native work.

## Current Architectural Hotspots

- `app/_layout.tsx`
- `src/hooks/userContext.tsx`
- `src/services/session.ts`
- `src/utils/supabase.ts`
- `src/store/registration.tsx`
- `src/constants/routes.ts`
- `src/utils/navigation.ts`
