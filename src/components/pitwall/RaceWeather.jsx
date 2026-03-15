import { useQuery } from '@tanstack/react-query';
import { fetchRaceWeather } from '@/api/weatherApi';
import { Thermometer, Wind, Droplets, CloudLightning } from 'lucide-react';

const CONDITION_STYLE = {
  dry:     { icon: '☀️', color: '#ffd700', bg: '#ffd70015', label: 'Dry' },
  mixed:   { icon: '🌦️', color: '#f97316', bg: '#f9731615', label: 'Mixed' },
  wet:     { icon: '🌧️', color: '#60a5fa', bg: '#60a5fa15', label: 'Wet' },
  unknown: { icon: '❓', color: '#9ca3af', bg: '#9ca3af15', label: 'Unknown' },
};

export default function RaceWeather({ race, onConditionResolved }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['weather', race.id],
    queryFn: () => fetchRaceWeather(race.lat, race.lon, race.date),
    enabled: !!race.lat && !!race.lon,
    staleTime: 1000 * 60 * 30, // cache 30 min
    onSuccess: (d) => onConditionResolved?.(d.condition),
  });

  if (!race.lat || !race.lon) return null;

  const style = CONDITION_STYLE[data?.condition ?? 'unknown'];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-3 mb-5 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#e10600] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-400">Fetching race day forecast…</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-3 mb-5">
        <span className="text-xs text-gray-500">⚠️ Weather forecast unavailable</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border mb-5 p-4" style={{ borderColor: style.color + '40', background: style.bg }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{style.icon}</span>
          <div>
            <p className="text-xs font-black tracking-widest uppercase" style={{ color: style.color }}>
              Race Day Forecast
            </p>
            <p className="text-white font-bold text-sm">{data.label}</p>
          </div>
        </div>
        <span className="text-xs font-black px-3 py-1 rounded-lg border" style={{ color: style.color, borderColor: style.color + '50', background: style.color + '15' }}>
          {style.label}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col items-center bg-black/20 rounded-lg py-2">
          <Thermometer className="w-3 h-3 mb-1" style={{ color: style.color }} />
          <span className="text-white font-black text-sm">{data.tempMax}°</span>
          <span className="text-[9px] text-gray-400">Max</span>
        </div>
        <div className="flex flex-col items-center bg-black/20 rounded-lg py-2">
          <Thermometer className="w-3 h-3 mb-1 text-blue-400" />
          <span className="text-white font-black text-sm">{data.tempMin}°</span>
          <span className="text-[9px] text-gray-400">Min</span>
        </div>
        <div className="flex flex-col items-center bg-black/20 rounded-lg py-2">
          <Droplets className="w-3 h-3 mb-1 text-blue-400" />
          <span className="text-white font-black text-sm">{data.rainChance}%</span>
          <span className="text-[9px] text-gray-400">Rain</span>
        </div>
        <div className="flex flex-col items-center bg-black/20 rounded-lg py-2">
          <Wind className="w-3 h-3 mb-1 text-gray-400" />
          <span className="text-white font-black text-sm">{data.windSpeed}</span>
          <span className="text-[9px] text-gray-400">km/h</span>
        </div>
      </div>

      {data.condition !== 'dry' && (
        <p className="text-xs mt-3 font-semibold" style={{ color: style.color }}>
          {data.condition === 'wet'
            ? '🌧️ Wet race likely — consider earlier pit windows and intermediate strategy.'
            : '🌦️ Rain possible — monitor conditions, have a wet weather plan ready.'}
        </p>
      )}
    </div>
  );
}
