// Token lint. Enforces the naming grammar, the layer rules and the "no token without evidence" rule.
// Run: npm run lint:tokens     Exit code 1 if anything fails.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { refs, lightDecls, darkDecls, sharedDecls, stripComments } from './lib/tokens.mjs';
import { PAIRS, EXEMPT } from './contrast-pairs.mjs';

const errors = [];
const fail = (where, msg, fix) => errors.push({ where, msg, fix });

/* ---------- 1. Primitive names and values ---------- */
const HUES = 'red|orange|amber|yellow|lime|green|teal|cyan|blue|indigo|violet|pink|slate';
const REF_NAME = new RegExp(
  '^--ref-(' +
    [
      `(${HUES})-(0|50|100|200|300|400|500|600|700|800|900|950|1000)`,
      'space-(0|1|2|3|4|5|6|8|10|12|16)',
      'radius-(\\d+|full)',
      'stroke-\\d+',
      'font-family-(sans|mono)',
      'font-size-\\d+',
      'font-weight-(regular|medium|semibold|bold)',
      'line-height-(tight|snug|normal|relaxed)',
      'icon-size-\\d+',
      'shadow-(soft|deep)-[1-4]',
      'duration-\\d+',
    ].join('|') +
    ')$',
);
for (const [name, value] of Object.entries(refs)) {
  if (!REF_NAME.test(name)) fail(name, 'Primitive name is not in the grammar', 'Use --ref-<family>-<number or value word>. See Method, How naming works.');
  if (/var\(/.test(value) && !name.includes('font-family')) fail(name, 'Primitives must hold raw values, not other tokens', 'Move the alias to the semantic layer.');
}

/* ---------- 2. Semantic names and values ---------- */
const SEM_COLOR = /^--color-(bg|text|border|icon)-([a-z]+(-[a-z]+)*)$/;
const SEM_OTHER = [
  /^--space-(xs|sm|md|lg|xl|2xl|3xl)$/,
  /^--radius-(control|surface|pill)$/,
  /^--border-width-(default|emphasis)$/,
  /^--focus-ring-(width|offset)$/,
  /^--icon-size-(sm|md|lg|xl)$/,
  /^--font-(body|code)$/,
  /^--type-(display|heading-(lg|md|sm)|body-(lg|md|sm)|label-(lg|md|sm)|caption|code)$/,
  /^--elevation-(flat|resting|raised|overlay|modal)$/,
  /^--motion-duration-(fast|spin)$/,
];
const allSemantic = { ...sharedDecls, ...lightDecls, ...darkDecls };
for (const [name, value] of Object.entries(allSemantic)) {
  const isColor = name.startsWith('--color-');
  if (isColor) {
    const m = name.match(SEM_COLOR);
    if (!m) fail(name, 'Colour token is not property-first (bg | text | border | icon)', 'Use --color-<property>-<role>[-<emphasis>][-<state>].');
    else if (/\d/.test(m[2])) fail(name, 'Semantic names must not contain numbers', 'Numbers belong to primitives. Use a word for the role.');
    if (!/^var\(--ref-[\w-]+\)$/.test(value)) fail(name, 'Semantic colour must point at exactly one primitive', 'Write var(--ref-...), never a raw colour.');
  } else if (!SEM_OTHER.some((r) => r.test(name))) {
    fail(name, 'Semantic token is not in the grammar', 'Propose it through the contribution path, then add it to the grammar in lint-tokens.mjs.');
  }
  if (/#[0-9a-f]{3,8}\b|\b\d+(\.\d+)?(px|rem)\b/i.test(value)) fail(name, 'Semantic tokens must not contain raw values', 'Point at a primitive.');
}

/* ---------- 3. Theme parity ---------- */
const themed = (o) => Object.keys(o).filter((k) => k.startsWith('--color-') || k.startsWith('--elevation-'));
const lk = new Set(themed(lightDecls)), dk = new Set(themed(darkDecls));
const colorTokens = [...lk].filter((k) => k.startsWith('--color-'));
for (const k of lk) if (!dk.has(k)) fail(k, 'Defined in light but missing in dark', 'Add the dark value.');
for (const k of dk) if (!lk.has(k)) fail(k, 'Defined in dark but missing in light', 'Add the light value.');

/* ---------- 4. Evidence: every colour token has a registered contrast pair or a written exemption ---------- */
const covered = new Set(PAIRS.flatMap(([fg, bg]) => [fg, bg]));
for (const k of colorTokens) {
  if (!covered.has(k) && !EXEMPT[k]) fail(k, 'No registered contrast pair and no exemption', 'Add a row in scripts/contrast-pairs.mjs, or add an exemption with a reason.');
}
for (const k of Object.keys(EXEMPT)) if (!colorTokens.includes(k)) fail(k, 'Exempt token does not exist', 'Remove it from EXEMPT.');
for (const [fg, bg] of PAIRS) for (const t of [fg, bg]) if (!colorTokens.includes(t)) fail(t, 'Contrast pair uses a token that is not defined', 'Fix the pair or define the token.');

/* ---------- 5. Components: layer rules ---------- */
const COMPONENTS = { Button: '--button-', TextField: '--field-', StatusBadge: '--badge-', Icon: '--icon-' };
const defined = new Set([...Object.keys(refs), ...Object.keys(allSemantic)]);
for (const [comp, prefix] of Object.entries(COMPONENTS)) {
  const file = `src/components/${comp}/${comp}.css`;
  const css = stripComments(readFileSync(file, 'utf8'));
  const own = new Set();
  for (const d of css.matchAll(/(--[\w-]+)\s*:/g)) own.add(d[1]);
  for (const o of own) if (!o.startsWith(prefix)) fail(`${file} ${o}`, `Component token must start with ${prefix}`, 'Name it after the component.');
  for (const v of css.matchAll(/var\((--[\w-]+)/g)) {
    const name = v[1];
    if (name.startsWith('--ref-')) fail(`${file} ${name}`, 'Component uses a primitive directly', 'Use the semantic token instead. Components never read --ref-*.');
    else if (!defined.has(name) && !own.has(name)) fail(`${file} ${name}`, 'Token is not defined anywhere', 'Fix the typo or add the token through the contribution path.');
  }
  const body = css
    .replace(/\.ds-visually-hidden\s*\{[^}]*\}/g, '')
    .replace(/@keyframes[^{]+\{[\s\S]*?\}\s*\}/g, '');
  if (/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/.test(body)) fail(file, 'Raw colour in a component', 'Use a semantic colour token.');
  // length literals are allowed only when declaring the component's own token (e.g. --button-min-height: 2.5rem)
  for (const line of body.split(/[;{}]/)) {
    const t = line.trim();
    if (!t || t.startsWith('--')) continue;
    if (/\b\d*\.?\d+(px|rem)\b/.test(t.replace(/var\([^)]*\)/g, ''))) fail(`${file}: ${t.slice(0, 60)}`, 'Literal length in a component rule', 'Move it to a component token (--prefix-name) or use a semantic token.');
  }
}

/* ---------- report ---------- */
const total = Object.keys(refs).length + Object.keys(allSemantic).length;
if (errors.length) {
  console.log(`\n${errors.length} problem(s)\n`);
  for (const e of errors) console.log(`  ✗ ${e.where}\n    ${e.msg}\n    Fix: ${e.fix}\n`);
  process.exit(1);
}
console.log(`Token lint passed. ${Object.keys(refs).length} primitives, ${Object.keys(allSemantic).length} semantic tokens, ${PAIRS.length} registered contrast pairs, ${Object.keys(EXEMPT).length} written exemptions.`);
