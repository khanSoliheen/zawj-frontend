# Frontend Architecture

## Scope

This document describes the current structure of the Expo client in `frontend/`. It is grounded in the current Rust-backend-over-HTTP architecture.

## Folder Layout

```text
frontend/
  app/
    (auth)/
    (tabs)/
    screens/
    assets/
    _layout.tsx
    index.tsx
  src/
    chat/
    components/
    constants/
    hooks/
    interface/
    services/
    store/
    types/
    utils/
    i18n.ts
  test/
  AGENTS.md
  PLANS.md
  README.md
  app.json
  jest.config.cjs
  tsconfig.json
```

## Route Boundaries

- `app/` is reserved for Expo Router route modules.
- `app/(auth)/` contains login and the five-step registration flow.
- `app/(tabs)/` contains the protected tab shell and tab child screens.
- `app/screens/` contains non-tab protected routes such as settings and support.
- `app/assets/` holds fonts and images that are loaded through the theme system.

Route files can compose shared code from `src/`, but shared business logic must not be created inside route folders.

## Shared Code Boundaries

- `src/components/` contains reusable UI primitives such as `Block`, `Text`, `Button`, `Input`, `Image`, `Switch`, and `Checkbox`.
- `src/constants/` contains theme tokens, route constants, translation assets, and theme typings.
- `src/hooks/` contains provider-backed hooks and app-level state wrappers.
- `src/services/` contains service abstractions. `session.ts` is authoritative for auth-session behavior.
- `src/store/` contains shared state containers. The current shared store is the Zustand registration flow state.
- `src/utils/` contains framework-adjacent helpers such as navigation redirect logic and general utilities.
- `src/chat/` contains pure chat-mapping utilities and date grouping helpers.

## App Boot Flow

App initialization is centered in `app/_layout.tsx`.

1. `src/i18n.ts` is imported at boot to initialize translations.
2. `DataProvider` hydrates the persisted dark-mode flag from AsyncStorage.
3. `AuthProvider` hydrates the current user through `SessionService.getCurrentUser()`.
4. `ToastProvider` wraps the app for global success/error/info toasts.
5. `NavigationGate` uses `getNavigationRedirect()` to protect private routes and bounce authenticated users away from auth routes.

The boot flow must remain safe when no authenticated session exists.

## State Ownership

- Auth state: `src/hooks/userContext.tsx`
- Theme preference and theme object: `src/hooks/useData.tsx`
- Theme context wrapper: `src/hooks/useTheme.tsx`
- Toast state: `src/hooks/toaster.tsx`
- Registration multi-step form state: `src/store/registration.tsx`
- Pagination, refresh, and filter state for route screens: local component state

Do not introduce a second global store for concerns already owned by a provider or the registration store.

## Navigation Map

Public routes:

- `/`
- `/login`
- `/register/step1`
- `/register/step2`
- `/register/step3`
- `/register/step4`
- `/register/step5`

Protected tab routes:

- `/users`
- `/chat`
- `/preferences`
- `/profile`

Protected detail and support routes:

- `/users/[id]`
- `/chat/[id]`
- `/screens/settings/**`
- `/screens/support`

Route constants live in `src/constants/routes.ts`. Auth redirect logic lives in `src/utils/navigation.ts`.

## Data Flow

Current data access is service-first through the Rust backend.

Auth and session:

- `src/services/session.ts` wraps backend auth/session endpoints.
- `AuthProvider` depends on `SessionService`, not on `fetch` directly.

REST services:

- `src/services/api.ts`, `src/services/auth.ts`, `src/services/users.ts`, `src/services/chat.ts`, and `src/services/settings.ts` are the main backend integration boundary.
- Route screens should consume these services rather than talking to backend APIs directly.

Do not add new direct Supabase-style product flows.

## Environment Handling

- Expo-public client env belongs in `.env.example` as `EXPO_PUBLIC_*`.
- The backend base URL is controlled through `EXPO_PUBLIC_API_BASE_URL`.
- New work should document env changes and avoid adding hardcoded credentials.
- Server-only secrets belong outside this client app.

## Theme And Asset System

- Theme tokens are defined in `src/constants/light.ts`, `src/constants/dark.ts`, and `src/constants/theme.ts`.
- OpenSans fonts and most image assets are loaded through the theme object.
- Shared UI components read colors, sizing, fonts, and spacing from `useData()`.

Avoid route-local theme forks or alternate token systems.

## Build And Release Constraints

- The app is currently Expo-managed.
- No `ios/` or `android/` directories are committed in this workspace.
- Expo Router typed routes are enabled in `app.json`.
- Native-risky work, Expo config changes, SDK upgrades, and new runtime dependencies should be planned before implementation.

## Known Architectural Debt

- There may still be legacy references from the earlier migration, but the supported pattern is service-layer HTTP access to the Rust backend.
- There are existing barrel exports in shared areas, so internal imports must still be checked for cycles.
- `app/assets/` exists under the route tree because theme asset loading currently references those files directly.
