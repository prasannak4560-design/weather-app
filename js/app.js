/**
 * WeatherSphere - Main Application Controller
 * Handles UI interactions, API orchestration, autocomplete, and state management.
 */

import { loadConfig, saveConfig, addRecentCity } from './config.js';
import { 
  searchCities, 
  fetchOpenMeteoForecast, 
  fetchOpenWeatherMapForecast, 
  testOpenWeatherMapKey, 
  reverseGeocodeCoords,
  WeatherAPIError 
} from './api.js';
import { getIconSvg } from './weatherCodes.js';

// --- State Management ---
const state = {
  config: loadConfig(),
  currentLocation: null,
  weatherData: null,
  isLoading: false,
  retryAction: null,
  autocompleteTimeout: null,
  selectedSuggestionIndex: -1
};

// --- DOM Element References ---
const elements = {
  body: document.body,
  headerProviderBadge: document.getElementById('headerProviderBadge'),
  unitToggleC: document.getElementById('unitToggleC'),
  unitToggleF: document.getElementById('unitToggleF'),
  settingsBtn: document.getElementById('settingsBtn'),

  // Search
  searchForm: document.getElementById('searchForm'),
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  locateBtn: document.getElementById('locateBtn'),
  autocompleteList: document.getElementById('autocompleteList'),
  quickCitiesBar: document.getElementById('quickCitiesBar'),

  // Alert
  alertBanner: document.getElementById('alertBanner'),
  alertMessage: document.getElementById('alertMessage'),
  alertRetryBtn: document.getElementById('alertRetryBtn'),
  alertDismissBtn: document.getElementById('alertDismissBtn'),

  // Hero Card
  heroCard: document.getElementById('heroCard'),
  heroLocationName: document.getElementById('heroLocationName'),
  heroLocationSub: document.getElementById('heroLocationSub'),
  heroLastUpdated: document.getElementById('heroLastUpdated'),
  heroProviderBadge: document.getElementById('heroProviderBadge'),
  currentTemp: document.getElementById('currentTemp'),
  tempUnitSymbol: document.getElementById('tempUnitSymbol'),
  tempHigh: document.getElementById('tempHigh'),
  tempLow: document.getElementById('tempLow'),
  feelsLikeVal: document.getElementById('feelsLikeVal'),
  heroWeatherIcon: document.getElementById('heroWeatherIcon'),
  heroConditionText: document.getElementById('heroConditionText'),

  // Metrics
  humidityVal: document.getElementById('humidityVal'),
  humiditySubtext: document.getElementById('humiditySubtext'),
  windSpeedVal: document.getElementById('windSpeedVal'),
  windUnitLabel: document.getElementById('windUnitLabel'),
  windCompassArrow: document.getElementById('windCompassArrow'),
  windDirectionText: document.getElementById('windDirectionText'),
  pressureVal: document.getElementById('pressureVal'),
  pressureSubtext: document.getElementById('pressureSubtext'),
  uvIndexVal: document.getElementById('uvIndexVal'),
  uvBadge: document.getElementById('uvBadge'),

  // Forecast Containers
  hourlyContainer: document.getElementById('hourlyForecastContainer'),
  dailyContainer: document.getElementById('dailyForecastContainer'),

  // Settings Modal
  apiModal: document.getElementById('apiModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  testKeyBtn: document.getElementById('testKeyBtn'),
  providerOpenMeteo: document.getElementById('providerOpenMeteo'),
  providerOwm: document.getElementById('providerOwm'),
  labelOpenMeteo: document.getElementById('labelOpenMeteo'),
  labelOwm: document.getElementById('labelOwm'),
  apiKeyInput: document.getElementById('apiKeyInput'),
  togglePwdBtn: document.getElementById('togglePwdBtn'),
  modalKeyStatus: document.getElementById('modalKeyStatus')
};

// --- Initialization ---
function init() {
  setupEventListeners();
  syncUIWithConfig();
  renderRecentCities();

  // Load default city
  const initialCity = state.config.defaultCity || 'London';
  loadWeatherByCityName(initialCity);
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Unit Toggles
  elements.unitToggleC.addEventListener('click', () => setUnit('metric'));
  elements.unitToggleF.addEventListener('click', () => setUnit('imperial'));

  // Search Form Submit
  elements.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = elements.searchInput.value.trim();
    if (query) {
      hideAutocomplete();
      loadWeatherByCityName(query);
    }
  });

  // Autocomplete Input
  elements.searchInput.addEventListener('input', handleSearchInput);
  elements.searchInput.addEventListener('keydown', handleSearchKeydown);

  // Close Autocomplete on Click Outside
  document.addEventListener('click', (e) => {
    if (!elements.searchForm.contains(e.target) && !elements.autocompleteList.contains(e.target)) {
      hideAutocomplete();
    }
  });

  // Geolocation Locate Button
  elements.locateBtn.addEventListener('click', handleLocateUser);

  // Alert Retry & Dismiss
  elements.alertRetryBtn.addEventListener('click', () => {
    if (typeof state.retryAction === 'function') {
      hideAlert();
      state.retryAction();
    }
  });
  elements.alertDismissBtn.addEventListener('click', hideAlert);

  // Settings Modal Open/Close
  elements.settingsBtn.addEventListener('click', openSettingsModal);
  elements.closeModalBtn.addEventListener('click', closeSettingsModal);
  
  // Light dismiss on backdrop click
  elements.apiModal.addEventListener('click', (e) => {
    const dialogDimensions = elements.apiModal.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      closeSettingsModal();
    }
  });

  // Provider Radio Switch
  elements.providerOpenMeteo.addEventListener('change', updateModalRadioUI);
  elements.providerOwm.addEventListener('change', updateModalRadioUI);

  // Toggle Password Visibility
  elements.togglePwdBtn.addEventListener('click', () => {
    const current = elements.apiKeyInput.type;
    elements.apiKeyInput.type = current === 'password' ? 'text' : 'password';
    elements.togglePwdBtn.textContent = current === 'password' ? '🙈' : '👁️';
  });

  // Test API Key
  elements.testKeyBtn.addEventListener('click', handleTestApiKey);

  // Save Settings
  elements.saveSettingsBtn.addEventListener('click', handleSaveSettings);
}

