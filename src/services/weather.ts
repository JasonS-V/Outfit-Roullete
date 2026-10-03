/**
 * WeatherService · Open-Meteo (sin API key, §8.2).
 * Caché de 3 horas + geocodificación de ciudades + ubicación del dispositivo.
 */

import * as Location from 'expo-location';

export interface WeatherData {
  tempC: number;
  apparentC: number;
  code: number;
  city: string;
  fetchedAt: number;
}

export interface CityResult {
  name: string;
  region?: string;
  country?: string;
  lat: number;
  lon: number;
}

export class WeatherError extends Error {
  kind: 'offline' | 'notfound' | 'permission' | 'unknown';
  constructor(kind: WeatherError['kind'], message: string) {
    super(message);
    this.kind = kind;
  }
}

const CACHE_MS = 3 * 60 * 60 * 1000;
let cache: WeatherData | null = null;

export function cachedWeather(): WeatherData | null {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) return cache;
  return null;
}

async function fetchJson(url: string, timeoutMs = 9000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new WeatherError('unknown', `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof WeatherError) throw error;
    throw new WeatherError('offline', 'Sin conexión con Open-Meteo');
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWeatherAt(lat: number, lon: number, city: string): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`;
  const json = (await fetchJson(url)) as {
    current?: { temperature_2m?: number; apparent_temperature?: number; weather_code?: number };
  };
  const current = json.current;
  if (!current || typeof current.temperature_2m !== 'number') {
    throw new WeatherError('unknown', 'Respuesta de clima inesperada');
  }
  const data: WeatherData = {
    tempC: current.temperature_2m,
    apparentC: current.apparent_temperature ?? current.temperature_2m,
    code: current.weather_code ?? 0,
    city,
    fetchedAt: Date.now(),
  };
  cache = data;
  return data;
}

export async function searchCity(query: string): Promise<CityResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=es&format=json`;
  const json = (await fetchJson(url)) as {
    results?: Array<{
      name: string;
      admin1?: string;
      country?: string;
      latitude: number;
      longitude: number;
    }>;
  };
  if (!json.results || json.results.length === 0) {
    throw new WeatherError('notfound', 'No encontramos esa ciudad');
  }
  return json.results.map((r) => ({
    name: r.name,
    region: r.admin1,
    country: r.country,
    lat: r.latitude,
    lon: r.longitude,
  }));
}

export async function deviceCoordinates(): Promise<{ lat: number; lon: number } | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
    return { lat: position.coords.latitude, lon: position.coords.longitude };
  } catch {
    return null;
  }
}

/** Descripción breve del código WMO para el chip de clima. */
export function describeWeatherCode(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: 'Despejado', emoji: '☀️' };
  if (code <= 3) return { label: 'Parcialmente nublado', emoji: '⛅' };
  if (code === 45 || code === 48) return { label: 'Neblina', emoji: '🌫️' };
  if (code >= 71 && code <= 77) return { label: 'Nieve', emoji: '🌨️' };
  if (code >= 95) return { label: 'Tormenta', emoji: '⛈️' };
  if (code >= 51 && code <= 67) return { label: 'Llovizna', emoji: '🌦️' };
  if (code >= 80 && code <= 82) return { label: 'Chubascos', emoji: '🌧️' };
  return { label: 'Clima variable', emoji: '🌤️' };
}
