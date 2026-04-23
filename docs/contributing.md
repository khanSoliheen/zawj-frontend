# Contributing

## Scope

These guidelines apply to the Expo frontend in `frontend/`.

## Branch Naming

There is no enforced branch naming hook today, but use descriptive names that make the scope obvious.

Examples:

- `frontend/auth-hydration-fix`
- `frontend/chat-pagination`
- `frontend/settings-theme-cleanup`

## Commit Messages

The existing Husky `commit-msg` hook requires a non-empty message with at least 8 characters.

Preferred style:

- short imperative sentence
- mention the user-facing or technical intent

Examples:

- `fix auth redirect on cold boot`
- `add regression tests for chat grouping`

## Pull Requests

Every PR should include:

- what changed
- why it changed
- impacted routes or shared modules
- testing performed
- known risks or follow-up work

Use the PR template and call out auth, routing, registration, chat, settings, or shared-state impact explicitly.

## Review Expectations

- Prefer small, reviewable diffs.
- Reuse existing patterns before introducing new abstractions.
- Call out tradeoffs when touching auth, navigation, env handling, or data access boundaries.
- Include screenshots or short recordings for meaningful UI changes when possible.

## Testing Expectations

- Run lint, typecheck, and relevant Jest tests before asking for review.
- Run `pnpm test:coverage` when the change affects auth, routing, registration, chat, settings, or shared state.
- Add or update tests for behavior changes.

## Dependency Policy

Ask before adding:

- new runtime dependencies
- Expo plugins
- native modules
- SDK upgrades or package-manager changes

For existing dependencies, prefer the current stack:

- Expo Router for navigation
- React Hook Form + Zod for forms
- Zustand for the registration flow store
- Rust backend HTTP services for auth, users, chat, settings, and support

## Security Expectations

- Never commit secrets or backend-only tokens.
- Keep client env changes reflected in `.env.example`.
- Treat any legacy hardcoded backend or Supabase config as debt, not precedent.

## Risk Areas That Need Extra Care

- `app/_layout.tsx`
- `src/hooks/userContext.tsx`
- `src/services/session.ts`
- `src/services/api.ts`
- `src/store/registration.tsx`
- `src/constants/routes.ts`
- `src/utils/navigation.ts`
