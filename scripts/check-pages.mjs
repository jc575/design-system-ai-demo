// Page order guard. Fails if a docs page is not in src/docs/pageOrder.ts, is listed but missing,
// or its <PageNav title> does not match its own title. Run: npm run check:pages
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
const src = readFileSync('src/docs/pageOrder.ts', 'utf8');
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
// Rebuild the flat list by evaluating the exported array literal (plain data, no imports).
const arrSrc = src.slice(src.indexOf('export const STORY_ORDER'), src.indexOf('/** Every page title'));
const STORY_ORDER = new Function(arrSrc.replace(/export const STORY_ORDER: Order =/, 'return').replace(/;\s*$/, ''))();
const flat = (o, pre = '') => { const out = []; for (let i = 0; i < o.length; i++) { const x = o[i]; if (typeof x !== 'string') continue; if (Array.isArray(o[i + 1])) { out.push(...flat(o[i + 1], `${pre}${x}/`)); i++; } else out.push(pre + x); } return out; };
const listed = flat(STORY_ORDER);
// Storybook needs its sort order written inline in preview.tsx, so make sure it is the same list.
const prev = readFileSync('.storybook/preview.tsx', 'utf8');
const start = prev.indexOf('order: [') + 'order: '.length;
let depth = 0, end = start;
for (let i = start; i < prev.length; i++) { if (prev[i] === '[') depth++; if (prev[i] === ']') { depth--; if (depth === 0) { end = i + 1; break; } } }
const inline = new Function('return ' + prev.slice(start, end))();
if (JSON.stringify(inline) !== JSON.stringify(STORY_ORDER)) { console.error('Page order check FAILED:\n- .storybook/preview.tsx order differs from src/docs/pageOrder.ts. Copy one into the other.'); process.exit(1); }
const errors = [];
const found = new Map();
const storyTitle = (dir) => { const f = readdirSync(dir).find((x) => x.endsWith('.stories.tsx')); return f ? readFileSync(join(dir, f), 'utf8').match(/title:\s*'([^']+)'/)?.[1] : null; };
for (const f of walk('src').filter((x) => x.endsWith('.mdx'))) {
  const s = readFileSync(f, 'utf8');
  const title = s.match(/<Meta title="([^"]+)"/)?.[1] ?? storyTitle(dirname(f));
  if (!title) { errors.push(`${f}: cannot find its title`); continue; }
  found.set(title, f);
  const nav = s.match(/<PageNav title="([^"]+)"/)?.[1];
  if (!nav) errors.push(`${f}: add <PageNav title="${title}" /> at the bottom`);
  else if (nav !== title) errors.push(`${f}: PageNav says "${nav}" but the page is "${title}"`);
}
for (const t of found.keys()) if (!listed.includes(t)) errors.push(`"${t}" has a page but is not in src/docs/pageOrder.ts`);
for (const t of listed) if (!found.has(t)) errors.push(`"${t}" is in src/docs/pageOrder.ts but no page has that title`);
if (new Set(listed).size !== listed.length) errors.push('pageOrder.ts lists a page twice');
if (errors.length) { console.error('Page order check FAILED:\n- ' + errors.join('\n- ')); process.exit(1); }
console.log(`Page order check passed. ${listed.length} pages, each with a Previous / Next footer.`);
