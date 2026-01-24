# 🍿 Popcorn Panic

**Can't pick a movie? SPIN IT!** The ultimate movie night decision maker for couples and friends.

![Vite](https://img.shields.io/badge/Vite-7.x-purple?logo=vite)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange?logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-orange?logo=cloudflare)

## ✨ Features

- 🎡 **Animated Roulette Wheel** - Smooth spin animation to pick your movie
- 👥 **Real-time Rooms** - Create or join rooms with friends
- 🗳️ **Voting System** - Upvote/downvote movies before spinning
- 📜 **Watch History** - Track every movie chosen
- 🔐 **Anonymous Auth** - No signup required
- 🎬 **1M+ Movies** - Search via TMDB API
- 📱 **Fully Responsive** - Works on all devices

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file:

```env
# TMDB API
VITE_TMDB_API_KEY=your_tmdb_api_key

# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build for Production

```bash
npm run build
```

### 5. Deploy to Cloudflare Pages

```bash
npx wrangler pages deploy dist --project-name=popcorn-panic
```

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Firebase Realtime Database
- **Auth**: Firebase Anonymous Auth
- **Movie Data**: TMDB API
- **Hosting**: Cloudflare Pages

## 📝 License

MIT
