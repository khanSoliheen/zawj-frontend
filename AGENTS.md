# AGENTS.md

## Project Summary

This directory is the Expo Router React Native client for Zawj. Treat `frontend/` as the project root for install, run, lint, typecheck, and test commands.

Stay inside the Expo-managed workflow unless the task explicitly calls for native changes.

## Stack

- Expo SDK 55
- React Native 0.83
- React 19
- Expo Router
- TypeScript
- React Hook Form + Zod
- Zustand
- Rust Actix backend over HTTP for auth, profiles, users, chat, settings, and avatar flows
- Jest + `jest-expo`

## Repo Map

- `app/`: route entrypoints and route-only screen modules
- `app/(auth)/`: login and registration routes
- `app/(tabs)/`: protected tab routes and tab-only detail routes
- `app/screens/`: protected non-tab screens such as settings and support
- `app/assets/`: fonts, icons, and images consumed by the theme
- `src/components/`: shared UI primitives and composite UI
- `src/constants/`: theme tokens, routes, and translation assets
- `src/hooks/`: auth, theme, toast, and screen-level providers/hooks
- `src/services/`: service abstractions for session and backend REST clients
- `src/store/`: shared state containers, currently the registration flow store
- `src/utils/`: framework-adjacent helpers such as navigation and general utilities
- `src/chat/`: chat-specific pure mapping and grouping utilities
- `test/`: Jest tests grouped by feature area

## Commands

Run these from `frontend/`.

- install: `pnpm install`
- prepare: `pnpm prepare`
- start: `pnpm start`
- ios: `pnpm ios`
- android: `pnpm android`
- web: `pnpm web`
- reset-project: `pnpm reset-project`
- lint-fix: `pnpm lint`
- lint-check: `pnpm exec eslint app src test --ext .js,.ts,.tsx --max-warnings=0`
- typecheck: `pnpm exec tsc --noEmit`
- test: `pnpm exec jest --runInBand --passWithNoTests=false`
- test-watch: `pnpm test:watch`
- coverage: `pnpm test:coverage`

## Model Routing

- Keep model choice in `.codex/config.toml` and `.codex/agents/*.toml`.
- Use `gpt-5.4` for main implementation, architecture judgment, and risky changes.
- Prefer `gpt-5.4-mini` for narrow review, docs, and validation roles.
- Use high reasoning only for planning or cross-cutting work.
- Do not spin up extra agents for tiny edits when the main agent can complete them directly.

## Import Rules

- Use `@/` imports for shared modules.
- `@/*` resolves to `src/*` first, then `app/*` for route modules.
- Route files may import from `@/`.
- Shared modules inside `src/components` and `src/hooks` should prefer direct local imports over barrel imports if there is any chance of a require cycle.

## Route Tree Rules

- Every file under `app/` must be an actual route module.
- Every route module must export a valid default React component, or explicitly re-export one.
- Do not place utility files inside route folders.
- Chat utilities live in `src/chat/chat-utils.ts`, not under `app/(tabs)/chat`.
- Keep dynamic route helpers in `src/constants/routes.ts` or `src/utils/navigation.ts`, not inline across screens.
- Preserve Expo Router typed-route assumptions from `app.json`.
- Treat `app/assets/` as bundled app assets, not as a place for shared TypeScript modules.

## Architecture Rules

- Keep backend access out of reusable UI components.
- Prefer service-layer access for auth/session behavior.
- Session hydration must be safe when no user is logged in.
- Do not call auth APIs at boot that require an existing authenticated session.
- Avoid duplicate state systems for the same concern.
- Reuse the existing provider stack in `app/_layout.tsx`: `DataProvider`, `AuthProvider`, `ToastProvider`, then `ThemeProvider`.

## State Management Rules

- `src/hooks/userContext.tsx` owns authenticated user state and auth hydration.
- `src/hooks/useData.tsx` owns persisted theme mode and current theme object.
- `src/hooks/toaster.tsx` owns ephemeral toast presentation state.
- `src/store/registration.tsx` is the only shared store for the multi-step registration flow.
- Keep fetch state, pagination state, and input state local to route screens unless multiple routes truly share it.

## Navigation Rules

