# Design system rules (read this before writing any component)

This file is the context layer. The assistant reads it first, so generated code follows the system's decisions instead of guessing. A human reviews every change before it merges.

These rules come from a contribution model used on a real enterprise design system. Nothing here is confidential. It is a small prototype built to show the method, not a production system.

## 1. Component API rules (these mirror Figma component properties exactly)

- Two options means a **boolean** prop. Example: `destructive`, `loading`, `error`, `showIcon`.
- More than two options means a **variant** prop with a named union. Example: `emphasis`, `size`, `severity`.
- Every piece of visible text is a **prop**, never hard coded inside the component.
- Anything decorative that a team may want to swap (icons, adornments) is a **slot** (`iconStart`, `iconEnd`). Never create one variant per icon.
- Prop names in code must match the property names in Figma. If one changes, the other changes in the same pull request.
- Prefer fewer props. Solve about 99 percent of use cases and leave edge cases to composition.

## 2. Token rules (three layers, one direction)

1. **Primitives** (`--ref-*`): raw values. Numbers describe position on a scale (`--ref-blue-700`, `--ref-space-4`). Never used by components. Colour primitives are generated (`npm run generate:ramps`), never hand edited.
2. **Semantic** (`--color-*`, `--space-*`, `--radius-*`, `--type-*`, `--elevation-*`, `--icon-size-*`, `--border-width-*`, `--focus-ring-*`, `--motion-*`): meaning, in WORDS, never numbers. This is the only layer that changes per theme.
3. **Component** (`--button-*`, `--field-*`, `--badge-*`, `--icon-*`): each component names its own decisions and points them at semantic tokens. Component-specific measurements (a min height) may live here. Colours may not.

Change flows one way: primitive to semantic to component. No hex values, no `--ref-*`, no loose pixel or rem values in component rules.

### Naming grammar (the lint enforces it)

`--color-<property>-<role>[-<emphasis>][-<state>]`

- property: `bg` | `text` | `border` | `icon` (property FIRST)
- role: what it is for (`page`, `raised`, `action`, `danger`, `primary`, `severity-critical` ...)
- emphasis: `subtle` (omit for the strong default)
- state: `hover` | `active`

Other families: `--space-<xs..3xl>`, `--radius-<control|surface|pill>`, `--type-<role>-<size>`, `--elevation-<flat|resting|raised|overlay|modal>`.

### Using the foundations

- Type: `font: var(--type-body-md);`. Pick a ROLE, never a raw size.
- Icons: use the `Icon` component. Beside a label use `tone="inherit"`. Decorative icons have no `label`. Icons that stand alone need a `label`.
- Spacing: semantic words only (`--space-md`). A size with no word needs a proposal.
- Elevation: use the level that matches the job. Never rely on a shadow alone to mark a boundary.

### Before adding a token

1. Reuse a semantic token if one says what you need.
2. Otherwise start with a component token. Promote to semantic when about three components need it.
3. Every new colour token needs light AND dark values and a registered contrast pair in `scripts/contrast-pairs.mjs` (or a written exemption with a reason).
4. Run `npm run lint:tokens` and `npm run contrast`.

## 3. Accessibility floor (WCAG 2.2 AA)

- Text contrast at least 4.5:1. Large text and UI component borders at least 3:1.
- Visible focus indicator on every interactive element, at least 3:1 against its surroundings.
- Every input has a visible label. Placeholder is never a label.
- Errors are text, not color alone, are linked with `aria-describedby`, and say what went wrong and how to fix it in plain language.
- Meaning is never color alone. Status uses a word AND an icon shape.
- Decorative icons are `aria-hidden`. Loading states are announced.
- Respect `prefers-reduced-motion`.

## 4. Storybook requirements for every component

- One story per meaningful state, plus a `Playground` story with controls.
- `argTypes` with a description for every prop, written in plain language.
- Tagged `autodocs`.
- Works in light and dark themes. Verify both.
- Run the accessibility addon and the scripted axe check before asking for review.

## 5. Human review checklist (the assistant never skips this, and never self approves)

- [ ] Prop names match Figma
- [ ] No hard coded values (`npm run lint:tokens` passes)
- [ ] Contrast script passes (`npm run contrast`)
- [ ] Axe script reports no violations (`npm run axe`)
- [ ] Keyboard only walkthrough done
- [ ] Plain language in labels and messages
- [ ] The process log records what the assistant got wrong

## 6. Tool note

This file is tool agnostic. In Claude it is `CLAUDE.md`. In GitHub Copilot the same content lives at `.github/copilot-instructions.md`. In Cursor it lives in `.cursor/rules`. The method is the context layer, not the tool.
