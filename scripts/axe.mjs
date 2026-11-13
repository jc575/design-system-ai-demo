// Runs axe-core against every story in the built Storybook, in both themes.
// Usage: npm run build-storybook && npm run axe
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const PORT = 6106;
const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', 'storybook-static'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1200));
const base = `http://127.0.0.1:${PORT}`;
const index = await (await fetch(`${base}/index.json`)).json();
const stories = Object.values(index.entries).filter((e) => e.type === 'story');
const axeSource = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage();
const report = [];
let violations = 0;
for (const theme of ['light', 'dark']) {
  for (const s of stories) {
    await page.goto(`${base}/iframe.html?id=${s.id}&viewMode=story&globals=theme:${theme}`);
    await page.waitForSelector('#storybook-root *', { timeout: 10000 });
    await page.waitForTimeout(250);
    await page.evaluate(axeSource);
    const result = await page.evaluate(async () => {
      const r = await window.axe.run('#storybook-root', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes[0]?.html?.slice(0, 120) }));
    });
    violations += result.length;
    report.push({ story: s.id, theme, violations: result });
  }
}
await browser.close();
server.kill();
writeFileSync('axe-report.json', JSON.stringify(report, null, 2));
const bad = report.filter((r) => r.violations.length);
console.log(`Scanned ${stories.length} stories x 2 themes = ${report.length} runs. Violations: ${violations}`);
for (const r of bad) console.log(r.theme, r.story, JSON.stringify(r.violations));
process.exit(violations ? 1 : 0);
