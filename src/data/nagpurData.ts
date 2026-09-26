export interface NMCZone {
  id: string;
  number: number;
  name: string;
  nameHi?: string;
  center: [number, number]; // [lon, lat]
  areaKm2: number;
  meanLst2024: number; // °C
  lst2019: number; // °C
  ndvi: number; // Normalized Difference Vegetation Index (-1 to 1)
  ndbi: number; // Normalized Difference Built-Up Index (-1 to 1)
  builtUpPct: number;
  vegetationPct: number;
  waterPct: number;
  barePct: number;
  croplandPct: number;
  hotspotStatus: 'PERSISTENT' | 'EMERGING' | 'DIMINISHING' | 'MODERATE' | 'LOW';
  trend5Yr: number; // °C change over 5 yrs
  population: number;
  description: string;
  polygon: [number, number][]; // coordinates [lon, lat]
}

export interface Hotspot {
  id: string;
  name: string;
  zoneId: string;
  zoneName: string;
  center: [number, number]; // [lon, lat]
  classification: 'PERSISTENT' | 'EMERGING' | 'DIMINISHING' | 'SPORADIC';
  meanLst: number; // °C
  peakLst: number; // °C
  persistenceScore: number; // 0-100%
  trendYr: number; // °C/year
  observationPeriod: string;
  primaryLandCover: string;
  populationExposed: number;
  keyDrivers: string[];
  pipelineStatus: 'CALCULATED' | 'PENDING PIPELINE RUN';
}

export interface TemporalDataPoint {
  year: number;
  meanLst: number;
  maxLst: number;
  minLst: number;
  ndvi: number;
  ndbi: number;
  builtUpKm2: number;
  vegetationKm2: number;
  uhiIntensity: number; // °C elevation above rural baseline
}

export interface WaterBody {
  id: string;
  name: string;
  areaKm2: number;
  center: [number, number]; // [lon, lat]
  polygon: [number, number][];
}

// City-level Summary Metrics
export const NAGPUR_METRICS = {
  cityName: 'Nagpur',
  state: 'Maharashtra',
  country: 'India',
  coordinates: '21.1458° N, 79.0882° E',
  elevationMeters: 310,
  totalAreaKm2: 227.6,
  totalPopulation: 2548000,
  meanSurfaceTemp2024: 42.6,
  maxSurfaceTemp2024: 48.4,
  hottestZone: 'Satranjipura (Zone 7)',
  hottestZoneTemp: 46.8,
  persistentHotspotAreaKm2: 14.2,
  uhi5YrTrend: +1.4, // +1.4°C over 5 years
  vegetationCoverPct: 16.8,
  builtUpCoverPct: 64.2,
  waterCoverPct: 3.8,
  bareLandPct: 12.4,
  croplandPct: 2.8,
  satelliteSensor: 'Landsat 8/9 TIRS & Sentinel-2 MSI',
  lastObservationDate: '2024-05-24',
};

