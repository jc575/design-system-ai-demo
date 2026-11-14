// Generates the colour primitives. Every step is defined by its CONTRAST against white, not by eye.
// Same step number = same luminance on every hue, so contrast between two steps is predictable.
// Run: npm run generate:ramps   (writes src/tokens/primitives.color.css and src/tokens/ramps.json)
import { writeFileSync } from 'node:fs';
import { colorAtLuminance, contrast } from './lib/color.mjs';

// Step -> contrast ratio against white. THE decision. Change here, regenerate, everything follows.
export const STEP_CONTRAST = { 50: 1.06, 100: 1.09, 200: 1.28, 300: 1.7, 400: 2.4, 500: 3.5, 600: 5.1, 700: 7, 800: 10, 900: 14, 950: 17.5 };
// How much of the hue's colour to keep at each step (the very light and very dark ends look muddy at full colour).
const TAPER = { 50: 0.22, 100: 0.38, 200: 0.62, 300: 0.85, 400: 1, 500: 1, 600: 1, 700: 1, 800: 0.9, 900: 0.7, 950: 0.5 };
// The wheel. Hue angles are OKLCH degrees, roughly 30 apart.
export const HUES = [
  ['red', 25], ['orange', 55], ['amber', 80], ['yellow', 105], ['lime', 130], ['green', 155],
  ['teal', 185], ['cyan', 215], ['blue', 255], ['indigo', 280], ['violet', 305], ['pink', 350],
];
const MAX_CHROMA = 0.17;
const NEUTRAL = { name: 'slate', hue: 255, chroma: 0.008 };

const yFor = (c) => 1.05 / c - 0.05;
const families = {};
for (const [name, hue] of HUES) {
  families[name] = {};
  for (const [step, c] of Object.entries(STEP_CONTRAST)) {
    const col = colorAtLuminance(yFor(c), hue, MAX_CHROMA * TAPER[step]);
    families[name][step] = col.hex;
  }
}
families[NEUTRAL.name] = { 0: '#ffffff' };
for (const [step, c] of Object.entries(STEP_CONTRAST)) {
  families[NEUTRAL.name][step] = colorAtLuminance(yFor(c), NEUTRAL.hue, NEUTRAL.chroma).hex;
}
families[NEUTRAL.name][1000] = colorAtLuminance(yFor(19.8), NEUTRAL.hue, NEUTRAL.chroma).hex;

// Verify the promise: step distance predicts contrast.
const steps = Object.keys(STEP_CONTRAST).map(Number);
let worst500 = Infinity, worst400 = Infinity, worstAt500 = '', worstAt400 = '';
for (const [fam, ramp] of Object.entries(families)) {
  for (const a of steps) for (const b of steps) {
    if (b - a >= 400) {
      const r = contrast(ramp[a], ramp[b]);
      if (b - a >= 500 && r < worst500) { worst500 = r; worstAt500 = `${fam} ${a}/${b}`; }
      if (r < worst400) { worst400 = r; worstAt400 = `${fam} ${a}/${b}`; }
    }
  }
}
console.log(`Worst pair 500+ apart : ${worst500.toFixed(2)}:1 (${worstAt500})  needs 4.5`);
console.log(`Worst pair 400+ apart : ${worst400.toFixed(2)}:1 (${worstAt400})  needs 3.0`);

const lines = [
  '/*',
  '  GENERATED FILE. Do not edit by hand. Run: npm run generate:ramps',
  '  Source of truth: scripts/generate-ramps.mjs (STEP_CONTRAST, HUES).',
  '  Rule: the same step number has the same luminance on every hue.',
  '  So any two steps 500 or more apart meet 4.5:1, and any two steps 400 or more apart meet 3:1.',
  '*/',
  ':root {',
];
for (const [fam, ramp] of Object.entries(families)) {
  lines.push(`  /* ${fam} */`);
  for (const [step, hex] of Object.entries(ramp)) lines.push(`  --ref-${fam}-${step}: ${hex};`);
}
lines.push('}', '');
writeFileSync(new URL('../src/tokens/primitives.color.css', import.meta.url), lines.join('\n'));
writeFileSync(
  new URL('../src/tokens/ramps.json', import.meta.url),
  JSON.stringify({ stepContrast: STEP_CONTRAST, hues: HUES.map(([n, h]) => ({ name: n, hue: h })), families }, null, 2),
);
console.log(`Wrote ${Object.keys(families).length} families.`);