// --- UI & Config Synchronization ---
function syncUIWithConfig() {
  const isMetric = state.config.unit === 'metric';
  elements.unitToggleC.classList.toggle('active', isMetric);
  elements.unitToggleC.setAttribute('aria-pressed', isMetric);
  elements.unitToggleF.classList.toggle('active', !isMetric);
  elements.unitToggleF.setAttribute('aria-pressed', !isMetric);

  const providerLabel = state.config.provider === 'openweathermap' ? 'OpenWeather' : 'Live WMO';
  elements.headerProviderBadge.textContent = providerLabel;
}

function setUnit(newUnit) {
  if (state.config.unit === newUnit) return;
  state.config = saveConfig({ unit: newUnit });
  syncUIWithConfig();

  // Reload current weather if location exists
  if (state.currentLocation) {
    loadWeatherDataForLocation(state.currentLocation);
  }
}

// --- Weather Fetching Orchestration ---
async function loadWeatherByCityName(cityName) {
  setLoadingState(true);
  hideAlert();

  state.retryAction = () => loadWeatherByCityName(cityName);

  try {
    if (state.config.provider === 'openweathermap' && state.config.owmApiKey) {
      // Fetch via OpenWeatherMap
      const data = await fetchOpenWeatherMapForecast(cityName, state.config.owmApiKey, state.config.unit);
      state.currentLocation = data.location;
      state.weatherData = data;
      renderWeatherDashboard(data);
      addRecentCity(data.location.name);
      renderRecentCities();
    } else {
      // Default & Recommended: Open-Meteo Geocoding + High Accuracy Forecast
      const cities = await searchCities(cityName);
      if (!cities || cities.length === 0) {
        throw new WeatherAPIError(`Could not find any city matching "${cityName}". Please verify the spelling.`, 'NOT_FOUND', 404);
      }

      const bestMatch = cities[0];
      state.currentLocation = bestMatch;
      await loadWeatherDataForLocation(bestMatch);
      addRecentCity(bestMatch.name);
      renderRecentCities();
    }
  } catch (err) {
    console.error('Error loading weather by city name:', err);
    showAlert(err.message || 'Failed to fetch weather data. Please try again.');
  } finally {
    setLoadingState(false);
  }
}

async function loadWeatherDataForLocation(locationInfo) {
  setLoadingState(true);
  hideAlert();

  state.retryAction = () => loadWeatherDataForLocation(locationInfo);

  try {
    let data;
    if (state.config.provider === 'openweathermap' && state.config.owmApiKey) {
      data = await fetchOpenWeatherMapForecast(locationInfo.name, state.config.owmApiKey, state.config.unit);
    } else {
      data = await fetchOpenMeteoForecast(locationInfo, state.config.unit);
    }

    state.weatherData = data;
    renderWeatherDashboard(data);
  } catch (err) {
    console.error('Error loading weather data:', err);
    showAlert(err.message || 'Failed to retrieve forecast data.');
  } finally {
    setLoadingState(false);
  }
}

