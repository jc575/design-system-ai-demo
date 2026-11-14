// The registry of every colour pairing the system promises. Add a row here when you add a colour token.
// [foreground token, background token, minimum ratio, what it is for]
const TEXT = 4.5;
const UI = 3;
const P = [];
const on = (fg, bgs, min, what) => bgs.forEach((bg) => P.push([`--color-${fg}`, `--color-bg-${bg}`, min, `${what} on ${bg}`]));
const surfaces = ['page', 'raised', 'inset', 'overlay'];

on('text-primary', surfaces, TEXT, 'Body text');
on('text-secondary', surfaces, TEXT, 'Secondary text');
on('text-link', ['page', 'raised', 'overlay', 'action-subtle-hover', 'action-subtle-active'], TEXT, 'Link and secondary button text');
on('text-on-action', ['action', 'action-hover', 'action-active'], TEXT, 'Primary button text');
on('text-on-danger', ['danger', 'danger-hover', 'danger-active'], TEXT, 'Destructive button text');
on('text-danger', ['page', 'raised', 'overlay', 'danger-subtle-hover', 'danger-subtle-active'], TEXT, 'Error and destructive text');
for (const s of ['critical', 'high', 'medium', 'low', 'info']) on(`text-severity-${s}`, [`severity-${s}`], TEXT, `Badge text (${s})`);

on('border-strong', ['page', 'raised', 'overlay'], UI, 'Input and control border');
on('border-focus', ['page', 'raised', 'overlay'], UI, 'Focus ring');
on('border-danger', ['raised', 'overlay'], UI, 'Error border');
on('icon-primary', surfaces, UI, 'Icon');
on('icon-secondary', ['page', 'raised', 'overlay'], UI, 'Secondary icon');
on('icon-on-action', ['action'], UI, 'Icon on primary button');
on('icon-on-danger', ['danger'], UI, 'Icon on destructive button');
on('icon-danger', ['raised', 'overlay'], UI, 'Danger icon');

export const PAIRS = P;

// Tokens that are allowed to have no pair, and why. Anything else without a pair fails the lint.
export const EXEMPT = {
  '--color-text-disabled': 'WCAG 1.4.3 exempts disabled controls',
  '--color-icon-disabled': 'WCAG 1.4.11 exempts disabled controls',
  '--color-bg-disabled': 'Only appears behind disabled text, which is exempt',
  '--color-border-subtle': 'Decorative divider. Does not identify a control',
  '--color-border-severity-critical': 'Decorative edge on a badge that already has text and an icon',
  '--color-border-severity-high': 'Decorative edge on a badge that already has text and an icon',
  '--color-border-severity-medium': 'Decorative edge on a badge that already has text and an icon',
  '--color-border-severity-low': 'Decorative edge on a badge that already has text and an icon',
  '--color-border-severity-info': 'Decorative edge on a badge that already has text and an icon',
};
