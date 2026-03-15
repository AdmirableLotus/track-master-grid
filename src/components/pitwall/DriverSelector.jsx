import { useState } from 'react';
import { ChevronDown, X, User } from 'lucide-react';

const DRIVERS = [
  { id: '1', name: 'Max Verstappen', number: 1, team: 'Red Bull Racing', team_color: '#3671C6', tire_management: 9, overtaking_ability: 9, wet_weather: 9, consistency: 10 },
  { id: '2', name: 'Sergio Perez', number: 11, team: 'Red Bull Racing', team_color: '#3671C6', tire_management: 8, overtaking_ability: 7, wet_weather: 7, consistency: 7 },
  { id: '3', name: 'Lewis Hamilton', number: 44, team: 'Ferrari', team_color: '#E8002D', tire_management: 9, overtaking_ability: 9, wet_weather: 10, consistency: 9 },
  { id: '4', name: 'Charles Leclerc', number: 16, team: 'Ferrari', team_color: '#E8002D', tire_management: 7, overtaking_ability: 8, wet_weather: 8, consistency: 8 },
  { id: '5', name: 'Lando Norris', number: 4, team: 'McLaren', team_color: '#FF8000', tire_management: 8, overtaking_ability: 8, wet_weather: 8, consistency: 8 },
  { id: '6', name: 'Oscar Piastri', number: 81, team: 'McLaren', team_color: '#FF8000', tire_management: 7, overtaking_ability: 7, wet_weather: 7, consistency: 8 },
  { id: '7', name: 'George Russell', number: 63, team: 'Mercedes', team_color: '#27F4D2', tire_management: 8, overtaking_ability: 8, wet_weather: 8, consistency: 9 },
  { id: '8', name: 'Andrea Kimi Antonelli', number: 12, team: 'Mercedes', team_color: '#27F4D2', tire_management: 6, overtaking_ability: 7, wet_weather: 6, consistency: 7 },
  { id: '9', name: 'Fernando Alonso', number: 14, team: 'Aston Martin', team_color: '#229971', tire_management: 10, overtaking_ability: 9, wet_weather: 9, consistency: 9 },
  { id: '10', name: 'Lance Stroll', number: 18, team: 'Aston Martin', team_color: '#229971', tire_management: 6, overtaking_ability: 6, wet_weather: 6, consistency: 6 },
];

const STATS = [
  { key: 'tire_management', label: 'Tire Mgmt' },
  { key: 'overtaking_ability', label: 'Overtaking' },
  { key: 'wet_weather', label: 'Wet Weather' },
  { key: 'consistency', label: 'Consistency' },
];

function StatBar({ value = 5, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${(value / 10) * 100}%`, background: color }} />
      </div>
      <span className="text-[10px] font-black w-4 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

export default function DriverSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const color = value?.team_color || '#e10600';

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 flex items-center gap-3 hover:border-[#444] transition-colors"
      >
        {value ? (
          <>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{ background: color + '25', border: `2px solid ${color}`, color }}>
              {value.number}
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-black text-sm">{value.name}</p>
              <p className="text-xs" style={{ color: color + 'cc' }}>{value.team}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-[#222] border-2 border-[#333] flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-gray-400 flex-1 text-left text-sm">Select a driver (optional)</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {value && !open && (
        <div className="mt-2 bg-[#111] rounded-xl p-3 border border-[#222] grid grid-cols-2 gap-x-5 gap-y-2">
          {STATS.map(({ key, label }) => (
            <div key={key}>
              <p className="text-[9px] text-gray-500 font-bold tracking-widest mb-1">{label.toUpperCase()}</p>
              <StatBar value={value[key]} color={color} />
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="mt-2 bg-[#111] border border-[#333] rounded-xl overflow-hidden max-h-64 overflow-y-auto z-10 relative">
          <button
            onClick={() => { onChange(null); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] border-b border-[#222] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#222] border border-[#333] flex items-center justify-center shrink-0">
              <X className="w-3 h-3 text-gray-500" />
            </div>
            <span className="text-gray-400 text-sm">No driver — average pace</span>
          </button>
          {DRIVERS.map(driver => {
            const c = driver.team_color;
            return (
              <button
                key={driver.id}
                onClick={() => { onChange(driver); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors border-b border-[#1a1a1a] ${value?.id === driver.id ? 'bg-[#1a1a1a]' : ''}`}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0" style={{ background: c + '25', border: `2px solid ${c}`, color: c }}>
                  {driver.number}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-bold">{driver.name}</p>
                  <p className="text-xs" style={{ color: c + 'aa' }}>{driver.team}</p>
                </div>
                <div className="flex gap-2 text-[10px] text-gray-500">
                  <span>🏎️{driver.tire_management}</span>
                  <span>⚡{driver.overtaking_ability}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
