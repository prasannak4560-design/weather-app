/**
 * Weather API Service
 * Handles data fetching from legitimate meteorological APIs:
 * 1. Open-Meteo (Default, free, high-accuracy WMO data, no API key needed)
 * 2. OpenWeatherMap (Optional custom API key mode)
 */

import { getWeatherDetails } from './weatherCodes.js';

export class WeatherAPIError extends Error {
  constructor(message, type = 'UNKNOWN', statusCode = null) {
    super(message);
    this.name = 'WeatherAPIError';
    this.type = type; // 'NOT_FOUND' | 'NETWORK_ERROR' | 'AUTH_ERROR' | 'RATE_LIMIT' | 'TIMEOUT'
    this.statusCode = statusCode;
  }
}

const REQUEST_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new WeatherAPIError('Request timed out. Please check your internet connection.', 'TIMEOUT');
    }
    throw new WeatherAPIError(
      'Network request failed. Please check your internet connection or try again.',
      'NETWORK_ERROR'
    );
  }
}

/**
 * Searches city candidates using Open-Meteo Geocoding API
 */
export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query.trim()
  )}&count=6&language=en&format=json`;

  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      throw new WeatherAPIError(`Search failed with status ${res.status}`, 'NETWORK_ERROR', res.status);
    }
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      return [];
    }

    return data.results.map(item => ({
      id: item.id,
      name: item.name,
      country: item.country || '',
      countryCode: item.country_code || '',
      region: item.admin1 || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'auto'
    }));
  } catch (err) {
    if (err instanceof WeatherAPIError) throw err;
    throw new WeatherAPIError(err.message, 'NETWORK_ERROR');
  }
}

/**
 * Fetches forecast using Open-Meteo API
 */
export async function fetchOpenMeteoForecast(locationInfo, unit = 'metric') {
  const { latitude, longitude, name, country, region } = locationInfo;
  const tempUnit = unit === 'imperial' ? 'fahrenheit' : 'celsius';
  const windUnit = unit === 'imperial' ? 'mph' : 'kmh';

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m'
    ].join(','),
    hourly: ['temperature_2m', 'weather_code', 'is_day'].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'uv_index_max'
    ].join(','),
    temperature_unit: tempUnit,
    wind_speed_unit: windUnit,
    timezone: 'auto'
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    if (res.status === 404) {
      throw new WeatherAPIError(`Weather data not found for ${name}.`, 'NOT_FOUND', 404);
    }
    throw new WeatherAPIError(`Open-Meteo error (${res.status})`, 'NETWORK_ERROR', res.status);
  }

  const data = await res.json();
  const currentRaw = data.current;
  const weatherDetails = getWeatherDetails(currentRaw.weather_code, currentRaw.is_day);

  // Parse Hourly Forecast (next 24 hours starting from current hour)
  const hourlyRaw = data.hourly;
  const currentHourIndex = findCurrentHourIndex(hourlyRaw.time, currentRaw.time);
  const hourly = [];
  const totalHourly = hourlyRaw.time.length;

  for (let i = currentHourIndex; i < Math.min(currentHourIndex + 24, totalHourly); i++) {
    const rawTime = hourlyRaw.time[i];
    const hourDetails = getWeatherDetails(hourlyRaw.weather_code[i], hourlyRaw.is_day[i]);
    hourly.push({
      time: formatHour(rawTime),
      rawTime,
      temp: Math.round(hourlyRaw.temperature_2m[i]),
      weatherCode: hourlyRaw.weather_code[i],
      iconName: hourDetails.iconName,
      conditionText: hourDetails.description
    });
  }

  // Parse Daily Forecast (next 7 days)
  const dailyRaw = data.daily;
  const daily = [];
  const daysCount = dailyRaw.time ? dailyRaw.time.length : 0;

  for (let i = 0; i < Math.min(daysCount, 7); i++) {
    const dayDate = dailyRaw.time[i];
    const dayDetails = getWeatherDetails(dailyRaw.weather_code[i], 1);
    const uvMax = dailyRaw.uv_index_max ? dailyRaw.uv_index_max[i] : null;
    const precipProb = dailyRaw.precipitation_probability_max ? dailyRaw.precipitation_probability_max[i] : 0;

    daily.push({
      date: dayDate,
      dayName: formatDayName(dayDate, i),
      tempMax: Math.round(dailyRaw.temperature_2m_max[i]),
      tempMin: Math.round(dailyRaw.temperature_2m_min[i]),
      precipProb: precipProb ?? 0,
      uvIndexMax: uvMax ? Math.round(uvMax * 10) / 10 : null,
      weatherCode: dailyRaw.weather_code[i],
      iconName: dayDetails.iconName,
      conditionText: dayDetails.description
    });
  }

  // Current UV index estimate from today's daily UV or hour
  const todayUv = (daily[0] && daily[0].uvIndexMax) !== undefined ? daily[0].uvIndexMax : 0;

  return {
    provider: 'Open-Meteo (WMO)',
    location: {
      name,
      country,
      region,
      latitude,
      longitude,
      timezone: data.timezone || 'UTC'
    },
    unit,
    current: {
      temp: Math.round(currentRaw.temperature_2m),
      feelsLike: Math.round(currentRaw.apparent_temperature),
      humidity: currentRaw.relative_humidity_2m,
      windSpeed: Math.round(currentRaw.wind_speed_10m * 10) / 10,
      windDirection: currentRaw.wind_direction_10m,
      pressure: Math.round(currentRaw.surface_pressure),
      precipitation: currentRaw.precipitation,
      uvIndex: todayUv,
      isDay: currentRaw.is_day,
      weatherCode: currentRaw.weather_code,
      conditionText: weatherDetails.description,
      iconName: weatherDetails.iconName,
      bgTheme: weatherDetails.bgTheme,
      time: currentRaw.time
    },
    hourly,
    daily,
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Validates an OpenWeatherMap API key
 */
export async function testOpenWeatherMapKey(apiKey) {
  if (!apiKey || apiKey.trim().length < 10) {
    throw new WeatherAPIError('API key must be at least 10 characters long.', 'AUTH_ERROR');
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${encodeURIComponent(
    apiKey.trim()
  )}`;

  try {
    const res = await fetchWithTimeout(url);
    if (res.status === 401) {
      throw new WeatherAPIError('Invalid API Key (401 Unauthorized). Please check your OpenWeatherMap key.', 'AUTH_ERROR', 401);
    }
    if (res.status === 429) {
      throw new WeatherAPIError('API rate limit exceeded (429). Please try again later.', 'RATE_LIMIT', 429);
    }
    if (!res.ok) {
      throw new WeatherAPIError(`OpenWeatherMap test failed with status ${res.status}.`, 'NETWORK_ERROR', res.status);
    }
    return true;
  } catch (err) {
    if (err instanceof WeatherAPIError) throw err;
    throw new WeatherAPIError(err.message, 'NETWORK_ERROR');
  }
}

