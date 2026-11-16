/**
 * Live Weather Dashboard - JavaScript Application Core
 * Maharashtra District Weather Hub & Worldwide Forecast
 * InternCircle Project 04 Specification
 * 
 * Strict architectural guidelines implemented:
 * 1. Centralized API configuration at the top
 * 2. Complete 36 Maharashtra Districts registry with calibrated coordinates
 * 3. Async/await modular data-fetching layer (Open-Meteo Geocoding & Forecast APIs)
 * 4. WMO Weather Code to emoji-free text label & SVG mapping
 * 5. Safe DOM rendering using document.createElement & .textContent (Zero innerHTML for dynamic/user data)
 * 6. Complete state management: Empty, Loading, Error, and Success states
 * 7. localStorage persistence with default fallback to 'Pune'
 * 8. Form submission-only fetching + District dropdown selection (No keystroke spam)
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
   2. Comprehensive Maharashtra 36 Districts Registry
   ========================================================================== */
const MAHARASHTRA_DISTRICTS = {
  // Pune Division
  'pune': { name: 'Pune', division: 'Pune Division', lat: 18.5204, lon: 73.8567 },
  'satara': { name: 'Satara', division: 'Pune Division', lat: 17.6805, lon: 73.9934 },
  'sangli': { name: 'Sangli', division: 'Pune Division', lat: 16.8524, lon: 74.5815 },
  'solapur': { name: 'Solapur', division: 'Pune Division', lat: 17.6599, lon: 75.9064 },
  'kolhapur': { name: 'Kolhapur', division: 'Pune Division', lat: 16.7050, lon: 74.2433 },

  // Konkan Division
  'mumbai': { name: 'Mumbai City', division: 'Konkan Division', lat: 18.9388, lon: 72.8354 },
  'mumbai suburban': { name: 'Mumbai Suburban', division: 'Konkan Division', lat: 19.1171, lon: 72.9044 },
  'thane': { name: 'Thane', division: 'Konkan Division', lat: 19.2183, lon: 72.9781 },
  'palghar': { name: 'Palghar', division: 'Konkan Division', lat: 19.6967, lon: 72.7699 },
  'raigad': { name: 'Raigad (Alibag)', division: 'Konkan Division', lat: 18.6414, lon: 72.8722 },
  'ratnagiri': { name: 'Ratnagiri', division: 'Konkan Division', lat: 16.9902, lon: 73.3120 },
  'sindhudurg': { name: 'Sindhudurg', division: 'Konkan Division', lat: 16.1158, lon: 73.6967 },

  // Nashik Division (Khandesh)
  'nashik': { name: 'Nashik', division: 'Nashik Division', lat: 19.9975, lon: 73.7898 },
  'ahmednagar': { name: 'Ahilyanagar (Ahmednagar)', division: 'Nashik Division', lat: 19.0948, lon: 74.7480 },
  'ahilyanagar': { name: 'Ahilyanagar (Ahmednagar)', division: 'Nashik Division', lat: 19.0948, lon: 74.7480 },
  'dhule': { name: 'Dhule', division: 'Nashik Division', lat: 20.9042, lon: 74.7749 },
  'jalgaon': { name: 'Jalgaon', division: 'Nashik Division', lat: 21.0077, lon: 75.5626 },
  'nandurbar': { name: 'Nandurbar', division: 'Nashik Division', lat: 21.3697, lon: 74.2396 },

  // Chhatrapati Sambhajinagar Division (Marathwada)
  'chhatrapati sambhajinagar': { name: 'Chhatrapati Sambhajinagar', division: 'Marathwada Division', lat: 19.8762, lon: 75.3433 },
  'aurangabad': { name: 'Chhatrapati Sambhajinagar', division: 'Marathwada Division', lat: 19.8762, lon: 75.3433 },
  'jalna': { name: 'Jalna', division: 'Marathwada Division', lat: 19.8347, lon: 75.8816 },
  'beed': { name: 'Beed', division: 'Marathwada Division', lat: 18.9891, lon: 75.7601 },
  'latur': { name: 'Latur', division: 'Marathwada Division', lat: 18.4088, lon: 76.5604 },
  'dharashiv': { name: 'Dharashiv (Osmanabad)', division: 'Marathwada Division', lat: 18.1861, lon: 76.0419 },
  'osmanabad': { name: 'Dharashiv (Osmanabad)', division: 'Marathwada Division', lat: 18.1861, lon: 76.0419 },
  'nanded': { name: 'Nanded', division: 'Marathwada Division', lat: 19.1383, lon: 77.3210 },
  'parbhani': { name: 'Parbhani', division: 'Marathwada Division', lat: 19.2686, lon: 76.7708 },
  'hingoli': { name: 'Hingoli', division: 'Marathwada Division', lat: 19.7196, lon: 77.1472 },

  // Amravati Division (Vidarbha West)
  'amravati': { name: 'Amravati', division: 'Amravati Division', lat: 20.9374, lon: 77.7796 },
  'akola': { name: 'Akola', division: 'Amravati Division', lat: 20.7002, lon: 77.0082 },
  'yavatmal': { name: 'Yavatmal', division: 'Amravati Division', lat: 20.3888, lon: 78.1204 },
  'buldhana': { name: 'Buldhana', division: 'Amravati Division', lat: 20.5293, lon: 76.1843 },
  'washim': { name: 'Washim', division: 'Amravati Division', lat: 20.1110, lon: 77.1345 },

  // Nagpur Division (Vidarbha East)
  'nagpur': { name: 'Nagpur', division: 'Nagpur Division', lat: 21.1458, lon: 79.0882 },
  'wardha': { name: 'Wardha', division: 'Nagpur Division', lat: 20.7453, lon: 78.6022 },
  'bhandara': { name: 'Bhandara', division: 'Nagpur Division', lat: 21.1717, lon: 79.6543 },
  'gondia': { name: 'Gondia', division: 'Nagpur Division', lat: 21.4598, lon: 80.1961 },
  'chandrapur': { name: 'Chandrapur', division: 'Nagpur Division', lat: 19.9615, lon: 79.2961 },
  'gadchiroli': { name: 'Gadchiroli', division: 'Nagpur Division', lat: 20.1809, lon: 79.9933 }
};

