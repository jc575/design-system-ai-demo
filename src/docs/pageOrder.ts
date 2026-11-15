/*
  ONE SOURCE for the reading order of every docs page.
  Storybook's sidebar sort and the Previous / Next footer both read this list,
  so they cannot disagree. `npm run check:pages` fails if a page is missing or misplaced.

  Format: a name followed by an array is a folder. A name on its own is a page.
*/
export type Order = (string | Order)[];

export const STORY_ORDER: Order = [
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
];

/** Every page title in reading order, like "Foundations/Primitives/Color". */
export const flattenOrder = (order: Order = STORY_ORDER, prefix = ''): string[] => {
  const out: string[] = [];
  for (let i = 0; i < order.length; i++) {
    const item = order[i];
    if (typeof item !== 'string') continue;
    const next = order[i + 1];
    if (Array.isArray(next)) {
      out.push(...flattenOrder(next, `${prefix}${item}/`));
      i++;
    } else {
      out.push(`${prefix}${item}`);
    }
  }
  return out;
};

/** The id Storybook gives a docs page, for ?path=/docs/<id>. */
export const docsId = (title: string) =>
  `${title.toLowerCase().replace(/[^a-z0-9/]+/g, '-').replace(/\/+/g, '-').replace(/^-|-$/g, '')}--docs`;
