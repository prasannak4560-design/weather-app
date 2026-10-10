# 🌤️ WeatherSphere — Modern Atmospheric Dashboard

WeatherSphere is an interactive, responsive weather dashboard built with clean HTML5, CSS3, and modern ES6 JavaScript. It fetches real-time meteorological conditions and forecasts using legitimate, documented weather APIs without hardcoded fake data.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vanilla JS](https://img.shields.io/badge/built%20with-Vanilla%20JS%20%7C%20CSS3-orange.svg)
![Live APIs](https://img.shields.io/badge/APIs-Open--Meteo%20%7C%20OpenWeatherMap-green.svg)

---

## ✨ Features

- **Legitimate Live Weather Data**:
  - **Open-Meteo API** (Default): WMO certified, no API key required for non-commercial use, 100% real live global observations.
  - **OpenWeatherMap Integration**: Switchable via the API Configuration modal with custom API key testing and validation.
- **City Search & Autocomplete**:
  - Debounced real-time geocoding search for global cities and regions.
  - Keyboard navigation (Arrow keys + Enter).
  - Quick City chips for popular locations (London, Tokyo, New York, Paris, Sydney).
- **HTML5 Geolocation**: "Locate Me" button to retrieve immediate weather for current device coordinates.
- **Comprehensive Weather Metrics**:
  - Current Temperature with High / Low daily range and "Feels Like" index.
  - Dynamic Animated Weather SVG Icons (Clear Day, Moon Night, Clouds, Rain, Thunderstorm, Snow, Fog, etc.).
  - Atmospheric Humidity (%) with comfort scale.
  - Wind Speed (km/h or mph) with dynamic 360° compass needle orientation.
  - Barometric Surface Pressure (hPa).
  - UV Index with color-coded severity scale.
- **24-Hour Hourly Forecast**: Smooth horizontal scroll timeline displaying temperature trends and weather icons for the upcoming 24 hours.
- **7-Day Daily Forecast**: Extended weekly forecast displaying condition labels, precipitation probability (💧%), and temperature gradient bars.
- **Unit Switching**: One-click toggle between Metric (`°C`, `km/h`) and Imperial (`°F`, `mph`).
- **Dynamic Atmospheric Backgrounds**: Background gradients automatically adapt to weather conditions and day/night cycles (Sunny, Night Sky, Overcast, Rain, Snow, Thunderstorm, Fog).
- **Resilient Error & Loading States**:
  - Skeleton shimmer animations during API fetch.
  - Clear user alerts for 404 (City Not Found), offline/network timeouts, and geolocation errors with a built-in Retry action.
- **Production API Security Guide**: Included `API_SECURITY_GUIDE.md` detailing backend proxy patterns, serverless functions, and `.env` secrets management.

---

## 📂 Project Structure

```
weather-app/
├── index.html               # Semantic HTML5 markup, ARIA roles, SEO metadata
├── css/
│   └── style.css            # Glassmorphism design system, atmospheric themes, responsive queries
├── js/
│   ├── app.js               # Application orchestration, search, events, UI renderers
│   ├── api.js               # Open-Meteo & OpenWeatherMap API drivers, timeout & error handlers
│   ├── weatherCodes.js      # WMO weather code mapping & SVG icons catalog
│   └── config.js            # User preferences, LocalStorage persistence, defaults
├── API_SECURITY_GUIDE.md    # Production security architectures (Express, Next.js, Cloudflare)
└── README.md                # Project documentation and instructions
```

---

## 🚀 Getting Started

### Prerequisites
Any modern browser (Chrome, Edge, Firefox, Safari) and a simple local HTTP server (Python, Node, or VS Code Live Server).

### Running Locally

Using **Python**:
```bash
# Navigate to the weather-app directory
cd C:\Users\ADMIN\.gemini\antigravity-ide\scratch\weather-app

# Start the server
python -m http.server 3000
```

Using **Node.js**:
```bash
npx serve . -p 3000
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🔒 API Configuration & Security

- **Out of the box**: The app uses Open-Meteo, which requires **no registration or API key**.
- **Using OpenWeatherMap**:
  1. Click the **Gear / Settings** icon in the top header.
  2. Select **OpenWeatherMap**.
  3. Enter your API key and click **Test API Key** to verify connectivity.
  4. Click **Save Settings**.
- **Production deployments**: Refer to [`API_SECURITY_GUIDE.md`](./API_SECURITY_GUIDE.md) to implement a backend proxy server so that your API keys are never exposed in browser DevTools.
