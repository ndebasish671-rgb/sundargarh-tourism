/* ============================================================
   Sundargarh Tourism Guide — main.js
   Renders place cards, filters, detail pages, Google News feed
   and live weather from data/ (updated daily by GitHub Actions)
   ============================================================ */

const PLACES = (window.PLACE_DATA && window.PLACE_DATA.places) || [];
const LAST_VERIFIED = (window.PLACE_DATA && window.PLACE_DATA.last_verified) || "";
const NEWS = window.NEWS_DATA || { items: [], updated: "" };
const WEATHER = window.WEATHER_DATA || null;

/* ---------- helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function placeCard(p) {
  return `
  <article class="card" data-category="${esc(p.category)}" data-name="${esc(p.name.toLowerCase())}" data-text="${esc(((p.tagline || "") + " " + (p.category || "") + " " + (p.about || "")).toLowerCase())}">
    <div class="card-img">
      <span class="card-tag">${esc(p.category)}</span>
      <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
    </div>
    <div class="card-body">
      <h3><a href="place.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3>
      <p class="tagline">${esc(p.tagline)}</p>
      <div class="meta">
        <div><span class="ico">📍</span><span>${esc(p.distance)}</span></div>
        <div><span class="ico">🕘</span><span>${esc(p.timings)}</span></div>
      </div>
      <a class="card-link" href="place.html?id=${encodeURIComponent(p.id)}">View details →</a>
    </div>
  </article>`;
}

/* ---------- Home: featured places ---------- */
function renderFeatured() {
  const el = $("#featured-grid");
  if (!el) return;
  const featured = ["khandadhar", "hanuman-vatika", "vedvyas", "mandira-dam", "sarafgarh", "darjing"];
  const list = featured.map((id) => PLACES.find((p) => p.id === id)).filter(Boolean);
  el.innerHTML = (list.length ? list : PLACES.slice(0, 6)).map(placeCard).join("");
}

/* ---------- Places page: all + filters + search ---------- */
function renderAllPlaces() {
  const el = $("#all-grid");
  if (!el) return;
  el.innerHTML = PLACES.map(placeCard).join("");

  const countEl = $("#place-count");
  if (countEl) countEl.textContent = `${PLACES.length} places`;

  const applyFilters = () => {
    const cat = ($(".chip.active") && $(".chip.active").dataset.cat) || "all";
    const q = ($("#place-search") ? $("#place-search").value : "").trim().toLowerCase();
    let visible = 0;
    $$(".card", el).forEach((card) => {
      const okCat = cat === "all" || card.dataset.category === cat;
      const okQ = !q || card.dataset.name.includes(q) || card.dataset.text.includes(q);
      const show = okCat && okQ;
      card.style.display = show ? "" : "none";
      if (show) visible++;
    });
    const empty = $("#empty-state");
    if (empty) empty.style.display = visible ? "none" : "block";
    if (countEl) countEl.textContent = `${visible} place${visible === 1 ? "" : "s"}`;
  };

  $$(".chip").forEach((chip) => chip.addEventListener("click", () => {
    $$(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    applyFilters();
  }));
  const search = $("#place-search");
  if (search) search.addEventListener("input", applyFilters);
  applyFilters();
}

/* ---------- Detail page ---------- */
function renderDetail() {
  const root = $("#detail-root");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const p = PLACES.find((x) => x.id === id) || PLACES[0];
  if (!p) { root.innerHTML = "<p>Place not found.</p>"; return; }

  document.title = `${p.name} — Sundargarh Tourism Guide`;
  const related = PLACES.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 3);
  const others = PLACES.filter((x) => x.id !== p.id && x.category !== p.category).slice(0, 3);
  const suggestions = (related.length ? related : others);

  root.innerHTML = `
    <header class="detail-hero">
      <img src="${esc(p.image)}" alt="${esc(p.name)}">
      <div class="container">
        <div class="crumb"><a href="index.html">Home</a> · <a href="places.html">Places</a> · ${esc(p.category)}</div>
        <span class="card-tag" style="position:static;display:inline-block;margin-bottom:.6rem">${esc(p.category)}</span>
        <h1>${esc(p.name)}</h1>
        <p class="tagline">${esc(p.tagline)}</p>
      </div>
    </header>
    <div class="container detail-layout">
      <div class="prose">
        <h2>About ${esc(p.name)}</h2>
        <p>${esc(p.about)}</p>
        <h2>Highlights</h2>
        <ul class="checklist">${(p.highlights || []).map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
        <h2>How to reach</h2>
        <p>${esc(p.how_to_reach)}</p>
        <div class="notice">⚠️ <b>Travel tip:</b> Timings and fees can change — especially in monsoon
        (July–September), when trails to waterfalls can be slippery. Confirm locally before travelling long distances.</div>
        <p class="source-line">✅ Details last verified: <b>${esc(LAST_VERIFIED)}</b> · Source: ${esc(p.source || "District tourism & official sources")}
        · <a href="https://www.google.com/search?q=${encodeURIComponent(p.name + " Sundargarh Odisha")}" target="_blank" rel="noopener">Search Google for live updates ↗</a></p>
      </div>
      <aside>
        <div class="info-panel">
          <h3>Visitor Information</h3>
          <div class="info-row"><span class="ico">📍</span><div><b>Distance</b><span>${esc(p.distance)}</span></div></div>
          <div class="info-row"><span class="ico">🕘</span><div><b>Timings</b><span>${esc(p.timings)}</span></div></div>
          <div class="info-row"><span class="ico">🎟️</span><div><b>Entry fee</b><span>${esc(p.entry_fee)}</span></div></div>
          <div class="info-row"><span class="ico">🌤️</span><div><b>Best time</b><span>${esc(p.best_time)}</span></div></div>
          <div class="info-row"><span class="ico">🧭</span><div><b>Category</b><span>${esc(p.category)}</span></div></div>
        </div>
        <div style="margin-top:1rem;display:flex;gap:.6rem;flex-wrap:wrap">
          <a class="btn btn-green" target="_blank" rel="noopener"
             href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ", Sundargarh, Odisha")}">Open in Google Maps 🗺️</a>
          <a class="btn btn-outline" href="places.html">All places</a>
        </div>
      </aside>
    </div>
    <section class="band">
      <div class="container">
        <div class="section-head"><span class="eyebrow">Keep exploring</span><h2>You may also like</h2></div>
        <div class="grid">${suggestions.map(placeCard).join("")}</div>
      </div>
    </section>`;

  const hero = $(".detail-hero img");
  if (hero) hero.addEventListener("error", () => { hero.style.display = "none"; });
}