/**
 * Fetches current weather and 5-day forecast from OpenWeatherMap
 */
export async function fetchOpenWeatherMapForecast(query, apiKey, unit = 'metric') {
  if (!apiKey) {
    throw new WeatherAPIError('OpenWeatherMap API Key is missing. Configure your key in Settings.', 'AUTH_ERROR');
  }

  const unitsParam = unit === 'imperial' ? 'imperial' : 'metric';
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    query
  )}&units=${unitsParam}&appid=${encodeURIComponent(apiKey.trim())}`;

  const res = await fetchWithTimeout(weatherUrl);
  if (res.status === 401) {
    throw new WeatherAPIError('Invalid OpenWeatherMap API Key.', 'AUTH_ERROR', 401);
  }
  if (res.status === 404) {
    throw new WeatherAPIError(`City "${query}" not found on OpenWeatherMap.`, 'NOT_FOUND', 404);
  }
  if (!res.ok) {
    throw new WeatherAPIError(`OpenWeatherMap error (${res.status})`, 'NETWORK_ERROR', res.status);
  }

  const currentData = await res.json();
  const { coord, main, wind, weather, name, sys } = currentData;
  const isDay = sys.sunset ? (Date.now() / 1000 < sys.sunset && Date.now() / 1000 > sys.sunrise ? 1 : 0) : 1;

  // Map OWM condition code to our icon names
  const owmIcon = mapOwmConditionToIcon(weather[0]?.id, isDay);

  // Fetch 5-day / 3-hour forecast
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&units=${unitsParam}&appid=${encodeURIComponent(
    apiKey.trim()
  )}`;

  let hourly = [];
  let daily = [];

  try {
    const fRes = await fetchWithTimeout(forecastUrl);
    if (fRes.ok) {
      const fData = await fRes.json();
      // Hourly from 3h blocks (first 8 blocks = 24h)
      hourly = fData.list.slice(0, 8).map(item => {
        const itemIsDay = item.sys.pod === 'd' ? 1 : 0;
        const iconInfo = mapOwmConditionToIcon(item.weather[0]?.id, itemIsDay);
        return {
          time: formatHour(item.dt_txt),
          rawTime: item.dt_txt,
          temp: Math.round(item.main.temp),
          weatherCode: item.weather[0]?.id,
          iconName: iconInfo.iconName,
          conditionText: item.weather[0]?.description || ''
        };
      });

      // Daily aggregation
      const dailyMap = new Map();
      fData.list.forEach(item => {
        const dayStr = item.dt_txt.split(' ')[0];
        if (!dailyMap.has(dayStr)) {
          dailyMap.set(dayStr, {
            temps: [],
            weather: item.weather[0],
            date: dayStr
          });
        }
        dailyMap.get(dayStr).temps.push(item.main.temp);
      });

      let dayIndex = 0;
      dailyMap.forEach((val, key) => {
        if (dayIndex < 5) {
          const iconInfo = mapOwmConditionToIcon(val.weather?.id, 1);
          daily.push({
            date: key,
            dayName: formatDayName(key, dayIndex),
            tempMax: Math.round(Math.max(...val.temps)),
            tempMin: Math.round(Math.min(...val.temps)),
            precipProb: 0,
            uvIndexMax: 5,
            iconName: iconInfo.iconName,
            conditionText: val.weather?.description || ''
          });
          dayIndex++;
        }
      });
    }
  } catch (fErr) {
    console.warn('OWM forecast fetch failed, using current only:', fErr);
  }

  return {
    provider: 'OpenWeatherMap',
    location: {
      name,
      country: sys.country || '',
      region: '',
      latitude: coord.lat,
      longitude: coord.lon,
      timezone: 'auto'
    },
    unit,
    current: {
      temp: Math.round(main.temp),
      feelsLike: Math.round(main.feels_like),
      humidity: main.humidity,
      windSpeed: Math.round(wind.speed * 10) / 10,
      windDirection: wind.deg || 0,
      pressure: main.pressure,
      precipitation: 0,
      uvIndex: 5,
      isDay,
      weatherCode: weather[0]?.id,
      conditionText: capitalize(weather[0]?.description || 'Clear'),
      iconName: owmIcon.iconName,
      bgTheme: owmIcon.bgTheme,
      time: new Date().toISOString()
    },
    hourly,
    daily,
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Reverse geocode coordinates to City Name using Nominatim or BigDataCloud
 */
export async function reverseGeocodeCoords(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    const res = await fetchWithTimeout(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Current Location';
      const country = addr.country || '';
      const region = addr.state || addr.region || '';
      return {
        name: cityName,
        country,
        region,
        latitude: lat,
        longitude: lon
      };
    }
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
  }
  return {
    name: 'Your Location',
    country: '',
    region: '',
    latitude: lat,
    longitude: lon
  };
}

