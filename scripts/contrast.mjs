// Computes WCAG contrast ratios for every registered token pair, in both themes.
// Reads the real CSS files, resolves var() chains, and fails (exit 1) if any pair is below its minimum.
import { light, dark, resolve, hexLuminance } from './lib/tokens.mjs';
import { PAIRS } from './contrast-pairs.mjs';

const ratio = (a, b) => {
  const [hi, lo] = [hexLuminance(a), hexLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
let fails = 0, tight = 0;
const rows = [];
for (const [theme, map] of [['light', light], ['dark', dark]]) {
  for (const [fg, bg, min, what] of PAIRS) {
    const f = resolve(map, fg), b = resolve(map, bg);
    const r = f && b ? ratio(f, b) : NaN;
    const ok = r >= min;
    if (!ok) fails++;
    if (ok && r < min + 0.3) tight++;
    rows.push({ theme, pair: what, fg: f, bg: b, ratio: Number.isNaN(r) ? 'n/a' : r.toFixed(2), min, result: ok ? 'pass' : 'FAIL' });
  }
}
if (process.argv.includes('--table')) console.table(rows);
else for (const r of rows.filter((x) => x.result === 'FAIL')) console.log('FAIL', r);
console.log(fails ? `${fails} pair(s) below minimum` : `All ${rows.length} checks pass (${PAIRS.length} pairs x 2 themes). ${tight} are within 0.3 of the minimum.`);
process.exit(fails ? 1 : 0);
