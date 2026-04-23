# UI System

## Design Direction

The current app uses a token-driven light and dark theme with OpenSans typography, image-backed icons, and shared layout primitives. Preserve that system before introducing new visual patterns.

## Theme Sources

- Light theme: `src/constants/light.ts`
- Dark theme: `src/constants/dark.ts`
- Shared fonts, assets, weights, and line heights: `src/constants/theme.ts`
- Theme state and persistence: `src/hooks/useData.tsx`

## Spacing Scale

Use the shared spacing tokens exposed through `theme.sizes`.

- `xs`: 4
- `s`: 8
- `sm`: 16
- `m`: 24
- `md`: 32
- `l`: 40
- `xl`: 48
- `xxl`: 56

Default layout padding is `sizes.padding`, currently `20`.

## Typography Tokens

Typography is built around OpenSans.

- body text: `OpenSans-Regular`
- headings: `OpenSans-Bold` or `OpenSans-SemiBold`
- `h1`: 44
- `h2`: 40
- `h3`: 32
- `h4`: 24
- `h5`: 18
- paragraph/body size: 16
- base text size: 14

Prefer the `Text` component props such as `h4`, `h5`, `p`, `bold`, and `semibold` over ad hoc font declarations.

## Color Usage

Core tokens come from the current theme object.

- primary/link: magenta family
- background/card/text tokens differ between light and dark themes
- success, warning, danger, and info colors are already defined
- gradients are defined centrally and should be reused for primary actions

Do not introduce new hardcoded colors in route screens when a token already exists.

## Reusable Primitives

Use these shared components first:

- `Block` for layout, safe areas, scroll wrappers, cards, blur, and gradients
- `Text` for typography
- `Button` for touch actions
- `Input` for text entry
- `Image` for themed icons and images
- `Switch` and `Checkbox` for toggle controls

If a new UI pattern is needed repeatedly, add it to `src/components/` rather than duplicating route-local markup.

## Theming Rules

- Read the theme from `useData()` or `useTheme()`.
- Keep light/dark behavior driven by existing tokens.
- The dark-mode preference is persisted through AsyncStorage. Do not replace that flow casually.
- New components should accept theme-driven colors and spacing instead of embedding one-off values.

## Accessibility

- Preserve component `id` props because custom components map them to `testID` or `accessibilityLabel`.
- Keep tap targets comfortably sized, especially for icon-only buttons.
- Do not rely on color alone to communicate destructive, success, or validation states.
- Preserve clear text labels on form controls and settings rows.

## Loading, Error, And Empty States

- Async screens should handle loading, empty, and error states explicitly.
- Auth boot currently returns `null` while the session hydrates. Preserve that guarded behavior unless a task intentionally introduces a splash/loading screen.
- Use the toast system for transient success and error messages where the current flows already rely on it.
- Keep destructive actions explicit and reversible when the current UX expects confirmation or a settings route.

## Asset Rules

- Fonts and most icons/images are referenced through `src/constants/theme.ts`.
- Keep new reusable assets under `app/assets/` if they must be bundled with the current theme system.
- Avoid route-local asset sprawl when a shared asset belongs in the theme layer.
