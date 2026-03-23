# 🌍 WorldConflict.online

> Real-time global conflict tracker — auto-updated every 4 hours using AI

---

## 🚀 SETUP GUIDE (Step by Step)

### STEP 1 — Firebase Setup (Free)

1. Go to **firebase.google.com** → Create new project
2. Name it: `worldconflict-online`
3. Go to **Firestore Database** → Create database → Start in production mode
4. Go to **Project Settings** → General → Your apps → Add web app
5. Copy the config values — you'll need them in Step 4

**Create Service Account (for scripts):**
1. Project Settings → Service Accounts
2. Click "Generate new private key" → Download JSON file
3. You'll need: `project_id`, `client_email`, `private_key` from this file

**Firestore Security Rules:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /conflicts/{id} {
      allow read: if true;
      allow write: if false;
    }
    match /posts/{id} {
      allow read: if true;
      allow write: if false;
    }
    match /raw_data/{id} {
      allow read, write: if false;
    }
    match /system/{id} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

### STEP 2 — Telegram Bot Setup (Free)

1. Open Telegram → Search **@BotFather**
2. Send `/newbot` → Give it a name → Get the **BOT TOKEN**
3. Create a Telegram channel (e.g. @worldconflictonline)
4. Add your bot as **Administrator** to the channel
5. Note the channel username (e.g. @worldconflictonline)

---

### STEP 3 — Gemini API Key (Free)

1. Go to **aistudio.google.com**
2. Click "Get API Key" → Create API key
3. Copy the key

---

### STEP 4 — NewsAPI Key (Free — Optional)

1. Go to **newsapi.org** → Register free account
2. Get your API key (100 requests/day free)

---

### STEP 5 — Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values.

---

### STEP 6 — Deploy to Vercel (Free)

1. Push this code to **GitHub** (create new repo)
2. Go to **vercel.com** → Import your GitHub repo
3. Add all environment variables in Vercel dashboard
4. Deploy!

**Add custom domain:**
- Vercel Dashboard → Domains → Add `worldconflict.online`
- Update DNS at your domain registrar

---

### STEP 7 — GitHub Actions Secrets

Go to your GitHub repo → Settings → Secrets → Actions → Add:

| Secret Name | Value |
|---|---|
| `FIREBASE_ADMIN_PROJECT_ID` | Your Firebase project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Service account private key |
| `GEMINI_API_KEY` | Your Gemini API key |
| `TELEGRAM_BOT_TOKEN` | Your bot token |
| `TELEGRAM_CHANNEL_ID` | @yourchannel |
| `NEWS_API_KEY` | NewsAPI key (optional) |

---

### STEP 8 — First Run

```bash
npm install
node scripts/run-pipeline.js
```

This will:
1. Collect data from Telegram + RSS feeds
2. Generate AI blog posts for all conflicts
3. Save to Firebase
4. Send Telegram notifications

---

## 📁 PROJECT STRUCTURE

```
worldconflict/
├── pages/
│   ├── index.js              ← Homepage
│   ├── conflicts/
│   │   ├── index.js          ← All conflicts
│   │   └── [id].js           ← Single conflict
│   ├── conflict/
│   │   └── [conflictId]/
│   │       └── [slug].js     ← Blog post
│   ├── latest.js             ← Latest updates
│   ├── about.js              ← About page
│   ├── 404.js                ← Not found
│   └── api/
│       ├── sitemap.js        ← SEO sitemap
│       └── robots.js         ← robots.txt
├── components/
│   ├── layout/
│   │   ├── Navbar.js         ← Navigation
│   │   └── Footer.js         ← Footer
│   └── ui/
│       ├── ConflictCard.js   ← Conflict summary card
│       └── PostCard.js       ← Blog post card
├── lib/
│   ├── firebase.js           ← Firebase client
│   ├── firebase-admin.js     ← Firebase server
│   └── conflicts-data.js     ← Conflict definitions
├── scripts/
│   ├── collector.js          ← Data collection
│   ├── writer.js             ← AI blog writer
│   ├── notifier.js           ← Telegram alerts
│   └── run-pipeline.js       ← Main runner
├── styles/
│   └── globals.css           ← Global styles
└── .github/
    └── workflows/
        └── auto-update.yml   ← GitHub Actions cron
```

---

## ⏰ AUTOMATION SCHEDULE

The pipeline runs automatically via GitHub Actions:
- **12:00 AM UTC** (5:30 AM IST)
- **4:00 AM UTC** (9:30 AM IST)
- **8:00 AM UTC** (1:30 PM IST)
- **12:00 PM UTC** (5:30 PM IST)
- **4:00 PM UTC** (9:30 PM IST)
- **8:00 PM UTC** (1:30 AM IST)

**= Every 4 hours, fully automatic**

---

## 💰 COST

| Service | Plan | Cost |
|---|---|---|
| Vercel | Free | $0/mo |
| Firebase | Spark (Free) | $0/mo |
| GitHub Actions | Free (2000 min/mo) | $0/mo |
| Gemini API | Free tier | $0/mo |
| Telegram | Always free | $0/mo |
| Domain | worldconflict.online | ~$3/yr |
| **TOTAL** | | **~$3/year** |

---

## 🔧 ADD MORE CONFLICTS

Edit `lib/conflicts-data.js` — add a new object to the array:

```js
{
  id: 'new-conflict-id',
  name: 'Country A — Country B',
  region: 'Region Name',
  countries: ['Country A', 'Country B'],
  intensity: 7,
  status: 'active',
  color: '#DC2626',
  started: '2024-01-01',
  summary: 'Brief description of the conflict.',
  telegramChannels: ['channel1', 'channel2'],
  keywords: ['keyword1', 'keyword2'],
  rssKeywords: ['search term 1', 'search term 2'],
  lat: 30.0,
  lng: 50.0,
}
```

---

## 📞 SUPPORT

If anything doesn't work, check:
1. Firebase rules are correctly set
2. All environment variables are filled
3. Bot is admin in Telegram channel
4. GitHub secrets are added correctly

---

*Built with Next.js · Firebase · Gemini AI · Telegram API*
