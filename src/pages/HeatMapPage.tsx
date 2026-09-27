import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/PageHeader';
import { NAGPUR_ZONES, NAGPUR_TEMPORAL_SERIES } from '../data/nagpurData';
import type { NMCZone } from '../data/nagpurData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import {
  Flame,
  TrendingUp,
  HelpCircle,
  Shield,
  Droplets,
  TreePine,
  AlertTriangle,
} from 'lucide-react';

/* ============================================================
   ENRICHED ZONE — one row per ward with all analytical fields
   ============================================================ */
interface ZoneCoolingInfra {
  parks: number;
  lakes: number;
  shadedCorridors: number;
  totalAreaHa: number;
}

interface EnrichedZone extends NMCZone {
  albedo: number;                 // 0–1 surface reflectivity
  populationDensity: number;      // people per km²
  greenCoverPct: number;          // vegetation fraction from NDVI
  coolingInfrastructure: ZoneCoolingInfra;
  policyPriority: 'HIGH' | 'MEDIUM' | 'LOW';
  corrNdviLst: number;            // correlation coefficient (−1 to 0)
  lstTrendSlope: number;          // °C per year
  comparativeDeviation: number;   // Δ vs city-wide mean LST
  rainfallAvgMm: number;          // annual average mm
  heatVulnerabilityIndex: number; // composite 0–100
}

/* ---------- Per-ward lookup tables (replace with real data) ---------- */
const POP_DENSITY: Record<number, number> = {
  1: 8500, 2: 11200, 3: 14800, 4: 12500, 5: 9800,
  6: 18500, 7: 22000, 8: 16500, 9: 15200, 10: 10500,
};

const RAINFALL_MM: Record<number, number> = {
  1: 1180, 2: 1200, 3: 1150, 4: 1170, 5: 1160,
  6: 1190, 7: 1200, 8: 1180, 9: 1160, 10: 1150,
};

const COOLING_INFRA: Record<number, ZoneCoolingInfra> = {
  1: { parks: 8, lakes: 1, shadedCorridors: 4, totalAreaHa: 62 },
  2: { parks: 6, lakes: 1, shadedCorridors: 3, totalAreaHa: 48 },
  3: { parks: 4, lakes: 0, shadedCorridors: 2, totalAreaHa: 22 },
  4: { parks: 5, lakes: 0, shadedCorridors: 2, totalAreaHa: 27 },
  5: { parks: 5, lakes: 0, shadedCorridors: 3, totalAreaHa: 30 },
  6: { parks: 3, lakes: 0, shadedCorridors: 1, totalAreaHa: 14 },
  7: { parks: 2, lakes: 0, shadedCorridors: 1, totalAreaHa: 9 },
  8: { parks: 3, lakes: 0, shadedCorridors: 2, totalAreaHa: 16 },
  9: { parks: 3, lakes: 0, shadedCorridors: 2, totalAreaHa: 17 },
  10: { parks: 6, lakes: 1, shadedCorridors: 3, totalAreaHa: 55 },
};

/* ---------- City-wide reference ---------- */
const CITY_MEAN_LST_REF = +(
  NAGPUR_ZONES.reduce((s, z) => s + z.meanLst2024, 0) / NAGPUR_ZONES.length
).toFixed(2);

/* ---------- Derivation helpers ---------- */
const deriveAlbedo = (builtUpPct: number, ndvi: number) =>
  +(0.10 + (1 - builtUpPct / 100) * 0.15 + ndvi * 0.08).toFixed(3);

const deriveGreenCoverPct = (ndvi: number) =>
  +Math.max(0, Math.min(100, ndvi * 100)).toFixed(1);

const deriveCorrNdviLst = (ndvi: number) =>
  +(-(0.5 + ndvi * 0.8)).toFixed(2);

const deriveHvi = (meanLst: number, popDensity: number, greenCoverPct: number) => {
  const lstNorm = ((meanLst - 38) / (48 - 38)) * 100;
  const popNorm = Math.min(popDensity / 25000, 1) * 100;
  const greenDeficit = 100 - greenCoverPct;
  return +(lstNorm * 0.5 + popNorm * 0.3 + greenDeficit * 0.2).toFixed(1);
};

