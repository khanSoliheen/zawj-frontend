# API And Data Contracts

## Scope

The current frontend talks to the Rust backend over HTTP through service wrappers in `src/services/`.

This document describes the current contract so future work does not reintroduce a competing data path.

## Auth Contract

Authoritative client auth layer:

- `src/services/session.ts`

Backed by:

- `src/services/api.ts`

Current responsibilities:

- get current session
- map backend auth responses into the frontend `SessionUser` shape
- sign in
- register
- sign out with local, global, or others scope
- subscribe to auth-state changes

Consumers should depend on `SessionService`, not call `fetch` directly from providers or reusable components.

## Registration Contract

Current flow:

1. Registration steps store partial form data in `src/store/registration.tsx`.
2. `app/(auth)/register/step5.tsx` calls `SessionService.register()` with the aggregated payload.
3. The backend creates the user, profile, and session in one flow.
4. On success, the flow signs the user out, resets the store, and returns to login.

If this flow changes, update both the product and testing docs.

## Service Layer

Files:

- `src/services/api.ts`
- `src/services/auth.ts`
- `src/services/users.ts`
- `src/services/chat.ts`
- `src/services/settings.ts`

Current behavior:

- `ApiService` assumes JSON requests and responses.
- Auth token is read from AsyncStorage under `@session_token`.
- Non-OK responses are expected to return a JSON body with an error message.
- `BASE_URL` comes from `EXPO_PUBLIC_API_BASE_URL` with native dev fallbacks for simulator/emulator use.

Do not bypass this service layer for new product flows.

## Environment Rules

Client env values:

- `EXPO_PUBLIC_API_BASE_URL`

Rules:

- Only `EXPO_PUBLIC_*` values belong in the Expo client.
- Server-only secrets must stay out of this app.
- Keep `.env.example` aligned with required client configuration.

## Error Handling

- Service and data-layer errors should surface as explicit user feedback.
- Current patterns are inline field errors for forms and toast messages for transient failures.
- Do not swallow auth or backend errors silently.

## Retry And Offline Behavior

- There is no centralized retry or offline queue layer today.
- Avoid hidden automatic retries for destructive actions.
- Prefer explicit user-triggered retries for fetch failures.
- Preserve existing state when a refresh or page load fails.

## Pagination And Filtering

- The users list currently pages in chunks of `20` through `GET /users?from=&limit=&q=`.
- Search UI exists on the users list, but any new filtering contract should stay explicit and testable.
- When introducing new pagination or filter logic, keep the state local unless multiple routes need it.
