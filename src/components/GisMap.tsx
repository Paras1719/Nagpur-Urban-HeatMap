import { useRef, useEffect, useState } from 'react';
import type { FC } from 'react';
import L from 'leaflet';
import { NAGPUR_ZONES, NAGPUR_WATER_BODIES, NAGPUR_HOTSPOTS } from '../data/nagpurData';
import type { NMCZone, Hotspot } from '../data/nagpurData';

interface GisMapProps {
  selectedZoneId?: string | null;
  onSelectZone?: (zone: NMCZone | null) => void;
  selectedHotspotId?: string | null;
  onSelectHotspot?: (hotspot: Hotspot | null) => void;
  activeLayer?: 'LST' | 'UHI' | 'VEGETATION' | 'BUILTUP' | 'LANDCOVER' | 'NONE';
  activeYear?: number;
  opacity?: number;
  showHotspots?: boolean;
  showZones?: boolean;
  showWater?: boolean;
  className?: string;
  interactive?: boolean;
}

export const GisMap: FC<GisMapProps> = ({
  selectedZoneId = null,
  onSelectZone,
  selectedHotspotId = null,
  onSelectHotspot,
  activeLayer = 'LST',
  activeYear = 2024,
  opacity = 0.75,
  showHotspots = true,
  showZones = true,
  showWater = true,
  className = '',
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Local state for interactive layer toggles
  const [layerState, setLayerState] = useState({
    heat: activeLayer === 'LST' || activeLayer === 'UHI',
    zones: showZones,
    water: showWater,
    vegetation: activeLayer === 'VEGETATION',
    builtup: activeLayer === 'BUILTUP',
    hotspots: showHotspots,
  });

  // Thermal Color Scale (Cool Blue -> Mild Cyan -> Moderate Yellow -> Warm Orange -> Hot Red)
  const getThermalColor = (temp: number, yearOffset: number = 0): string => {
    const adjustedTemp = temp + yearOffset;
    const t = Math.max(0, Math.min(1, (adjustedTemp - 38) / 10.5));
    if (t < 0.25) return '#2563eb'; // Blue
    if (t < 0.5) return '#0ea5e9';  // Cyan
    if (t < 0.75) return '#eab308'; // Yellow
    if (t < 0.9) return '#f97316';  // Orange
    return '#ef4444';               // Red
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double initialization

    // Nagpur Center: Lat 21.1458, Lon 79.0882
    const map = L.map(mapContainerRef.current, {
      center: [21.1458, 79.0882],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean OpenStreetMap Light Tile Basemap
    const lightTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      opacity: 0.9,
    });
    lightTile.addTo(map);

    // Zoom Control Top Right
    L.control.zoom({ position: 'topright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Draw Layers on Map Update
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const yearDiff = activeYear - 2024;
    const yearOffset = yearDiff * 0.3;

    // 1. Heatmap Layer (Thermal Circles / Gradients)
    if (layerState.heat) {
      NAGPUR_ZONES.forEach((zone) => {
        const color = getThermalColor(zone.meanLst2024, yearOffset);
        const circle = L.circle([zone.center[1], zone.center[0]], {
          radius: (zone.areaKm2 / 20) * 1800,
          color: color,
          fillColor: color,
          fillOpacity: opacity * 0.55,
          stroke: true,
          weight: 1,
        });

        circle.bindTooltip(
          `<div class="font-sans text-xs p-1">
            <strong>ZONE ${zone.number}: ${zone.name.toUpperCase()}</strong><br/>
            Surface Temp: <strong style="color: ${color}">${(zone.meanLst2024 + yearOffset).toFixed(1)}°C</strong>
          </div>`,
          { sticky: true }
        );

        if (interactive && onSelectZone) {
          circle.on('click', () => onSelectZone(zone));
        }

        layerGroup.addLayer(circle);
      });
    }

    // 2. Vegetation Layer (NDVI green shade)
    if (layerState.vegetation) {
      NAGPUR_ZONES.forEach((zone) => {
        const circle = L.circle([zone.center[1], zone.center[0]], {
          radius: (zone.areaKm2 / 20) * 1600,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: Math.min(0.7, zone.ndvi * 1.8),
          stroke: false,
        });
        circle.bindTooltip(`NDVI: ${zone.ndvi.toFixed(2)} (${zone.vegetationPct.toFixed(1)}% Canopy)`);
        layerGroup.addLayer(circle);
      });
    }

    // 3. Built-up Layer (NDBI amber shade)
    if (layerState.builtup) {
      NAGPUR_ZONES.forEach((zone) => {
        const circle = L.circle([zone.center[1], zone.center[0]], {
          radius: (zone.areaKm2 / 20) * 1600,
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: Math.min(0.7, (zone.builtUpPct / 100) * 0.75),
          stroke: false,
        });
        circle.bindTooltip(`Built-Up: ${zone.builtUpPct.toFixed(1)}% (NDBI ${zone.ndbi.toFixed(2)})`);
        layerGroup.addLayer(circle);
      });
    }

    // 4. Water Bodies Layer
    if (layerState.water) {
      NAGPUR_WATER_BODIES.forEach((wb) => {
        const latLons: [number, number][] = wb.polygon.map((p) => [p[1], p[0]]);
        const polygon = L.polygon(latLons, {
          color: '#0284c7',
          fillColor: '#38bdf8',
          fillOpacity: 0.6,
          weight: 1.5,
        });
        polygon.bindTooltip(`<strong>${wb.name}</strong> (${wb.areaKm2} km²)`, { sticky: true });
        layerGroup.addLayer(polygon);
      });
    }

    // 5. Zone Boundaries Layer
    if (layerState.zones) {
      NAGPUR_ZONES.forEach((zone) => {
        const latLons: [number, number][] = zone.polygon.map((p) => [p[1], p[0]]);
        const isSelected = selectedZoneId === zone.id;

        const polygon = L.polygon(latLons, {
          color: isSelected ? '#2563EB' : '#64748B',
          fillColor: isSelected ? '#2563EB' : 'transparent',
          fillOpacity: isSelected ? 0.15 : 0.02,
          weight: isSelected ? 3 : 1.5,
          dashArray: isSelected ? undefined : '4, 4',
        });

        polygon.bindTooltip(
          `<div><strong>ZONE ${zone.number}: ${zone.name}</strong><br/>${zone.meanLst2024.toFixed(1)}°C</div>`,
          { sticky: true }
        );

        if (interactive && onSelectZone) {
          polygon.on('click', () => onSelectZone(zone));
        }

        layerGroup.addLayer(polygon);
      });
    }

    // 6. Hotspots Markers Layer
    if (layerState.hotspots) {
      NAGPUR_HOTSPOTS.forEach((hs) => {
        const isSelected = selectedHotspotId === hs.id;
        const color = hs.classification === 'PERSISTENT' ? '#ef4444' : hs.classification === 'EMERGING' ? '#f97316' : '#eab308';

        const marker = L.circleMarker([hs.center[1], hs.center[0]], {
          radius: isSelected ? 10 : 7,
          color: color,
          fillColor: color,
          fillOpacity: 0.85,
          weight: isSelected ? 3 : 1.5,
        });

        marker.bindPopup(
          `<div class="font-sans text-xs p-1">
            <strong style="color:${color}">${hs.id}: ${hs.name}</strong><br/>
            <span>Zone: ${hs.zoneName}</span><br/>
            <span>Mean LST: <strong>${hs.meanLst.toFixed(1)}°C</strong></span><br/>
            <span>Peak LST: <strong style="color:#ef4444">${hs.peakLst.toFixed(1)}°C</strong></span><br/>
            <span>Status: <strong>${hs.classification}</strong></span>
          </div>`
        );

        if (interactive && onSelectHotspot) {
          marker.on('click', () => onSelectHotspot(hs));
        }

        layerGroup.addLayer(marker);
      });
    }
  }, [
    layerState,
    selectedZoneId,
    selectedHotspotId,
    activeYear,
    opacity,
    interactive,
    onSelectZone,
    onSelectHotspot,
  ]);

  return (
    <div className={`gis-canvas-container relative w-full h-full min-h-[420px] bg-slate-50 border border-slate-200 ${className}`}>
      {/* Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Layer Controls (Top Left) */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur border border-slate-200 p-2.5 shadow-sm text-xs font-sans rounded space-y-1.5 min-w-[140px]">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Map Layers</div>
        <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={layerState.heat}
            onChange={(e) => setLayerState({ ...layerState, heat: e.target.checked })}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>Heat (LST)</span>
        </label>
        <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={layerState.zones}
            onChange={(e) => setLayerState({ ...layerState, zones: e.target.checked })}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>Zone Boundaries</span>
        </label>
        <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={layerState.water}
            onChange={(e) => setLayerState({ ...layerState, water: e.target.checked })}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>Water Bodies</span>
        </label>
        <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={layerState.vegetation}
            onChange={(e) => setLayerState({ ...layerState, vegetation: e.target.checked })}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>Vegetation</span>
        </label>
        <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={layerState.builtup}
            onChange={(e) => setLayerState({ ...layerState, builtup: e.target.checked })}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>Built-up Area</span>
        </label>
      </div>

      {/* Floating Thermal Gradient Legend (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur border border-slate-200 p-2 shadow-sm text-xs font-sans rounded pointer-events-none">
        <div className="flex items-center justify-between mb-1 text-[10px] font-medium text-slate-500">
          <span>COOL</span>
          <span className="font-bold text-slate-700">THERMAL SCALE (°C)</span>
          <span>HOT</span>
        </div>
        <div className="w-36 h-2 bg-thermal-gradient rounded-full mb-1 border border-slate-300" />
        <div className="flex justify-between text-[10px] text-slate-600 font-mono-tech">
          <span>&le;38°C</span>
          <span>41°C</span>
          <span>44°C</span>
          <span>&ge;47°C</span>
        </div>
      </div>

      {/* Coordinates Badge (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-10 text-[10px] font-mono-tech text-slate-500 bg-white/90 border border-slate-200 px-2 py-1 rounded">
        NAGPUR: 21.1458° N, 79.0882° E
      </div>
    </div>
  );
};
