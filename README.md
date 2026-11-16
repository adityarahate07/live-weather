# Live Weather Dashboard (InternCircle Project 04)
### Featuring Maharashtra Districts Weather Hub & Worldwide Forecast

A responsive, high-performance, modern atmospheric dashboard built with **HTML5**, **CSS3**, and **Vanilla JavaScript (ES6+)**. This application leverages the keyless, open-source **Open-Meteo APIs (v1)** to provide real-time meteorological conditions and an extended 5-day weather forecast, with dedicated coverage for all **36 districts of Maharashtra** and any global city.

---

## 1. Project Overview & Architecture

This project strictly satisfies all requirements of the **InternCircle Project 04** specification:
- **Zero Third-Party JS Libraries**: Pure Vanilla ES6+ without frameworks, bundlers, or bulky external dependencies.
- **Dedicated Maharashtra Districts Weather Hub**:
  - Full support for all **36 districts of Maharashtra** categorized across 6 administrative divisions (Pune, Konkan, Nashik, Marathwada / Chhatrapati Sambhajinagar, Amravati, Nagpur).
  - Quick-select glassmorphic dropdown selector for instant one-touch district weather exploration.
  - Calibrated coordinate lookup table for instant, zero-latency regional matching.
  - Regional state badge (`"Maharashtra, India"` / Division tag) on the live weather card.
  - Trending quick pills for premier Maharashtra hubs (`Pune`, `Mumbai`, `Nagpur`, `Nashik`, `Chhatrapati Sambhajinagar`, `Kolhapur`, `Thane`, `Solapur`, `Satara`, `Amravati`).
- **Strict DOM Security**: 100% safe DOM manipulation using `document.createElement()` and `.textContent`. Zero use of `innerHTML` on dynamic API responses or user input to eliminate XSS vulnerabilities.
- **Emoji-Free Design**: All weather conditions, alerts, and metrics utilize clean, minimalist SVG vector icons paired with clear textual condition labels.
- **Full UI State Coverage**: Dedicated visual and functional handling for Empty Input, Loading, Error, and Success states.
- **Local Persistence**: Remembers the user's last successfully searched location via `localStorage`, defaulting to `"Pune"` on first load.

### Modular Folder Structure
```
live-weather-dashboard/
├── index.html        # Semantic HTML5 markup, SVG symbol sprite, and accessible UI layout
├── style.css         # Modern glassmorphic dark-slate styling, CSS Grid, Flexbox & CSS variables
├── script.js         # Modular API layer, Maharashtra districts registry, state management, safe DOM
└── README.md         # Comprehensive project documentation & error-handling submission brief
```

---

## 2. Maharashtra 36 Districts Coverage

The application includes pre-calibrated meteorological coordinates and division grouping for all 36 Maharashtra districts:

| Administrative Division | Districts Included |
| :--- | :--- |
| **Pune Division** | Pune, Satara, Sangli, Solapur, Kolhapur |
| **Konkan Division** | Mumbai City, Mumbai Suburban, Thane, Palghar, Raigad (Alibag), Ratnagiri, Sindhudurg |
| **Nashik Division (Khandesh)** | Nashik, Ahilyanagar (Ahmednagar), Dhule, Jalgaon, Nandurbar |
| **Chhatrapati Sambhajinagar (Marathwada)** | Chhatrapati Sambhajinagar (Aurangabad), Jalna, Beed, Latur, Dharashiv (Osmanabad), Nanded, Parbhani, Hingoli |
| **Amravati Division (Vidarbha West)** | Amravati, Akola, Yavatmal, Buldhana, Washim |
| **Nagpur Division (Vidarbha East)** | Nagpur, Wardha, Bhandara, Gondia, Chandrapur, Gadchiroli |

---

## 3. Core Functional & Technical Features

### Keyless Open-Meteo API (v1) Integration
- **Centralized Configuration**: All base API endpoints are configured in a single `CONFIG` object at the top of `script.js`.
- **Hybrid Geocoding**:
  - Matches queries against the 36-district Maharashtra registry instantly for zero-latency lookups.
  - Falls back to `https://geocoding-api.open-meteo.com/v1/search` for worldwide locations.