/* ==========================================================================
   3. WMO Weather Code Lookup Dictionary (Emoji-Free & SVG Mapped)
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
   4. DOM Elements Selection
   ========================================================================== */
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const districtSelect = document.getElementById('district-select');
const statusBanner = document.getElementById('status-banner');
const statusIconBox = document.getElementById('status-icon-box');
const statusMessage = document.getElementById('status-message');
const weatherContent = document.getElementById('weather-content');
const currentWeatherContainer = document.getElementById('current-weather');
const forecastGridContainer = document.getElementById('forecast-grid');
const quickPills = document.querySelectorAll('.city-pill');

/* ==========================================================================
   5. Secure DOM Manipulation Helpers (Strictly No innerHTML for Content)
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
   6. UI State Management
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
  if (districtSelect) {
    districtSelect.disabled = isLoading;
  }

  if (isLoading) {
    weatherContent.classList.add('is-loading');
  } else {
    weatherContent.classList.remove('is-loading');
  }
}

/* ==========================================================================
   7. Core API Layer (Open-Meteo V1 + Maharashtra Districts)
   ========================================================================== */

/**
 * Geocodes a city or district name to latitude, longitude, name, and regional metadata.
 * Prioritizes the calibrated 36 Maharashtra Districts registry for speed and precision.
 * @param {string} name - Raw city or district query
 * @returns {Promise<{ name: string, country: string, admin1: string, division: string, lat: number, lon: number, isMaharashtra: boolean }>}
 */
