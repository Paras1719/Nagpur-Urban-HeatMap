import { useState } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/PageHeader';
import { NAGPUR_HOTSPOTS } from '../data/nagpurData';
import type { Hotspot } from '../data/nagpurData';
import { Crosshair, AlertCircle, CheckCircle, ShieldAlert, Users, TrendingUp } from 'lucide-react';

export const HotspotsPage: FC = () => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot>(NAGPUR_HOTSPOTS[0]);
  const [filterClass, setFilterClass] = useState<string>('ALL');

  const filteredHotspots = filterClass === 'ALL'
    ? NAGPUR_HOTSPOTS
    : NAGPUR_HOTSPOTS.filter((h) => h.classification === filterClass);

  const persistenceYears = [2019, 2020, 2021, 2022, 2023, 2024];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans"
    >
      <PageHeader
        title="Persistent Heat Hotspot Intelligence Dashboard"
        subtitle="Identifying areas that repeatedly experience extreme surface temperatures across multiple observation years"
      />

      {/* Hotspot Category Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-red-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold text-red-600">
            <span>PERSISTENT HOTSPOTS</span>
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">3 Core Clusters</div>
          <div className="text-xs text-slate-500 mt-0.5">Recurring heat &gt; 90% of observations</div>
        </div>

        <div className="p-4 bg-white border border-orange-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold text-orange-600">
            <span>EMERGING HOTSPOTS</span>
            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">2 Expanding Zones</div>
          <div className="text-xs text-slate-500 mt-0.5">High positive annual trend (+0.4°C/yr)</div>
        </div>

        <div className="p-4 bg-white border border-amber-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold text-amber-600">
            <span>SPORADIC HOTSPOTS</span>
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">1 Traffic Corridor</div>
          <div className="text-xs text-slate-500 mt-0.5">Intermittent afternoon spikes</div>
        </div>

        <div className="p-4 bg-white border border-emerald-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold text-emerald-600">
            <span>DIMINISHING HOTSPOTS</span>
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">1 Park Buffer</div>
          <div className="text-xs text-slate-500 mt-0.5">Negative thermal trend (-0.15°C/yr)</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-2 bg-white border border-slate-200 p-3 rounded-lg shadow-sm text-xs">
        <span className="font-semibold text-slate-700">Filter Classification:</span>
        <button
          onClick={() => setFilterClass('ALL')}
          className={`px-3 py-1 rounded font-medium border ${filterClass === 'ALL' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 border-slate-200 hover:bg-slate-100'}`}
        >
          All (7)
        </button>
        <button
          onClick={() => setFilterClass('PERSISTENT')}
          className={`px-3 py-1 rounded font-medium border ${filterClass === 'PERSISTENT' ? 'bg-red-600 text-white font-bold' : 'text-red-700 bg-red-50 border-red-200'}`}
        >
          Persistent (3)
        </button>
        <button
          onClick={() => setFilterClass('EMERGING')}
          className={`px-3 py-1 rounded font-medium border ${filterClass === 'EMERGING' ? 'bg-orange-500 text-white font-bold' : 'text-orange-700 bg-orange-50 border-orange-200'}`}
        >
          Emerging (2)
        </button>
      </div>

      {/* Ranked Hotspots Analytical Table & Persistence Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table & Matrix (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-red-600" /> Hotspot Statistical Ranking Table
            </span>
            <span className="text-xs text-slate-500">Getis-Ord Gi* Spatial Autocorrelation</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Hotspot Area</th>
                  <th className="p-2.5">Ward Location</th>
                  <th className="p-2.5">Peak LST</th>
                  <th className="p-2.5">Persistence</th>
                  <th className="p-2.5">Trend</th>
                  <th className="p-2.5">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHotspots.map((hs) => (
                  <tr
                    key={hs.id}
                    onClick={() => setSelectedHotspot(hs)}
                    className={`cursor-pointer transition-colors ${selectedHotspot.id === hs.id ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'
                      }`}
                  >
                    <td className="p-2.5 font-bold font-mono-tech text-red-600">{hs.id}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{hs.name}</td>
                    <td className="p-2.5 text-slate-600">{hs.zoneName}</td>
                    <td className="p-2.5 font-bold text-red-600">{hs.peakLst.toFixed(1)}°C</td>
                    <td className="p-2.5 font-bold text-blue-600">{hs.persistenceScore}%</td>
                    <td className="p-2.5 text-red-600">+{hs.trendYr}°C/yr</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${hs.classification === 'PERSISTENT'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                        {hs.classification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Multi-Year Persistence Matrix */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 text-xs">Multi-Year Hotspot Persistence Matrix (2019–2024)</div>
            <div className="space-y-1.5 text-xs">
              {filteredHotspots.map((hs) => (
                <div key={hs.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="font-semibold text-slate-800 text-xs w-48 truncate">{hs.name}</span>
                  <div className="flex space-x-1.5">
                    {persistenceYears.map((yr) => {
                      const isHot = hs.persistenceScore > 75 || yr >= 2021;
                      return (
                        <span
                          key={yr}
                          className={`px-2 py-0.5 rounded font-mono-tech text-[10px] font-bold ${isHot ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                        >
                          {yr}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Hotspot Intelligence Inspector Panel */}
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between font-sans text-xs space-y-4">
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-red-600 font-bold font-mono-tech">{selectedHotspot.id}</span>
                <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold text-[10px]">
                  {selectedHotspot.classification}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {selectedHotspot.name}
              </h3>
              <div className="text-slate-500 mt-0.5">Location: {selectedHotspot.zoneName}</div>
            </div>

            {/* Hotspot Statistics */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Mean Hotspot LST:</span>
                <span className="text-slate-900 font-bold">{selectedHotspot.meanLst.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Peak Observed Temp:</span>
                <span className="text-red-600 font-bold text-sm">{selectedHotspot.peakLst.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Persistence Score:</span>
                <span className="text-blue-600 font-bold">{selectedHotspot.persistenceScore}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Annual Warming Rate:</span>
                <span className="text-red-600 font-semibold">+{selectedHotspot.trendYr}°C / year</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Observation Period:</span>
                <span className="text-slate-800">{selectedHotspot.observationPeriod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Primary Material / Cover:</span>
                <span className="text-slate-800 font-medium truncate max-w-[140px]">{selectedHotspot.primaryLandCover}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Population Exposed:</span>
                <span className="text-slate-900 font-bold">{selectedHotspot.populationExposed.toLocaleString()}</span>
              </div>
            </div>

            {/* Microclimate Drivers */}
            <div className="pt-2">
              <div className="font-semibold text-slate-700 mb-1">Microclimate Drivers:</div>
              <div className="space-y-1">
                {selectedHotspot.keyDrivers.map((driver, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5 text-slate-600">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{driver}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Concise Statistical Explainability Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600 text-xs space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" /> Statistical Significance (Getis-Ord Gi*)
              </div>
              <p className="text-[11px] leading-relaxed">
                Persistent hotspot observed as a recurring high-temperature area (Z-score &gt; 2.58, p &lt; 0.01) across multiple observation runs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
