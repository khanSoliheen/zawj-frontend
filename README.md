# Zawj Frontend

Expo Router React Native client for Zawj, an Islamic matrimonial app focused on halal onboarding, profile discovery, chat, and account management.

This app currently lives in `frontend/` inside a larger repository. If you start from the repo root, `cd frontend` before using the commands below.

## Stack

- Expo SDK 55
- React Native 0.83
- React 19
- Expo Router
- TypeScript
- React Hook Form + Zod
- Zustand
- Rust Actix backend over HTTP
- Jest + `jest-expo`

## Prerequisites

- Node version from `.nvmrc` at the frontend root
- `pnpm` `10.33.0`
- Xcode Simulator for iOS work
- Android Studio emulator for Android work

## Install

```bash
cd frontend
pnpm install
```

## Run The App

```bash
pnpm start
pnpm ios
pnpm android
pnpm web
```

Notes:

- `pnpm start` launches the Expo dev server and QR flow.
- `pnpm ios` and `pnpm android` open the Expo dev server and target the active simulator/emulator.
- The project currently uses the Expo-managed workflow. There are no committed `ios/` or `android/` directories.

## Environment

Copy values from `.env.example` into your local env setup before testing auth or backend-connected flows.

Client-side env rules:

- Only `EXPO_PUBLIC_*` values belong in this app.
- Backend-only secrets belong outside this app and must never be committed here.

## Validation Commands

Use these exact commands for non-mutating validation:

```bash
pnpm exec eslint app src test --ext .js,.ts,.tsx --max-warnings=0
pnpm exec tsc --noEmit
pnpm exec jest --runInBand --passWithNoTests=false
pnpm test:coverage
```

Local helper scripts:

```bash
pnpm lint         # runs eslint with --fix
pnpm typecheck
pnpm test
```

Coverage thresholds are enforced in `jest.config.cjs`.

## Repo Structure

- `app/`: Expo Router route modules only
- `app/assets/`: images, icons, and fonts
- `src/components/`: shared UI primitives and composite components
- `src/constants/`: theme tokens, route constants, translations
- `src/hooks/`: auth, theme, toast, and app providers
- `src/services/`: session and REST service wrappers for auth, users, chat, settings, and support
- `src/store/`: shared state containers
- `src/utils/`: navigation and general helpers
- `src/chat/`: chat-specific pure utilities
- `test/`: Jest tests grouped by feature

## Core Flows

- Welcome and login
- Five-step registration
- Protected user browsing and user detail views
- Chat list and chat detail
- Preferences, profile, and settings routes
- Theme toggle, session management, and support routes

## Working Rules

- Follow `AGENTS.md` for repo-specific engineering constraints.
- Keep shared code in `src/`, not under `app/`.
- Prefer existing UI primitives and theme tokens over new abstractions.
- Use `src/services/session.ts` for auth/session work.
- If you change a function or service contract, update affected callers, tests, mocks, and docs in the same change.
- Write or update tests when changing auth, routing, registration, settings, chat, or shared state.

## Troubleshooting

- If Metro acts stale, delete `.expo/` and restart `pnpm start`.
- If auth or data screens fail immediately, confirm local env values first.
- If fonts or assets do not load, check imports in `src/constants/theme.ts`.
- If route imports break, verify the `@/*` aliases in `tsconfig.json` and `jest.config.cjs`.
- If CI commands fail locally because you started from the repo root, rerun them from `frontend/`.

## Additional Docs

- `AGENTS.md`
- `PLANS.md`
- `docs/architecture.md`
- `docs/product.md`
- `docs/testing.md`
- `docs/ui-system.md`
- `docs/api-contracts.md`
- `docs/contributing.md`
