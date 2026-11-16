/**
 * Live Weather Dashboard - JavaScript Application Core
 * InternCircle Project 04 Specification
 * 
 * Strict architectural guidelines implemented:
 * 1. Centralized API configuration at the top
 * 2. Async/await modular data-fetching layer (Geocoding & Forecast APIs)
 * 3. WMO Weather Code to emoji-free text label & SVG mapping
 * 4. Safe DOM rendering using document.createElement & .textContent (Zero innerHTML for dynamic/user data)
 * 5. Complete state management: Empty, Loading, Error, and Success states
 * 6. localStorage persistence with default fallback to 'Pune'
 * 7. Form submission-only fetching (No keystroke spam)
 */

'use strict';

/* ==========================================================================
   1. Centralized Configuration
   ========================================================================== */
const CONFIG = {
  GEOCODING_URL: 'https://geocoding-api.open-meteo.com/v1/search',
  FORECAST_URL: 'https://api.open-meteo.com/v1/forecast',
  DEFAULT_CITY: 'Pune',
  STORAGE_KEY: 'weather_dashboard_last_city'
};

/* ==========================================================================
   2. WMO Weather Code Lookup Dictionary (Emoji-Free & SVG Mapped)
   ========================================================================== */
const WMO_WEATHER_CODES = {
  0: { label: 'Clear Sky', iconId: 'icon-clear' },
  1: { label: 'Mainly Clear', iconId: 'icon-mainly-clear' },
  2: { label: 'Partly Cloudy', iconId: 'icon-partly-cloudy' },
  3: { label: 'Overcast', iconId: 'icon-overcast' },
  45: { label: 'Foggy', iconId: 'icon-fog' },
  48: { label: 'Depositing Rime Fog', iconId: 'icon-fog' },
  51: { label: 'Light Drizzle', iconId: 'icon-drizzle' },
  53: { label: 'Moderate Drizzle', iconId: 'icon-drizzle' },
  55: { label: 'Dense Drizzle', iconId: 'icon-drizzle' },
  56: { label: 'Light Freezing Drizzle', iconId: 'icon-drizzle' },
  57: { label: 'Dense Freezing Drizzle', iconId: 'icon-drizzle' },
  61: { label: 'Slight Rain', iconId: 'icon-rain' },
  63: { label: 'Moderate Rain', iconId: 'icon-rain' },
  65: { label: 'Heavy Rain', iconId: 'icon-rain' },
  66: { label: 'Light Freezing Rain', iconId: 'icon-rain' },
  67: { label: 'Heavy Freezing Rain', iconId: 'icon-rain' },
  71: { label: 'Slight Snow', iconId: 'icon-snow' },
  73: { label: 'Moderate Snow', iconId: 'icon-snow' },
  75: { label: 'Heavy Snow', iconId: 'icon-snow' },
  77: { label: 'Snow Grains', iconId: 'icon-snow' },
  80: { label: 'Slight Rain Showers', iconId: 'icon-rain' },
  81: { label: 'Moderate Rain Showers', iconId: 'icon-rain' },
  82: { label: 'Violent Rain Showers', iconId: 'icon-rain' },
  85: { label: 'Slight Snow Showers', iconId: 'icon-snow' },
  86: { label: 'Heavy Snow Showers', iconId: 'icon-snow' },
  95: { label: 'Thunderstorm', iconId: 'icon-thunderstorm' },
  96: { label: 'Thunderstorm with Slight Hail', iconId: 'icon-thunderstorm' },
  99: { label: 'Severe Thunderstorm with Hail', iconId: 'icon-thunderstorm' }
};

/**
 * Resolves a WMO numeric code to a descriptive text label and SVG icon symbol ID.
 * @param {number} code - WMO weather interpretation code
 * @returns {{ label: string, iconId: string }}
 */
function getWeatherInfo(code) {
  if (WMO_WEATHER_CODES.hasOwnProperty(code)) {
    return WMO_WEATHER_CODES[code];
  }
  return { label: 'Atmospheric Condition', iconId: 'icon-overcast' };
}

/* ==========================================================================
   3. DOM Elements Selection
   ========================================================================== */
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const statusBanner = document.getElementById('status-banner');
const statusIconBox = document.getElementById('status-icon-box');
const statusMessage = document.getElementById('status-message');
const weatherContent = document.getElementById('weather-content');
const currentWeatherContainer = document.getElementById('current-weather');
const forecastGridContainer = document.getElementById('forecast-grid');
const quickPills = document.querySelectorAll('.city-pill');

/* ==========================================================================
   4. Secure DOM Manipulation Helpers (Strictly No innerHTML for Content)
   ========================================================================== */

