# Design system AI demo

A small prototype that shows a method: **give the AI your system's rules, then review what it makes.**

- `CLAUDE.md` is the context layer (component rules, token rules, accessibility floor, review checklist).
- Three token layers: primitive, semantic, component.
- Three components: Button, TextField, StatusBadge.
- Light and dark themes.
- Scripts: `npm run contrast` and `npm run axe`.
- Process log inside Storybook (Process, Process log).

This is a prototype, not production work. Three components, no Figma file attached.

## Run it

```
npm install
npm run storybook
```

## Build and check

```
npm run build-storybook
npm run contrast
npm run axe
```

## Deploy (free)

Push to GitHub, import the repo in Vercel, set the build command to `npm run build-storybook` and the output directory to `storybook-static`.
