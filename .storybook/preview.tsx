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
    docs: { toc: { title: 'On this page', headingSelector: 'h2, h3' } },
    options: {
      storySort: {
        order: [
          // Keep identical to src/docs/pageOrder.ts. Storybook needs it written inline. `npm run check:pages` fails if they differ.
          'Introduction',
          'Use it in code',
          'Method',
          ['Start here', 'How naming works', 'Which token do I use', 'Decision log', 'Scaling and contribution', 'Research and sources'],
          'Foundations',
          [
            'Start here',
            'Primitives',
            ['Color', 'Typography', 'Space', 'Radius and stroke', 'Shadow'],
            'Semantic',
            ['How semantic tokens work', 'Background', 'Text', 'Border and focus', 'Icon', 'Typography', 'Space', 'Radius and border width', 'Elevation', 'Motion'],
            'Iconography',
            'Figma to code parity',
          ],
          'Components',
          ['Button', 'TextField', 'StatusBadge', 'Icon'],
          'Patterns',
          ['Form footer', 'Destructive confirmation', 'Empty state'],
          'Process',
          ['Process log'],
        ],
      },
    },
  },
};
export default preview;
