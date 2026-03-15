import { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronDown, X, User, Swords } from 'lucide-react';

const DRIVERS = [
  { id: '1',  name: 'Max Verstappen',       number: 1,  team: 'Red Bull Racing', team_color: '#3671C6', tire_management: 9, overtaking_ability: 9, wet_weather: 9,  consistency: 10, race_craft: 10, qualifying_pace: 9  },
  { id: '2',  name: 'Sergio Perez',          number: 11, team: 'Red Bull Racing', team_color: '#3671C6', tire_management: 8, overtaking_ability: 7, wet_weather: 7,  consistency: 7,  race_craft: 7,  qualifying_pace: 7  },
  { id: '3',  name: 'Lewis Hamilton',        number: 44, team: 'Ferrari',         team_color: '#E8002D', tire_management: 9, overtaking_ability: 9, wet_weather: 10, consistency: 9,  race_craft: 10, qualifying_pace: 9  },
  { id: '4',  name: 'Charles Leclerc',       number: 16, team: 'Ferrari',         team_color: '#E8002D', tire_management: 7, overtaking_ability: 8, wet_weather: 8,  consistency: 8,  race_craft: 8,  qualifying_pace: 10 },
  { id: '5',  name: 'Lando Norris',          number: 4,  team: 'McLaren',         team_color: '#FF8000', tire_management: 8, overtaking_ability: 8, wet_weather: 8,  consistency: 8,  race_craft: 8,  qualifying_pace: 9  },
  { id: '6',  name: 'Oscar Piastri',         number: 81, team: 'McLaren',         team_color: '#FF8000', tire_management: 7, overtaking_ability: 7, wet_weather: 7,  consistency: 8,  race_craft: 7,  qualifying_pace: 8  },
  { id: '7',  name: 'George Russell',        number: 63, team: 'Mercedes',        team_color: '#27F4D2', tire_management: 8, overtaking_ability: 8, wet_weather: 8,  consistency: 9,  race_craft: 8,  qualifying_pace: 9  },
  { id: '8',  name: 'Kimi Antonelli',        number: 12, team: 'Mercedes',        team_color: '#27F4D2', tire_management: 6, overtaking_ability: 7, wet_weather: 6,  consistency: 7,  race_craft: 6,  qualifying_pace: 7  },
  { id: '9',  name: 'Fernando Alonso',       number: 14, team: 'Aston Martin',    team_color: '#229971', tire_management: 10,overtaking_ability: 9, wet_weather: 9,  consistency: 9,  race_craft: 10, qualifying_pace: 8  },
  { id: '10', name: 'Lance Stroll',          number: 18, team: 'Aston Martin',    team_color: '#229971', tire_management: 6, overtaking_ability: 6, wet_weather: 6,  consistency: 6,  race_craft: 6,  qualifying_pace: 6  },
  { id: '11', name: 'Carlos Sainz',          number: 55, team: 'Williams',        team_color: '#37BEDD', tire_management: 9, overtaking_ability: 8, wet_weather: 8,  consistency: 9,  race_craft: 9,  qualifying_pace: 8  },
  { id: '12', name: 'Alexander Albon',       number: 23, team: 'Williams',        team_color: '#37BEDD', tire_management: 7, overtaking_ability: 7, wet_weather: 7,  consistency: 7,  race_craft: 7,  qualifying_pace: 7  },
  { id: '13', name: 'Nico Hulkenberg',       number: 27, team: 'Sauber',          team_color: '#52E252', tire_management: 7, overtaking_ability: 7, wet_weather: 7,  consistency: 7,  race_craft: 7,  qualifying_pace: 7  },
  { id: '14', name: 'Esteban Ocon',          number: 31, team: 'Haas',            team_color: '#B6BABD', tire_management: 7, overtaking_ability: 7, wet_weather: 7,  consistency: 7,  race_craft: 7,  qualifying_pace: 7  },
  { id: '15', name: 'Pierre Gasly',          number: 10, team: 'Alpine',          team_color: '#FF87BC', tire_management: 7, overtaking_ability: 7, wet_weather: 8,  consistency: 7,  race_craft: 7,  qualifying_pace: 7  },
  { id: '16', name: 'Yuki Tsunoda',          number: 22, team: 'RB',              team_color: '#6692FF', tire_management: 6, overtaking_ability: 7, wet_weather: 7,  consistency: 6,  race_craft: 7,  qualifying_pace: 7  },
];

