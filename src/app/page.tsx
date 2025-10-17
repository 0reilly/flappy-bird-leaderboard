'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the game component to avoid SSR issues with canvas
const FlappyBird = dynamic(() => import('@/components/FlappyBird'), {
  ssr: false,
});

interface LeaderboardEntry {
  name: string;
  score: number;
  timestamp: number;
}

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // Refresh leaderboard every 10 seconds
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            Flappy Bird Leaderboard
          </h1>
          <p className="text-blue-100 text-lg md:text-xl">
            Compete with players worldwide!
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Game Section */}
          <div className="xl:col-span-2 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20">
              <FlappyBird />
            </div>
          </div>
          
          {/* Leaderboard Section */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Global Leaderboard
              </h2>
              <button
                onClick={fetchLeaderboard}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              >
                Refresh
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-gray-600 font-medium">No scores yet</p>
                <p className="text-gray-500 text-sm mt-1">Be the first to play!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 leaderboard-scroll">
                {leaderboard.map((entry, index) => (
                  <div
                    key={`${entry.name}-${entry.timestamp}`}
                    className={`flex justify-between items-center p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 border-2 border-yellow-400 shadow-lg' :
                      index === 1 ? 'bg-gradient-to-r from-gray-200 to-gray-100 border border-gray-300 shadow-md' :
                      index === 2 ? 'bg-gradient-to-r from-orange-200 to-orange-100 border border-orange-300 shadow-md' :
                      'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        index === 0 ? 'bg-yellow-600 text-white text-lg' :
                        index === 1 ? 'bg-gray-600 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{entry.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{entry.score}</div>
                      <div className="text-xs text-gray-500 mt-1">points</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3 text-lg">How to Play</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Press <strong>SPACE</strong> or <strong>CLICK</strong> to make the bird flap</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Avoid the pipes and the ground</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Each pipe passed = <strong>1 point</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Submit your score to the global leaderboard!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-white/20">
          <p className="text-blue-100 text-sm">
            Built with Next.js, TypeScript, and deployed on Vercel
          </p>
        </div>
      </div>
    </div>
  );
}