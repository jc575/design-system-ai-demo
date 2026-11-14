import React from 'react';
import type { Preview } from '@storybook/react';
import '@fontsource-variable/inter';
import '../src/tokens/primitives.css';
import '../src/tokens/primitives.color.css';
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
      storySort: {
        order: [
          'Introduction',
          'Method',
          ['Start here', 'How naming works', 'Which token do I use', 'Decision log', 'Scaling and contribution', 'Research and sources'],
          'Foundations',
          ['Token layers', 'Color', 'Semantic color', 'Typography', 'Iconography', 'Space and radius', 'Elevation, borders and motion', 'Figma to code parity'],
          'Components',
          ['Button', 'TextField', 'StatusBadge', 'Icon'],
          'Patterns',
          'Process',
        ],
      },
    },
  },
};
export default preview;
