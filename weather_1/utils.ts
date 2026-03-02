export const kelvinToCelsius = (k: number) => k - 273.15;
export const celsiusToFahrenheit = (c: number) => (c * 9 / 5) + 32;
export const mpsToKmph = (mps: number) => mps * 3.6;

export const formatTemp = (temp: number) => Math.round(temp * 10) / 10;

// Helper to format UNIX timestamp to HH:MM AM/PM string, considering timezone offset
export const formatTime = (unixTimestamp: number, timezoneOffsetSeconds: number) => {
    const date = new Date((unixTimestamp + timezoneOffsetSeconds) * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

// Helper to format UNIX timestamp to YYYY-MM-DD HH:MM string, considering timezone offset
export const formatDateTimeToYYYYMMDDHHMM = (unixTimestamp: number, timezoneOffsetSeconds: number) => {
    const date = new Date((unixTimestamp + timezoneOffsetSeconds) * 1000);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const calculateDuration = (startSeconds: number, endSeconds: number) => {
    let diffSeconds = Math.abs(endSeconds - startSeconds);
    const hours = Math.floor(diffSeconds / 3600);
    diffSeconds %= 3600;
    const minutes = Math.floor(diffSeconds / 60);
    return `${hours} hr and ${minutes} min`;
};