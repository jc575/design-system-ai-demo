import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    severity: {
      description: 'Five levels, so this is a variant. Each level has its own word and icon shape.',
      control: 'select',
      options: ['critical', 'high', 'medium', 'low', 'info'],
    },
    showIcon: { description: 'Two options, so this is a boolean.', control: 'boolean' },
    label: { description: 'Optional override for the visible word. Keep it short.', control: 'text' },
  },
  args: { severity: 'critical', showIcon: true },
};
export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Playground: Story = {};
export const AllSeverities: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {(['critical', 'high', 'medium', 'low', 'info'] as const).map((s) => (
        <StatusBadge key={s} {...args} severity={s} />
      ))}
    </div>
  ),
};
export const WithoutIcon: Story = { args: { severity: 'high', showIcon: false } };
export const CustomLabel: Story = { args: { severity: 'medium', label: 'Needs review' } };
