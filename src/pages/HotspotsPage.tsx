import { useState, useEffect, useRef, useMemo } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/PageHeader';
import { NAGPUR_HOTSPOTS, NAGPUR_ZONES } from '../data/nagpurData';
import type { Hotspot, NMCZone } from '../data/nagpurData';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Play,
  Pause,
  MapPin,
  Crosshair,
  Loader2,
  Navigation,
  Radio,
  Activity,
} from 'lucide-react';

/* ============================================================
   1. HOTSPOT COORDINATES
   Delete this block if your Hotspot type has lat/lon fields,
   and update getHotspotCoord to return [hs.lat, hs.lon].
   ============================================================ */
const CITY_CENTER: [number, number] = [21.1458, 79.0882];

const HOTSPOT_COORDS: Record<string, [number, number]> = {
  HS_01: [21.1524, 79.0882],
  HS_02: [21.1451, 79.0651],
  HS_03: [21.1702, 79.0935],
  HS_04: [21.1370, 79.1002],
  HS_05: [21.1615, 79.0734],
  HS_06: [21.1288, 79.0955],
  HS_07: [21.1550, 79.1150],
};

const getHotspotCoord = (hs: Hotspot, idx: number): [number, number] => {
  if (HOTSPOT_COORDS[hs.id]) return HOTSPOT_COORDS[hs.id];
  // Deterministic pseudo-scatter within ~8 km of city centre
  const angle = (idx / Math.max(1, NAGPUR_HOTSPOTS.length)) * Math.PI * 2;
  const radius = 0.02 + (idx % 3) * 0.015;
  return [
    CITY_CENTER[0] + Math.sin(angle) * radius,
    CITY_CENTER[1] + Math.cos(angle) * radius,
  ];
};

/* ============================================================
   2. CLASSIFICATION STYLING
   ============================================================ */
const CLASS_STYLE: Record<
  string,
  { ring: string; top: string; side: string; text: string; bg: string; border: string }