// Helpers
function findCurrentHourIndex(times, currentIsoTime) {
  if (!times || times.length === 0) return 0;
  if (!currentIsoTime) return 0;

  const currentHourStr = currentIsoTime.slice(0, 13); // "YYYY-MM-DDTHH"
  const idx = times.findIndex(t => t.startsWith(currentHourStr));
  return idx >= 0 ? idx : 0;
}

function formatHour(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) {
    // If format like "2026-10-10 12:00:00"
    const parts = isoString.split(' ')[1] || isoString.split('T')[1];
    return parts ? parts.slice(0, 5) : '';
  }
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDayName(dateString, index) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString([], { weekday: 'short' });
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function mapOwmConditionToIcon(owmId, isDay) {
  if (!owmId) return { iconName: isDay ? 'sun' : 'moon', bgTheme: isDay ? 'theme-clear' : 'theme-night' };

  if (owmId >= 200 && owmId < 300) {
    return { iconName: 'thunderstorm', bgTheme: 'theme-thunderstorm' };
  }
  if (owmId >= 300 && owmId < 400) {
    return { iconName: 'drizzle', bgTheme: 'theme-rain' };
  }
  if (owmId >= 500 && owmId < 600) {
    return { iconName: owmId >= 502 ? 'heavy-rain' : 'rain', bgTheme: 'theme-rain' };
  }
  if (owmId >= 600 && owmId < 700) {
    return { iconName: 'snow', bgTheme: 'theme-snow' };
  }
  if (owmId >= 700 && owmId < 800) {
    return { iconName: 'fog', bgTheme: 'theme-fog' };
  }
  if (owmId === 800) {
    return { iconName: isDay ? 'sun' : 'moon', bgTheme: isDay ? 'theme-clear' : 'theme-night' };
  }
  if (owmId === 801 || owmId === 802) {
    return { iconName: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night', bgTheme: isDay ? 'theme-cloudy' : 'theme-night' };
  }
  return { iconName: 'cloud', bgTheme: 'theme-overcast' };
}
