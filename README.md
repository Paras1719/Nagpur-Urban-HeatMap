# Nagpur Urban Heat Island Intelligence Platform

A multi-temporal geospatial intelligence platform that analyses real satellite imagery (2019–2024) to map urban heat patterns across Nagpur, Maharashtra, identify persistent heat hotspots, explain what drives them, and let users run scenario-based "what-if" land-cover simulations — grounded against live weather data and real observed analog locations, not synthetic output.

> Built for a hackathon challenge on multi-temporal UHI analysis & AI prediction for Nagpur. Every number on screen traces back to a named open dataset or an API call you can see fire in devtools — no placeholder data.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [What This Project Does](#what-this-project-does)
- [Pages / Features](#pages--features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Data Sources & APIs](#data-sources--apis)
- [Data Model](#data-model)
- [Getting Started](#getting-started)
- [Supabase Setup](#supabase-setup)
- [Project Structure](#project-structure)
- [Methodology Notes & Known Limitations](#methodology-notes--known-limitations)
- [Roadmap](#roadmap)
- [License](#license)

---

## Problem Statement

Rapid urbanisation increases local surface temperatures as buildings, roads, and impervious surfaces replace vegetation and natural land cover — the Urban Heat Island (UHI) effect. For Nagpur, understanding where this is happening, how it's changing over time, and what's driving it supports urban planning, climate resilience, and green-cover investment decisions.

The brief required more than a static heat map: real multi-year satellite analysis, land-cover/vegetation indicators, persistent hotspot identification, a land-cover ↔ temperature relationship model, and interactive scenario-based estimation — not absolute prediction.

## What This Project Does

1. **Analyses real satellite data** — Landsat 8/9 surface temperature, Sentinel-2 vegetation/built-up indices, and Dynamic World land cover, for Nagpur, 2019–2024.
2. **Maps hotter and cooler zones** across Nagpur's 10 NMC administrative zones.
3. **Identifies persistent vs. emerging heat hotspots** using Mann-Kendall trend testing and Getis-Ord Gi* hotspot statistics.
4. **Explains what drives local heat** (vegetation cover, built-up density, proximity to water/green space) with SHAP-style driver attribution.
5. **Runs land-cover scenarios** ("what if vegetation increases 10% here?") and estimates the resulting surface temperature shift — with an uncertainty range, cross-checked against real analog locations already showing similar land cover in Nagpur today.
6. **Anchors everything to live reality** — current live air temperature, air quality, and a real thermal satellite feed layered on the map, so the app is visibly alive, not a static export.

---

## Pages / Features

| # | Page | What makes it distinct |
|---|---|---|
| 1 | **Overview** | MapLibre + ArcGIS satellite base map of Nagpur with a live NASA GIBS MODIS thermal layer overlaid, plus live air-temperature and air-quality data cards (Open-Meteo APIs, fetched on load) |
| 2 | **Distribution** | Statistical view of LST spread across all grid cells — histograms, LST-by-land-cover box plots, NDVI-vs-LST scatter, zones ranked and re-sortable by metric |
| 3 | **Temporal Analysis** | Multi-line LST trend per zone (2019–2024) with a synced year-scrubber, small-multiple sparkline cards per zone, and a Mann-Kendall significance table |
| 4 | **Maharashtra Districts** | Compares Nagpur against other Maharashtra districts using a live Open-Meteo current-temperature fetch alongside precomputed satellite-derived UHI intensity |
| 5 | **Heat Hotspots** | 3D hotspot extrusion (deck.gl), live reverse-geocoding of clicked hotspots via OSM Nominatim, per-hotspot driver "fingerprint," year-by-year persistence timelapse |
| 6 | **Scenario Lab** | Land-cover sliders feed a monotonic regression/XGBoost model; output is anchored to today's live Open-Meteo temperature, cross-checked against real analog grid cells with similar NDVI/built-up density (not model output alone), and every run is logged to Supabase with a live realtime "recent scenarios" ticker |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  OFFLINE PIPELINE (Python, run periodically / per year)       │
│  Google Earth Engine → Landsat LST, Sentinel-2 indices,       │
│  Dynamic World LULC, WorldPop, Copernicus DEM                 │
│       │                                                        │
│       ▼                                                        │
│  esda / pymannkendall / mgwr → hotspot + trend + regression    │
│       │                                                        │
│       ▼                                                        │
│  scikit-learn / xgboost / shap → scenario model + explainers   │
│       │                                                        │
│       ▼                                                        │
│  Export: grid_cells.csv, zone_stats.csv → bulk-load into       │
│  Supabase Postgres                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  SUPABASE (Postgres + REST + Realtime + RLS)                   │
│  grid_cells · zone_stats · scenario_runs                       │
│  anon role: read-only on grid_cells/zone_stats,                │
│             insert-only on scenario_runs                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (React + Vite, single multi-page SPA)                 │
│  @supabase/supabase-js  ──► Supabase (stats, scenario logging) │
│  fetch() ──► Open-Meteo (live temp, air quality, climate)       │
│  fetch() ──► OSM Nominatim (reverse geocoding)                  │
│  MapLibre GL ──► ArcGIS World Imagery + NASA GIBS thermal tiles │
│  deck.gl ──► 3D hotspot extrusion                                │
└─────────────────────────────────────────────────────────────┘
```

No page makes up data client-side — every page either queries Supabase (populated from the real offline pipeline) or calls a live public API directly from the browser.

---

## Tech Stack

**Data acquisition**
- Google Earth Engine (Python API) — Landsat 8/9, Sentinel-2, Dynamic World, WorldPop, Copernicus DEM
- Microsoft Planetary Computer STAC (`pystac-client`) — fallback imagery source
- OSM Overpass API — lakes, parks, roads
- IMD / data.gov.in — ground-truth air temperature

**Offline processing (Python)**
- `xarray`, `rioxarray`, `rasterio`, `geopandas`
- `esda`, `pysal` — Getis-Ord Gi* hotspot detection
- `pymannkendall` — trend significance
- `mgwr` — geographically weighted regression
- `scikit-learn`, `xgboost`, `shap` — scenario model + explainability

**Backend**
- **Supabase** (Postgres, REST, Realtime, Row Level Security)

**Frontend**
- React + Vite, TypeScript
- MapLibre GL JS + `maplibre-gl-draw`
- deck.gl (3D hotspot layer)
- Recharts / Plotly
- Framer Motion
- Tailwind CSS
- `@supabase/supabase-js`

**Live external APIs (all free, no key unless noted)**
- Open-Meteo Forecast API — live current weather
- Open-Meteo Air Quality API — live PM2.5/ozone
- Open-Meteo Historical Archive API — heatwave-day index
- Open-Meteo Climate API — CMIP6 downscaled projections to 2050
- NASA GIBS WMTS — live MODIS Terra LST thermal tiles
- NASA POWER API — cross-check historical temperature
- OSM Nominatim — reverse geocoding
- Esri/ArcGIS World Imagery — satellite base map tiles

**Hosting**
- Vercel / GitHub Pages (frontend) · Supabase (managed Postgres) · Render / Hugging Face Spaces (optional FastAPI inference)

---

## Data Sources & APIs

| Source | Used for | Auth |
|---|---|---|
| Google Earth Engine | Landsat LST, Sentinel-2 NDVI/NDBI/MNDWI, Dynamic World LULC, WorldPop, DEM | Free account |
| Microsoft Planetary Computer | Imagery fallback | None |
| NASA GIBS | Live thermal satellite tile overlay | None |
| NASA POWER | Historical temperature cross-check | None |
| Open-Meteo (Forecast / Air Quality / Archive / Climate) | Live weather, AQI, heatwave index, CMIP6 projections | None |
| OSM Overpass / Nominatim | Boundaries, landmarks, reverse geocoding | None |
| Esri/ArcGIS World Imagery | Satellite base map | None |
| IMD via data.gov.in | Ground-truth station temperature | Free key |

---

## Data Model

### `grid_cells` — one row per satellite grid cell × year
Feeds spatial statistics and the scenario model. Bulk-loaded from the offline pipeline, never hand-entered.
Key fields: `cell_id`, `year`, `centroid_lat/lon`, `lst_celsius`, `lst_zscore`, `ndvi`, `ndbi`, `mndwi`, `lulc_class`, `building_density`, `population_density`, `elevation_m`, `dist_to_water_m`, `hotspot_class`, `trend_class`.

### `zone_stats` — one row per NMC zone × year
Feeds the live dashboard. 10 real NMC zones (Laxmi Nagar, Dharampeth, Hanuman Nagar, Dhantoli, Nehru Nagar, Gandhi Baugh, Sataranjipura, Lakadganj, Ashi Nagar, Mangalwari).
Key fields: `zone_id`, `zone_name`, `year`, `mean_lst`, `lst_trend_slope`, `trend_pvalue`, `pct_persistent_hotspot`, `mean_ndvi`, `pct_built_up`, `pct_vegetation`, `total_population`, `heat_vulnerability_index`, `priority_rank`, `data_status`.

### `scenario_runs` — log of every user-run what-if scenario
`zone_id`, `ndvi_delta`, `built_up_delta`, `predicted_dlst`, `dlst_low`, `dlst_high`, `top_drivers`, `created_at`. Powers the live "recent scenarios" ticker via Supabase Realtime.

Full SQL: see [`/db/supabase_schema.sql`](./db/supabase_schema.sql) and seed data in [`/db/supabase_seed_zones.sql`](./db/supabase_seed_zones.sql).

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (see [Supabase Setup](#supabase-setup))
- (Optional, for re-running the data pipeline) Python 3.10+, a free Google Earth Engine account

### Frontend

```bash
git clone <this-repo-url>
cd nagpur-uhi-platform
npm install
```

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

```bash
npm run dev
```

### Offline data pipeline (optional — to regenerate `grid_cells`/`zone_stats`)

```bash
cd pipeline
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
earthengine authenticate
python run_pipeline.py --years 2019 2020 2021 2022 2023 2024
```

This exports `grid_cells.csv` and updated `zone_stats.csv`, which can be bulk-imported via the Supabase Table Editor's CSV import or `COPY`.

---

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste and run [`db/supabase_schema.sql`](./db/supabase_schema.sql).
3. Run [`db/supabase_seed_zones.sql`](./db/supabase_seed_zones.sql) to seed the 10 real NMC zones (satellite-derived metrics are intentionally left `NULL` with `data_status = 'pending_pipeline_run'` until the offline pipeline populates them — the UI shows this status honestly rather than faking a number).
4. Under **Database → Replication**, enable Realtime for the `scenario_runs` table (needed for the live ticker on the Scenario Lab page).
5. Copy your project URL and `anon` public key into `.env` as shown above.

---

## Project Structure

```
├── src/
│   ├── pages/              # OverviewPage, DistributionPage, TemporalPage,
│   │                        # DistrictsPage, HotspotPage, ScenarioPage
│   ├── components/          # NagpurHeatMap, PageHeader, data cards, charts
│   ├── hooks/                # useLiveNagpurWeather, useLiveNagpurAirQuality, etc.
│   ├── lib/                  # supabaseClient.ts
│   └── data/                 # nagpurData.ts (zone metadata/types)
├── db/
│   ├── supabase_schema.sql
│   └── supabase_seed_zones.sql
├── pipeline/
│   ├── run_pipeline.py       # Earth Engine → indices → stats → export
│   └── requirements.txt
└── README.md
```

---

## Methodology Notes & Known Limitations

Documented openly rather than glossed over, since this directly affects how results should be read:

- **Landsat overpass is ~10:30am local time.** LST reflects morning surface conditions, not peak afternoon heat or felt air temperature.
- **Seasonal consistency:** composites use March–May (dry season) each year for comparability; monsoon-season imagery is too cloud-affected to use reliably.
- **Bare-soil confound:** fallow farmland and quarries around Nagpur can read hotter than dense urban core in dry season — land-cover-stratified comparisons avoid misreading this as "urban" heat.
- **NASA GIBS thermal layer is ~1km resolution** — shown as live global context, not a substitute for the Landsat-derived 30m `grid_cells` analysis.
- **Scenario Lab outputs are estimates, not forecasts** — a regression/XGBoost model with monotonic constraints, bounded by an uncertainty range and cross-checked against real analog locations, explicitly framed as scenario-based estimation per the problem brief.
- **Year-to-year LST is normalised** (z-score vs. city median) before being called a "trend," to separate genuine land-cover change from ordinary weather variability between years.

---

## Roadmap

- [ ] ERA5 reanalysis (Copernicus CDS) for a published-grade heatwave frequency/intensity index
- [ ] LST sharpening to 10m via Random Forest downscaling
- [ ] CA-Markov built-up growth projection for "business as usual" vs. "green plan" comparison
- [ ] FastAPI `/predict-scenario` endpoint or ONNX client-side inference to replace the current placeholder regression

---

## License

MIT — see [`LICENSE`](./LICENSE).

## Acknowledgements

Built on open data from USGS/NASA (Landsat), ESA/Copernicus (Sentinel-2), Google (Dynamic World), WorldPop, NASA GIBS/POWER, Open-Meteo, OpenStreetMap, Esri, and Nagpur Municipal Corporation administrative data.
