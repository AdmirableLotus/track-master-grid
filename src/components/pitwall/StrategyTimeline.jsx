const WEATHER_INFO = {
  dry:     { icon: '☀️', label: 'Dry',   color: '#ffd700', warning: null },
  mixed:   { icon: '🌦️', label: 'Mixed', color: '#f97316', warning: 'Rain possible — consider an extra stop or earlier pit window.' },
  wet:     { icon: '🌧️', label: 'Wet',   color: '#60a5fa', warning: 'Wet race — slick tires degrade up to 55% faster. Pit significantly earlier.' },
  unknown: { icon: '❓', label: 'TBC',   color: '#aaa',    warning: null },
};

const TIRE_CONFIG = {
  soft:   { color: '#e10600', label: 'Soft',   bg: '#e1060022' },
  medium: { color: '#ffd700', label: 'Medium', bg: '#ffd70022' },
  hard:   { color: '#cccccc', label: 'Hard',   bg: '#cccccc22' },
};

function buildStints(strategy, totalLaps) {
  const stints = [];
  const pits = [
    { lap: strategy.pit_stop_1_lap, tire: strategy.pit_stop_1_tire },
    { lap: strategy.pit_stop_2_lap, tire: strategy.pit_stop_2_tire },
    { lap: strategy.pit_stop_3_lap, tire: strategy.pit_stop_3_tire },
  ].filter(p => p.lap && p.tire).sort((a, b) => a.lap - b.lap);

  let startLap = 1;
  let tire = strategy.starting_tire;

  for (const pit of pits) {
    if (pit.lap > startLap) {
      stints.push({ startLap, endLap: pit.lap - 1, tire });
    }
    startLap = pit.lap;
    tire = pit.tire;
  }
  stints.push({ startLap, endLap: totalLaps, tire });
  return stints;
}

const WEATHER_LIFE = { dry: 1.0, mixed: 0.70, wet: 0.45, unknown: 0.9 };

function effectiveTireLife(tire, weather) {
  const base = { soft: 15, medium: 25, hard: 35 }[tire] || 25;
  return Math.round(base * (WEATHER_LIFE[weather] || 1));
}

export default function StrategyTimeline({ strategy, totalLaps = 50, weather = 'dry' }) {
  const stints = buildStints(strategy, totalLaps);
  const wx = WEATHER_INFO[weather] || WEATHER_INFO.dry;

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-gray-400 font-bold tracking-widest">STRATEGY TIMELINE</p>
        <span className="text-xs font-bold flex items-center gap-1" style={{ color: wx.color }}>
          {wx.icon} {wx.label}
        </span>
      </div>
      {wx.warning && (
        <div className="mb-3 text-xs px-3 py-2 rounded-lg border font-semibold" style={{ color: wx.color, borderColor: wx.color + '40', background: wx.color + '10' }}>
          {wx.warning}
        </div>
      )}

      {/* Visual bar */}
      <div className="flex rounded-lg overflow-hidden h-8 mb-3">
        {stints.map((stint, i) => {
          const cfg = TIRE_CONFIG[stint.tire] || TIRE_CONFIG.medium;
          const width = ((stint.endLap - stint.startLap + 1) / totalLaps) * 100;
          return (
            <div
              key={i}
              style={{ width: `${width}%`, background: cfg.color, opacity: 0.85 }}
              className="relative flex items-center justify-center"
              title={`${cfg.label}: Lap ${stint.startLap}–${stint.endLap}`}
            >
              <span className="text-[9px] font-black text-black mix-blend-overlay truncate px-1">
                {cfg.label.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Lap labels */}
      <div className="flex items-start gap-0 text-[9px] text-gray-500 mb-3 relative">
        {stints.map((stint, i) => {
          const width = ((stint.endLap - stint.startLap + 1) / totalLaps) * 100;
          return (
            <div key={i} style={{ width: `${width}%` }} className="flex justify-start">
              <span>{stint.startLap}</span>
            </div>
          );
        })}
        <span className="absolute right-0">{totalLaps}</span>
      </div>

      {/* Stint details */}
      <div className="space-y-1">
        {stints.map((stint, i) => {
          const cfg = TIRE_CONFIG[stint.tire] || TIRE_CONFIG.medium;
          const laps = stint.endLap - stint.startLap + 1;
          const lifeLimit = effectiveTireLife(stint.tire, weather);
          const overLimit = laps > lifeLimit;
          return (
            <div key={i} className="flex items-center gap-3 text-xs">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
              <span className="text-gray-300 w-32 shrink-0">
                Lap {stint.startLap}–{stint.endLap}
              </span>
              <span style={{ color: cfg.color }} className="font-bold">{cfg.label}</span>
              <span className={`ml-auto text-[10px] font-bold ${overLimit ? 'text-red-400' : 'text-gray-500'}`}>
                {laps}/{lifeLimit}L {overLimit ? '⚠️' : ''}
              </span>
              {i < stints.length - 1 && (
                <span className="text-[#e10600] text-[9px] font-bold">→ PIT</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}