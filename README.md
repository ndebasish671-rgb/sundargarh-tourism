# 🏞️ Sundargarh Tourism Guide

A complete, open-source travel guide to **Sundargarh district, Odisha** — waterfalls, temples, dams, picnic spots and heritage sites — with **daily-synced Google News headlines and live weather**.

**Live features**

- 📍 **19 verified places** — Khandadhar Waterfall, Hanuman Vatika, Vedvyas Dham, Mandira Dam, Sarafgarh Nature Camp, Darjing, Ushakothi caves, Junagarh Fort & more — each with distances, timings, entry fees and how-to-reach
- 🔍 Search + category filters (waterfalls / temples / dams / picnic / heritage / parks)
- 📰 **Google News RSS sync** — Sundargarh/Rourkela headlines refreshed every day at 06:00 IST
- 🌤️ **Live weather** — current conditions + 4-day forecast for Sundargarh (Open-Meteo)
- 🗺️ Google Maps deep links for every place
- 📱 Mobile-first, fast, zero dependencies — pure HTML/CSS/JS on GitHub Pages (free)

> 📦 **Flat layout:** every file sits at the repository root (no subfolders), so a
> simple drag-and-drop upload on GitHub.com works perfectly.

## 🗂️ Project structure

```
├── index.html              # Home: hero, featured places, live news + weather
├── places.html             # Full directory with search & filters
├── place.html?id=...       # Detail page (renders from places.js)
├── trip.html               # How to reach, itineraries, safety tips
├── about.html              # Sources, method, daily-sync explanation
├── style.css               # All styles (no CDN)
├── main.js                 # Rendering, filters, widgets
├── places.js               # Place content (edit this to add places)
├── news.js                 # ← auto-updated daily by GitHub Actions
├── weather.js              # ← auto-updated daily by GitHub Actions
├── daily_sync.py           # Stdlib-only sync script (Google News + Open-Meteo)
├── *.jpg                   # Site images
├── README.md · LICENSE · .gitignore
└── .github/workflows/daily-sync.yml   # Cron: daily sync at 06:00 IST
```

## 🚀 Publish to GitHub — browser upload (no terminal!)

### Step 1 — Create the repository
On GitHub: **+ → New repository** → name `sundargarh-tourism` → **Public** →
keep README / .gitignore / license **all OFF** → **Create repository**.

### Step 2 — Upload the files
1. Extract this zip on your computer
2. Open **inside** the folder (you should see `index.html` directly)
3. On GitHub: **Code → Add file → Upload files**
4. Select all files (**Ctrl+A**) and **drag them** into the upload area
5. Click **Commit changes**

⚠️ Drag the **contents** of the folder — not the folder itself — so files land at the
repository root. (Because this project is flat, nothing can get lost in subfolders.)

### Step 3 — Create the daily-sync workflow
GitHub: **Add file → Create new file** → type this path in the name box:

```
.github/workflows/daily-sync.yml
```

Paste the workflow from `.github/workflows/daily-sync.yml` in this zip (or see
“Daily sync” below), then **Commit changes**.

### Step 4 — Enable GitHub Pages
**Settings → Pages** → Source: **Deploy from a branch** → branch **main** / **/(root)**
→ **Save**. In ~1 minute the site is live:

```
https://<your-username>.github.io/sundargarh-tourism/
```

### Step 5 — Verify the daily sync
**Actions** tab → *Daily sync (Google News + Weather)* → **Run workflow**.
It runs automatically every day at **06:00 IST**, commits fresh `news.js` +
`weather.js`, and Pages redeploys itself.

> 💡 Alternative to browser upload: `git push` (see below) or GitHub Desktop —
> both preserve folder structure if you later reorganize the project.

## ✏️ Edit or add a place

Open `places.js` and add an object to the `places` array:

```js
{
  "id": "my-place",
  "name": "My Place",
  "category": "Waterfall",            // Waterfall | Temple | Dam & Lake |
                                       // Picnic Spot | Heritage | Park & Zoo
  "image": "hero-khandadhar.jpg",     // any image at repo root
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

Then update `last_verified` at the top of the same file and commit.

## 🔄 How the daily Google sync works

| What | Source | Where it lands |
|---|---|---|
| News headlines | **Google News RSS** `Sundargarh OR Rourkela Odisha when:7d` | `news.js` → home page news feed |
| Weather | **Open-Meteo API** (21.50°N, 84.03°E) | `weather.js` → home page weather card |

`daily_sync.py` (Python stdlib only) fetches both, writes the two data files, and the
GitHub Actions workflow commits them back — Pages then redeploys.

> Why RSS? Scraping google.com search results violates Google's ToS and breaks often.
> **Google News RSS is Google's own public feed**, so the site stays legal & reliable
> while still delivering fresh Google-sourced news daily.

## 🌐 Push with git instead (optional)

```bash
git init
git add .
git commit -m "Sundargarh Tourism Guide"
git branch -M main
git remote add origin https://github.com/<your-username>/sundargarh-tourism.git
git push -u origin main
```

## 🧪 Run locally

```bash
python3 daily_sync.py           # fetch today's news + weather
python3 -m http.server 8000     # open http://localhost:8000
```

## ✅ Content sources

- District administration: sundargarh.odisha.gov.in, sundergarh.nic.in
- Odisha Tourism: dot.odisha.gov.in, odisha.gov.in
- Odisha Eco-Tourism: ecotourodisha.com
- Reputed travel references: odisha360.com, odishatour.in, Wikipedia, Tripadvisor

Found something wrong? Open an issue or PR — **Odia and English contributions welcome!**

## 📄 License

MIT — free to use, fork and adapt for your own district guides.
