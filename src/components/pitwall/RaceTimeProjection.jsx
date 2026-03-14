// Shows estimated race time delta vs an average driver

const BASE_TIRE_LIFE = { soft: 15, medium: 25, hard: 35 };
const WX = {
  dry:     { life: 1.0, deg: 1.0 },
  mixed:   { life: 0.70, deg: 1.6 },
  wet:     { life: 0.45, deg: 2.5 },
  unknown: { life: 0.9,  deg: 1.1 },
};

function buildStints(strategy, totalLaps) {
  const stints = [];
  let lap = 1;
  let tire = strategy.starting_tire;
  const pits = [
    { lap: strategy.pit_stop_1_lap, tire: strategy.pit_stop_1_tire },
    { lap: strategy.pit_stop_2_lap, tire: strategy.pit_stop_2_tire },
    { lap: strategy.pit_stop_3_lap, tire: strategy.pit_stop_3_tire },
  ].filter(p => p.lap && p.tire).sort((a, b) => a.lap - b.lap);

  const transitions = [...pits, { lap: totalLaps + 1, tire: null }];
  for (const t of transitions) {
    stints.push({ startLap: lap, endLap: t.lap - 1, tire });
    lap = t.lap;
    tire = t.tire;
    if (!tire) break;
  }
  return stints;
}

function calcLapTimePenalty(stints, weather, tireMgmt) {
  const wx = WX[weather] || WX.dry;
  const driverMod = (tireMgmt - 5) * 0.06;
  let penalty = 0;
  stints.forEach(stint => {
    const life = Math.round((BASE_TIRE_LIFE[stint.tire] || 25) * wx.life * (1 + driverMod));
    const baseGrip = weather === 'wet' ? 82 : weather === 'mixed' ? 90 : 100;
    for (let lap = 0; lap < (stint.endLap - stint.startLap + 1); lap++) {
      const deg = Math.min(lap / life, 1);
      const perf = baseGrip - deg * 35 * wx.deg;
      penalty += (100 - Math.max(perf, 30)) * 0.08;
    }
  });
  return penalty;
}

export default function RaceTimeProjection({ driver, strategy, totalLaps = 50, weather = 'dry' }) {
  if (!driver) return null;

  const stints = buildStints(strategy, totalLaps);
  const color = driver.team_color || '#e10600';

  // Tire management impact
  const avgTirePenalty = calcLapTimePenalty(stints, weather, 5);
  const driverTirePenalty = calcLapTimePenalty(stints, weather, driver.tire_management);
  const tireDelta = Math.round(avgTirePenalty - driverTirePenalty);

  // Wet weather impact (only meaningful in wet/mixed)
  let wetDelta = 0;
  if (weather === 'wet' || weather === 'mixed') {
    const wxMult = weather === 'wet' ? 1.0 : 0.6;
    wetDelta = Math.round((driver.wet_weather - 5) * 1.5 * wxMult);
  }

  // Consistency: small bonus to every lap time
  const consistencyDelta = Math.round((driver.consistency - 5) * 0.5);

  const total = tireDelta + wetDelta + consistencyDelta;
  const totalColor = total >= 0 ? '#4ade80' : '#f87171';
  const totalSign = total >= 0 ? '-' : '+';
  const totalAbs = Math.abs(total);

  const rows = [
    { label: 'Tire Management', delta: tireDelta, icon: '🏎️' },
    ...(weather !== 'dry' && weather !== 'unknown' ? [{ label: 'Wet Weather', delta: wetDelta, icon: '🌧️' }] : []),
    { label: 'Consistency', delta: consistencyDelta, icon: '🎯' },
  ];

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-gray-400 font-bold tracking-widest">DRIVER IMPACT</p>
        <div className="text-right">
          <span className="text-lg font-black" style={{ color: totalColor }}>
            {totalSign}{totalAbs}s
          </span>
          <span className="text-[10px] text-gray-500 block">vs avg driver</span>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map(({ label, delta, icon }) => {
          const sign = delta >= 0 ? '-' : '+';
          const abs = Math.abs(delta);
          const c = delta >= 0 ? '#4ade80' : '#f87171';
          return (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{icon} {label}</span>
              <span className="font-bold tabular-nums" style={{ color: delta === 0 ? '#6b7280' : c }}>
                {delta === 0 ? '±0s' : `${sign}${abs}s`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-[#2a2a2a] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-xs text-gray-500">
          {driver.name} is estimated to be{' '}
          <span className="font-bold" style={{ color: totalColor }}>
            {total === 0 ? 'on par with' : total > 0 ? `~${total}s faster than` : `~${Math.abs(total)}s slower than`}
          </span>
          {' '}an average driver on this strategy.
        </span>
      </div>
    </div>
  );
}