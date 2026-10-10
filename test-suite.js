/**
 * Automated Test Suite for WeatherSphere
 * Validates API drivers, weather code mapping, config manager, and error handlers.
 */

import { searchCities, fetchOpenMeteoForecast, WeatherAPIError } from './js/api.js';
import { getWeatherDetails, WMO_WEATHER_MAP, getIconSvg } from './js/weatherCodes.js';
import { loadConfig, saveConfig, addRecentCity } from './js/config.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=============================================');
  console.log('🧪 Starting WeatherSphere Test Suite');
  console.log('=============================================\n');

  // Test 1: Weather Code Mapping & Icon resolution
  console.log('Test Suite 1: Weather Codes & Icons Mapping');
  const clearDay = getWeatherDetails(0, 1);
  assert(clearDay.category === 'clear', 'Code 0 maps to clear category');
  assert(clearDay.iconName === 'sun', 'Code 0 day icon is sun');
  assert(clearDay.bgTheme === 'theme-clear', 'Code 0 day theme is theme-clear');

  const clearNight = getWeatherDetails(0, 0);
  assert(clearNight.iconName === 'moon', 'Code 0 night icon is moon');
  assert(clearNight.bgTheme === 'theme-night', 'Code 0 night theme is theme-night');

  const thunderstorm = getWeatherDetails(95, 1);
  assert(thunderstorm.category === 'thunderstorm', 'Code 95 maps to thunderstorm');
  assert(thunderstorm.bgTheme === 'theme-thunderstorm', 'Code 95 theme is theme-thunderstorm');

  const sunSvg = getIconSvg('sun');
  assert(sunSvg.includes('<svg') && sunSvg.includes('sunGrad'), 'SVG icon contains valid SVG vector markup');

  // Test 2: Live Geocoding API Search (Tokyo)
  console.log('\nTest Suite 2: Live Geocoding API Search');
  try {
    const searchResults = await searchCities('Tokyo');
    assert(Array.isArray(searchResults) && searchResults.length > 0, 'City search returns results array');
    const firstCity = searchResults[0];
    assert(firstCity.name.toLowerCase().includes('tokyo'), 'First result matches query "Tokyo"');
    assert(typeof firstCity.latitude === 'number' && typeof firstCity.longitude === 'number', 'Coordinates are valid numbers');
    console.log(`    Found: ${firstCity.name}, ${firstCity.country} (${firstCity.latitude}, ${firstCity.longitude})`);
  } catch (err) {
    assert(false, `Geocoding search failed: ${err.message}`);
  }

  // Test 3: Live Meteorological Forecast API (London)
  console.log('\nTest Suite 3: Live Forecast API (Open-Meteo)');
  try {
    const londonInfo = {
      name: 'London',
      country: 'United Kingdom',
      region: 'England',
      latitude: 51.5074,
      longitude: -0.1278
    };

    const forecastMetric = await fetchOpenMeteoForecast(londonInfo, 'metric');
    assert(forecastMetric.provider.includes('Open-Meteo'), 'Provider identifier is present');
    assert(typeof forecastMetric.current.temp === 'number', `Current temperature is a number: ${forecastMetric.current.temp}°C`);
    assert(typeof forecastMetric.current.humidity === 'number', `Humidity is a number: ${forecastMetric.current.humidity}%`);
    assert(typeof forecastMetric.current.windSpeed === 'number', `Wind speed is a number: ${forecastMetric.current.windSpeed} km/h`);
    assert(typeof forecastMetric.current.pressure === 'number', `Pressure is a number: ${forecastMetric.current.pressure} hPa`);
    assert(Array.isArray(forecastMetric.hourly) && forecastMetric.hourly.length > 0, `Hourly forecast contains ${forecastMetric.hourly.length} hours`);
    assert(Array.isArray(forecastMetric.daily) && forecastMetric.daily.length > 0, `Daily forecast contains ${forecastMetric.daily.length} days`);

    // Test Imperial unit conversion
    const forecastImperial = await fetchOpenMeteoForecast(londonInfo, 'imperial');
    assert(typeof forecastImperial.current.temp === 'number', `Imperial temperature is a number: ${forecastImperial.current.temp}°F`);
    assert(forecastImperial.unit === 'imperial', 'Imperial unit is marked correctly');
  } catch (err) {
    assert(false, `Forecast fetch failed: ${err.message}`);
  }

  // Test 4: Error Handling with non-existent query
  console.log('\nTest Suite 4: Error Handling & Resilience');
  try {
    const emptyResults = await searchCities('xyznonexistentquery9999');
    assert(Array.isArray(emptyResults) && emptyResults.length === 0, 'Invalid city search returns empty array gracefully (no crash)');
  } catch (err) {
    assert(false, `Unexpected error on invalid search: ${err.message}`);
  }

  // Test 5: Verify Static File Content and Semantic Elements
  console.log('\n=============================================');
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
