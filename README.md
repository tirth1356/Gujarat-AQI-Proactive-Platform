# 🌍 Vayu AI: Urban Air Quality Intelligence Platform for Gujarat

[![Live Demo on Vercel](https://img.shields.io/badge/🚀_Live_Demo-Try_Now_on_Vercel-f59e0b?style=for-the-badge&logo=vercel&logoColor=white)](https://gujarat-aqi-platform.vercel.app/)
[![Groq AI Powered](https://img.shields.io/badge/🤖_Multi--Agent_AI-Groq_Llama--3.1-emerald?style=for-the-badge)](https://console.groq.com/)
[![Next.js 16](https://img.shields.io/badge/⚡_Frontend-Next.js_16_Turbopack-black?style=for-the-badge&logo=next.dot.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/🐍_Backend-FastAPI_Async-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)

> ### 🟢 **Try the Live Interactive Dashboard Right Now:**  
> 👉 **[https://gujarat-aqi-platform.vercel.app/](https://gujarat-aqi-platform.vercel.app/)**

---

## 🏛️ Executive Summary & Problem Solved
India's air quality crisis requires more than static dashboards that simply report pollution levels after the fact. City administrators and pollution control authorities need **geospatial source attribution** (*which exact industrial stack, diesel fleet, or construction site is emitting right now*), **hyperlocal 72-hour dispersion forecasting** (*where will pollution drift at ward level*), and **prioritized enforcement directives** (*where to deploy squads for maximum impact*).

**Vayu AI** bridges this gap by fusing real-time IoT sensor telemetry (CAAQMS), live arterial mobility speeds (TomTom), meteorological forecasts (Open-Meteo & OpenWeatherMap), and satellite thermal/optical layers (NASA FIRMS & Planet API) across **32 major Gujarat urban & industrial centers** (Ankleshwar GIDC, Morbi Ceramic Cluster, Surat, Ahmedabad, Vadodara, Vapi, Mundra Port, Jamnagar Refinery, etc.).

---

## ✨ Key Platform Features & Modules

1. **🗺️ Geospatial Pollution Source Attribution Engine (15 Hubs)**  
   Multi-modal AI agent that breaks down exact ward-level pollution contributions (`Industrial Stacks %`, `Vehicular Diesel Fleet %`, `Construction Fugitive Dust %`, `Biomass/Open Burning %`) with statistical confidence scores (`88%+`) and interactive visual stacked bar charts.

2. **📈 Hyperlocal 72h Dispersion Forecasting & Policy Simulator**  
   Fuses atmospheric dispersion kinetics with **4 live interactive municipal policy toggles** (`Odd-Even Vehicular Mandate -22% PM2.5`, `5km Fugitive Dust Freeze -28% PM10`, `Industrial Scrubber Audit -35% SO2`, `Arterial Road Mist Cannons -15% Dust`). Dynamically plots **72-Hour Comparative Dispersion Curves (`Baseline Curve` vs. `Post-Intervention Curve`)** and quantifies hazardous hours avoided.

3. **🚨 Enforcement Intelligence & Prioritization Agent**  
   Correlates pollution hotspot data with registered emission sources to generate formal, prioritized **Municipal Enforcement Directives** with supporting geospatial evidence.

4. **📊 Multi-City Comparative Benchmarking Matrix**  
   Benchmarks 32 Gujarat urban nodes with real-time compliance tracking, PM2.5/PM10 averages, and cross-city governance analytics.

5. **💬 24/7 Multilingual Citizen Support & Health Advisory Chatbot**  
   Powered by `Groq Llama-3.1-8b-instant`. Auto-detects user language (`English`, `Gujarati/ગુજરાતી`, `Hindi/हिंदी`) to provide personalized ward-level health guidance with domain-resilient fallback architecture ensuring 0% downtime.

---

## 🛠️ Technology Stack & External API Hub

- **Frontend**: Next.js 16 (App Router, TypeScript, React 19, Turbopack), Tailwind CSS (curated enterprise dark theme), Framer Motion, Leaflet & React-Leaflet (`CartoDB Dark Matter`), dynamic mathematical SVG charts.
- **Backend & AI**: Python 3, FastAPI, Pydantic, Uvicorn, Groq API (`llama-3.1-8b-instant` multi-agent engine), `python-dotenv`.
- **7 External APIs Unified**:
  - `WAQI API`: Real-time Continuous Ambient Air Quality Monitoring Stations across Gujarat.
  - `TomTom Telemetry API`: Arterial vehicle speeds and traffic congestion bottlenecks.
  - `Open-Meteo & OpenWeatherMap APIs`: Meteorological dispersion vectors, wind speed/direction, humidity.
  - `NASA FIRMS & Planet APIs`: Satellite thermal anomalies and active industrial smokestack monitoring.
  - `Overpass OSM & OSRM`: Land use boundaries, industrial zones, and routing.
- **Database & Cache**: Neon PostgreSQL (`DATABASE_URL`), Redis (`REDIS_URL`).

---

## 🚀 Local Development Setup

### 1. Clone & Setup Backend
```bash
git clone https://github.com/tirth1356/Gujarat-AQI-Proactive-Platform.git
cd Gujarat-AQI-Proactive-Platform/backend

# Create virtual environment & install requirements
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt

# Start local FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 2. Setup & Run Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📄 License & Hackathon Submission
Built with ❤️ for the **AI-Powered Urban Air Quality Intelligence for Smart City Intervention** hackathon challenge.