/**
 * Creates an SVG element referencing a symbol by ID via <use>.
 * @param {string} iconId - The SVG symbol ID (e.g., 'icon-clear')
 * @param {string} [className] - Optional CSS classes
 * @returns {SVGSVGElement}
 */
function createSvgIcon(iconId, className = '') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  if (className) {
    svg.setAttribute('class', className);
  }
  svg.setAttribute('aria-hidden', 'true');

  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${iconId}`);
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${iconId}`);

  svg.appendChild(use);
  return svg;
}

/**
 * Safely creates an HTML element with class and text content.
 * @param {string} tag - HTML tag name
 * @param {string} [className] - CSS class name
 * @param {string|number} [textContent] - Text to safely inject via .textContent
 * @returns {HTMLElement}
 */
function createSafeElement(tag, className = '', textContent = '') {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  if (textContent !== '' && textContent !== null && textContent !== undefined) {
    el.textContent = String(textContent);
  }
  return el;
}

/**
 * Clears all child nodes from a container safely.
 * @param {HTMLElement} element - Target container
 */
function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/* ==========================================================================
   5. UI State Management
   ========================================================================== */

/**
 * Displays the status banner with custom message, state class, and appropriate icon.
 * @param {string} message - User-facing message
 * @param {'warning'|'loading'|'error'} stateType - State type
 */
function showStatus(message, stateType) {
  clearElement(statusIconBox);
  statusBanner.className = `status-banner status-${stateType}`;
  statusMessage.textContent = message;

  let iconId = 'icon-alert-warning';
  let iconClass = '';

  if (stateType === 'loading') {
    iconId = 'icon-spinner';
    iconClass = 'spinner-icon';
  } else if (stateType === 'error') {
    iconId = 'icon-alert-error';
  } else if (stateType === 'warning') {
    iconId = 'icon-alert-warning';
  }

  const icon = createSvgIcon(iconId, iconClass);
  statusIconBox.appendChild(icon);
  statusBanner.classList.remove('hidden');
}

/**
 * Hides the status notification banner.
 */
function hideStatus() {
  statusBanner.classList.add('hidden');
  clearElement(statusIconBox);
  statusMessage.textContent = '';
}

/**
 * Toggles controls between active and busy states.
 * @param {boolean} isLoading
 */
function setLoadingState(isLoading) {
  cityInput.disabled = isLoading;
  searchBtn.disabled = isLoading;

  if (isLoading) {
    weatherContent.classList.add('is-loading');
  } else {
    weatherContent.classList.remove('is-loading');
  }
}

/* ==========================================================================
   6. Core API Layer (Open-Meteo V1)
   ========================================================================== */

/**
 * Geocodes a city name to latitude, longitude, name, and country.
 * @param {string} name - Raw city name input
 * @returns {Promise<{ name: string, country: string, lat: number, lon: number }>}
 */
async function findCity(name) {
  const sanitizedCity = name.trim();
  const url = `${CONFIG.GEOCODING_URL}?count=1&name=${encodeURIComponent(sanitizedCity)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to retrieve location coordinates from the geocoding service.');
  }

  const data = await res.json();
  if (!data.results || !data.results.length) {
    throw new Error('City not found. Please check the spelling and try again.');
  }

  const result = data.results[0];
  return {
    name: result.name,
    country: result.country || result.country_code || '',
    lat: result.latitude,
    lon: result.longitude
  };
}

/**
 * Fetches current weather and 5-day daily forecast for specified coordinates.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>}
 */
async function getWeather(lat, lon) {
  const url = `${CONFIG.FORECAST_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to retrieve atmospheric forecast data from the meteorological service.');
  }

  const data = await res.json();
  return data;
}

/* ==========================================================================
   7. Safe DOM Presentation Layer
   ========================================================================== */

/**
 * Formats an ISO date string into a user-friendly format avoiding timezone shift.
 * @param {string} isoDate - 'YYYY-MM-DD' or ISO timestamp
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
function formatDateSafe(isoDate, options) {
  try {
    // Adding T12:00:00 ensures date string is parsed at local noon, avoiding UTC midnight offset day-shifts
    const parsedDate = isoDate.includes('T') ? new Date(isoDate) : new Date(`${isoDate}T12:00:00`);
    return parsedDate.toLocaleDateString(undefined, options);
  } catch (e) {
    return isoDate;
  }
}

/**
 * Safely renders the Current Weather Card into the DOM.
 * @param {{ name: string, country: string }} cityInfo
 * @param {object} weatherData - API response containing current atmospheric data
 */
