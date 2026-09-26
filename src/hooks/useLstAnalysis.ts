// src/hooks/useLstAnalysis.ts
import { useMemo, useState } from 'react';
import csvRaw from '../data/nagpur_lst_urban_dataset.csv?raw';

/* ============================================================
   TYPES
   ============================================================ */
export interface CellYearRecord {
    cellId: string;
    year: number;
    centroidLat: number;
    centroidLon: number;
    wardId: string;
    lstCelsius: number;
    lstZscore: number;
    ndvi: number;
    ndbi: number;
    mndwi: number;
    albedo: number;
    lulcClass: string;
    lulcClassProb: number;
    buildingDensity: number;
    populationDensity: number;
    elevationM: number;
    distToWaterM: number;
    distToParkM: number;
    distToRoadM: number;
    cloudFreePct: number;
    hotspotClass: string;
    trendClass: string;
}

export interface CityTrajectoryRow {
    year: number;
    meanLst: number;
    maxLst: number;
    minLst: number;
    ndvi: number;
    ndbi: number;
    mndwi: number;
    albedo: number;
    cells: number;
    hotspotCount: number;
    coldspotCount: number;
}

export interface TopMoverRow {
    cellId: string;
    ward: string;
    startYear: number;
    endYear: number;
    delta: number;
    trendClass: string;
}

export interface ScatterPoint {
    x: number;
    y: number;
    z: number;
    year: number;
    ward: string;
    cell: string;
}

export interface KpiBundle {
    firstYear: number;
    lastYear: number;
    lstDelta: number;
    ndviDelta: number;
    hotspotDelta: number;
    peakLst: number;
    lastHotspotCount: number;
}

export interface HotspotStripRow {
    cellId: string;
    ward: string;
    years: Array<{ year: number; cls: string }>;
}

export interface CorrelationRow {
    label: string;
    values: number[];
}

export interface LstAnalysisResult {
    records: CellYearRecord[];
    years: number[];
    wards: string[];
    cellIds: string[];

    cityTrajectory: CityTrajectoryRow[];
    lulcSeries: Array<Record<string, number | string>>;
    lulcKeysPresent: string[];
    wardTrajectory: Array<Record<string, number | string>>;
    scatterData: ScatterPoint[];
    trendClassBreakdown: Array<{ name: string; value: number }>;
    topWarming: TopMoverRow[];
    cellTimeline: CellYearRecord[];
    hotspotStrip: HotspotStripRow[];
    correlationMatrix: CorrelationRow[];

    kpis: KpiBundle;

    selectedWards: string[];
    selectedCell: string;
    setSelectedWards: (w: string[]) => void;
    toggleWard: (w: string) => void;
    setSelectedCell: (c: string) => void;

    isReady: boolean;
}

/* ============================================================
   CONSTANTS
   ============================================================ */
export const LULC_COLORS: Record<string, string> = {
    'Built-up': '#8b6f47',
    Bare: '#eab308',
    Vegetation: '#10b981',
    Water: '#0284c7',
    Cropland: '#84cc16',
    'Open Land': '#94a3b8',
    'Dense Vegetation': '#059669',
    Fallow: '#a3a3a3',
};

export const HOTSPOT_COLORS: Record<string, string> = {
    'Hot Spot': '#a8453a',
    'Cold Spot': '#2563eb',
    'Not Significant': '#918a7c',
};

export const METRIC_META = {
    lst: { label: 'Mean LST (°C)', color: '#a8453a', key: 'meanLst' as const },
    maxLst: { label: 'Max LST (°C)', color: '#7f2d22', key: 'maxLst' as const },
    minLst: { label: 'Min LST (°C)', color: '#2563eb', key: 'minLst' as const },
    ndvi: { label: 'NDVI', color: '#4f7a5c', key: 'ndvi' as const },
    ndbi: { label: 'NDBI', color: '#a86a2b', key: 'ndbi' as const },
    mndwi: { label: 'MNDWI', color: '#4a6f8c', key: 'mndwi' as const },
    albedo: { label: 'Albedo', color: '#6d5a78', key: 'albedo' as const },
};

export type MetricKey = keyof typeof METRIC_META;

