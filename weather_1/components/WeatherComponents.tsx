import React from 'react';
import { WeatherData } from '../types';
import { formatTemp } from '../utils';
import { IconSun, IconHumidity, IconAirPressure, IconVisibility, IconWindSpeed } from './Icons';

export const WeatherInfoSection: React.FC<{
    weatherData: WeatherData;
    currentTemp: number;
    currentFeelsLike: number;
    unit: 'C' | 'F';
    setUnit: React.Dispatch<React.SetStateAction<'C' | 'F'>>;
}> = ({ weatherData, currentTemp, currentFeelsLike, unit, setUnit }) => (
    <section className="weather-info-card card">
        <div className="location">{weatherData.city}, {weatherData.country}</div>
        <div className="datetime">{weatherData.datetime} (Local Time)</div>

        <div className="current-weather">
            <img
                src={weatherData.weatherIconUrl}
                alt={weatherData.weatherDescription}
                className="weather-icon-main"
                loading="lazy"
            />
            <div>
                <span className="temperature">{formatTemp(currentTemp)}</span>
                <span className="temp-unit-toggle">
                    <span
                        className={unit === 'C' ? 'active' : ''}
                        onClick={() => setUnit('C')}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && setUnit('C')}
                    >
                        °C
                    </span>
                    {' | '}
                    <span
                        className={unit === 'F' ? 'active' : ''}
                        onClick={() => setUnit('F')}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && setUnit('F')}
                    >
                        °F
                    </span>
                </span>
                <div className="weather-description">
                    {weatherData.weatherMain} - Feels like {formatTemp(currentFeelsLike)}°{unit}
                </div>
            </div>
        </div>

        <div className="sun-moon-cycle">
            <div className="cycle-header">
                <span><IconSun /> Sunrise</span>
                <span>{weatherData.sunrise}</span>
            </div>
            <div className="cycle-arc-container">
                <div className="cycle-arc sun-arc"></div>
            </div>
            <div className="cycle-duration">{weatherData.dayDuration}</div>
            <div className="cycle-header">
                <span></span> {/* Spacer for alignment */}
                <span>Sunset {weatherData.sunset}</span>
            </div>
        </div>
    </section>
);

export const WeatherDetailsSection: React.FC<{ weatherData: WeatherData }> = ({ weatherData }) => (
    <section className="weather-details-card card">
        <div className="detail-item">
            <IconHumidity />
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{weatherData.humidity}%</span>
        </div>
        <div className="detail-item">
            <IconAirPressure />
            <span className="detail-label">Air Pressure</span>
            <span className="detail-value">{weatherData.airPressure} hPa</span>
        </div>
        <div className="detail-item">
            <IconVisibility />
            <span className="detail-label">Visibility</span>
            <span className="detail-value">{weatherData.visibility.toFixed(1)} km</span>
        </div>
        <div className="detail-item">
            <IconWindSpeed />
            <span className="detail-label">Wind Speed</span>
            <span className="detail-value">{weatherData.windSpeed} km/h</span>
        </div>
    </section>
);

export const HourlyForecastSection: React.FC<{
    weatherData: WeatherData;
    unit: 'C' | 'F'
}> = ({ weatherData, unit }) => (
    <section className="hourly-forecast-container card">
        <h2 className="hourly-forecast-title">Hourly Forecast</h2>
        <div className="hourly-forecast-scroll" role="region" aria-label="Hourly weather forecast">
            {weatherData.hourly.map((item, index) => (
                <div key={index} className="hourly-item">
                    <div className="hourly-time">{item.time}</div>
                    <img
                        src={item.iconUrl}
                        alt="hourly weather icon"
                        className="hourly-weather-icon"
                        loading="lazy"
                    />
                    <div className="hourly-temp">
                        {formatTemp(unit === 'C' ? item.tempC : item.tempF)}°{unit}
                    </div>
                    <div className="hourly-feels-like">
                        FL {formatTemp(unit === 'C' ? item.feelsLikeC : item.feelsLikeF)}°{unit}
                    </div>
                </div>
            ))}
        </div>
    </section>
);