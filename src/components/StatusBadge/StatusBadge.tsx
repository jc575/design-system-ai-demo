import React from 'react';
import './StatusBadge.css';
import { Icon } from '../Icon/Icon';
import type { IconName } from '../Icon/paths';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface StatusBadgeProps {
  /** Five levels, so this is a variant. Each level has its own icon shape AND its own word. Color is never the only signal. */
  severity: Severity;
  /** Two options (icon or no icon), so this is a boolean. */
  showIcon?: boolean;
  /** Optional override for the visible word. Defaults to the severity name. Keep it short. */
  label?: string;
}

const ICONS: Record<Severity, IconName> = {
  critical: 'octagon-alert',
  high: 'triangle-alert',
  medium: 'diamond-alert',
  low: 'circle-down',
  info: 'info',
};

const DEFAULT_LABEL: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
};

export const StatusBadge = ({ severity, showIcon = true, label }: StatusBadgeProps) => (
  <span className="ds-badge" data-severity={severity}>
    {showIcon && <Icon name={ICONS[severity]} size="sm" />}
    <span className="ds-badge__label">{label ?? DEFAULT_LABEL[severity]}</span>
  </span>
);
