import React from 'react';

/** Tiny inline icon set. Decorative only (aria-hidden). Shapes differ by severity so meaning never relies on color alone. */
type IconProps = React.SVGProps<SVGSVGElement>;
const base = (props: IconProps) => ({
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
  ...props,
});

export const IconOctagonAlert = (p: IconProps) => (
  <svg {...base(p)}><path d="M5.2 1.8h5.6l3.4 3.4v5.6l-3.4 3.4H5.2l-3.4-3.4V5.2z" /><path d="M8 5v3.4M8 10.8v.01" /></svg>
);
export const IconTriangleAlert = (p: IconProps) => (
  <svg {...base(p)}><path d="M8 2.2l6 10.6H2z" /><path d="M8 6.6v2.8M8 11.2v.01" /></svg>
);
export const IconDiamond = (p: IconProps) => (
  <svg {...base(p)}><path d="M8 1.8l6.2 6.2L8 14.2 1.8 8z" /><path d="M8 5.6v2.8M8 10.4v.01" /></svg>
);
export const IconCircleDown = (p: IconProps) => (
  <svg {...base(p)}><circle cx="8" cy="8" r="6.2" /><path d="M5.6 7.2L8 9.6l2.4-2.4" /></svg>
);
export const IconInfo = (p: IconProps) => (
  <svg {...base(p)}><circle cx="8" cy="8" r="6.2" /><path d="M8 7.4v3.4M8 5.2v.01" /></svg>
);
export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}><circle cx="7" cy="7" r="4.6" /><path d="M10.6 10.6L14 14" /></svg>
);
export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}><path d="M8 3v10M3 8h10" /></svg>
);
export const IconTrash = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 4.4h10M6.2 4.4V2.8h3.6v1.6M4.4 4.4l.6 8.8h6l.6-8.8" /></svg>
);
