/**
 * Weather Codes and Icon Definitions
 * Supports WMO Weather Interpretation Codes (Open-Meteo) and OpenWeatherMap condition mapping.
 */

export const WMO_WEATHER_MAP = {
  0: {
    description: 'Clear sky',
    category: 'clear',
    dayIcon: 'sun',
    nightIcon: 'moon',
    bgTheme: 'theme-clear'
  },
  1: {
    description: 'Mainly clear',
    category: 'clear',
    dayIcon: 'sun-cloud',
    nightIcon: 'moon-cloud',
    bgTheme: 'theme-clear'
  },
  2: {
    description: 'Partly cloudy',
    category: 'cloudy',
    dayIcon: 'partly-cloudy-day',
    nightIcon: 'partly-cloudy-night',
    bgTheme: 'theme-cloudy'
  },
  3: {
    description: 'Overcast',
    category: 'overcast',
    dayIcon: 'cloud',
    nightIcon: 'cloud',
    bgTheme: 'theme-overcast'
  },
  45: {
    description: 'Foggy',
    category: 'fog',
    dayIcon: 'fog',
    nightIcon: 'fog',
    bgTheme: 'theme-fog'
  },
  48: {
    description: 'Depositing rime fog',
    category: 'fog',
    dayIcon: 'fog',
    nightIcon: 'fog',
    bgTheme: 'theme-fog'
  },
  51: {
    description: 'Light drizzle',
    category: 'drizzle',
    dayIcon: 'drizzle',
    nightIcon: 'drizzle',
    bgTheme: 'theme-rain'
  },
  53: {
    description: 'Moderate drizzle',
    category: 'drizzle',
    dayIcon: 'drizzle',
    nightIcon: 'drizzle',
    bgTheme: 'theme-rain'
  },
  55: {
    description: 'Dense drizzle',
    category: 'drizzle',
    dayIcon: 'drizzle',
    nightIcon: 'drizzle',
    bgTheme: 'theme-rain'
  },
  56: {
    description: 'Freezing drizzle',
    category: 'freezing-rain',
    dayIcon: 'sleet',
    nightIcon: 'sleet',
    bgTheme: 'theme-snow'
  },
  57: {
    description: 'Dense freezing drizzle',
    category: 'freezing-rain',
    dayIcon: 'sleet',
    nightIcon: 'sleet',
    bgTheme: 'theme-snow'
  },
  61: {
    description: 'Slight rain',
    category: 'rain',
    dayIcon: 'rain-light',
    nightIcon: 'rain-light',
    bgTheme: 'theme-rain'
  },
  63: {
    description: 'Moderate rain',
    category: 'rain',
    dayIcon: 'rain',
    nightIcon: 'rain',
    bgTheme: 'theme-rain'
  },
  65: {
    description: 'Heavy rain',
    category: 'heavy-rain',
    dayIcon: 'heavy-rain',
    nightIcon: 'heavy-rain',
    bgTheme: 'theme-rain'
  },
  66: {
    description: 'Light freezing rain',
    category: 'freezing-rain',
    dayIcon: 'sleet',
    nightIcon: 'sleet',
    bgTheme: 'theme-snow'
  },
  67: {
    description: 'Heavy freezing rain',
    category: 'freezing-rain',
    dayIcon: 'sleet',
    nightIcon: 'sleet',
    bgTheme: 'theme-snow'
  },
  71: {
    description: 'Slight snow fall',
    category: 'snow',
    dayIcon: 'snow-light',
    nightIcon: 'snow-light',
    bgTheme: 'theme-snow'
  },
  73: {
    description: 'Moderate snow fall',
    category: 'snow',
    dayIcon: 'snow',
    nightIcon: 'snow',
    bgTheme: 'theme-snow'
  },
  75: {
    description: 'Heavy snow fall',
    category: 'snow',
    dayIcon: 'snow-heavy',
    nightIcon: 'snow-heavy',
    bgTheme: 'theme-snow'
  },
  77: {
    description: 'Snow grains',
    category: 'snow',
    dayIcon: 'snow',
    nightIcon: 'snow',
    bgTheme: 'theme-snow'
  },
  80: {
    description: 'Slight rain showers',
    category: 'showers',
    dayIcon: 'rain-light',
    nightIcon: 'rain-light',
    bgTheme: 'theme-rain'
  },
  81: {
    description: 'Moderate rain showers',
    category: 'showers',
    dayIcon: 'rain',
    nightIcon: 'rain',
    bgTheme: 'theme-rain'
  },
  82: {
    description: 'Violent rain showers',
    category: 'heavy-rain',
    dayIcon: 'heavy-rain',
    nightIcon: 'heavy-rain',
    bgTheme: 'theme-rain'
  },
  85: {
    description: 'Slight snow showers',
    category: 'snow',
    dayIcon: 'snow-light',
    nightIcon: 'snow-light',
    bgTheme: 'theme-snow'
  },
  86: {
    description: 'Heavy snow showers',
    category: 'snow',
    dayIcon: 'snow-heavy',
    nightIcon: 'snow-heavy',
    bgTheme: 'theme-snow'
  },
  95: {
    description: 'Thunderstorm',
    category: 'thunderstorm',
    dayIcon: 'thunderstorm',
    nightIcon: 'thunderstorm',
    bgTheme: 'theme-thunderstorm'
  },
  96: {
    description: 'Thunderstorm with slight hail',
    category: 'thunderstorm-hail',
    dayIcon: 'thunderstorm-hail',
    nightIcon: 'thunderstorm-hail',
    bgTheme: 'theme-thunderstorm'
  },
  99: {
    description: 'Thunderstorm with heavy hail',
    category: 'thunderstorm-hail',
    dayIcon: 'thunderstorm-hail',
    nightIcon: 'thunderstorm-hail',
    bgTheme: 'theme-thunderstorm'
  }
};

