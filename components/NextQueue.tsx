import React from 'react';
import { TetrominoType } from '../types';
import { TETROMINOES } from '../constants';

interface NextQueueProps {
  queue: TetrominoType[];
}

export const NextQueue: React.FC<NextQueueProps> = ({ queue }) => {
  // Show top 3
  const nextThree = queue.slice(0, 3);

  return (
    <div className="flex flex-col items-center space-y-4 mb-4">
      <div className="text-white/60 text-xs uppercase tracking-widest font-bold">Next</div>
      <div className="flex space-x-4 bg-black/20 p-2 rounded-xl border border-white/5 backdrop-blur-sm">
        {nextThree.map((type, idx) => {
          const shape = TETROMINOES[type].shape;
          // Calculate grid size for preview
          return (
            <div key={idx} className="w-12 h-12 flex items-center justify-center">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${shape[0].length}, 10px)`,
                  gap: '1px',
                }}
              >
                {shape.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`${y}-${x}`}
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: cell ? TETROMINOES[type].color : 'transparent',
                        opacity: cell ? 1 : 0,
                      }}
                      className={cell ? "rounded-[1px] shadow-sm" : ""}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};