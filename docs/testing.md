# Testing Strategy

## Current Tooling

- Jest
- `jest-expo`
- `react-test-renderer`
- Feature-organized tests in `test/`

Primary validation commands:

```bash
pnpm exec eslint app src test --ext .js,.ts,.tsx --max-warnings=0
pnpm exec tsc --noEmit
pnpm exec jest --runInBand --passWithNoTests=false
pnpm test:coverage
```

Coverage thresholds are enforced in `jest.config.cjs`.

## What To Test

- Auth hydration, login, logout, and redirect behavior
- Route layout behavior and guarded navigation
- Registration store behavior and multi-step registration screens
- Chat mapping utilities and chat screens
- Settings and support routes with meaningful UI behavior
- Shared helpers such as route builders and navigation decisions
- Any new reducer, store, or service logic introduced by a change
- Any affected callers, mocks, and regression paths when a shared function or contract changes

## What Not To Test Directly

- Expo Router internals
- Third-party library behavior that is already mocked in `jest.setup.ts`
- Static asset imports
- Cosmetic style minutiae that do not affect behavior
- Snapshot-only tests for large screens without an assertion on behavior

## Test Style

- Prefer behavior-driven assertions over implementation details.
- For bug fixes, add a regression test when practical.
- For refactors, update stale mocks and test setup at the same time as the production code.
- Keep route tests focused on the contract the screen exposes.
- Keep pure utility tests small and explicit.

## Mocking Strategy

- Mock `@/utils/supabase` at the boundary for auth and data-layer tests.
- Mock `fetch` or service wrappers for REST-style calls instead of hitting a real backend.
- Reuse the global mocks in `jest.setup.ts` for AsyncStorage, Expo Router, fonts, haptics, blur, gradients, and reanimated.
- Do not make live network calls in tests.

## Screen Test Guidance

- Assert on navigation intent, form validation, and user-visible content.
- Prefer testing through the route component rather than through deep component internals.
- When a screen depends on providers, wrap it with the minimum providers needed for the behavior under test.
- Verify loading, empty, success, and error states when the route is stateful.

## When Full Validation Is Required

Run the full lint, typecheck, and Jest flow whenever a change touches:

- auth or session boot
- route groups or redirects
- registration
- settings
- chat
- shared providers
- shared stores
- shared utilities used by multiple routes
- any shared function signature or service contract

## Manual Smoke Checks

There is no dedicated e2e harness yet. For higher-risk UI changes, manually verify in Expo:

- unauthenticated route gating
- login and logout
- registration submit path
- users list refresh and pagination
- chat list and chat detail rendering
- settings navigation and dark-mode toggle

## Coverage Expectations

- Keep global coverage thresholds passing.
- Keep file-specific thresholds in `jest.config.cjs` passing.
- Do not add meaningless tests just to satisfy coverage.
- Prefer meaningful coverage on auth, navigation, registration, chat, settings, and stateful flows first.
