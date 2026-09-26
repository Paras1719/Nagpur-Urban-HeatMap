import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../components/PageHeader';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Layers,
  CheckCircle2,
  Menu,
  X,
  Search,
  MapPin,
  Trees,
  Droplets,
  Building2,
  AlertTriangle,
  Gauge,
  Route,
  Factory,
  ChevronDown,
} from 'lucide-react';
import rawData from '../data/maharashtra districts data.json';

/* ============================================================
   TYPES
   ============================================================ */
interface DistrictLandCover {
  district_name: string;
  vegetation_area: number;
  infrastructure_area: number;
  bare_area: number;
  water_area: number;
  total_area: number;
  urban_area_km2: number;
  rural_settlement_area_km2: number;
  road_network_length_km: number;
  industrial_area_km2: number;
  timestamp: string;
}

/* ============================================================
   JSON NORMALIZER
   ============================================================ */
const normalizeDistricts = (input: unknown): DistrictLandCover[] => {
  if (Array.isArray(input)) return input as DistrictLandCover[];
  if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj.districts)) return obj.districts as DistrictLandCover[];
    if (Array.isArray(obj.data)) return obj.data as DistrictLandCover[];
    if (Array.isArray(obj.features)) {
      return (obj.features as any[]).map((f) => f.properties);
    }
    const values = Object.values(obj);
    if (
      values.length > 0 &&
      values.every((v) => v && typeof v === 'object' && 'district_name' in (v as any))
    ) {
      return values as DistrictLandCover[];
    }
  }
  console.warn('[LandCoverPage] Unexpected JSON shape');
  return [];
};

const DISTRICTS: DistrictLandCover[] = normalizeDistricts(rawData)
  .filter((d) => d && typeof d.district_name === 'string')
  .sort((a, b) => a.district_name.localeCompare(b.district_name));

/* ============================================================
   DERIVED METRICS
   ============================================================ */
const deriveMetrics = (d: DistrictLandCover) => {
  const builtUp =
    d.infrastructure_area +
    d.urban_area_km2 +
    d.rural_settlement_area_km2 +
    d.industrial_area_km2;

  const safe = (n: number) => (Number.isFinite(n) ? n : 0);
  const pct = (n: number) => (d.total_area ? (safe(n) / d.total_area) * 100 : 0);

  const other_area = Math.max(
    d.total_area - d.vegetation_area - d.water_area - d.industrial_area_km2,
    0
  );

  const greenRatio = pct(d.vegetation_area);
  const builtRatio = pct(builtUp);
  const waterRatio = pct(d.water_area);
  const bareRatio = pct(d.bare_area);
  const industryRatio = pct(d.industrial_area_km2);
  const otherRatio = pct(other_area);
  const imperviousness = pct(d.infrastructure_area + d.industrial_area_km2);

  const heatRiskIndex = +(
    builtRatio * 1.2 + bareRatio * 0.6 - greenRatio * 0.9 - waterRatio * 1.4
  ).toFixed(2);

  const ecoScore = +(
    greenRatio * 1.1 + waterRatio * 1.5 - builtRatio * 0.8
  ).toFixed(2);

  const roadDensity = +(
    d.total_area ? d.road_network_length_km / (d.total_area / 100) : 0
  ).toFixed(3);

  return {
    builtUp, other_area,
    greenRatio, builtRatio, waterRatio, bareRatio, industryRatio, otherRatio,
    imperviousness, heatRiskIndex, ecoScore, roadDensity,
  };
};

/* ============================================================
   COLORS
   ============================================================ */
const C = {
  vegetation: '#10b981',
  water: '#0284c7',
  industry: '#64748b',
  other: '#f59e0b',
  urban: '#ef4444',
  rural: '#8b5cf6',
  bare: '#eab308',
  infrastructure: '#f97316',
} as const;

/* ============================================================
   DISTRICT DRAWER (slides from right)
   ============================================================ */
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  selected: DistrictLandCover;
  onSelect: (d: DistrictLandCover) => void;
}

