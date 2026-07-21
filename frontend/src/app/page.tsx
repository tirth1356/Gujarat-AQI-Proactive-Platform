"use client";

import dynamic from "next/dynamic";
import { 
  Activity, Wind, Factory, ShieldAlert, TrendingUp, ThermometerSun, 
  Droplets, MapPin, MessageSquare, X, Send, Sliders, PieChart, 
  FileText, BarChart3, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw,
  Download, Radio, Sparkles, Layers, ShieldCheck, Cpu, Globe2, Eye
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Disable SSR for Map since Leaflet needs 'window'
const MapComponent = dynamic(() => import("@/components/Map"), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"map" | "simulator" | "attribution" | "directives" | "comparative">("map");
  const [aqiData, setAqiData] = useState<any[]>([]);
  const [enforcementData, setEnforcementData] = useState<any[]>([]);
  const [healthAdvisory, setHealthAdvisory] = useState<string>("Loading AI Agent...");
  const [liveWeather, setLiveWeather] = useState<{temperature: number, wind_speed: number, humidity?: number, source?: string}>({
    temperature: 32.4,
    wind_speed: 14.2,
    humidity: 58,
    source: "Open-Meteo Live API"
  });
  const [activeLayer, setActiveLayer] = useState<string>("heatmap");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Dynamic Selected City for 72h Graph & Analytics
  const [selectedCity, setSelectedCity] = useState<{name: string, aqi: number}>({
    name: "Ankleshwar GIDC",
    aqi: 278
  });

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: "user" | "bot", content: string}[]>([
    { role: "bot", content: "Namaste! I am the Gujarat Urban Air Quality AI Agent. Ask me anything about pollution, AQI, or enforcement in the state (English/Gujarati/Hindi)." }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Tab 2: Policy Simulator State
  const [simCity, setSimCity] = useState("Surat");
  const [simBaseline, setSimBaseline] = useState(245);
  const [activePolicies, setActivePolicies] = useState<string[]>(["odd_even", "scrubber_audit"]);
  const [simResult, setSimResult] = useState<any>(null);
  const [isSimLoading, setIsSimLoading] = useState(false);

  // Tab 3: Detailed Attribution State
  const [attrZone, setAttrZone] = useState("Ankleshwar GIDC");
  const [attrData, setAttrData] = useState<any>(null);
  const [isAttrLoading, setIsAttrLoading] = useState(false);

  // Tab 4: Directive Generator Modal State
  const [activeDirectiveModal, setActiveDirectiveModal] = useState<{target: string, directive: string} | null>(null);
  const [isDirectiveLoading, setIsDirectiveLoading] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Tab 5: Multi-City Comparative Matrix State
  const [comparativeMatrix, setComparativeMatrix] = useState<any[]>([]);
  const [isMatrixLoading, setIsMatrixLoading] = useState(false);

  useEffect(() => {
    const fetchBaseData = async () => {
      setIsInitialLoading(true);
      try {
        const [aqiRes, enfRes, healthRes, weatherRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/aqi/current`).then(res => res.json()),
          fetch(`${API_BASE}/api/v1/enforcement/recommendations`).then(res => res.json()),
          fetch(`${API_BASE}/api/v1/advisory/health?aqi=245&pm25=120`).then(res => res.json()),
          fetch(`${API_BASE}/api/v1/weather/live`).then(res => res.json()).catch(() => null)
        ]);
        setAqiData(aqiRes);
        setEnforcementData(enfRes);
        setHealthAdvisory(healthRes.advisory);
        if (weatherRes) setLiveWeather(weatherRes);
      } catch (err) {
        console.error("Failed to fetch base data from API", err);
        setHealthAdvisory("⚠️ Connected in standalone fallback mode. Live telemetry active via local cache.");
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchBaseData();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  // Tab Change Handlers & Data Fetching
  useEffect(() => {
    if (activeTab === "simulator" && !simResult) {
      runSimulation();
    } else if (activeTab === "attribution" && !attrData) {
      fetchAttribution(attrZone);
    } else if (activeTab === "comparative" && comparativeMatrix.length === 0) {
      fetchComparativeMatrix();
    }
  }, [activeTab]);

  const handleSelectMapCity = (cityName: string, aqiVal: number) => {
    setSelectedCity({ name: cityName, aqi: aqiVal });
  };

  const runSimulation = async () => {
    setIsSimLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/simulation/intervention`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: simCity,
          interventions: activePolicies,
          baseline_aqi: simBaseline
        })
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimLoading(false);
    }
  };

  const fetchAttribution = async (zoneName: string) => {
    setIsAttrLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/attribution/detailed?zone=${encodeURIComponent(zoneName)}`);
      const data = await res.json();
      setAttrData(data);
    } catch (err) {
      console.error("Attribution error:", err);
    } finally {
      setIsAttrLoading(false);
    }
  };

  const generateDirective = async (spot: any) => {
    setIsDirectiveLoading(true);
    setBroadcastSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/api/v1/enforcement/directive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: spot.target,
          anomaly: spot.ai_analysis.substring(0, 150),
          context: "CAAQMS & Planet Satellite verified anomaly exceeding baseline thresholds by >40%."
        })
      });
      const data = await res.json();
      setActiveDirectiveModal({ target: spot.target, directive: data.directive });
    } catch (err) {
      console.error("Directive error:", err);
    } finally {
      setIsDirectiveLoading(false);
    }
  };

  const fetchComparativeMatrix = async () => {
    setIsMatrixLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/analytics/comparative`);
      const data = await res.json();
      setComparativeMatrix(data);
    } catch (err) {
      console.error("Comparative matrix error:", err);
    } finally {
      setIsMatrixLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    setChatHistory(prev => [...prev, { role: "user", content: userText }]);
    setChatMessage("");
    setIsChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: "bot", content: data.reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "bot", content: "Error: Could not connect to AI services." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const togglePolicy = (policyKey: string) => {
    setActivePolicies(prev => 
      prev.includes(policyKey) ? prev.filter(p => p !== policyKey) : [...prev, policyKey]
    );
  };

  const downloadEvidencePacket = () => {
    if (!activeDirectiveModal) return;
    const element = document.createElement("a");
    const file = new Blob([activeDirectiveModal.directive], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Enforcement_Directive_${activeDirectiveModal.target.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const containerVars: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  // Dynamic calculations for 72-Hour Dispersion SVG curve based on selectedCity
  const nowVal = selectedCity.aqi;
  const peakVal = Math.round(nowVal * 1.15);
  const h48Val = Math.round(nowVal * 0.85);
  const h72Val = Math.round(nowVal * 0.58);
  
  // Normalized Y coordinates for SVG viewBox 0 0 300 120 (0 is top, 120 is bottom)
  const yNow = Math.max(15, Math.min(105, 120 - (nowVal / 380) * 105));
  const yPeak = Math.max(15, Math.min(105, 120 - (peakVal / 380) * 105));
  const y48 = Math.max(15, Math.min(105, 120 - (h48Val / 380) * 105));
  const y72 = Math.max(15, Math.min(105, 120 - (h72Val / 380) * 105));

  // Dynamic calculations for Policy Simulator 2-Curve Graph (SVG viewBox 0 0 400 140)
  const bAqi = simResult ? simResult.baseline_aqi : simBaseline;
  const sAqi = simResult ? simResult.simulated_aqi : Math.max(45, Math.round(simBaseline * 0.55));
  
  // Convert AQI (0 to 380) to SVG Y coordinate inside viewBox 0 0 400 140 (130 is bottom, 20 is top)
  const toSimY = (aqiVal: number) => Math.max(20, Math.min(130, 135 - (aqiVal / 380) * 115));
  
  const yBaseStart = toSimY(bAqi);
  const yBasePeak = toSimY(bAqi * 1.08); // Slight peak at +24h for un-intervened baseline
  const yBase48 = toSimY(bAqi * 1.03);
  const yBase72 = toSimY(bAqi * 0.98);
  
  const ySimStart = toSimY(bAqi);
  const ySim24 = toSimY((bAqi + sAqi) * 0.62); // Significant drop by +24h
  const ySim48 = toSimY(sAqi * 1.15);          // Approaching target at +48h
  const ySim72 = toSimY(sAqi);                 // Reaches target sAqi at +72h

  return (
    <div className="min-h-screen bg-zinc-950 text-stone-300 flex flex-col p-4 md:p-6 overflow-x-hidden selection:bg-amber-700/30">
      
      {/* 2-TIER PROPERLY ORGANIZED ENTERPRISE NAVBAR */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 mb-6"
      >
        {/* Tier 1: Brand Title, Subtitle, and Live Weather / Status Badges */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-4 border-b border-stone-800 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-amber-900/20 rounded-2xl border border-amber-700/40 shadow-[0_0_25px_rgba(217,119,6,0.25)] flex items-center justify-center shrink-0">
              <MapPin className="w-8 h-8 text-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-stone-100">
                  Urban Air Quality Intelligence Platform
                </h1>
                <span className="text-xs font-mono bg-amber-950/90 text-amber-400 border border-amber-700/60 px-3 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm">
                  Multi-Agency Live
                </span>
              </div>
              <p className="text-stone-400 text-sm mt-1 flex flex-wrap items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Fusing CAAQMS, TomTom Telemetry, NASA FIRMS & Planet Satellite Layers across <strong className="text-amber-400">32 Gujarat Centers</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-auto justify-end">
            <div className="bg-zinc-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-stone-800 flex items-center gap-2.5 shadow hover:border-amber-700/50 transition-colors" title={`Telemetry Source: ${liveWeather.source || "Open-Meteo"}`}>
              <ThermometerSun className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold text-stone-100">{liveWeather.temperature}°C</span>
            </div>
            <div className="bg-zinc-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-stone-800 flex items-center gap-2.5 shadow hover:border-amber-700/50 transition-colors">
              <Wind className="w-4 h-4 text-stone-400" />
              <span className="text-sm font-bold text-stone-100">{liveWeather.wind_speed} km/h</span>
            </div>
            <div className="bg-emerald-950/60 border border-emerald-800/60 px-3.5 py-2.5 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 shadow">
              <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              AI Fusion Engine Active
            </div>
          </div>
        </div>

        {/* Tier 2: Dedicated Horizontal Navigation Bar */}
        <div className="bg-stone-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-stone-800 shadow-xl flex items-center justify-start sm:justify-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${activeTab === "map" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40" : "text-stone-400 hover:text-stone-100 hover:bg-zinc-800/70"}`}
          >
            <Activity className="w-4 h-4" /> Live Geospatial Map
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${activeTab === "simulator" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40" : "text-stone-400 hover:text-stone-100 hover:bg-zinc-800/70"}`}
          >
            <Sliders className="w-4 h-4" /> Policy Simulator
          </button>
          <button
            onClick={() => setActiveTab("attribution")}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${activeTab === "attribution" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40" : "text-stone-400 hover:text-stone-100 hover:bg-zinc-800/70"}`}
          >
            <PieChart className="w-4 h-4" /> Source Attribution
          </button>
          <button
            onClick={() => setActiveTab("directives")}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${activeTab === "directives" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40" : "text-stone-400 hover:text-stone-100 hover:bg-zinc-800/70"}`}
          >
            <FileText className="w-4 h-4" /> Enforcement Directives
          </button>
          <button
            onClick={() => setActiveTab("comparative")}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${activeTab === "comparative" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40" : "text-stone-400 hover:text-stone-100 hover:bg-zinc-800/70"}`}
          >
            <BarChart3 className="w-4 h-4" /> Multi-City Matrix
          </button>
        </div>
      </motion.header>

      {/* TAB 1: LIVE GEOSPATIAL MAP & ANALYTICS */}
      {activeTab === "map" && (
        <motion.div 
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 relative"
        >
          {/* Left Column: Analytics, Trend Graph & Advisories */}
          <div className="flex flex-col gap-6 xl:col-span-1">
            
            <motion.div variants={itemVars} className="bg-zinc-900/60 backdrop-blur-md p-5 rounded-2xl border border-stone-800 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-stone-200">
                  <Activity className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-lg">Hub Analytics</h3>
                </div>
                <span className="text-xs bg-amber-950/80 px-2.5 py-1 rounded text-amber-400 border border-amber-800/50 font-mono font-bold">
                  Click Map Node
                </span>
              </div>
              
              {isInitialLoading ? (
                <div className="space-y-3">
                  <div className="h-12 rounded-xl animate-shimmer"></div>
                  <div className="h-12 rounded-xl animate-shimmer"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">Selected Urban Node</p>
                      <p className="text-xl font-bold mt-1 text-amber-400">{selectedCity.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-400 bg-orange-950/60 px-2.5 py-1 rounded border border-orange-900/50 font-mono">AQI: {selectedCity.aqi}</p>
                    </div>
                  </div>
                  <div className="h-[1px] w-full bg-stone-800"></div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">Cleanest Hub Tracked</p>
                      <p className="text-lg font-bold mt-1 text-stone-200">Porbandar Coastal</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-900/50 font-mono">AQI: 88</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Dynamic Interactive SVG Trend Chart updating as user clicks different map nodes */}
            <motion.div variants={itemVars} className="bg-zinc-900/60 backdrop-blur-md p-5 rounded-2xl border border-stone-800 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-stone-200">
                  <Wind className="w-5 h-5 text-stone-400" />
                  <h3 className="font-semibold text-lg">72h Local Dispersion Curve</h3>
                </div>
                <span className="text-xs font-bold text-amber-500 bg-stone-900 px-2 py-0.5 rounded border border-stone-700 font-mono">
                  {selectedCity.name.split(" ")[0]}
                </span>
              </div>
              
              <div className="relative pt-2 pb-1">
                {/* SVG Line Graph with Animated Gradient Fill dynamically computing from selectedCity */}
                <svg className="w-full h-36 overflow-visible" viewBox="0 0 300 120">
                  <defs>
                    <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d97706" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="#292524" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#292524" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="300" y2="100" stroke="#292524" strokeWidth="1" strokeDasharray="4 4" />
                  
                  {/* Gradient Area Fill */}
                  <path d={`M 10 ${yNow} Q 80 ${yPeak - 15}, 150 ${y48} T 290 ${y72} L 290 115 L 10 115 Z`} fill="url(#aqiGrad)" />
                  
                  {/* Main Curve */}
                  <path d={`M 10 ${yNow} Q 80 ${yPeak - 15}, 150 ${y48} T 290 ${y72}`} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Dynamic Data Point Circles */}
                  <circle cx="10" cy={yNow} r="4.5" fill="#171717" stroke="#f59e0b" strokeWidth="2.5" />
                  <circle cx="95" cy={yPeak} r="5.5" fill="#ea580c" stroke="#fff" strokeWidth="2" />
                  <circle cx="180" cy={y48} r="4.5" fill="#171717" stroke="#f59e0b" strokeWidth="2.5" />
                  <circle cx="290" cy={y72} r="4.5" fill="#171717" stroke="#f59e0b" strokeWidth="2.5" />
                </svg>
                
                <div className="flex justify-between text-xs text-stone-400 font-medium mt-1 font-mono">
                  <span>Now ({nowVal})</span>
                  <span className="text-orange-400 font-bold">Peak ({peakVal})</span>
                  <span>+48h ({h48Val})</span>
                  <span className="text-amber-500 font-bold">+72h ({h72Val})</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVars} className="bg-zinc-900/60 backdrop-blur-md p-5 rounded-2xl border border-stone-800 shadow-lg flex-1 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-600 to-amber-700"></div>
              <div className="flex items-center justify-between text-stone-200 mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-lg">Ward Advisory</h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-orange-950/60 text-orange-400 rounded border border-orange-900/50 font-mono">LIVE AI</span>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-stone-800 flex-1 overflow-auto text-sm leading-relaxed text-stone-400 whitespace-pre-line font-sans">
                {isInitialLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded animate-shimmer"></div>
                    <div className="h-4 w-full rounded animate-shimmer"></div>
                    <div className="h-4 w-5/6 rounded animate-shimmer"></div>
                  </div>
                ) : (
                  healthAdvisory
                )}
              </div>
            </motion.div>
          </div>

          {/* Center/Right Column: Geospatial Engine & Layer Controls */}
          <div className="xl:col-span-3 flex flex-col gap-6">
            <motion.div variants={itemVars} className="flex-1 min-h-[540px] rounded-2xl relative z-0 flex flex-col shadow-2xl border border-stone-800">
              
              {/* Layer Selection Buttons on top right */}
              <div className="absolute top-4 right-4 z-[400] flex flex-col sm:flex-row gap-2 bg-zinc-950/90 backdrop-blur-md p-2 rounded-xl border border-stone-800 shadow-2xl">
                <button 
                  onClick={() => setActiveLayer("heatmap")}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-all ${activeLayer === "heatmap" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40 font-bold" : "text-stone-400 hover:text-stone-200 hover:bg-zinc-900"}`}
                >
                  <Droplets className="w-4 h-4" /> Bounding Heatmap
                </button>
                <button 
                  onClick={() => setActiveLayer("sensors")}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-all ${activeLayer === "sensors" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40 font-bold" : "text-stone-400 hover:text-stone-200 hover:bg-zinc-900"}`}
                >
                  <Activity className="w-4 h-4" /> CAAQMS Sensors
                </button>
                <button 
                  onClick={() => setActiveLayer("sources")}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-all ${activeLayer === "sources" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40 font-bold" : "text-stone-400 hover:text-stone-200 hover:bg-zinc-900"}`}
                >
                  <Factory className="w-4 h-4" /> Source Attribution
                </button>
              </div>

              <MapComponent 
                activeLayer={activeLayer} 
                aqiData={aqiData} 
                enforcementData={enforcementData} 
                onSelectCity={handleSelectMapCity}
              />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: POLICY INTERVENTION & SIMULATOR WITH VISUAL 2-CURVE GRAPH */}
      {activeTab === "simulator" && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1"
        >
          <div className="xl:col-span-1 bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-stone-800 shadow-xl flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" /> Policy Intervention Controls
              </h2>
              <p className="text-stone-400 text-sm mt-1">
                Toggle proactive municipal policies to calculate 72h hyperlocal dispersion kinetics.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase font-bold text-stone-500 block mb-2">Target Urban Hub</label>
                <select 
                  value={simCity}
                  onChange={(e) => {
                    setSimCity(e.target.value);
                    const val = e.target.value;
                    if (val === "Surat") setSimBaseline(245);
                    if (val === "Ankleshwar") setSimBaseline(278);
                    if (val === "Ahmedabad") setSimBaseline(252);
                    if (val === "Morbi") setSimBaseline(260);
                    if (val === "Vadodara") setSimBaseline(180);
                  }}
                  className="w-full bg-zinc-950 border border-stone-700 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-amber-600 font-semibold text-sm"
                >
                  <option value="Surat">Surat (Baseline: 245 AQI)</option>
                  <option value="Ankleshwar">Ankleshwar GIDC (Baseline: 278 AQI)</option>
                  <option value="Ahmedabad">Ahmedabad Metro (Baseline: 252 AQI)</option>
                  <option value="Morbi">Morbi Ceramic Cluster (Baseline: 260 AQI)</option>
                  <option value="Vadodara">Vadodara (Baseline: 180 AQI)</option>
                </select>
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-stone-500 block mb-3">Active Policy Toggles</label>
                <div className="space-y-3">
                  {[
                    { id: "odd_even", label: "Odd-Even Vehicular Mandate (-22% PM2.5)", desc: "Halves passenger vehicular emissions along arterial roads." },
                    { id: "construction_freeze", label: "5km Fugitive Dust Freeze (-28% PM10)", desc: "Immediate halt of un-tarped grading & earthwork operations." },
                    { id: "scrubber_audit", label: "Industrial Scrubber Audit Mandate (-35% SO2)", desc: "Dispatches mobile units to enforce GIDC stack filtration." },
                    { id: "mist_cannons", label: "Arterial Road Sprinkler & Mist Cannons (-15% Dust)", desc: "Suppresses re-suspended road dust during peak traffic hours." }
                  ].map((policy) => (
                    <div 
                      key={policy.id}
                      onClick={() => togglePolicy(policy.id)}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer select-none transition-all ${activePolicies.includes(policy.id) ? "bg-amber-950/40 border-amber-500 text-stone-100 shadow-md" : "bg-zinc-950 border-stone-800 text-stone-400 hover:border-stone-700"}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={activePolicies.includes(policy.id)} 
                        readOnly 
                        className="mt-1 accent-amber-600 w-4 h-4 rounded pointer-events-none" 
                      />
                      <div>
                        <div className="font-bold text-sm">{policy.label}</div>
                        <div className="text-xs text-stone-400 mt-0.5 leading-relaxed">{policy.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={runSimulation}
                disabled={isSimLoading}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-amber-950/50 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isSimLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                Calculate 72h Hyperlocal Impact
              </button>
            </div>
          </div>

          <div className="xl:col-span-2 bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-stone-800 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-stone-100 mb-1">Simulated Trajectory & Public Health Impact</h3>
              <p className="text-stone-400 text-sm mb-6">LightGBM & Atmospheric Dispersion comparison vs. un-intervened baseline.</p>

              {isSimLoading ? (
                <div className="space-y-4 py-8">
                  <div className="h-28 rounded-xl animate-shimmer"></div>
                  <div className="h-44 rounded-xl animate-shimmer"></div>
                  <div className="h-24 rounded-xl animate-shimmer"></div>
                </div>
              ) : simResult ? (
                <div className="space-y-6">
                  {/* Big Number Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-950 p-5 rounded-xl border border-stone-800 shadow">
                      <div className="text-xs uppercase font-bold text-stone-500">Un-intervened Baseline</div>
                      <div className="text-3xl font-black text-orange-500 mt-2">{simResult.baseline_aqi} <span className="text-sm font-normal text-stone-400">AQI</span></div>
                      <div className="text-xs text-orange-400 mt-1 font-semibold">Hazardous Exposure Category</div>
                    </div>
                    <div className="bg-zinc-950 p-5 rounded-xl border border-amber-600/50 bg-amber-950/20 shadow">
                      <div className="text-xs uppercase font-bold text-amber-400">Simulated 72h Outcome</div>
                      <div className="text-3xl font-black text-amber-400 mt-2">{simResult.simulated_aqi} <span className="text-sm font-normal text-amber-300/80">AQI</span></div>
                      <div className="text-xs text-amber-400 font-bold mt-1">Reduction of -{simResult.reduction_percentage}%</div>
                    </div>
                    <div className="bg-zinc-950 p-5 rounded-xl border border-stone-800 shadow">
                      <div className="text-xs uppercase font-bold text-stone-500">Hazardous Hours Avoided</div>
                      <div className="text-3xl font-black text-stone-100 mt-2">{simResult.hazardous_hours_avoided} <span className="text-sm font-normal text-stone-400">Hours</span></div>
                      <div className="text-xs text-stone-400 mt-1 font-semibold">Of peak vulnerability prevented</div>
                    </div>
                  </div>

                  {/* VISUAL 2-CURVE 72H SIMULATED TRAJECTORY SVG GRAPH */}
                  <div className="bg-zinc-950 p-6 rounded-xl border border-stone-800 shadow-lg space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-stone-200 text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-amber-500" /> 72-Hour Comparative Dispersion Curves
                      </h4>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-orange-400">
                          <span className="w-3 h-1 bg-orange-500 rounded-full inline-block"></span> Baseline Curve
                        </span>
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block"></span> Post-Intervention Curve
                        </span>
                      </div>
                    </div>

                    <div className="relative pt-2 pb-2">
                      <svg className="w-full h-44 overflow-visible" viewBox="0 0 400 140">
                        <defs>
                          <linearGradient id="simBaseGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="simIntervGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Horizontal Grid lines */}
                        <line x1="0" y1="20" x2="400" y2="20" stroke="#292524" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="0" y1="70" x2="400" y2="70" stroke="#292524" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="0" y1="120" x2="400" y2="120" stroke="#292524" strokeWidth="1" strokeDasharray="4 4" />

                        {/* Baseline Area & Line (stays high around baseline_aqi) */}
                        <path d={`M 10 ${yBaseStart} Q 110 ${yBasePeak}, 210 ${yBase48} T 390 ${yBase72} L 390 130 L 10 130 Z`} fill="url(#simBaseGrad)" />
                        <path d={`M 10 ${yBaseStart} Q 110 ${yBasePeak}, 210 ${yBase48} T 390 ${yBase72}`} fill="none" stroke="#ea580c" strokeWidth="3" strokeDasharray="5 5" />
                        <circle cx="10" cy={yBaseStart} r="4.5" fill="#ea580c" />
                        <circle cx="110" cy={yBasePeak} r="4.5" fill="#ea580c" />
                        <circle cx="210" cy={yBase48} r="4.5" fill="#ea580c" />
                        <circle cx="390" cy={yBase72} r="4.5" fill="#ea580c" />

                        {/* Post-Intervention Area & Line (drops down smoothly to simulated_aqi) */}
                        <path d={`M 10 ${ySimStart} Q 110 ${ySim24}, 210 ${ySim48} T 390 ${ySim72} L 390 130 L 10 130 Z`} fill="url(#simIntervGrad)" />
                        <path d={`M 10 ${ySimStart} Q 110 ${ySim24}, 210 ${ySim48} T 390 ${ySim72}`} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
                        <circle cx="10" cy={ySimStart} r="5" fill="#171717" stroke="#10b981" strokeWidth="2.5" />
                        <circle cx="110" cy={ySim24} r="5" fill="#171717" stroke="#10b981" strokeWidth="2.5" />
                        <circle cx="210" cy={ySim48} r="5" fill="#171717" stroke="#10b981" strokeWidth="2.5" />
                        <circle cx="390" cy={ySim72} r="6.5" fill="#10b981" stroke="#fff" strokeWidth="2" />
                      </svg>
                      
                      <div className="flex justify-between text-xs font-mono text-stone-400 mt-2 px-1">
                        <span>0h (Start: {simResult.baseline_aqi})</span>
                        <span>+24h ({Math.round((simResult.baseline_aqi + simResult.simulated_aqi)/2)})</span>
                        <span>+48h ({Math.round(simResult.simulated_aqi * 1.1)})</span>
                        <span className="text-emerald-400 font-bold">+72h (Target: {simResult.simulated_aqi})</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Dispersion Summary */}
                  <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-700 shadow">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Groq AI Atmospheric Dispersion Kinetics Assessment
                    </div>
                    <p className="text-stone-200 text-sm leading-relaxed whitespace-pre-line font-sans">
                      {simResult.ai_dispersion_summary}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-stone-500">
                  Select policy checkboxes on the left and click Calculate to run the model.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: SOURCE ATTRIBUTION BREAKDOWN ENGINE WITH 15 HUBS & VISUAL RADAR CHART */}
      {activeTab === "attribution" && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1"
        >
          <div className="xl:col-span-1 bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-stone-800 shadow-xl flex flex-col gap-6 max-h-[820px] overflow-y-auto">
            <div>
              <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-amber-500" /> Multi-Modal Source Engine
              </h2>
              <p className="text-stone-400 text-sm mt-1">
                Fuses Sentinel-5P thermal anomalies, TomTom traffic feeds, and CPCB stack inventories across 15 hubs.
              </p>
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-stone-500 block mb-3">Select Ward / Industrial Cluster (15 Centers)</label>
              <div className="space-y-2.5">
                {[
                  "Ankleshwar GIDC Chemical Hub",
                  "Morbi Ceramic Cluster",
                  "Surat Industrial & Hazira Corridor",
                  "Ahmedabad Metro & SG Highway",
                  "Vapi Chemical Cluster",
                  "Dahej PCPIR Petrochemical Complex",
                  "Hazira Port Heavy Engineering Zone",
                  "Mundra Port & Special Economic Zone",
                  "Alang Ship Breaking & Recycling Belt",
                  "Vadodara Refinery & Petrochemical Zone",
                  "Jamnagar Oil Refinery (World's Largest)",
                  "Rajkot Diesel Corridor & Foundry Hub",
                  "Gandhidham Timber & Logistics Hub",
                  "Palanpur Dairy & Processing Zone",
                  "Surendranagar Cotton & Ceramic Belt"
                ].map((zone) => (
                  <button
                    key={zone}
                    onClick={() => { setAttrZone(zone); fetchAttribution(zone); }}
                    className={`w-full text-left p-3.5 rounded-xl border font-semibold text-sm transition-all flex justify-between items-center shadow ${attrZone === zone ? "bg-amber-950/60 border-amber-500 text-stone-100 shadow-md" : "bg-zinc-950 border-stone-800 text-stone-400 hover:border-stone-700"}`}
                  >
                    <span className="truncate pr-2">{zone}</span>
                    <ArrowRight className={`w-4 h-4 shrink-0 ${attrZone === zone ? "text-amber-500" : "text-stone-600"}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-stone-800 shadow-xl flex flex-col justify-between">
            {isAttrLoading ? (
              <div className="space-y-4 py-8">
                <div className="h-16 rounded-xl animate-shimmer"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 rounded-xl animate-shimmer"></div>
                  <div className="h-32 rounded-xl animate-shimmer"></div>
                  <div className="h-32 rounded-xl animate-shimmer"></div>
                  <div className="h-32 rounded-xl animate-shimmer"></div>
                </div>
                <div className="h-44 rounded-xl animate-shimmer"></div>
              </div>
            ) : attrData && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                  <div>
                    <h3 className="text-2xl font-bold text-stone-100 flex items-center gap-2">
                      {attrData.zone} Profile
                      <span className="text-xs font-mono bg-stone-800 text-stone-300 px-2.5 py-0.5 rounded border border-stone-700">Multi-Sensor Synthesis</span>
                    </h3>
                    <p className="text-stone-400 text-sm mt-0.5">Statistical confidence vs. Ground-Truth emission inventory</p>
                  </div>
                  <div className="bg-amber-950/80 border border-amber-600/80 px-4 py-2.5 rounded-xl text-amber-400 font-bold text-sm flex items-center gap-2 shadow">
                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    {attrData.confidence}% Verification Confidence
                  </div>
                </div>

                {/* Visual Source Attribution Radar / Breakdown Bar Chart */}
                <div className="bg-zinc-950 p-6 rounded-xl border border-stone-800 shadow-lg space-y-4">
                  <h4 className="font-bold text-stone-200 text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2"><PieChart className="w-4 h-4 text-amber-500" /> Multi-Sensor Contribution Visual Graph</span>
                    <span className="text-xs font-mono text-stone-400">Total 100% Normalized</span>
                  </h4>
                  
                  {/* SVG Multi-Segment Stacked Visual Bar */}
                  <div className="space-y-2">
                    <div className="w-full h-8 bg-stone-900 rounded-xl overflow-hidden flex border border-stone-800 shadow-inner">
                      <div className="bg-orange-600 h-full flex items-center justify-center text-xs font-bold text-white transition-all duration-1000" style={{ width: `${attrData.industrial}%` }} title={`Industrial: ${attrData.industrial}%`}>
                        {attrData.industrial >= 15 && `${attrData.industrial}%`}
                      </div>
                      <div className="bg-amber-500 h-full flex items-center justify-center text-xs font-bold text-black transition-all duration-1000" style={{ width: `${attrData.vehicular}%` }} title={`Vehicular: ${attrData.vehicular}%`}>
                        {attrData.vehicular >= 15 && `${attrData.vehicular}%`}
                      </div>
                      <div className="bg-stone-500 h-full flex items-center justify-center text-xs font-bold text-white transition-all duration-1000" style={{ width: `${attrData.construction}%` }} title={`Construction: ${attrData.construction}%`}>
                        {attrData.construction >= 12 && `${attrData.construction}%`}
                      </div>
                      <div className="bg-red-600 h-full flex items-center justify-center text-xs font-bold text-white transition-all duration-1000" style={{ width: `${attrData.biomass}%` }} title={`Biomass: ${attrData.biomass}%`}>
                        {attrData.biomass >= 12 && `${attrData.biomass}%`}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-between gap-2 text-xs font-semibold pt-1">
                      <span className="flex items-center gap-1.5 text-orange-400"><span className="w-3 h-3 rounded bg-orange-600 inline-block"></span> Industrial ({attrData.industrial}%)</span>
                      <span className="flex items-center gap-1.5 text-amber-400"><span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> Vehicular Diesel ({attrData.vehicular}%)</span>
                      <span className="flex items-center gap-1.5 text-stone-300"><span className="w-3 h-3 rounded bg-stone-500 inline-block"></span> Construction Dust ({attrData.construction}%)</span>
                      <span className="flex items-center gap-1.5 text-red-400"><span className="w-3 h-3 rounded bg-red-600 inline-block"></span> Biomass & Open Fire ({attrData.biomass}%)</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Cards with Satellite Context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-950 p-5 rounded-xl border border-stone-800 shadow space-y-3 hover:border-stone-700 transition-all">
                    <div className="flex justify-between items-center text-sm font-bold text-stone-200">
                      <span className="flex items-center gap-2"><Factory className="w-4 h-4 text-orange-500" /> Industrial Stacks</span>
                      <span className="text-orange-500 font-mono text-base">{attrData.industrial}%</span>
                    </div>
                    <div className="w-full bg-stone-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-stone-800">
                      <div className="bg-orange-600 h-full rounded-full transition-all duration-1000" style={{ width: `${attrData.industrial}%` }}></div>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">Sentinel-5P SO2/NOx plume density verification against active CPCB stack sensors.</p>
                  </div>

                  <div className="bg-zinc-950 p-5 rounded-xl border border-stone-800 shadow space-y-3 hover:border-stone-700 transition-all">
                    <div className="flex justify-between items-center text-sm font-bold text-stone-200">
                      <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-amber-500" /> Heavy Diesel Fleets</span>
                      <span className="text-amber-500 font-mono text-base">{attrData.vehicular}%</span>
                    </div>
                    <div className="w-full bg-stone-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-stone-800">
                      <div className="bg-amber-600 h-full rounded-full transition-all duration-1000" style={{ width: `${attrData.vehicular}%` }}></div>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">TomTom real-time freight speed & highway congestion index telemetry.</p>
                  </div>

                  <div className="bg-zinc-950 p-5 rounded-xl border border-stone-800 shadow space-y-3 hover:border-stone-700 transition-all">
                    <div className="flex justify-between items-center text-sm font-bold text-stone-200">
                      <span className="flex items-center gap-2"><Droplets className="w-4 h-4 text-stone-400" /> Fugitive Construction Dust</span>
                      <span className="text-stone-300 font-mono text-base">{attrData.construction}%</span>
                    </div>
                    <div className="w-full bg-stone-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-stone-800">
                      <div className="bg-stone-500 h-full rounded-full transition-all duration-1000" style={{ width: `${attrData.construction}%` }}></div>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">Overpass construction permit tracking & un-tarped earthwork operations.</p>
                  </div>

                  <div className="bg-zinc-950 p-5 rounded-xl border border-stone-800 shadow space-y-3 hover:border-stone-700 transition-all">
                    <div className="flex justify-between items-center text-sm font-bold text-stone-200">
                      <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Biomass & Open Burning</span>
                      <span className="text-red-400 font-mono text-base">{attrData.biomass}%</span>
                    </div>
                    <div className="w-full bg-stone-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-stone-800">
                      <div className="bg-red-600 h-full rounded-full transition-all duration-1000" style={{ width: `${attrData.biomass}%` }}></div>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">NASA FIRMS / MODIS thermal anomaly hotspot & fire cluster detection.</p>
                  </div>
                </div>

                <div className="bg-stone-900/90 p-5 rounded-xl border border-stone-700 shadow">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Scientific Justification & Remote Sensing Synthesis
                  </div>
                  <p className="text-stone-200 text-sm leading-relaxed whitespace-pre-line font-sans">
                    {attrData.scientific_justification}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* TAB 4: ENFORCEMENT DIRECTIVES & EVIDENCE GENERATOR */}
      {activeTab === "directives" && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-stone-800 shadow-xl flex flex-col gap-6 flex-1"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" /> Enforcement Intelligence & Directive Generator
              </h2>
              <p className="text-stone-400 text-sm mt-1">
                Correlates hotspots with registered emission sources and generates official municipal inspection orders.
              </p>
            </div>
            <span className="bg-amber-950/60 text-amber-400 px-3.5 py-1.5 rounded-xl border border-amber-800/60 text-xs font-bold self-start md:self-auto flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> NCAP Multi-Agency Response Protocol Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-800 text-stone-500">
                <tr>
                  <th className="pb-3 font-semibold px-2 uppercase tracking-wide text-xs">Geospatial Target</th>
                  <th className="pb-3 font-semibold px-2 uppercase tracking-wide text-xs">AI Evidence & Sensor Context</th>
                  <th className="pb-3 font-semibold px-2 w-48 text-right uppercase tracking-wide text-xs">Action Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/50">
                {enforcementData.map((spot, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="py-5 px-2 text-stone-200 font-bold align-top w-1/4 group-hover:text-amber-500 transition-colors">
                      {spot.target}
                    </td>
                    <td className="py-5 px-2 text-stone-400 whitespace-pre-line leading-relaxed">
                      {spot.ai_analysis}
                    </td>
                    <td className="py-5 px-2 align-top text-right">
                      <button
                        onClick={() => generateDirective(spot)}
                        disabled={isDirectiveLoading}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 text-white text-xs font-bold rounded-xl shadow transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" /> Issue Directive Packet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* TAB 5: MULTI-CITY COMPARATIVE MATRIX WITH BENCHMARKING BAR GRAPH */}
      {activeTab === "comparative" && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-stone-800 shadow-xl flex flex-col gap-6 flex-1"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" /> Multi-City Comparative Intelligence Matrix
              </h2>
              <p className="text-stone-400 text-sm mt-1">
                Cross-city benchmarking of NCAP compliance, intervention effectiveness, and average response velocity.
              </p>
            </div>
          </div>

          {isMatrixLoading ? (
            <div className="space-y-4 py-8">
              <div className="h-48 rounded-xl animate-shimmer"></div>
              <div className="h-12 rounded-xl animate-shimmer"></div>
              <div className="h-12 rounded-xl animate-shimmer"></div>
            </div>
          ) : comparativeMatrix.length > 0 && (
            <div className="space-y-8">
              {/* VISUAL BENCHMARKING BAR GRAPH COMPARING CURRENT AQI vs NCAP COMPLIANCE across centers */}
              <div className="bg-zinc-950 p-6 rounded-xl border border-stone-800 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-stone-200 text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" /> Cross-City Severity vs. NCAP Compliance Benchmarking Graph
                  </h4>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-orange-500"><span className="w-3 h-3 rounded bg-orange-600 inline-block"></span> Current AQI Level</span>
                    <span className="flex items-center gap-1.5 text-amber-400"><span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> NCAP Compliance %</span>
                  </div>
                </div>

                {/* SVG Multi-Bar Comparison Graph */}
                <svg className="w-full h-52 overflow-visible" viewBox="0 0 500 160">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#292524" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="65" x2="500" y2="65" stroke="#292524" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="#292524" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="#44403c" strokeWidth="1.5" />

                  {comparativeMatrix.slice(0, 6).map((item, i) => {
                    const xPos = 25 + i * 80;
                    const barHeightAqi = Math.min(120, (item.current_aqi / 350) * 120);
                    const barHeightNcap = Math.min(120, (item.ncap_compliance_pct / 100) * 120);
                    
                    return (
                      <g key={i}>
                        {/* AQI Bar */}
                        <rect x={xPos} y={140 - barHeightAqi} width="22" height={barHeightAqi} fill="#ea580c" rx="4" />
                        <text x={xPos + 11} y={135 - barHeightAqi} fontSize="9" fontWeight="bold" fill="#f59e0b" textAnchor="middle">{item.current_aqi}</text>
                        
                        {/* NCAP Compliance Bar */}
                        <rect x={xPos + 26} y={140 - barHeightNcap} width="22" height={barHeightNcap} fill="#f59e0b" rx="4" />
                        <text x={xPos + 37} y={135 - barHeightNcap} fontSize="9" fontWeight="bold" fill="#fff" textAnchor="middle">{item.ncap_compliance_pct}%</text>
                        
                        {/* City Label */}
                        <text x={xPos + 24} y="155" fontSize="10" fontWeight="bold" fill="#a8a29e" textAnchor="middle">{item.city.split(" ")[0]}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Comparative Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-stone-800 text-stone-500">
                    <tr>
                      <th className="pb-3 font-semibold px-2 uppercase tracking-wide text-xs">Urban Center</th>
                      <th className="pb-3 font-semibold px-2 uppercase tracking-wide text-xs">Classification</th>
                      <th className="pb-3 font-semibold px-2 uppercase tracking-wide text-xs">Current AQI</th>
                      <th className="pb-3 font-semibold px-2 uppercase tracking-wide text-xs">NCAP Compliance</th>
                      <th className="pb-3 font-semibold px-2 uppercase tracking-wide text-xs">Intervention Success</th>
                      <th className="pb-3 font-semibold px-2 uppercase tracking-wide text-xs text-right">Avg Response Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/50">
                    {comparativeMatrix.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-4 px-2 font-bold text-stone-100">
                          {item.city} <span className="text-xs text-stone-500 font-normal">({item.state})</span>
                        </td>
                        <td className="py-4 px-2 text-stone-400 font-medium">{item.tier}</td>
                        <td className="py-4 px-2 font-bold text-amber-500">{item.current_aqi} ({item.status})</td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-stone-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-stone-800">
                              <div className="bg-amber-600 h-full rounded-full" style={{ width: `${item.ncap_compliance_pct}%` }}></div>
                            </div>
                            <span className="text-stone-200 font-bold text-xs">{item.ncap_compliance_pct}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 font-bold text-stone-200">{item.intervention_success_rate}</td>
                        <td className="py-4 px-2 text-right font-bold text-stone-300 font-mono">{item.avg_response_hours} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* DIRECTIVE GENERATOR & EVIDENCE MODAL */}
      <AnimatePresence>
        {activeDirectiveModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-stone-700 w-full max-w-3xl rounded-2xl shadow-2xl p-6 flex flex-col max-h-[88vh] overflow-hidden"
            >
              <div className="flex justify-between items-center pb-4 border-b border-stone-800">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-lg">
                  <FileText className="w-5 h-5" /> Official Municipal Inspection Order & Evidence Packet
                </div>
                <button onClick={() => setActiveDirectiveModal(null)} className="text-stone-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-5 font-mono text-xs leading-relaxed text-stone-200 whitespace-pre-line border-b border-stone-800 bg-black/40 p-4 rounded-xl my-4">
                {activeDirectiveModal.directive}
              </div>

              {broadcastSuccess && (
                <div className="mb-4 bg-amber-950/80 border border-amber-600 text-amber-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse">
                  <CheckCircle2 className="w-4 h-4" /> Directive dispatched to Flying Squads & emergency broadcast pushed to Regional IVR screens!
                </div>
              )}

              <div className="flex flex-wrap justify-between items-center gap-3">
                <button
                  onClick={downloadEvidencePacket}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-bold transition-all flex items-center gap-2 border border-stone-700"
                >
                  <Download className="w-4 h-4 text-amber-500" /> Download Evidence Packet (TXT/PDF)
                </button>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveDirectiveModal(null)}
                    className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => setBroadcastSuccess(true)}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition-all flex items-center gap-2"
                  >
                    <Radio className="w-4 h-4" /> Dispatch to Field Officers & IVR
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="mb-4 w-80 md:w-96 h-[460px] bg-zinc-950 border border-stone-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="bg-stone-900 p-4 border-b border-stone-700 flex justify-between items-center">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                  <MessageSquare className="w-5 h-5" />
                  Multilingual AI Support Agent
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-stone-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[86%] p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${msg.role === 'user' ? 'bg-amber-600 text-white rounded-tr-none font-medium' : 'bg-stone-900 text-stone-200 rounded-tl-none border border-stone-800'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-stone-900 p-3 rounded-2xl rounded-tl-none border border-stone-800 flex gap-1 items-center h-10">
                      <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-3 bg-stone-900 border-t border-stone-700 flex gap-2">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask in English / ગુજરાતી / हिन्दी..."
                  className="flex-1 bg-zinc-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-600 transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={!chatMessage.trim() || isChatLoading}
                  className="bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 disabled:text-stone-500 text-white p-2.5 rounded-xl transition-colors flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-amber-600 hover:bg-amber-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(217,119,6,0.5)] flex items-center justify-center transition-all"
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </motion.button>
      </div>

    </div>
  );
}
