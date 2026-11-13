import React from 'react';

const GROUPS: { title: string; tokens: string[] }[] = [
  { title: 'Surface', tokens: ['surface-page', 'surface-raised', 'surface-sunken'] },
  { title: 'Text', tokens: ['text-primary', 'text-secondary', 'text-disabled', 'text-on-action', 'text-link'] },
  { title: 'Border', tokens: ['border-subtle', 'border-strong', 'border-focus'] },
  { title: 'Action', tokens: ['action-primary-bg', 'action-primary-bg-hover', 'action-primary-bg-active', 'danger-bg', 'danger-text'] },
  {
    title: 'Severity (background and text)',
    tokens: ['severity-critical-bg', 'severity-critical-fg', 'severity-high-bg', 'severity-high-fg', 'severity-medium-bg', 'severity-medium-fg', 'severity-low-bg', 'severity-low-fg', 'severity-info-bg', 'severity-info-fg'],
  },
];

const Panel = ({ theme }: { theme: 'light' | 'dark' }) => (
  <div
    data-theme={theme}
    style={{ background: 'var(--color-surface-page)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)', borderRadius: 10, padding: '1rem 1.25rem', fontFamily: 'var(--font-body)' }}
  >
    <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--color-text-primary)' }}>{theme === 'light' ? 'Light theme' : 'Dark theme'}</h3>
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      {GROUPS.map((g) => (
        <section key={g.title}>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{g.title}</h4>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.4rem' }}>
            {g.tokens.map((t) => (
              <li key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span aria-hidden="true" style={{ width: '1.5rem', height: '1.5rem', borderRadius: 6, background: `var(--color-${t})`, border: '1px solid var(--color-border-strong)', flex: 'none' }} />
                <code style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)', background: 'transparent', border: 'none', padding: 0 }}>--color-{t}</code>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  </div>
);

export const TokenSwatches = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1rem' }}>
    <Panel theme="light" />
    <Panel theme="dark" />
  </div>
);
