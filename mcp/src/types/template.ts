import type { LayoutNode } from './layout.js';

/**
 * Template node with slots for components
 */
export interface TemplateNode {
  type: 'split' | 'item';
  direction?: 'horizontal' | 'vertical';
  ratio?: number;
  slot?: string; // For item nodes
  primary?: TemplateNode;
  secondary?: TemplateNode;
}

/**
 * Layout template definition
 */
export interface LayoutTemplate {
  name: string;
  description: string;
  preview: string; // ASCII art preview
  slots: string[]; // Required component slots
  defaultRatios: Record<string, number>;
  tree: TemplateNode;
}

/**
 * Built-in templates
 */
export const BUILTIN_TEMPLATES: Record<string, LayoutTemplate> = {
  'ide-layout': {
    name: 'IDE Layout',
    description: '3-panel layout: sidebar (20%), editor (56%), terminal (24%)',
    preview: `┌────┬────────────┐
│    │            │
│ S  │   Editor   │
│ I  │            │
│ D  ├────────────┤
│ E  │  Terminal  │
└────┴────────────┘`,
    slots: ['sidebar', 'editor', 'terminal'],
    defaultRatios: {
      'vertical-main': 0.2,
      'horizontal-content': 0.7,
    },
    tree: {
      type: 'split',
      direction: 'vertical',
      ratio: 0.2,
      primary: {
        type: 'item',
        slot: 'sidebar',
      },
      secondary: {
        type: 'split',
        direction: 'horizontal',
        ratio: 0.7,
        primary: {
          type: 'item',
          slot: 'editor',
        },
        secondary: {
          type: 'item',
          slot: 'terminal',
        },
      },
    },
  },

  'dashboard-2x2': {
    name: 'Dashboard 2x2',
    description: '2x2 grid layout for dashboard widgets',
    preview: `┌──────┬──────┐
│  W1  │  W2  │
├──────┼──────┤
│  W3  │  W4  │
└──────┴──────┘`,
    slots: ['widget1', 'widget2', 'widget3', 'widget4'],
    defaultRatios: {
      'horizontal-top': 0.5,
      'horizontal-bottom': 0.5,
      'vertical-left': 0.5,
      'vertical-right': 0.5,
    },
    tree: {
      type: 'split',
      direction: 'horizontal',
      ratio: 0.5,
      primary: {
        type: 'split',
        direction: 'vertical',
        ratio: 0.5,
        primary: {
          type: 'item',
          slot: 'widget1',
        },
        secondary: {
          type: 'item',
          slot: 'widget2',
        },
      },
      secondary: {
        type: 'split',
        direction: 'vertical',
        ratio: 0.5,
        primary: {
          type: 'item',
          slot: 'widget3',
        },
        secondary: {
          type: 'item',
          slot: 'widget4',
        },
      },
    },
  },

  'three-column': {
    name: 'Three Column',
    description: '3-column layout (20% / 60% / 20%)',
    preview: `┌───┬────────┬───┐
│   │        │   │
│ L │ Center │ R │
│   │        │   │
└───┴────────┴───┘`,
    slots: ['left', 'center', 'right'],
    defaultRatios: {
      'vertical-left': 0.2,
      'vertical-right': 0.75,
    },
    tree: {
      type: 'split',
      direction: 'vertical',
      ratio: 0.2,
      primary: {
        type: 'item',
        slot: 'left',
      },
      secondary: {
        type: 'split',
        direction: 'vertical',
        ratio: 0.75,
        primary: {
          type: 'item',
          slot: 'center',
        },
        secondary: {
          type: 'item',
          slot: 'right',
        },
      },
    },
  },

  'split-view': {
    name: 'Split View',
    description: 'Simple 50/50 split (horizontal or vertical)',
    preview: `┌──────────┬──────────┐
│          │          │
│   Left   │   Right  │
│          │          │
└──────────┴──────────┘`,
    slots: ['left', 'right'],
    defaultRatios: {
      'vertical-main': 0.5,
    },
    tree: {
      type: 'split',
      direction: 'vertical',
      ratio: 0.5,
      primary: {
        type: 'item',
        slot: 'left',
      },
      secondary: {
        type: 'item',
        slot: 'right',
      },
    },
  },
};
