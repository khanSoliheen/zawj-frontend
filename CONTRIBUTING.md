# CONTRIBUTING.md

## Setup

Use the repo-pinned Node version first:

```bash
nvm use
pnpm install
```

## Main Commands

```bash
pnpm start
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
```

## Development Rules

- keep `app/` route-only
- place shared code in `src/`
- use `@/` imports
- do not reintroduce component barrel require cycles
- do not add non-route files under `app/`
- keep auth/session boot safe for logged-out users
- if you change a function or contract, update every affected caller, test, mock, and relevant doc in the same change

## Before Opening A PR

Run:

```bash
pnpm exec eslint app src test --ext .js,.ts,.tsx --max-warnings=0
pnpm exec tsc --noEmit
pnpm exec jest --runInBand --passWithNoTests=false
```

If your change affects critical frontend flows, also run:

```bash
pnpm test:coverage
```

## Testing Expectations

Prefer behavior tests over snapshots.

If you refactor an implementation boundary, also refactor the tests and mocks that depend on that boundary. Do not keep legacy Supabase-style tests after moving a flow to REST services, and do not keep stale service mocks after changing function signatures.

For any user-facing stateful flow, do not stop at the happy path. Add focused regression coverage for the states your change can introduce:

1. loading
2. empty
3. success
4. backend error
5. permission/blocked/disabled state
6. route-param or stale-data edge cases when relevant

Examples:

- chat changes should cover blocked, pending, accepted, unread, and realtime update states
- settings changes should cover saved, failed-save, and empty/default states
- notification changes should cover each notification type and its action buttons

## Error Handling

- backend responses should return clean user messages without framework prefixes
- frontend screens should normalize unknown errors through shared helpers instead of repeating `error instanceof Error ? ...`
- if you change API error behavior, add or update a test for the normalized message shape

## Toast Rules

Use toasts for:

- failures
- destructive confirmations that are not otherwise visible
- success states where the UI does not already make the outcome obvious

Do not use toasts for:

- routine state transitions already reflected in the screen
- accept/decline/save flows where the card, list, or route state visibly changes immediately

Priority order:

1. auth/session
2. navigation/route guards
3. registration
4. settings flows
5. chat logic
6. shared state/services

## Coverage

Coverage thresholds are enforced in `jest.config.cjs`.

- do not add meaningless tests just to inflate numbers
- prioritize testing risky logic and stateful flows

## File Placement

Examples:

- new screen route: `app/...`
- new reusable component: `src/components/...`
- new shared hook: `src/hooks/...`
- new service wrapper: `src/services/...`
- new utility: `src/utils/...`
- new tests: `test/...`

## Pull Requests

Keep PRs focused.

Include:

- what changed
- why it changed
- how it was tested
- risk areas

Use the PR template in `.github/pull_request_template.md`.
