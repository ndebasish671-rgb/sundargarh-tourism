#!/usr/bin/env python3
"""
Daily sync script for Sundargarh Tourism Guide.

Runs on GitHub Actions every day (see .github/workflows/daily-sync.yml):
  1. Fetches the latest Sundargarh/Rourkela headlines from Google News RSS
  2. Fetches current weather + 3-day forecast for Sundargarh from Open-Meteo
  3. Writes news.js and weather.js (site root) for the static site

Stdlib only — no third-party dependencies.
"""

import json
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT

GOOGLE_NEWS_RSS = (
    "https://news.google.com/rss/search?"
    "q=Sundargarh+OR+Rourkela+Odisha+when:7d&hl=en-IN&gl=IN&ceid=IN:en"
)
# Sundargarh town coordinates
WEATHER_URL = (
    "https://api.open-meteo.com/v1/forecast?"
    "latitude=21.50&longitude=84.03"
    "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
    "&daily=weather_code,temperature_2m_max,temperature_2m_min"
    "&timezone=Asia%2FKolkata&forecast_days=4"
)

IST = timezone(timedelta(hours=5, minutes=30))
UA = {"User-Agent": "SundargarhTourismGuide/1.0 (+github-actions daily sync)"}


def fetch(url: str, timeout: int = 30) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def sync_news() -> bool:
    """Pull latest headlines from Google News RSS -> news.js"""
    xml_bytes = fetch(GOOGLE_NEWS_RSS)
    root = ET.fromstring(xml_bytes)
    items = []
    for item in root.iter("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        pub = item.findtext("pubDate") or ""
        source_el = item.find("source")
        source = (source_el.text or "Google News") if source_el is not None else "Google News"
        if not title or not link:
            continue
        # Parse RFC-822 date -> "17 Oct 2026, 9:15 AM IST"
        date_str = ""
        try:
            dt = datetime.strptime(pub, "%a, %d %b %Y %H:%M:%S %Z")
            date_str = dt.replace(tzinfo=timezone.utc).astimezone(IST).strftime(
                "%d %b %Y, %I:%M %p"
            )
        except ValueError:
            date_str = pub
        items.append({"title": title, "link": link, "source": source, "date": date_str})
        if len(items) >= 8:
            break

    payload = {
        "updated": datetime.now(IST).strftime("%d %b %Y, %I:%M %p IST"),
        "source": "Google News RSS",
        "query": "Sundargarh OR Rourkela Odisha when:7d",
        "items": items,
    }
    write_js("NEWS_DATA", payload, DATA / "news.js",
             "Updated daily by GitHub Actions (.github/workflows/daily-sync.yml)")
    print(f"news: synced {len(items)} headlines")
    return True


def sync_weather() -> bool:
    """Pull current weather + 3-day forecast -> weather.js"""
    raw = json.loads(fetch(WEATHER_URL))
    cur = raw.get("current", {})
    daily = raw.get("daily", {})
    times = daily.get("time", [])
    labels = ["Today", "Tomorrow", "Day 3", "Day 4"]
    days = []
    for i, t in enumerate(times[:4]):
        try:
            d = datetime.strptime(t, "%Y-%m-%d")
            pretty = d.strftime("%a %d")
        except ValueError:
            pretty = t
        days.append({
            "label": labels[i] if i < len(labels) else pretty,
            "date": t,
            "day": pretty,
            "weather_code": daily.get("weather_code", [])[i],
            "tmax": round(daily.get("temperature_2m_max", [])[i]),
            "tmin": round(daily.get("temperature_2m_min", [])[i]),
        })

    payload = {
        "updated": datetime.now(IST).strftime("%d %b %Y, %I:%M %p IST"),
        "location": "Sundargarh, Odisha",
        "source": "Open-Meteo",
        "current": {
            "temp": round(cur.get("temperature_2m", 0)),
            "humidity": cur.get("relative_humidity_2m"),
            "weather_code": cur.get("weather_code"),
            "wind": round(cur.get("wind_speed_10m", 0)),
        },
        "daily": days,
    }
    write_js("WEATHER_DATA", payload, DATA / "weather.js",
             "Updated daily by GitHub Actions (.github/workflows/daily-sync.yml)")
    print(f"weather: synced ({payload['current']['temp']}°C, {len(days)} days)")
    return True


def write_js(var: str, obj: dict, path: Path, header: str) -> None:
    body = json.dumps(obj, ensure_ascii=False, indent=2)
    path.write_text(f"/* {header} */\nwindow.{var} = {body};\n", encoding="utf-8")


def main() -> int:
    ok = True
    for name, fn in (("news", sync_news), ("weather", sync_weather)):
        try:
            fn()
        except Exception as exc:  # keep the other sync alive if one source fails
            print(f"ERROR syncing {name}: {exc}", file=sys.stderr)
            ok = False
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