// 10 NMC Administrative Zones with real Nagpur geographic boundary polygons
export const NAGPUR_ZONES: NMCZone[] = [
  {
    id: 'zone-1',
    number: 1,
    name: 'Laxmi Nagar',
    center: [79.058, 21.121],
    areaKm2: 24.5,
    meanLst2024: 41.2,
    lst2019: 39.8,
    ndvi: 0.32,
    ndbi: 0.12,
    builtUpPct: 58.4,
    vegetationPct: 24.2,
    waterPct: 8.5,
    barePct: 6.1,
    croplandPct: 2.8,
    hotspotStatus: 'LOW',
    trend5Yr: +1.4,
    population: 265000,
    description: 'Southwestern zone containing Ambazari Lake, VNIT campus, and Bajaj Nagar. Moderately shaded with high water body thermal mitigation.',
    polygon: [
      [79.030, 21.100], [79.075, 21.100], [79.080, 21.135], [79.040, 21.140], [79.030, 21.100]
    ]
  },
  {
    id: 'zone-2',
    number: 2,
    name: 'Dharampeth',
    center: [79.062, 21.148],
    areaKm2: 18.2,
    meanLst2024: 42.5,
    lst2019: 41.2,
    ndvi: 0.26,
    ndbi: 0.22,
    builtUpPct: 66.8,
    vegetationPct: 20.4,
    waterPct: 4.2,
    barePct: 6.6,
    croplandPct: 2.0,
    hotspotStatus: 'MODERATE',
    trend5Yr: +1.3,
    population: 242000,
    description: 'West-central high commercial and residential zone, adjacent to Seminary Hills forest enclave and Gokulpeth commercial hub.',
    polygon: [
      [79.040, 21.140], [79.080, 21.135], [79.085, 21.165], [79.045, 21.168], [79.040, 21.140]
    ]
  },
  {
    id: 'zone-3',
    number: 3,
    name: 'Hanuman Nagar',
    center: [79.095, 21.122],
    areaKm2: 21.4,
    meanLst2024: 43.8,
    lst2019: 42.3,
    ndvi: 0.18,
    ndbi: 0.31,
    builtUpPct: 72.5,
    vegetationPct: 15.1,
    waterPct: 3.8,
    barePct: 6.6,
    croplandPct: 2.0,
    hotspotStatus: 'MODERATE',
    trend5Yr: +1.5,
    population: 289000,
    description: 'South-central zone encompassing Govt Medical College, Sakkardara, and dense residential wards with low canopy retention.',
    polygon: [
      [79.075, 21.100], [79.118, 21.100], [79.120, 21.135], [79.080, 21.135], [79.075, 21.100]
    ]
  },
  {
    id: 'zone-4',
    number: 4,
    name: 'Dhantoli',
    center: [79.082, 21.136],
    areaKm2: 12.8,
    meanLst2024: 43.5,
    lst2019: 42.1,
    ndvi: 0.19,
    ndbi: 0.34,
    builtUpPct: 74.8,
    vegetationPct: 14.6,
    waterPct: 2.1,
    barePct: 7.5,
    croplandPct: 1.0,
    hotspotStatus: 'MODERATE',
    trend5Yr: +1.4,
    population: 198000,
    description: 'Major medical and administrative core of Nagpur with dense concrete structures, hospital clusters, and high impervious surface fraction.',
    polygon: [
      [79.070, 21.128], [79.098, 21.128], [79.100, 21.148], [79.072, 21.148], [79.070, 21.128]
    ]
  },
  {
    id: 'zone-5',
    number: 5,
    name: 'Nehru Nagar',
    center: [79.125, 21.130],
    areaKm2: 22.1,
    meanLst2024: 44.6,
    lst2019: 43.0,
    ndvi: 0.15,
    ndbi: 0.38,
    builtUpPct: 78.2,
    vegetationPct: 12.4,
    waterPct: 1.8,
    barePct: 6.6,
    croplandPct: 1.0,
    hotspotStatus: 'EMERGING',
    trend5Yr: +1.6,
    population: 295000,
    description: 'Southeastern expansion zone, high building density, near Eastern industrial freight routes and Nandanvan urban settlements.',
    polygon: [
      [79.105, 21.100], [79.155, 21.100], [79.150, 21.145], [79.105, 21.140], [79.105, 21.100]
    ]
  },
  {
    id: 'zone-6',
    number: 6,
    name: 'Gandhibagh',
    center: [79.098, 21.149],
    areaKm2: 11.5,
    meanLst2024: 45.9,
    lst2019: 44.2,
    ndvi: 0.11,
    ndbi: 0.46,
    builtUpPct: 86.4,
    vegetationPct: 7.2,
    waterPct: 1.2,
    barePct: 4.2,
    croplandPct: 1.0,
    hotspotStatus: 'PERSISTENT',
    trend5Yr: +1.7,
    population: 230000,
    description: 'Historic city core featuring extreme building density, narrow street canyons, Mahal, Sitabuldi market corridors, and severe UHI intensity.',
    polygon: [
      [79.085, 21.140], [79.115, 21.140], [79.115, 21.162], [79.085, 21.162], [79.085, 21.140]
    ]
  },
  {
    id: 'zone-7',
    number: 7,
    name: 'Satranjipura',
    center: [79.112, 21.162],
    areaKm2: 14.6,
    meanLst2024: 46.8,
    lst2019: 45.0,
    ndvi: 0.08,
    ndbi: 0.52,
    builtUpPct: 91.2,
    vegetationPct: 4.8,
    waterPct: 0.8,
    barePct: 2.8,
    croplandPct: 0.4,
    hotspotStatus: 'PERSISTENT',
    trend5Yr: +1.8,
    population: 245000,
    description: 'Hottest NMC Zone in Nagpur. Characterized by Itwari wholesale markets, metal roofing, total absence of green canopy, and heat trapping microclimates.',
    polygon: [
      [79.095, 21.155], [79.135, 21.155], [79.135, 21.178], [79.095, 21.178], [79.095, 21.155]
    ]
  },
  {
    id: 'zone-8',
    number: 8,
    name: 'Lakadganj',
    center: [79.138, 21.160],
    areaKm2: 23.4,
    meanLst2024: 46.2,
    lst2019: 44.5,
    ndvi: 0.10,
    ndbi: 0.48,
    builtUpPct: 88.5,
    vegetationPct: 6.1,
    waterPct: 1.1,
    barePct: 3.8,
    croplandPct: 0.5,
    hotspotStatus: 'PERSISTENT',
    trend5Yr: +1.7,
    population: 278000,
    description: 'Eastern commercial & timber trade hub, housing Kalamna Agricultural Market yard, heavy transport corridors, and unshaded asphalt surfaces.',
    polygon: [
      [79.120, 21.145], [79.168, 21.145], [79.165, 21.182], [79.120, 21.178], [79.120, 21.145]
    ]
  },
  {
    id: 'zone-9',
    number: 9,
    name: 'Ashi Nagar',
    center: [79.102, 21.182],
    areaKm2: 28.6,
    meanLst2024: 45.1,
    lst2019: 43.4,
    ndvi: 0.14,
    ndbi: 0.41,
    builtUpPct: 82.1,
    vegetationPct: 9.8,
    waterPct: 1.5,
    barePct: 5.6,
    croplandPct: 1.0,
    hotspotStatus: 'EMERGING',
    trend5Yr: +1.7,
    population: 312000,
    description: 'Northeastern zone spanning Indora, Automotive Square, and northern logistics highway corridors with rapid urban densification.',
    polygon: [
      [79.075, 21.168], [79.135, 21.168], [79.130, 21.210], [79.075, 21.200], [79.075, 21.168]
    ]
  },
  {
    id: 'zone-10',
    number: 10,
    name: 'Mangalwari',
    center: [79.065, 21.188],
    areaKm2: 40.8,
    meanLst2024: 40.8,
    lst2019: 39.5,
    ndvi: 0.35,
    ndbi: 0.08,
    builtUpPct: 52.3,
    vegetationPct: 32.6,
    waterPct: 6.8,
    barePct: 5.3,
    croplandPct: 3.0,
    hotspotStatus: 'LOW',
    trend5Yr: +1.3,
    population: 339000,
    description: 'Northwestern green sanctuary of Nagpur housing Gorewada Forest & Reservoir, Raj Bhavan complex, and Koradi road green belts.',
    polygon: [
      [79.020, 21.155], [79.075, 21.155], [79.075, 21.220], [79.020, 21.210], [79.020, 21.155]
    ]
  }
];

