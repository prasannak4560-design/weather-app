# 🛡️ Weather API Key Security Guide: Production Best Practices

When building client-side applications that communicate with third-party APIs (like OpenWeatherMap, WeatherAPI, AccuWeather), understanding how to handle and protect API credentials is critical.

---

## 1. Why Client-Side API Keys are Insecure

If you place an API key directly inside client-side JavaScript (`fetch('https://api.openweathermap.org/data/2.5/weather?appid=YOUR_SECRET_KEY')`), **anyone who visits your website can view and steal your key**:

- Anyone can inspect network traffic in the browser's DevTools (`Network` tab).
- Anyone can inspect JavaScript sources or run `console.log(apiKey)`.
- If your repository is public on GitHub or GitLab, bots scrape committed keys within seconds, which can exhaust your quota or incur billing charges.

---

## 2. Production Architecture: The Backend Proxy Pattern

In production architectures, **the frontend NEVER holds the secret API key**. Instead, the client talks to your own lightweight backend proxy or serverless function, which injects the key on the server side:

```
[ Browser / Frontend ] 
        │
        │ GET /api/weather?city=London  (No secret key exposed!)
        ▼
[ Backend Proxy / Serverless Function ]
        │  Reads process.env.WEATHER_API_KEY
        │  Adds rate limiting & caching
        ▼
[ Third-Party Weather API (e.g., OpenWeatherMap) ]
```

---

## 3. Implementation Examples

### Option A: Node.js & Express Proxy

```javascript
// server.js
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Rate limiting: Prevent abuse and quota exhaustion
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);
app.use(express.static('public')); // Serve weather dashboard static files

// 2. Weather endpoint
app.get('/api/weather', async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ error: 'City query parameter is required.' });
  }

  const apiKey = process.env.WEATHER_API_KEY; // Securely loaded from .env
  const targetUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

  try {
    const apiRes = await fetch(targetUrl);
    const data = await apiRes.json();
    
    if (!apiRes.ok) {
      return res.status(apiRes.status).json(data);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to contact meteorological service.' });
  }
});

app.listen(PORT, () => console.log(`Secure Weather Proxy running on http://localhost:${PORT}`));
```

---

### Option B: Next.js / Vercel Serverless Function

If deploying to Vercel or Next.js, place this in `app/api/weather/route.js`:

```javascript
// app/api/weather/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city) {
    return Response.json({ error: 'Missing city parameter' }, { status: 400 });
  }

  const apiKey = process.env.WEATHER_API_KEY;
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`,
    { next: { revalidate: 600 } } // Cache response for 10 minutes to save quota!
  );

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
```

---

### Option C: Cloudflare Workers (Edge Computing)

Fast, globally distributed, and free tier includes 100,000 requests/day:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const city = url.searchParams.get('city') || 'London';

    // Access secret set in Cloudflare dashboard
    const apiKey = env.WEATHER_API_KEY; 
    
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`,
      { cf: { cacheTtl: 600, cacheEverything: true } }
    );

    const data = await weatherRes.text();
    return new Response(data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://yourweatherapp.com' // Restrict CORS
      }
    });
  }
};
```

---

## 4. Key Management & Repository Protection Checklist

| Rule | Action |
|------|--------|
| **Never commit `.env`** | Add `.env` and `.env.local` to `.gitignore`. |
| **Use `.env.example`** | Commit a template `.env.example` with blank values (e.g. `WEATHER_API_KEY=your_key_here`). |
| **API Key Restrictions** | In providers that support it (Google Cloud, AWS, Mapbox), configure **HTTP Referrer Restrictions** so the key can only be called from `https://yourdomain.com/*`. |
| **Cache Weather Responses** | Weather conditions don't change by the millisecond. Cache results for 10–15 minutes (in Redis, memory, or CDN cache) to reduce API bills by over 90%. |
| **Secret Scanning** | Enable GitHub Secret Scanning and Push Protection to prevent accidental secret leakage. |
| **Key Rotation** | Regularly cycle API keys every 90 days. |

---

## 5. Why Open-Meteo is Ideal for Client-Side Projects

This application uses **Open-Meteo** as its primary default engine. Open-Meteo provides:
- Open meteorological datasets provided by national meteorological agencies (NOAA, DWD, ECMWF).
- Free non-commercial access without requiring an API key.
- Zero risk of key theft or unexpected credit card charges.
- A built-in option in this app's **Settings Modal** to switch to OpenWeatherMap with custom keys whenever required.