function renderCurrentWeather(cityInfo, weatherData) {
  clearElement(currentWeatherContainer);

  const current = weatherData.current;
  const condition = getWeatherInfo(current.weather_code);

  // Main Card Layout Grid
  const layout = createSafeElement('div', 'cw-layout');

  // Left Column: City, Date, Temp, Condition Label
  const infoCol = createSafeElement('div', 'cw-info');

  const locHeader = createSafeElement('div', 'cw-location-header');
  const cityRow = createSafeElement('div', 'cw-city-row');
  const locIcon = createSvgIcon('icon-location', 'cw-loc-icon');
  const cityName = createSafeElement('h2', 'cw-city-name', cityInfo.name);

  cityRow.appendChild(locIcon);
  cityRow.appendChild(cityName);

  if (cityInfo.country) {
    const countryTag = createSafeElement('span', 'cw-country-tag', cityInfo.country);
    cityRow.appendChild(countryTag);
  }

  const dateRow = createSafeElement('div', 'cw-date-row');
  const calendarIcon = createSvgIcon('icon-calendar', 'cw-date-icon');
  const formattedDate = formatDateSafe(current.time || new Date().toISOString(), {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const dateText = createSafeElement('span', '', formattedDate);

  dateRow.appendChild(calendarIcon);
  dateRow.appendChild(dateText);

  locHeader.appendChild(cityRow);
  locHeader.appendChild(dateRow);

  // Temperature Row
  const tempRow = createSafeElement('div', 'cw-temp-row');
  const roundedTemp = Math.round(current.temperature_2m);
  const tempVal = createSafeElement('span', 'cw-temp-value', `${roundedTemp}`);
  const tempUnit = createSafeElement('span', 'cw-temp-unit', '°C');

  tempRow.appendChild(tempVal);
  tempRow.appendChild(tempUnit);

  // Weather Condition Badge (Emoji-free text label)
  const conditionBadge = createSafeElement('div', 'cw-condition-badge');
  const conditionText = createSafeElement('span', '', condition.label);
  conditionBadge.appendChild(conditionText);

  infoCol.appendChild(locHeader);
  infoCol.appendChild(tempRow);
  infoCol.appendChild(conditionBadge);

  // Right Column: SVG Hero Icon & Metrics (Humidity, Wind Speed)
  const visualsCol = createSafeElement('div', 'cw-visuals');

  const heroIconBox = createSafeElement('div', 'cw-hero-icon-container');
  const heroSvg = createSvgIcon(condition.iconId, 'cw-hero-icon');
  heroIconBox.appendChild(heroSvg);

  const metricsGrid = createSafeElement('div', 'cw-metrics-grid');

  // Humidity Metric Box
  const humidityBox = createSafeElement('div', 'cw-metric-box');
  const humidityIcon = createSvgIcon('icon-humidity', 'cw-metric-icon');
  const humidityDetails = createSafeElement('div', 'cw-metric-details');
  const humidityLabel = createSafeElement('span', 'cw-metric-label', 'Humidity');
  const humidityVal = createSafeElement('span', 'cw-metric-val', `${current.relative_humidity_2m}%`);

  humidityDetails.appendChild(humidityLabel);
  humidityDetails.appendChild(humidityVal);
  humidityBox.appendChild(humidityIcon);
  humidityBox.appendChild(humidityDetails);

  // Wind Speed Metric Box
  const windBox = createSafeElement('div', 'cw-metric-box');
  const windIcon = createSvgIcon('icon-wind', 'cw-metric-icon');
  const windDetails = createSafeElement('div', 'cw-metric-details');
  const windLabel = createSafeElement('span', 'cw-metric-label', 'Wind Speed');
  const windVal = createSafeElement('span', 'cw-metric-val', `${current.wind_speed_10m} km/h`);

  windDetails.appendChild(windLabel);
  windDetails.appendChild(windVal);
  windBox.appendChild(windIcon);
  windBox.appendChild(windDetails);

  metricsGrid.appendChild(humidityBox);
  metricsGrid.appendChild(windBox);

  visualsCol.appendChild(heroIconBox);
  visualsCol.appendChild(metricsGrid);

  layout.appendChild(infoCol);
  layout.appendChild(visualsCol);

  currentWeatherContainer.appendChild(layout);
}

/**
 * Safely renders the 5-Column Forecast Grid into the DOM.
 * @param {object} weatherData - API response containing daily forecast arrays
 */
function renderForecast(weatherData) {
  clearElement(forecastGridContainer);

  const daily = weatherData.daily;
  if (!daily || !daily.time || !daily.time.length) {
    return;
  }

  // Strictly render up to 5 days
  const daysCount = Math.min(5, daily.time.length);

  for (let i = 0; i < daysCount; i++) {
    const rawDate = daily.time[i];
    const weatherCode = daily.weather_code[i];
    const maxTemp = Math.round(daily.temperature_2m_max[i]);
    const minTemp = Math.round(daily.temperature_2m_min[i]);
    const condition = getWeatherInfo(weatherCode);

    const card = createSafeElement('article', 'forecast-card');

    // Date Box: Weekday & Date
    const dateBox = createSafeElement('div', 'forecast-date-box');
    const weekdayStr = formatDateSafe(rawDate, { weekday: 'short' });
    const fullDateStr = formatDateSafe(rawDate, { month: 'short', day: 'numeric' });

    const weekdayEl = createSafeElement('span', 'forecast-weekday', weekdayStr);
    const dateEl = createSafeElement('span', 'forecast-date', fullDateStr);

    dateBox.appendChild(weekdayEl);
    dateBox.appendChild(dateEl);

    // SVG Weather Icon
    const iconBox = createSafeElement('div', 'forecast-icon-box');
    const svgIcon = createSvgIcon(condition.iconId, 'forecast-icon');
    iconBox.appendChild(svgIcon);

    // Condition Text (Emoji-free)
    const conditionEl = createSafeElement('span', 'forecast-condition', condition.label);

    // Temperature Range (Max / Min with SVG direction arrows)
    const tempRange = createSafeElement('div', 'forecast-temp-range');

    const highStat = createSafeElement('div', 'temp-stat temp-high');
    const highArrow = createSvgIcon('icon-temp-high', 'temp-arrow-icon high');
    const highText = createSafeElement('span', '', `${maxTemp}°`);
    highStat.appendChild(highArrow);
    highStat.appendChild(highText);

    const lowStat = createSafeElement('div', 'temp-stat temp-low');
    const lowArrow = createSvgIcon('icon-temp-low', 'temp-arrow-icon low');
    const lowText = createSafeElement('span', '', `${minTemp}°`);
    lowStat.appendChild(lowArrow);
    lowStat.appendChild(lowText);

    tempRange.appendChild(highStat);
    tempRange.appendChild(lowStat);

    // Assemble Card
    card.appendChild(dateBox);
    card.appendChild(iconBox);
    card.appendChild(conditionEl);
    card.appendChild(tempRange);

    forecastGridContainer.appendChild(card);
  }
}

/* ==========================================================================
   8. Application Orchestrator & State Flow
   ========================================================================== */

/**
 * Main coordinator function to fetch and display weather for a city query.
 * @param {string} cityName - City name to search
 */
async function fetchAndRenderWeather(cityName) {
  const sanitizedCity = (cityName || '').trim();

  // State 1: Empty Input Check
  if (!sanitizedCity) {
    showStatus('Please enter a city name.', 'warning');
    return;
  }

  // State 2: Loading State Initiation
  showStatus('Fetching live weather...', 'loading');
  setLoadingState(true);

  try {
    // Step 1: Geocode city name
    const cityData = await findCity(sanitizedCity);

    // Step 2: Fetch 5-day forecast & current data
    const weatherData = await getWeather(cityData.lat, cityData.lon);

    // State 4: Success State Presentation
    renderCurrentWeather(cityData, weatherData);
    renderForecast(weatherData);

    // Persist last valid search to localStorage
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, cityData.name);
    } catch (storageError) {
      // Graceful fallback if localStorage is unavailable/disabled in privacy modes
      console.warn('LocalStorage unavailable:', storageError);
    }

    // Hide status banner and present weather cards
    hideStatus();
    weatherContent.classList.remove('hidden');

  } catch (error) {
    // State 3: Error State Handling
    weatherContent.classList.add('hidden');

    if (error instanceof TypeError || !navigator.onLine) {
      showStatus('Network problem. Please check your internet connection.', 'error');
    } else {
      showStatus(error.message || 'An unexpected error occurred. Please try again.', 'error');
    }
  } finally {
    // Always restore UI controls
    setLoadingState(false);
  }
}

/* ==========================================================================
   9. Event Listeners & Initialization
   ========================================================================== */

// Search Form Submission (Strictly on submit event - No keystroke requests)
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  fetchAndRenderWeather(cityInput.value);
});

// Quick City Pills Click Handlers
quickPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    const city = pill.getAttribute('data-city');
    if (city) {
      cityInput.value = city;
      fetchAndRenderWeather(city);
    }
  });
});

// Initial Bootstrap on Page Load
window.addEventListener('DOMContentLoaded', () => {
  let initialCity = CONFIG.DEFAULT_CITY;

  try {
    const savedCity = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (savedCity && savedCity.trim()) {
      initialCity = savedCity.trim();
    }
  } catch (storageError) {
    console.warn('LocalStorage access restricted:', storageError);
  }

  cityInput.value = initialCity;
  fetchAndRenderWeather(initialCity);
});
