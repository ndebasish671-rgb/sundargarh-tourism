# 🏞️ Sundargarh Tourism Guide

A complete, open-source travel guide to **Sundargarh district, Odisha** — waterfalls, temples, dams, picnic spots and heritage sites — with **daily-synced Google News headlines and live weather**.

**Live features**

- 📍 **19 verified places** — Khandadhar Waterfall, Hanuman Vatika, Vedvyas Dham, Mandira Dam, Sarafgarh Nature Camp, Darjing, Ushakothi caves, Junagarh Fort & more — each with distances, timings, entry fees and how-to-reach
- 🔍 Search + category filters (waterfalls / temples / dams / picnic / heritage / parks)
- 📰 **Google News RSS sync** — Sundargarh/Rourkela headlines refreshed every day
- 🌤️ **Live weather** — current conditions + 4-day forecast for Sundargarh (Open-Meteo)
- 🗺️ Google Maps deep links for every place
- 📱 Mobile-first, fast, zero dependencies — pure HTML/CSS/JS on GitHub Pages (free)

## 🗂️ Project structure

```
sundargarh-tourism/
├── index.html              # Home: hero, featured places, live news + weather
├── places.html             # Full directory with search & filters
├── place.html?id=...       # Detail page (renders from data/places.js)
├── trip.html               # How to reach, itineraries, safety tips
├── about.html              # Sources, method, daily-sync explanation
├── css/style.css           # All styles (no CDN)
├── js/main.js              # Rendering, filters, widgets
├── data/
│   ├── places.js           # Place content (edit this to add places)
│   ├── news.js             # ← auto-updated daily by GitHub Actions
│   └── weather.js          # ← auto-updated daily by GitHub Actions
├── scripts/daily_sync.py   # Stdlib-only sync script (Google News + Open-Meteo)
└── .github/workflows/
    ├── daily-sync.yml      # Cron: runs sync every day at 06:00 IST, commits data
    └── deploy.yml          # Deploys to GitHub Pages on every push
```

## 🚀 Publish to GitHub (5 minutes)

### Step 1 — Create the repository

```bash
cd sundargarh-tourism
git init
git add .
git commit -m "Initial commit: Sundargarh Tourism Guide"
git branch -M main
```

Create a new **public** repository on GitHub (e.g. `sundargarh-tourism`) — do **not** initialize it with README — then:

```bash
git remote add origin https://github.com/<your-username>/sundargarh-tourism.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages (with auto-deploy)

1. Repo → **Settings → Pages**
2. Under *Build and deployment*, set **Source: GitHub Actions**
3. Push any change — the `deploy.yml` workflow builds and publishes your site

Your site will be live at:

```
https://<your-username>.github.io/sundargarh-tourism/
```

### Step 3 — Verify the daily sync

1. Repo → **Actions** tab → select **“Daily sync (Google News + Weather)”**
2. Click **Run workflow** to trigger it manually
3. After it finishes, `data/news.js` and `data/weather.js` will contain fresh
   headlines/forecast, and the site redeploys automatically

The scheduled cron runs **daily at 06:00 IST** (00:30 UTC).

> ⚠️ GitHub disables scheduled workflows after **60 days of repository inactivity**;
> re-enable in the Actions tab if your repo sits idle. (A `workflow_dispatch` manual
> run also keeps it alive.)

## ✏️ Edit or add a place

Open `data/places.js` and add an object to the `places` array:

```js
{
  "id": "my-place",
  "name": "My Place",
  "category": "Waterfall",            // Waterfall | Temple | Dam & Lake |
                                       // Picnic Spot | Heritage | Park & Zoo
  "image": "assets/img/hero-khandadhar.jpg",
  "tagline": "One-line description",
  "distance": "10 km from Sundargarh",
  "timings": "8:00 AM – 6:00 PM",
  "entry_fee": "Free",
  "best_time": "October – February",
  "highlights": ["Highlight 1", "Highlight 2"],
  "how_to_reach": "...",
  "about": "...",
  "source": "your source"
}
```

Then update `last_verified` at the top of the same file and push.

## 🔄 How the daily Google sync works

| What | Source | Where it lands |
|---|---|---|
| News headlines | **Google News RSS** `Sundargarh OR Rourkela Odisha when:7d` | `data/news.js` → home page news feed |
| Weather | **Open-Meteo API** (21.50°N, 84.03°E) | `data/weather.js` → home page weather card |

`scripts/daily_sync.py` (Python stdlib only) fetches both, writes the JS data files,
and the GitHub Actions workflow commits them back — Pages then redeploys.

> Why RSS? Scraping google.com search results violates Google's ToS and breaks often.
> **Google News RSS is Google's own public feed**, so the site stays legal & reliable
> while still delivering fresh Google-sourced news daily.

## 🧪 Run locally

```bash
cd sundargarh-tourism
python3 scripts/daily_sync.py     # fetch today's news + weather
python3 -m http.server 8000       # open http://localhost:8000
```

## ✅ Content sources

- District administration: sundargarh.odisha.gov.in, sundergarh.nic.in
- Odisha Tourism: dot.odisha.gov.in, odisha.gov.in
- Odisha Eco-Tourism: ecotourodisha.com
- Reputed travel references: odisha360.com, odishatour.in, Wikipedia, Tripadvisor

Found something wrong? Open an issue or PR — **Odia and English contributions welcome!**

## 📄 License

MIT — free to use, fork and adapt for your own district guides.
