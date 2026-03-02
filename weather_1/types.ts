export interface HourlyForecastData {
    time: string;
    tempC: number;
    tempF: number;
    feelsLikeC: number;
    feelsLikeF: number;
    iconUrl: string;
}

export interface WeatherData {
    city: string;
    country: string;
    datetime: string;
    currentTempC: number;
    currentTempF: number;
    feelsLikeC: number;
    feelsLikeF: number;
    weatherMain: string;
    weatherDescription: string;
    weatherIconUrl: string;
    sunrise: string;
    sunset: string;
    dayDuration: string;
    humidity: number;
    airPressure: number;
    visibility: number;
    windSpeed: string;
    hourly: HourlyForecastData[];
}