const STATS = [
  { key: 'tire_management',   label: 'Tire Mgmt'   },
  { key: 'wet_weather',       label: 'Wet Weather' },
  { key: 'consistency',       label: 'Consistency' },
  { key: 'overtaking_ability',label: 'Overtaking'  },
  { key: 'race_craft',        label: 'Race Craft'  },
  { key: 'qualifying_pace',   label: 'Qualifying'  },
];

function DriverPicker({ value, onChange, exclude, label }) {
  const [open, setOpen] = useState(false);
  const color = value?.team_color || '#555';

  return (
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase mb-2">{label}</p>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#444] rounded-xl p-3 flex items-center gap-3 transition-colors"
        style={value ? { borderColor: color + '60' } : {}}
      >
        {value ? (
          <>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0"
              style={{ background: color + '25', border: `2px solid ${color}`, color }}>
              {value.number}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-white font-black text-sm truncate">{value.name}</p>
              <p className="text-xs truncate" style={{ color: color + 'cc' }}>{value.team}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-[#222] border-2 border-[#333] flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-gray-500 text-sm">Select driver</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-1 bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden max-h-56 overflow-y-auto z-20 relative shadow-xl">
          {value && (
            <button onClick={() => { onChange(null); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1a1a] border-b border-[#1a1a1a] transition-colors">
              <X className="w-3 h-3 text-gray-500" />
              <span className="text-gray-400 text-xs">Clear selection</span>
            </button>
          )}
          {DRIVERS.filter(d => d.id !== exclude?.id).map(driver => {
            const c = driver.team_color;
            return (
              <button key={driver.id}
                onClick={() => { onChange(driver); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1a1a] border-b border-[#111] transition-colors ${value?.id === driver.id ? 'bg-[#1a1a1a]' : ''}`}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: c + '25', border: `2px solid ${c}`, color: c }}>
                  {driver.number}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-bold">{driver.name}</p>
                  <p className="text-xs" style={{ color: c + 'aa' }}>{driver.team}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatBar({ value, color, max = 10 }) {
  return (
    <div className="flex-1 h-2 bg-[#222] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${(value / max) * 100}%`, background: color, boxShadow: `0 0 6px ${color}80` }} />
    </div>
  );
}

const CustomRadarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0d0d] border border-[#333] rounded-xl px-3 py-2 text-xs shadow-xl">
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="font-black text-white">{p.value}/10</span>
        </div>
      ))}
    </div>
  );
};

export default function DriverComparison() {
  const [driverA, setDriverA] = useState(DRIVERS[0]);
  const [driverB, setDriverB] = useState(DRIVERS[2]);

  const radarData = STATS.map(({ key, label }) => ({
    stat: label,
    [driverA?.name ?? 'A']: driverA?.[key] ?? 0,
    [driverB?.name ?? 'B']: driverB?.[key] ?? 0,
  }));

  const colorA = driverA?.team_color || '#e10600';
  const colorB = driverB?.team_color || '#3671C6';

  const winner = (key) => {
    if (!driverA || !driverB) return null;
    if (driverA[key] > driverB[key]) return 'A';
    if (driverB[key] > driverA[key]) return 'B';
    return 'tie';
  };

  const totalA = driverA ? STATS.reduce((s, { key }) => s + driverA[key], 0) : 0;
  const totalB = driverB ? STATS.reduce((s, { key }) => s + driverB[key], 0) : 0;

  return (
    <div className="p-4 max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Swords className="w-5 h-5 text-[#e10600]" />
        <div>
          <h1 className="text-xl font-black text-white">Driver Comparison</h1>
          <p className="text-gray-400 text-xs">Head-to-head performance analysis</p>
        </div>
      </div>

      {/* Driver pickers */}
      <div className="flex gap-3 mb-5 items-start">
        <DriverPicker value={driverA} onChange={setDriverA} exclude={driverB} label="Driver A" />
        <div className="flex items-center justify-center pt-8 shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
            <span className="text-[10px] font-black text-gray-400">VS</span>
          </div>
        </div>
        <DriverPicker value={driverB} onChange={setDriverB} exclude={driverA} label="Driver B" />
      </div>

      {driverA && driverB ? (
        <>
          {/* Overall score */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-3xl font-black" style={{ color: colorA }}>{totalA}</p>
              <p className="text-[10px] text-gray-500 font-black tracking-widest mt-1">OVERALL</p>
            </div>
            <div className="text-center px-4">
              <div className="text-xs font-black text-gray-500 tracking-widest">
                {totalA > totalB ? (
                  <span style={{ color: colorA }}>{driverA.name.split(' ').pop()} WINS</span>
                ) : totalB > totalA ? (
                  <span style={{ color: colorB }}>{driverB.name.split(' ').pop()} WINS</span>
                ) : (
                  <span className="text-gray-400">TIED</span>
                )}
              </div>
            </div>
            <div className="text-center flex-1">
              <p className="text-3xl font-black" style={{ color: colorB }}>{totalB}</p>
              <p className="text-[10px] text-gray-500 font-black tracking-widest mt-1">OVERALL</p>
            </div>
          </div>

          {/* Radar chart */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4 mb-4">
            <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase mb-3">Radar Analysis</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#2a2a2a" />
                <PolarAngleAxis dataKey="stat"
                  tick={{ fill: '#888', fontSize: 10, fontWeight: 700 }} />
                <Tooltip content={<CustomRadarTooltip />} />
                <Radar name={driverA.name} dataKey={driverA.name}
                  stroke={colorA} fill={colorA} fillOpacity={0.15} strokeWidth={2} />
                <Radar name={driverB.name} dataKey={driverB.name}
                  stroke={colorB} fill={colorB} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-1">
              {[{ d: driverA, c: colorA }, { d: driverB, c: colorB }].map(({ d, c }) => (
                <div key={d.id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: c }} />
                  <span className="text-xs font-bold text-gray-300">{d.name.split(' ').pop()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stat-by-stat breakdown */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4">
            <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase mb-4">Stat Breakdown</p>
            <div className="space-y-4">
              {STATS.map(({ key, label }) => {
                const w = winner(key);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black" style={{ color: w === 'A' ? colorA : '#666' }}>
                        {driverA[key]}
                        {w === 'A' && <span className="ml-1 text-[9px]">▲</span>}
                      </span>
                      <span className="text-[10px] text-gray-500 font-black tracking-widest uppercase">{label}</span>
                      <span className="text-xs font-black" style={{ color: w === 'B' ? colorB : '#666' }}>
                        {w === 'B' && <span className="mr-1 text-[9px]">▲</span>}
                        {driverB[key]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* A bar — grows right to left */}
                      <div className="flex-1 h-2 bg-[#222] rounded-full overflow-hidden flex justify-end">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(driverA[key] / 10) * 100}%`, background: colorA, boxShadow: `0 0 6px ${colorA}60` }} />
                      </div>
                      <div className="w-px h-4 bg-[#333] shrink-0" />
                      {/* B bar — grows left to right */}
                      <div className="flex-1 h-2 bg-[#222] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(driverB[key] / 10) * 100}%`, background: colorB, boxShadow: `0 0 6px ${colorB}60` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-10 text-center">
          <Swords className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-bold">Select two drivers to compare</p>
          <p className="text-gray-600 text-sm mt-1">Head-to-head radar chart will appear here</p>
        </div>
      )}
    </div>
  );
}