/* Correlation matrix column config (exported so page can render headers) */
export const CORR_KEYS = [
    { key: 'lstCelsius', label: 'LST' },
    { key: 'ndvi', label: 'NDVI' },
    { key: 'ndbi', label: 'NDBI' },
    { key: 'mndwi', label: 'MNDWI' },
    { key: 'albedo', label: 'Albedo' },
    { key: 'buildingDensity', label: 'Bldg' },
    { key: 'populationDensity', label: 'Pop' },
    { key: 'elevationM', label: 'Elev' },
    { key: 'distToWaterM', label: 'Dist·W' },
    { key: 'distToParkM', label: 'Dist·P' },
    { key: 'distToRoadM', label: 'Dist·R' },
    { key: 'cloudFreePct', label: 'Cloud' },
] as const;

/* ============================================================
   FAST CSV PARSER (O(n), no string concat in loop)
   ============================================================ */
const parseCSV = (text: string): Record<string, string>[] => {
    const rows: string[][] = [];
    let cur: string[] = [];
    let buf: string[] = [];
    let inQuotes = false;

    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

    const flushField = () => {
        cur.push(buf.join(''));
        buf.length = 0;
    };

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = text[i + 1];

        if (inQuotes) {
            if (ch === '"' && next === '"') {
                buf.push('"');
                i++;
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                buf.push(ch);
            }
        } else {
            if (ch === '"') inQuotes = true;
            else if (ch === ',') flushField();
            else if (ch === '\n' || ch === '\r') {
                if (ch === '\r' && next === '\n') i++;
                flushField();
                rows.push(cur);
                cur = [];
            } else {
                buf.push(ch);
            }
        }
    }
    if (buf.length > 0 || cur.length > 0) {
        flushField();
        rows.push(cur);
    }

    if (rows.length < 2) return [];
    const headers = rows[0].map((h) => h.trim());

    return rows
        .slice(1)
        .filter((r) => r.some((c) => c.trim() !== ''))
        .map((r) => {
            const obj: Record<string, string> = {};
            headers.forEach((h, idx) => {
                obj[h] = (r[idx] ?? '').trim();
            });
            return obj;
        });
};

/* ============================================================
   PARSE ONCE AT MODULE LEVEL
   ============================================================ */
const RECORDS: CellYearRecord[] = parseCSV(csvRaw).map((r) => ({
    cellId: r.cell_id ?? '',
    year: Number(r.year) || 0,
    centroidLat: Number(r.centroid_lat) || 0,
    centroidLon: Number(r.centroid_lon) || 0,
    wardId: r.ward_id ?? '',
    lstCelsius: Number(r.lst_celsius) || 0,
    lstZscore: Number(r.lst_zscore) || 0,
    ndvi: Number(r.ndvi) || 0,
    ndbi: Number(r.ndbi) || 0,
    mndwi: Number(r.mndwi) || 0,
    albedo: Number(r.albedo) || 0,
    lulcClass: r.lulc_class ?? '',
    lulcClassProb: Number(r.lulc_class_prob) || 0,
    buildingDensity: Number(r.building_density) || 0,
    populationDensity: Number(r.population_density) || 0,
    elevationM: Number(r.elevation_m) || 0,
    distToWaterM: Number(r.dist_to_water_m) || 0,
    distToParkM: Number(r.dist_to_park_m) || 0,
    distToRoadM: Number(r.dist_to_road_m) || 0,
    cloudFreePct: Number(r.cloud_free_pct) || 0,
    hotspotClass: r.hotspot_class ?? 'Not Significant',
    trendClass: r.trend_class ?? '',
}));

const YEARS = Array.from(new Set(RECORDS.map((r) => r.year)))
    .filter(Boolean)
    .sort((a, b) => a - b);

const WARDS = Array.from(new Set(RECORDS.map((r) => r.wardId)))
    .filter(Boolean)
    .sort();

const CELL_IDS = Array.from(new Set(RECORDS.map((r) => r.cellId))).sort();

/* ---------- Pre-indexed lookups ---------- */
const BY_YEAR = new Map<number, CellYearRecord[]>();
const BY_YEAR_WARD = new Map<string, CellYearRecord[]>();
const BY_CELL = new Map<string, CellYearRecord[]>();

RECORDS.forEach((r) => {
    if (!BY_YEAR.has(r.year)) BY_YEAR.set(r.year, []);
    BY_YEAR.get(r.year)!.push(r);

    const yw = `${r.year}::${r.wardId}`;
    if (!BY_YEAR_WARD.has(yw)) BY_YEAR_WARD.set(yw, []);
    BY_YEAR_WARD.get(yw)!.push(r);

    if (!BY_CELL.has(r.cellId)) BY_CELL.set(r.cellId, []);
    BY_CELL.get(r.cellId)!.push(r);
});