// --- Geolocation User Handling ---
async function handleLocateUser() {
  if (!navigator.geolocation) {
    showAlert('Geolocation is not supported by your current browser.');
    return;
  }

  setLoadingState(true);
  hideAlert();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const geoInfo = await reverseGeocodeCoords(lat, lon);
        state.currentLocation = geoInfo;
        await loadWeatherDataForLocation(geoInfo);
        addRecentCity(geoInfo.name);
        renderRecentCities();
      } catch (err) {
        showAlert('Could not resolve your location coordinates to weather data.');
      } finally {
        setLoadingState(false);
      }
    },
    (geoErr) => {
      setLoadingState(false);
      let msg = 'Unable to retrieve your location.';
      if (geoErr.code === geoErr.PERMISSION_DENIED) {
        msg = 'Location permission denied. You can still search any city manually.';
      } else if (geoErr.code === geoErr.POSITION_UNAVAILABLE) {
        msg = 'Location information is currently unavailable.';
      } else if (geoErr.code === geoErr.TIMEOUT) {
        msg = 'Location request timed out. Please try again.';
      }
      showAlert(msg);
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

// --- Autocomplete Handling ---
async function handleSearchInput(e) {
  const query = e.target.value.trim();
  clearTimeout(state.autocompleteTimeout);
  state.selectedSuggestionIndex = -1;

  if (query.length < 2) {
    hideAutocomplete();
    return;
  }

  state.autocompleteTimeout = setTimeout(async () => {
    try {
      const matches = await searchCities(query);
      renderAutocompleteDropdown(matches);
    } catch (err) {
      console.warn('Autocomplete fetch failed:', err);
    }
  }, 280);
}

function renderAutocompleteDropdown(items) {
  elements.autocompleteList.innerHTML = '';
  if (!items || items.length === 0) {
    hideAutocomplete();
    return;
  }

  items.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.role = 'option';
    div.id = `suggestion-${index}`;
    div.tabIndex = 0;

    const locRegion = [item.region, item.country].filter(Boolean).join(', ');
    div.innerHTML = `
      <span class="suggestion-city">${escapeHtml(item.name)}</span>
      <span class="suggestion-region">${escapeHtml(locRegion)}</span>
    `;

    div.addEventListener('click', () => {
      elements.searchInput.value = item.name;
      hideAutocomplete();
      state.currentLocation = item;
      loadWeatherDataForLocation(item);
      addRecentCity(item.name);
      renderRecentCities();
    });

    elements.autocompleteList.appendChild(div);
  });

  elements.autocompleteList.classList.add('show');
}

function handleSearchKeydown(e) {
  const items = elements.autocompleteList.querySelectorAll('.suggestion-item');
  if (!items.length || !elements.autocompleteList.classList.contains('show')) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    state.selectedSuggestionIndex = (state.selectedSuggestionIndex + 1) % items.length;
    updateSuggestionHighlight(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    state.selectedSuggestionIndex = (state.selectedSuggestionIndex - 1 + items.length) % items.length;
    updateSuggestionHighlight(items);
  } else if (e.key === 'Enter') {
    if (state.selectedSuggestionIndex >= 0 && items[state.selectedSuggestionIndex]) {
      e.preventDefault();
      items[state.selectedSuggestionIndex].click();
    }
  } else if (e.key === 'Escape') {
    hideAutocomplete();
  }
}

function updateSuggestionHighlight(items) {
  items.forEach((item, idx) => {
    item.classList.toggle('highlighted', idx === state.selectedSuggestionIndex);
  });
}

function hideAutocomplete() {
  elements.autocompleteList.classList.remove('show');
  elements.autocompleteList.innerHTML = '';
  state.selectedSuggestionIndex = -1;
}

// --- Quick Cities Rendering ---
function renderRecentCities() {
  const container = elements.quickCitiesBar;
  // Keep only label
  container.innerHTML = '<span class="quick-label">Quick Cities:</span>';

  const cities = state.config.recentCities || ['London', 'Tokyo', 'New York', 'Paris', 'Sydney'];
  cities.forEach(cityName => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'city-chip';
    chip.textContent = cityName;
    if (state.currentLocation && state.currentLocation.name.toLowerCase() === cityName.toLowerCase()) {
      chip.classList.add('active');
    }

    chip.addEventListener('click', () => {
      elements.searchInput.value = cityName;
      loadWeatherByCityName(cityName);
    });

    container.appendChild(chip);
  });
}