- `src/constants/routes.ts` is the source of truth for route constants and builders.
- `src/utils/navigation.ts` owns auth redirect logic for app boot and route gating.
- Public routes live under `app/` and `app/(auth)`.
- Protected routes currently include the tab group and `app/screens/**`.
- Any route-tree refactor, segment rename, or redirect change needs a written plan in `PLANS.md` first.

## API And Data Rules

- `src/services/session.ts` is the frontend session abstraction and should remain the entrypoint for auth-session behavior.
- Prefer `src/services/api.ts`, `src/services/auth.ts`, `src/services/users.ts`, `src/services/chat.ts`, and `src/services/settings.ts` for backend access.
- Do not add new direct Supabase calls for product flows. Treat any remaining Supabase references as migration debt to remove, not a valid pattern to expand.
- Prefer editing existing services, hooks, stores, and components before introducing a new pattern or folder.
- Keep request/response shaping at the service or utility boundary, not inside reusable components.
- Handle missing sessions and backend errors explicitly. Surface user-facing failures through existing inline errors or toasts.

## UI And Component Rules

- Reuse `Block`, `Text`, `Button`, `Input`, `Image`, `Switch`, and `Checkbox` before creating new primitives.
- Keep business logic out of presentational components.
- Use theme tokens from `src/constants/light.ts`, `src/constants/dark.ts`, and `src/constants/theme.ts`; avoid hardcoding new spacing or colors in screens when a token already exists.
- Preserve OpenSans font usage and theme-driven light/dark behavior.
- Support loading, empty, and error states for user-facing async work.
- Preserve accessibility/test ids exposed through custom component `id` props.

## Security And Secrets Rules

- Only `EXPO_PUBLIC_*` values belong in the Expo client environment.
- Never commit service-role keys, database passwords, or backend-only tokens.
- Do not add new hardcoded secrets. Remove legacy hardcoded backend or Supabase config rather than copying the pattern.
- Keep auth/session changes inside the session layer and document any env or credential changes in `.env.example`.

## Changes That Need Approval

- Expo SDK upgrades or package-manager changes
- Adding runtime dependencies
- Editing `app.json`, deep-link scheme, or router structure
- Introducing or editing `ios/` or `android/`
- Changing auth boot logic, session persistence, or redirect rules
- Moving shared code across the `app/` and `src/` boundary
- Lowering lint, typecheck, or coverage standards

## Testing Rules

- Add or update tests for behavior changes.
- When changing any function, service method, hook contract, route contract, or shared utility, update all impacted call sites, tests, mocks, and docs in the same change.
- Do not leave stale tests or mocks pointing at an old implementation path after a refactor.
- Keep `PLANS.md` route-audit backlog items in sync with reality. When a tracked page gap is fully fixed and validated, update or remove the item in the same change.
- For any frontend UI change, also check layout, spacing, and visual alignment so the final screen is not functionally correct but visually off.
- For auth, routing, registration, chat, settings, and shared-state changes, add regression coverage when practical.
- Use Jest mocks at the boundary. Do not make real network or Supabase calls in tests.
- Keep coverage thresholds in `jest.config.cjs` passing.

## Agent Workflow

Before broad refactors:

1. inspect affected files
2. identify whether the change touches route files or shared modules
3. preserve the `app/` vs `src/` boundary
4. read `ARCHITECTURE.md`, `ARCHITECTURE_DECISIONS.md`, and `docs/architecture.md` if the change is structural
5. write a short plan in `PLANS.md` for navigation, auth, state, theme, or native-risk work

Before finishing work:

1. ensure imports still resolve through `tsconfig.json`
2. ensure Expo Router is not picking up non-route files from `app/`
3. update affected tests, mocks, and docs for any changed contract or behavior
4. run lint, typecheck, and relevant Jest coverage for the scope

## Done Criteria

- feature or fix behaves as requested
- route boundaries and shared-module boundaries stay intact
- no new secrets or env regressions are introduced
- lint passes
- typecheck passes
- changed tests pass, with coverage updated when risk area changed
- docs are updated when architecture, workflow, or env expectations changed

## Do Not Do

- Do not put new shared code under `app/`.
- Do not reintroduce `@/components` or `@/hooks` barrel imports inside component internals if they create cycles.
- Do not add placeholder files under `app/` without a default export.
- Do not bypass the session layer for app boot logic.
- Do not casually switch the app from Expo-managed assumptions to native-only assumptions.
