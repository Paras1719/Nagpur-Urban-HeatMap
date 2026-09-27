import type { FC } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/PageHeader';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  Line,
  ComposedChart,
} from 'recharts';
import {
  ThermometerSun,
  Leaf,
  Building2,
  AlertTriangle,
  MapPin,
  Flame,
  Activity,
} from 'lucide-react';

import {
  useLstAnalysis,
  LULC_COLORS,
  HOTSPOT_COLORS,
  CORR_KEYS,
} from '../hooks/useLstAnalysis';

const NO_ANIM = { isAnimationActive: false } as const;

export const TemporalPage: FC = () => {
  // Single hook call — owns selection state internally
  const {
    years,
    wards,
    cellIds,
    records,
    lulcSeries,
    lulcKeysPresent,
    scatterData,
    trendClassBreakdown,
    topWarming,
    cellTimeline,
    hotspotStrip,
    correlationMatrix,
    kpis,
    selectedWards,
    selectedCell,
    toggleWard,
    setSelectedCell,
    isReady,
  } = useLstAnalysis();

  if (!isReady) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
          <strong>No CSV data loaded.</strong>
          <p className="mt-2">
            Verify{' '}
            <code className="bg-amber-100 px-1 rounded">
              src/data/nagpur_lst_urban_dataset.csv
            </code>{' '}
            exists and contains a header row + data rows.
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans"
    >
      <PageHeader
        title="Multi-Temporal Thermal Evolution"
        subtitle={`Panel analysis across ${years.length} years · ${cellIds.length} cells · ${wards.length} wards · ${records.length} observations`}
      />

      {/* ============================================================
          KPI STRIP
          ============================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-slate-500">
            <ThermometerSun className="w-3.5 h-3.5 text-red-600" /> LST Change
          </div>
          <div
            className={`text-2xl font-bold mt-1 ${kpis.lstDelta >= 0 ? 'text-red-600' : 'text-emerald-700'
              }`}
          >
            {kpis.lstDelta >= 0 ? '+' : ''}
            {kpis.lstDelta}°C
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {kpis.firstYear} → {kpis.lastYear}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-slate-500">
            <Leaf className="w-3.5 h-3.5 text-emerald-700" /> NDVI Change
          </div>
          <div
            className={`text-2xl font-bold mt-1 ${kpis.ndviDelta >= 0 ? 'text-emerald-700' : 'text-red-600'
              }`}
          >
            {kpis.ndviDelta >= 0 ? '+' : ''}
            {kpis.ndviDelta}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Vegetation trend</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-slate-500">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Hotspot Cells
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {kpis.lastHotspotCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {kpis.hotspotDelta >= 0 ? '+' : ''}
            {kpis.hotspotDelta} vs {kpis.firstYear}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-slate-600" /> Peak LST
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-1">
            {kpis.peakLst.toFixed(1)}°C
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across all years</div>
        </div>
      </div>

      {/* ============================================================
          A. HOTSPOT PERSISTENCE HEAT-STRIP
          ============================================================ */}
      <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-2">
          <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-red-600" />
            Hotspot Persistence Heat-Strip
          </span>
          <span className="text-[11px] text-slate-500">
            {hotspotStrip.length} cells × {years.length} years · sorted
            hottest-first
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold">
          <span className="text-slate-500 uppercase tracking-wider">
            Hotspot class
          </span>
          {(
            ['Hot Spot', 'Not Significant', 'Cold Spot', 'Missing'] as const
          ).map((k) => (
            <span key={k} className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-sm border border-slate-200"
                style={{
                  background:
                    k === 'Hot Spot'
                      ? '#a8453a'
                      : k === 'Cold Spot'
                        ? '#2563eb'
                        : k === 'Not Significant'
                          ? '#c2ab85'
                          : '#ecebe8',
                }}
              />
              <span className="text-slate-700">{k}</span>
            </span>
          ))}
        </div>

        {/* Strip table */}
        <div className="overflow-auto max-h-[360px] border border-slate-200 rounded">
          <table className="w-full text-[10px] border-separate border-spacing-0">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr>
                <th className="text-left px-2 py-1.5 font-semibold text-slate-600 border-b border-slate-200 sticky left-0 bg-slate-50">
                  Cell / Ward
                </th>
                {years.map((y) => (
                  <th
                    key={y}
                    className="px-1 py-1.5 font-mono text-slate-600 border-b border-slate-200 min-w-[38px]"
                  >
                    {String(y).slice(-2)}
                  </th>
                ))}
                <th className="px-2 py-1.5 font-semibold text-slate-600 border-b border-slate-200 text-right">
                  Hot yrs
                </th>
              </tr>
            </thead>
            <tbody>
              {hotspotStrip.map((row) => {
                const hotCount = row.years.filter(
                  (y) => y.cls === 'Hot Spot'
                ).length;
                return (
                  <tr key={row.cellId} className="hover:bg-slate-50">
                    <td className="px-2 py-1 border-b border-slate-100 sticky left-0 bg-white whitespace-nowrap">
                      <div className="font-semibold text-slate-800">
                        {row.cellId}
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {row.ward.replace(/^Ward\s/, 'W')}
                      </div>
                    </td>
                    {years.map((y) => {
                      const hit = row.years.find((x) => x.year === y);
                      const bg = !hit
                        ? '#ecebe8'
                        : hit.cls === 'Hot Spot'
                          ? '#a8453a'
                          : hit.cls === 'Cold Spot'
                            ? '#2563eb'
                            : hit.cls === 'Not Significant'
                              ? '#c2ab85'
                              : '#ecebe8';
                      return (
                        <td
                          key={y}
                          className="p-0.5 border-b border-slate-100"
                          title={`${row.cellId} · ${y} · ${hit?.cls ?? 'No data'}`}
                        >
                          <div
                            className="w-full h-4 rounded-sm"
                            style={{ background: bg }}
                          />
                        </td>
                      );
                    })}
                    <td className="px-2 py-1 border-b border-slate-100 text-right font-mono font-bold text-red-700">
                      {hotCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-500">
          Dark red cells = recurring hotspots. A cell with 4+ hot years is a
          persistent UHI anchor.
        </p>
      </div>

      {/* ============================================================
          B. PEARSON CORRELATION MATRIX
          ============================================================ */}
      <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-2">
          <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" />
            Pearson Correlation Matrix
          </span>
          <span className="text-[11px] text-slate-500">
            Pairwise across {records.length} cell-year observations
          </span>
        </div>

        <div className="overflow-auto">
          <table className="border-separate border-spacing-0 text-[10px]">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white z-10" />
                {CORR_KEYS.map((c) => (
                  <th
                    key={c.label}
                    className="px-1.5 py-1 font-mono font-semibold text-slate-600 text-center"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlationMatrix.map((row) => (
                <tr key={row.label}>
                  <td className="sticky left-0 bg-white pr-2 py-1 font-mono font-semibold text-slate-700 text-right whitespace-nowrap">
                    {row.label}
                  </td>
                  {row.values.map((v, j) => {
                    const mag = Math.min(1, Math.abs(v));
                    const bg =
                      v >= 0
                        ? `rgba(168, 69, 58, ${0.15 + mag * 0.75})`
                        : `rgba(37, 99, 235, ${0.15 + mag * 0.75})`;
                    const fg = mag > 0.55 ? '#ffffff' : '#2a2620';
                    return (
                      <td
                        key={j}
                        className="w-10 h-10 text-center font-mono font-bold border border-white rounded-sm transition-transform hover:scale-110 hover:z-10 relative"
                        style={{ background: bg, color: fg }}
                        title={`${row.label} ↔ ${CORR_KEYS[j].label}: ${v}`}
                      >
                        {v.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-100">
          <div className="p-2 bg-red-50 border border-red-200 rounded">
            <strong className="text-red-700">Strong positive</strong>
            <p className="text-slate-600 mt-0.5">
              Higher value of one → higher value of the other (e.g. LST ↔ NDBI).
            </p>
          </div>
          <div className="p-2 bg-blue-50 border border-blue-200 rounded">
            <strong className="text-blue-700">Strong negative</strong>
            <p className="text-slate-600 mt-0.5">
              Higher value of one → lower value of the other (e.g. LST ↔ NDVI).
            </p>
          </div>
          <div className="p-2 bg-slate-50 border border-slate-200 rounded">
            <strong className="text-slate-700">Near zero</strong>
            <p className="text-slate-600 mt-0.5">
              No linear relationship — spatially independent fields.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================
          LULC COMPOSITION OVER TIME
          ============================================================ */}
      <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="font-bold text-slate-900 text-sm">
            Land Cover Composition Over Time (% of cells)
          </span>
          <span className="text-[11px] text-slate-500">
            Changes reveal urbanisation vs greening
          </span>
        </div>

        <div className="h-[260px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={lulcSeries}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fill: '#514e48', fontSize: 12 }} />
              <YAxis tick={{ fill: '#514e48', fontSize: 12 }} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderColor: '#d9c8ab',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(v: number) => `${v}%`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {lulcKeysPresent.map((k) => (
                <Bar
                  {...NO_ANIM}
                  key={k}
                  dataKey={k}
                  stackId="lulc"
                  fill={LULC_COLORS[k]}
                  name={k}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================
          WARD SELECTOR (compact — retains functionality but no chart)
          ============================================================ */}
      <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div>
            <span className="font-bold text-slate-900 text-sm">
              Ward Focus Selector
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Select wards to scope the cell dropdown and top-movers list
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {wards.map((w) => {
            const isSelected = selectedWards.includes(w);
            return (
              <button
                key={w}
                onClick={() => toggleWard(w)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${isSelected
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                {w.replace(/^Ward\s/, 'W')}
              </button>
            );
          })}
        </div>

        {selectedWards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            {selectedWards.map((w) => {
              const lastRow = years
                .map((y) => {
                  const rows = records.filter(
                    (r) => r.year === y && r.wardId === w
                  );
                  return rows.length
                    ? {
                      year: y,
                      meanLst:
                        rows.reduce((s, r) => s + r.lstCelsius, 0) /
                        rows.length,
                    }
                    : null;
                })
                .filter(Boolean) as Array<{ year: number; meanLst: number }>;
              const first = lastRow[0];
              const last = lastRow[lastRow.length - 1];
              const delta = first && last ? last.meanLst - first.meanLst : 0;
              return (
                <div
                  key={w}
                  className="p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center"
                >
                  <span className="font-semibold text-slate-800">{w}</span>
                  <span className="font-mono text-slate-600">
                    {last ? last.meanLst.toFixed(1) : '—'}°C{' '}
                    <span
                      className={
                        delta >= 0 ? 'text-red-600' : 'text-emerald-700'
                      }
                    >
                      ({delta >= 0 ? '+' : ''}
                      {delta.toFixed(2)})
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================
          SCATTER + TREND CLASS
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 text-sm">
              NDVI vs LST — All Cells &amp; Years
            </span>
            <span className="text-[11px] text-slate-500">
              Bubble = building density
            </span>
          </div>
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="x"
                  name="NDVI"
                  tick={{ fill: '#514e48', fontSize: 11 }}
                  domain={['dataMin - 0.1', 'dataMax + 0.1']}
                  tickFormatter={(v) => Number(v).toFixed(1)}
                />
                <YAxis
                  dataKey="y"
                  name="LST (°C)"
                  unit="°C"
                  tick={{ fill: '#514e48', fontSize: 11 }}
                />
                <ZAxis dataKey="z" range={[20, 200]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 p-2 shadow-md rounded text-xs">
                        <strong>{d.cell}</strong>
                        <br />
                        Year: <strong>{d.year}</strong>
                        <br />
                        Ward: {d.ward}
                        <br />
                        NDVI: {Number(d.x).toFixed(2)}
                        <br />
                        LST:{' '}
                        <strong className="text-red-600">
                          {Number(d.y).toFixed(1)}°C
                        </strong>
                      </div>
                    );
                  }}
                />
                <Scatter
                  {...NO_ANIM}
                  data={scatterData}
                  fill="#a8453a"
                  fillOpacity={0.55}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 text-sm">
              Trend Classification Breakdown
            </span>
            <span className="text-[11px] text-slate-500">
              Per-cell trajectory label
            </span>
          </div>
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendClassBreakdown}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  horizontal={false}
                />
                <XAxis type="number" tick={{ fill: '#514e48', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#514e48', fontSize: 11 }}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderColor: '#d9c8ab',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  {...NO_ANIM}
                  dataKey="value"
                  name="Cell-years"
                  radius={[0, 6, 6, 0]}
                >
                  {trendClassBreakdown.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.name === 'Persistent'
                          ? '#a8453a'
                          : entry.name === 'Emerging'
                            ? '#a86a2b'
                            : entry.name === 'Sporadic'
                              ? '#c2ab85'
                              : '#8b6f47'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ============================================================
          TOP WARMING + CELL DRILL-DOWN
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 text-sm">
              Fastest Warming Cells (ΔLST)
            </span>
            <span className="text-[11px] text-slate-500">First vs last year</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {topWarming.map((m, i) => (
              <button
                key={m.cellId}
                onClick={() => setSelectedCell(m.cellId)}
                className="w-full flex items-center justify-between text-xs p-2 rounded border border-slate-100 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 w-5">
                    0{i + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-800">
                      {m.cellId}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {m.ward} · {m.trendClass}
                    </div>
                  </div>
                </div>
                <span className="font-bold text-red-600">
                  {m.delta >= 0 ? '+' : ''}
                  {m.delta}°C
                </span>
              </button>
            ))}
            {topWarming.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">
                No multi-year cells found.
              </p>
            )}
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" /> Cell Timeline Inspector
            </span>
            <select
              value={selectedCell}
              onChange={(e) => setSelectedCell(e.target.value)}
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {cellIds.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="h-[230px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={cellTimeline}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" tick={{ fill: '#514e48', fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#514e48', fontSize: 11 }}
                  unit="°C"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#4f7a5c', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderColor: '#d9c8ab',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  {...NO_ANIM}
                  yAxisId="left"
                  type="monotone"
                  dataKey="lstCelsius"
                  name="LST (°C)"
                  stroke="#a8453a"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  {...NO_ANIM}
                  yAxisId="right"
                  type="monotone"
                  dataKey="ndvi"
                  name="NDVI"
                  stroke="#4f7a5c"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  {...NO_ANIM}
                  yAxisId="right"
                  type="monotone"
                  dataKey="ndbi"
                  name="NDBI"
                  stroke="#a86a2b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 flex flex-wrap gap-3 pt-1">
            <span>
              Records: <strong>{cellTimeline.length}</strong>
            </span>
            <span>
              Ward: <strong>{cellTimeline[0]?.wardId}</strong>
            </span>
            <span>
              Hotspot:{' '}
              <strong
                style={{
                  color:
                    HOTSPOT_COLORS[
                    cellTimeline[cellTimeline.length - 1]?.hotspotClass
                    ],
                }}
              >
                {cellTimeline[cellTimeline.length - 1]?.hotspotClass}
              </strong>
            </span>
            <span>
              Trend:{' '}
              <strong>{cellTimeline[cellTimeline.length - 1]?.trendClass}</strong>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};  