async function findCity(name) {
  const sanitizedCity = name.trim();
  const lowerQuery = sanitizedCity.toLowerCase();

  // Instant registry match for Maharashtra districts
  if (MAHARASHTRA_DISTRICTS.hasOwnProperty(lowerQuery)) {
    const mh = MAHARASHTRA_DISTRICTS[lowerQuery];
    return {
      name: mh.name,
      country: 'India',
      admin1: 'Maharashtra',
      division: mh.division,
      lat: mh.lat,
      lon: mh.lon,
      isMaharashtra: true
    };
  }

  // Fallback to Open-Meteo Geocoding API for global locations
  const url = `${CONFIG.GEOCODING_URL}?count=1&name=${encodeURIComponent(sanitizedCity)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to retrieve location coordinates from the geocoding service.');
  }

  const data = await res.json();
  if (!data.results || !data.results.length) {
    throw new Error('City or district not found. Please check the spelling and try again.');
  }

  const result = data.results[0];
  const admin1 = result.admin1 || '';
  const isMaharashtra = admin1.toLowerCase().includes('maharashtra');

  return {
    name: result.name,
    country: result.country || result.country_code || '',
    admin1: admin1,
    division: isMaharashtra ? 'Maharashtra State' : '',
    lat: result.latitude,
    lon: result.longitude,
    isMaharashtra: isMaharashtra
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
   8. Safe DOM Presentation Layer
   ========================================================================== */

/**
 * Formats an ISO date string into a user-friendly format avoiding timezone shift.
 * @param {string} isoDate - 'YYYY-MM-DD' or ISO timestamp
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
function formatDateSafe(isoDate, options) {
  try {
    const parsedDate = isoDate.includes('T') ? new Date(isoDate) : new Date(`${isoDate}T12:00:00`);
    return parsedDate.toLocaleDateString(undefined, options);
  } catch (e) {
    return isoDate;
  }
}

/**
 * Safely renders the Current Weather Card into the DOM.
 * @param {{ name: string, country: string, admin1?: string, division?: string, isMaharashtra?: boolean }} cityInfo
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

  // Dedicated Maharashtra District badge if applicable
  if (cityInfo.isMaharashtra) {
    const mhBadge = createSafeElement('span', 'cw-mh-badge');
    const mhIcon = createSvgIcon('icon-district', 'cw-date-icon');
    const mhText = createSafeElement('span', '', cityInfo.division || 'Maharashtra');
    mhBadge.appendChild(mhIcon);
    mhBadge.appendChild(mhText);
    cityRow.appendChild(mhBadge);
  } else if (cityInfo.country) {
    const regionTag = cityInfo.admin1 ? `${cityInfo.admin1}, ${cityInfo.country}` : cityInfo.country;
    const countryTag = createSafeElement('span', 'cw-country-tag', regionTag);
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
   9. Application Orchestrator & State Flow
   ========================================================================== */

/**
 * Main coordinator function to fetch and display weather for a city or district query.
 * @param {string} cityName - City or district name to search
 */
async function fetchAndRenderWeather(cityName) {
  const sanitizedCity = (cityName || '').trim();

  // State 1: Empty Input Check
  if (!sanitizedCity) {
    showStatus('Please enter a city or district name.', 'warning');
    return;
  }

  // State 2: Loading State Initiation
  showStatus(`Fetching live weather for ${sanitizedCity}...`, 'loading');
  setLoadingState(true);

  try {
    // Step 1: Geocode or resolve district
    const cityData = await findCity(sanitizedCity);

    // Step 2: Fetch 5-day forecast & current data
    const weatherData = await getWeather(cityData.lat, cityData.lon);

    // State 4: Success State Presentation
    renderCurrentWeather(cityData, weatherData);
    renderForecast(weatherData);

    // Update active pill highlight if applicable
    quickPills.forEach((pill) => {
      const pCity = pill.getAttribute('data-city');
      if (pCity && pCity.toLowerCase() === sanitizedCity.toLowerCase()) {
        pill.classList.add('active-pill');
      } else {
        pill.classList.remove('active-pill');
      }
    });

    // Synchronize district dropdown value if it matches a district
    if (districtSelect) {
      const matchOpt = Array.from(districtSelect.options).find(
        (opt) => opt.value.toLowerCase() === sanitizedCity.toLowerCase()
      );
      districtSelect.value = matchOpt ? matchOpt.value : '';
    }

    // Persist last valid search to localStorage
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, cityData.name);
    } catch (storageError) {
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
   10. Event Listeners & Initialization
   ========================================================================== */

// Search Form Submission (Strictly on submit event - No keystroke requests)
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  fetchAndRenderWeather(cityInput.value);
});

// Maharashtra District Dropdown Change Handler
if (districtSelect) {
  districtSelect.addEventListener('change', (e) => {
    const selectedDistrict = e.target.value;
    if (selectedDistrict) {
      cityInput.value = selectedDistrict;
      fetchAndRenderWeather(selectedDistrict);
    }
  });
}

// Quick City / District Pills Click Handlers
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
