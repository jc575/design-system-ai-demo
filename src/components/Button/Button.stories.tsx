import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Icon } from '../Icon/Icon';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    label: { description: 'Visible text. Required.', control: 'text' },
    emphasis: {
      description: 'Visual weight. Three options, so this is a variant.',
      control: 'inline-radio',
      options: ['primary', 'secondary', 'tertiary'],
    },
    size: { description: 'Three sizes, so this is a variant.', control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    destructive: { description: 'Two options, so this is a boolean. Use for actions that delete or cannot be undone.', control: 'boolean' },
    loading: { description: 'Two options, so this is a boolean. Keeps the label and announces "Loading".', control: 'boolean' },
    disabled: { description: 'Native disabled state.', control: 'boolean' },
    iconStart: { description: 'Slot for a decorative icon before the label.', control: false },
    iconEnd: { description: 'Slot for a decorative icon after the label.', control: false },
  },
  args: { label: 'Save policy', emphasis: 'primary', size: 'md', destructive: false, loading: false, disabled: false },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};
export const Secondary: Story = { args: { emphasis: 'secondary' } };
export const Tertiary: Story = { args: { emphasis: 'tertiary' } };
export const Destructive: Story = { args: { label: 'Delete rule', destructive: true, iconStart: <Icon name="trash" size="sm" /> } };
export const DestructiveSecondary: Story = { args: { label: 'Delete rule', destructive: true, emphasis: 'secondary', iconStart: <Icon name="trash" size="sm" /> } };
export const WithIcon: Story = { args: { label: 'Add rule', iconStart: <Icon name="plus" size="sm" /> } };
export const Loading: Story = { args: { label: 'Saving', loading: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button {...args} size="sm" label="Small" />
      <Button {...args} size="md" label="Medium" />
      <Button {...args} size="lg" label="Large" />
    </div>
  ),
};