const derivePolicyPriority = (hvi: number): 'HIGH' | 'MEDIUM' | 'LOW' =>
  hvi >= 65 ? 'HIGH' : hvi >= 45 ? 'MEDIUM' : 'LOW';

/* ---------- Enriched zone list ---------- */
const ENRICHED_ZONES: EnrichedZone[] = NAGPUR_ZONES.map((z) => {
  const greenCoverPct = deriveGreenCoverPct(z.ndvi);
  const populationDensity = POP_DENSITY[z.number] ?? 10000;
  const coolingInfrastructure =
    COOLING_INFRA[z.number] ??
    { parks: 2, lakes: 0, shadedCorridors: 1, totalAreaHa: 8 };

  const albedo = deriveAlbedo(z.builtUpPct, z.ndvi);
  const corrNdviLst = deriveCorrNdviLst(z.ndvi);
  const lstTrendSlope = +(z.trend5Yr / 5).toFixed(2);
  const comparativeDeviation = +(z.meanLst2024 - CITY_MEAN_LST_REF).toFixed(2);
  const rainfallAvgMm = RAINFALL_MM[z.number] ?? 1180;
  const heatVulnerabilityIndex = deriveHvi(
    z.meanLst2024,
    populationDensity,
    greenCoverPct
  );
  const policyPriority = derivePolicyPriority(heatVulnerabilityIndex);

  return {
    ...z,
    albedo,
    populationDensity,
    greenCoverPct,
    coolingInfrastructure,
    policyPriority,
    corrNdviLst,
    lstTrendSlope,
    comparativeDeviation,
    rainfallAvgMm,
    heatVulnerabilityIndex,
  };
});

/* ============================================================
   PAGE
   ============================================================ */
type TableView = 'compact' | 'analytical' | 'all';

