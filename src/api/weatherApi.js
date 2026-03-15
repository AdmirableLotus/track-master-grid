// Open-Meteo — free, no API key required
// https://open-meteo.com/

const WMO_TO_CONDITION = {
  0: 'dry', 1: 'dry', 2: 'dry', 3: 'dry',
  45: 'mixed', 48: 'mixed',
  51: 'mixed', 53: 'mixed', 55: 'wet',
  61: 'mixed', 63: 'wet', 65: 'wet',
  71: 'mixed', 73: 'wet', 75: 'wet',
  80: 'mixed', 81: 'wet', 82: 'wet',
  95: 'wet', 96: 'wet', 99: 'wet',
};

const WMO_LABEL = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Light showers', 81: 'Showers', 82: 'Heavy showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ hail', 99: 'Heavy thunderstorm',
};

export async function fetchRaceWeather(lat, lon, date) {
  // Fetch hourly forecast for the race date (14:00 local = typical race time)
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=auto&start_date=${date}&end_date=${date}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  const json = await res.json();

  const d = json.daily;
  const wmo = d.weathercode[0];

  return {
    condition: WMO_TO_CONDITION[wmo] ?? 'dry',
    label: WMO_LABEL[wmo] ?? 'Unknown',
    tempMax: Math.round(d.temperature_2m_max[0]),
    tempMin: Math.round(d.temperature_2m_min[0]),
    rainChance: d.precipitation_probability_max[0],
    windSpeed: Math.round(d.windspeed_10m_max[0]),
    wmo,
  };
}
