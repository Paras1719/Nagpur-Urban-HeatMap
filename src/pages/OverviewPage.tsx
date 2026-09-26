import { useState } from 'react';
import type { FC } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '../components/PageHeader';
import { MetricBlock } from '../components/MetricBlock';
import { GisMap } from '../components/GisMap';
import { NAGPUR_METRICS, NAGPUR_ZONES } from '../data/nagpurData';
import type { NMCZone } from '../data/nagpurData';
import { Info, ArrowUpRight, Flame, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OverviewPage: FC = () => {
  const [selectedZone, setSelectedZone] = useState<NMCZone | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        ease: 'easeOut',
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans"
    >
      <PageHeader
        title="Nagpur Spatial Heat Overview"
        action={
          <Link
            to="/heat-map"
            className="flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded transition-all shadow-sm"
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>Detailed LST Analysis Workspace</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {/* Main Focus: Primary Nagpur Leaflet Map Centerpiece */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Leaflet Map Display (3 cols) */}
        <div className="lg:col-span-3 border border-slate-200 bg-white rounded-lg p-2 shadow-sm relative flex flex-col h-[530px]">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 rounded-t">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Nagpur Urban Heat Map — 10 NMC Administrative Wards</span>
            </div>
            <span className="text-slate-500 font-mono-tech text-[11px]">Leaflet + OpenStreetMap</span>
          </div>

          <div className="flex-1 relative rounded-b overflow-hidden">
            <GisMap
              selectedZoneId={selectedZone?.id}
              onSelectZone={setSelectedZone}
              activeLayer="LST"
              activeYear={2024}
              opacity={0.75}
              showHotspots
              showZones
              showWater
            />
          </div>
        </div>

        {/* Selected Zone Info Side Drawer */}
        <div className="border border-slate-200 bg-white rounded-lg p-4 shadow-sm flex flex-col justify-between font-sans">
          {selectedZone ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <div className="flex items-center justify-between text-xs text-blue-600 font-semibold mb-1">
                  <span>ZONE {selectedZone.number}</span>
                  <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded font-bold text-[10px]">
                    {selectedZone.hotspotStatus}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedZone.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedZone.description}
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Mean LST (2024):</span>
                  <span className="text-red-600 font-bold">{selectedZone.meanLst2024.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">5-Yr Temperature Change:</span>
                  <span className="text-slate-900 font-semibold">+{selectedZone.trend5Yr}°C</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Vegetation Index (NDVI):</span>
                  <span className="text-emerald-700 font-semibold">{selectedZone.ndvi.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Built-Up Fraction:</span>
                  <span className="text-slate-900 font-semibold">{selectedZone.builtUpPct.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Canopy Cover:</span>
                  <span className="text-slate-900 font-semibold">{selectedZone.vegetationPct.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Population Exposed:</span>
                  <span className="text-slate-900 font-semibold">{selectedZone.population.toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/heat-map"
                className="mt-4 w-full flex items-center justify-center space-x-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded transition-all"
              >
                <span>View Full LST Analysis</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-3">
              <Info className="w-8 h-8 text-blue-500/60" />
              <div className="text-xs font-semibold text-slate-700">Click any Zone on the Nagpur Map to inspect spatial thermal profile</div>
              <div className="text-xs text-slate-400">
                10 Administrative NMC zones monitored via Landsat & Sentinel satellites.
              </div>
            </div>
          )}

          {/* Quick Zone Rank list */}
          <div className="pt-3 border-t border-slate-200 mt-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hottest Wards (May 2024)</div>
            <div className="space-y-1">
              {NAGPUR_ZONES.slice()
                .sort((a, b) => b.meanLst2024 - a.meanLst2024)
                .slice(0, 3)
                .map((z, idx) => (
                  <button
                    key={z.id}
                    onClick={() => setSelectedZone(z)}
                    className="w-full text-left flex items-center justify-between text-xs p-1.5 hover:bg-slate-100 rounded transition-colors"
                  >
                    <span className="text-slate-700 font-medium">
                      0{idx + 1}. {z.name}
                    </span>
                    <span className="text-red-600 font-bold">{z.meanLst2024.toFixed(1)}°C</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Compact KPIs */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <MetricBlock
          label="AVERAGE LST"
          value={`${NAGPUR_METRICS.meanSurfaceTemp2024.toFixed(1)}°C`}
          change="+1.4°C"
          subtext="City-wide mean"
          thermalColor
        />
        <MetricBlock
          label="MAXIMUM LST"
          value={`${NAGPUR_METRICS.maxSurfaceTemp2024.toFixed(1)}°C`}
          subtext="Satranjipura Peak"
          highlight
        />
        <MetricBlock
          label="HOTSPOT AREA"
          value={`${NAGPUR_METRICS.persistentHotspotAreaKm2} km²`}
          subtext="High heat clusters"
        />
        <MetricBlock
          label="VEGETATION COVER"
          value={`${NAGPUR_METRICS.vegetationCoverPct}%`}
          change="-2.4%"
          subtext="NDVI > 0.3"
        />
        <MetricBlock
          label="BUILT-UP AREA"
          value={`${NAGPUR_METRICS.builtUpCoverPct}%`}
          change="+3.8%"
          subtext="Impervious fraction"
        />
        <MetricBlock
          label="ANALYSIS YEAR"
          value={2024}
          subtext="Landsat & Sentinel"
          status="CURRENT"
        />
      </motion.div>
    </motion.div>
  );
};
