import { Tetromino, TetrominoType } from './types';

export const DEFAULT_COLS = 10;
export const DEFAULT_ROWS = 20;
export const TICK_RATE_MS = 800;
export const FAST_DROP_RATE_MS = 50;
export const LOCK_DELAY_MS = 500;
export const CLEAR_ANIMATION_MS = 500; // Increased slightly for particle effect

// The rainbow colors corresponding to each column (0-9)
// We will generate more if columns > 10 using a helper, but this is the base palette
export const BASE_RAINBOW_COLS = [
  "#6366F1", // Indigo 500
  "#3B82F6", // Blue 500
  "#0EA5E9", // Sky 500
  "#06B6D4", // Cyan 500
  "#10B981", // Emerald 500
  "#84CC16", // Lime 500
  "#EAB308", // Yellow 500
  "#F97316", // Orange 500
  "#EF4444", // Red 500
  "#EC4899", // Pink 500
];

export const TETROMINOES: Record<TetrominoType, Tetromino> = {
  I: {
    type: 'I',
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#06B6D4',
  },
  O: {
    type: 'O',
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#EAB308',
  },
  T: {
    type: 'T',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#A855F7',
  },
  S: {
    type: 'S',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#22C55E',
  },
  Z: {
    type: 'Z',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#EF4444',
  },
  J: {
    type: 'J',
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#3B82F6',
  },
  L: {
    type: 'L',
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#F97316',
  },
};

export const SHAPES_LIST: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];