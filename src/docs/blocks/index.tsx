import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import './docs.css';
import ramps from '../../tokens/ramps.json';
import semanticCss from '../../tokens/semantic.css?raw';
import { Icon } from '../../components/Icon/Icon';
import { ICON_NAMES } from '../../components/Icon/paths';
import { Button } from '../../components/Button/Button';
import compTokens from './componentTokens.json';
import { flattenOrder, docsId } from '../pageOrder';

type Theme = 'light' | 'dark';

/* ---------- small helpers ---------- */
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((x) => {
    x /= 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const readableOn = (hex: string) => (ratio(hex, '#ffffff') >= ratio(hex, '#000000') ? '#ffffff' : '#000000');
const families = ramps.families as Record<string, Record<string, string>>;

/* Token names written out in full, never built from pieces. A name built in code cannot be found or checked
   by the lint (the same trap Tailwind warns about with class names). `npm run lint:tokens` checks each one exists. */
const TYPE_VAR: Record<string, string> = {
  display: 'var(--type-display)', 'heading-lg': 'var(--type-heading-lg)', 'heading-md': 'var(--type-heading-md)', 'heading-sm': 'var(--type-heading-sm)',
  'body-lg': 'var(--type-body-lg)', 'body-md': 'var(--type-body-md)', 'body-sm': 'var(--type-body-sm)',
  'label-lg': 'var(--type-label-lg)', 'label-md': 'var(--type-label-md)', 'label-sm': 'var(--type-label-sm)',
  caption: 'var(--type-caption)', code: 'var(--type-code)',
};
const REF_SPACE: Record<number, string> = {
  0: 'var(--ref-space-0)', 1: 'var(--ref-space-1)', 2: 'var(--ref-space-2)', 3: 'var(--ref-space-3)', 4: 'var(--ref-space-4)', 5: 'var(--ref-space-5)',
  6: 'var(--ref-space-6)', 8: 'var(--ref-space-8)', 10: 'var(--ref-space-10)', 12: 'var(--ref-space-12)', 16: 'var(--ref-space-16)',
};
const SPACE_VAR: Record<string, string> = {
  xs: 'var(--space-xs)', sm: 'var(--space-sm)', md: 'var(--space-md)', lg: 'var(--space-lg)', xl: 'var(--space-xl)', '2xl': 'var(--space-2xl)', '3xl': 'var(--space-3xl)',
};
const RADIUS_VAR: Record<string, string> = { control: 'var(--radius-control)', surface: 'var(--radius-surface)', pill: 'var(--radius-pill)' };
const ELEVATION_VAR: Record<string, string> = {
  flat: 'var(--elevation-flat)', resting: 'var(--elevation-resting)', raised: 'var(--elevation-raised)', overlay: 'var(--elevation-overlay)', modal: 'var(--elevation-modal)',
};
const REF_FONT_SIZE: Record<number, string> = {
  12: 'var(--ref-font-size-12)', 14: 'var(--ref-font-size-14)', 16: 'var(--ref-font-size-16)', 18: 'var(--ref-font-size-18)', 20: 'var(--ref-font-size-20)',
  24: 'var(--ref-font-size-24)', 30: 'var(--ref-font-size-30)', 36: 'var(--ref-font-size-36)', 48: 'var(--ref-font-size-48)',
};
const REF_RADIUS: Record<string, string> = {
  '0': 'var(--ref-radius-0)', '2': 'var(--ref-radius-2)', '4': 'var(--ref-radius-4)', '6': 'var(--ref-radius-6)', '8': 'var(--ref-radius-8)',
  '12': 'var(--ref-radius-12)', '16': 'var(--ref-radius-16)', full: 'var(--ref-radius-full)',
};
const REF_SHADOW: Record<string, string> = {
  'soft-1': 'var(--ref-shadow-soft-1)', 'soft-2': 'var(--ref-shadow-soft-2)', 'soft-3': 'var(--ref-shadow-soft-3)', 'soft-4': 'var(--ref-shadow-soft-4)',
  'deep-1': 'var(--ref-shadow-deep-1)', 'deep-2': 'var(--ref-shadow-deep-2)', 'deep-3': 'var(--ref-shadow-deep-3)', 'deep-4': 'var(--ref-shadow-deep-4)',
};
const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

export const Doc = ({ children, theme = 'light' }: { children: React.ReactNode; theme?: Theme }) => (
  <div className="dx" data-theme={theme}>{children}</div>
);
export const ThemePanel = ({ theme, title, children }: { theme: Theme; title?: string; children: React.ReactNode }) => (
  <div className="dx dx-panel" data-theme={theme}>
    <div className="dx-h">{title ?? (theme === 'light' ? 'Light theme' : 'Dark theme')}</div>
    {children}
  </div>
);
export const BothThemes = ({ children }: { children: React.ReactNode }) => (
  <div className="dx-grid-2"><ThemePanel theme="light">{children}</ThemePanel><ThemePanel theme="dark">{children}</ThemePanel></div>
);
export const Callout = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="dx"><div className="dx-callout"><strong>{title}</strong>{children}</div></div>
);

/* ---------- COLOR WHEEL ---------- */
const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
const sector = (cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) => {
  const [x0, y0] = polar(cx, cy, r1, a0), [x1, y1] = polar(cx, cy, r1, a1);
  const [x2, y2] = polar(cx, cy, r0, a1), [x3, y3] = polar(cx, cy, r0, a0);
  return `M${x0} ${y0} A${r1} ${r1} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 0 0 ${x3} ${y3}Z`;
};
export const ColorWheel = () => {
  const hues = ramps.hues.map((h) => h.name);
  const size = 640, c = size / 2, r0 = 70, ring = 17;
  const order = [...STEPS].reverse(); // dark at the center, light at the rim
  return (
    <div className="dx">
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Color wheel with twelve hues. Each hue is a wedge. Rings go from step 950 (darkest, center) to step 50 (lightest, rim)." style={{ width: '100%', maxWidth: '34rem', display: 'block', margin: '0 auto' }}>
        {hues.map((h, i) =>
          order.map((s, j) => (
            <path key={h + s} d={sector(c, c, r0 + j * ring, r0 + (j + 1) * ring, i * 30 + 0.4, (i + 1) * 30 - 0.4)} fill={families[h][s]}>
              <title>{`${h} ${s} ${families[h][s]}`}</title>
            </path>
          )),
        )}
        {order.map((s, j) => (
          <circle key={s} cx={c} cy={c} r={r0 + (j + 0.5) * ring} fill="none" stroke="none" />
        ))}
        {hues.map((h, i) => {
          const [x, y] = polar(c, c, r0 + 11 * ring + 24, i * 30 + 15);
          return <text key={h} x={x} y={y} textAnchor="middle" dominantBaseline="middle" style={{ font: 'var(--type-label-sm)', fill: 'var(--color-text-primary)' }}>{h}</text>;
        })}
        <circle cx={c} cy={c} r={r0 - 6} fill={families.slate['50']} stroke={families.slate['500']} />
        <text x={c} y={c - 4} textAnchor="middle" style={{ font: 'var(--type-label-sm)', fill: families.slate['950'] }}>center = 950</text>
        <text x={c} y={c + 12} textAnchor="middle" style={{ font: 'var(--type-label-sm)', fill: families.slate['950'] }}>rim = 50</text>
      </svg>
    </div>
  );
};


/* ---------- CLICK TO COPY ---------- */
const useCopy = () => {
  const [msg, setMsg] = useState('');
  const timer = useRef<number | undefined>(undefined);
  const copy = async (name: string, hex: string | undefined, e: React.MouseEvent) => {
    const text = e.shiftKey && hex ? hex : `var(${name})`;
    try {
      await navigator.clipboard.writeText(text);
      setMsg(`Copied ${text}`);
    } catch {
      setMsg('Could not copy here. Select the name and copy it by hand.');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(''), 2500);
  };
  return { msg, copy };
};
const CopyHint = ({ msg, what }: { msg: string; what: string }) => (
  <p className="dx-copy__hint">
    Click a name to copy it, ready to paste into CSS as a <code className="dx-code">var()</code> reference. Shift click, or Shift and Enter, copies {what}.{' '}
    <span role="status" aria-live="polite" className="dx-copy__status">{msg}</span>
  </p>
);

/* ---------- RAMP TABLE ---------- */
export const RampTable = ({ only }: { only?: string[] }) => {
  const names = (only ?? [...ramps.hues.map((h) => h.name), 'slate']);
  const { msg, copy } = useCopy();
  return (
    <div className="dx dx-scroll">
      <CopyHint msg={msg} what="the hex value" />
      <div className="dx-ramp" role="table" aria-label="Color primitives by family and step">
        <div role="row" style={{ display: 'contents' }}>
          <span className="dx-ramp-name" role="columnheader">Family</span>
          {STEPS.map((s) => <span key={s} className="dx-cell" role="columnheader"><b>{s}</b></span>)}
        </div>
        {names.map((n) => (
          <div key={n} role="row" style={{ display: 'contents' }}>
            <span className="dx-ramp-name" role="rowheader">{n}</span>
            {STEPS.map((s) => {
              const hex = families[n][s];
              const refName = `--ref-${n}-${s}`;
              return (
                <span key={s} role="cell" className="dx-cell" style={{ background: hex, color: readableOn(hex) }}>
                  <button type="button" className="dx-copy__btn dx-copy__btn--cell" onClick={(e) => copy(refName, hex, e)} aria-label={`${hex}, copy ${refName}`}>
                    {hex}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- CONTRAST RULE EXPLORER ---------- */
export const ContrastExplorer = () => {
  const names = [...ramps.hues.map((h) => h.name), 'slate'];
  const [fam, setFam] = useState('blue');
  const [a, setA] = useState('100');
  const [b, setB] = useState('700');
  const fa = families[fam][a], fb = families[fam][b];
  const r = ratio(fa, fb);
  const dist = Math.abs(Number(b) - Number(a));
  const predicted = dist >= 500 ? 'Rule says: 500 or more apart, so at least 4.5:1' : dist >= 400 ? 'Rule says: 400 or more apart, so at least 3:1' : 'Rule says: less than 400 apart, no promise';
  const sel = (id: string, label: string, v: string, set: (s: string) => void, opts: string[]) => (
    <label htmlFor={id}>{label}<select id={id} value={v} onChange={(e) => set(e.target.value)}>{opts.map((o) => <option key={o}>{o}</option>)}</select></label>
  );
  return (
    <div className="dx dx-panel">
      <div className="dx-fields" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))' }}>
        {sel('cx-fam', 'Color family', fam, setFam, names)}
        {sel('cx-a', 'Background step', a, setA, STEPS)}
        {sel('cx-b', 'Text step', b, setB, STEPS)}
      </div>
      <div style={{ background: fa, color: fb, padding: 'var(--space-lg)', borderRadius: 'var(--radius-control)', margin: 'var(--space-md) 0', font: 'var(--type-heading-sm)' }}>
        {fam} {b} text on {fam} {a}
      </div>
      <p style={{ margin: 0 }}><strong>{r.toFixed(2)}:1</strong> · {r >= 4.5 ? 'Passes text (4.5:1)' : r >= 3 ? 'Passes large text and UI (3:1) only' : 'Fails'} · {predicted}</p>
    </div>
  );
};

/* ---------- TOKEN ANATOMY ---------- */
const PART_COLORS = ['--color-text-severity-low', '--color-text-severity-high', '--color-text-danger', '--color-text-severity-medium', '--color-text-link'];
export const TokenAnatomy = ({ parts }: { parts: [string, string][] }) => (
  <div className="dx">
    <div className="dx-anatomy" role="group" aria-label={`Token name: ${parts.map((p) => p[0]).join('-')}`}>
      {parts.map(([tok, cap], i) => (
        <div key={i} className="dx-anatomy-part" style={{ color: `var(${PART_COLORS[i % PART_COLORS.length]})` }}>
          <span className="dx-anatomy-tok">{i === 0 ? '--' : '-'}{tok}</span>
          <span className="dx-anatomy-cap">{cap}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ---------- SEMANTIC COLOR TABLE (parsed from the real CSS) ---------- */
const blocks = [...semanticCss.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({ sel: m[1].trim(), body: m[2] }));
const toMap = (body: string) => Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*var\((--[\w-]+)\)/g)].map((d) => [d[1], d[2]]));
const LIGHT = toMap(blocks.find((b) => b.sel.includes("[data-theme='light']"))!.body);
const DARK = toMap(blocks.find((b) => b.sel.includes("[data-theme='dark']"))!.body);
const hexOf = (ref: string) => {
  const m = ref.match(/^--ref-([a-z]+)-(\d+)$/);
  return m ? families[m[1]]?.[m[2]] : undefined;
};
const ROLE_NOTES: Record<string, string> = {
  page: 'The canvas behind everything',
  raised: 'Cards and panels that sit above the page',
  inset: 'An area set into the page, like a code block or table header',
  overlay: 'Menus, popovers and dialogs',
  disabled: 'Behind disabled controls',
  action: 'Solid fill of a primary action',
  danger: 'Solid fill of a destructive action',
  primary: 'Main text or icons',
  secondary: 'Supporting text or icons',
  link: 'Links and secondary or tertiary button text',
  'on-action': 'Content sitting on the action fill',
  'on-danger': 'Content sitting on the danger fill',
  subtle: 'Quiet divider',
  strong: 'Border of an input or control (needs 3:1)',
  focus: 'Keyboard focus ring (needs 3:1)',
};
const describe = (name: string) => {
  const m = name.match(/^--color-(bg|text|border|icon)-(.+)$/)!;
  let role = m[2];
  const state = role.match(/-(hover|active)$/);
  if (state) role = role.replace(/-(hover|active)$/, '');
  const subtle = role.endsWith('-subtle');
  if (subtle) role = role.replace(/-subtle$/, '');
  const prop = m[1];
  const BY_PROP: Record<string, Record<string, string>> = {
    danger: { bg: 'Solid fill of a destructive action', text: 'Error and destructive text', border: 'Error border', icon: 'Danger icon' },
    disabled: { bg: 'Behind disabled controls', text: 'Text on disabled controls', icon: 'Icon on disabled controls' },
    primary: { text: 'Main text', icon: 'Main icon' },
    secondary: { text: 'Supporting text', icon: 'Supporting icon' },
    'on-action': { text: 'Text sitting on the action fill', icon: 'Icon sitting on the action fill' },
    'on-danger': { text: 'Text sitting on the danger fill', icon: 'Icon sitting on the danger fill' },
  };
  let note = BY_PROP[role]?.[prop] ?? ROLE_NOTES[role];
  if (!note && role.startsWith('severity-')) note = `${{ bg: 'Background', text: 'Text', border: 'Edge', icon: 'Icon' }[prop]} for ${role.slice(9)} severity`;
  if (!note) note = role;
  if (subtle) note = `Quiet ${role} wash behind secondary and tertiary buttons`;
  if (state) note += `, ${state[1]} state`;
  return note;
};
export const SemanticTable = ({ property }: { property: 'bg' | 'text' | 'border' | 'icon' }) => {
  const names = Object.keys(LIGHT).filter((n) => n.startsWith(`--color-${property}-`));
  const { msg, copy } = useCopy();
  return (
    <div className="dx dx-scroll">
      <CopyHint msg={msg} what="the light theme hex value" />
      <table className="dx-table">
        <thead><tr><th>Token</th><th>Use it for</th><th>Light</th><th>Dark</th></tr></thead>
        <tbody>
          {names.map((n) => (
            <tr key={n}>
              <td>
                <button type="button" className="dx-copy__btn" onClick={(e) => copy(n, hexOf(LIGHT[n]), e)}>
                  <code className="dx-code">{n}</code>
                </button>
              </td>
              <td>{describe(n)}</td>
              {[LIGHT[n], DARK[n]].map((ref, i) => (
                <td key={i}><span style={{ display: 'inline-flex', gap: 'var(--space-sm)', alignItems: 'center' }}><span className="dx-swatch" style={{ background: hexOf(ref) }} aria-hidden="true" /><code className="dx-code">{ref.replace('--ref-', '')}</code></span></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ---------- TYPOGRAPHY ---------- */
const TYPE_ROLES: [string, string, string][] = [
  ['display', 'Display', 'One per page at most. Marketing moments and empty states.'],
  ['heading-lg', 'Page title', 'Page and dashboard titles.'],
  ['heading-md', 'Section heading', 'Major sections inside a page.'],
  ['heading-sm', 'Card or panel heading', 'Headings inside cards and dialogs.'],
  ['body-lg', 'Lead paragraph', 'Intro text and long-form reading.'],
  ['body-md', 'Body', 'Default text. Form input text (16px stops iOS from zooming in).'],
  ['body-sm', 'Compact body', 'Dense tables and secondary content.'],
  ['label-lg', 'Large label', 'Large buttons and prominent labels.'],
  ['label-md', 'Label', 'Buttons, field labels, tabs.'],
  ['label-sm', 'Small label', 'Badges, small buttons, table headers.'],
  ['caption', 'Caption', 'Helper text and timestamps. Never below 12px.'],
  ['code', 'Code', 'Token names, IDs, rule snippets.'],
];
const Probe = ({ role }: { role: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [info, setInfo] = useState('');
  useEffect(() => {
    if (!ref.current) return;
    const cs = getComputedStyle(ref.current);
    setInfo(`${Math.round(parseFloat(cs.fontSize))}px · line ${(parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)).toFixed(2)} · weight ${cs.fontWeight}`);
  }, [role]);
  return (
    <>
      <span ref={ref} style={{ font: TYPE_VAR[role] }}>The quick brown fox, approved</span>
      <br />
      <span className="dx-code" style={{ font: 'var(--type-caption)' }}>{info}</span>
    </>
  );
};
export const TypeSpecimen = () => (
  <div className="dx dx-scroll">
    <table className="dx-table">
      <thead><tr><th>Token</th><th>Specimen</th><th>Use it for</th></tr></thead>
      <tbody>
        {TYPE_ROLES.map(([role, name, use]) => (
          <tr key={role}>
            <td><code className="dx-code">--type-{role}</code><br /><span style={{ font: 'var(--type-caption)', color: 'var(--color-text-secondary)' }}>{name}</span></td>
            <td><Probe role={role} /></td>
            <td>{use}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ---------- ICONOGRAPHY ---------- */
const ICON_KEYWORDS: Record<string, string> = {
  check: 'done tick success confirm yes complete',
  close: 'x dismiss cancel remove clear exit',
  plus: 'add new create',
  search: 'find magnifier lookup',
  trash: 'delete remove bin discard',
  'chevron-right': 'next forward expand caret',
  'chevron-down': 'dropdown expand caret open',
  'arrow-right': 'next continue forward go',
  external: 'open new tab link leave',
  download: 'save export get',
  filter: 'refine narrow funnel sort',
  bell: 'notification alert reminder',
  'shield-check': 'secure security protected safe verified',
  info: 'information help details note',
  'circle-alert': 'warning error problem low severity',
  'octagon-alert': 'stop critical error severity',
  'triangle-alert': 'warning caution severity',
  'diamond-alert': 'warning high severity',
  'circle-down': 'low severity decrease',
};
export const IconGallery = () => {
  const [q, setQ] = useState('');
  const inputId = useId();
  const term = q.trim().toLowerCase();
  const shown = ICON_NAMES.filter((n) => !term || `${n.replace(/-/g, ' ')} ${ICON_KEYWORDS[n] ?? ''}`.toLowerCase().includes(term));
  return (
    <div className="dx">
      <label htmlFor={inputId} className="dx-h" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>Search {ICON_NAMES.length} icons</label>
      <input
        id={inputId}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Try delete, warning, or arrow"
        autoComplete="off"
        style={{ width: '100%', maxWidth: '24rem', boxSizing: 'border-box', font: 'var(--type-body-md)', color: 'var(--color-text-primary)', background: 'var(--color-bg-page)', border: 'var(--border-width-default) solid var(--color-border-strong)', borderRadius: 'var(--radius-control)', padding: 'var(--space-sm) var(--space-md)', marginBottom: 'var(--space-md)' }}
      />
      <p role="status" aria-live="polite" style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-sm)' }}>
        {shown.length === 0 ? `No icons match "${q}". Try a different word, like the action it stands for.` : `Showing ${shown.length} of ${ICON_NAMES.length} icons`}
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(8.5rem, 1fr))', gap: 'var(--space-sm)' }}>
        {shown.map((n) => (
          <li key={n} className="dx-card" style={{ alignItems: 'center', textAlign: 'center' }}>
            <Icon name={n} size="lg" tone="primary" />
            <code className="dx-code" style={{ font: 'var(--type-caption)' }}>{n}</code>
          </li>
        ))}
      </ul>
    </div>
  );
};
export const IconSizes = () => (
  <div className="dx dx-demo" style={{ gap: 'var(--space-lg)' }}>
    {(['sm', 'md', 'lg', 'xl'] as const).map((s, i) => (
      <div key={s} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--space-xs)' }}>
        <Icon name="shield-check" size={s} tone="primary" />
        <code className="dx-code">{s}</code>
        <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-secondary)' }}>{[16, 20, 24, 32][i]}px</span>
      </div>
    ))}
  </div>
);

/* ---------- SPACE AND RADIUS ---------- */
const SPACE_PRIMS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
const SPACE_SEM: [string, number][] = [['xs', 1], ['sm', 2], ['md', 4], ['lg', 6], ['xl', 8], ['2xl', 12], ['3xl', 16]];
export const SpaceScale = () => (
  <div className="dx dx-scroll">
    <table className="dx-table">
      <thead><tr><th>Primitive</th><th>Size</th><th>Semantic word</th></tr></thead>
      <tbody>
        {SPACE_PRIMS.map((n) => {
          const word = SPACE_SEM.find((s) => s[1] === n)?.[0];
          return (
            <tr key={n}>
              <td><code className="dx-code">--ref-space-{n}</code></td>
              <td style={{ width: '60%' }}><div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}><div className="dx-bar" style={{ width: REF_SPACE[n], minWidth: 2 }} /><span>{n * 4}px</span></div></td>
              <td>{word ? <code className="dx-code">--space-{word}</code> : <span style={{ color: 'var(--color-text-secondary)' }}>No word. On purpose.</span>}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
export const RadiusScale = () => (
  <div className="dx dx-demo" style={{ gap: 'var(--space-lg)' }}>
    {([['control', 'Buttons, inputs, small controls'], ['surface', 'Cards, panels, dialogs'], ['pill', 'Badges, tags, toggles']] as const).map(([r, use]) => (
      <div key={r} style={{ display: 'grid', gap: 'var(--space-xs)', justifyItems: 'start' }}>
        <div style={{ width: '7rem', height: '3.5rem', background: 'var(--color-bg-raised)', border: 'var(--border-width-emphasis) solid var(--color-border-strong)', borderRadius: RADIUS_VAR[r] }} />
        <code className="dx-code">--radius-{r}</code>
        <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-secondary)', maxWidth: '10rem' }}>{use}</span>
      </div>
    ))}
  </div>
);

/* ---------- ELEVATION ---------- */
const LEVELS: [string, string][] = [['flat', 'Sits on the page. Table rows, inline content.'], ['resting', 'Cards and panels at rest.'], ['raised', 'Hovered cards, sticky headers.'], ['overlay', 'Menus, popovers, tooltips.'], ['modal', 'Dialogs that block the page.']];
export const ElevationLevels = ({ theme }: { theme: Theme }) => (
  <ThemePanel theme={theme}>
    <div style={{ display: 'grid', gap: 'var(--space-lg)', padding: 'var(--space-md)' }}>
      {LEVELS.map(([l, use], i) => (
        <div key={l} style={{ boxShadow: ELEVATION_VAR[l], background: i >= 3 ? 'var(--color-bg-overlay)' : 'var(--color-bg-raised)', border: 'var(--border-width-default) solid var(--color-border-subtle)', borderRadius: 'var(--radius-surface)', padding: 'var(--space-md)' }}>
          <code className="dx-code">--elevation-{l}</code>
          <div style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-xs)' }}>{use}</div>
        </div>
      ))}
    </div>
  </ThemePanel>
);


/* ---------- PRIMITIVE SCALES (type, radius, stroke, shadow) ---------- */
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 30, 36, 48];
const FONT_WEIGHTS: [string, number][] = [['regular', 400], ['medium', 500], ['semibold', 600], ['bold', 700]];
const LINE_HEIGHTS: [string, string][] = [['tight', '1.15'], ['snug', '1.3'], ['normal', '1.5'], ['relaxed', '1.65']];
export const TypePrimitives = () => (
  <div className="dx">
    <h3 className="dx-h">Font sizes</h3>
    <div className="dx-scroll" tabIndex={0} role="region" aria-label="Font size primitives, scrollable">
      <table className="dx-table">
        <thead><tr><th>Primitive</th><th>Size</th><th>Sample</th></tr></thead>
        <tbody>
          {FONT_SIZES.map((n) => (
            <tr key={n}><td><code className="dx-code">--ref-font-size-{n}</code></td><td>{n}px</td><td><span style={{ fontFamily: 'var(--ref-font-family-sans)', fontSize: REF_FONT_SIZE[n], lineHeight: 1.2 }}>Clear words, calm screens</span></td></tr>
          ))}
        </tbody>
      </table>
    </div>
    <h3 className="dx-h" style={{ marginTop: 'var(--space-lg)' }}>Weights and line heights</h3>
    <div className="dx-grid-2">
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-xs)' }}>
        {FONT_WEIGHTS.map(([n, w]) => (
          <li key={n} style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'baseline' }}><code className="dx-code">--ref-font-weight-{n}</code><span style={{ fontFamily: 'var(--ref-font-family-sans)', fontWeight: w }}>{w} Sample</span></li>
        ))}
      </ul>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-xs)' }}>
        {LINE_HEIGHTS.map(([n, v]) => (
          <li key={n} style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'baseline' }}><code className="dx-code">--ref-line-height-{n}</code><span>{v}</span></li>
        ))}
      </ul>
    </div>
  </div>
);
const RADII = ['0', '2', '4', '6', '8', '12', '16', 'full'];
export const RadiusPrimitives = () => (
  <div className="dx dx-demo" style={{ gap: 'var(--space-lg)' }}>
    {RADII.map((r) => (
      <div key={r} style={{ display: 'grid', gap: 'var(--space-xs)', justifyItems: 'start' }}>
        <div style={{ width: '5rem', height: '3rem', background: 'var(--color-bg-raised)', border: 'var(--border-width-emphasis) solid var(--color-border-strong)', borderRadius: REF_RADIUS[r] }} />
        <code className="dx-code">--ref-radius-{r}</code>
        <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-secondary)' }}>{r === 'full' ? 'fully round' : `${r}px`}</span>
      </div>
    ))}
  </div>
);
export const ShadowPrimitives = ({ theme }: { theme: Theme }) => {
  const kind = theme === 'light' ? 'soft' : 'deep';
  return (
    <ThemePanel theme={theme} title={`${kind} shadows, made for the ${theme} theme`}>
      <div style={{ display: 'grid', gap: 'var(--space-lg)', padding: 'var(--space-md)' }}>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} style={{ boxShadow: REF_SHADOW[`${kind}-${n}`], background: 'var(--color-bg-raised)', border: 'var(--border-width-default) solid var(--color-border-subtle)', borderRadius: 'var(--radius-surface)', padding: 'var(--space-md)' }}>
            <code className="dx-code">--ref-shadow-{kind}-{n}</code>
          </div>
        ))}
      </div>
    </ThemePanel>
  );
};
export const SpaceWords = () => (
  <div className="dx dx-scroll" tabIndex={0} role="region" aria-label="Space words, scrollable">
    <table className="dx-table">
      <thead><tr><th>Semantic token</th><th>Size</th><th>Points at</th></tr></thead>
      <tbody>
        {SPACE_SEM.map(([w, n]) => (
          <tr key={w}>
            <td><code className="dx-code">--space-{w}</code></td>
            <td style={{ width: '50%' }}><div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}><div className="dx-bar" style={{ width: SPACE_VAR[w], minWidth: 2 }} /><span>{n * 4}px</span></div></td>
            <td><code className="dx-code">--ref-space-{n}</code></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ---------- DO / DON'T ---------- */
export const DoDont = ({ ok, title, why, children }: { ok: boolean; title: string; why: string; children: React.ReactNode }) => (
  <div className="dx dx-card">
    <span className="dx-verdict" data-ok={ok}><Icon name={ok ? 'check' : 'close'} size="sm" />{ok ? 'Do' : "Don't"}</span>
    <div className="dx-demo">{children}</div>
    <strong style={{ font: 'var(--type-label-md)' }}>{title}</strong>
    <p style={{ margin: 0, font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)' }}>{why}</p>
  </div>
);

/* ---------- STEPS ---------- */
export const Steps = ({ items }: { items: [string, string][] }) => (
  <div className="dx dx-flow" role="list">
    {items.map(([t, d], i) => (
      <div key={i} className="dx-step" role="listitem"><span className="dx-step-n" aria-hidden="true">{i + 1}</span><div><strong>{t}</strong><p>{d}</p></div></div>
    ))}
  </div>
);

/* ---------- BUTTON PICKER (interactive decision matrix) ---------- */
type Intent = 'advance' | 'back' | 'minor' | 'remove' | 'navigate';
type ChoiceProps = { type: 'radio' | 'checkbox'; name?: string; checked: boolean; onChange: () => void; children: React.ReactNode };
/** Token-styled radio or checkbox. The filled look comes straight from React state, not from the browser's native control, so it always matches the real value. */
const Choice = ({ type, name, checked, onChange, children }: ChoiceProps) => (
  <label className="dx-choice" data-type={type} data-checked={checked || undefined}>
    <input type={type} name={name} checked={checked} onChange={onChange} />
    <span className="dx-choice__mark" aria-hidden="true" />
    <span>{children}</span>
  </label>
);
const INTENTS: [Intent, string][] = [
  ['advance', 'Move the main task forward (save, submit, continue)'],
  ['back', 'Back out, cancel, or choose the other path'],
  ['minor', 'A smaller or repeated action (add row, export, filter)'],
  ['remove', 'Delete or remove something'],
  ['navigate', 'Go to another page'],
];
export const ButtonPickerUI = () => {
  const groupName = useId();
  const [intent, setIntent] = useState<Intent>('advance');
  const [confirmStep, setConfirmStep] = useState(false);
  const [alone, setAlone] = useState(false);
  const result = useMemo(() => {
    if (intent === 'navigate') return { link: true, why: 'Going somewhere is a link, not a button. Links work with open in new tab and tell screen readers they navigate.', label: 'View policy details' };
    if (intent === 'advance') return { emphasis: 'primary' as const, destructive: false, label: 'Save policy', why: 'The main next step. Only one primary per view or dialog, so people always know the one obvious thing to do.' };
    if (intent === 'back') return alone
      ? { emphasis: 'tertiary' as const, destructive: false, label: 'Cancel', why: 'A quiet way out. Tertiary has no border so it never competes with the real action.' }
      : { emphasis: 'secondary' as const, destructive: false, label: 'Cancel', why: 'The alternative path, shown next to a primary. Outlined so it reads as a real choice without outshining the primary.' };
    if (intent === 'minor') return { emphasis: 'tertiary' as const, destructive: false, label: 'Export CSV', why: 'Supporting actions stay quiet. If a view has many of them, group them in a menu rather than adding more buttons.' };
    return confirmStep
      ? { emphasis: 'primary' as const, destructive: true, label: 'Delete rule', why: 'The final confirm step of a destructive flow is the one place a destructive primary belongs. Name what is being deleted.' }
      : { emphasis: 'secondary' as const, destructive: true, label: 'Delete rule', why: 'The first click should not look like the page\'s main goal. Use a quieter destructive style, then confirm in a dialog.' };
  }, [intent, confirmStep, alone]);
  return (
    <div className="dx dx-panel">
      <fieldset style={{ border: 0, margin: 0, padding: 0 }} className="dx-fields">
        <legend className="dx-h">What is this action?</legend>
        {INTENTS.map(([v, l]) => (
          <Choice key={v} type="radio" name={groupName} checked={intent === v} onChange={() => setIntent(v)}>{l}</Choice>
        ))}
      </fieldset>
      {intent === 'remove' && (
        <Choice type="checkbox" checked={confirmStep} onChange={() => setConfirmStep((v) => !v)}>This is the final confirm step inside a dialog</Choice>
      )}
      {intent === 'back' && (
        <Choice type="checkbox" checked={alone} onChange={() => setAlone((v) => !v)}>There is no primary button next to it</Choice>
      )}
      <div className="dx-demo" style={{ marginTop: 'var(--space-md)' }} aria-live="polite">
        {'link' in result ? (
          <a href="#picker" style={{ color: 'var(--color-text-link)', font: 'var(--type-label-md)' }} onClick={(e) => e.preventDefault()}>{result.label}</a>
        ) : (
          <Button label={result.label} emphasis={result.emphasis} destructive={result.destructive} />
        )}
        <span style={{ font: 'var(--type-body-sm)', flex: 1, minWidth: '12rem' }}>
          <strong>{'link' in result ? 'Use a link' : `${result.emphasis}${result.destructive ? ' + destructive' : ''}`}.</strong> {result.why}
        </span>
      </div>
    </div>
  );
};

/* ---------- TOKENS USED BY A COMPONENT (generated from the component's CSS) ---------- */
type TokenRow = { name: string; where: string; value: string; semantic: string | null; refLight: string | null; refDark: string | null; hexLight: string | null; hexDark: string | null };
const Chip = ({ hex, text }: { hex: string | null; text: string }) => (
  <span style={{ display: 'inline-flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
    {hex && hex.startsWith('#') && <span className="dx-swatch" style={{ background: hex }} aria-hidden="true" />}
    <code className="dx-code">{text}</code>
  </span>
);
export const ComponentTokens = ({ name }: { name: 'Button' | 'TextField' | 'StatusBadge' | 'Icon' }) => {
  const data = (compTokens as Record<string, { tokens: TokenRow[]; direct: string[] }>)[name];
  const rows = data.tokens.filter((r) => r.semantic || r.value);
  return (
    <div className="dx">
      <p style={{ font: 'var(--type-body-sm)', margin: '0 0 var(--space-sm)' }}>
        Generated from <code className="dx-code">{name}.css</code> on every build, so it cannot go stale. Read each row left to right: the component token, which variant sets it, the semantic token it points at, and what that resolves to in each theme.
      </p>
      <div className="dx-scroll" tabIndex={0} role="region" aria-label={`${name} tokens table, scrollable`}>
        <table className="dx-table">
          <thead><tr><th>Component token</th><th>Set when</th><th>Points at</th><th>Light</th><th>Dark</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.name + r.where + i}>
                <td><code className="dx-code">{r.name}</code></td>
                <td>{r.where}</td>
                <td>{r.semantic ? <code className="dx-code">{r.semantic}</code> : <span>{r.value}</span>}</td>
                <td>{r.semantic ? <Chip hex={r.hexLight} text={r.refLight ? r.refLight.replace('--ref-', '') : r.hexLight ?? 'composite'} /> : 'n/a'}</td>
                <td>{r.semantic ? <Chip hex={r.hexDark} text={r.refDark ? r.refDark.replace('--ref-', '') : r.hexDark ?? 'composite'} /> : 'n/a'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.direct.length > 0 && (
        <p style={{ font: 'var(--type-body-sm)', marginTop: 'var(--space-sm)' }}>
          <strong>Semantic tokens used directly:</strong>{' '}
          <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 'var(--space-xs)', verticalAlign: 'top' }}>
            {data.direct.map((t) => <code key={t} className="dx-code">{t}</code>)}
          </span>
        </p>
      )}
    </div>
  );
};


/* ---------- PREVIOUS / NEXT (reading order comes from pageOrder.ts) ---------- */
const pageName = (t: string) => t.split('/').slice(-1)[0];
const pageWhere = (t: string) => t.split('/').slice(0, -1).join(', ');
export const PageNav = ({ title }: { title: string }) => {
  const pages = flattenOrder();
  const i = pages.indexOf(title);
  const prev = i > 0 ? pages[i - 1] : null;
  const next = i >= 0 && i < pages.length - 1 ? pages[i + 1] : null;
  const cell = (t: string | null, dir: 'prev' | 'next') =>
    t ? (
      <a className={`dx-pagenav__link dx-pagenav__link--${dir}`} href={`?path=/docs/${docsId(t)}`}>
        <span className="dx-pagenav__dir">{dir === 'prev' ? 'Previous' : 'Next'}</span>
        <span className="dx-pagenav__name">{pageName(t)}</span>
        {pageWhere(t) && <span className="dx-pagenav__where">{pageWhere(t)}</span>}
      </a>
    ) : (
      <span />
    );
  return (
    <nav className="dx dx-pagenav" aria-label="Previous and next page">
      {cell(prev, 'prev')}
      {cell(next, 'next')}
    </nav>
  );
};


/* ---------- CODE BLOCK (plain, token colored, so contrast is ours to control) ---------- */
export const CodeBlock = ({ code, label }: { code: string; label: string }) => (
  <div className="dx-codeblock" tabIndex={0} role="region" aria-label={label}>
    {code}
  </div>
);
