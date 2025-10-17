'use client';

import React, { useEffect, useRef, useState } from 'react';

interface GameState {
  birdY: number;
  birdVelocity: number;
  pipes: Array<{
    x: number;
    gapY: number;
    passed: boolean;
  }>;
  score: number;
  gameOver: boolean;
  gameStarted: boolean;
}

const FlappyBird: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Game constants
  const GRAVITY = 0.5;
  const JUMP_STRENGTH = -10;
  const PIPE_SPEED = 3;
  const PIPE_SPACING = 200;
  const PIPE_GAP = 150;
  const BIRD_SIZE = 30;

  const gameStateRef = useRef<GameState>({
    birdY: 250,
    birdVelocity: 0,
    pipes: [],
    score: 0,
    gameOver: false,
    gameStarted: false,
  });

  // Responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const maxWidth = 800;
        const width = Math.min(containerWidth - 32, maxWidth); // Account for padding
        const height = (width * 600) / 800; // Maintain aspect ratio
        setCanvasSize({ width, height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const drawBird = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
    const scaledBirdSize = BIRD_SIZE * scale;
    
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(x, y, scaledBirdSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + 8 * scale, y - 5 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.moveTo(x + 12 * scale, y);
    ctx.lineTo(x + 25 * scale, y);
    ctx.lineTo(x + 12 * scale, y + 8 * scale);
    ctx.fill();
  };

  const drawPipe = (ctx: CanvasRenderingContext2D, x: number, gapY: number, scale: number) => {
    const pipeWidth = 60 * scale;
    const gapSize = PIPE_GAP * scale;
    
    // Top pipe
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(x, 0, pipeWidth, gapY - gapSize / 2);
    
    // Bottom pipe
    ctx.fillRect(x, gapY + gapSize / 2, pipeWidth, canvasSize.height);
    
    // Pipe caps
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(x - 5 * scale, gapY - gapSize / 2 - 20 * scale, pipeWidth + 10 * scale, 20 * scale);
    ctx.fillRect(x - 5 * scale, gapY + gapSize / 2, pipeWidth + 10 * scale, 20 * scale);
  };

  const checkCollision = (birdY: number, pipes: GameState['pipes'], scale: number): boolean => {
    const scaledBirdSize = BIRD_SIZE * scale;
    const birdX = 100 * scale;

    // Ground collision
    if (birdY + scaledBirdSize / 2 >= canvasSize.height || birdY - scaledBirdSize / 2 <= 0) {
      return true;
    }

    // Pipe collision
    for (const pipe of pipes) {
      const pipeX = pipe.x * scale;
      const gapTop = pipe.gapY * scale - (PIPE_GAP * scale) / 2;
      const gapBottom = pipe.gapY * scale + (PIPE_GAP * scale) / 2;
      
      if (
        pipeX <= birdX + scaledBirdSize / 2 &&
        pipeX + 60 * scale >= birdX - scaledBirdSize / 2 &&
        (birdY - scaledBirdSize / 2 <= gapTop || birdY + scaledBirdSize / 2 >= gapBottom)
      ) {
        return true;
      }
    }

    return false;
  };

  const updateGame = () => {
    const state = gameStateRef.current;
    const scale = canvasSize.width / 800;
    
    if (!state.gameStarted || state.gameOver) return;

    // Update bird position
    state.birdVelocity += GRAVITY;
    state.birdY += state.birdVelocity;

    // Update pipes
    state.pipes = state.pipes.map(pipe => ({
      ...pipe,
      x: pipe.x - PIPE_SPEED,
    })).filter(pipe => pipe.x > -100);

    // Add new pipes
    if (state.pipes.length === 0 || state.pipes[state.pipes.length - 1].x < (canvasSize.width / scale) - PIPE_SPACING) {
      state.pipes.push({
        x: canvasSize.width / scale,
        gapY: 150 + Math.random() * 200,
        passed: false,
      });
    }

    // Check for passed pipes and update score
    state.pipes.forEach(pipe => {
      if (!pipe.passed && pipe.x < 100 - BIRD_SIZE / 2) {
        pipe.passed = true;
        state.score++;
        setScore(state.score);
      }
    });

    // Check collision
    if (checkCollision(state.birdY, state.pipes, scale)) {
      state.gameOver = true;
      setGameOver(true);
      setShowNameInput(true);
    }
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = canvasSize.width / 800;

    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 20 * scale, canvas.width, 20 * scale);

    const state = gameStateRef.current;

    // Draw pipes
    state.pipes.forEach(pipe => {
      drawPipe(ctx, pipe.x * scale, pipe.gapY * scale, scale);
    });

    // Draw bird
    drawBird(ctx, 100 * scale, state.birdY, scale);

    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = `${24 * scale}px Arial`;
    ctx.fillText(`Score: ${state.score}`, 20 * scale, 30 * scale);

    // Draw game over or start message
    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = `${36 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50 * scale);
      ctx.font = `${24 * scale}px Arial`;
      ctx.fillText(`Final Score: ${state.score}`, canvas.width / 2, canvas.height / 2);
      ctx.fillText('Click to play again', canvas.width / 2, canvas.height / 2 + 50 * scale);
      ctx.textAlign = 'left';
    } else if (!state.gameStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = `${36 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Flappy Bird', canvas.width / 2, canvas.height / 2 - 50 * scale);
      ctx.font = `${20 * scale}px Arial`;
      ctx.fillText('Click to start', canvas.width / 2, canvas.height / 2);
      ctx.fillText('Press SPACE or CLICK to flap', canvas.width / 2, canvas.height / 2 + 40 * scale);
      ctx.textAlign = 'left';
    }
  };

  const jump = () => {
    const state = gameStateRef.current;
    if (!state.gameStarted) {
      state.gameStarted = true;
      setGameStarted(true);
    }
    state.birdVelocity = JUMP_STRENGTH;
  };

  const resetGame = () => {
    gameStateRef.current = {
      birdY: 250,
      birdVelocity: 0,
      pipes: [],
      score: 0,
      gameOver: false,
      gameStarted: false,
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setShowNameInput(false);
  };

  const handleCanvasClick = () => {
    if (gameStateRef.current.gameOver) {
      resetGame();
    } else {
      jump();
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      jump();
    }
  };

  const submitScore = async () => {
    if (!playerName.trim()) return;
    
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playerName.trim(),
          score: score,
        }),
      });

      if (response.ok) {
        setShowNameInput(false);
        setPlayerName('');
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Start game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    // Add event listeners
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [canvasSize]);

  const gameLoop = () => {
    updateGame();
    drawGame();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      <div className="relative w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleCanvasClick}
          className="border-2 border-white/30 rounded-xl shadow-2xl cursor-pointer bg-sky-300"
          style={{
            maxWidth: '100%',
            height: 'auto'
          }}
        />
        
        {showNameInput && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-xl">
            <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 mx-4 max-w-sm w-full">
              <h3 className="text-xl font-bold mb-4 text-center text-gray-800">Submit Your Score!</h3>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-gray-600">points</div>
              </div>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="border border-gray-300 p-3 rounded-lg mb-4 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={20}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={submitScore}
                  disabled={!playerName.trim()}
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors font-medium"
                >
                  Submit Score
                </button>
                <button
                  onClick={() => setShowNameInput(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center text-white">
        <p className="text-sm md:text-base font-medium">Press <kbd className="px-2 py-1 bg-white/20 rounded text-sm font-mono">SPACE</kbd> or <strong>CLICK</strong> to make the bird flap</p>
        <p className="text-xs md:text-sm text-blue-100 mt-1">Avoid the pipes and try to get the highest score!</p>
      </div>
    </div>
  );
};

export default FlappyBird;