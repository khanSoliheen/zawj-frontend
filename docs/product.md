# Product Context

## Product Goal

Zawj is an Islamic matrimonial app. The frontend is expected to support halal account creation, respectful profile browsing, private chat, and account/settings management without breaking core trust and privacy expectations.

## Primary User Journeys

- New user lands on the welcome screen and moves into login or registration.
- New user completes the five-step registration flow and is returned to login after account creation.
- Authenticated user browses profile cards, opens a user detail screen, and starts or continues chat.
- Authenticated user updates preferences, profile, visibility, privacy, or support settings.
- User can toggle dark mode, manage sessions, and log out cleanly.

## Main Screens And Purpose

- `app/index.tsx`: welcome and first-run entrypoint
- `app/(auth)/login.tsx`: sign-in
- `app/(auth)/register/step1` through `step5`: multi-step onboarding
- `app/(tabs)/users/index.tsx`: primary discovery feed
- `app/(tabs)/users/[id].tsx`: user detail
- `app/(tabs)/chat/index.tsx`: chat list
- `app/(tabs)/chat/[id].tsx`: chat conversation
- `app/(tabs)/preferences.tsx`: preference management
- `app/(tabs)/profile/index.tsx`: profile entrypoint
- `app/screens/settings/**`: account, privacy, visibility, reminders, verification, support

## Non-Negotiable Behavior

- Unauthenticated users must not silently access protected tabs or settings routes.
- Authenticated users should be redirected away from auth screens.
- Registration state must persist across the five onboarding steps until the flow is submitted or reset.
- Successful registration currently signs the user out and sends them back to login.
- Logout must clear the local user state and route the user back to login.
- Theme preference must persist across launches.
- English copy must continue to work even when Arabic translations are incomplete or unchanged.
- Errors from auth or backend actions must surface to the user through existing inline validation or toasts.

## Acceptance Criteria Patterns

Use these patterns when defining task completion for frontend work.

- Preserve route access rules unless the task explicitly changes them.
- Keep the current login, registration, discovery, chat, and settings flows operable end-to-end.
- Preserve light and dark theme readability.
- Maintain form validation feedback when touching forms.
- Keep async screens resilient to empty, loading, and error states.
- Call out any behavior that changes profile privacy, chat visibility, or session handling.

## UX Constraints

- Do not replace the multi-step registration flow with a new pattern without explicit approval.
- Do not rewrite the tab structure or route names casually.
- Do not introduce aggressive copy, imagery, or flows that undermine the app's halal and respectful positioning.
- Keep settings screens explicit and reversible when changing user-facing account controls.

## Current Product Risks To Watch

- Auth boot and redirect regressions strand users quickly.
- Registration regressions can lose multi-step form state.
- Direct Supabase queries in route screens mean backend changes can leak into UI code unless handled carefully.
- Privacy-facing profile display details should be treated as product-sensitive, not cosmetic.
