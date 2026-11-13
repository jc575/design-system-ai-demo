// Computes WCAG contrast ratios for the semantic token pairs in both themes.
// Reads the real CSS files, resolves var() chains, and fails (exit 1) if any pair is below its minimum.
import { readFileSync } from 'node:fs';

const prim = readFileSync(new URL('../src/tokens/primitives.css', import.meta.url), 'utf8');
const sem = readFileSync(new URL('../src/tokens/semantic.css', import.meta.url), 'utf8');

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const rules = (css) => [...stripComments(css).matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));
const decls = (body) => Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((d) => [d[1], d[2].trim()]));
const refs = Object.assign({}, ...rules(prim).filter((r) => r.selector === ':root').map((r) => decls(r.body)));
const semRules = rules(sem);
const lightRule = semRules.find((r) => r.selector.includes("[data-theme='light']"));
const darkRule = semRules.find((r) => r.selector.includes("[data-theme='dark']"));
if (!lightRule || !darkRule) throw new Error('Could not find light and dark theme blocks');
const light = { ...refs, ...decls(lightRule.body) };
const dark = { ...light, ...decls(darkRule.body) };

const resolve = (map, name, depth = 0) => {
  let v = map[name];
  if (v === undefined || depth > 8) return undefined;
  const m = v.match(/^var\((--[\w-]+)\)$/);
  return m ? resolve(map, m[1], depth + 1) : v;
};
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((x) => {
    x /= 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

// [foreground token, background token, minimum ratio, what it is]
const PAIRS = [
  ['--color-text-primary', '--color-surface-page', 4.5, 'Body text on page'],
  ['--color-text-primary', '--color-surface-raised', 4.5, 'Body text on raised surface'],
  ['--color-text-secondary', '--color-surface-page', 4.5, 'Secondary text on page'],
  ['--color-text-secondary', '--color-surface-raised', 4.5, 'Helper text and placeholder on field'],
  ['--color-text-link', '--color-surface-raised', 4.5, 'Secondary button text'],
  ['--color-text-on-action', '--color-action-primary-bg', 4.5, 'Primary button text'],
  ['--color-text-on-action', '--color-danger-bg', 4.5, 'Destructive button text'],
  ['--color-danger-text', '--color-surface-raised', 4.5, 'Error message text'],
  ['--color-border-strong', '--color-surface-raised', 3, 'Input border (UI component, 3:1)'],
  ['--color-border-focus', '--color-surface-page', 3, 'Focus ring on page'],
  ['--color-border-focus', '--color-surface-raised', 3, 'Focus ring on raised surface'],
  ...['critical', 'high', 'medium', 'low', 'info'].map((s) => [`--color-severity-${s}-fg`, `--color-severity-${s}-bg`, 4.5, `Badge text: ${s}`]),
];

let fails = 0;
const rows = [];
for (const [name, map] of [['light', light], ['dark', dark]]) {
  for (const [fg, bg, min, what] of PAIRS) {
    const f = resolve(map, fg), b = resolve(map, bg);
    const r = f && b ? ratio(f, b) : NaN;
    const ok = r >= min;
    if (!ok) fails++;
    rows.push({ theme: name, pair: what, fg: f, bg: b, ratio: Number.isNaN(r) ? 'n/a' : r.toFixed(2), min, result: ok ? 'pass' : 'FAIL' });
  }
}
console.table(rows);
console.log(fails ? `${fails} pair(s) below minimum` : `All ${rows.length} checks pass`);
process.exit(fails ? 1 : 0);
