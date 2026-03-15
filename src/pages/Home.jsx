import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Clock, CloudSun, Layers, BarChart2, Map, Trophy, ChevronRight, Flag } from 'lucide-react';
import { formatDistanceToNow, parseISO, isPast } from 'date-fns';

const TIRE_COLORS = { soft: '#e10600', medium: '#ffd700', hard: '#e0e0e0' };

function Countdown({ dateStr }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const race = parseISO(dateStr);
  if (isPast(race)) return <span className="text-green-400 font-bold">Race Complete</span>;
  const diff = race - now;
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return (
    <div className="flex gap-3 mt-2">
      {[['Days', days], ['Hrs', hrs], ['Min', mins], ['Sec', secs]].map(([label, val]) => (
        <div key={label} className="flex flex-col items-center bg-[#1a1a1a] rounded-lg px-3 py-2 min-w-[54px]">
          <span className="text-2xl font-black text-[#e10600] tabular-nums">{String(val).padStart(2, '0')}</span>
          <span className="text-[9px] text-gray-400 font-semibold tracking-widest">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list('-date', 20),
  });

  const upcoming = races
    .filter(r => !isPast(parseISO(r.date)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextRace = upcoming[0];

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Greeting */}
      <div className="mb-5 mt-2">
        <p className="text-gray-400 text-sm">Welcome back,</p>
        <h1 className="text-2xl font-black text-white">{user?.full_name?.split(' ')[0] ?? 'Engineer'}</h1>
      </div>

      {/* Next Race Card */}
      {nextRace ? (
        <div className="bg-gradient-to-br from-[#1a0000] to-[#1a1a1a] border border-[#e10600]/40 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Flag className="w-4 h-4 text-[#e10600]" />
            <span className="text-[#e10600] text-xs font-bold tracking-widest uppercase">Next Race</span>
          </div>
          <h2 className="text-xl font-black text-white">{nextRace.name}</h2>
          <p className="text-gray-400 text-sm mb-3">{nextRace.circuit} · {nextRace.country} {nextRace.flag_emoji}</p>
          <Countdown dateStr={nextRace.date} />
          <div className="flex gap-2 mt-4 flex-wrap text-xs text-gray-400">
            <span className="bg-[#222] px-2 py-1 rounded">{nextRace.laps} laps</span>
            <span className="bg-[#222] px-2 py-1 rounded">{nextRace.lap_length_km} km/lap</span>
            {nextRace.drs_zones && <span className="bg-[#222] px-2 py-1 rounded">{nextRace.drs_zones} DRS zones</span>}
            {nextRace.weather_forecast && (
              <span className="bg-[#222] px-2 py-1 rounded capitalize flex items-center gap-1">
                <CloudSun className="w-3 h-3" />{nextRace.weather_forecast}
              </span>
            )}
          </div>
          {nextRace.available_compounds && (
            <div className="flex gap-2 mt-3">
              {nextRace.available_compounds.map(c => (
                <span key={c} className="flex items-center gap-1 text-xs font-bold"
                  style={{ color: TIRE_COLORS[c] }}>
                  <span className="w-3 h-3 rounded-full border-2" style={{ borderColor: TIRE_COLORS[c] }} />
                  {c.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-5 text-center text-gray-500">
          No upcoming races found. Add races to get started.
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Link to="/StrategyBuilder" className="bg-[#e10600] hover:bg-[#c10500] rounded-xl p-4 flex flex-col gap-2 transition-colors">
          <BarChart2 className="w-6 h-6 text-white" />
          <span className="font-black text-white text-sm">Build Strategy</span>
          <span className="text-red-200 text-xs">Plan your race approach</span>
        </Link>
        <Link to="/TrackInfo" className="bg-[#1a1a1a] border border-[#333] hover:border-[#e10600]/50 rounded-xl p-4 flex flex-col gap-2 transition-colors">
          <Map className="w-6 h-6 text-gray-300" />
          <span className="font-black text-white text-sm">Track Info</span>
          <span className="text-gray-500 text-xs">Explore circuits</span>
        </Link>
        <Link to="/Results" className="bg-[#1a1a1a] border border-[#333] hover:border-[#e10600]/50 rounded-xl p-4 flex flex-col gap-2 transition-colors">
          <Flag className="w-6 h-6 text-gray-300" />
          <span className="font-black text-white text-sm">Results</span>
          <span className="text-gray-500 text-xs">See how you scored</span>
        </Link>
        <Link to="/Leaderboard" className="bg-[#1a1a1a] border border-[#333] hover:border-[#e10600]/50 rounded-xl p-4 flex flex-col gap-2 transition-colors">
          <Trophy className="w-6 h-6 text-gray-300" />
          <span className="font-black text-white text-sm">Leaderboard</span>
          <span className="text-gray-500 text-xs">Global rankings</span>
        </Link>
      </div>

      {/* Upcoming races list */}
      {upcoming.length > 1 && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Upcoming Races</h3>
          <div className="space-y-2">
            {upcoming.slice(1, 5).map(race => (
              <div key={race.id} className="bg-[#1a1a1a] rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-white">{race.name}</p>
                  <p className="text-xs text-gray-400">{race.circuit} · {new Date(race.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <span className="text-xs text-gray-500">{race.flag_emoji}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}