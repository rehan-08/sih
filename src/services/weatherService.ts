// Free, keyless weather data via Open-Meteo (api.open-meteo.com + marine-api.open-meteo.com).
// Both endpoints support CORS for direct browser fetches and batched multi-coordinate requests
// (comma-separated latitude/longitude lists return an array of results in the same order).

export interface RawWeatherPoint {
  temperatureC: number;
  windSpeedKnots: number;
  windDirectionDeg: number;
  compass: string;
  pressureHpa: number;
  visibilityNM: number;
  waveHeightM: number;
  waveDirectionDeg: number | null;
  wavePeriodS: number | null;
  weatherCode: number;
  condition: string;
}

const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
];

export function degreesToCompass(deg: number): string {
  const idx = Math.round(((deg % 360) / 22.5)) % 16;
  return COMPASS_POINTS[idx];
}

// Small WMO weather-code lookup covering the buckets the UI cares about.
export function weatherCodeToCondition(code: number): string {
  if (code === 0) return 'Clear skies';
  if (code <= 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog / reduced visibility';
  if (code >= 51 && code <= 57) return 'Light drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Variable conditions';
}

export function waveHeightToSeaState(m: number): string {
  if (m < 0.5) return 'Calm Sea State 1';
  if (m < 1.25) return 'Slight Sea State 2';
  if (m < 2.0) return 'Slight Sea State 3';
  if (m < 3.0) return 'Moderate Sea State 4';
  if (m < 4.0) return 'Rough Sea State 5';
  return 'Very Rough Sea State 6+';
}

const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';
const MARINE_BASE = 'https://marine-api.open-meteo.com/v1/marine';

interface Coord {
  lat: number;
  lng: number;
}

/**
 * Fetches real current weather + marine swell data for a batch of coordinates in two
 * requests total. Returns one entry per input coordinate, in order; a coordinate's entry
 * is null if that particular fetch failed or returned no data, so callers can keep their
 * last-known values instead of showing garbage.
 */
export async function fetchBatchWeather(coords: Coord[]): Promise<(RawWeatherPoint | null)[]> {
  if (coords.length === 0) return [];

  const lats = coords.map(c => c.lat.toFixed(4)).join(',');
  const lngs = coords.map(c => c.lng.toFixed(4)).join(',');

  const forecastUrl = `${FORECAST_BASE}?latitude=${lats}&longitude=${lngs}&current=temperature_2m,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,weather_code&wind_speed_unit=kn&timezone=auto`;
  const marineUrl = `${MARINE_BASE}?latitude=${lats}&longitude=${lngs}&current=wave_height,wave_direction,wave_period&timezone=auto`;

  const [forecastRes, marineRes] = await Promise.allSettled([
    fetch(forecastUrl).then(r => r.ok ? r.json() : Promise.reject(new Error(`forecast ${r.status}`))),
    fetch(marineUrl).then(r => r.ok ? r.json() : Promise.reject(new Error(`marine ${r.status}`)))
  ]);

  const forecastData = forecastRes.status === 'fulfilled' ? forecastRes.value : null;
  const marineData = marineRes.status === 'fulfilled' ? marineRes.value : null;

  // Open-Meteo returns a single object (not an array) when only one coordinate is requested.
  const forecastList = Array.isArray(forecastData) ? forecastData : forecastData ? [forecastData] : [];
  const marineList = Array.isArray(marineData) ? marineData : marineData ? [marineData] : [];

  return coords.map((_, i) => {
    const f = forecastList[i]?.current;
    const m = marineList[i]?.current;
    if (!f) return null;

    return {
      temperatureC: Number(f.temperature_2m?.toFixed(1)),
      windSpeedKnots: Number(f.wind_speed_10m?.toFixed(1)),
      windDirectionDeg: f.wind_direction_10m,
      compass: degreesToCompass(f.wind_direction_10m ?? 0),
      pressureHpa: Math.round(f.surface_pressure),
      visibilityNM: Number(((f.visibility ?? 18520) / 1852).toFixed(1)),
      waveHeightM: m ? Number(m.wave_height?.toFixed(1)) : 0.8,
      waveDirectionDeg: m?.wave_direction ?? null,
      wavePeriodS: m?.wave_period ?? null,
      weatherCode: f.weather_code ?? 0,
      condition: weatherCodeToCondition(f.weather_code ?? 0)
    };
  });
}
