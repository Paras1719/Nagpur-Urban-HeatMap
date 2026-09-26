<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
=======
# Team Aspirion

## Hackronyx 2.0

**Problem Statement No.:** R2-P5  
**Problem Statement:** Multi-Temporal Urban Heat Island Analysis & AI Prediction for Nagpur

---

## 📌 Overview

Rapid urbanisation can increase local surface temperatures through the expansion of buildings, roads, concrete surfaces, and other impervious areas, along with reductions in vegetation and natural land cover.

**Team Aspirion** proposes an intelligent geospatial platform for analysing the evolution of Urban Heat Island (UHI) patterns across Nagpur using multi-temporal satellite imagery, land-use/land-cover information, geospatial indicators, and AI-assisted scenario modelling.

The platform is designed to help users understand:

- How surface temperature has changed over time.
- Where persistent urban heat hotspots are located.
- How vegetation and built-up areas relate to surface temperature.
- How changes in vegetation or built-up areas could affect the estimated local heat profile.
- How historical observations can support scenario-based estimation.

> **Note:** The objective is scenario-based estimation and decision support, rather than absolute prediction of future climate.

---

## 🎯 Objectives

1. Analyse multi-temporal open satellite data for Nagpur.
2. Generate Land Surface Temperature (LST) maps for different time periods.
3. Identify persistent hotter and cooler zones.
4. Analyse land-use/land-cover characteristics.
5. Derive vegetation and built-up indicators such as **NDVI** and **NDBI**.
6. Study the relationship between land characteristics and surface temperature.
7. Detect persistent UHI hotspots through temporal comparison.
8. Provide scenario-based AI estimation for changes in vegetation and built-up areas.
9. Present the results through an interactive geospatial interface.

---

# 🔄 Proposed Approach / Workflow

The proposed workflow combines **satellite data → preprocessing → geospatial indices → LST extraction → temporal analysis → hotspot detection → relationship analysis → AI scenario modelling → interactive visualisation**.

```text
                    ┌─────────────────────────┐
                    │   Satellite Data Input  │
                    │ Landsat / Sentinel Data  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Data Preprocessing       │
                    │ • Cloud filtering        │
                    │ • AOI selection          │
                    │ • Atmospheric/scale prep │
                    │ • Temporal alignment      │
                    └────────────┬────────────┘
                                 │
                                 ▼
              ┌──────────────────┴──────────────────┐
              │                                     │
              ▼                                     ▼
   ┌─────────────────────┐               ┌─────────────────────┐
   │ Land Cover Analysis │               │ Temperature Analysis│
   │ • LULC              │               │ • LST               │
   │ • NDVI              │               │ • Heat zones        │
   │ • NDBI              │               │ • UHI patterns      │
   └──────────┬──────────┘               └──────────┬──────────┘
              │                                     │
              └──────────────────┬──────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ Multi-Temporal Analysis │
                    │ • Year/period comparison│
                    │ • Change detection      │
                    │ • Persistent hotspots   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Relationship Analysis   │
                    │ LST ↔ NDVI ↔ NDBI/LULC │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ AI / Scenario Modelling │
                    │ • Vegetation change     │
                    │ • Built-up change       │
                    │ • Estimated heat impact │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Interactive GIS Platform │
                    │ Maps • Charts • Insights │
                    │ Scenario Exploration     │
                    └─────────────────────────┘
```

## 1. Satellite Data Acquisition

The platform will use suitable open satellite datasets such as **Landsat and/or Sentinel** to obtain historical observations of Nagpur.

The data will provide the required information for:

- Surface-temperature analysis.
- Vegetation assessment.
- Built-up area assessment.
- Land-use/land-cover analysis.
- Multi-temporal comparison.

The analysis will use approximately **3–5 years or more of available data**, depending on data availability and quality.

---

## 2. Data Preprocessing

Before analysis, satellite data will be prepared for consistent comparison across different dates and periods.

Key preprocessing steps include:

- Selecting the Nagpur Area of Interest (AOI).
- Filtering unsuitable or cloud-affected observations.
- Applying required scale/reflectance preparation.
- Aligning datasets spatially and temporally.
- Preparing analysis-ready raster layers.

The objective is to ensure that observations from different time periods can be compared reliably.

---

## 3. Land Surface Temperature (LST) Mapping

Land Surface Temperature will be derived from suitable satellite observations and represented spatially across Nagpur.

The LST layer will be used to:

- Visualise temperature distribution.
- Identify relatively hotter and cooler regions.
- Compare temperature patterns across different time periods.
- Provide the primary heat-related variable for downstream analysis.

---

## 4. Vegetation & Built-up Indicators

To understand possible factors contributing to urban heat, the platform will calculate indicators such as:

### NDVI — Normalized Difference Vegetation Index

Used to represent vegetation characteristics and changes in green cover.

### NDBI — Normalized Difference Built-up Index

Used to represent built-up/impervious characteristics.

These indicators can be analysed alongside LST to study how variations in vegetation and built-up areas correspond with surface-temperature patterns.

---

## 5. Multi-Temporal UHI Analysis

Instead of generating a single static heat map, the platform will compare observations across multiple time periods.

The analysis will include:

- Historical LST comparison.
- NDVI and NDBI change analysis.
- Spatial identification of changing heat zones.
- Identification of regions with recurring high-temperature patterns.
- Detection of **persistent heat hotspots**.

This temporal component is central to the proposed solution.

---

## 6. Land Cover & Temperature Relationship Analysis

The system will analyse the relationship between land characteristics and surface temperature.

For example:

```text
Vegetation ↑  ───────────────► Estimated heat profile
Built-up area ↑ ─────────────► Estimated heat profile
```

