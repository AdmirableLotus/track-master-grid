import {
  ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, Legend, CartesianGrid,
} from 'recharts';

const TIRE_COLORS  = { soft: '#e10600', medium: '#ffd700', hard: '#cccccc' };
const TIRE_LABELS  = { soft: 'Soft', medium: 'Medium', hard: 'Hard' };
const BASE_LIFE    = { soft: 15, medium: 25, hard: 35 };
const WEATHER_MULT = { dry: 1.0, mixed: 0.70, wet: 0.45, unknown: 0.9 };
const WEATHER_DEG  = { dry: 1.0, mixed: 1.6,  wet: 2.5,  unknown: 1.1 };

function getTireLife(tire, weather, tireMgmt = 5) {
  const wm = WEATHER_MULT[weather] ?? 1;
  const dm = 1 + (tireMgmt - 5) * 0.06;
  return Math.max(1, Math.round((BASE_LIFE[tire] ?? 25) * wm * dm));
}

function calcPerf(lapAge, life, weather) {
  const deg = Math.min(lapAge / life, 1);
  const baseGrip = weather === 'wet' ? 82 : weather === 'mixed' ? 90 : 100;
  const wd = WEATHER_DEG[weather] ?? 1;
  return Math.max(Math.round((baseGrip - deg * 35 * wd) * 10) / 10, 20);
}

function buildStints(strategy, totalLaps) {
  const pits = [
    { lap: strategy.pit_stop_1_lap, tire: strategy.pit_stop_1_tire },
    { lap: strategy.pit_stop_2_lap, tire: strategy.pit_stop_2_tire },
    { lap: strategy.pit_stop_3_lap, tire: strategy.pit_stop_3_tire },
  ].filter(p => p.lap && p.tire).sort((a, b) => a.lap - b.lap);

  const stints = [];
  let start = 1;
  let tire = strategy.starting_tire;
  for (const p of pits) {
    stints.push({ start, end: p.lap - 1, tire });
    start = p.lap;
    tire = p.tire;
  }
  stints.push({ start, end: totalLaps, tire });
  return stints;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0d0d] border border-[#333] rounded-xl px-4 py-3 shadow-xl min-w-[160px]">
      <p className="text-xs text-gray-400 font-bold mb-2 tracking-widest">LAP {label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-xs text-gray-300">{TIRE_LABELS[p.dataKey] ?? p.dataKey}</span>
          </div>
          <span className="text-xs font-black tabular-nums" style={{ color: p.color }}>
            {p.value != null ? `${p.value}%` : '—'}
          </span>
        </div>
      ))}
    </div>
  );
};

const CustomLegend = ({ compounds, weather, tireMgmt }) => (
  <div className="flex gap-4 justify-center mt-2 flex-wrap">
    {compounds.map(t => {
      const life = getTireLife(t, weather, tireMgmt);
      return (
        <div key={t} className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ background: TIRE_COLORS[t] }} />
          <span className="text-xs font-bold" style={{ color: TIRE_COLORS[t] }}>
            {TIRE_LABELS[t]}
          </span>
          <span className="text-[10px] text-gray-500">~{life}L</span>
        </div>
      );
    })}
    <div className="flex items-center gap-1.5">
      <span className="w-4 h-px inline-block bg-[#e10600] opacity-60" style={{ borderTop: '2px dashed #e10600' }} />
      <span className="text-[10px] text-gray-500">pit stop</span>
    </div>
  </div>
);

export default function TireDegradationChart({ strategy, totalLaps = 50, weather = 'dry', driver = null }) {
  const tireMgmt = driver?.tire_management ?? 5;
  const stints = buildStints(strategy, totalLaps);
  const pitLaps = [strategy.pit_stop_1_lap, strategy.pit_stop_2_lap, strategy.pit_stop_3_lap].filter(Boolean);

  // All unique compounds used in this strategy
  const usedCompounds = [...new Set([strategy.starting_tire, ...pitLaps.map((_, i) => [strategy.pit_stop_1_tire, strategy.pit_stop_2_tire, strategy.pit_stop_3_tire][i]).filter(Boolean)])];

  // Build data: one entry per lap, with a key per compound showing perf ONLY during its active stint
  const data = [];
  for (let lap = 1; lap <= totalLaps; lap++) {
    const entry = { lap };
    const activeStint = stints.find(s => lap >= s.start && lap <= s.end);
    if (activeStint) {
      const age = lap - activeStint.start;
      const life = getTireLife(activeStint.tire, weather, tireMgmt);
      entry[activeStint.tire] = calcPerf(age, life, weather);
    }
    data.push(entry);
  }

  // Cliff zones: laps where perf drops below 60%
  const cliffStart = data.findIndex(d => Object.values(d).some(v => typeof v === 'number' && v < 60));

  const wxLabel = { dry: null, mixed: '⚠️ Mixed — tires degrade 30% faster', wet: '🌧️ Wet — slicks losing grip rapidly!', unknown: null }[weather];

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] text-gray-400 font-bold tracking-widest">TIRE LIFE %</p>
        {driver && (
          <span className="text-[10px] text-gray-500">
            🏎️ {driver.name} · Tire Mgmt {tireMgmt}/10
          </span>
        )}
      </div>

      {wxLabel && (
        <div className="mb-3 text-xs font-semibold px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300">
          {wxLabel}
        </div>
      )}

      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis
            dataKey="lap"
            stroke="#444"
            tick={{ fill: '#666', fontSize: 10 }}
            label={{ value: 'Lap', position: 'insideBottomRight', offset: -5, fill: '#555', fontSize: 10 }}
          />
          <YAxis
            domain={[20, 100]}
            stroke="#444"
            tick={{ fill: '#666', fontSize: 10 }}
            tickFormatter={v => `${v}%`}
            width={38}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Danger zone below 60% */}
          <ReferenceArea y1={20} y2={60} fill="#e10600" fillOpacity={0.04} />
          <ReferenceLine y={60} stroke="#e10600" strokeDasharray="4 4" strokeOpacity={0.4}
            label={{ value: 'Cliff', position: 'insideTopLeft', fill: '#e10600', fontSize: 9, opacity: 0.6 }}
          />

          {/* Pit stop lines */}
          {pitLaps.map(l => (
            <ReferenceLine key={l} x={l} stroke="#e10600" strokeDasharray="3 3" strokeOpacity={0.7}
              label={{ value: `P${l}`, position: 'top', fill: '#e10600', fontSize: 9 }}
            />
          ))}

          {/* One line per compound */}
          {usedCompounds.map(t => (
            <Line
              key={t}
              type="monotone"
              dataKey={t}
              stroke={TIRE_COLORS[t]}
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      <CustomLegend compounds={usedCompounds} weather={weather} tireMgmt={tireMgmt} />
    </div>
  );
}