/**
 * Returns weather info for WMO code.
 */
export function getWeatherDetails(code, isDay = 1) {
  const match = WMO_WEATHER_MAP[code] || {
    description: 'Variable conditions',
    category: 'cloudy',
    dayIcon: 'cloud',
    nightIcon: 'cloud',
    bgTheme: 'theme-cloudy'
  };

  const iconName = isDay ? match.dayIcon : match.nightIcon;
  let bgTheme = match.bgTheme;
  if (!isDay && (bgTheme === 'theme-clear' || bgTheme === 'theme-cloudy')) {
    bgTheme = 'theme-night';
  }

  return {
    description: match.description,
    category: match.category,
    iconName,
    bgTheme
  };
}

/**
 * SVG Icons catalog for crisp, scalable weather representation.
 */
export const WEATHER_ICONS = {
  'sun': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFF066"/>
          <stop offset="70%" stop-color="#FFB300"/>
          <stop offset="100%" stop-color="#FF8F00"/>
        </radialGradient>
        <filter id="sunGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <!-- Sun rays -->
      <g stroke="#FFA000" stroke-width="3" stroke-linecap="round" class="animate-spin-slow origin-center">
        <line x1="32" y1="6" x2="32" y2="13" />
        <line x1="32" y1="51" x2="32" y2="58" />
        <line x1="6" y1="32" x2="13" y2="32" />
        <line x1="51" y1="32" x2="58" y2="32" />
        <line x1="13.6" y1="13.6" x2="18.5" y2="18.5" />
        <line x1="45.5" y1="45.5" x2="50.4" y2="50.4" />
        <line x1="13.6" y1="50.4" x2="18.5" y2="45.5" />
        <line x1="45.5" y1="18.5" x2="50.4" y2="13.6" />
      </g>
      <circle cx="32" cy="32" r="14" fill="url(#sunGrad)" filter="url(#sunGlow)"/>
    </svg>
  `,
  'moon': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <radialGradient id="moonGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="60%" stop-color="#D8E2FD"/>
          <stop offset="100%" stop-color="#8DA4D0"/>
        </radialGradient>
      </defs>
      <path d="M40 12 C40 28 28 40 12 40 C14 47 21 52 30 52 C42.15 52 52 42.15 52 30 C52 21 47 14 40 12 Z" fill="url(#moonGrad)" filter="drop-shadow(0 0 6px rgba(160,190,255,0.6))"/>
      <circle cx="20" cy="18" r="1.5" fill="#FFFFFF" opacity="0.8"/>
      <circle cx="48" cy="18" r="1" fill="#FFFFFF" opacity="0.6"/>
      <circle cx="16" cy="30" r="1" fill="#FFFFFF" opacity="0.5"/>
    </svg>
  `,
  'sun-cloud': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <radialGradient id="sunPartGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFF59D"/>
          <stop offset="100%" stop-color="#FFA000"/>
        </radialGradient>
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#CBD5E1"/>
        </linearGradient>
      </defs>
      <circle cx="25" cy="24" r="11" fill="url(#sunPartGrad)"/>
      <path d="M46 48 H22 C16.48 48 12 43.52 12 38 C12 32.74 16.07 28.42 21.24 28.04 C23.08 21.36 29.21 16.5 36.4 16.5 C45.38 16.5 52.65 23.77 52.65 32.75 C52.65 33.34 52.6 33.92 52.53 34.5 C55.67 36.21 57.75 39.58 57.75 43.43 C57.75 48.72 53.47 48 46 48 Z" fill="url(#cloudGrad)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"/>
    </svg>
  `,
  'partly-cloudy-day': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <radialGradient id="sunPartGrad2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFF59D"/>
          <stop offset="100%" stop-color="#FFA000"/>
        </radialGradient>
        <linearGradient id="cloudGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#94A3B8"/>
        </linearGradient>
      </defs>
      <circle cx="24" cy="22" r="10" fill="url(#sunPartGrad2)"/>
      <path d="M46 50 H20 C15.03 50 11 45.97 11 41 C11 36.3 14.62 32.45 19.25 32.05 C20.9 26.07 26.38 21.7 32.8 21.7 C40.83 21.7 47.33 28.2 47.33 36.23 C47.33 36.76 47.28 37.28 47.22 37.8 C50.02 39.33 51.88 42.36 51.88 45.8 C51.88 50.53 48.05 50 46 50 Z" fill="url(#cloudGrad2)" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.18))"/>
    </svg>
  `,
  'partly-cloudy-night': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <radialGradient id="moonPartGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#E2E8F0"/>
          <stop offset="100%" stop-color="#94A3B8"/>
        </radialGradient>
        <linearGradient id="cloudGradNight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#E2E8F0"/>
          <stop offset="100%" stop-color="#64748B"/>
        </linearGradient>
      </defs>
      <path d="M30 14 C30 23 23 30 14 30 C15 34 19 37 24 37 C31 37 36 32 36 25 C36 19 33 15 30 14 Z" fill="url(#moonPartGrad)"/>
      <path d="M46 50 H20 C15.03 50 11 45.97 11 41 C11 36.3 14.62 32.45 19.25 32.05 C20.9 26.07 26.38 21.7 32.8 21.7 C40.83 21.7 47.33 28.2 47.33 36.23 C47.33 36.76 47.28 37.28 47.22 37.8 C50.02 39.33 51.88 42.36 51.88 45.8 C51.88 50.53 48.05 50 46 50 Z" fill="url(#cloudGradNight)" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.25))"/>
    </svg>
  `,
  'cloud': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <linearGradient id="fullCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#F1F5F9"/>
          <stop offset="100%" stop-color="#94A3B8"/>
        </linearGradient>
      </defs>
      <path d="M48 48 H18 C12.48 48 8 43.52 8 38 C8 32.79 12.01 28.52 17.15 28.05 C18.98 21.4 25.1 16.5 32.3 16.5 C41.25 16.5 48.5 23.75 48.5 32.7 C48.5 33.3 48.45 33.88 48.38 34.45 C51.5 36.17 53.6 39.53 53.6 43.4 C53.6 48.7 49.3 48 48 48 Z" fill="url(#fullCloudGrad)" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))"/>
    </svg>
  `,
  'fog': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <linearGradient id="fogCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#E2E8F0"/>
          <stop offset="100%" stop-color="#94A3B8"/>
        </linearGradient>
      </defs>
      <path d="M44 34 H20 C16 34 13 31 13 27 C13 23.2 16 20.1 19.8 19.7 C21.1 14.8 25.6 11.2 30.9 11.2 C37.5 11.2 42.8 16.5 42.8 23.1 C45.1 24.3 46.7 26.8 46.7 29.7 C46.7 33.6 43.6 34 44 34 Z" fill="url(#fogCloud)" opacity="0.8"/>
      <line x1="12" y1="42" x2="52" y2="42" stroke="#CBD5E1" stroke-width="4" stroke-linecap="round"/>
      <line x1="16" y1="49" x2="48" y2="49" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>
      <line x1="20" y1="56" x2="44" y2="56" stroke="#64748B" stroke-width="3.5" stroke-linecap="round"/>
    </svg>
  `,
  'drizzle': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <linearGradient id="drizzleCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#E2E8F0"/>
          <stop offset="100%" stop-color="#94A3B8"/>
        </linearGradient>
      </defs>
      <path d="M48 38 H18 C12.5 38 8 33.5 8 28 C8 22.8 12 18.5 17.1 18 C19 11.4 25.1 6.5 32.3 6.5 C41.2 6.5 48.5 13.8 48.5 22.7 C51.5 24.5 53.6 27.8 53.6 31.7 C53.6 37 49.3 38 48 38 Z" fill="url(#drizzleCloud)"/>
      <g stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round">
        <line x1="22" y1="44" x2="20" y2="50" />
        <line x1="32" y1="44" x2="30" y2="50" />
        <line x1="42" y1="44" x2="40" y2="50" />
        <line x1="27" y1="53" x2="25" y2="59" />
        <line x1="37" y1="53" x2="35" y2="59" />
      </g>
    </svg>
  `,
  'rain-light': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <linearGradient id="rainLightCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#F1F5F9"/>
          <stop offset="100%" stop-color="#64748B"/>
        </linearGradient>
      </defs>
      <path d="M48 38 H18 C12.5 38 8 33.5 8 28 C8 22.8 12 18.5 17.1 18 C19 11.4 25.1 6.5 32.3 6.5 C41.2 6.5 48.5 13.8 48.5 22.7 C51.5 24.5 53.6 27.8 53.6 31.7 C53.6 37 49.3 38 48 38 Z" fill="url(#rainLightCloud)"/>
      <g stroke="#0284C7" stroke-width="3" stroke-linecap="round">
        <line x1="22" y1="45" x2="18" y2="55" />
        <line x1="34" y1="45" x2="30" y2="55" />
        <line x1="46" y1="45" x2="42" y2="55" />
      </g>
    </svg>
  `,
  'rain': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <linearGradient id="rainCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#CBD5E1"/>
          <stop offset="100%" stop-color="#475569"/>
        </linearGradient>
      </defs>
      <path d="M48 36 H18 C12.5 36 8 31.5 8 26 C8 20.8 12 16.5 17.1 16 C19 9.4 25.1 4.5 32.3 4.5 C41.2 4.5 48.5 11.8 48.5 20.7 C51.5 22.5 53.6 25.8 53.6 29.7 C53.6 35 49.3 36 48 36 Z" fill="url(#rainCloud)"/>
      <g stroke="#38BDF8" stroke-width="3.2" stroke-linecap="round">
        <line x1="20" y1="43" x2="16" y2="53" />
        <line x1="32" y1="43" x2="28" y2="53" />
        <line x1="44" y1="43" x2="40" y2="53" />
        <line x1="26" y1="52" x2="22" y2="62" />
        <line x1="38" y1="52" x2="34" y2="62" />
      </g>
    </svg>
  `,
  'heavy-rain': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <linearGradient id="heavyRainCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#94A3B8"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
      </defs>
      <path d="M48 34 H18 C12.5 34 8 29.5 8 24 C8 18.8 12 14.5 17.1 14 C19 7.4 25.1 2.5 32.3 2.5 C41.2 2.5 48.5 9.8 48.5 18.7 C51.5 20.5 53.6 23.8 53.6 27.7 C53.6 33 49.3 34 48 34 Z" fill="url(#heavyRainCloud)"/>
      <g stroke="#0284C7" stroke-width="3.5" stroke-linecap="round">
        <line x1="18" y1="41" x2="13" y2="53" />
        <line x1="28" y1="41" x2="23" y2="53" />
        <line x1="38" y1="41" x2="33" y2="53" />
        <line x1="48" y1="41" x2="43" y2="53" />
        <line x1="23" y1="52" x2="18" y2="64" />
        <line x1="33" y1="52" x2="28" y2="64" />
        <line x1="43" y1="52" x2="38" y2="64" />
      </g>
    </svg>
  `,
  'sleet': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <linearGradient id="sleetCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#CBD5E1"/>
          <stop offset="100%" stop-color="#64748B"/>
        </linearGradient>
      </defs>
      <path d="M48 36 H18 C12.5 36 8 31.5 8 26 C8 20.8 12 16.5 17.1 16 C19 9.4 25.1 4.5 32.3 4.5 C41.2 4.5 48.5 11.8 48.5 20.7 C51.5 22.5 53.6 25.8 53.6 29.7 C53.6 35 49.3 36 48 36 Z" fill="url(#sleetCloud)"/>
      <line x1="20" y1="44" x2="16" y2="54" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="48" r="2.5" fill="#E2E8F0"/>
      <line x1="44" y1="44" x2="40" y2="54" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
      <circle cx="24" cy="57" r="2.5" fill="#E2E8F0"/>
      <line x1="36" y1="52" x2="32" y2="62" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `,
  'snow-light': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <linearGradient id="snowLightCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#F8FAFC"/>
          <stop offset="100%" stop-color="#CBD5E1"/>
        </linearGradient>
      </defs>
      <path d="M48 36 H18 C12.5 36 8 31.5 8 26 C8 20.8 12 16.5 17.1 16 C19 9.4 25.1 4.5 32.3 4.5 C41.2 4.5 48.5 11.8 48.5 20.7 C51.5 22.5 53.6 25.8 53.6 29.7 C53.6 35 49.3 36 48 36 Z" fill="url(#snowLightCloud)"/>
      <g fill="#BAE6FD">
        <circle cx="22" cy="46" r="2.5" />
        <circle cx="34" cy="44" r="2.5" />
        <circle cx="46" cy="47" r="2.5" />
        <circle cx="28" cy="56" r="2.5" />
        <circle cx="40" cy="55" r="2.5" />
      </g>
    </svg>
  `,
  'snow': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <linearGradient id="snowCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#F1F5F9"/>
          <stop offset="100%" stop-color="#94A3B8"/>
        </linearGradient>
      </defs>
      <path d="M48 34 H18 C12.5 34 8 29.5 8 24 C8 18.8 12 14.5 17.1 14 C19 7.4 25.1 2.5 32.3 2.5 C41.2 2.5 48.5 9.8 48.5 18.7 C51.5 20.5 53.6 23.8 53.6 27.7 C53.6 33 49.3 34 48 34 Z" fill="url(#snowCloud)"/>
      <g stroke="#BAE6FD" stroke-width="2" stroke-linecap="round">
        <!-- Snowflake 1 -->
        <line x1="22" y1="41" x2="22" y2="49"/>
        <line x1="18" y1="45" x2="26" y2="45"/>
        <!-- Snowflake 2 -->
        <line x1="38" y1="41" x2="38" y2="49"/>
        <line x1="34" y1="45" x2="42" y2="45"/>
        <!-- Snowflake 3 -->
        <line x1="30" y1="52" x2="30" y2="60"/>
        <line x1="26" y1="56" x2="34" y2="56"/>
      </g>
    </svg>
  `,
  'snow-heavy': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <linearGradient id="snowHeavyCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#E2E8F0"/>
          <stop offset="100%" stop-color="#64748B"/>
        </linearGradient>
      </defs>
      <path d="M48 32 H18 C12.5 32 8 27.5 8 22 C8 16.8 12 12.5 17.1 12 C19 5.4 25.1 0.5 32.3 0.5 C41.2 0.5 48.5 7.8 48.5 16.7 C51.5 18.5 53.6 21.8 53.6 25.7 C53.6 31 49.3 32 48 32 Z" fill="url(#snowHeavyCloud)"/>
      <g stroke="#E0F2FE" stroke-width="2.2" stroke-linecap="round">
        <line x1="18" y1="39" x2="18" y2="47"/><line x1="14" y1="43" x2="22" y2="43"/>
        <line x1="32" y1="38" x2="32" y2="46"/><line x1="28" y1="42" x2="36" y2="42"/>
        <line x1="46" y1="39" x2="46" y2="47"/><line x1="42" y1="43" x2="50" y2="43"/>
        <line x1="25" y1="51" x2="25" y2="59"/><line x1="21" y1="55" x2="29" y2="55"/>
        <line x1="39" y1="51" x2="39" y2="59"/><line x1="35" y1="55" x2="43" y2="55"/>
      </g>
    </svg>
  `,
  'thunderstorm': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <linearGradient id="thunderCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#1E293B"/>
        </linearGradient>
      </defs>
      <path d="M48 34 H18 C12.5 34 8 29.5 8 24 C8 18.8 12 14.5 17.1 14 C19 7.4 25.1 2.5 32.3 2.5 C41.2 2.5 48.5 9.8 48.5 18.7 C51.5 20.5 53.6 23.8 53.6 27.7 C53.6 33 49.3 34 48 34 Z" fill="url(#thunderCloud)"/>
      <polygon points="32,36 24,48 31,48 27,62 39,46 32,46" fill="#FACC15" filter="drop-shadow(0 0 4px #F59E0B)"/>
    </svg>
  `,
  'thunderstorm-hail': `
    <svg viewBox="0 0 64 64" class="weather-svg" aria-hidden="true">
      <defs>
        <linearGradient id="hailCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#334155"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
      </defs>
      <path d="M48 32 H18 C12.5 32 8 27.5 8 22 C8 16.8 12 12.5 17.1 12 C19 5.4 25.1 0.5 32.3 0.5 C41.2 0.5 48.5 7.8 48.5 16.7 C51.5 18.5 53.6 21.8 53.6 25.7 C53.6 31 49.3 32 48 32 Z" fill="url(#hailCloud)"/>
      <polygon points="30,34 22,46 29,46 25,60 37,44 30,44" fill="#FACC15"/>
      <circle cx="44" cy="44" r="2.5" fill="#E2E8F0"/>
      <circle cx="38" cy="54" r="3" fill="#E2E8F0"/>
      <circle cx="16" cy="50" r="2.5" fill="#E2E8F0"/>
    </svg>
  `,
  'humidity': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="metric-icon">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
    </svg>
  `,
  'wind': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="metric-icon">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
    </svg>
  `,
  'pressure': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="metric-icon">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  `,
  'uv': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="metric-icon">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41"></path>
    </svg>
  `,
  'compass': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="metric-icon">
      <circle cx="12" cy="12" r="10"></circle>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
    </svg>
  `,
  'thermometer': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="metric-icon">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
    </svg>
  `,
  'search': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `,
  'locate': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  `,
  'key': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
    </svg>
  `
};

/**
 * Helper to fetch SVG by icon name
 */
export function getIconSvg(iconName) {
  return WEATHER_ICONS[iconName] || WEATHER_ICONS['cloud'];
}
