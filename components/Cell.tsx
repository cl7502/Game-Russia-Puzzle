import React, { useMemo } from 'react';
import { CellData } from '../types';

interface CellProps {
  data: CellData;
  size: number;
}

export const Cell: React.FC<CellProps> = React.memo(({ data, size }) => {
  // Generate random explosion parameters when the cell is created/rendered
  // We use useMemo to keep them stable unless data changes drastically, but technically
  // we want new randoms if we re-enter clearing state.
  // Since key changes usually remount or we can trust the key prop in Board.
  
  const particles = useMemo(() => {
    // Generate 4-9 shards
    const count = 4; 
    return Array.from({ length: count }).map((_, i) => {
        // Random direction
        const angle = Math.random() * 360;
        const velocity = 20 + Math.random() * 30; // Distance to travel in % relative to cell
        const tx = Math.cos(angle * (Math.PI / 180)) * velocity;
        const ty = Math.sin(angle * (Math.PI / 180)) * velocity;
        const r = Math.random() * 360;
        const d = Math.random() * 0.2; // Delay
        
        return { tx, ty, r, d };
    });
  }, []);

  if (data.filled) {
    if (data.isClearing) {
        // Render Explosion
        return (
            <div style={{ width: size, height: size }} className="relative z-50">
                {particles.map((p, i) => (
                    <div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-white rounded-sm animate-explode"
                        style={{
                            backgroundColor: data.color,
                            '--tx': `${p.tx}px`,
                            '--ty': `${p.ty}px`,
                            '--r': `${p.r}deg`,
                            animationDelay: `${p.d}s`
                        } as React.CSSProperties}
                    />
                ))}
                {/* Flash overlay */}
                <div className="absolute inset-0 bg-white animate-flash rounded-sm" />
            </div>
        )
    }

    // Normal Block
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: data.color,
        }}
        className="relative border border-white/10 box-border block-gloss rounded-[2px]"
      >
        {/* Inner shine for extra "plastic" look */}
        <div className="absolute top-[10%] left-[10%] w-[80%] h-[40%] bg-gradient-to-b from-white/30 to-transparent rounded-sm pointer-events-none" />
      </div>
    );
  }

  // Empty Cell
  return (
    <div
      style={{ width: size, height: size }}
      className="border border-white/5 bg-white/[0.02]"
    />
  );
});

Cell.displayName = 'Cell';