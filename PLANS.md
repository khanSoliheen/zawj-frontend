# Execution Plans

Use this file for cross-cutting, risky, or multi-step frontend changes. Keep the plan short, concrete, and tied to the actual files involved.

## Use A Plan First For

- auth or session changes
- route-tree or redirect refactors
- Zustand or provider state ownership changes
- Supabase schema or RPC integration work
- theme-system changes
- large shared-component rewrites
- Expo config or native-adjacent dependency changes

## Template

```md
# <Short action title>

## Purpose
What is changing and why?

## Constraints
- Must remain Expo-compatible
- Must preserve existing navigation behavior unless the task explicitly changes it
- Must not introduce secrets into the client bundle

## Repo Context
- Relevant routes:
- Relevant shared modules:
- Relevant tests:

## Plan
1. Inspect the current implementation and user-facing behavior.
2. Design the smallest safe change that fits the existing architecture.
3. Implement in route-safe and service-safe increments.
4. Add or update tests for the affected behavior.
5. Run validation.
6. Summarize remaining risks and follow-up work.

## Progress
- [ ] step 1
- [ ] step 2
- [ ] step 3
- [ ] step 4
- [ ] step 5
- [ ] step 6

## Surprises And Discoveries

## Decision Log

## Outcomes
```

## Current High-Risk Areas

- `app/(tabs)/chat/**` and any premium gating around first-message initiation
- `app/screens/**` upgrade, billing status, and notification entry points
- `src/hooks/userContext.tsx` auth hydration plus subscription-state hydration
- `src/services/**` payment, billing status, and referral client contracts
- `app/_layout.tsx` boot flow and redirect behavior
- `src/hooks/userContext.tsx` auth hydration
- `src/services/session.ts` and `src/utils/supabase.ts`
- `src/store/registration.tsx` plus `app/(auth)/register/**`
- `src/constants/routes.ts` and `src/utils/navigation.ts`
- `app/(tabs)/**` and `app/screens/**` protected flows

## Active Plan: Premium Billing And Referral Rollout

### Purpose
Add quarterly premium billing at Rs 500, gate new first-message requests behind premium, preserve existing chats after expiry, and stage a referral program that awards configurable premium bonus days after a successful paid referral.

### Constraints
- Must not break existing browse, receive-request, accept/decline, or existing-chat flows.
- Existing accepted chats must remain usable after expiry or downgrade.
- Premium gating must be enforced by backend truth, not client-only checks.
- Notification UX must stay coherent: bell is persistent history, push is additive.
- Referral reward days must be configurable from backend environment, not hardcoded in the client.

### Repo Context
- Relevant routes:
  - `app/(tabs)/users/index.tsx`
  - `app/(tabs)/users/[id].tsx`
  - `app/(tabs)/chat/[id].tsx`
  - new upgrade/billing screens under `app/screens/**`
- Relevant shared modules:
  - `src/hooks/userContext.tsx`
  - `src/services/auth.ts`
  - `src/services/api.ts`
  - new billing/referral service modules in `src/services/**`
- Relevant tests:
  - `test/tabs/user-detail-screen.test.tsx`
  - `test/chat/chat-screen.test.tsx`
  - new billing/referral screen and gating tests

### Plan
1. Add subscription and referral state contracts to frontend service/types without changing runtime behavior.
2. Add upgrade and billing-status UI shells wired to backend status endpoints.
3. Gate only new first-message requests behind subscription status; keep browse, receiving requests, accepting requests, and existing chats working.
4. Add notification entry points for billing-related states only after backend contracts are stable.
5. Add regression tests for free vs premium gating, expiry/grace handling, and referral surfaces.
6. Validate affected route flows and remove any stale backlog items changed by this rollout.

### Progress
- [ ] step 1
- [ ] step 2
- [ ] step 3
- [ ] step 4
- [ ] step 5
- [ ] step 6

### Decision Log
- Premium is required for sending new first-message requests.
- Existing accepted chats remain usable after expiry.
- Browse, receive requests, and accept/decline remain available to free users.
- Grace period should be supported, with downgrade after expiry/grace only affecting premium actions.
- Referral rewards should grant premium bonus days, with the day count controlled by backend env/config.

## Frontend Audit Backlog

Use this section as the living TODO list for route-level gaps. Keep unfinished items here. When a feature is fully implemented and validated, either delete the item or mark it completed and remove it in the next cleanup pass. Do not leave stale backlog entries behind after the feature is done.

### Broken Or Incomplete

- [ ] [Chat List](/Users/apple/Documents/personal/zawj/frontend/app/(tabs)/chat/index.tsx)
  Refreshes every 5 seconds while focused and sets `loading=true` on every refresh, so the list visibly reloads.
  Suggested change: keep initial spinner only once, do silent refresh afterward, or only refresh on focus plus after sending or accepting.

