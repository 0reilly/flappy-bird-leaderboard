import { NextRequest, NextResponse } from 'next/server';

export interface LeaderboardEntry {
  name: string;
  score: number;
  timestamp: number;
}

const LEADERBOARD_KEY = 'flappy-bird-leaderboard';

// Helper function to get KV instance
export async function getKV() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    // Production - use Vercel KV REST API directly
    return {
      get: async (key: string) => {
        const response = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
          headers: {
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          return data.result;
        }
        return null;
      },
      set: async (key: string, value: any) => {
        await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(value),
        });
      },
    };
  } else {
    // Development - use in-memory storage
    const memoryStorage = new Map();
    return {
      get: async (key: string) => memoryStorage.get(key) || null,
      set: async (key: string, value: any) => memoryStorage.set(key, value),
    };
  }
}

export async function GET() {
  try {
    const kv = await getKV();
    const leaderboard = await kv.get(LEADERBOARD_KEY);
    return NextResponse.json(leaderboard || []);
  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, score } = await request.json();

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Valid score is required' },
        { status: 400 }
      );
    }

    // Sanitize name
    const sanitizedName = name.trim().substring(0, 20);

    const entry = {
      name: sanitizedName,
      score,
      timestamp: Date.now(),
    };

    const kv = await getKV();
    const leaderboard = (await kv.get(LEADERBOARD_KEY)) || [];
    
    // Add new entry
    leaderboard.push(entry);
    
    // Sort by score (descending) and timestamp (ascending for same scores)
    leaderboard.sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timestamp - b.timestamp;
    });
    
    // Keep only top 100 scores
    const topScores = leaderboard.slice(0, 100);
    
    // Save back to KV
    await kv.set(LEADERBOARD_KEY, topScores);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}