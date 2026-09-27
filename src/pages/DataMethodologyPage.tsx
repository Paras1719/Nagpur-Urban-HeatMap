import type { FC } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/PageHeader';
import { Database, GitCommit, Radio, BookOpen } from 'lucide-react';

export const DataMethodologyPage: FC = () => {
  const visualSteps = [
    { title: 'Satellite Data', subtitle: 'Landsat 8/9 & Sentinel-2 MSI acquisition' },
    { title: 'Preprocessing', subtitle: 'Radiometric calibration & atmospheric correction' },
    { title: 'LST Extraction', subtitle: 'Split-window thermal infrared algorithm (°C)' },
    { title: 'NDVI / NDBI / MNDWI', subtitle: 'Spectral vegetation & built-up index computation' },
    { title: 'Land Cover', subtitle: 'Dynamic World 10m land-use classification' },
    { title: 'Spatial Analysis', subtitle: '10 NMC administrative ward zonal aggregation' },
    { title: 'Temporal Analysis', subtitle: '5-Year trend analysis (2019–2024)' },
    { title: 'Hotspot Detection', subtitle: 'Getis-Ord Gi* spatial autocorrelation' },
    { title: 'Scenario Analysis', subtitle: 'Microclimate regression modeling' },
    { title: 'UHI Insights', subtitle: 'Nagpur digital-twin decision support' },
  ];

  const datasetExplanations = [
    {
      name: 'USGS Landsat 8/9 TIRS',
      provides: 'Thermal Infrared (TIRS) Band 10 surface radiance.',
      whyUsed: 'Essential for measuring Land Surface Temperature (LST) across urban surfaces.',
      contribution: 'Provides core ground temperature metrics for UHI detection.',
    },
    {
      name: 'Copernicus Sentinel-2 MSI',
      provides: '10m Multispectral Surface Reflectance (Red, NIR, SWIR bands).',
      whyUsed: 'Enables high-resolution calculation of NDVI (canopy) and NDBI (built-up).',
      contribution: 'Quantifies urban greening and concrete density.',
    },
    {
      name: 'Google Dynamic World 10m',
      provides: 'Near real-time 9-class Land Cover classification.',
      whyUsed: 'Differentiates built structures, trees, water, and bare soil.',
      contribution: 'Correlates surface heat with specific land cover types.',
    },
    {
      name: 'WorldPop High-Res Demographics',
      provides: '100m gridded population distribution.',
      whyUsed: 'Quantifies human exposure to extreme heat spikes.',
      contribution: 'Identifies vulnerable populations in persistent hotspots.',
    },
    {
      name: 'Copernicus DEM (GLO-30)',
      provides: '30m Digital Elevation Model.',
      whyUsed: 'Calibrates topography and solar aspect shading.',
      contribution: 'Eliminates terrain bias from surface temperature measurements.',
    },
    {
      name: 'Nagpur Municipal Corp (NMC) & OSM',
      provides: 'Administrative ward boundaries, road networks, and landmarks.',
      whyUsed: 'Provides official geographic units for policy intervention.',
      contribution: 'Maps satellite metrics directly to municipal wards.',
    },
    {
      name: 'IMD Sonegaon AWS Station',
      provides: 'In-situ ground air temperature readings.',
      whyUsed: 'Validates satellite LST against ground weather sensors.',
      contribution: 'Ensures data integrity and atmospheric calibration.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto font-sans"
    >
      <PageHeader
        title="Data Sources, Pipeline & Methodology"
        subtitle="Transparent explanation of Earth Observation inputs, data processing pipelines, and analytical algorithms"
      />

      {/* Visual Step-by-Step Processing Pipeline Flow */}
      <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm font-sans space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs">
          <div className="flex items-center space-x-2">
            <GitCommit className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-900 text-sm">End-to-End Data Processing Pipeline</span>
          </div>
          <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> All Pipelines Operational
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-xs pt-2">
          {visualSteps.map((step, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between space-y-1">
              <div className="text-[10px] font-bold text-blue-600 font-mono-tech">PHASE 0{idx + 1}</div>
              <div className="font-bold text-slate-900">{step.title}</div>
              <div className="text-[11px] text-slate-500 leading-tight">{step.subtitle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Section */}
      <div className="space-y-4 font-sans">
        <h3 className="text-sm font-bold text-slate-900 tracking-wider flex items-center space-x-2">
          <Database className="w-4 h-4 text-blue-600" />
          <span>Federated Datasets Used by the Platform</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {datasetExplanations.map((ds, i) => (
            <div key={i} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm space-y-2 text-xs">
              <div className="font-bold text-slate-900 text-sm text-blue-600">{ds.name}</div>
              <div className="space-y-1 text-slate-700">
                <div><strong className="text-slate-900">What it provides:</strong> {ds.provides}</div>
                <div><strong className="text-slate-900">Why it is used:</strong> {ds.whyUsed}</div>
                <div><strong className="text-slate-900">UHI Contribution:</strong> {ds.contribution}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology Section */}
      <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4 font-sans">
        <h3 className="text-sm font-bold text-slate-900 tracking-wider flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Core Methodology Summaries</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <h4 className="font-bold text-slate-900">1. Radiometric Calibration & LST Algorithm</h4>
            <p className="text-slate-600 leading-relaxed">
              Thermal Infrared (TIRS) Band 10 is converted to Top of Atmosphere Radiance. Fractional Vegetation Cover (FVC) derived from Sentinel-2 NDVI is used to estimate Land Surface Emissivity (LSE) to extract surface temperature (°C).
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <h4 className="font-bold text-slate-900">2. NDVI & NDBI Index Computation</h4>
            <p className="text-slate-600 leading-relaxed">
              Normalized Difference Vegetation Index (NDVI = (NIR - Red) / (NIR + Red)) quantifies green canopy density. Normalized Difference Built-Up Index (NDBI = (SWIR - NIR) / (SWIR + NIR)) isolates impervious urban structures.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
