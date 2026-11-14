// Reads each component's CSS and writes the chain: component token -> semantic token -> primitive, in light and dark.
// Output feeds the "Tokens used" table on every component docs page, so it cannot go stale.
// Run: npm run generate:docs  (also runs automatically before the Storybook build)
import { readFileSync, writeFileSync } from 'node:fs';
import { light, dark, resolve, rules, decls } from './lib/tokens.mjs';

const COMPONENTS = ['Button', 'TextField', 'StatusBadge', 'Icon'];
const refOf = (map, name) => {
  // follow var() chain until we hit a --ref-* token
  let v = map[name], depth = 0, last = name;
  while (v && depth++ < 8) {
    const m = v.match(/^var\((--[\w-]+)\)$/);
    if (!m) break;
    last = m[1];
    if (last.startsWith('--ref-')) return last;
    v = map[last];
  }
  return last.startsWith('--ref-') ? last : null;
};
const shortSel = (sel) =>
  sel.replace(/\.ds-[a-z]+/g, '').replace(/\[data-([a-z]+)='([a-z]+)'\]/g, ' $1=$2').replace(/\[data-([a-z]+)\]/g, ' $1').replace(/:(hover|active|focus-visible|disabled)(:not\([^)]*\))*/g, ' $1').replace(/\s+/g, ' ').trim() || 'default';

const out = {};
for (const comp of COMPONENTS) {
  const css = readFileSync(new URL(`../src/components/${comp}/${comp}.css`, import.meta.url), 'utf8');
  const rows = [], direct = new Set();
  for (const r of rules(css)) {
    if (r.selector === 'to' || r.selector.startsWith('@')) continue;
    const d = decls(r.body);
    const own = Object.keys(d);
    for (const [name, value] of Object.entries(d)) {
      const m = value.match(/^var\((--[\w-]+)\)$/);
      const sem = m ? m[1] : null;
      rows.push({
        name,
        where: r.selector.split(',').map(shortSel).join(', '),
        value,
        semantic: sem && !sem.startsWith('--' + comp.toLowerCase().slice(0, 3)) ? sem : null,
        refLight: sem ? refOf(light, sem) : null,
        refDark: sem ? refOf(dark, sem) : null,
        hexLight: sem ? resolve(light, sem) ?? null : null,
        hexDark: sem ? resolve(dark, sem) ?? null : null,
      });
    }
    // semantic tokens used directly in ordinary properties
    for (const line of r.body.split(';')) {
      const t = line.trim();
      if (!t || t.startsWith('--')) continue;
      for (const v of t.matchAll(/var\((--[\w-]+)\)/g)) if (!own.includes(v[1]) && !v[1].startsWith('--button-') && !v[1].startsWith('--field-') && !v[1].startsWith('--badge-') && !v[1].startsWith('--icon-size') ) direct.add(v[1]);
      for (const v of t.matchAll(/var\((--[\w-]+)\)/g)) if (v[1].startsWith('--icon-size-')) direct.add(v[1]);
    }
  }
  // resolve component-token -> component-token chains (e.g. --button-bg: var(--button-x)) are not used, keep simple.
  out[comp] = { tokens: rows, direct: [...direct].sort() };
}
writeFileSync(new URL('../src/docs/blocks/componentTokens.json', import.meta.url), JSON.stringify(out, null, 2));
console.log(Object.entries(out).map(([k, v]) => `${k}: ${v.tokens.length} token declarations, ${v.direct.length} used directly`).join('\n'));
