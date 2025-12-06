export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Tetromino {
  type: TetrominoType;
  shape: number[][]; // 2D array representing the shape
  color: string; // Fallback color (though we mostly use column colors)
}

export interface Position {
  x: number;
  y: number;
}

export interface CellData {
  filled: boolean;
  color: string; // Hex code
  locked: boolean;
  isClearing?: boolean; // For animation state
}

export type Grid = CellData[][];

export interface GameState {
  grid: Grid;
  activePiece: {
    shape: number[][];
    pos: Position;
    type: TetrominoType;
  } | null;
  nextQueue: TetrominoType[];
  score: number;
  level: number;
  gameOver: boolean;
  isPaused: boolean;
  linesCleared: number;
}