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
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Section */}
          <div className="lg:col-span-2">
            <FlappyBird />
          </div>
          
          {/* Leaderboard Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
              Global Leaderboard
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No scores yet. Be the first to play!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div
                    key={`${entry.name}-${entry.timestamp}`}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      index === 0 ? 'bg-yellow-100 border-2 border-yellow-300' :
                      index === 1 ? 'bg-gray-100 border border-gray-300' :
                      index === 2 ? 'bg-orange-100 border border-orange-300' :
                      'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`font-bold mr-3 ${
                        index === 0 ? 'text-yellow-600 text-xl' :
                        index === 1 ? 'text-gray-600 text-lg' :
                        index === 2 ? 'text-orange-600' :
                        'text-gray-700'
                      }`}>
                        #{index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-600">{entry.score}</span>
                      <div className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 text-center">
              <button
                onClick={fetchLeaderboard}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Refresh Leaderboard
              </button>
            </div>
            
            <div className="mt-6 text-sm text-gray-600">
              <h3 className="font-bold mb-2">How to Play:</h3>
              <ul className="space-y-1">
                <li>• Press SPACE or CLICK to make the bird flap</li>
                <li>• Avoid the pipes and the ground</li>
                <li>• Each pipe you pass gives you 1 point</li>
                <li>• Submit your score to the global leaderboard!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}