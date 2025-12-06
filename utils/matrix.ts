import { Grid, Position } from '../types';

export const createEmptyGrid = (rows: number, cols: number): Grid => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      filled: false,
      color: '',
      locked: false,
    }))
  );
};

export const rotateMatrix = (matrix: number[][], direction: 'CW' | 'CCW'): number[][] => {
  // Transpose
  const rows = matrix.length;
  const cols = matrix[0].length;
  const newMatrix = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      newMatrix[x][y] = matrix[y][x];
    }
  }

  // Reverse rows for CW, reverse each row for CCW
  if (direction === 'CW') {
    return newMatrix.map((row) => row.reverse());
  } else {
    return newMatrix.reverse();
  }
};

export const checkCollision = (
  shape: number[][],
  pos: Position,
  grid: Grid
): boolean => {
  const gridRows = grid.length;
  const gridCols = grid[0].length;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const newX = pos.x + x;
        const newY = pos.y + y;

        // Wall collision
        if (newX < 0 || newX >= gridCols || newY >= gridRows) {
          return true;
        }

        // Block collision (ignore if above board, but handle standard tetris logic)
        if (newY >= 0 && grid[newY][newX].filled) {
          return true;
        }
      }
    }
  }
  return false;
};

// Helper to generate a gradient color based on column index ratio
export const getRainbowColor = (colIndex: number, totalCols: number, baseColors: string[]) => {
  // If we have exact match in base colors (like 10 cols), use it
  if (totalCols === baseColors.length) return baseColors[colIndex];
  
  // Otherwise wrap around or just pick from palette based on index
  return baseColors[colIndex % baseColors.length];
};