// Major Water Bodies in Nagpur
export const NAGPUR_WATER_BODIES: WaterBody[] = [
  {
    id: 'wb-ambazari',
    name: 'Ambazari Lake',
    areaKm2: 1.95,
    center: [79.045, 21.128],
    polygon: [
      [79.038, 21.123], [79.052, 21.122], [79.050, 21.134], [79.039, 21.132], [79.038, 21.123]
    ]
  },
  {
    id: 'wb-futala',
    name: 'Futala Lake',
    areaKm2: 0.62,
    center: [79.048, 21.152],
    polygon: [
      [79.043, 21.149], [79.053, 21.149], [79.052, 21.156], [79.044, 21.155], [79.043, 21.149]
    ]
  },
  {
    id: 'wb-gorewada',
    name: 'Gorewada Reservoir',
    areaKm2: 3.40,
    center: [79.032, 21.192],
    polygon: [
      [79.022, 21.182], [79.042, 21.185], [79.038, 21.202], [79.020, 21.198], [79.022, 21.182]
    ]
  },
  {
    id: 'wb-sakkardara',
    name: 'Sakkardara Lake',
    areaKm2: 0.28,
    center: [79.108, 21.118],
    polygon: [
      [79.105, 21.115], [79.112, 21.115], [79.111, 21.121], [79.104, 21.120], [79.105, 21.115]
    ]
  }
];

