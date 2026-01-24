# 🎬 Movie Roulette

**A real-time movie selection app where groups can vote and spin a roulette wheel to pick tonight's movie!**

![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange?logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🎡 **Animated Roulette Wheel** - Smooth 60fps spin animation
- 👥 **Real-time Multi-User** - See updates instantly across all devices
- 🗳️ **Voting System** - Upvote/downvote movies before spinning
- 📜 **Watch History** - Track every movie chosen with timestamps
- 🔐 **Anonymous Auth** - No signup required, join instantly
- 🎬 **1M+ Movies** - Search via TMDB API
- 📱 **Fully Responsive** - Works on mobile, tablet, and desktop
- ✨ **Modern UI** - Glassmorphism design with smooth animations
- 💰 **$0/month** - Free hosting for 100+ users

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local`:

```env
# TMDB API (already configured)
NEXT_PUBLIC_TMDB_API_KEY=e0691aa4d7080b09e32ada8d66d13678

# Firebase (get these from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Set Up Firebase

See **[Firebase Setup Guide](./README.firebase.md)** for detailed instructions (15 minutes).

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and test with multiple browser tabs!

## 📚 Documentation

- 📘 **[Quick Start Guide](./QUICK_START.md)** - Features, file structure, testing
- 🔥 **[Firebase Setup](./README.firebase.md)** - Complete Firebase configuration
- 💰 **[Cost Analysis](./COST_ANALYSIS.md)** - Pricing breakdown ($0 for 100 users)
- 🚀 **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to Cloudflare Pages
- 📊 **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Complete feature list

## 🎯 How It Works

1. **Create a Room** - Get a unique 6-character room code
2. **Invite Friends** - Share the code, join instantly with just a name
3. **Select Movies** - Each person picks 2-5 movies they want to watch
4. **Vote** - Upvote movies you like, downvote ones you don't
5. **Spin the Wheel** - When everyone's ready, spin to pick randomly
6. **Watch Together** - Winner announced with movie details and watch providers

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type-safe code
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### Backend
- **Firebase Realtime Database** - Real-time sync
- **Firebase Authentication** - Anonymous auth
- **TMDB API** - Movie data

### Hosting
- **Cloudflare Pages** - Free unlimited hosting
- **Global CDN** - Fast worldwide delivery
- **Automatic SSL** - Secure by default

## 📸 Screenshots

### Homepage
Create or join a room in seconds.

### Room Page
Search movies, see participants, vote on selections.

### Roulette Spin
Animated wheel with all selected movies.

### Winner Announcement
Confetti celebration with movie details.

### Watch History
Track every movie chosen across all sessions.

## 💰 Pricing

| Users/Month | Cost |
|-------------|------|
| 0 - 500 | **$0** |
| 1,000 | ~$5 |
| 10,000 | ~$70 |

**Free tier includes**:
- Firebase Auth (unlimited)
- Realtime Database (1GB storage, 10GB downloads, 100 connections)
- Cloudflare Pages (unlimited bandwidth & requests)
- TMDB API (1M requests)

See **[Cost Analysis](./COST_ANALYSIS.md)** for detailed breakdown.

## 🚀 Deploy to Cloudflare Pages

### Option 1: GitHub (Recommended)

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/movie-roulette.git
git push -u origin main
```

2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. **Pages** → **Create a project** → **Connect to Git**
4. Select your repository
5. Configure:
   - Build command: `npm run build`
   - Build output: `.next`
   - Framework: `Next.js`
6. Add environment variables (all `NEXT_PUBLIC_*` from `.env.local`)
7. Click **Save and Deploy**

### Option 2: Wrangler CLI

```bash
npm install -g wrangler
wrangler login
npm run build
npx wrangler pages deploy .next --project-name=movie-roulette
```

See **[Deployment Guide](./DEPLOYMENT.md)** for full instructions.

## 🔧 Development

### Project Structure

```
roulette/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Homepage
│   ├── layout.tsx           # Root layout
│   ├── providers.tsx        # React providers
│   └── room/[code]/         # Room page
│       └── page.tsx
├── components/              # React components
│   ├── MovieSearch.tsx
│   ├── RouletteWheel.tsx
│   ├── VotingMovieCard.tsx
│   ├── HistoryPanel.tsx
│   └── ...
├── lib/                     # Utilities & services
│   ├── firebase.ts          # Firebase init
│   ├── firebaseService.ts   # Database operations
│   ├── AuthContext.tsx      # Auth provider
│   └── tmdb.ts              # TMDB API
└── ...
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Check code quality
```

## 🧪 Testing

### Local Testing (Multi-User)

1. Open http://localhost:3000 in normal browser
2. Open http://localhost:3000 in incognito mode
3. Create room in first window
4. Join with room code in second window
5. Test real-time sync:
   - Add movies in both windows
   - Mark ready in both
   - Vote on movies
   - Spin the wheel
   - Check history

### Production Testing

Same as above but use your deployed URL.

## 🔒 Security

- ✅ Firebase Authentication (secure user IDs)
- ✅ Environment variables for API keys
- ✅ HTTPS only (automatic with Cloudflare)
- ✅ Firebase Security Rules (configure in production)
- ✅ No personal data collection
- ✅ Anonymous auth by default

## 🐛 Troubleshooting

### Firebase Not Working
1. Check all `NEXT_PUBLIC_FIREBASE_*` variables are set
2. Verify Firebase Realtime Database is created
3. Check security rules allow read/write
4. Look for errors in browser console

### Real-time Sync Not Working
1. Open in incognito to test with different user
2. Check Firebase Database URL is correct
3. Verify both users are in same room code

### Movies Not Loading
1. Verify TMDB API key is correct
2. Check network tab for API errors
3. Ensure `image.tmdb.org` is in `next.config.ts` remotePatterns

### Build Fails on Cloudflare
1. Add all environment variables in Cloudflare dashboard
2. Check build logs for specific errors
3. Verify `next.config.ts` is configured correctly

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **TMDB** for the amazing movie database API
- **Firebase** for real-time infrastructure
- **Cloudflare** for free global hosting
- **Next.js** team for the incredible framework
- **Vercel** for Next.js and deployment tools

## 📧 Support

- 📖 Read the [documentation](./QUICK_START.md)
- 🐛 [Open an issue](https://github.com/YOUR_USERNAME/movie-roulette/issues)
- 💬 [Start a discussion](https://github.com/YOUR_USERNAME/movie-roulette/discussions)

## 🌟 Features Roadmap

### Coming Soon
- [ ] Room passwords
- [ ] Admin controls (kick users)
- [ ] Chat feature
- [ ] Profile pictures
- [ ] PWA support (offline mode)
- [ ] Social sharing
- [ ] Streaming availability display
- [ ] Export history to PDF

### Future Ideas
- [ ] Tournaments (bracket-style)
- [ ] Movie ratings/reviews
- [ ] Watchlist management
- [ ] Genre filters
- [ ] Custom wheel colors
- [ ] Sound effects
- [ ] Multiple language support

## 🎉 Get Started

1. Clone the repo
2. Follow the [Quick Start](#-quick-start) guide
3. Deploy in 30 minutes
4. Start watching movies with friends!

**Happy movie watching! 🍿**

---

Made with ❤️ using Next.js, Firebase, and Cloudflare Pages

**Star ⭐ this repo if you find it useful!**
