# Design system AI demo

A small prototype that shows a method: **give the AI your system's rules, then review what it makes.**

- `CLAUDE.md` is the context layer (component rules, token rules, accessibility floor, review checklist).
- Three token layers: primitive, semantic, component, with a written naming grammar and decision log (Method section in Storybook).
- Foundations: a 12-hue color wheel generated from contrast targets, semantic color, typography, iconography, space and radius, elevation, borders and motion.
- Components: Button, TextField, StatusBadge, Icon.
- Usage guidance with a decision matrix and an interactive button picker.
- Light and dark themes.
- Scripts: `npm run generate:ramps`, `npm run lint:tokens`, `npm run contrast`, `npm run axe`.
- Process log inside Storybook (Process, Process log).

This is a prototype, not production work. Four components, one brand, no Figma file attached.

## Run it

```
npm install
npm run storybook
```

## Build and check

```
npm run lint:tokens
npm run contrast
npm run build-storybook
npm run axe
# or all four: npm run check
```

## Deploy (free)

Push to GitHub, import the repo in Vercel, set the build command to `npm run build-storybook` and the output directory to `storybook-static`.
