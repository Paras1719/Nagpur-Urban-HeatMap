import { useEffect, useState } from 'react';

interface LiveWeather {
    tempC: number | null;
    windKph: number | null;
    observedAt: string | null;
    loading: boolean;
    error: string | null;
}

const NAGPUR_LAT = 21.1458;
const NAGPUR_LON = 79.0882;

/**
 * Live, real-time current air temperature for Nagpur via Open-Meteo.
 * Free, no API key, CORS-enabled — safe to call directly from the browser.
 * This is a genuine network call each page load, not a cached/static value.
 */
export function useLiveNagpurWeather(): LiveWeather {
    const [state, setState] = useState<LiveWeather>({
        tempC: null,
        windKph: null,
        observedAt: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;
        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${NAGPUR_LAT}&longitude=${NAGPUR_LON}` +
            `&current=temperature_2m,wind_speed_10m&timezone=Asia%2FKolkata`;

        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (cancelled) return;
                setState({
                    tempC: data?.current?.temperature_2m ?? null,
                    windKph: data?.current?.wind_speed_10m ?? null,
                    observedAt: data?.current?.time ?? null,
                    loading: false,
                    error: null,
                });
            })
            .catch((err: Error) => {
                if (cancelled) return;
                setState((s) => ({ ...s, loading: false, error: err.message }));
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}