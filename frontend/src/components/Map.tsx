"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";
import { Layers } from "lucide-react";

// Gujarat Bounds
const GUJARAT_BOUNDS: L.LatLngBoundsExpression = [
  [20.0, 68.0], // South-West (Arabian Sea edge)
  [25.0, 75.0]  // North-East (Rajasthan/MP border)
];

const center = [22.2587, 71.1924];

// Comprehensive Dictionary of Coordinates for 32 Gujarat Cities & Industrial Clusters
const CITY_COORDS: Record<string, [number, number]> = {
  "Ahmedabad": [23.0225, 72.5714],
  "Surat": [21.1702, 72.8311],
  "Vadodara": [22.3072, 73.1812],
  "Rajkot": [22.3039, 70.8022],
  "Bhavnagar": [21.7645, 72.1519],
  "Jamnagar": [22.4707, 70.0577],
  "Gandhinagar": [23.2156, 72.6369],
  "Junagadh": [21.5222, 70.4579],
  "Anand": [22.5645, 72.9289],
  "Navsari": [20.9467, 72.9520],
  "Morbi": [22.812, 70.832],
  "Bharuch": [21.7051, 72.9959],
  "Vapi": [20.3893, 72.9106],
  "Bhuj": [23.242, 69.6669],
  "Porbandar": [21.6417, 69.6293],
  "Palanpur": [24.1724, 72.4346],
  "Godhra": [22.7739, 73.6146],
  "Patan": [23.8493, 72.1266],
  "Dahod": [22.8323, 74.2568],
  "Ankleshwar GIDC": [21.6264, 73.0152],
  "Alang Ship Breaking Yard": [21.4124, 72.2036],
  "Dahej PCPIR": [21.7107, 72.5786],
  "Hazira Port": [21.0967, 72.6346],
  "Mundra Port": [22.8389, 69.7018],
  "Gandhidham": [23.0753, 70.1337],
  "Veraval": [20.9159, 70.3629],
  "Surendranagar": [22.7276, 71.6373],
  "Kalol": [23.2450, 72.4960],
  "Kadi": [23.3005, 72.3336],
  "Deesa": [24.2588, 72.1901],
  "Amreli": [21.6033, 71.2221],
  "Botad": [22.1690, 71.6664],
};