/* ---------- helpers ---------- */
const mean = (arr: number[]) =>
    arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0;

const pearson = (a: number[], b: number[]) => {
    const n = a.length;
    if (!n) return 0;
    const ma = a.reduce((s, x) => s + x, 0) / n;
    const mb = b.reduce((s, x) => s + x, 0) / n;
    let num = 0;
    let da = 0;
    let db = 0;
    for (let i = 0; i < n; i++) {
        const xa = a[i] - ma;
        const xb = b[i] - mb;
        num += xa * xb;
        da += xa * xa;
        db += xb * xb;
    }
    return da && db ? num / Math.sqrt(da * db) : 0;
};

const EMPTY_KPIS: KpiBundle = {
    firstYear: 0,
    lastYear: 0,
    lstDelta: 0,
    ndviDelta: 0,
    hotspotDelta: 0,
    peakLst: 0,
    lastHotspotCount: 0,
};

/* ============================================================
   THE HOOK — single call, owns its own state
   ============================================================ */
export const useLstAnalysis = (): LstAnalysisResult => {
    const isReady = RECORDS.length > 0 && YEARS.length > 0;

    /* ---------- Selection state ---------- */
    const [selectedWards, setSelectedWards] = useState<string[]>(() =>
        WARDS.slice(0, 3)
    );
    const [selectedCell, setSelectedCell] = useState<string>(
        () => CELL_IDS[0] ?? ''
    );

    const toggleWard = (w: string) => {
        setSelectedWards((prev) => {
            if (prev.includes(w)) {
                return prev.length > 1 ? prev.filter((x) => x !== w) : prev;
            }
            return prev.length < 6 ? [...prev, w] : prev;
        });
    };

    /* ---------- 1. City-wide trajectory ---------- */
    const cityTrajectory: CityTrajectoryRow[] = useMemo(() => {
        if (!isReady) return [];
        return YEARS.map((y) => {
            const rows = BY_YEAR.get(y) ?? [];
            return {
                year: y,
                meanLst: +mean(rows.map((r) => r.lstCelsius)).toFixed(2),
                maxLst: rows.length
                    ? +Math.max(...rows.map((r) => r.lstCelsius)).toFixed(2)
                    : 0,
                minLst: rows.length
                    ? +Math.min(...rows.map((r) => r.lstCelsius)).toFixed(2)
                    : 0,
                ndvi: +mean(rows.map((r) => r.ndvi)).toFixed(3),
                ndbi: +mean(rows.map((r) => r.ndbi)).toFixed(3),
                mndwi: +mean(rows.map((r) => r.mndwi)).toFixed(3),
                albedo: +mean(rows.map((r) => r.albedo)).toFixed(3),
                cells: rows.length,
                hotspotCount: rows.filter((r) => r.hotspotClass === 'Hot Spot').length,
                coldspotCount: rows.filter((r) => r.hotspotClass === 'Cold Spot')
                    .length,
            };
        });
    }, [isReady]);

    /* ---------- 2. LULC composition over years ---------- */
    const lulcSeries = useMemo(() => {
        if (!isReady) return [];
        return YEARS.map((y) => {
            const rows = BY_YEAR.get(y) ?? [];
            const total = rows.length || 1;
            const counts: Record<string, number> = {};
            rows.forEach((r) => {
                counts[r.lulcClass] = (counts[r.lulcClass] || 0) + 1;
            });
            const obj: Record<string, number | string> = { year: y };
            Object.keys(LULC_COLORS).forEach((k) => {
                obj[k] = +(((counts[k] || 0) / total) * 100).toFixed(1);
            });
            return obj;
        });
    }, [isReady]);

    const lulcKeysPresent = useMemo(() => {
        const present = new Set(RECORDS.map((r) => r.lulcClass));
        return Object.keys(LULC_COLORS).filter((k) => present.has(k));
    }, []);

    /* ---------- 3. Ward trajectories ---------- */
    const wardTrajectory = useMemo(() => {
        if (!isReady) return [];
        return YEARS.map((y) => {
            const obj: Record<string, number | string> = { year: y };
            selectedWards.forEach((w) => {
                const rows = BY_YEAR_WARD.get(`${y}::${w}`) ?? [];
                obj[w] = +mean(rows.map((r) => r.lstCelsius)).toFixed(2);
            });
            return obj;
        });
    }, [isReady, selectedWards]);

    /* ---------- 4. Scatter dataset (downsampled) ---------- */
    const scatterData: ScatterPoint[] = useMemo(() => {
        const MAX = 800;
        const step = RECORDS.length > MAX ? Math.ceil(RECORDS.length / MAX) : 1;
        const out: ScatterPoint[] = [];
        for (let i = 0; i < RECORDS.length; i += step) {
            const r = RECORDS[i];
            out.push({
                x: r.ndvi,
                y: r.lstCelsius,
                z: r.buildingDensity,
                year: r.year,
                ward: r.wardId,
                cell: r.cellId,
            });
        }
        return out;
    }, []);

    /* ---------- 5. Trend class breakdown ---------- */
    const trendClassBreakdown = useMemo(() => {
        const map: Record<string, number> = {};
        RECORDS.forEach((r) => {
            if (r.trendClass) map[r.trendClass] = (map[r.trendClass] || 0) + 1;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, []);

    /* ---------- 6. Top-warming cells ---------- */
    const topWarming: TopMoverRow[] = useMemo(() => {
        const movers: TopMoverRow[] = [];
        BY_CELL.forEach((rows, cellId) => {
            if (rows.length < 2) return;
            const sorted = [...rows].sort((a, b) => a.year - b.year);
            const first = sorted[0];
            const last = sorted[sorted.length - 1];
            movers.push({
                cellId,
                ward: last.wardId,
                startYear: first.year,
                endYear: last.year,
                delta: +(last.lstCelsius - first.lstCelsius).toFixed(2),
                trendClass: last.trendClass,
            });
        });
        return movers.sort((a, b) => b.delta - a.delta).slice(0, 5);
    }, []);

    /* ---------- 7. Selected cell timeline ---------- */
    const cellTimeline: CellYearRecord[] = useMemo(
        () =>
            (BY_CELL.get(selectedCell) ?? [])
                .slice()
                .sort((a, b) => a.year - b.year),
        [selectedCell]
    );

    /* ---------- 8. Hotspot persistence heat-strip ---------- */
    const hotspotStrip: HotspotStripRow[] = useMemo(() => {
        const out: HotspotStripRow[] = [];
        BY_CELL.forEach((rows, cellId) => {
            const sorted = [...rows].sort((a, b) => a.year - b.year);
            out.push({
                cellId,
                ward: sorted[0]?.wardId ?? '',
                years: sorted.map((r) => ({ year: r.year, cls: r.hotspotClass })),
            });
        });
        const score = (c: HotspotStripRow) =>
            c.years.reduce(
                (s, y) =>
                    s + (y.cls === 'Hot Spot' ? 2 : y.cls === 'Not Significant' ? 1 : 0),
                0
            );
        return out.sort((a, b) => score(b) - score(a));
    }, []);

    /* ---------- 9. Pearson correlation matrix ---------- */
    const correlationMatrix: CorrelationRow[] = useMemo(() => {
        const cols: number[][] = CORR_KEYS.map((k) =>
            RECORDS.map((r) => (r as any)[k.key] as number)
        );
        return CORR_KEYS.map((row, i) => ({
            label: row.label,
            values: CORR_KEYS.map((_, j) => +pearson(cols[i], cols[j]).toFixed(3)),
        }));
    }, []);

    /* ---------- 10. KPI bundle ---------- */
    const kpis: KpiBundle = useMemo(() => {
        if (!isReady || cityTrajectory.length === 0) return EMPTY_KPIS;

        const firstYear = cityTrajectory[0];
        const lastYear = cityTrajectory[cityTrajectory.length - 1];
        return {
            firstYear: firstYear.year,
            lastYear: lastYear.year,
            lstDelta: +(lastYear.meanLst - firstYear.meanLst).toFixed(2),
            ndviDelta: +(lastYear.ndvi - firstYear.ndvi).toFixed(3),
            hotspotDelta: lastYear.hotspotCount - firstYear.hotspotCount,
            peakLst: Math.max(...cityTrajectory.map((c) => c.maxLst)),
            lastHotspotCount: lastYear.hotspotCount,
        };
    }, [isReady, cityTrajectory]);

    /* ---------- Return ---------- */
    return {
        records: RECORDS,
        years: YEARS,
        wards: WARDS,
        cellIds: CELL_IDS,

        cityTrajectory,
        lulcSeries,
        lulcKeysPresent,
        wardTrajectory,
        scatterData,
        trendClassBreakdown,
        topWarming,
        cellTimeline,
        hotspotStrip,
        correlationMatrix,

        kpis,

        selectedWards,
        selectedCell,
        setSelectedWards,
        toggleWard,
        setSelectedCell,

        isReady,
    };
};