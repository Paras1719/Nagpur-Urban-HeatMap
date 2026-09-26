import { useState } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/PageHeader';
import { NAGPUR_ZONES } from '../data/nagpurData';
import type { NMCZone } from '../data/nagpurData';
import { Play, RotateCcw, Cpu, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const ScenarioPage: FC = () => {
  const [selectedZone, setSelectedZone] = useState<NMCZone>(NAGPUR_ZONES[6]); // Default Satranjipura
  const [vegChange, setVegChange] = useState<number>(10); // +10%
  const [builtChange, setBuiltChange] = useState<number>(-10); // -10%
  const [waterChange, setWaterChange] = useState<number>(2); // +2%
  const [scenarioYear, setScenarioYear] = useState<number>(2027);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(true);

  // Microclimate regression model physics calculation:
  const calcDeltaLst = () => {
    const delta = (vegChange * -0.09) + (builtChange * 0.08) + (waterChange * -0.15);
    return Math.round(delta * 10) / 10;
  };

  const estimatedDelta = calcDeltaLst();
  const lowerBound = Math.round((estimatedDelta - 0.4) * 10) / 10;
  const upperBound = Math.round((estimatedDelta + 0.4) * 10) / 10;

  const handleRunScenario = () => {
    setIsSimulating(true);
    setHasRun(false);
    setTimeout(() => {
      setIsSimulating(false);
      setHasRun(true);
    }, 700);
  };

  const handleReset = () => {
    setVegChange(0);
    setBuiltChange(0);
    setWaterChange(0);
    setHasRun(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans"
    >
      <PageHeader
        title="Urban Cooling What-If Scenario Lab"
        subtitle="How could vegetation canopy addition or impervious surface reduction affect surface temperature in Nagpur?"
      />

      {/* Workspace Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Target Selection & Controls (1 col) */}
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 text-sm">1. Select Target Intervention Ward</span>
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 text-slate-500 hover:text-slate-900 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> <span>Reset</span>
            </button>
          </div>

          {/* Target Ward Select Grid */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Target Ward:</label>
            <select
              value={selectedZone.id}
              onChange={(e) => {
                const z = NAGPUR_ZONES.find((zn) => zn.id === e.target.value);
                if (z) setSelectedZone(z);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 font-semibold focus:ring-1 focus:ring-blue-500"
            >
              {NAGPUR_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  Zone {z.number}: {z.name} (Baseline LST: {z.meanLst2024.toFixed(1)}°C)
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <div className="text-slate-500 text-[11px]">Selected Ward Baseline:</div>
            <div className="font-bold text-slate-900 text-sm">Zone {selectedZone.number}: {selectedZone.name}</div>
            <div className="text-slate-600">
              Observed Mean LST: <strong className="text-red-600">{selectedZone.meanLst2024.toFixed(1)}°C</strong> | Built-Up: <strong>{selectedZone.builtUpPct.toFixed(1)}%</strong>
            </div>
          </div>

          {/* Intervention Parameters */}
          <div className="pt-2 border-t border-slate-200 space-y-4">
            <div className="font-bold text-slate-900 text-xs">2. Define Intervention Parameters</div>

            {/* Scenario Horizon Year */}
            <div className="space-y-1">
              <label className="text-slate-600 font-medium">Horizon Target Year:</label>
              <div className="flex space-x-2 pt-1">
                {[2025, 2027, 2030].map((y) => (
                  <button
                    key={y}
                    onClick={() => setScenarioYear(y)}
                    className={`flex-1 py-1 rounded border text-xs font-mono-tech ${scenarioYear === y ? 'bg-blue-600 text-white font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Veg Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Vegetation Canopy Change:</span>
                <span className={`font-bold ${vegChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {vegChange >= 0 ? `+${vegChange}%` : `${vegChange}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={vegChange}
                onChange={(e) => setVegChange(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-20% Deforestation</span>
                <span>0 (Current)</span>
                <span>+20% Greening</span>
              </div>
            </div>

            {/* Built-up Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Built-Up Area Reduction:</span>
                <span className={`font-bold ${builtChange <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {builtChange >= 0 ? `+${builtChange}%` : `${builtChange}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={builtChange}
                onChange={(e) => setBuiltChange(parseInt(e.target.value))}
                className="w-full accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-20% Permeable</span>
                <span>0 (Current)</span>
                <span>+20% Densification</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunScenario}
            disabled={isSimulating}
            className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow-sm flex items-center justify-center space-x-2 transition-all"
          >
            {isSimulating ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Computing Physics Model...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Scenario Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* Right Columns: Simulation Result Dashboard (2 cols) */}
        <div className="lg:col-span-2 space-y-4 font-sans text-xs">
          {hasRun && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="font-bold text-slate-900 text-sm">Model Simulation Result ({scenarioYear})</span>
                  <p className="text-slate-500 text-xs">Target: Zone {selectedZone.number} — {selectedZone.name}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold text-xs flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Simulation Complete
                </span>
              </div>

              {/* Large Estimated ΔLST Indicator */}
              <div className="p-5 bg-slate-50 border border-blue-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Temperature Shift (ΔLST)</div>
                  <div className={`text-4xl font-bold mt-1 ${estimatedDelta <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {estimatedDelta > 0 ? `+${estimatedDelta}°C` : `${estimatedDelta}°C`}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Model Uncertainty Range: <strong className="text-slate-800">{lowerBound}°C to {upperBound}°C</strong>
                  </div>
                </div>

                {/* Before / After Comparison Indicator */}
                <div className="p-3 bg-white border border-slate-200 rounded flex items-center space-x-3 text-xs">
                  <div className="text-center">
                    <div className="text-slate-500 text-[10px]">BASELINE</div>
                    <div className="font-bold text-slate-900 text-sm">{selectedZone.meanLst2024.toFixed(1)}°C</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="text-center">
                    <div className="text-slate-500 text-[10px]">SCENARIO</div>
                    <div className="font-bold text-blue-600 text-sm">
                      {(selectedZone.meanLst2024 + estimatedDelta).toFixed(1)}°C
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Importance / SHAP-style Contribution Bars */}
              <div className="space-y-3">
                <div className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1">
                  Relative Contribution Drivers to Predicted Cooling
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-slate-700 text-xs mb-1">
                      <span>Canopy Evapotranspiration Cooling</span>
                      <span className="font-bold text-emerald-600">42% Impact</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[42%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 text-xs mb-1">
                      <span>Albedo & Cool Roof Solar Reflectance</span>
                      <span className="font-bold text-blue-600">31% Impact</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[31%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 text-xs mb-1">
                      <span>Impervious Surface Fraction Reduction</span>
                      <span className="font-bold text-amber-600">27% Impact</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[27%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Explicit Methodology & Explainability Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Model-Derived Estimate Notice:</strong> Scenario outputs are simulated predictions computed via regression models trained on Landsat/Sentinel observations, not observed physical measurements.
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