// --- Dashboard Render Logic ---
function renderWeatherDashboard(data) {
  const { current, location, hourly, daily, unit, provider } = data;
  const isMetric = unit === 'metric';
  const unitSymbol = isMetric ? '°C' : '°F';
  const windUnit = isMetric ? 'km/h' : 'mph';

  // Apply Atmospheric Dynamic Background Theme to Body
  elements.body.className = current.bgTheme || 'theme-clear';

  // Update Hero Card
  elements.heroLocationName.textContent = location.name;
  const subParts = [location.region, location.country].filter(Boolean).join(', ');
  elements.heroLocationSub.textContent = subParts || 'Current Location';
  elements.heroLastUpdated.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  elements.heroProviderBadge.textContent = provider || 'Open-Meteo';

  elements.currentTemp.textContent = current.temp;
  elements.tempUnitSymbol.textContent = unitSymbol;
  elements.feelsLikeVal.textContent = `${current.feelsLike}${unitSymbol}`;

  // High/Low from today's daily
  if (daily && daily[0]) {
    elements.tempHigh.textContent = `${daily[0].tempMax}${unitSymbol}`;
    elements.tempLow.textContent = `${daily[0].tempMin}${unitSymbol}`;
  } else {
    elements.tempHigh.textContent = '--';
    elements.tempLow.textContent = '--';
  }

  // Weather Condition and Animated SVG Icon
  elements.heroConditionText.textContent = current.conditionText;
  elements.heroWeatherIcon.innerHTML = getIconSvg(current.iconName);

  // Metrics Grid
  elements.humidityVal.textContent = current.humidity;
  elements.humiditySubtext.textContent = getHumidityComment(current.humidity);

  elements.windSpeedVal.textContent = current.windSpeed;
  elements.windUnitLabel.textContent = windUnit;
  elements.windDirectionText.textContent = `${getWindDirectionCardinal(current.windDirection)} (${current.windDirection}°)`;
  elements.windCompassArrow.style.transform = `rotate(${current.windDirection}deg)`;

  elements.pressureVal.textContent = current.pressure;
  elements.pressureSubtext.textContent = getPressureComment(current.pressure);

  elements.uvIndexVal.textContent = current.uvIndex;
  const uvInfo = getUvIndexInfo(current.uvIndex);
  elements.uvBadge.textContent = uvInfo.label;
  elements.uvBadge.style.color = uvInfo.color;

  // Hourly Forecast Strip
  renderHourlyStrip(hourly, unitSymbol);

  // 7-Day Forecast List
  renderDailyList(daily, unitSymbol);
}

function renderHourlyStrip(hourly, unitSymbol) {
  elements.hourlyContainer.innerHTML = '';
  if (!hourly || hourly.length === 0) {
    elements.hourlyContainer.innerHTML = '<p style="color: var(--color-text-muted); padding: 1rem;">No hourly data available.</p>';
    return;
  }

  hourly.forEach((hour, idx) => {
    const card = document.createElement('div');
    card.className = `hourly-card ${idx === 0 ? 'active-hour' : ''}`;
    card.setAttribute('role', 'listitem');

    card.innerHTML = `
      <span class="hourly-time">${idx === 0 ? 'Now' : hour.time}</span>
      ${getIconSvg(hour.iconName)}
      <span class="hourly-temp">${hour.temp}°</span>
    `;

    elements.hourlyContainer.appendChild(card);
  });
}

function renderDailyList(daily, unitSymbol) {
  elements.dailyContainer.innerHTML = '';
  if (!daily || daily.length === 0) {
    elements.dailyContainer.innerHTML = '<p style="color: var(--color-text-muted); padding: 1rem;">No daily forecast available.</p>';
    return;
  }

  // Find overall min and max for relative temperature bar visualization
  const allMins = daily.map(d => d.tempMin);
  const allMaxs = daily.map(d => d.tempMax);
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const totalRange = Math.max(1, globalMax - globalMin);

  daily.forEach(day => {
    const row = document.createElement('div');
    row.className = 'daily-row';

    // Calculate bar percentage
    const minPercent = Math.round(((day.tempMin - globalMin) / totalRange) * 100);
    const maxPercent = Math.round(((day.tempMax - globalMin) / totalRange) * 100);
    const barWidth = Math.max(15, maxPercent - minPercent);

    row.innerHTML = `
      <span class="daily-name">${escapeHtml(day.dayName)}</span>
      <div class="daily-icon-box" aria-hidden="true">${getIconSvg(day.iconName)}</div>
      <div class="daily-condition" title="${escapeHtml(day.conditionText)}">
        ${escapeHtml(day.conditionText)}
        ${day.precipProb > 15 ? `<span style="font-size: 0.75rem; color: #38bdf8; margin-left: 4px;">💧${day.precipProb}%</span>` : ''}
      </div>
      <div class="daily-temp-bar-wrapper">
        <span class="daily-min">${day.tempMin}°</span>
        <div class="daily-bar" aria-hidden="true">
          <div class="daily-bar-fill" style="margin-left: ${minPercent}%; width: ${barWidth}%;"></div>
        </div>
        <span class="daily-max">${day.tempMax}°</span>
      </div>
    `;

    elements.dailyContainer.appendChild(row);
  });
}