- **Forecast API**: Queries `https://api.open-meteo.com/v1/forecast` with `current` parameters (`temperature_2m`, `relative_humidity_2m`, `wind_speed_10m`, `weather_code`) and `daily` parameters (`weather_code`, `temperature_2m_max`, `temperature_2m_min`, `forecast_days=5`).

### Safe DOM Injection Architecture
To maintain enterprise-grade security and prevent script injection or DOM clobbering:
- **No `innerHTML` for API or User Data**: All text values (city names, temperatures, dates, wind speed, error messages) are set strictly using `.textContent`.
- **Programmatic DOM Elements**: Dynamic cards are assembled element-by-element using `document.createElement()` and `appendChild()`.
- **Vector Icons via SVG `<use>`**: SVG icons are instantiated safely using `document.createElementNS('http://www.w3.org/2000/svg', ...)` referencing predefined symbols in the DOM sprite.

### WMO Weather Interpretation & Minimalist Vector Icons
Numeric WMO codes (0 to 99) are resolved through a lookup table (`WMO_WEATHER_CODES`) into crisp, professional text labels and corresponding SVG icons:
- `0`: Clear Sky
- `1 - 3`: Mainly Clear / Partly Cloudy / Overcast
- `45, 48`: Foggy / Depositing Rime Fog
- `51 - 57`: Light / Moderate / Dense Drizzle
- `61 - 67`: Slight / Moderate / Heavy Rain & Freezing Rain
- `71 - 77`: Slight / Moderate / Heavy Snow
- `80 - 82`: Rain Showers
- `85 - 86`: Snow Showers
- `95 - 99`: Thunderstorms & Hail

### Responsive Glassmorphic Dark-Slate UI
- Built with a deep dark-slate color palette (`#070b14` to `#0f172a`), frosted glass cards (`backdrop-filter: blur(20px)`), subtle borders (`rgba(255, 255, 255, 0.08)`), and glowing accents.
- **Fluid Layout**:
  - **Desktop (> 960px)**: Dual-control search & district dropdown bar, 5-column forecast grid, and dual-column current weather showcase.
  - **Tablet (541px - 960px)**: 3-column / 2-column auto-flow grid with stacked controls.
  - **Mobile (360px - 540px)**: Full vertical stack for controls, single-column forecast cards, and touch-friendly controls.

---

## 4. Dedicated Error-Handling Architecture

A primary requirement of the InternCircle Project 04 submission is a robust, resilient error-handling architecture. The application implements a multi-tier defense:

```
[User Action: Form Submit OR District Select]
       │
       ▼
[Tier 1: Client-Side Input Sanitization]
   ├── Empty or Whitespace Only? ──► [Empty State: "Please enter a city or district name."] (No Network Call)
   └── Valid String? ──────────────► [Loading State: "Fetching live weather...", Controls Disabled]
                                              │
                                              ▼
                                 [Tier 2: Registry Match or Geocoding Request]
                                    ├── Found in Maharashtra Registry? ────► [Instant Coordinates Resolved]
                                    ├── Network Fail / Offline (TypeError)? ──► [Network Error: "Network problem..."]
                                    ├── !res.ok (HTTP 4xx / 5xx)? ──────────► [Server Error: "Failed to retrieve..."]
                                    └── Empty results array? ──────────────► [Not Found Error: "City or district not found..."]
                                              │
                                              ▼
                                 [Tier 3: Forecast Network Request]
                                    ├── Network Fail / Offline (TypeError)? ──► [Network Error: "Network problem..."]
                                    └── !res.ok (HTTP 4xx / 5xx)? ──────────► [Server Error: "Failed to retrieve..."]
                                              │
                                              ▼
                                 [Tier 4: Success Presentation & Storage]
                                    ├── Render Current Weather & 5-Day Cards
                                    ├── Persist City to localStorage (with try/catch fallback)
                                    └── [Finally Block: Re-enable controls, clear loading indicator]
```

### 1. Tier 1: Client-Side Validation & Rate-Limit Protection
- Input is sanitized via `.trim()`.
- If the submission is empty or whitespace-only, an alert banner immediately displays `"Please enter a city or district name."` with an amber warning style.
- **Zero Network Traffic on Invalid Input**: Prevents unnecessary calls to Open-Meteo.
- **Submit-Only Trigger**: API calls are strictly bound to the form `submit` event (Enter key or Search button click) and district dropdown change. The `input` event is intentionally unmonitored to prevent firing network requests on every keystroke.

