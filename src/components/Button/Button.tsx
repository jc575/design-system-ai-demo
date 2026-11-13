import React from 'react';
import './Button.css';

export type ButtonEmphasis = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Visible text. Required. v0 has no icon only button, so every button has a name. */
  label: string;
  /** Three levels of visual weight. More than two options, so this is a variant. */
  emphasis?: ButtonEmphasis;
  /** Three sizes. More than two options, so this is a variant. */
  size?: ButtonSize;
  /** Two options (normal or destructive), so this is a boolean. */
  destructive?: boolean;
  /** Two options, so this is a boolean. Keeps the label and width. Announced to assistive tech. */
  loading?: boolean;
  /** Slot. Swap any decorative icon. Must be aria-hidden. */
  iconStart?: React.ReactNode;
  /** Slot. Swap any decorative icon. Must be aria-hidden. */
  iconEnd?: React.ReactNode;
}

export const Button = ({
  label,
  emphasis = 'primary',
  size = 'md',
  destructive = false,
  loading = false,
  iconStart,
  iconEnd,
  disabled,
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) => {
  return (
    <button
      {...rest}
      type={type}
      className="ds-button"
      data-emphasis={emphasis}
      data-size={size}
      data-destructive={destructive || undefined}
      data-loading={loading || undefined}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
    >
      {loading ? <span className="ds-button__spinner" aria-hidden="true" /> : iconStart}
      <span className="ds-button__label">{label}</span>
      {!loading && iconEnd}
      {loading && <span className="ds-visually-hidden">Loading</span>}
    </button>
  );
};
