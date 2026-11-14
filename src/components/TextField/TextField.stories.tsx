import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { TextField } from './TextField';
import { Icon } from '../Icon/Icon';

const meta: Meta<typeof TextField> = {
  title: 'Components/TextField',
  component: TextField,
  tags: ['autodocs'],
  argTypes: {
    label: { description: 'Visible label. Required. Placeholder is never a label.', control: 'text' },
    helperText: { description: 'Short help under the field. Linked to the input for screen readers.', control: 'text' },
    error: { description: 'Two options (valid or invalid), so this is a boolean.', control: 'boolean' },
    errorMessage: { description: 'Plain language message: what went wrong and how to fix it. Shown only when error is true.', control: 'text' },
    required: { description: 'Adds "(required)" in text, not just a symbol.', control: 'boolean' },
    disabled: { description: 'Native disabled state.', control: 'boolean' },
    iconStart: { description: 'Slot for a decorative icon.', control: false },
  },
  args: { label: 'Policy name', helperText: 'Use a name your team will recognize.', error: false, required: false, disabled: false },
};
export default meta;
type Story = StoryObj<typeof TextField>;

export const Playground: Story = { args: { placeholder: 'Block risky downloads' } };
export const Required: Story = { args: { required: true } };
export const WithIcon: Story = { args: { label: 'Search policies', helperText: undefined, iconStart: <Icon name="search" size="sm" tone="secondary" />, placeholder: 'Search by name' } };
export const ErrorState: Story = {
  args: { required: true, error: true, errorMessage: 'Enter a policy name. It can use letters, numbers and spaces.' },
};
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Default policy' } };
export const TypeAndCheck: Story = {
  args: { placeholder: 'Block risky downloads' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Policy name');
    await userEvent.type(input, 'Block risky downloads');
    await expect(input).toHaveValue('Block risky downloads');
  },
};
