import { useState } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/PageHeader';
import { NAGPUR_TEMPORAL_SERIES, NAGPUR_ZONES } from '../data/nagpurData';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, CheckCircle, Info } from 'lucide-react';

export const TemporalPage: FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<'meanLst' | 'maxLst' | 'ndvi' | 'ndbi' | 'builtUpKm2' | 'vegetationKm2'>('meanLst');
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>(['zone-7', 'zone-1', 'zone-10']); // Default Satranjipura, Laxmi Nagar, Mangalwari

  const metricsInfo = {
    meanLst: { name: 'Mean LST (°C)', unit: '°C', color: '#ef4444' },
    maxLst: { name: 'Max Hotspot LST (°C)', unit: '°C', color: '#dc2626' },
    ndvi: { name: 'Vegetation Index (NDVI)', unit: '', color: '#10b981' },
    ndbi: { name: 'Built-Up Index (NDBI)', unit: '', color: '#f59e0b' },
    builtUpKm2: { name: 'Built-Up Footprint (km²)', unit: 'km²', color: '#2563eb' },
    vegetationKm2: { name: 'Canopy Footprint (km²)', unit: 'km²', color: '#059669' },
  };

  // Multi-zone comparison mock series generated mathematically from zone trends
  const multiZoneSeries = NAGPUR_TEMPORAL_SERIES.map((t) => {
    const obj: Record<string, number> = { year: t.year };
    NAGPUR_ZONES.forEach((z) => {
      const yearOffset = (t.year - 2024) * (z.trend5Yr / 5);
      obj[z.name] = Math.round((z.meanLst2024 + yearOffset) * 10) / 10;
    });
    return obj;
  });

  const toggleZone = (id: string) => {
    if (selectedZoneIds.includes(id)) {
      if (selectedZoneIds.length > 1) {
        setSelectedZoneIds(selectedZoneIds.filter((zId) => zId !== id));
      }
    } else {
      setSelectedZoneIds([...selectedZoneIds, id]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans"
    >
      <PageHeader
        title="Multi-Temporal Thermal Evolution"
        subtitle="How has Nagpur's surface thermal environment changed across multiple observation years?"
      />

      {/* Metric Selector Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-slate-900 text-sm">Select Primary Temporal Metric:</span>
        </div>

        <div className="flex flex-wrap gap-1.5 border border-slate-200 bg-slate-50 p-1 rounded-md">
          {(Object.keys(metricsInfo) as (keyof typeof metricsInfo)[]).map((mKey) => (
            <button
              key={mKey}
              onClick={() => setSelectedMetric(mKey)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${selectedMetric === mKey
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              {metricsInfo[mKey].name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Multi-Year Evolution Line Chart */}
      <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm font-sans space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 text-sm">City-Wide Multi-Year Trajectory (2019–2024)</span>
          </div>
          <span className="text-slate-500 font-mono-tech text-xs">Metric: {metricsInfo[selectedMetric].name}</span>
        </div>

        <div className="h-[300px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={NAGPUR_TEMPORAL_SERIES} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                name={metricsInfo[selectedMetric].name}
                fill={`${metricsInfo[selectedMetric].color}20`}
                stroke={metricsInfo[selectedMetric].color}
                strokeWidth={2.5}
              />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                name="Observation Points"
                stroke={metricsInfo[selectedMetric].color}
                strokeWidth={3}
                dot={{ r: 5, fill: metricsInfo[selectedMetric].color }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Multi-Zone Historical Comparison Tool */}
      <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm font-sans space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-3 gap-2">
          <div>
            <span className="font-bold text-slate-900 text-sm">Multi-Ward Historical Trend Comparison</span>
            <p className="text-xs text-slate-500 mt-0.5">Toggle wards below to compare historical LST trajectories side by side.</p>
          </div>

          {/* Zone Checkboxes */}
          <div className="flex flex-wrap gap-1.5">
            {NAGPUR_ZONES.map((z) => {
              const isSelected = selectedZoneIds.includes(z.id);
              return (
                <button
                  key={z.id}
                  onClick={() => toggleZone(z.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all ${isSelected
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  Zone {z.number}: {z.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Zone Line Chart */}
        <div className="h-[300px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={multiZoneSeries} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis domain={[38, 48]} stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              {NAGPUR_ZONES.filter((z) => selectedZoneIds.includes(z.id)).map((z, idx) => {
                const zoneColors = ['#ef4444', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
                return (
                  <Line
                    key={z.id}
                    type="monotone"
                    dataKey={z.name}
                    name={`Zone ${z.number}: ${z.name}`}
                    stroke={zoneColors[idx % zoneColors.length]}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline Highlights */}
      <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm font-sans space-y-3">
        <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
          Key Multi-Year Thermal Milestones
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-xs pt-1">
          {NAGPUR_TEMPORAL_SERIES.map((t) => (
            <div key={t.year} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <div className="font-bold text-blue-600 font-mono-tech text-sm">{t.year}</div>
              <div className="text-slate-800 font-semibold">{t.meanLst.toFixed(1)}°C Mean</div>
              <div className="text-slate-500 text-[11px]">UHI Delta: +{t.uhiIntensity}°C</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