- [ ] [Chat Detail](/Users/apple/Documents/personal/zawj/frontend/app/(tabs)/chat/[id].tsx)
  Auto-refresh is polling-based; header and bubbles still use static avatars, not real participant avatars. It also polls both messages and connection state every 5 seconds.
  Suggested change: pass real presigned avatars into the chat screen, keep silent polling for now, and move to sockets or SSE later.

### Partially Working Or Needs Cleanup

- [ ] [Users List](/Users/apple/Documents/personal/zawj/frontend/app/(tabs)/users/index.tsx)
  Core listing and search work and backend pagination exists, but search fires on every keystroke with no debounce and no request cancellation.
  Suggested change: debounce search, reset pagination cleanly, and prevent stale response overwrites.

- [ ] [User Detail](/Users/apple/Documents/personal/zawj/frontend/app/(tabs)/users/[id].tsx)
  Profile loads and conversation creation works, but button label and flow is still Nikah Proposal while it actually ensures a chat or conversation. Uses only limited profile fields.
  Suggested change: rename CTA to match behavior or separate proposal from chat.

- [ ] [Profile](/Users/apple/Documents/personal/zawj/frontend/app/(tabs)/profile/index.tsx)
  Profile load and avatar upload work, but posts, followers, and following are fake hardcoded stats and verification badge is hardcoded too.
  Suggested change: remove fake stats and badge until backed by real data.

- [ ] [Change Password](/Users/apple/Documents/personal/zawj/frontend/app/screens/settings/change-password.tsx)
  Works against backend, but there is no current-password check.
  Suggested change: require current password in UI and backend for safer password changes.

- [ ] [Notifications](/Users/apple/Documents/personal/zawj/frontend/app/screens/settings/notifications.tsx)
  Works with JSON prefs, but save is per-toggle and can race on rapid taps.
  Suggested change: debounce or serialize updates.

- [ ] App-wide localization coverage
  A real language selector exists, but most screens still contain hardcoded English strings and are not fully translated yet.
  Suggested change: finish the screen-by-screen i18n pass and remove the older unused localization path.

- [ ] [Visibility](/Users/apple/Documents/personal/zawj/frontend/app/screens/settings/visibility.tsx)
  Works with backend prefs, but the actual `/users` and chat discovery behavior is not fully enforced everywhere yet.
  Suggested change: apply `discoverable` and `messages_from` rules to listing and chat creation on backend.

- [ ] [Blocked Users](/Users/apple/Documents/personal/zawj/frontend/app/screens/settings/blocked-users.tsx)
  Load and unblock work, but list is not refreshable and there is no empty-state recovery after returning from another screen.
  Suggested change: reload on focus.

- [ ] [Report](/Users/apple/Documents/personal/zawj/frontend/app/screens/settings/report/[id].tsx)
  Submits successfully, but it exposes raw `reported_user_id` input to users.
  Suggested change: hide the ID input when route params already provide the target user; use contextual reporting UI instead.

- [ ] [Support](/Users/apple/Documents/personal/zawj/frontend/app/screens/support/index.tsx)
  Submission works, but metadata gathering is weak and `globalThis.expo?.manifest` is not a robust Expo source.
  Suggested change: use `expo-constants` consistently for app version and platform metadata.

- [ ] [Block User](/Users/apple/Documents/personal/zawj/frontend/app/screens/settings/user-block.tsx)
  Block and unblock work, but copy promises behavior like hiding from searches and matches that is not fully enforced everywhere yet.
  Suggested change: align copy with actual backend guarantees, or enforce those rules globally.

### Working

- [x] [Login](/Users/apple/Documents/personal/zawj/frontend/app/(auth)/login.tsx)
- [x] [Register Step 1](/Users/apple/Documents/personal/zawj/frontend/app/(auth)/register/step1.tsx)
- [x] [Register Step 2](/Users/apple/Documents/personal/zawj/frontend/app/(auth)/register/step2.tsx)
- [x] [Register Step 3](/Users/apple/Documents/personal/zawj/frontend/app/(auth)/register/step3.tsx)
- [x] [Register Step 4](/Users/apple/Documents/personal/zawj/frontend/app/(auth)/register/step4.tsx)
- [x] [Register Step 5](/Users/apple/Documents/personal/zawj/frontend/app/(auth)/register/step5.tsx)
- [x] [Sessions](/Users/apple/Documents/personal/zawj/frontend/app/screens/settings/session.tsx)
- [x] [Policy](/Users/apple/Documents/personal/zawj/frontend/app/screens/settings/policy.tsx)

### Route Hygiene Issues

- [ ] [verfication.tsx](/Users/apple/Documents/personal/zawj/frontend/app/screens/settings/verfication.tsx)
  Misspelled duplicate route file. This is a route smell and can create confusion.
  Suggested change: delete it if unused.

- [ ] [report/index.tsx](/Users/apple/Documents/personal/zawj/frontend/app/screens/settings/report/index.tsx)
  Just re-exports the dynamic page. This is fine, but the page model is odd because reporting without an ID still lands in a user-targeted form.
  Suggested change: separate generic report page from user-specific report page.
