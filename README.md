# Morning Meds

A minimal, offline-first pill tracker that lives on your iPhone home screen.

---

## Deploy (free, 2 minutes)

### Netlify
1. Go to [netlify.com](https://netlify.com) and log in (or create a free account).
2. From the dashboard, drag the **entire folder** (containing `index.html` and `manifest.json`) onto the drop zone on the Netlify dashboard.
3. Netlify gives you a live HTTPS URL instantly — copy it.

### Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New → Project**, then drag your folder into the import area, or use the Vercel CLI:
   ```
   npx vercel --yes
   ```
3. Vercel deploys and gives you an HTTPS URL.

> Both services are free for personal projects and require no credit card.

---

## Add to iPhone Home Screen

1. **Open Safari** and navigate to your deployed URL.
2. Tap the **Share** button (the square with an arrow pointing up, in the bottom toolbar).
3. Scroll down and tap **Add to Home Screen** → tap **Add**.

Morning Meds now appears as a full-screen app icon with no browser chrome.

---

## Features

- **Medication list** — add any number of medications with name and dose; delete with a tap.
- **Daily tracking** — mark each medication taken; all-done triggers a celebration banner.
- **Streak counter** — increments if every medication was taken the previous day; resets on a miss.
- **7-day history** — row of dots showing the last 6 days plus today (teal = done, grey = missed).
- **Midnight reset** — opening the app on a new day automatically closes out yesterday and resets today's state (no server required; handled client-side).
- **Daily reminder** — set a time; a browser notification fires at that time if not all meds are taken yet. Prompts for permission on first use.
- **Fully offline** — all state lives in `localStorage`; the app works with no internet after the first load.

---

## File structure

```
morning-meds/
├── index.html     ← the complete app (no build step)
├── manifest.json  ← PWA manifest (name, theme colour, icons)
└── README.md      ← this file
```

No dependencies, no frameworks, no build tools required.
