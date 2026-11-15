// One-off: appends <PageNav title="..."/> to every docs page that has none. Safe to re-run.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const storyTitle = (dir) => {
  const f = readdirSync(dir).find((x) => x.endsWith('.stories.tsx'));
  return f ? readFileSync(join(dir, f), 'utf8').match(/title:\s*'([^']+)'/)?.[1] : null;
};
for (const file of walk('src').filter((f) => f.endsWith('.mdx'))) {
  let s = readFileSync(file, 'utf8');
  if (s.includes('<PageNav')) continue;
  const title = s.match(/<Meta title="([^"]+)"/)?.[1] ?? storyTitle(dirname(file));
  if (!title) { console.log('NO TITLE', file); continue; }
  const m = s.match(/import \{([^}]*)\} from '([^']*(?:docs\/blocks|\.\/blocks))';/);
  if (m) s = s.replace(m[0], `import { ${m[1].trim()}, PageNav } from '${m[2]}';`);
  else {
    let rel = relative(dirname(file), 'src/docs/blocks').replace(/\\/g, '/'); if (!rel.startsWith('.')) rel = './' + rel;
    s = s.replace(/(import \{[^}]*\} from '@storybook\/blocks';\n)/, `$1import { PageNav } from '${rel}';\n`);
  }
  s = s.replace(/\s*$/, '') + `\n\n<PageNav title="${title}" />\n`;
  writeFileSync(file, s);
  console.log('added', title, '->', file);
}
