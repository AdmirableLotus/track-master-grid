import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronDown, X, User } from 'lucide-react';

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

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('name', 30),
  });

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
              {value.number || '#'}
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

      {/* Selected driver stat bars */}
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

      {/* Dropdown */}
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
          {drivers.map(driver => {
            const c = driver.team_color || '#e10600';
            return (
              <button
                key={driver.id}
                onClick={() => { onChange(driver); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors border-b border-[#1a1a1a] ${value?.id === driver.id ? 'bg-[#1a1a1a]' : ''}`}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0" style={{ background: c + '25', border: `2px solid ${c}`, color: c }}>
                  {driver.number || '?'}
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
          {drivers.length === 0 && (
            <p className="text-gray-500 text-xs text-center py-6">No drivers added yet.</p>
          )}
        </div>
      )}
    </div>
  );
}