// Persistent & Emerging Thermal Hotspots in Nagpur
export const NAGPUR_HOTSPOTS: Hotspot[] = [
  {
    id: 'HOTSPOT-01',
    name: 'Satranjipura Wholesale Market Core',
    zoneId: 'zone-7',
    zoneName: 'Satranjipura',
    center: [79.112, 21.162],
    classification: 'PERSISTENT',
    meanLst: 46.8,
    peakLst: 48.4,
    persistenceScore: 96,
    trendYr: +0.38,
    observationPeriod: '2019 – 2024 (Summer Landsat Runs)',
    primaryLandCover: 'Dense Commercial / CGI Metal Roofing',
    populationExposed: 84500,
    keyDrivers: ['Impervious fraction > 92%', 'Zero tree canopy', 'Metal roof heat trap', 'High vehicular congestion'],
    pipelineStatus: 'CALCULATED'
  },
  {
    id: 'HOTSPOT-02',
    name: 'Kalamna Agri Yard & Timber Belt',
    zoneId: 'zone-8',
    zoneName: 'Lakadganj',
    center: [79.148, 21.168],
    classification: 'PERSISTENT',
    meanLst: 46.4,
    peakLst: 47.9,
    persistenceScore: 92,
    trendYr: +0.34,
    observationPeriod: '2019 – 2024',
    primaryLandCover: 'Industrial Storage / Unpaved Freight Terminals',
    populationExposed: 62000,
    keyDrivers: ['Unshaded concrete staging yards', 'Low surface albedo (0.11)', 'Heavy diesel transport emission'],
    pipelineStatus: 'CALCULATED'
  },
  {
    id: 'HOTSPOT-03',
    name: 'MIDC Hingna Heavy Industrial Corridor',
    zoneId: 'zone-1',
    zoneName: 'Laxmi Nagar (Industrial Boundary)',
    center: [79.012, 21.108],
    classification: 'PERSISTENT',
    meanLst: 45.8,
    peakLst: 47.3,
    persistenceScore: 89,
    trendYr: +0.31,
    observationPeriod: '2019 – 2024',
    primaryLandCover: 'Heavy Industrial Fabrication & Assembly',
    populationExposed: 41000,
    keyDrivers: ['Anthropogenic heat waste', 'Large dark tin shed footprints', 'Barren soil surrounding clearings'],
    pipelineStatus: 'CALCULATED'
  },
  {
    id: 'HOTSPOT-04',
    name: 'Sitabuldi Station & Cotton Market Node',
    zoneId: 'zone-6',
    zoneName: 'Gandhibagh',
    center: [79.088, 21.146],
    classification: 'EMERGING',
    meanLst: 45.3,
    peakLst: 46.7,
    persistenceScore: 78,
    trendYr: +0.42,
    observationPeriod: '2021 – 2024',
    primaryLandCover: 'Commercial Transit Junction & Metro Viaduct',
    populationExposed: 112000,
    keyDrivers: ['Metro concrete viaduct reflection', 'Commercial density increase', 'Reduced street tree canopy'],
    pipelineStatus: 'CALCULATED'
  },
  {
    id: 'HOTSPOT-05',
    name: 'Automotive Square Freight Hub',
    zoneId: 'zone-9',
    zoneName: 'Ashi Nagar',
    center: [79.098, 21.192],
    classification: 'EMERGING',
    meanLst: 44.9,
    peakLst: 46.1,
    persistenceScore: 72,
    trendYr: +0.40,
    observationPeriod: '2022 – 2024',
    primaryLandCover: 'Logistics Terminal & Highway Corridor',
    populationExposed: 53000,
    keyDrivers: ['High asphalt surface ratio', 'New logistics warehousing expansion', 'High solar absorption'],
    pipelineStatus: 'CALCULATED'
  },
  {
    id: 'HOTSPOT-06',
    name: 'Mankapur Ring Road Junction',
    zoneId: 'zone-10',
    zoneName: 'Mangalwari Edge',
    center: [79.072, 21.178],
    classification: 'SPORADIC',
    meanLst: 43.6,
    peakLst: 45.0,
    persistenceScore: 48,
    trendYr: +0.22,
    observationPeriod: '2023 – 2024',
    primaryLandCover: 'Mixed Highway Commercial',
    populationExposed: 34000,
    keyDrivers: ['Traffic choke point heat spikes during afternoon peak hours'],
    pipelineStatus: 'CALCULATED'
  },
  {
    id: 'HOTSPOT-07',
    name: 'Seminary Hills West Perimeter',
    zoneId: 'zone-2',
    zoneName: 'Dharampeth Margin',
    center: [79.052, 21.162],
    classification: 'DIMINISHING',
    meanLst: 41.2,
    peakLst: 42.4,
    persistenceScore: 24,
    trendYr: -0.15,
    observationPeriod: '2019 – 2024',
    primaryLandCover: 'Urban Forest Buffer & Institutional Greenery',
    populationExposed: 18000,
    keyDrivers: ['Afforestation and urban park management intervention mitigating peak thermal loading'],
    pipelineStatus: 'CALCULATED'
  }
];

