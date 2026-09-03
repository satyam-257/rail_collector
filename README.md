# RailVue AI 🚆🤖

<p align="center">
  <img src="public/railvue-logo.png" alt="RailVue AI Logo" width="160" />
</p>

<p align="center">
  <strong>SMARTER ETA. BETTER JOURNEYS.</strong><br>
  <em>Real-Time Dynamic ETA Prediction & Network Intelligence Platform for Indian Railways</em>
</p>

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-Regression-orange.svg)](https://xgboost.readthedocs.io/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)

RailVue AI is an intelligent railway operations and ETA prediction platform designed for Indian Railways. Unlike legacy tracking systems that apply static delay offsets, RailVue AI continuously re-computes expected times of arrival at upcoming intermediate stations and destination terminals using real-time telemetry, track congestion density, signaling interlocks, weather radar, and trained XGBoost gradient boosting regression models. The system predicts the **deviation from the published timetable** rather than raw trip time — the same architecture used by production ETA engines — cutting prediction error by 42% over the standard timetable-offset formula.

---

## 🎯 Central Dynamic Prediction Logic

Mathematically, the core ETA formulation is expressed as:

$$\text{Predicted ETA} = \text{Current Timestamp} + \text{Predicted Remaining Travel Time}$$

Internally, the model predicts $\text{delay\_deviation\_minutes}$ (the deviation from the scheduled timetable) rather than the absolute remaining time — this isolates genuine delay signal from trip-length variance and is reconstructed as: $\text{Predicted Remaining Time} = \text{Scheduled Remaining Time} + \text{Predicted Delay Deviation}$.

---

## 🏗 System Architecture

```
RailVue AI Architecture
├── Python FastAPI Backend (Port 8000)
│   ├── Dataset Ingestion Adapters
│   │   ├── Indian Railways Historical Tracking Data Generator (ingestion.py)
│   │   └── Kaggle 'vishwassrivastava1/indian-railway-delay-dataset' Adapter (ingest_kaggle_delay_dataset.py)
│   ├── Unified Feature Schema Transformer (transformation.py)
│   ├── ML Engine & Model Serialization (backend/models/)
│   │   ├── Model 1: Schedule Baseline (Traditional Timetable Offset: MAE 17.97m, RMSE 23.38m)
│   │   ├── Model 2: Random Forest Regressor (MAE: 10.62m, RMSE: 13.90m, Delay R²: +0.4810)
│   │   ├── Model 3: XGBoost Regressor (MAE: 10.37m, RMSE: 13.65m, Delay R²: +0.4993) [Primary]
│   │   └── Model 4: Random Forest Delay-Risk Classifier (Accuracy: 57.28%, Macro F1: 0.5628)
│   ├── Model Explainability Module (ml/explainability.py)
│   ├── Live Simulation Ticker Service (15-second background loop)
│   └── REST API Endpoints (/api/trains/{id}/live, /eta, /explanation, /network/congestion, /alerts)
└── React TypeScript Frontend (Port 3000)
    ├── Operations Command Center Dashboard
    ├── Interactive SVG Indian Railways Network Map (Train markers, tooltips, corridors)
    ├── Dynamic ETA Predictions & 4-Model Recharts Comparison Graph
    ├── Train Details View (6-Grid summary, route journey timeline, SHAP explainability panel)
    ├── Network Intelligence & Trunk Corridor Heatmap
    ├── Delay Analytics Dashboard & Root Cause Breakdown
    ├── Alerts & Disruption Notices
    ├── Developer API Sandbox Playground
    └── Floating Real-Time Event Injection Bar (Rain, Congestion, Speed Restriction, Priority)
```

## 📡 5-Part SIH Data Integration Pipeline

1. **Historical Train Running & Delay Data**:
   - Primary: Ingestion adapter for Kaggle *Indian Railway Delay Dataset* (`vishwassrivastava1/indian-railway-delay-dataset`).
   - Sourced from public dataset combined with live `pyinrail` / NTES enquiry query fallback.
2. **Route + Station Sequence**:
   - `data.gov.in` timetables & GeoJSON route segments (`anandology/railways`).
3. **Station Master + Coordinates**:
   - GeoJSON FeatureCollection (`backend/data/stations.json`) mapping exact station coordinates (Lat/Lng), zone (`NR`, `ER`, `WR`, `NCR`, `ECR`), state, and address.
4. **Historical Weather Data**:
   - Direct integration with **Open-Meteo Free Historical Weather API** (`backend/data/fetch_open_meteo_weather.py`). Plugs station master coordinates directly into Open-Meteo REST endpoints for station-wise rainfall and temperature.
5. **Derived Delay Features**:
   - Leakage-free groupby aggregations calculated strictly on training splits (`backend/data/derived_features.py`): `train_avg_delay`, `station_avg_delay`, `route_avg_delay`, `hour_avg_delay`.


## 📊 Model Evaluation & Benchmarking Results

Evaluation performed on engineered Indian Railways train tracking datasets (515 held-out test journeys, journey-aware split):

| Model Architecture | Absolute MAE | Absolute RMSE | % Improvement vs. Baseline | Delay-Only $R^2$ ($\Delta y$) | Production Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Naïve Zero-Deviation (Timetable Only)** | $26.13\text{ mins}$ | $34.85\text{ mins}$ | Baseline Ref | $-1.7373$ | Assumes zero delay deviation |
| **Model 1: Schedule Baseline Formula** | $17.97\text{ mins}$ | $23.38\text{ mins}$ | $0.00\%$ | $-0.4683$ | Timetable offset (`sched + 0.7 * delay`) |
| **Model 2: Random Forest Regressor** | $10.62\text{ mins}$ | $13.90\text{ mins}$ | **$+40.90\%$** | $+0.4810$ | Ensemble of 100 deep trees |
| **Model 3: XGBoost Regressor (Tuned)** | **$10.37\text{ mins}$** | **$13.65\text{ mins}$** | **$+42.29\%$** | **$+0.4993$** | **Primary Production Model** 🏆 |

> See `docs/PRESENTATION_SUMMARY.md` for full breakdown including per-segment performance and the delay-risk classifier.

### 🛡️ Operational Delay-Risk Classifier
In addition to continuous remaining travel time regression, RailVue AI incorporates a specialized Random Forest Classifier (`delay_risk_classifier.pkl`, 150 trees, max depth 10) that categorizes trains into 3 operational risk tiers:
- **`ON_TIME`**: delay deviation $\le 10$ minutes
- **`MINOR_DELAY`**: $10 < \text{delay deviation} \le 30$ minutes
- **`MAJOR_DELAY`**: delay deviation $> 30$ minutes

* **Classification Accuracy**: **$57.28\%$** (vs. 33.3% random guess across 3 balanced classes)
* **Macro F1 Score**: **$0.5628$**
* **Safety False-Alarm Rate**: Out of 113 true `ON_TIME` journeys, **only 1 single journey was misclassified as `MAJOR_DELAY` (0.88% false alarm rate)**, ensuring section controllers and dispatchers are never distracted by spurious disruption alerts.

---

## 🔌 API Endpoints

FastAPI backend serves live REST endpoints:

- `GET /api/trains/{train_id}/live` — Live running status, coordinates, speed, current delay.
- `GET /api/trains/{train_id}/eta` — Dynamic XGBoost ETA prediction, remaining travel time, confidence score, data lineage tags.
- `GET /api/trains/{train_id}/eta/explanation` — SHAP-like feature contribution factors (Downstream Congestion +8m, TSR +5m, Weather +3m, Recovery -2m).
- `GET /api/network/congestion` — Active trunk corridor congestion density and affected train counts.
- `GET /api/alerts` — Weather warnings, caution speed orders, and critical train delay notices.
- `POST /api/simulation/event` — Operational event injection endpoint to trigger real-time feature re-computation and XGBoost re-inference.

---

## 🏷 Data Source Transparency

To ensure maximum credibility during hackathon evaluations, the UI explicitly renders lineage tags:
- `🟢 LIVE GPS DATA`
- `🔵 ESTIMATED TELEMETRY`
- `⚡ REAL XGBOOST MODEL`
- `🟠 SIMULATED OVERRIDE`

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 2. Backend Setup & Model Training
```bash
# Install Python dependencies
pip install fastapi uvicorn xgboost scikit-learn pandas numpy

# Train ML Models (Generates backend/models/eta_xgboost.json)
python backend/ml/train_model.py

# Train Delay-Risk Classifier (Generates backend/models/delay_risk_classifier.pkl)
python backend/ml/delay_classifier.py

# Start FastAPI Backend Server
python -m uvicorn backend.app.main:app --port 8000
```
FastAPI Swagger docs available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
# Install Node dependencies
npm install

# Start Vite React Frontend
npm run dev
```
Frontend Dashboard available at: `http://localhost:3000/`

---

## 📜 License
MIT License. Created for Smart India Hackathon.
