import React from 'react';
import type { Preview } from '@storybook/react';
import '../src/tokens/primitives.css';
import '../src/tokens/semantic.css';
import '../src/tokens/base.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Color theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === 'dark' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      return (
        <div className="ds-canvas">
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    backgrounds: { disable: true },
    a11y: { element: '#storybook-root' },
    options: {
      storySort: { order: ['Introduction', 'Foundations', 'Components', 'Process'] },
    },
  },
};
export default preview;
