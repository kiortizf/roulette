# Movie Roulette - Quick Start

## What's Been Built

A real-time movie selection app where multiple people can:
- 🎬 Search and select 2-5 movies
- 🗳️ Vote on each other's picks (thumbs up/down)
- 🎡 Spin a roulette wheel to randomly choose
- 📜 Track watch history across sessions
- 👥 See real-time updates as others join and vote
- 🔐 Anonymous authentication (no signup required)

---

## Tech Stack

**Frontend**:
- Next.js 15 (App Router)
- React 19
- TypeScript
- TailwindCSS (glassmorphism design)
- Framer Motion (animations)
- TanStack Query (API caching)

**Backend**:
- Firebase Realtime Database (real-time sync)
- Firebase Authentication (anonymous + Google)
- TMDB API (movie data)

**Hosting**:
- Cloudflare Pages (free tier)

---

## Features Implemented

### ✅ Core Features
- Real-time room synchronization
- Anonymous authentication (instant join, no signup)
- Movie search with trending suggestions
- User selection system (2-5 movies per person)
- Animated roulette wheel
- Winner announcement with confetti
- Room code sharing

### ✅ Advanced Features  
- **Voting System**: Upvote/downvote movies before spinning
- **Watch History**: Track every movie chosen with participants
- **Session Persistence**: Resume sessions after refresh
- **Auto-cleanup**: Remove inactive users after 5 minutes
- **Vote Tallies**: See total votes on each movie
- **Mobile Responsive**: Works on all devices

### ✅ UI/UX Polish
- Glassmorphism design (modern frosted glass effect)
- Smooth animations (Framer Motion)
- Loading states and skeletons
- Error boundaries
- Movie detail modals with trailers/cast
- Copy room code button
- Ready status indicators

---

## Local Development

### 1. Install Dependencies
```bash
cd /Users/unimatrix/roulette
npm install
```

### 2. Set Up Firebase (Required)

Create a Firebase project and update `.env.local`:

```env
NEXT_PUBLIC_TMDB_API_KEY=e0691aa4d7080b09e32ada8d66d13678

# Get these from Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

See [README.firebase.md](./README.firebase.md) for detailed Firebase setup.

### 3. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

### 4. Test Multi-User
Open multiple browser tabs or incognito windows to simulate multiple users in the same room.

---

## File Structure

```
roulette/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Homepage (create/join room)
│   ├── providers.tsx       # Query & Auth providers
│   ├── globals.css         # Global styles + animations
│   └── room/[code]/
│       └── page.tsx        # Main room page with Firebase
│
├── components/
│   ├── MovieSearch.tsx           # TMDB search + trending
│   ├── SelectedMovies.tsx        # User's movie list
│   ├── RouletteWheel.tsx         # Animated wheel
│   ├── UserList.tsx              # Participants sidebar
│   ├── MovieDetailsModal.tsx     # Movie info popup
│   ├── VotingMovieCard.tsx       # Voting UI
│   └── HistoryPanel.tsx          # Watch history
│
├── lib/
│   ├── firebase.ts          # Firebase initialization
│   ├── firebaseService.ts   # Database operations
│   ├── AuthContext.tsx      # Auth provider
│   ├── tmdb.ts              # TMDB API functions
│   ├── types.ts             # TypeScript types
│   └── store.ts             # (Legacy Zustand, not used)
│
├── .env.local               # Environment variables
├── next.config.ts           # Next.js config
├── tailwind.config.ts       # TailwindCSS config
├── wrangler.toml            # Cloudflare Pages config
│
└── Documentation/
    ├── README.firebase.md   # Firebase setup guide
    ├── COST_ANALYSIS.md     # Pricing breakdown
    ├── DEPLOYMENT.md        # Deploy instructions
    └── QUICK_START.md       # This file
```

---

## How It Works

### 1. Room Creation
- User creates a room (generates random 6-char code)
- Firebase creates room document
- User joins anonymously with Firebase Auth

### 2. Real-time Sync
- All users subscribe to room updates via Firebase Realtime Database
- Changes instantly sync across all connected clients:
  - New users joining
  - Movie selections
  - Ready status
  - Votes
  - Spinning state
  - Winner

### 3. Voting Phase
- After users select movies, they can vote
- Thumbs up (+1) or thumbs down (-1)
- Can't vote on own movies
- Vote totals displayed on each card

### 4. Roulette Spin
- All users must be "Ready" (2-5 movies selected)
- Wheel spins with all movies
- Winner saved to Firebase
- Added to each user's history

### 5. History Tracking
- Every winner saved with:
  - Movie details
  - Timestamp
  - Participant names
- Accessible via history button

---

## Key Firebase Functions

Located in `lib/firebaseService.ts`:

```typescript
// Room Management
createRoom(roomCode, user)      // Create new room
joinRoom(roomCode, user)        // Join existing room  
leaveRoom(roomCode, userId)     // Leave room
subscribeToRoom(roomCode, cb)   // Listen for changes

