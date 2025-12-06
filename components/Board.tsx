import React, { useEffect, useState, forwardRef } from 'react';
import { GameState, Grid } from '../types';
import { TETROMINOES, BASE_RAINBOW_COLS } from '../constants';
import { getRainbowColor } from '../utils/matrix';
import { Cell } from './Cell';

interface BoardProps {
  grid: Grid;
  activePiece: GameState['activePiece'];
  rows: number;
  cols: number;
}

export const Board = forwardRef<HTMLDivElement, BoardProps>(({ grid, activePiece, rows, cols }, ref) => {
  const [cellSize, setCellSize] = useState(30);

  // Responsive cell sizing based on dynamic rows/cols
  useEffect(() => {
    const updateSize = () => {
      // Calculate max available space
      const headerHeight = 100;
      const controlsHeight = 100;
      const padding = 40;
      
      const availableHeight = window.innerHeight - headerHeight - controlsHeight - padding;
      const availableWidth = window.innerWidth - padding;

      const heightBased = availableHeight / rows;
      const widthBased = availableWidth / cols;
      
      // Clamp size to reasonable limits
      setCellSize(Math.min(heightBased, widthBased, 40));
    };

    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, [rows, cols]);

  // Merge active piece into grid for rendering (without locking)
  const displayGrid = grid.map(row => [...row]);
  
  if (activePiece) {
    activePiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const gridY = activePiece.pos.y + y;
          const gridX = activePiece.pos.x + x;
          if (gridY >= 0 && gridY < rows && gridX >= 0 && gridX < cols) {
            if(!displayGrid[gridY][gridX].filled) {
               displayGrid[gridY][gridX] = {
                 filled: true,
                 locked: false,
                 color: TETROMINOES[activePiece.type].color, 
               };
            }
          }
        }
      });
    });
  }
  
  return (
    <div 
      className="relative rounded-lg overflow-hidden shadow-2xl ring-4 ring-white/10 bg-black/80 backdrop-blur-md transition-all duration-300"
      ref={ref}
      style={{
        width: cellSize * cols,
        height: cellSize * rows,
      }}
    >
      {/* Background Gradient Columns */}
      <div className="absolute inset-0 flex opacity-10 pointer-events-none">
         {Array.from({length: cols}).map((_, i) => (
             <div 
                key={i} 
                className="flex-1 h-full border-r border-white/5" 
                style={{backgroundColor: getRainbowColor(i, cols, BASE_RAINBOW_COLS)}} 
             />
         ))}
      </div>

      {/* Grid */}
      <div 
        className="absolute inset-0 grid"
        style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {displayGrid.map((row, y) => 
            row.map((cell, x) => (
                <Cell key={`${y}-${x}`} data={cell} size={cellSize} />
            ))
        )}
      </div>
    </div>
  );
});

Board.displayName = 'Board';