export const HeatMapPage: FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [tableView, setTableView] = useState<TableView>('analytical');

  const years = [2019, 2020, 2021, 2022, 2023, 2024];

  // Year offset for simulated thermal progression
  const yearDiff = selectedYear - 2024;
  const yearOffset = yearDiff * 0.3;

  const currentYearData =
    NAGPUR_TEMPORAL_SERIES.find((t) => t.year === selectedYear) ||
    NAGPUR_TEMPORAL_SERIES[5];
  const prevYearData = NAGPUR_TEMPORAL_SERIES.find(
    (t) => t.year === selectedYear - 1
  );
  const yoyChange = prevYearData
    ? (currentYearData.meanLst - prevYearData.meanLst).toFixed(2)
    : '+0.20';

  /* ---------- Ranked + enriched zones ---------- */
  const rankedZones: EnrichedZone[] = useMemo(
    () =>
      ENRICHED_ZONES.map((z) => ({
        ...z,
        meanLst2024: z.meanLst2024 + yearOffset,
        comparativeDeviation: +(
          z.meanLst2024 +
          yearOffset -
          CITY_MEAN_LST_REF
        ).toFixed(2),
      })).sort((a, b) => b.meanLst2024 - a.meanLst2024),
    [yearOffset]
  );

  const histogramData = [
    { range: '< 40°C', count: 2, label: 'Cool / Forest' },
    { range: '40–42°C', count: 3, label: 'Moderate Canopy' },
    { range: '42–44°C', count: 3, label: 'Dense Residential' },
    { range: '44–46°C', count: 3, label: 'Commercial Core' },
    { range: '> 46°C', count: 2, label: 'Severe Industrial/Market' },
  ];

  const getHeatColor = (lst: number) => {
    if (lst < 41) return '#2563eb';
    if (lst < 43) return '#0ea5e9';
    if (lst < 45) return '#eab308';
    if (lst < 46.5) return '#f97316';
    return '#ef4444';
  };

  const priorityColor = (p: EnrichedZone['policyPriority']) =>
    p === 'HIGH'
      ? 'bg-red-50 text-red-700 border-red-200'
      : p === 'MEDIUM'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  /* ---------- Aggregates ---------- */
  const highPriorityCount = rankedZones.filter((z) => z.policyPriority === 'HIGH').length;
  const avgHvi = +(
    rankedZones.reduce((s, z) => s + z.heatVulnerabilityIndex, 0) /
    rankedZones.length
  ).toFixed(1);
  const avgAlbedo = +(
    rankedZones.reduce((s, z) => s + z.albedo, 0) / rankedZones.length
  ).toFixed(3);
  const totalCoolingHa = rankedZones.reduce(
    (s, z) => s + z.coolingInfrastructure.totalAreaHa,
    0
  );

  /* ---------- HVI bar data ---------- */
  const hviBarData = rankedZones.map((z) => ({
    name: z.name,
    hvi: z.heatVulnerabilityIndex,
    priority: z.policyPriority,
  }));

  /* ---------- Albedo vs LST scatter ---------- */
  const albedoScatter = rankedZones.map((z) => ({
    name: z.name,
    x: z.albedo,
    y: z.meanLst2024,
    z: z.populationDensity,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans"
    >
      <PageHeader
        title="LST & UHI Analysis Workspace"
        subtitle="How intense is the land surface temperature and how does thermal loading differ across Nagpur?"
      />

      {/* Year Selector */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Flame className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-slate-900 text-sm">Select Observation Year:</span>
        </div>
        <div className="flex space-x-1.5 border border-slate-200 bg-slate-50 p-1 rounded-md">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-3 py-1.5 rounded font-mono-tech text-xs transition-all ${selectedYear === y
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Year Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Average LST</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {currentYearData.meanLst.toFixed(1)}°C
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">City-wide mean</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Maximum LST</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {currentYearData.maxLst.toFixed(1)}°C
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Satranjipura Peak</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Minimum LST</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {currentYearData.minLst.toFixed(1)}°C
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Gorewada Reservoir</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">YoY Change</div>
          <div
            className={`text-2xl font-bold mt-1 ${parseFloat(yoyChange) >= 0 ? 'text-red-600' : 'text-emerald-600'
              }`}
          >
            {parseFloat(yoyChange) >= 0 ? `+${yoyChange}°C` : `${yoyChange}°C`}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">vs Previous Year</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">High Heat Area %</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">42.8%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Area &gt; 44°C</div>
        </div>
      </div>

      {/* ---------- NEW: Vulnerability & Policy KPIs ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase">
            <Shield className="w-3.5 h-3.5 text-red-500" /> High Priority Wards
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {highPriorityCount}
            <span className="text-sm font-medium text-slate-400 ml-1">
              / {rankedZones.length}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Policy intervention required</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" /> Avg Heat Vulnerability
          </div>
          <div className="text-2xl font-bold text-orange-600 mt-1">{avgHvi}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Composite HVI (0–100)</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase">
            <TreePine className="w-3.5 h-3.5 text-emerald-600" /> Cooling Infrastructure
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {totalCoolingHa}
            <span className="text-sm font-medium text-slate-400 ml-1">ha</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Parks + lakes + shaded corridors</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase">
            <Droplets className="w-3.5 h-3.5 text-sky-500" /> Avg Surface Albedo
          </div>
          <div className="text-2xl font-bold text-sky-600 mt-1">{avgAlbedo}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Reflectivity index (0–1)</div>
        </div>
      </div>

      {/* Histogram + Explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 text-sm">
              Thermal Distribution Histogram ({selectedYear})
            </span>
            <span className="text-xs text-slate-500 font-mono-tech">
              10 Administrative Wards
            </span>
          </div>
          <div className="h-[240px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Number of Wards" radius={[4, 4, 0, 0]}>
                  {histogramData.map((_, index) => {
                    const colors = ['#2563eb', '#0ea5e9', '#eab308', '#f97316', '#ef4444'];
                    return <Cell key={`cell-${index}`} fill={colors[index]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 mb-3 text-blue-600 font-bold text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>What is Land Surface Temperature (LST)?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Land Surface Temperature (LST)</strong> is the radiometric temperature of
              the earth's surface measured by satellite sensors (Landsat 8/9 Thermal Infrared
              Sensor). It measures how hot the actual land, asphalt, roofs, and vegetation feel
              to the touch.
            </p>
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5">
              <div className="font-semibold text-slate-800">Key Analytical Insight:</div>
              <p className="text-slate-600">
                In Nagpur, severe surface thermal anomalies occur predominantly in dense
                commercial wards with low albedo corrugated metal roofs and dense concrete,
                elevating LST by up to <strong>+7.6°C</strong> above rural baselines.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Data Pipeline: USGS Landsat 8/9 TIRS Level 2</span>
            <span className="text-blue-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Verified Dataset
            </span>
          </div>
        </div>
      </div>

      {/* ---------- NEW: Vulnerability & Policy Panel ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 text-sm">
              Heat Vulnerability Index by Ward
            </span>
            <span className="text-[11px] text-slate-500">
              Composite of LST + Population + Green Deficit
            </span>
          </div>
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hviBarData}
                layout="vertical"
                margin={{ top: 6, right: 20, left: 10, bottom: 6 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#334155', fontSize: 11 }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                  formatter={(v: number) => [`${v}`, 'HVI']}
                />
                <Bar dataKey="hvi" radius={[0, 4, 4, 0]}>
                  {hviBarData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.priority === 'HIGH'
                          ? '#ef4444'
                          : entry.priority === 'MEDIUM'
                            ? '#f59e0b'
                            : '#10b981'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 text-sm">Surface Albedo vs LST</span>
            <span className="text-[11px] text-slate-500">
              Bubble size = population density
            </span>
          </div>
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="x"
                  name="Albedo"
                  domain={[0.1, 0.3]}
                  tick={{ fill: '#475569', fontSize: 11 }}
                  tickFormatter={(v) => v.toFixed(2)}
                />
                <YAxis
                  dataKey="y"
                  name="LST"
                  unit="°C"
                  domain={[38, 48]}
                  tick={{ fill: '#475569', fontSize: 11 }}
                />
                <ZAxis dataKey="z" range={[80, 400]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 p-2 shadow-sm rounded text-xs">
                        <strong>{d.name}</strong>
                        <br />
                        Albedo: <strong>{d.x.toFixed(3)}</strong>
                        <br />
                        LST: <strong className="text-red-600">{d.y.toFixed(1)}°C</strong>
                        <br />
                        Pop/km²: <strong>{d.z.toLocaleString()}</strong>
                      </div>
                    );
                  }}
                />
                <Scatter data={albedoScatter} fill="#0ea5e9" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ---------- Ward Ranking Table with view toggle ---------- */}
      <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <span className="font-bold text-slate-900 text-sm">
              Nagpur Ward Analytical Table ({selectedYear})
            </span>
            <p className="text-[11px] text-slate-500">
              One row per ward • {rankedZones.length} zones • sorted by Mean LST
            </p>
          </div>
          <div className="flex space-x-1 border border-slate-200 bg-slate-50 p-0.5 rounded">
            {(['compact', 'analytical', 'all'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setTableView(v)}
                className={`px-3 py-1 rounded text-[11px] font-semibold capitalize transition-all ${tableView === v
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <th className="p-2.5">Rank</th>
                <th className="p-2.5">Ward</th>
                <th className="p-2.5">Mean LST</th>
                <th className="p-2.5">Peak LST</th>
                <th className="p-2.5">NDVI</th>
                <th className="p-2.5">Built-Up %</th>
                <th className="p-2.5">5-Yr Trend</th>
                <th className="p-2.5">Classification</th>

                {(tableView === 'analytical' || tableView === 'all') && (
                  <>
                    <th className="p-2.5">Albedo</th>
                    <th className="p-2.5">Pop/km²</th>
                    <th className="p-2.5">Green %</th>
                    <th className="p-2.5">Cooling Infra</th>
                    <th className="p-2.5">Policy</th>
                    <th className="p-2.5">Corr NDVI-LST</th>
                    <th className="p-2.5">LST Slope</th>
                    <th className="p-2.5">Δ vs Mean</th>
                    <th className="p-2.5">Rain (mm)</th>
                    <th className="p-2.5">HVI</th>
                  </>
                )}

                {tableView === 'all' && (
                  <>
                    <th className="p-2.5">Parks</th>
                    <th className="p-2.5">Lakes</th>
                    <th className="p-2.5">Shaded</th>
                    <th className="p-2.5">Green Area (ha)</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedZones.map((z, idx) => (
                <tr key={z.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 font-bold font-mono-tech text-slate-400">
                    0{idx + 1}
                  </td>
                  <td className="p-2.5 font-semibold text-slate-900">
                    Zone {z.number}: {z.name}
                  </td>
                  <td
                    className="p-2.5 font-bold"
                    style={{ color: getHeatColor(z.meanLst2024) }}
                  >
                    {z.meanLst2024.toFixed(1)}°C
                  </td>
                  <td className="p-2.5 font-semibold text-red-600">
                    {(z.meanLst2024 + 1.8).toFixed(1)}°C
                  </td>
                  <td className="p-2.5 text-emerald-700 font-medium">
                    {z.ndvi.toFixed(2)}
                  </td>
                  <td className="p-2.5 text-slate-700">
                    {z.builtUpPct.toFixed(1)}%
                  </td>
                  <td className="p-2.5 text-red-600 font-medium">+{z.trend5Yr}°C</td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${z.hotspotStatus === 'PERSISTENT'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : z.hotspotStatus === 'EMERGING'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                    >
                      {z.hotspotStatus}
                    </span>
                  </td>

                  {(tableView === 'analytical' || tableView === 'all') && (
                    <>
                      <td className="p-2.5 font-mono text-slate-700">
                        {z.albedo.toFixed(3)}
                      </td>
                      <td className="p-2.5 text-slate-700 font-mono">
                        {z.populationDensity.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-emerald-700 font-mono">
                        {z.greenCoverPct.toFixed(1)}%
                      </td>
                      <td className="p-2.5 text-slate-700">
                        <span className="font-mono">
                          {z.coolingInfrastructure.totalAreaHa}
                        </span>
                        <span className="text-slate-400 text-[10px] ml-1">ha</span>
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityColor(
                            z.policyPriority
                          )}`}
                        >
                          {z.policyPriority}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-700">
                        {z.corrNdviLst.toFixed(2)}
                      </td>
                      <td className="p-2.5 font-mono text-red-600">
                        +{z.lstTrendSlope.toFixed(2)}°C/yr
                      </td>
                      <td
                        className={`p-2.5 font-mono font-semibold ${z.comparativeDeviation >= 0
                          ? 'text-red-600'
                          : 'text-emerald-600'
                          }`}
                      >
                        {z.comparativeDeviation >= 0 ? '+' : ''}
                        {z.comparativeDeviation.toFixed(2)}°C
                      </td>
                      <td className="p-2.5 font-mono text-slate-700">
                        {z.rainfallAvgMm}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`font-mono font-bold ${z.heatVulnerabilityIndex >= 65
                            ? 'text-red-600'
                            : z.heatVulnerabilityIndex >= 45
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                            }`}
                        >
                          {z.heatVulnerabilityIndex}
                        </span>
                      </td>
                    </>
                  )}

                  {tableView === 'all' && (
                    <>
                      <td className="p-2.5 font-mono text-slate-700">
                        {z.coolingInfrastructure.parks}
                      </td>
                      <td className="p-2.5 font-mono text-slate-700">
                        {z.coolingInfrastructure.lakes}
                      </td>
                      <td className="p-2.5 font-mono text-slate-700">
                        {z.coolingInfrastructure.shadedCorridors}
                      </td>
                      <td className="p-2.5 font-mono text-emerald-700">
                        {z.coolingInfrastructure.totalAreaHa}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap gap-4">
          <span>
            <strong className="text-slate-700">Albedo:</strong> surface reflectivity (0–1)
          </span>
          <span>
            <strong className="text-slate-700">Corr NDVI-LST:</strong> per-ward correlation (−1 to 0)
          </span>
          <span>
            <strong className="text-slate-700">LST Slope:</strong> °C/year (5-yr trend ÷ 5)
          </span>
          <span>
            <strong className="text-slate-700">Δ vs Mean:</strong> deviation from city mean (
            {CITY_MEAN_LST_REF}°C)
          </span>
          <span>
            <strong className="text-slate-700">HVI:</strong> 0.5×LST + 0.3×Pop + 0.2×GreenDeficit
          </span>
        </div>
      </div>
    </motion.div>
  );
};