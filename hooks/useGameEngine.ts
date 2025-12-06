import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Grid,
  GameState,
  TetrominoType,
  Position,
  CellData,
} from '../types';
import {
  TICK_RATE_MS,
  FAST_DROP_RATE_MS,
  SHAPES_LIST,
  TETROMINOES,
  BASE_RAINBOW_COLS,
  CLEAR_ANIMATION_MS,
  DEFAULT_COLS,
  DEFAULT_ROWS,
} from '../constants';
import { createEmptyGrid, checkCollision, rotateMatrix, getRainbowColor } from '../utils/matrix';

const generateQueue = (): TetrominoType[] => {
  return Array.from({ length: 4 }, () =>
    SHAPES_LIST[Math.floor(Math.random() * SHAPES_LIST.length)]
  );
};

export const useGameEngine = (rows: number = DEFAULT_ROWS, cols: number = DEFAULT_COLS) => {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid(rows, cols));
  const [activePiece, setActivePiece] = useState<GameState['activePiece']>(null);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>(generateQueue());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isFastDropping, setIsFastDropping] = useState(false);
  const [clearingRows, setClearingRows] = useState<number[]>([]);

  // Refs for loop management to avoid stale closures in intervals
  const gameStateRef = useRef({
    grid,
    activePiece,
    gameOver,
    clearingRows,
    rows,
    cols
  });

  // Sync ref
  useEffect(() => {
    gameStateRef.current = { grid, activePiece, gameOver, clearingRows, rows, cols };
  }, [grid, activePiece, gameOver, clearingRows, rows, cols]);

  // Restart game when dimensions change
  useEffect(() => {
    setGrid(createEmptyGrid(rows, cols));
    setScore(0);
    setGameOver(false);
    setActivePiece(null);
    setNextQueue(generateQueue());
    setClearingRows([]);
  }, [rows, cols]);

  const spawnPiece = useCallback(() => {
    const queue = [...nextQueue];
    const nextType = queue.shift();
    if (!nextType) return; 

    // Refill queue
    while (queue.length < 4) {
      queue.push(SHAPES_LIST[Math.floor(Math.random() * SHAPES_LIST.length)]);
    }

    setNextQueue(queue);

    const { cols: currentCols, grid: currentGrid } = gameStateRef.current;

    const newPiece = {
      type: nextType,
      shape: TETROMINOES[nextType].shape,
      pos: { x: Math.floor(currentCols / 2) - 1, y: -2 }, // Start slightly above
    };

    // Immediate collision check (Game Over)
    if (checkCollision(newPiece.shape, { ...newPiece.pos, y: 0 }, currentGrid)) {
      setGameOver(true);
      setActivePiece(null);
    } else {
      setActivePiece(newPiece);
    }
  }, [nextQueue]);

  const lockPiece = useCallback(() => {
    const { activePiece: currentPiece, grid: currentGrid, rows: currentRows, cols: currentCols } = gameStateRef.current;
    if (!currentPiece) return;

    const newGrid = currentGrid.map((row) => row.map((cell) => ({ ...cell })));

    // Burn piece into grid
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const gridY = currentPiece.pos.y + y;
          const gridX = currentPiece.pos.x + x;

          if (gridY >= 0 && gridY < currentRows && gridX >= 0 && gridX < currentCols) {
            newGrid[gridY][gridX] = {
              filled: true,
              color: getRainbowColor(gridX, currentCols, BASE_RAINBOW_COLS),
              locked: true,
            };
          }
        }
      }
    }

    // Check lines
    const rowsToClear: number[] = [];
    newGrid.forEach((row, index) => {
      if (row.every((cell) => cell.filled)) {
        rowsToClear.push(index);
      }
    });

    if (rowsToClear.length > 0) {
      // 1. Mark rows as clearing (triggers animation)
      const animatingGrid = newGrid.map((row, y) => {
        if (rowsToClear.includes(y)) {
          return row.map(c => ({ ...c, isClearing: true }));
        }
        return row;
      });
      
      setGrid(animatingGrid);
      setClearingRows(rowsToClear);
      setActivePiece(null);

      // 2. Wait for animation, then remove
      setTimeout(() => {
        setGrid((prevGrid) => {
          // Remove cleared rows
          const remainingRows = prevGrid.filter((_, idx) => !rowsToClear.includes(idx));
          // Add new empty rows at top
          const newRows = Array.from({ length: rowsToClear.length }, () =>
            Array.from({ length: currentCols }, () => ({
              filled: false,
              color: '',
              locked: false,
            }))
          );
          
          return [...newRows, ...remainingRows];
        });
        setClearingRows([]);
        setScore((s) => s + rowsToClear.length * 100);
        spawnPiece();
      }, CLEAR_ANIMATION_MS);

    } else {
      setGrid(newGrid);
      setScore((s) => s + 10); // Points for placing
      spawnPiece();
    }
  }, [spawnPiece]);

  const move = useCallback(
    (dx: number, dy: number) => {
      const { activePiece: currentPiece, grid: currentGrid, gameOver: isOver, clearingRows: isClearing } = gameStateRef.current;
      if (!currentPiece || isOver || isClearing.length > 0) return;

      const newPos = { x: currentPiece.pos.x + dx, y: currentPiece.pos.y + dy };

      if (!checkCollision(currentPiece.shape, newPos, currentGrid)) {
        setActivePiece({ ...currentPiece, pos: newPos });
      } else if (dy > 0) {
        // Hit bottom or another block moving down
        lockPiece();
      }
    },
    [lockPiece]
  );

  const rotate = useCallback((direction: 'CW' | 'CCW') => {
    const { activePiece: currentPiece, grid: currentGrid, gameOver: isOver } = gameStateRef.current;
    if (!currentPiece || isOver) return;

    const newShape = rotateMatrix(currentPiece.shape, direction);
    
    // Simple Wall Kicks
    const kicks = [0, -1, 1, -2, 2];
    
    for (const offset of kicks) {
      const testPos = { ...currentPiece.pos, x: currentPiece.pos.x + offset };
      if (!checkCollision(newShape, testPos, currentGrid)) {
        setActivePiece({
          ...currentPiece,
          shape: newShape,
          pos: testPos,
        });
        return;
      }
    }
  }, []);

  // Tick Loop
  useEffect(() => {
    if (gameOver) return;

    // Don't tick while clearing animation is playing
    if (clearingRows.length > 0) return;

    if (!activePiece) {
      spawnPiece();
      return;
    }

    const interval = setInterval(() => {
      move(0, 1);
    }, isFastDropping ? FAST_DROP_RATE_MS : TICK_RATE_MS);

    return () => clearInterval(interval);
  }, [activePiece, gameOver, isFastDropping, move, spawnPiece, clearingRows]);

  // Mouse Input Helpers
  const moveToColumn = useCallback((colIndex: number) => {
    const { activePiece: currentPiece, grid: currentGrid, cols: currentCols } = gameStateRef.current;
    if (!currentPiece || gameOver) return;
    
    // Center alignment roughly
    const shapeWidth = currentPiece.shape[0].length;
    const offset = Math.floor(shapeWidth / 2);
    let targetX = colIndex - offset;
    
    // Safety clamp (though checkCollision handles it)
    // We want the piece to feel like it follows the finger, so we try to go there
    if (!checkCollision(currentPiece.shape, {x: targetX, y: currentPiece.pos.y}, currentGrid)) {
        setActivePiece(prev => prev ? ({ ...prev, pos: { ...prev.pos, x: targetX } }) : null);
    }
  }, [gameOver]);


  return {
    grid,
    activePiece,
    nextQueue,
    score,
    gameOver,
    move,
    rotate,
    setIsFastDropping,
    moveToColumn,
    restart: () => {
      setGrid(createEmptyGrid(rows, cols));
      setScore(0);
      setGameOver(false);
      setNextQueue(generateQueue());
      setActivePiece(null);
      setClearingRows([]);
    }
  };
};