/* ---------- Google News widget (daily synced) ---------- */
function renderNews() {
  const el = $("#news-list");
  if (!el) return;
  const items = (NEWS.items || []).slice(0, 6);
  el.innerHTML = items.length
    ? items.map((n) => `
      <a class="news-item" href="${esc(n.link)}" target="_blank" rel="noopener">
        <div class="t">${esc(n.title)}</div>
        <div class="m"><span class="src">${esc(n.source || "Google News")}</span><span>·</span><span>${esc(n.date || "")}</span></div>
      </a>`).join("")
    : `<p style="color:var(--ink-soft);font-size:.9rem">News will appear after the first daily sync runs on GitHub.</p>`;
  const upd = $("#news-updated");
  if (upd && NEWS.updated) upd.textContent = `Synced ${NEWS.updated}`;
}

/* ---------- Weather widget (daily synced) ---------- */
const WMO = {
  0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"], 2: ["Partly cloudy", "⛅"], 3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"], 48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Dense drizzle", "🌦️"],
  61: ["Light rain", "🌧️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"],
  80: ["Rain showers", "🌦️"], 81: ["Showers", "🌧️"], 82: ["Violent showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm + hail", "⛈️"], 99: ["Severe thunderstorm", "⛈️"]
};
const wmo = (code) => WMO[code] || ["Mixed weather", "🌤️"];

function renderWeather() {
  const el = $("#weather-card");
  if (!el) return;
  if (!WEATHER || !WEATHER.current) {
    el.innerHTML = `<div class="card-body"><p style="font-size:.9rem">Weather data will load after the first daily sync.</p></div>`;
    return;
  }
  const c = WEATHER.current;
  const [cond, icon] = wmo(c.weather_code);
  const days = (WEATHER.daily || []).slice(0, 3).map((d) => {
    const [, dIcon] = wmo(d.weather_code);
    return `<div class="weather-day"><span class="d">${esc(d.label)}</span><div style="font-size:1.2rem">${dIcon}</div><b>${d.tmax}° / ${d.tmin}°</b></div>`;
  }).join("");
  el.innerHTML = `
    <div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap">
        <strong style="font-size:.95rem">Sundargarh, Odisha</strong>
        <span class="sync-badge"><span class="dot"></span> Daily sync</span>
      </div>
      <div class="weather-now">
        <span class="weather-icon">${icon}</span>
        <span class="temp">${c.temp}°C</span>
        <span class="cond">${cond}<br><small>Feels-driven local reading</small></span>
      </div>
      <div class="weather-meta">
        <span>💧 Humidity ${c.humidity}%</span><span>💨 Wind ${c.wind} km/h</span>
      </div>
      <div class="weather-days">${days}</div>
      <small style="opacity:.75">Updated: ${esc(WEATHER.updated || "")} · Source: Open-Meteo</small>
    </div>`;
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderFeatured();
  renderAllPlaces();
  renderDetail();
  renderNews();
  renderWeather();
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
  const lv = $("#last-verified");
  if (lv && LAST_VERIFIED) lv.textContent = LAST_VERIFIED;
});
