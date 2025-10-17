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
  const gameLoopRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

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

  const drawBird = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(x, y, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + 8, y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.moveTo(x + 12, y);
    ctx.lineTo(x + 25, y);
    ctx.lineTo(x + 12, y + 8);
    ctx.fill();
  };

  const drawPipe = (ctx: CanvasRenderingContext2D, x: number, gapY: number) => {
    const pipeWidth = 60;
    
    // Top pipe
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(x, 0, pipeWidth, gapY - PIPE_GAP / 2);
    
    // Bottom pipe
    ctx.fillRect(x, gapY + PIPE_GAP / 2, pipeWidth, 400);
    
    // Pipe caps
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(x - 5, gapY - PIPE_GAP / 2 - 20, pipeWidth + 10, 20);
    ctx.fillRect(x - 5, gapY + PIPE_GAP / 2, pipeWidth + 10, 20);
  };

  const checkCollision = (birdY: number, pipes: GameState['pipes']): boolean => {
    // Ground collision
    if (birdY + BIRD_SIZE / 2 >= 600 || birdY - BIRD_SIZE / 2 <= 0) {
      return true;
    }

    // Pipe collision
    for (const pipe of pipes) {
      const pipeX = pipe.x;
      const gapTop = pipe.gapY - PIPE_GAP / 2;
      const gapBottom = pipe.gapY + PIPE_GAP / 2;
      
      if (
        pipeX <= 100 + BIRD_SIZE / 2 &&
        pipeX + 60 >= 100 - BIRD_SIZE / 2 &&
        (birdY - BIRD_SIZE / 2 <= gapTop || birdY + BIRD_SIZE / 2 >= gapBottom)
      ) {
        return true;
      }
    }

    return false;
  };

  const updateGame = () => {
    const state = gameStateRef.current;
    
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
    if (state.pipes.length === 0 || state.pipes[state.pipes.length - 1].x < 800 - PIPE_SPACING) {
      state.pipes.push({
        x: 800,
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
    if (checkCollision(state.birdY, state.pipes)) {
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

    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 580, canvas.width, 20);

    const state = gameStateRef.current;

    // Draw pipes
    state.pipes.forEach(pipe => {
      drawPipe(ctx, pipe.x, pipe.gapY);
    });

    // Draw bird
    drawBird(ctx, 100, state.birdY);

    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${state.score}`, 20, 30);

    // Draw game over or start message
    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '36px Arial';
      ctx.fillText('Game Over!', 300, 250);
      ctx.font = '24px Arial';
      ctx.fillText(`Final Score: ${state.score}`, 300, 300);
      ctx.fillText('Click to play again', 300, 350);
    } else if (!state.gameStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '36px Arial';
      ctx.fillText('Flappy Bird', 300, 250);
      ctx.font = '24px Arial';
      ctx.fillText('Click to start', 300, 300);
      ctx.fillText('Press SPACE or CLICK to flap', 250, 350);
    }
  };

  const gameLoop = () => {
    updateGame();
    drawGame();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
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
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">Flappy Bird Leaderboard</h1>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onClick={handleCanvasClick}
          className="border-2 border-gray-300 rounded-lg shadow-lg cursor-pointer"
        />
        
        {showNameInput && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Submit Your Score!</h3>
              <p className="mb-2">Final Score: {score}</p>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="border border-gray-300 p-2 rounded mb-4 w-full"
                maxLength={20}
              />
              <div className="flex gap-2">
                <button
                  onClick={submitScore}
                  disabled={!playerName.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  Submit Score
                </button>
                <button
                  onClick={() => setShowNameInput(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-lg text-gray-700">Press SPACE or CLICK to make the bird flap</p>
        <p className="text-sm text-gray-500 mt-2">Avoid the pipes and try to get the highest score!</p>
      </div>
    </div>
  );
};

export default FlappyBird;