import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import { ICON_NAMES } from './paths';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  argTypes: {
    name: { description: 'Which icon. A named union of every icon in the set.', control: 'select', options: ICON_NAMES },
    size: { description: 'Four sizes, so this is a variant. sm 16, md 20, lg 24, xl 32.', control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
    tone: { description: 'Where the colour comes from. inherit follows the text next to it. The others use the icon colour tokens.', control: 'inline-radio', options: ['inherit', 'primary', 'secondary', 'disabled', 'danger'] },
    label: { description: 'Accessible name. Leave empty when decorative. Set it only when the icon carries meaning on its own.', control: 'text' },
  },
  args: { name: 'shield-check', size: 'lg', tone: 'primary' },
};
export default meta;
type Story = StoryObj<typeof Icon>;

export const Playground: Story = {};
export const Meaningful: Story = { args: { name: 'triangle-alert', tone: 'danger', label: 'Warning' } };
export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {(['primary', 'secondary', 'disabled', 'danger'] as const).map((t) => <Icon key={t} {...args} tone={t} />)}
    </div>
  ),
};
export const AllIcons: Story = {
  render: (args) => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
      {ICON_NAMES.map((n) => <li key={n}><Icon {...args} name={n} /></li>)}
    </ul>
  ),
};