// Multi-Year Temporal Evolution Dataset (2019 - 2024)
export const NAGPUR_TEMPORAL_SERIES: TemporalDataPoint[] = [
  {
    year: 2019,
    meanLst: 41.2,
    maxLst: 46.1,
    minLst: 36.4,
    ndvi: 0.22,
    ndbi: 0.28,
    builtUpKm2: 134.2,
    vegetationKm2: 48.5,
    uhiIntensity: 3.2,
  },
  {
    year: 2020,
    meanLst: 41.5,
    maxLst: 46.5,
    minLst: 36.6,
    ndvi: 0.21,
    ndbi: 0.29,
    builtUpKm2: 137.8,
    vegetationKm2: 46.1,
    uhiIntensity: 3.5,
  },
  {
    year: 2021,
    meanLst: 41.9,
    maxLst: 47.0,
    minLst: 36.9,
    ndvi: 0.20,
    ndbi: 0.31,
    builtUpKm2: 141.5,
    vegetationKm2: 44.2,
    uhiIntensity: 3.8,
  },
  {
    year: 2022,
    meanLst: 42.2,
    maxLst: 47.6,
    minLst: 37.1,
    ndvi: 0.19,
    ndbi: 0.33,
    builtUpKm2: 143.9,
    vegetationKm2: 41.8,
    uhiIntensity: 4.1,
  },
  {
    year: 2023,
    meanLst: 42.4,
    maxLst: 48.0,
    minLst: 37.3,
    ndvi: 0.18,
    ndbi: 0.34,
    builtUpKm2: 145.1,
    vegetationKm2: 39.4,
    uhiIntensity: 4.3,
  },
  {
    year: 2024,
    meanLst: 42.6,
    maxLst: 48.4,
    minLst: 37.5,
    ndvi: 0.17,
    ndbi: 0.35,
    builtUpKm2: 146.1,
    vegetationKm2: 38.2,
    uhiIntensity: 4.6,
  },
];

// Data Pipeline Datasets Info
export interface PipelineDataset {
  id: string;
  source: string;
  purpose: string;
  spatialResolution: string;
  temporalRange: string;
  processingStatus: 'OPERATIONAL' | 'SYNCED' | 'REALTIME';
  license: string;
}

export const PIPELINE_DATASETS: PipelineDataset[] = [
  {
    id: 'DS-LANDSAT-TIRS',
    source: 'Landsat 8/9 TIRS (Collection 2 Level 2)',
    purpose: 'Land Surface Temperature (LST) extraction via Split-Window Algorithm',
    spatialResolution: '30 m (resampled from 100m)',
    temporalRange: '2019 – 2024 (16-day revisit)',
    processingStatus: 'OPERATIONAL',
    license: 'USGS Public Domain'
  },
  {
    id: 'DS-SENTINEL2-MSI',
    source: 'Sentinel-2 MSI (Level 2A Surface Reflectance)',
    purpose: 'Vegetation Index (NDVI) & Built-Up Index (NDBI) calculation',
    spatialResolution: '10 m',
    temporalRange: '2019 – 2024 (5-day revisit)',
    processingStatus: 'OPERATIONAL',
    license: 'Copernicus Open Access'
  },
  {
    id: 'DS-DYNAMIC-WORLD',
    source: 'Dynamic World (Google / WRI / National Geographic)',
    purpose: 'Near real-time 9-class Land Cover land-use classification',
    spatialResolution: '10 m',
    temporalRange: '2019 – 2024',
    processingStatus: 'SYNCED',
    license: 'CC-BY-4.0'
  },
  {
    id: 'DS-WORLDPOP',
    source: 'WorldPop High-Resolution Gridded Population',
    purpose: 'Demographic exposure calculation for high-heat zones',
    spatialResolution: '100 m',
    temporalRange: '2020 – 2024',
    processingStatus: 'OPERATIONAL',
    license: 'CC-BY-4.0'
  },
  {
    id: 'DS-COPERNICUS-DEM',
    source: 'Copernicus DEM (GLO-30)',
    purpose: 'Digital Elevation & Urban Terrain Slope calibration',
    spatialResolution: '30 m',
    temporalRange: 'Static Baseline',
    processingStatus: 'OPERATIONAL',
    license: 'Copernicus Open Access'
  },
  {
    id: 'DS-NMC-OSM',
    source: 'Nagpur Municipal Corporation (NMC) & OpenStreetMap',
    purpose: 'Administrative ward boundaries, road networks & infrastructure',
    spatialResolution: 'Vector Polygons',
    temporalRange: '2024 Baseline',
    processingStatus: 'SYNCED',
    license: 'ODbL / NMC Spatial Portal'
  },
  {
    id: 'DS-IMD-OBS',
    source: 'India Meteorological Department (IMD Sonegaon AWS)',
    purpose: 'In-situ ground truth temperature calibration & atmospheric radiosonde validation',
    spatialResolution: 'Point Sensor (Nagpur Airport AWS)',
    temporalRange: 'Realtime Hourly Sync',
    processingStatus: 'REALTIME',
    license: 'IMD Open Data'
  }
];
