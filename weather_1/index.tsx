import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { WeatherData } from './types';
import {
  kelvinToCelsius,
  celsiusToFahrenheit,
  mpsToKmph,
  formatTemp,
  formatTime,
  formatDateTimeToYYYYMMDDHHMM,
  calculateDuration
} from './utils';
import { IconSearch, IconLocationPin } from './components/Icons';
import {
  WeatherInfoSection,
  WeatherDetailsSection,
  HourlyForecastSection
} from './components/WeatherComponents';

// !!! IMPORTANT SECURITY WARNING !!!
// Embedding API keys directly in client-side code is a major security risk.
// This key will be visible to anyone inspecting your site's code.
// For production, use environment variables and a backend proxy.
const OPENWEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY;

const App: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = useCallback(async (query: { lat?: number; lon?: number; city?: string }) => {
    setLoading(true);
    setError(null);

    let weatherUrl: string;
    let forecastUrl: string;

    if (query.lat !== undefined && query.lon !== undefined) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&appid=${OPENWEATHER_API_KEY}`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${query.lat}&lon=${query.lon}&appid=${OPENWEATHER_API_KEY}`;
    } else if (query.city) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${query.city}&appid=${OPENWEATHER_API_KEY}`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${query.city}&appid=${OPENWEATHER_API_KEY}`;
    } else {
      setError("Invalid query for weather data.");
      setLoading(false);
      return;
    }

    try {
      // Use AbortController for fetch requests to handle timeouts and cancellations
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl, { signal: controller.signal }),
        fetch(forecastUrl, { signal: controller.signal })
      ]);

      clearTimeout(timeoutId);

      if (!weatherResponse.ok) {
        const errorData = await weatherResponse.json();
        throw new Error(errorData.message || `Error fetching current weather: ${weatherResponse.status}`);
      }
      if (!forecastResponse.ok) {
        const errorData = await forecastResponse.json();
        throw new Error(errorData.message || `Error fetching forecast: ${forecastResponse.status}`);
      }

      const current = await weatherResponse.json();
      const forecast = await forecastResponse.json();

      const timezoneOffset = current.timezone; // Shift in seconds from UTC

      const transformedData: WeatherData = {
        city: current.name,
        country: current.sys.country,
        datetime: formatDateTimeToYYYYMMDDHHMM(current.dt, timezoneOffset),
        currentTempC: kelvinToCelsius(current.main.temp),
        currentTempF: celsiusToFahrenheit(kelvinToCelsius(current.main.temp)),
        feelsLikeC: kelvinToCelsius(current.main.feels_like),
        feelsLikeF: celsiusToFahrenheit(kelvinToCelsius(current.main.feels_like)),
        weatherMain: current.weather[0].main,
        weatherDescription: current.weather[0].description,
        weatherIconUrl: `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`,
        sunrise: formatTime(current.sys.sunrise, timezoneOffset),
        sunset: formatTime(current.sys.sunset, timezoneOffset),
        dayDuration: calculateDuration(current.sys.sunrise, current.sys.sunset),
        humidity: current.main.humidity,
        airPressure: current.main.pressure,
        visibility: current.visibility / 1000, // convert meters to km
        windSpeed: formatTemp(mpsToKmph(current.wind.speed)).toString(),
        hourly: forecast.list.slice(0, 9).map((item: any) => ({
          time: formatTime(item.dt, timezoneOffset),
          tempC: kelvinToCelsius(item.main.temp),
          tempF: celsiusToFahrenheit(kelvinToCelsius(item.main.temp)),
          feelsLikeC: kelvinToCelsius(item.main.feels_like),
          feelsLikeF: celsiusToFahrenheit(kelvinToCelsius(item.main.feels_like)),
          iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
        })),
      };

      setWeatherData(transformedData);

      // Cache the result for this location
      if (query.city) {
        localStorage.setItem(`weather_${query.city.toLowerCase()}`, JSON.stringify({
          data: transformedData,
          timestamp: Date.now()
        }));
      } else if (query.lat && query.lon) {
        localStorage.setItem(`weather_${query.lat}_${query.lon}`, JSON.stringify({
          data: transformedData,
          timestamp: Date.now()
        }));
      }

    } catch (err: any) {
      console.error("Weather API error:", err);
      setError(err.message || "Failed to fetch weather data. Please try again.");
      setWeatherData(null); // Clear previous data on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Try to load from cache first, then fetch fresh data
  const fetchWithCaching = useCallback(async (query: { lat?: number; lon?: number; city?: string }) => {
    const cacheKey = query.city
      ? `weather_${query.city.toLowerCase()}`
      : query.lat && query.lon
        ? `weather_${query.lat}_${query.lon}`
        : null;

    if (cacheKey) {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          const cacheAge = Date.now() - timestamp;

          // Use cache if less than 30 minutes old
          if (cacheAge < 30 * 60 * 1000) {
            setWeatherData(data);
            setLoading(false);

            // Fetch fresh data in background after using cache
            setTimeout(() => fetchWeatherData(query), 100);
            return;
          }
        } catch (e) {
          console.warn("Error parsing cached weather data:", e);
        }
      }
    }

    // No valid cache, fetch fresh data
    fetchWeatherData(query);
  }, [fetchWeatherData]);

  useEffect(() => {
    // Check if browser supports geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWithCaching({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (geoError) => {
          console.warn("Geolocation denied or unavailable:", geoError.message);
          // Fallback to a default city if geolocation fails or is denied by the user
          fetchWithCaching({ city: "London" });
        },
        { timeout: 5000, maximumAge: 60000 } // 5s timeout, 1min cache
      );
    } else {
      console.warn("Geolocation is not supported by this browser");
      fetchWithCaching({ city: "London" });
    }
  }, [fetchWithCaching]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      fetchWithCaching({ city: searchTerm.trim() });
    }
  };

  // Use useMemo to avoid recalculating these values on every render
  const currentTemp = useMemo(() =>
    weatherData && (unit === 'C' ? weatherData.currentTempC : weatherData.currentTempF),
    [weatherData, unit]
  );

  const currentFeelsLike = useMemo(() =>
    weatherData && (unit === 'C' ? weatherData.feelsLikeC : weatherData.feelsLikeF),
    [weatherData, unit]
  );

  if (loading) {
    return <div className="loading-message card">Loading weather data...</div>;
  }

  return (
    <div className="app-container">
      <div className="search-bar-container card">
        <div className="search-input-wrapper">
          <IconLocationPin />
          <input
            type="text"
            className="search-input"
            placeholder="Search by city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            aria-label="Search by city"
          />
        </div>
        <button
          className="search-button"
          onClick={handleSearch}
          aria-label="Search"
          disabled={!searchTerm.trim()}
        >
          <IconSearch />
        </button>
      </div>

      {error && <div className="error-message card">{error}</div>}

      {weatherData && (
        <>
          <WeatherInfoSection
            weatherData={weatherData}
            currentTemp={currentTemp!}
            currentFeelsLike={currentFeelsLike!}
            unit={unit}
            setUnit={setUnit}
          />
          <WeatherDetailsSection weatherData={weatherData} />
          <HourlyForecastSection weatherData={weatherData} unit={unit} />
        </>
      )}
    </div>
  );
};

// Use createRoot API for React 18
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

export default App;