> = {
  PERSISTENT: {
    ring: '#a8453a',
    top: '#c45c4f',
    side: '#8b2f26',
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  EMERGING: {
    ring: '#a86a2b',
    top: '#c58345',
    side: '#8a5320',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  SPORADIC: {
    ring: '#c2ab85',
    top: '#d6c2a0',
    side: '#a08b66',
    text: 'text-yellow-800',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  DIMINISHING: {
    ring: '#4f7a5c',
    top: '#6b9878',
    side: '#3b5d45',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
};

const getClassStyle = (c: string) =>
  CLASS_STYLE[c] ?? CLASS_STYLE.EMERGING;

/* ============================================================
   3. 3D ISOMETRIC COLUMN GRID (pure SVG)
   ============================================================ */
const TW = 54;
const TH = 30;
const BASE_H = 22;
const SCALE_H = 16;
const BASELINE_LST = 42;

interface IsoColumnGridProps {
  hotspots: Hotspot[];
  selectedId: string;
  onSelect: (hs: Hotspot) => void;
  yearIntensity: Record<string, number>;
  coords: Record<string, [number, number]>;
}

const IsoColumnGrid: FC<IsoColumnGridProps> = ({
  hotspots,
  selectedId,
  onSelect,
  yearIntensity,
  coords,
}) => {
  if (hotspots.length === 0) {
    return (
      <div className="flex items-center justify-center h-[420px] text-xs text-slate-400">
        No hotspots match the current filter.
      </div>
    );
  }

  const lats = hotspots.map((h) => coords[h.id]?.[0] ?? CITY_CENTER[0]);
  const lons = hotspots.map((h) => coords[h.id]?.[1] ?? CITY_CENTER[1]);
  const latMin = Math.min(...lats);
  const latMax = Math.max(...lats);
  const lonMin = Math.min(...lons);
  const lonMax = Math.max(...lons);

  const nodes = hotspots.map((h) => {
    const [lat, lon] = coords[h.id] ?? CITY_CENTER;
    const nx = lonMax > lonMin ? (lon - lonMin) / (lonMax - lonMin) : 0.5;
    const ny = latMax > latMin ? (lat - latMin) / (latMax - latMin) : 0.5;
    const gx = nx * 6;
    const gy = ny * 6;
    const h0 = Math.max(0, (h.peakLst - BASELINE_LST) * SCALE_H);
    const h2 = BASE_H + h0;
    return { h: h2, gx, gy };
  });

  const iso = (gx: number, gy: number) => ({
    cx: (gx - gy) * (TW / 2),
    cy: (gx + gy) * (TH / 2),
  });

  const ordered = hotspots
    .map((hs, i) => ({ hs, i, ...nodes[i] }))
    .sort((a, b) => a.gx + a.gy - (b.gx + b.gy));

  const projected = nodes.map((n) => iso(n.gx, n.gy));
  const maxH = Math.max(...nodes.map((n) => n.h));
  const minSx = Math.min(...projected.map((p) => p.cx)) - TW;
  const maxSx = Math.max(...projected.map((p) => p.cx)) + TW;
  const minSy = Math.min(...projected.map((p) => p.cy)) - maxH - TH;
  const maxSy = Math.max(...projected.map((p) => p.cy)) + TH;
  const W = maxSx - minSx + 40;
  const H = maxSy - minSy + 40;
  const OFF_X = -minSx + 20;
  const OFF_Y = -minSy + 20;

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: 420 }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 520 }}>
        {/* Ground grid */}
        <g opacity={0.18}>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = iso(i, 0);
            const b = iso(i, 7);
            return (
              <line
                key={`gx-${i}`}
                x1={a.cx + OFF_X}
                y1={a.cy + OFF_Y}
                x2={b.cx + OFF_X}
                y2={b.cy + OFF_Y}
                stroke="#8b6f47"
                strokeWidth="0.5"
              />
            );
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = iso(0, i);
            const b = iso(7, i);
            return (
              <line
                key={`gy-${i}`}
                x1={a.cx + OFF_X}
                y1={a.cy + OFF_Y}
                x2={b.cx + OFF_X}
                y2={b.cy + OFF_Y}
                stroke="#8b6f47"
                strokeWidth="0.5"
              />
            );
          })}
        </g>

        {ordered.map(({ hs, gx, gy, h }) => {
          const { cx, cy } = iso(gx, gy);
          const opacity = yearIntensity[hs.id] ?? 1;
          const style = getClassStyle(hs.classification);
          const isSelected = hs.id === selectedId;
          const effH = h * opacity;
          const yBase = cy + OFF_Y;
          const x0 = cx + OFF_X;
          const topY = yBase - effH;

          const topPts = [
            [x0, topY - TH / 2],
            [x0 + TW / 2, topY],
            [x0, topY + TH / 2],
            [x0 - TW / 2, topY],
          ]
            .map((p) => p.join(','))
            .join(' ');

          const leftPts = [
            [x0 - TW / 2, yBase],
            [x0, yBase + TH / 2],
            [x0, topY + TH / 2],
            [x0 - TW / 2, topY],
          ]
            .map((p) => p.join(','))
            .join(' ');

          const rightPts = [
            [x0, yBase + TH / 2],
            [x0 + TW / 2, yBase],
            [x0 + TW / 2, topY],
            [x0, topY + TH / 2],
          ]
            .map((p) => p.join(','))
            .join(' ');

          return (
            <g
              key={hs.id}
              style={{
                cursor: 'pointer',
                opacity: opacity * 0.35 + 0.65,
                transition: 'opacity 0.4s ease',
              }}
              onClick={() => onSelect(hs)}
            >
              <polygon
                points={leftPts}
                fill={style.side}
                stroke={isSelected ? '#2a2015' : 'none'}
                strokeWidth={isSelected ? 1.5 : 0}
              />
              <polygon
                points={rightPts}
                fill={style.ring}
                stroke={isSelected ? '#2a2015' : 'none'}
                strokeWidth={isSelected ? 1.5 : 0}
              />
              <polygon
                points={topPts}
                fill={style.top}
                stroke={isSelected ? '#2a2015' : 'rgba(255,255,255,0.4)'}
                strokeWidth={isSelected ? 2 : 1}
              />
              {isSelected && (
                <text
                  x={x0}
                  y={topY - TH / 2 - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#2a2015"
                >
                  {hs.id}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-[10px] font-semibold bg-white/70 backdrop-blur border border-slate-200 rounded px-2.5 py-1.5">
        <span className="text-slate-500 uppercase tracking-wider">Classification</span>
        {Object.keys(CLASS_STYLE).map((k) => (
          <span key={k} className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: CLASS_STYLE[k].ring }}
            />
            <span className="text-slate-700">{k}</span>
          </span>
        ))}
      </div>

      <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 bg-white/70 backdrop-blur border border-slate-200 rounded px-2 py-1">
        Column height ∝ Peak LST (baseline {BASELINE_LST}°C)
      </div>
    </div>
  );
};

/* ============================================================
   4. PERSISTENCE TIMELAPSE YEARS
   ============================================================ */
const PERSISTENCE_YEARS = [2019, 2020, 2021, 2022, 2023, 2024];

/* ============================================================
   5. MAIN PAGE
   ============================================================ */
export const HotspotsPage: FC = () => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(
    NAGPUR_HOTSPOTS[0] ?? null
  );
  const [filterClass, setFilterClass] = useState<string>('ALL');

  const [playing, setPlaying] = useState(false);
  const [currentYearIdx, setCurrentYearIdx] = useState(PERSISTENCE_YEARS.length - 1);

  const [address, setAddress] = useState<string>('');
  const [geocoding, setGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string>('');
  const geocodeCache = useRef<Record<string, string>>({});

  /* ---------- Empty-state guard ---------- */
  if (!selectedHotspot) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
          <strong>No hotspot data available.</strong>
          <p className="mt-2">
            Verify <code className="bg-amber-100 px-1 rounded">NAGPUR_HOTSPOTS</code>{' '}
            is populated in <code>src/data/nagpurData.ts</code>.
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Filtered list ---------- */
  const filteredHotspots = useMemo(
    () =>
      filterClass === 'ALL'
        ? NAGPUR_HOTSPOTS
        : NAGPUR_HOTSPOTS.filter((h) => h.classification === filterClass),
    [filterClass]
  );

  /* ---------- Coordinate map ---------- */
  const coordsMap = useMemo(() => {
    const m: Record<string, [number, number]> = {};
    NAGPUR_HOTSPOTS.forEach((h, i) => {
      m[h.id] = getHotspotCoord(h, i);
    });
    return m;
  }, []);

  /* ---------- Per-year intensity ---------- */
  const yearIntensity = useMemo(() => {
    const year = PERSISTENCE_YEARS[currentYearIdx];
    const m: Record<string, number> = {};
    filteredHotspots.forEach((hs) => {
      const pers = hs.persistenceScore / 100;
      const age = currentYearIdx / (PERSISTENCE_YEARS.length - 1);
      const ramp =
        pers * (0.35 + 0.65 * age) +
        (hs.classification === 'EMERGING' ? age * 0.15 : 0);
      const jitter =
        hs.classification === 'SPORADIC'
          ? 0.35 + 0.5 * Math.abs(Math.sin(year * 1.3 + hs.peakLst))
          : hs.classification === 'DIMINISHING'
            ? Math.max(0, 1 - age * 0.75)
            : 1;
      m[hs.id] = Math.max(0.05, Math.min(1, ramp * jitter));
    });
    return m;
  }, [currentYearIdx, filteredHotspots]);

  /* ---------- Timelapse ticker ---------- */
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setCurrentYearIdx((i) => {
        if (i >= PERSISTENCE_YEARS.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 900);
    return () => clearInterval(t);
  }, [playing]);

  /* ---------- Live reverse geocoding ---------- */
  useEffect(() => {
    const [lat, lon] = coordsMap[selectedHotspot.id] ?? CITY_CENTER;
    const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;

    if (geocodeCache.current[key]) {
      setAddress(geocodeCache.current[key]);
      setGeoError('');
      return;
    }

    const ctrl = new AbortController();
    setGeocoding(true);
    setGeoError('');
    setAddress('');

    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        signal: ctrl.signal,
        headers: { Accept: 'application/json' },
      }
    )
      .then((r) => {
        if (!r.ok) throw new Error(`Nominatim ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const a = data.address ?? {};
        const parts = [
          a.road || a.pedestrian || a.footway,
          a.suburb || a.neighbourhood || a.village,
          a.city || a.town || a.county,
        ].filter(Boolean);
        const label = parts.length
          ? parts.join(', ')
          : data.display_name?.split(',').slice(0, 3).join(', ') ||
          'Unknown locality';
        geocodeCache.current[key] = label;
        setAddress(label);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setGeoError('Live lookup unavailable — showing cached zone name');
          setAddress('');
        }
      })
      .finally(() => setGeocoding(false));

    return () => ctrl.abort();
  }, [selectedHotspot.id, coordsMap]);

  /* ---------- Fingerprint radar ---------- */
  const fingerprint = useMemo(() => {
    const zone = NAGPUR_ZONES.find((z) => z.name === selectedHotspot.zoneName);

    const avg = (fn: (z: NMCZone) => number) =>
      NAGPUR_ZONES.reduce((s, z) => s + fn(z), 0) / NAGPUR_ZONES.length;

    const cityNdvi = avg((z) => z.ndvi);
    const cityBuilt = avg((z) => z.builtUpPct);

    const ndvi = zone?.ndvi ?? cityNdvi * 0.6;
    const built = zone?.builtUpPct ?? cityBuilt * 1.35;

    const albedo = 0.10 + (1 - built / 100) * 0.15 + ndvi * 0.08;
    const distWater = 400 + (built / 100) * 900;
    const distPark = 250 + (built / 100) * 800;
    // ⚠️ If NMCZone has no `population`, this falls back to 45000 + built * 400
    const pop =
      (zone as any)?.population ?? 45000 + built * 400;

    const norm = (v: number, lo: number, hi: number) =>
      Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100));

    return [
      { axis: 'NDVI', hotspot: +norm(ndvi, 0, 0.8).toFixed(1), city: +norm(cityNdvi, 0, 0.8).toFixed(1) },
      { axis: 'Built-up', hotspot: +norm(built, 0, 100).toFixed(1), city: +norm(cityBuilt, 0, 100).toFixed(1) },
      { axis: 'Albedo', hotspot: +norm(albedo, 0.1, 0.35).toFixed(1), city: +norm(0.18, 0.1, 0.35).toFixed(1) },
      { axis: 'Dist·Water', hotspot: +norm(distWater, 200, 1500).toFixed(1), city: +norm(700, 200, 1500).toFixed(1) },
      { axis: 'Dist·Park', hotspot: +norm(distPark, 150, 1200).toFixed(1), city: +norm(500, 150, 1200).toFixed(1) },
      { axis: 'Population', hotspot: +norm(pop, 20000, 90000).toFixed(1), city: +norm(50000, 20000, 90000).toFixed(1) },
    ];
  }, [selectedHotspot]);

  /* ---------- Class counts for filter buttons ---------- */
  const classCounts = useMemo(() => {
    const m: Record<string, number> = { ALL: NAGPUR_HOTSPOTS.length };
    NAGPUR_HOTSPOTS.forEach((h) => {
      m[h.classification] = (m[h.classification] || 0) + 1;
    });
    return m;
  }, []);

  const resetTimelapse = () => {
    setCurrentYearIdx(0);
    setPlaying(true);
  };

  const [selLat, selLon] = coordsMap[selectedHotspot.id] ?? CITY_CENTER;
  const style = getClassStyle(selectedHotspot.classification);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans"
    >
      <PageHeader
        title="Heat Hotspot Intelligence"
        subtitle="3D thermal extrusion · live reverse-geocoded localities · microclimate fingerprints · persistence timelapse"
      />

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-3 rounded-lg shadow-sm text-xs">
        <span className="font-semibold text-slate-700">Classification:</span>
        {(['ALL', 'PERSISTENT', 'EMERGING', 'SPORADIC', 'DIMINISHING'] as const).map((k) => {
          const active = filterClass === k;
          const sty = k === 'ALL' ? null : getClassStyle(k);
          return (
            <button
              key={k}
              onClick={() => setFilterClass(k)}
              className={`px-3 py-1 rounded font-semibold border transition-all ${active
                ? 'bg-slate-900 text-white border-slate-900'
                : `${sty?.bg ?? 'bg-slate-50'} ${sty?.text ?? 'text-slate-600'} ${sty?.border ?? 'border-slate-200'
                } hover:opacity-80`
                }`}
            >
              {k} ({classCounts[k] ?? 0})
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="px-3 py-1 rounded font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {playing ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={resetTimelapse}
            className="px-3 py-1 rounded font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          >
            Replay timelapse
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 3D Extrusion Canvas */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-2">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-red-600" />
              Thermal Extrusion Grid — {filteredHotspots.length} hotspots
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {PERSISTENCE_YEARS[currentYearIdx]} · click a column
            </span>
          </div>

          <IsoColumnGrid
            hotspots={filteredHotspots}
            selectedId={selectedHotspot.id}
            onSelect={setSelectedHotspot}
            yearIntensity={yearIntensity}
            coords={coordsMap}
          />

          {/* Timelapse scrubber */}
          <div className="pt-3 border-t border-slate-200 flex items-center gap-3">
            <div className="flex-1 flex gap-1.5">
              {PERSISTENCE_YEARS.map((y, i) => (
                <button
                  key={y}
                  onClick={() => {
                    setPlaying(false);
                    setCurrentYearIdx(i);
                  }}
                  className={`flex-1 py-1.5 rounded text-[11px] font-mono font-bold transition-all ${i === currentYearIdx
                    ? 'bg-slate-900 text-white shadow-sm'
                    : i < currentYearIdx
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inspector */}
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4 flex flex-col">
          <div className="border-b border-slate-200 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-red-700 font-bold font-mono text-sm">
                {selectedHotspot.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-bold text-[10px] border ${style.bg} ${style.text} ${style.border}`}
              >
                {selectedHotspot.classification}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {selectedHotspot.name}
            </h3>

            {/* Live geocode */}
            <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-[11px] flex items-start gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-slate-500 uppercase font-semibold text-[9px] tracking-wider flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-red-500 animate-pulse" />
                  Live Reverse Geocode (OSM)
                </div>
                {geocoding ? (
                  <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Resolving…
                  </div>
                ) : geoError ? (
                  <div className="text-amber-700 mt-0.5">{geoError}</div>
                ) : (
                  <div className="text-slate-800 font-medium mt-0.5">
                    {address || selectedHotspot.zoneName}
                  </div>
                )}
                <div className="text-slate-400 font-mono text-[10px] mt-0.5">
                  {selLat.toFixed(5)}, {selLon.toFixed(5)}
                </div>
              </div>
            </div>
          </div>

          {/* Fingerprint radar */}
          <div>
            <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-red-600" />
              Microclimate Fingerprint
              <span className="text-slate-400 font-normal">vs city avg</span>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={fingerprint} outerRadius="72%">
                  <PolarGrid stroke="#d8d6d1" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fill: '#514e48', fontSize: 10 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#a39c8d', fontSize: 9 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderColor: '#d9c8ab',
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  <Radar
                    name="City avg"
                    dataKey="city"
                    stroke="#918a7c"
                    fill="#918a7c"
                    fillOpacity={0.18}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                  <Radar
                    name={selectedHotspot.id}
                    dataKey="hotspot"
                    stroke={style.ring}
                    fill={style.ring}
                    fillOpacity={0.42}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 text-[10px] text-slate-500 -mt-1">
              <span className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: style.ring }}
                />
                {selectedHotspot.id}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                City avg
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-200">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Mean LST:</span>
              <span className="font-bold text-slate-900">
                {selectedHotspot.meanLst.toFixed(1)}°C
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Peak LST:</span>
              <span className="font-bold text-red-600">
                {selectedHotspot.peakLst.toFixed(1)}°C
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Persistence:</span>
              <span className="font-bold text-blue-700">
                {selectedHotspot.persistenceScore}%
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Warming rate:</span>
              <span className="font-semibold text-red-600">
                +{selectedHotspot.trendYr}°C/yr
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Population:</span>
              <span className="font-bold text-slate-900">
                {selectedHotspot.populationExposed.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Drivers */}
          <div className="pt-1">
            <div className="font-semibold text-slate-700 text-[11px] mb-1">
              Microclimate Drivers:
            </div>
            <div className="space-y-0.5">
              {selectedHotspot.keyDrivers.slice(0, 4).map((d, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-[11px] text-slate-600"
                >
                  <span className="text-red-500 font-bold">•</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RANKING TABLE */}
      <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-600" /> Hotspot Statistical Ranking
          </span>
          <span className="text-[11px] text-slate-500">
            Getis-Ord Gi* · {filteredHotspots.length} shown
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <th className="p-2.5">ID</th>
                <th className="p-2.5">Hotspot</th>
                <th className="p-2.5">Ward</th>
                <th className="p-2.5">Peak</th>
                <th className="p-2.5">Persistence</th>
                <th className="p-2.5">Trend</th>
                <th className="p-2.5">Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHotspots.map((hs) => {
                const sty = getClassStyle(hs.classification);
                return (
                  <tr
                    key={hs.id}
                    onClick={() => setSelectedHotspot(hs)}
                    className={`cursor-pointer transition-colors ${selectedHotspot.id === hs.id
                      ? 'bg-blue-50/70 font-semibold'
                      : 'hover:bg-slate-50'
                      }`}
                  >
                    <td className="p-2.5 font-bold font-mono text-red-700">
                      {hs.id}
                    </td>
                    <td className="p-2.5 font-semibold text-slate-900">
                      {hs.name}
                    </td>
                    <td className="p-2.5 text-slate-600">{hs.zoneName}</td>
                    <td className="p-2.5 font-bold text-red-600">
                      {hs.peakLst.toFixed(1)}°C
                    </td>
                    <td className="p-2.5 font-bold text-blue-700">
                      {hs.persistenceScore}%
                    </td>
                    <td className="p-2.5 text-red-600">+{hs.trendYr}°C/yr</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sty.bg} ${sty.text} ${sty.border}`}
                      >
                        {hs.classification}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};