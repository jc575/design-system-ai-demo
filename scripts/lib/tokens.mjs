// Reads the real token CSS files and builds resolved maps for the light and dark theme.
import { readFileSync, readdirSync } from 'node:fs';
import { hexLuminance } from './color.mjs';

const dir = new URL('../../src/tokens/', import.meta.url);
export const read = (f) => readFileSync(new URL(f, dir), 'utf8');
export const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
export const rules = (css) => [...stripComments(css).matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));
export const decls = (body) => Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((d) => [d[1], d[2].trim()]));

const primitiveFiles = ['primitives.css', 'primitives.color.css'];
export const refs = Object.assign({}, ...primitiveFiles.flatMap((f) => rules(read(f)).filter((r) => r.selector === ':root').map((r) => decls(r.body))));
const semRules = rules(read('semantic.css'));
const lightRule = semRules.find((r) => r.selector.includes("[data-theme='light']"));
const darkRule = semRules.find((r) => r.selector.includes("[data-theme='dark']"));
const sharedRule = semRules.find((r) => r.selector === ':root');
if (!lightRule || !darkRule || !sharedRule) throw new Error('Could not find the light, dark and shared blocks in semantic.css');
export const lightDecls = decls(lightRule.body);
export const darkDecls = decls(darkRule.body);
export const sharedDecls = decls(sharedRule.body);
export const light = { ...refs, ...sharedDecls, ...lightDecls };
export const dark = { ...refs, ...sharedDecls, ...lightDecls, ...darkDecls };

export const resolve = (map, name, depth = 0) => {
  const v = map[name];
  if (v === undefined || depth > 8) return undefined;
  const m = v.match(/^var\((--[\w-]+)\)$/);
  return m ? resolve(map, m[1], depth + 1) : v;
};
export { hexLuminance };
