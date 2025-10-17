import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard, addScoreToLeaderboard } from '@/lib/kv';

export async function GET() {
  try {
    const leaderboard = await getLeaderboard();
    return NextResponse.json(leaderboard);
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

    await addScoreToLeaderboard(entry);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}