// --- Loading & Skeleton States ---
function setLoadingState(loading) {
  state.isLoading = loading;
  elements.searchBtn.disabled = loading;
  elements.searchBtn.textContent = loading ? '...' : 'Search';

  const skeletonTargets = [
    elements.heroCard,
    ...document.querySelectorAll('.metric-card'),
    ...document.querySelectorAll('.section-card')
  ];

  skeletonTargets.forEach(card => {
    if (loading) {
      card.classList.add('skeleton');
    } else {
      card.classList.remove('skeleton');
    }
  });
}

// --- Alert Notifications ---
function showAlert(message) {
  elements.alertMessage.textContent = message;
  elements.alertBanner.classList.add('show');
}

function hideAlert() {
  elements.alertBanner.classList.remove('show');
}

// --- Settings & Modal Logic ---
function openSettingsModal() {
  const isOwm = state.config.provider === 'openweathermap';
  elements.providerOpenMeteo.checked = !isOwm;
  elements.providerOwm.checked = isOwm;
  elements.apiKeyInput.value = state.config.owmApiKey || '';
  elements.modalKeyStatus.className = 'modal-status-msg';
  elements.modalKeyStatus.textContent = '';
  updateModalRadioUI();

  elements.apiModal.showModal();
}

function closeSettingsModal() {
  elements.apiModal.close();
}

function updateModalRadioUI() {
  const isOwm = elements.providerOwm.checked;
  elements.labelOpenMeteo.classList.toggle('selected', !isOwm);
  elements.labelOwm.classList.toggle('selected', isOwm);
}

async function handleTestApiKey() {
  const key = elements.apiKeyInput.value.trim();
  const statusEl = elements.modalKeyStatus;

  if (!key) {
    statusEl.className = 'modal-status-msg error';
    statusEl.textContent = 'Please enter an OpenWeatherMap API key to test.';
    return;
  }

  elements.testKeyBtn.disabled = true;
  elements.testKeyBtn.textContent = 'Testing...';
  statusEl.className = 'modal-status-msg';
  statusEl.textContent = 'Contacting OpenWeatherMap servers...';

  try {
    await testOpenWeatherMapKey(key);
    statusEl.className = 'modal-status-msg success';
    statusEl.textContent = '✓ API Key is valid and active on OpenWeatherMap!';
  } catch (err) {
    statusEl.className = 'modal-status-msg error';
    statusEl.textContent = `✕ Verification failed: ${err.message}`;
  } finally {
    elements.testKeyBtn.disabled = false;
    elements.testKeyBtn.textContent = 'Test API Key';
  }
}

function handleSaveSettings() {
  const selectedProvider = elements.providerOwm.checked ? 'openweathermap' : 'open-meteo';
  const apiKey = elements.apiKeyInput.value.trim();

  state.config = saveConfig({
    provider: selectedProvider,
    owmApiKey: apiKey
  });

  syncUIWithConfig();
  closeSettingsModal();

  // Refetch weather with new provider
  if (state.currentLocation) {
    loadWeatherDataForLocation(state.currentLocation);
  }
}

// --- Utility Helpers ---
function getWindDirectionCardinal(deg) {
  if (deg === null || deg === undefined) return 'N/A';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5);
  return directions[index % 16];
}

function getHumidityComment(humidity) {
  if (humidity < 30) return 'Dry atmospheric moisture';
  if (humidity <= 60) return 'Comfortable humidity';
  if (humidity <= 80) return 'Humid conditions';
  return 'Very humid air';
}

function getPressureComment(pressure) {
  if (pressure < 1000) return 'Low barometric pressure';
  if (pressure > 1025) return 'High barometric pressure';
  return 'Standard barometric index';
}

function getUvIndexInfo(uv) {
  if (uv <= 2) return { label: 'Low', color: '#10b981' };
  if (uv <= 5) return { label: 'Moderate', color: '#f59e0b' };
  if (uv <= 7) return { label: 'High', color: '#f97316' };
  if (uv <= 10) return { label: 'Very High', color: '#ef4444' };
  return { label: 'Extreme', color: '#a855f7' };
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);
