import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { Board } from './components/Board';
import { NextQueue } from './components/NextQueue';
import { RotateCcw, Settings, X } from 'lucide-react';
import { DEFAULT_COLS, DEFAULT_ROWS } from './constants';

const App = () => {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [showSettings, setShowSettings] = useState(false);

  // Settings Temp State
  const [tempRows, setTempRows] = useState(DEFAULT_ROWS);
  const [tempCols, setTempCols] = useState(DEFAULT_COLS);

  const {
    grid,
    activePiece,
    nextQueue,
    score,
    gameOver,
    rotate,
    setIsFastDropping,
    moveToColumn,
    move,
    restart
  } = useGameEngine(rows, cols);

  const boardRef = useRef<HTMLDivElement>(null);
  const holdTimeoutRef = useRef<number | null>(null);
  const isHoldActionRef = useRef(false);
  const lastTapRef = useRef(0);

  // --- Input Handlers ---

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (gameOver || !activePiece || !boardRef.current || showSettings) return;

    e.preventDefault();

    const rect = boardRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const boardWidth = rect.width;
    
    const colIndex = Math.floor((relativeX / boardWidth) * cols);
    const clampedCol = Math.max(0, Math.min(colIndex, cols - 1));
    
    moveToColumn(clampedCol);
  }, [gameOver, activePiece, moveToColumn, cols, showSettings]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (showSettings) return;

    // Right Click
    if (e.button === 2) {
        e.preventDefault();
        rotate('CCW');
        return;
    }

    isHoldActionRef.current = false;
    
    holdTimeoutRef.current = window.setTimeout(() => {
        isHoldActionRef.current = true;
        setIsFastDropping(true);
    }, 200); 
  }, [rotate, setIsFastDropping, showSettings]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    if (showSettings) return;

    if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
    }
    
    setIsFastDropping(false);

    if (!isHoldActionRef.current) {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        
        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            rotate('CCW');
        } else {
            rotate('CW');
        }
        lastTapRef.current = now;
    }
  }, [rotate, setIsFastDropping, showSettings]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || showSettings) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          move(-1, 0);
          break;
        case 'ArrowRight':
          move(1, 0);
          break;
        case 'ArrowDown':
          setIsFastDropping(true);
          break;
        case 'ArrowUp':
          rotate('CW');
          break;
        case ' ': 
          setIsFastDropping(true); 
          break;
        case 'z':
        case 'Z':
           rotate('CCW');
           break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') {
        setIsFastDropping(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [move, rotate, setIsFastDropping, gameOver, showSettings]);

  const openSettings = () => {
      setTempRows(rows);
      setTempCols(cols);
      setShowSettings(true);
  };

  const saveSettings = () => {
      setRows(tempRows);
      setCols(tempCols);
      setShowSettings(false);
      // Game restarts automatically via effect in hook when rows/cols change
  };


  return (
    <div 
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden select-none touch-none"
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
    >
      {/* HUD Header */}
      <div className="absolute top-4 left-0 right-0 px-6 flex justify-between items-start max-w-lg mx-auto w-full z-10 pointer-events-none">
        <div>
           <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 drop-shadow-sm">
             RAINBOW BLOCK
           </h1>
           <p className="text-xs text-white/50 font-mono">SCORE: {score.toString().padStart(6, '0')}</p>
        </div>
        <div className="pointer-events-auto flex gap-2">
             <button 
                onClick={openSettings} 
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition"
             >
                <Settings size={20} />
             </button>
             {gameOver && (
                 <button onClick={restart} className="bg-white text-purple-900 px-4 py-2 rounded-full font-bold shadow-lg active:scale-95 transition">
                    Try Again
                 </button>
             )}
        </div>
      </div>

      {/* Game Layer */}
      <div className="relative z-0 mt-12 flex flex-col items-center">
        <NextQueue queue={nextQueue} />
        
        <Board 
            ref={boardRef}
            grid={grid} 
            activePiece={activePiece} 
            rows={rows}
            cols={cols}
        />

        {/* Instructions */}
        <div className="mt-6 text-white/40 text-[10px] md:text-xs text-center font-mono space-y-1 pointer-events-none">
            <p>DRAG ANYWHERE TO MOVE • TAP TO ROTATE</p>
            <p>HOLD TO DROP • DOUBLE TAP TO ROTATE CCW</p>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-slate-800 border border-white/10 p-6 rounded-2xl shadow-2xl w-80" onPointerDown={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Grid Settings</h2>
                      <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
                  </div>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="flex justify-between text-sm font-mono text-blue-300 mb-2">
                              <span>WIDTH (Columns)</span>
                              <span>{tempCols}</span>
                          </label>
                          <input 
                              type="range" min="6" max="16" step="1" 
                              value={tempCols}
                              onChange={(e) => setTempCols(parseInt(e.target.value))}
                              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>
                      
                      <div>
                          <label className="flex justify-between text-sm font-mono text-pink-300 mb-2">
                              <span>HEIGHT (Rows)</span>
                              <span>{tempRows}</span>
                          </label>
                          <input 
                              type="range" min="10" max="25" step="1" 
                              value={tempRows}
                              onChange={(e) => setTempRows(parseInt(e.target.value))}
                              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                          />
                      </div>
                  </div>

                  <div className="mt-8">
                      <button 
                        onClick={saveSettings}
                        className="w-full bg-gradient-to-r from-blue-500 to-pink-500 hover:opacity-90 text-white font-bold py-3 rounded-xl shadow-lg transition"
                      >
                          APPLY & RESTART
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Game Over Overlay */}
      {gameOver && !showSettings && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
           <div className="bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl text-center max-w-xs mx-4">
              <h2 className="text-4xl font-black text-white mb-2 drop-shadow-md">GAME OVER</h2>
              <div className="text-xl font-mono text-pink-300 mb-6">{score} PTS</div>
              <button 
                onClick={restart}
                onPointerDown={(e) => e.stopPropagation()} 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                RESTART
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;