export default function GujaratMap({ 
  activeLayer, 
  aqiData, 
  enforcementData,
  onSelectCity 
}: { 
  activeLayer: string, 
  aqiData: any[], 
  enforcementData: any[],
  onSelectCity?: (city: string, aqi: number) => void 
}) {
  const [isSatellite, setIsSatellite] = useState(true);

  // Custom pulsing divIcon for markers
  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: "custom-leaflet-icon",
      html: `
        <div style="
          width: 16px; 
          height: 16px; 
          background-color: ${color}; 
          border-radius: 50%; 
          border: 2px solid white;
          box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
        "></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  // Helper to determine color based on AQI (Bronze/Amber theme)
  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return "#78716c"; // Stone-500 (Base)
    if (aqi <= 100) return "#b45309"; // Amber-700
    if (aqi <= 200) return "#d97706"; // Amber-600
    if (aqi <= 300) return "#ea580c"; // Orange-600
    return "#9a3412"; // Orange-800
  };

  // Full Gujarat Heatmap Points
  const heatmapPoints = Object.entries(CITY_COORDS).map(([name, coords]) => {
    // Determine deterministic varied AQI for each hub
    let baseAqi = 110 + ((name.length * 13) % 80);
    if (["Vapi", "Morbi", "Bharuch", "Surat", "Ahmedabad", "Ankleshwar GIDC", "Hazira Port", "Dahej PCPIR"].includes(name)) {
      baseAqi += 110 + ((name.length * 7) % 60);
    }
    return {
      name,
      lat: coords[0],
      lon: coords[1],
      aqi: baseAqi
    };
  });

  // Helper to resolve coordinates
  const resolveCoordinates = (targetStr: string): [number, number] => {
    for (const [key, coords] of Object.entries(CITY_COORDS)) {
      if (targetStr.includes(key)) {
        return coords;
      }
    }
    return [23.0225, 72.5714]; // Fallback to Ahmedabad
  };

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative z-0 bg-slate-950">
      
      {/* Map Style Toggle Button */}
      <button 
        onClick={() => setIsSatellite(!isSatellite)}
        className="absolute bottom-4 left-4 z-[400] bg-zinc-900/90 backdrop-blur-md p-2.5 px-4 rounded-xl border border-stone-700 shadow-xl flex items-center gap-2 text-sm text-stone-200 font-semibold hover:text-amber-500 hover:border-amber-600 transition-all"
      >
        <Layers className="w-4 h-4 text-amber-500" />
        {isSatellite ? "Switch to Dark Map" : "Switch to Satellite + Labels"}
      </button>

      <MapContainer 
        center={center as [number, number]} 
        zoom={7} 
        minZoom={7} 
        maxZoom={12} 
        maxBounds={GUJARAT_BOUNDS} 
        maxBoundsViscosity={1.0} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution={isSatellite ? '&copy; <a href="https://www.esri.com/">Esri</a>' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
          url={isSatellite 
            ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
            : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          }
        />

        {/* When in Satellite Mode, add hybrid reference labels layer so cities and borders are crystal clear! */}
        {isSatellite && (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri Labels</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {/* Heatmap Layer */}
        {activeLayer === "heatmap" && heatmapPoints.map((pt, i) => (
          <Circle 
            key={i}
            center={[pt.lat, pt.lon]} 
            radius={8000 + (pt.aqi * 85)} // Dynamic sizing
            eventHandlers={{
              click: () => onSelectCity && onSelectCity(pt.name, pt.aqi)
            }}
            pathOptions={{ 
              color: 'transparent', 
              fillColor: getAqiColor(pt.aqi), 
              fillOpacity: 0.5 
            }}
          >
            
            <Popup className="bg-[#09090b] text-[#f5f5f4] border border-amber-600/40 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-1 font-sans text-stone-100 bg-[#09090b]">
                <div className="font-bold text-amber-500 text-base">{pt.name} Heatmap Node</div>
                <div className="mt-1.5 text-sm text-stone-300">
                  Baseline AQI Estimate: <span className="font-bold text-white bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/50">{pt.aqi}</span>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Enforcement / Pollution Sources Layer */}
        {activeLayer === "sources" && enforcementData.map((spot, i) => {
           const [lat, lon] = resolveCoordinates(spot.target);
           
           return (
             <Marker 
               key={i} 
               position={[lat + (Math.random() * 0.05), lon + (Math.random() * 0.05)]} 
               icon={createCustomIcon("#ea580c")} 
               eventHandlers={{
                 click: () => onSelectCity && onSelectCity(spot.target, 260)
               }}
             >
                <Popup className="bg-[#09090b] text-[#f5f5f4] border border-amber-600/40 rounded-xl max-w-xs shadow-2xl">
                  <div className="text-stone-100 font-sans text-sm p-1 bg-[#09090b]">
                    <div className="font-bold text-amber-500 text-base">Enforcement Target</div> 
                    <div className="mt-1 font-semibold text-stone-200">{spot.target}</div>
                    <div className="h-[1px] w-full bg-stone-800 my-2.5"></div>
                    <div className="text-xs uppercase font-bold text-stone-400 mb-1">AI Analysis & Directive:</div> 
                    <p className="text-stone-300 leading-relaxed text-xs">{spot.ai_analysis}</p>
                  </div>
                </Popup>
             </Marker>
           );
        })}

        {/* Live CAAQMS Sensor Layer */}
        {activeLayer === "sensors" && aqiData.map((data, i) => {
           const [lat, lon] = resolveCoordinates(data.city);
           const color = getAqiColor(data.aqi);

           return (
             <Marker 
                key={i} 
                position={[lat, lon]}
                icon={createCustomIcon(color)}
                eventHandlers={{
                  click: () => onSelectCity && onSelectCity(data.city, data.aqi)
                }}
              >
               <Popup className="bg-[#09090b] text-[#f5f5f4] border border-amber-600/40 rounded-xl shadow-2xl">
                 <div className="text-stone-100 font-sans p-1 bg-[#09090b]">
                   <div className="font-bold text-amber-500 text-lg flex items-center justify-between">
                     <span>{data.city} CAAQMS</span>
                     <span className="text-xs bg-amber-950 px-2 py-0.5 rounded text-amber-400 border border-amber-800/60 font-mono">LIVE</span>
                   </div>
                   <div className="flex flex-col gap-1.5 mt-2.5 text-sm">
                     <div className="bg-stone-900/90 px-3 py-1.5 rounded-lg border border-stone-800 flex justify-between">
                       <span className="text-stone-400">AQI Rating:</span> 
                       <strong style={{color}} className="text-base">{data.aqi}</strong>
                     </div>
                     <div className="bg-stone-900/90 px-3 py-1.5 rounded-lg border border-stone-800 flex justify-between">
                       <span className="text-stone-400">PM2.5:</span> 
                       <strong className="text-stone-200">{data.pm25?.toFixed(1)} µg/m³</strong>
                     </div>
                     <div className="bg-stone-900/90 px-3 py-1.5 rounded-lg border border-stone-800 flex justify-between">
                       <span className="text-stone-400">PM10:</span> 
                       <strong className="text-stone-200">{data.pm10?.toFixed(1)} µg/m³</strong>
                     </div>
                   </div>
                 </div>
               </Popup>
             </Marker>
           );
        })}
      </MapContainer>
    </div>
  );
}
