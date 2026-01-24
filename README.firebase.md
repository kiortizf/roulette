# Firebase Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `movie-roulette` (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create Project"

## Step 2: Register Web App

1. In your Firebase project, click the web icon (`</>`)
2. App nickname: `Movie Roulette Web`
3. Check "Also set up Firebase Hosting"
4. Click "Register app"
5. **Copy the Firebase config object** - you'll need these values

## Step 3: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get Started"
3. Enable these sign-in methods:
   - **Anonymous** (required)
   - **Google** (optional but recommended)
4. For Google: Add your authorized domain when deploying

## Step 4: Set Up Realtime Database

1. In Firebase Console, go to **Build > Realtime Database**
2. Click "Create Database"
3. Choose location: `us-central1` (or closest to your users)
4. Start in **test mode** for now
5. Replace the default rules with these security rules:

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": true,
        ".write": true,
        "users": {
          "$userId": {
            ".write": "$userId === auth.uid"
          }
        }
      }
    },
    "history": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

## Step 5: Configure Environment Variables

Update your `.env.local` file with your Firebase config:

```env
# TMDB API
NEXT_PUBLIC_TMDB_API_KEY=e0691aa4d7080b09e32ada8d66d13678

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Step 6: Test Locally

```bash
npm run dev
```

Visit http://localhost:3000 and test:
- Creating a room
- Joining with multiple browser tabs
- Adding movies
- Real-time sync
- Voting system
- Spinning the wheel
- History tracking

## Step 7: Deploy to Cloudflare Pages

### Option A: Deploy via Cloudflare Dashboard

1. Build your project:
```bash
npm run build
```

2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Click "Pages" > "Create a project"
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Framework preset**: `Next.js`
6. Add environment variables (all `NEXT_PUBLIC_*` vars from `.env.local`)
7. Click "Save and Deploy"

### Option B: Deploy via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run build
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static --project-name movie-roulette
```

## Cloudflare Pages Configuration

Your project needs a `next.config.js` optimization for Cloudflare Pages. The current config should work, but ensure these settings:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['image.tmdb.org'],
    unoptimized: true, // Required for Cloudflare Pages
  },
  output: 'export', // For static export (if not using SSR)
};

module.exports = nextConfig;
```

**Note**: For full Next.js features with SSR, use `@cloudflare/next-on-pages` adapter.

## Post-Deployment

1. **Update Firebase Auth Domain**:
   - In Firebase Console > Authentication > Settings
   - Add your Cloudflare Pages domain: `movie-roulette.pages.dev`

2. **Test Production**:
   - Create rooms
   - Test with multiple devices
   - Verify real-time sync
   - Check voting and history

## Monitoring & Maintenance

### Firebase Console Monitoring
- **Authentication**: Monitor active users
- **Realtime Database**: Check data usage and concurrent connections
- **Usage & Billing**: Track free tier limits

### Database Maintenance
- Inactive users are automatically cleaned up after 5 minutes
- History is stored per user (consider adding cleanup for old sessions)
- Room data persists until manually deleted (consider TTL)

### Recommended Enhancements
1. Add database indexes for better performance
2. Implement room expiration (e.g., delete after 24 hours)
3. Add user profile pictures with Firebase Storage
4. Enable Firebase Performance Monitoring
5. Set up Firebase Cloud Functions for server-side operations

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. Use Firebase Security Rules in production (not test mode)
3. Enable App Check for additional security
4. Set up billing alerts in Firebase
5. Regularly audit database rules and access patterns

## Troubleshooting

### Real-time sync not working
- Check Firebase Database URL in env vars
- Verify security rules allow read/write
- Check browser console for errors

### Authentication fails
- Verify all Firebase config values are correct
- Check authorized domains in Firebase Console
- Ensure auth domain matches your deployment

### Deployment fails
- Check all env vars are set in Cloudflare
- Verify build output directory
- Review build logs for errors

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)
