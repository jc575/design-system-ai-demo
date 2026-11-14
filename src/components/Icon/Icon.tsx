import React from 'react';
import './Icon.css';
import { ICON_PATHS, IconName } from './paths';

export type IconSize = 'sm' | 'md' | 'lg' | 'xl';
export type IconTone = 'inherit' | 'primary' | 'secondary' | 'disabled' | 'danger';

export interface IconProps {
  /** Which icon. A named union of every icon in the set. */
  name: IconName;
  /** Four sizes, so this is a variant. sm 16, md 20, lg 24, xl 32. Match the size to the text next to it. */
  size?: IconSize;
  /** Where the colour comes from. 'inherit' follows the surrounding text colour (right for icons next to a label). The others use the icon colour tokens. */
  tone?: IconTone;
  /** Accessible name. Leave empty when the icon is decorative (the default). Set it only when the icon carries meaning on its own. */
  label?: string;
}

export const Icon = ({ name, size = 'md', tone = 'inherit', label }: IconProps) => (
  <svg
    className="ds-icon"
    data-size={size}
    data-tone={tone}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    focusable="false"
  >
    {ICON_PATHS[name].map((d) => {
      if (d.startsWith('circle:')) {
        const [cx, cy, r] = d.slice(7).split(',').map(Number);
        return <circle key={d} cx={cx} cy={cy} r={r} />;
      }
      return <path key={d} d={d} />;
    })}
  </svg>
);
