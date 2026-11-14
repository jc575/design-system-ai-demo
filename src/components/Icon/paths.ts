/** Icon geometry. 24 x 24 grid, drawn as strokes, 1.75 stroke width, round caps and joins.
 *  Each entry is a list of SVG path/shape strings. Add an icon here and it appears in the gallery automatically. */
export const ICON_PATHS = {
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  close: ['M6 6l12 12M18 6L6 18'],
  plus: ['M12 5v14M5 12h14'],
  search: ['circle:10.5,10.5,6.5', 'M15.5 15.5L20 20'],
  trash: ['M4 7h16M9.5 7V4.5h5V7M6.5 7l.9 12.5h9.2L17.5 7M10 11v5M14 11v5'],
  'chevron-right': ['M9.5 5.5L16 12l-6.5 6.5'],
  'chevron-down': ['M5.5 9.5L12 16l6.5-6.5'],
  'arrow-right': ['M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5'],
  external: ['M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5'],
  download: ['M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14'],
  filter: ['M4 5h16l-6.5 8v6l-3-1.8V13z'],
  bell: ['M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15zM10 21h4'],
  'shield-check': ['M12 3l7.5 3v5.5c0 4.5-3 8-7.5 9.5-4.5-1.5-7.5-5-7.5-9.5V6z', 'M8.8 12l2.4 2.4 4-4.4'],
  info: ['circle:12,12,9', 'M12 11v5.5M12 7.6v.01'],
  'circle-alert': ['circle:12,12,9', 'M12 7.5v5.5M12 16.5v.01'],
  'octagon-alert': ['M8 3h8l5 5v8l-5 5H8l-5-5V8z', 'M12 7.5v5.5M12 16.5v.01'],
  'triangle-alert': ['M12 3.5l9.5 16.5h-19z', 'M12 10v4.5M12 17.2v.01'],
  'diamond-alert': ['M12 2.5l9.5 9.5-9.5 9.5L2.5 12z', 'M12 8v5M12 15.8v.01'],
  'circle-down': ['circle:12,12,9', 'M8.5 11l3.5 3.5 3.5-3.5'],
} as const;

export type IconName = keyof typeof ICON_PATHS;
export const ICON_NAMES = Object.keys(ICON_PATHS) as IconName[];
