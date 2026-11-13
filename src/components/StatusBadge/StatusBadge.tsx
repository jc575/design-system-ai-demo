import React from 'react';
import './StatusBadge.css';
import { IconOctagonAlert, IconTriangleAlert, IconDiamond, IconCircleDown, IconInfo } from '../icons';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface StatusBadgeProps {
  /** Five levels, so this is a variant. Each level has its own icon shape AND its own word. Color is never the only signal. */
  severity: Severity;
  /** Two options (icon or no icon), so this is a boolean. */
  showIcon?: boolean;
  /** Optional override for the visible word. Defaults to the severity name. Keep it short. */
  label?: string;
}

const ICONS: Record<Severity, React.ReactNode> = {
  critical: <IconOctagonAlert />,
  high: <IconTriangleAlert />,
  medium: <IconDiamond />,
  low: <IconCircleDown />,
  info: <IconInfo />,
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
    {showIcon && ICONS[severity]}
    <span className="ds-badge__label">{label ?? DEFAULT_LABEL[severity]}</span>
  </span>
);
