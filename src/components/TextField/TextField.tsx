import React, { useId } from 'react';
import './TextField.css';
import { Icon } from '../Icon/Icon';

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label. Required. Placeholder text is never a label. */
  label: string;
  /** Short help shown under the field. Linked to the input for screen readers. */
  helperText?: string;
  /** Two options (valid or invalid), so this is a boolean. */
  error?: boolean;
  /** Plain language message that says what went wrong and how to fix it. Shown only when error is true. */
  errorMessage?: string;
  /** Slot. Swap any decorative icon. Must be aria-hidden. */
  iconStart?: React.ReactNode;
}

export const TextField = ({
  label,
  helperText,
  error = false,
  errorMessage,
  iconStart,
  required,
  disabled,
  id,
  ...rest
}: TextFieldProps) => {
  const autoId = useId();
  const inputId = id ?? `tf-${autoId}`;
  const helpId = helperText ? `${inputId}-help` : undefined;
  const errId = error && errorMessage ? `${inputId}-err` : undefined;
  const describedBy = [helpId, errId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="ds-textfield" data-error={error || undefined} data-disabled={disabled || undefined}>
      <label className="ds-textfield__label" htmlFor={inputId}>
        {label}
        {required && <span className="ds-textfield__required"> (required)</span>}
      </label>
      <div className="ds-textfield__control">
        {iconStart && <span className="ds-textfield__icon">{iconStart}</span>}
        <input
          {...rest}
          id={inputId}
          className="ds-textfield__input"
          required={required}
          disabled={disabled}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
        />
      </div>
      {helperText && (
        <p className="ds-textfield__help" id={helpId}>
          {helperText}
        </p>
      )}
      {error && errorMessage && (
        <p className="ds-textfield__error" id={errId} role="alert">
          <Icon name="circle-alert" size="sm" />
          {errorMessage}
        </p>
      )}
    </div>
  );
};
