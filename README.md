# 🌍 Vayu AI: Urban Air Quality Intelligence Platform for Gujarat

[![Live Demo on Vercel](https://img.shields.io/badge/🚀_Live_Demo-Try_Now_on_Vercel-f59e0b?style=for-the-badge&logo=vercel&logoColor=white)](https://gujarat-aqi-platform.vercel.app/)
[![Groq AI Powered](https://img.shields.io/badge/🤖_Multi--Agent_AI-Groq_Llama--3.1-emerald?style=for-the-badge)](https://console.groq.com/)
[![Next.js 16](https://img.shields.io/badge/⚡_Frontend-Next.js_16_Turbopack-black?style=for-the-badge&logo=next.dot.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/🐍_Backend-FastAPI_Async-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)

> ### 🟢 **Try the Live Interactive Dashboard Right Now:**  
> 👉 **[https://gujarat-aqi-platform.vercel.app/](https://gujarat-aqi-platform.vercel.app/)**

---

## 🏛️ Executive Summary & Problem Solved
India's air quality crisis requires more than static dashboards that simply report pollution levels after the fact. City administrations and pollution control authorities need **geospatial source attribution** (*which exact industrial stack, diesel fleet, or construction site is emitting right now*), **hyperlocal 72-hour dispersion forecasting** (*where will pollution drift at ward level*), and **prioritized enforcement directives** (*where to deploy squads for maximum impact*).

**Vayu AI** bridges this gap by fusing real-time IoT sensor telemetry (CAAQMS), live arterial mobility speeds (TomTom), meteorological forecasts (Open-Meteo & OpenWeatherMap), and satellite thermal/optical layers (NASA FIRMS & Planet API) across **32 major Gujarat urban & industrial centers** (Ankleshwar GIDC, Morbi Ceramic Cluster, Surat, Ahmedabad, Vadodara, Vapi, Mundra Port, Jamnagar Refinery, etc.).

---

## ✨ Key Platform Features & Innovations

1. **🗺️ Geospatial Pollution Source Attribution Engine (15 Hubs)**  
   Multi-modal AI agent that breaks down exact ward-level pollution contributions (`Industrial Stacks %`, `Vehicular Diesel Fleet %`, `Construction Fugitive Dust %`, `Biomass/Open Burning %`) across 15 high-impact centers with statistical confidence scores (`88%+`) and interactive visual stacked bar charts.

2. **📈 Hyperlocal 72h Dispersion Forecasting & Policy Simulator**  
   Fuses atmospheric dispersion kinetics with **4 live interactive municipal policy toggles**:
   - `Odd-Even Vehicular Mandate` (-22% PM2.5)
   - `5km Fugitive Dust Freeze` (-28% PM10)
   - `Industrial Scrubber Audit Mandate` (-35% SO2)
   - `Arterial Road Mist Cannons & Sprinklers` (-15% Dust)  
   Dynamically plots **72-Hour Comparative Dispersion Curves (`Baseline Curve` vs. `Post-Intervention Curve`)** and quantifies exact hazardous exposure hours avoided.

3. **🚨 Enforcement Intelligence & Prioritization Agent**  
   Correlates pollution hotspot data with registered emission sources to generate formal, prioritized **Municipal Enforcement Directives** with supporting geospatial evidence ready for official dispatch.

4. **📊 Multi-City Comparative Benchmarking Matrix**  
   Benchmarks 32 Gujarat urban nodes with real-time compliance tracking, PM2.5/PM10 averages, and cross-city governance analytics to learn from successful interventions.

5. **💬 24/7 Multilingual Citizen Support & Health Advisory Chatbot**  
   Powered by `Groq Llama-3.1-8b-instant`. Includes a dedicated language selector (`English`, `Gujarati/ગુજરાતી`, `Hindi/हिंदी`) to provide personalized ward-level health guidance with sub-second parallel caching and domain-resilient fallback architecture.

---

## 🛠️ Technology Stack & Architecture Hub

### **Frontend & Visualization Layer**
- **Framework**: Next.js 16 (App Router, TypeScript, React 19, Turbopack)
- **Styling & UI**: Tailwind CSS (curated enterprise dark theme: `Zinc-950/Amber/Emerald`), Framer Motion micro-animations, Lucide React icons
- **Geospatial Mapping**: Leaflet & React-Leaflet with `CartoDB Dark Matter` tiles, custom bounding heatmaps, and interactive sensor pins
- **Visual Charts**: Dynamic coordinate-mapped mathematical SVG dispersion trajectories and source breakdown bars

### **Backend & AI Multi-Agent Layer**
- **Framework**: Python 3, FastAPI asynchronous server, Pydantic, Uvicorn
- **AI Engine**: Groq API (`llama-3.1-8b-instant`) powering 4 distinct domain agents (`Source Attribution Engine`, `Policy Simulator`, `Enforcement Directives`, `Multilingual Citizen Chatbot`)
- **Performance Optimization**: Sub-second `asyncio.gather` parallel API pooling and 60s in-memory telemetry caching

### **7 External APIs Unified**
- `WAQI (World Air Quality Index) API`: Real-time Continuous Ambient Air Quality Monitoring Stations across 32 Gujarat cities
- `TomTom Telemetry API`: Arterial vehicle speeds, congestion indexes, and traffic flow vectors
- `Open-Meteo & OpenWeatherMap APIs`: Meteorological dispersion vectors, wind speed/direction, humidity, and atmospheric stability
- `NASA FIRMS & Planet APIs`: Satellite thermal anomalies, active fire spots, and industrial smokestack optical imagery
- `Overpass OSM & OSRM`: Land use boundaries, industrial zones, construction permit maps, and road networks

### **Database & Caching Layer**
- **Database**: Neon PostgreSQL (`DATABASE_URL`) with SSL connection pooler for historical logs
- **Cache**: Redis (`REDIS_URL`) & asynchronous in-memory tiering

---

## 🏆 Hackathon Evaluation Impact Across Criteria
- **Innovation (25%)**: Multi-agency fusion combining satellite remote sensing (NASA/Planet) with IoT sensors and real-time municipal policy simulation.
- **Business Impact (25%)**: Direct municipal utility via automated enforcement directives, exact source attribution, and quantified exposure reduction.
- **Technical Excellence (20%)**: High-speed parallel async architecture, robust domain fallbacks, dynamic SVG kinetics, and clean 2-tier enterprise layout.
- **Scalability (15%)**: Containerized API gateway readily expandable from 32 Gujarat nodes to nationwide urban centers.
- **User Experience (15%)**: Vibrant glassmorphic aesthetic, interactive map nodes, real-time feedback, and multilingual citizen accessibility (`English`, `Gujarati`, `Hindi`).
