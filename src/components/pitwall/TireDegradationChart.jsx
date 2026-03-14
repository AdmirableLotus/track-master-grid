import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const BASE_TIRE_LIFE = { soft: 15, medium: 25, hard: 35 };
const TIRE_COLORS = { soft: '#e10600', medium: '#ffd700', hard: '#aaaaaa' };

// Wet/mixed = slick tires degrade far faster; wet also kills grip dramatically
const WEATHER_MULTIPLIERS = {
  dry:   { life: 1.0,  degradation: 1.0,  label: null },
  mixed: { life: 0.70, degradation: 1.6,  label: '⚠️ Mixed conditions — tires degrading 30% faster' },
  wet:   { life: 0.45, degradation: 2.5,  label: '🌧️ Wet track — slicks losing grip rapidly! Pit earlier.' },
  unknown: { life: 0.9, degradation: 1.1, label: null },
};

function getTireLife(tire, weather, tireMgmt = 5) {
  const mult = WEATHER_MULTIPLIERS[weather] || WEATHER_MULTIPLIERS.dry;
  const driverMod = 1 + (tireMgmt - 5) * 0.06; // ±30% across 1–10
  return Math.round((BASE_TIRE_LIFE[tire] || 25) * mult.life * driverMod);
}

function buildStints(strategy, totalLaps) {
  const stints = [];
  let lap = 1;
  let tire = strategy.starting_tire;

  const pits = [
    { lap: strategy.pit_stop_1_lap, tire: strategy.pit_stop_1_tire },
    { lap: strategy.pit_stop_2_lap, tire: strategy.pit_stop_2_tire },
    { lap: strategy.pit_stop_3_lap, tire: strategy.pit_stop_3_tire },
  ].filter(p => p.lap && p.tire).sort((a, b) => a.lap - b.lap);

  const transitions = [...pits.map(p => ({ lap: p.lap, tire: p.tire })), { lap: totalLaps + 1, tire: null }];

  for (const t of transitions) {
    stints.push({ startLap: lap, endLap: t.lap - 1, tire });
    lap = t.lap;
    tire = t.tire;
    if (!tire) break;
  }
  return stints;
}

export default function TireDegradationChart({ strategy, totalLaps = 50, weather = 'dry', driver = null }) {
  const wx = WEATHER_MULTIPLIERS[weather] || WEATHER_MULTIPLIERS.dry;
  const tireMgmt = driver?.tire_management ?? 5;
  const stints = buildStints(strategy, totalLaps);
  const data = [];

  for (let lap = 1; lap <= totalLaps; lap++) {
    const stint = stints.find(s => lap >= s.startLap && lap <= s.endLap);
    if (!stint) { data.push({ lap, performance: 0 }); continue; }
    const age = lap - stint.startLap;
    const life = getTireLife(stint.tire, weather, tireMgmt);
    const degradation = Math.min(age / life, 1);
    // Wet/mixed reduces base grip too
    const baseGrip = weather === 'wet' ? 82 : weather === 'mixed' ? 90 : 100;
    const performance = baseGrip - degradation * 35 * wx.degradation;
    data.push({ lap, performance: Math.max(Math.round(performance * 10) / 10, 30), tire: stint.tire });
  }

  const pitLaps = [strategy.pit_stop_1_lap, strategy.pit_stop_2_lap, strategy.pit_stop_3_lap].filter(Boolean);

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
      {wx.label && (
        <div className="mb-3 text-xs font-semibold px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300">
          {wx.label}
        </div>
      )}
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="lap" stroke="#444" tick={{ fill: '#666', fontSize: 10 }} />
          <YAxis domain={[60, 100]} stroke="#444" tick={{ fill: '#666', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: '#fff' }}
            formatter={(v) => [`${v}%`, 'Performance']}
          />
          {pitLaps.map(l => <ReferenceLine key={l} x={l} stroke="#e10600" strokeDasharray="3 3" />)}
          <Line type="monotone" dataKey="performance" stroke="#e10600" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-3 mt-2 justify-center">
        {[...new Set(stints.map(s => s.tire))].map(t => (
          <span key={t} className="text-xs flex items-center gap-1" style={{ color: TIRE_COLORS[t] }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: TIRE_COLORS[t] }} />
            {t}
          </span>
        ))}
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <span className="w-4 h-px inline-block bg-[#e10600] opacity-50" /> pit stop
        </span>
      </div>
    </div>
  );
}