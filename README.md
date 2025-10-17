# Flappy Bird Leaderboard

A modern Flappy Bird clone with a global leaderboard, built with Next.js, TypeScript, and deployed on Vercel with Vercel KV for data storage.

## Features

- 🎮 **Classic Flappy Bird Gameplay**: Smooth physics, responsive controls
- 🌍 **Global Leaderboard**: Real-time score tracking across all players
- 🏆 **Top 100 Rankings**: See how you stack up against players worldwide
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Fast Performance**: Built with Next.js for optimal speed
- 💾 **Persistent Storage**: Scores stored in Vercel KV

## How to Play

1. **Start the Game**: Click on the game screen or press SPACE to start
2. **Control the Bird**: Press SPACE or CLICK to make the bird flap
3. **Avoid Obstacles**: Navigate through the pipes without hitting them
4. **Score Points**: Each pipe you pass gives you 1 point
5. **Submit Your Score**: After game over, enter your name to submit to the leaderboard

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Vercel KV (Redis)
- **Deployment**: Vercel
- **Game Engine**: HTML5 Canvas

## Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Vercel account (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd flappy-bird-leaderboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:
   ```
   KV_URL=your_vercel_kv_rest_url
   KV_REST_API_URL=your_vercel_kv_rest_api_url
   KV_REST_API_TOKEN=your_vercel_kv_rest_api_token
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploy to Vercel

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Add Vercel KV database in your Vercel project
4. Deploy!

### Environment Variables for Production

When deploying to Vercel, the KV environment variables are automatically configured when you:

1. Go to your Vercel project dashboard
2. Navigate to Storage → KV
3. Create a new KV database
4. The environment variables will be automatically added to your project

## API Endpoints

### GET `/api/leaderboard`
Returns the current leaderboard sorted by score (descending).

**Response:**
```json
[
  {
    "name": "Player1",
    "score": 25,
    "timestamp": 1704067200000
  }
]
```

### POST `/api/leaderboard`
Submit a new score to the leaderboard.

**Body:**
```json
{
  "name": "PlayerName",
  "score": 15
}
```

**Response:**
```json
{
  "success": true
}
```

## Game Mechanics

- **Gravity**: Constant downward acceleration
- **Jump Strength**: Fixed upward velocity on flap
- **Pipe Generation**: Random gap positions with consistent spacing
- **Collision Detection**: Precise hitbox detection for pipes and boundaries
- **Score Tracking**: Increments when passing through pipe gaps

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original Flappy Bird game by .Gears
- Built with modern web technologies for optimal performance
- Special thanks to the Vercel team for excellent developer experience