const DistrictDrawer: FC<DrawerProps> = ({ open, onClose, selected, onSelect }) => {
  const [query, setQuery] = useState('');
  const filtered = DISTRICTS.filter((d) =>
    d.district_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-[340px] bg-white border-l border-slate-200 z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Select District</h3>
                <p className="text-[11px] text-slate-500">
                  {DISTRICTS.length} districts available
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search district..."
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-6">
                  {DISTRICTS.length === 0
                    ? 'No districts found in JSON file.'
                    : 'No districts match your search.'}
                </p>
              )}
              {filtered.map((d) => {
                const isActive = d.district_name === selected.district_name;
                return (
                  <button
                    key={d.district_name}
                    onClick={() => {
                      onSelect(d);
                      onClose();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded text-xs transition-all flex items-center justify-between mb-0.5 ${isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'hover:bg-slate-100 text-slate-700'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-semibold truncate">{d.district_name}</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono shrink-0 ml-2 ${isActive ? 'text-blue-100' : 'text-slate-400'
                        }`}
                    >
                      {d.total_area?.toLocaleString?.() ?? '—'} km²
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

/* ============================================================
   MAIN PAGE
   ============================================================ */
export const LandCoverPage: FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [district, setDistrict] = useState<DistrictLandCover | null>(
    DISTRICTS[0] ?? null
  );
  const [selectedClass, setSelectedClass] = useState<
    'VEGETATION' | 'WATER' | 'INDUSTRY' | 'OTHER'
  >('VEGETATION');
  const [topN, setTopN] = useState<10 | 15 | 25>(15);
  const [rankBy, setRankBy] = useState<'total' | 'vegetation' | 'water' | 'industry'>(
    'total'
  );

  if (!district) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
          <strong>No district data loaded.</strong>
          <p className="mt-2">
            Verify <code className="bg-amber-100 px-1 rounded">
              src/data/maharashtra districts data.json
            </code>{' '}
            exists and contains an array of district records.
          </p>
        </div>
      </div>
    );
  }

  const m = useMemo(() => deriveMetrics(district), [district]);

  /* ---------- Comparative dataset ---------- */
  const comparativeData = useMemo(() => {
    const enriched = DISTRICTS.map((d) => {
      const dm = deriveMetrics(d);
      return {
        name: d.district_name,
        fullName: d.district_name,
        vegetation: +d.vegetation_area.toFixed(1),
        water: +d.water_area.toFixed(1),
        industry: +d.industrial_area_km2.toFixed(1),
        other: +dm.other_area.toFixed(1),
        total: d.total_area,
      };
    });

    const key =
      rankBy === 'total' ? 'total'
        : rankBy === 'vegetation' ? 'vegetation'
          : rankBy === 'water' ? 'water'
            : 'industry';

    return enriched.sort((a, b) => (b as any)[key] - (a as any)[key]).slice(0, topN);
  }, [topN, rankBy]);

  /* ---------- Donut ---------- */
  const pieData = [
    { name: 'Vegetation', value: +district.vegetation_area.toFixed(1), color: C.vegetation },
    { name: 'Water Bodies', value: +district.water_area.toFixed(1), color: C.water },
    { name: 'Industrial', value: +district.industrial_area_km2.toFixed(1), color: C.industry },
    { name: 'Other Land', value: +m.other_area.toFixed(1), color: C.other },
  ];
  const pieTotal = pieData.reduce((s, x) => s + x.value, 0) || 1;

  /* ---------- Settlement bar ---------- */
  const settlementBar = [
    { name: 'Urban', value: district.urban_area_km2, color: C.urban },
    { name: 'Rural', value: district.rural_settlement_area_km2, color: C.rural },
    { name: 'Industrial', value: district.industrial_area_km2, color: C.industry },
    { name: 'Infrastructure', value: district.infrastructure_area, color: C.infrastructure },
    { name: 'Bare', value: district.bare_area, color: C.bare },
  ];

  /* ---------- Class explainer ---------- */
  const classInfo = {
    VEGETATION: {
      title: 'Vegetation & Canopy Cover',
      area: district.vegetation_area,
      pct: m.greenRatio,
      color: C.vegetation,
      icon: Trees,
      effect:
        'Provides evaporative cooling via leaf stomata and casts direct shading over ground surfaces.',
      observedTemp: `Mean LST ~40.8°C in high-canopy wards`,
    },
    WATER: {
      title: 'Water Bodies & Reservoirs',
      area: district.water_area,
      pct: m.waterRatio,
      color: C.water,
      icon: Droplets,
      effect:
        'High thermal heat capacity acts as a continuous heat buffer during peak solar hours.',
      observedTemp: `Strongest cooling sink (LST ~37.5°C)`,
    },
    INDUSTRY: {
      title: 'Industrial Area',
      area: district.industrial_area_km2,
      pct: m.industryRatio,
      color: C.industry,
      icon: Factory,
      effect:
        'Anthropogenic heat release combined with impervious surfaces creates localized hotspots.',
      observedTemp: `Elevated LST due to waste heat + concrete`,
    },
    OTHER: {
      title: 'Other Land (Infra + Bare + Settlements)',
      area: m.other_area,
      pct: m.otherRatio,
      color: C.other,
      icon: Building2,
      effect:
        'Impervious surfaces absorb solar radiation, retain thermal energy overnight, and block soil evaporation.',
      observedTemp: `Mean LST ~45.4°C in dense built wards`,
    },
  } as const;

  const current = classInfo[selectedClass];
  const CurrentIcon = current.icon;

  /* ---------- KPI strip ---------- */
  const kpis = [
    { label: 'Total Area', value: district.total_area.toLocaleString(), unit: 'km²', icon: Gauge, color: 'text-slate-700' },
    { label: 'Vegetation', value: m.greenRatio.toFixed(1), unit: '%', icon: Trees, color: 'text-emerald-600' },
    { label: 'Water', value: m.waterRatio.toFixed(2), unit: '%', icon: Droplets, color: 'text-sky-600' },
    { label: 'Industry', value: m.industryRatio.toFixed(2), unit: '%', icon: Factory, color: 'text-slate-600' },
    { label: 'Heat Risk', value: m.heatRiskIndex.toFixed(1), unit: 'idx', icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Road Density', value: m.roadDensity.toFixed(2), unit: 'km/100km²', icon: Route, color: 'text-violet-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans"
    >
      <DistrictDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selected={district}
        onSelect={setDistrict}
      />

      {/* Header — clean, no district button */}
      <PageHeader
        title="Land Cover vs Surface Temperature Relationships"
        subtitle="Comparative land-cover analytics across Maharashtra districts"
      />

      {/* ============================================================
          SECTION 1 — CROSS-DISTRICT COMPARISON
          ============================================================ */}
      <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
          <div>
            <span className="font-bold text-slate-900 text-sm">
              District-wise Land Cover Composition (km²)
            </span>
            <p className="text-[11px] text-slate-500">
              Ranked by {rankBy === 'total' ? 'Total Area' : rankBy === 'vegetation' ? 'Vegetation' : rankBy === 'water' ? 'Water' : 'Industrial'} — click any bar to analyze
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex space-x-1 border border-slate-200 bg-slate-50 p-0.5 rounded">
              {(['total', 'vegetation', 'water', 'industry'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setRankBy(k)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize transition-all ${rankBy === k ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="flex space-x-1 border border-slate-200 bg-slate-50 p-0.5 rounded">
              {([10, 15, 25] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setTopN(n)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${topN === n ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                >
                  Top {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: Math.max(320, comparativeData.length * 26) }} className="w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparativeData}
              layout="vertical"
              margin={{ top: 6, right: 20, left: 10, bottom: 6 }}
              onClick={(e: any) => {
                if (e?.activeLabel) {
                  const found = DISTRICTS.find((d) => d.district_name === e.activeLabel);
                  if (found) setDistrict(found);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" stroke="#475569" tick={{ fill: '#475569', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#475569"
                tick={{ fill: '#334155', fontSize: 11 }}
                width={110}
              />
              <Tooltip
                cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const total = payload.reduce((s, p: any) => s + (p.value || 0), 0);
                  return (
                    <div className="bg-white border border-slate-200 p-2 shadow-md rounded text-xs">
                      <strong className="text-slate-900">{label}</strong>
                      <div className="mt-1 space-y-0.5">
                        {payload.map((p: any) => (
                          <div key={p.dataKey} className="flex justify-between gap-3">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                              <span className="capitalize text-slate-600">{p.dataKey}</span>
                            </span>
                            <span className="font-mono text-slate-900">
                              {Number(p.value).toLocaleString()} km²
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between gap-3 pt-1 mt-1 border-t border-slate-200">
                          <span className="font-semibold text-slate-700">Total</span>
                          <span className="font-mono font-bold text-slate-900">
                            {total.toLocaleString()} km²
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
              <Bar dataKey="vegetation" stackId="a" fill={C.vegetation} name="Vegetation" />
              <Bar dataKey="water" stackId="a" fill={C.water} name="Water" />
              <Bar dataKey="industry" stackId="a" fill={C.industry} name="Industry" />
              <Bar dataKey="other" stackId="a" fill={C.other} name="Other" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================
          SECTION 2 — DISTRICT DEEP DIVE (with its own district picker)
          ============================================================ */}
      <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4">
        {/* Deep-dive section header with inline district picker */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center"
              style={{ background: 'rgba(37,99,235,0.1)' }}
            >
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                District Deep-Dive
              </div>
              <div className="font-bold text-slate-900 text-base leading-tight">
                {district.district_name}
              </div>
            </div>
          </div>

          {/* District picker — the ONLY place to change the district now */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-sm transition-colors"
          >
            <Menu className="w-4 h-4" />
            Change District
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-slate-500 tracking-wide">
                <k.icon className={`w-3 h-3 ${k.color}`} />
                {k.label}
              </div>
              <div className={`mt-1.5 text-lg font-bold ${k.color} leading-none`}>
                {k.value}
                <span className="text-[10px] text-slate-400 font-mono ml-1">{k.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Composition & Insight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Donut + Settlement */}
          <div className="space-y-4">
            <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
              <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                {district.district_name} — Land Cover Split
              </div>

              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v.toLocaleString()} km²`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1 text-xs">
                {pieData.map((item) => (
                  <div key={item.name} className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      {((item.value / pieTotal) * 100).toFixed(1)}%
                      <span className="text-slate-400 font-mono font-normal ml-1">
                        {item.value.toLocaleString()} km²
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
              <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                Settlement & Infra Breakdown (km²)
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={settlementBar} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} interval={0} />
                    <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => `${v.toLocaleString()} km²`} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {settlementBar.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[11px] text-slate-500 text-center">
                Road network:{' '}
                <strong className="text-slate-800">{district.road_network_length_km} km</strong>
                {' • '}Density: <strong>{m.roadDensity} km/100km²</strong>
              </div>
            </div>
          </div>

          {/* Right: Class explainer */}
          <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Inspect Land Cover Category — {district.district_name}
                </span>

                <div className="flex space-x-1 border border-slate-200 bg-slate-50 p-0.5 rounded">
                  {(['VEGETATION', 'WATER', 'INDUSTRY', 'OTHER'] as const).map((cKey) => (
                    <button
                      key={cKey}
                      onClick={() => setSelectedClass(cKey)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${selectedClass === cKey
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                    >
                      {cKey}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-md space-y-3 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-900 text-sm">
                  <span className="flex items-center gap-2">
                    <CurrentIcon className="w-4 h-4" style={{ color: current.color }} />
                    {current.title}
                  </span>
                  <span className="text-blue-600 font-mono">
                    {current.pct.toFixed(2)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white border border-slate-200 rounded">
                    <div className="text-slate-500 uppercase font-semibold">Area</div>
                    <div className="font-bold text-slate-900 font-mono">
                      {current.area.toLocaleString()} km²
                    </div>
                  </div>
                  <div className="p-2 bg-white border border-slate-200 rounded">
                    <div className="text-slate-500 uppercase font-semibold">Share</div>
                    <div className="font-bold text-slate-900 font-mono">
                      {current.pct.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed">{current.effect}</p>

                <div className="pt-2 border-t border-slate-200 text-slate-700 font-semibold">
                  Thermal Interpretation:{' '}
                  <span className="text-red-600">{current.observedTemp}</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    Total Area
                  </div>
                  <div className="font-bold text-slate-900">
                    {district.total_area.toLocaleString()} km²
                  </div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    Heat Risk
                  </div>
                  <div className="font-bold text-red-600">{m.heatRiskIndex}</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    Eco Score
                  </div>
                  <div className="font-bold text-emerald-600">{m.ecoScore}</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    Impervious
                  </div>
                  <div className="font-bold text-amber-600">
                    {m.imperviousness.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Urban greening interventions yield the highest cooling efficacy in
                districts with initial vegetation cover &lt; 20%.
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};