### 2. Tier 2: Network & Offline Detection
- Fetch requests are wrapped in `try...catch` blocks.
- If a network partition occurs, the browser drops offline, or DNS resolution fails, modern browsers throw a `TypeError`.
- The error handler specifically catches `error instanceof TypeError || !navigator.onLine` and maps it directly to the user-friendly alert:
  > `"Network problem. Please check your internet connection."`

### 3. Tier 3: HTTP Status & API Response Validation
- Standard `fetch()` calls do not reject on HTTP error statuses (like `404` or `500`). The code explicitly validates:
  ```javascript
  if (!res.ok) {
    throw new Error('Failed to retrieve atmospheric forecast data from the meteorological service.');
  }
  ```
- If the Geocoding API returns an empty `results` array, an explicit error is thrown:
  ```javascript
  if (!data.results || !data.results.length) {
    throw new Error('City or district not found. Please check the spelling and try again.');
  }
  ```
- Any thrown error is captured and its `.message` is rendered into the red error banner.

### 4. Tier 4: UI Cleanup, State Isolation & The `finally` Guarantee
- While a request is in-flight:
  - Search input is disabled (`cityInput.disabled = true`).
  - Search button is disabled (`searchBtn.disabled = true`).
  - District dropdown is disabled (`districtSelect.disabled = true`).
  - Existing stale weather content is dimmed with a CSS class (`is-loading`).
  - Loading banner displays `"Fetching live weather for [City]..."` alongside an animated SVG spinner.
- If an error occurs, stale weather cards are hidden (`weatherContent.classList.add('hidden')`) to prevent the user from viewing out-of-date or inaccurate forecasts.
- The `finally` block **guarantees** UI re-activation regardless of success or failure:
  ```javascript
  finally {
    cityInput.disabled = false;
    searchBtn.disabled = false;
    if (districtSelect) districtSelect.disabled = false;
    weatherContent.classList.remove('is-loading');
  }
  ```

### 5. Tier 5: Resilient Storage Handling
- Access to `window.localStorage` can throw exceptions in certain environments (such as incognito browsing modes with strict storage partitioning or security restrictions).
- Storage operations are wrapped in private `try...catch` blocks so that storage denials do not disrupt the live weather display.

---

## 5. UI States Specification Summary

| UI State | Trigger / Condition | UI Behavior |
| :--- | :--- | :--- |
| **Empty Input** | Empty form submission or whitespace | Shows amber banner: `"Please enter a city or district name."`. Zero network requests fired. |
| **Loading** | Search or district selected; API in-flight | Shows sky-blue banner: `"Fetching live weather for [City]..."` with animated spinner. All controls disabled; existing results dimmed. |
| **Error** | Network drop, offline, or invalid query | Shows coral banner with specific message (`"City or district not found..."` or `"Network problem..."`). Weather container hidden. Controls re-enabled. |
| **Success** | Valid response from both APIs | Status banner hidden. Current Weather Card and 5-Day Forecast Grid populated with safe text and vector icons. City saved to `localStorage`. |

---

## 6. Local Setup & Quick Start

Because this application uses standard Vanilla web technologies, no build step or node package manager is required:

1. **Navigate to the Directory**:
   ```bash
   cd "C:\Users\aditya rahate\.gemini\antigravity\scratch\live-weather-dashboard"
   ```

2. **Open directly in a browser**:
   - Double-click `index.html` to launch it in any modern browser (Chrome, Edge, Firefox, Safari).
   - Alternatively, serve it via any static local HTTP server:
     ```bash
     python -m http.server 8000
     ```

3. **Verify Maharashtra Weather Features**:
   - Note the default initial load for **Pune**.
   - Use the **Maharashtra District dropdown** to select any of the 36 districts (e.g. `Nagpur`, `Kolhapur`, `Ratnagiri`, `Chhatrapati Sambhajinagar`).
   - Click the quick-selection pills for top Maharashtra hubs.
   - Search for global locations (e.g. `London`, `Tokyo`, `Dubai`).
   - Test empty queries and misspelled names (`zzzz123`) to observe the alert banner.