The platform can examine spatial and statistical relationships between:

- LST and NDVI.
- LST and NDBI.
- LST and land-use/land-cover classes.
- Changes in land characteristics and corresponding temperature changes.

The results will be presented using maps, charts, and interpretable indicators.

---

## 7. AI-Based Scenario Modelling

The AI layer will extend the historical analysis into **scenario-based estimation**.

Rather than attempting to predict the exact future climate, the model will estimate how changes in relevant land characteristics could influence the local heat profile.

### Example scenarios

**Scenario A — Reduced Vegetation**

```text
Vegetation decreases
        ↓
Scenario features updated
        ↓
AI model estimates temperature/heat-profile change
```

**Scenario B — Increased Built-up Area**

```text
Built-up area increases
        ↓
Scenario features updated
        ↓
AI model estimates temperature/heat-profile change
```

**Scenario C — Increased Green Cover**

```text
Green cover increases
        ↓
Scenario features updated
        ↓
AI model estimates temperature/heat-profile change
```

The model output will be presented as an estimated change rather than an absolute claim about future climate.

---

## 8. Persistent Hotspot Identification

Historical temperature layers will be combined to identify areas that repeatedly exhibit relatively higher surface temperatures.

A hotspot analysis layer can help users distinguish between:

- Temporarily hot areas.
- Repeatedly hot areas.
- Areas showing changing heat patterns.
- Relatively cooler regions.

This provides a more useful interpretation than a single-date heat map.

---

## 9. Interactive Geospatial Interface

The final results will be exposed through an interactive web-based geospatial interface.

Users will be able to explore:

- Nagpur's LST maps.
- Historical time periods.
- NDVI and NDBI layers.
- Land-use/land-cover information.
- Persistent heat hotspots.
- Temperature and land-cover relationships.
- Scenario-based estimations.

The interface will focus on making the analysis **visual, interactive, and explainable**.

---

# 🧠 System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     React + TypeScript                      │
│                  Interactive GIS Frontend                   │
│                                                             │
│  Maps │ Time Slider │ LST │ NDVI │ NDBI │ Hotspots │ AI     │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Node.js                             │
│                     Backend Layer                           │
│                                                             │
│  API Integration │ Data Management │ Authentication/Logic   │
└───────────────────────┬─────────────────┬───────────────────┘
                        │                 │
                        │                 │
                        ▼                 ▼
              ┌────────────────┐  ┌────────────────────────┐
              │ Python FastAPI │  │ Geospatial/Data Layer  │
              │ AI & Analysis  │  │ Satellite & LULC Data  │
              └───────┬────────┘  └────────────────────────┘
                      │
                      ▼
              ┌────────────────┐
              │ AI / ML Models │
              │ Scenario       │
              │ Estimation     │
              └────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

- **React**
- **TypeScript**
- Interactive geospatial visualisation
- Map-based dashboard
- Charts and temporal visualisation

## Backend

- **Node.js**
- REST-based backend services
- Data and application logic
- Communication between frontend and analysis services

## API Development & AI/ML

- **Python**
- **FastAPI**
- AI/ML model serving
- Geospatial analysis APIs
- Scenario-based estimation APIs

## Data & Geospatial Processing

- Open satellite data such as **Landsat / Sentinel**
- Raster and geospatial data processing
- Land-use/land-cover datasets
- NDVI and NDBI generation
- LST generation and analysis

## Analytics & Visualisation

- Multi-temporal raster analysis
- Spatial comparison
- Statistical relationship analysis
- Interactive maps
- Charts and analytical dashboards

---

# 📊 Key Outputs

The platform is intended to provide the following outputs:

| Output | Purpose |
|---|---|
| **LST Maps** | Visualise surface-temperature distribution |
| **NDVI Maps** | Analyse vegetation/green-cover characteristics |
| **NDBI Maps** | Analyse built-up characteristics |
| **Temporal Comparison** | Understand changes across multiple periods |
| **Heat Hotspot Map** | Identify persistent heat-prone areas |
| **LULC Analysis** | Understand land-cover composition and changes |
| **Relationship Analysis** | Examine LST against vegetation and built-up indicators |
| **Scenario Estimation** | Estimate heat-profile changes under hypothetical land-cover changes |
| **Interactive Dashboard** | Explore and explain results through a geospatial interface |

---

# 🌆 Example User Flow

A user selects an urban region within Nagpur and chooses a historical time period.

```text
Select Region
     ↓
Select Time Period
     ↓
View LST / NDVI / NDBI
     ↓
Compare Historical Periods
     ↓
Identify Heat Hotspots
     ↓
Explore Land-Cover Relationship
     ↓
Create a Scenario
     ↓
Modify Vegetation / Built-up Area
     ↓
Run AI Estimation
     ↓
Visualise Estimated Heat-Profile Change
```

---

# 💡 Core Value Proposition

**Team Aspirion** aims to transform multi-temporal satellite observations into an interactive urban heat intelligence platform for Nagpur.

The solution combines:

**Satellite Data + Geospatial Analysis + Temporal Intelligence + AI Scenario Modelling + Interactive Visualisation**

to help users understand **where urban heat occurs, how it changes over time, what land characteristics are associated with it, and how hypothetical changes in vegetation or built-up areas could affect the estimated heat profile.**

---

## 👥 Team

### Team Aspirion

**Hackronyx 2.0 | PS R2-P5**

> *Multi-Temporal Urban Heat Island Analysis & AI Prediction for Nagpur*
>>>>>>> 3cbd1af5526fbd70baf5bdfe58f4eee81d7a4904
