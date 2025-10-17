# Deployment Guide: Flappy Bird Leaderboard to Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket
3. **Vercel CLI** (optional): `npm i -g vercel`

## Step-by-Step Deployment

### Method 1: Vercel Dashboard (Recommended)

1. **Prepare Your Repository**
   - Push your code to a Git repository
   - Ensure all files are committed

2. **Import Project to Vercel**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your Git repository
   - Vercel will automatically detect Next.js

3. **Configure Environment Variables**
   - In your Vercel project dashboard, go to "Settings" → "Environment Variables"
   - Add the following variables (they will be auto-populated when you create KV):
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN` 
     - `KV_URL`

4. **Set Up Vercel KV**
   - In your Vercel dashboard, go to "Storage" → "KV"
   - Click "Create Database"
   - Name it (e.g., "flappy-bird-leaderboard")
   - Select your project to link it
   - The environment variables will be automatically configured

5. **Deploy**
   - Vercel will automatically deploy when you push to your main branch
   - Or manually trigger a deployment from the dashboard

### Method 2: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd flappy-bird-leaderboard
   vercel
   ```

3. **Follow the prompts**:
   - Link to your Vercel account
   - Select project settings
   - Vercel will handle the rest

4. **Set up KV**:
   ```bash
   vercel kv:create flappy-bird-leaderboard
   vercel env add KV_REST_API_URL
   vercel env add KV_REST_API_TOKEN
   vercel env add KV_URL
   ```

## Post-Deployment Checklist

✅ **Test the Game**:
- Visit your deployed URL
- Play the game and test controls
- Verify collision detection works

✅ **Test Leaderboard**:
- Submit a score with your name
- Check if it appears in the leaderboard
- Verify leaderboard updates in real-time

✅ **Verify KV Integration**:
- Scores should persist between page refreshes
- Multiple players should see the same leaderboard

## Troubleshooting

### Common Issues

1. **KV Connection Errors**:
   - Verify environment variables are set correctly
   - Check KV database is linked to your project
   - Ensure KV database is in the same region as your deployment

2. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs in Vercel dashboard

3. **Game Not Loading**:
   - Check browser console for errors
   - Verify Canvas API is supported
   - Test on different browsers

### Environment Variables Reference

- `KV_REST_API_URL`: REST API endpoint for your KV database
- `KV_REST_API_TOKEN`: Authentication token for KV API
- `KV_URL`: Direct connection URL for KV

These are automatically configured when you create a KV database through Vercel.

## Monitoring

- **Analytics**: Vercel Analytics shows performance metrics
- **Logs**: Check function logs in Vercel dashboard
- **KV Usage**: Monitor KV storage and operations

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS settings as instructed

Your Flappy Bird Leaderboard is now live! 🎉