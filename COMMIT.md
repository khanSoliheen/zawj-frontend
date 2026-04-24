# COMMIT.md

## Purpose

This file defines how commits should be prepared in this repository so agentic and manual workflows follow the same validation path.

## Commit Rules

- do not commit without passing local validation
- keep commits focused
- avoid mixing refactors, feature work, and unrelated formatting in one commit
- stage only intended files
- do not bypass Husky with `--no-verify` unless explicitly required for emergency recovery

## Local Commit Validation

Commits are protected by Husky.

### `pre-commit`

Runs:

```bash
pnpm exec eslint app src test --ext .js,.ts,.tsx --max-warnings=0
pnpm exec tsc --noEmit
pnpm exec jest --runInBand --passWithNoTests=false
```

This validates the suite, but it does not guarantee the right test depth by itself.
Before committing a UI or flow change, confirm you also added or updated:

1. a state-specific regression test for the new behavior
2. any changed service mocks or route param mocks
3. error-path expectations if the change touches API handling or toasts

### `commit-msg`

Checks:

- commit message is not empty
- commit message is descriptive enough

## Recommended Commit Flow

1. review changed files
2. run local validation if the change is broad
3. stage only the intended files
4. write a clear commit message
5. let Husky run

## Commit Message Guidance

Good examples:

- `fix auth hydration on app boot`
- `move shared modules out of expo route tree`
- `add jest coverage for settings and chat flows`
- `refactor component imports to remove require cycles`

Bad examples:

- `fix`
- `update`
- `changes`
- `wip`

## Agentic Commit Guidance

If an agent is preparing a commit, it should:

1. confirm the change set is intentional
2. confirm lint, typecheck, and tests are green
3. confirm the change is covered beyond the happy path when it affects stateful UI
4. avoid bundling unrelated repo noise
5. write a commit message that describes the actual outcome, not the activity

Preferred style:

- use imperative, concise summaries
- describe the result, not the process
- keep the first line readable on its own

## What Not To Commit

- secrets
- local env files
- coverage output
- editor-specific junk
- accidental generated files not meant for source control

## Related Files

- [AGENTS.md](/Users/apple/Documents/personal/zawj/AGENTS.md)
- [CONTRIBUTING.md](/Users/apple/Documents/personal/zawj/CONTRIBUTING.md)
- [.husky/pre-commit](/Users/apple/Documents/personal/zawj/.husky/pre-commit)
- [.husky/commit-msg](/Users/apple/Documents/personal/zawj/.husky/commit-msg)
