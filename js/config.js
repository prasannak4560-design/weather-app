/**
 * Configuration & Storage Manager
 * 
 * Handles settings persistence (unit, active provider, API keys).
 * 
 * NOTE ON SECURITY:
 * Storing API keys in browser localStorage is suitable for local demos or developer test runs.
 * For production deployments, secret API keys MUST NOT be embedded in public client-side code.
 * See API_SECURITY_GUIDE.md for backend proxy and serverless patterns.
 */

const STORAGE_KEY = 'weather_app_settings_v1';

const DEFAULT_CONFIG = {
  provider: 'open-meteo', // 'open-meteo' | 'openweathermap'
  unit: 'metric', // 'metric' (°C, km/h) | 'imperial' (°F, mph)
  owmApiKey: '', // Optional OpenWeatherMap API Key
  defaultCity: 'London',
  recentCities: ['London', 'Tokyo', 'New York', 'Paris', 'Sydney']
};

export function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (err) {
    console.warn('Failed to parse localStorage settings, using defaults.', err);
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(updates) {
  try {
    const current = loadConfig();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
    return loadConfig();
  }
}

export function addRecentCity(cityName) {
  if (!cityName || typeof cityName !== 'string') return;
  const config = loadConfig();
  const normalized = cityName.trim();
  const filtered = config.recentCities.filter(c => c.toLowerCase() !== normalized.toLowerCase());
  const updatedList = [normalized, ...filtered].slice(0, 6);
  saveConfig({ recentCities: updatedList });
  return updatedList;
}
