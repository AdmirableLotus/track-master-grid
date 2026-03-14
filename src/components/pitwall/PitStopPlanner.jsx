import { Plus, Trash2 } from 'lucide-react';

const TIRE_COLORS = { soft: '#e10600', medium: '#ffd700', hard: '#e0e0e0' };

const stops = [
  { lapKey: 'pit_stop_1_lap', tireKey: 'pit_stop_1_tire', label: 'Stop 1' },
  { lapKey: 'pit_stop_2_lap', tireKey: 'pit_stop_2_tire', label: 'Stop 2' },
  { lapKey: 'pit_stop_3_lap', tireKey: 'pit_stop_3_tire', label: 'Stop 3' },
];

export default function PitStopPlanner({ strategy, onChange, totalLaps = 50, compounds = ['soft', 'medium', 'hard'], disabled }) {
  const activeStops = stops.filter(s => s.lapKey === 'pit_stop_1_lap' || strategy[s.lapKey] !== null);
  const nextStop = stops.find(s => strategy[s.lapKey] === null && s.lapKey !== 'pit_stop_1_lap');

  const addStop = () => {
    if (nextStop) onChange({ [nextStop.lapKey]: Math.floor(totalLaps / 2), [nextStop.tireKey]: 'medium' });
  };

  const removeStop = (lapKey, tireKey) => {
    onChange({ [lapKey]: null, [tireKey]: null });
  };

  return (
    <div className="space-y-3">
      {stops.map(({ lapKey, tireKey, label }) => {
        if (lapKey !== 'pit_stop_1_lap' && strategy[lapKey] === null) return null;
        return (
          <div key={lapKey} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 tracking-widest">{label}</span>
              {lapKey !== 'pit_stop_1_lap' && !disabled && (
                <button onClick={() => removeStop(lapKey, tireKey)} className="text-red-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 block mb-1">Pit on Lap</label>
                <input
                  type="number"
                  min={1}
                  max={totalLaps}
                  disabled={disabled}
                  value={strategy[lapKey] || ''}
                  onChange={e => onChange({ [lapKey]: parseInt(e.target.value) || null })}
                  className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm"
                  placeholder="Lap #"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 block mb-1">New Tire</label>
                <select
                  disabled={disabled}
                  value={strategy[tireKey] || ''}
                  onChange={e => onChange({ [tireKey]: e.target.value })}
                  className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm"
                >
                  {compounds.map(c => (
                    <option key={c} value={c} style={{ color: TIRE_COLORS[c] }}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      })}
      {nextStop && !disabled && (
        <button
          onClick={addStop}
          className="w-full bg-[#111] border border-dashed border-[#444] text-gray-400 rounded-xl py-3 flex items-center justify-center gap-2 hover:border-[#e10600]/50 hover:text-gray-200 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Pit Stop
        </button>
      )}
    </div>
  );
}