// Movie Selection
updateUserMovies(roomCode, userId, movies)
toggleUserReady(roomCode, userId, isReady)

// Voting
voteOnMovie(roomCode, userId, movieId, vote)

// Roulette
setRoomSpinning(roomCode, isSpinning)
setRoomWinner(roomCode, movie)
resetRoom(roomCode)

// History
getUserHistory(userId)
getRoomHistory(roomCode)

// Cleanup
cleanupInactiveUsers(roomCode)
```

---

## Environment Variables

All environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_TMDB_API_KEY` | TMDB API key | `e0691aa4...` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web API key | `AIzaSyD...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Realtime DB URL | `https://project-rtdb.firebaseio.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `my-project-123` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket | `project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | `1:123:web:abc` |

---

## Testing Checklist

### Local Testing
- [ ] Homepage loads
- [ ] Can create room
- [ ] Can join room with name
- [ ] Movie search works
- [ ] Can select 2-5 movies
- [ ] Can remove movies
- [ ] Ready button enables after 2 movies
- [ ] Multiple tabs sync in real-time
- [ ] Voting shows correct totals
- [ ] Can't vote on own movies
- [ ] Wheel spins when all ready
- [ ] Winner displays correctly
- [ ] History panel shows past sessions
- [ ] Leave room works
- [ ] Inactive users cleanup after 5 min

### Production Testing (After Deploy)
- [ ] Same as above on live URL
- [ ] Test on mobile device
- [ ] Test with 3+ real users
- [ ] Check Firebase usage in console
- [ ] Verify Cloudflare analytics

---

## Common Issues & Solutions

### Issue: "Firebase not initialized"
**Solution**: Make sure all Firebase env vars are set in `.env.local`

### Issue: "Real-time updates not working"
**Solution**: 
1. Check Firebase Database URL
2. Verify security rules allow read/write
3. Open browser console for errors

### Issue: "Can't vote on movies"
**Solution**: Make sure you're not trying to vote on your own movies

### Issue: "Movies not loading"
**Solution**: Verify TMDB API key is correct

### Issue: "Build fails on Cloudflare"
**Solution**: 
1. Check all env vars are set in Cloudflare dashboard
2. Verify `next.config.ts` has `unoptimized: true` for images

---

## Performance Notes

### Optimizations Included
- ✅ TanStack Query caches TMDB API responses (5-10 min)
- ✅ Next.js Image component with lazy loading
- ✅ Framer Motion uses hardware acceleration
- ✅ Firebase indexes for fast queries
- ✅ Debounced search input
- ✅ Code splitting with Next.js App Router
- ✅ Auto-cleanup of inactive users

### Expected Performance
- **Page Load**: <2s on 3G
- **Real-time Sync**: <100ms
- **Image Loading**: Progressive with blur placeholders
- **Roulette Spin**: 60fps animation

---

## Cost Summary (100 users/month)

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| Firebase Auth | Unlimited | 100 users | **$0** |
| Firebase Realtime DB | 1GB, 10GB downloads | ~10MB, 5GB | **$0** |
| Cloudflare Pages | Unlimited | Static hosting | **$0** |
| TMDB API | 1M requests | ~5k requests | **$0** |
| **TOTAL** | - | - | **$0/month** |

See [COST_ANALYSIS.md](./COST_ANALYSIS.md) for detailed breakdown.

---

## Next Steps

### Before Deploying
1. ✅ Complete Firebase setup (see README.firebase.md)
2. ✅ Test locally with multiple tabs
3. ✅ Verify all features work
4. ✅ Update environment variables

### Deploy
1. Push to GitHub
2. Connect Cloudflare Pages
3. Add environment variables in Cloudflare
4. Deploy
5. Add domain to Firebase authorized domains

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deploy guide.

### Optional Enhancements
- [ ] Add profile pictures (Firebase Storage)
- [ ] Implement room expiration (24h TTL)
- [ ] Add chat feature
- [ ] Export history to PDF
- [ ] PWA support (offline mode)
- [ ] Social sharing of winners
- [ ] Streaming availability integration

---

## Support

Created with:
- ❤️ Next.js 15
- 🔥 Firebase
- ☁️ Cloudflare Pages
- 🎬 TMDB API

**Ready to deploy at $0/month for 100 users!** 🚀
