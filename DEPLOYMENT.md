# Movie Roulette - Deployment Guide

## Quick Deploy to Cloudflare Pages

### Prerequisites
- GitHub account
- Cloudflare account (free)
- Firebase project (see [README.firebase.md](./README.firebase.md))

---

## Option 1: GitHub + Cloudflare Dashboard (Recommended)

### Step 1: Push to GitHub
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Movie Roulette with Firebase"

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/movie-roulette.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** > **Create a project**
3. Click **Connect to Git**
4. Select your **GitHub repository**
5. Configure build settings:

```
Build command: npm run build
Build output directory: .next
Root directory: /
Environment variables: (see below)
```

### Step 3: Add Environment Variables

In Cloudflare Pages settings, add these variables:

```env
NEXT_PUBLIC_TMDB_API_KEY=e0691aa4d7080b09e32ada8d66d13678
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 4: Deploy

Click **Save and Deploy**. Your site will be live at:
```
https://movie-roulette-xxx.pages.dev
```

---

## Option 2: Wrangler CLI (Direct Upload)

### Step 1: Install Wrangler
```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### Step 2: Build for Production
```bash
# Make sure environment variables are set in .env.local
npm run build
```

### Step 3: Deploy
```bash
# Deploy to Cloudflare Pages
npx wrangler pages deploy .next --project-name=movie-roulette

# Or use the simpler command (if wrangler.toml is configured)
npx wrangler pages deploy
```

---

## Option 3: Direct Upload (No Git)

1. Build locally:
```bash
npm run build
```

2. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
3. Click **Create a project** > **Upload assets**
4. Upload the `.next` folder
5. Add environment variables in settings
6. Deploy

---

## Post-Deployment Setup

### 1. Update Firebase Authorized Domains

In [Firebase Console](https://console.firebase.google.com/):
1. Go to **Authentication** > **Settings** > **Authorized domains**
2. Add your Cloudflare Pages domain:
   ```
   movie-roulette-xxx.pages.dev
   ```

### 2. Test Your Deployment

Visit your deployed URL and test:
- ✅ Homepage loads
- ✅ Can create a room
- ✅ Real-time sync works (open in multiple tabs)
- ✅ Authentication works
- ✅ Movie search works
- ✅ Voting system works
- ✅ Roulette spins correctly
- ✅ History is saved

### 3. Custom Domain (Optional)

In Cloudflare Pages:
1. Go to **Custom domains**
2. Add your domain (e.g., `movieroulette.com`)
3. Cloudflare will automatically configure DNS
4. Add domain to Firebase authorized domains

---

## Continuous Deployment

### Automatic Deploys (GitHub)

Every push to `main` branch automatically deploys:
```bash
git add .
git commit -m "Update feature"
git push origin main
# Cloudflare automatically builds and deploys
```

### Preview Deployments

Every pull request gets a preview URL:
```
https://abc123.movie-roulette.pages.dev
```

### Rollback

In Cloudflare Pages:
1. Go to **Deployments**
2. Find previous successful deployment
3. Click **Rollback to this deployment**

---

## Environment-Specific Builds

### Development
```bash
npm run dev
# Runs on http://localhost:3000
```

### Production Preview
```bash
npm run build
npm start
# Runs production build locally on http://localhost:3000
```

### Staging Environment

Create a `staging` branch:
```bash
git checkout -b staging
git push origin staging
```

In Cloudflare Pages:
- Set up branch deployments
- `staging` branch → `https://staging.movie-roulette.pages.dev`
- `main` branch → `https://movie-roulette.pages.dev`

---

## Monitoring & Analytics

### Cloudflare Web Analytics (Free)

1. Enable in Cloudflare Pages settings
2. View real-time traffic, page views, and performance
3. No cookies required (privacy-friendly)

### Firebase Console

Monitor in [Firebase Console](https://console.firebase.google.com/):
- **Authentication**: Active users, sign-in methods
- **Realtime Database**: Data usage, concurrent connections
- **Performance**: Page load times (requires SDK)

---

## Troubleshooting

### Build Fails

**Error**: `Module not found`
```bash
# Solution: Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Error**: `Environment variable missing`
```bash
# Solution: Add to Cloudflare Pages environment variables
# Redeploy after adding
```

### Authentication Not Working

**Issue**: Google sign-in fails
```
Solution:
1. Add Cloudflare domain to Firebase authorized domains
2. Check Firebase API key in environment variables
3. Verify all NEXT_PUBLIC_FIREBASE_* variables are set
```

### Real-time Sync Not Working

**Issue**: Users don't see updates
```
Solution:
1. Check Firebase Database URL is correct
2. Verify database rules allow read/write
3. Check browser console for errors
4. Ensure users have different IDs (open in incognito)
```

### Images Not Loading

**Issue**: TMDB images return 404
```
Solution:
1. Verify NEXT_PUBLIC_TMDB_API_KEY is set
2. Check next.config.ts has correct remotePatterns
3. Ensure unoptimized: true for production
```

---

## Performance Optimization

### Already Implemented

✅ **Image Optimization**: Next.js Image component with lazy loading
✅ **Code Splitting**: Automatic with Next.js App Router
✅ **Caching**: TanStack Query caches API responses
✅ **Minification**: SWC minification enabled
✅ **CDN**: Cloudflare's global CDN (300+ locations)

### Recommended Additions

1. **Enable Service Worker** (PWA):
```bash
npm install next-pwa
```

2. **Add Compression**:
```javascript
// next.config.ts
compress: true,
```

3. **Optimize Fonts**:
```javascript
// Already using next/font for optimal font loading
```

---

## Security Checklist

Before going live:

- [ ] Firebase security rules set (not in test mode)
- [ ] Environment variables not committed to git
- [ ] `.env.local` in `.gitignore`
- [ ] HTTPS enabled (automatic with Cloudflare)
- [ ] No sensitive data in client-side code
- [ ] Rate limiting enabled in Firebase
- [ ] Authorized domains configured in Firebase

---

## Cost Monitoring

Set up billing alerts:

### Firebase
1. Go to Firebase Console > Usage and billing
2. Set budget alert at $5
3. Monitor daily usage

### Cloudflare
Free tier is unlimited, but monitor:
- Build minutes (500/month free)
- Concurrent builds (1 free)

---

## Update Checklist

When deploying updates:

1. Test locally: `npm run dev`
2. Build test: `npm run build`
3. Commit changes: `git add . && git commit -m "Update"`
4. Push to GitHub: `git push origin main`
5. Verify deployment in Cloudflare dashboard
6. Test live site
7. Monitor Firebase usage
8. Check for errors in Cloudflare logs

---

## Support & Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **TMDB API**: https://developers.themoviedb.org

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start dev server | `npm run dev` |
| Build for production | `npm run build` |
| Test production build | `npm start` |
| Deploy with Wrangler | `npx wrangler pages deploy` |
| Check Firebase usage | Visit Firebase Console |
| View deployment logs | Cloudflare Pages > Deployments |

**Your app is now ready to serve 100+ users at $0/month! 🎉**
