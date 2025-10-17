import { kv } from '@vercel/kv';

export interface LeaderboardEntry {
  name: string;
  score: number;
  timestamp: number;
}

const LEADERBOARD_KEY = 'flappy-bird-leaderboard';

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const leaderboard = await kv.get<LeaderboardEntry[]>(LEADERBOARD_KEY);
    return leaderboard || [];
  } catch (error) {
    console.error('Error fetching leaderboard from KV:', error);
    return [];
  }
}

export async function addScoreToLeaderboard(entry: LeaderboardEntry): Promise<void> {
  try {
    const leaderboard = await getLeaderboard();
    
    // Add new entry
    leaderboard.push(entry);
    
    // Sort by score (descending) and timestamp (ascending for same scores)
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timestamp - b.timestamp;
    });
    
    // Keep only top 100 scores
    const topScores = leaderboard.slice(0, 100);
    
    // Save back to KV
    await kv.set(LEADERBOARD_KEY, topScores);
  } catch (error) {
    console.error('Error adding score to leaderboard:', error);
    throw error;
  }
}