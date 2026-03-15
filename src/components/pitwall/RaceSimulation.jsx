import { useMemo } from 'react';
import { Timer, TrendingUp, TrendingDown, Minus, Flag, AlertTriangle } from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────
const BASE_LAP = { soft: 90.0, medium: 90.8, hard: 91.8 }; // seconds
const DEG_PER_LAP = { soft: 0.065, medium: 0.038, hard: 0.022 }; // sec/lap degradation
const WEATHER_DEG_MULT = { dry: 1.0, mixed: 1.6, wet: 2.5, unknown: 1.1 };
const WEATHER_BASE_MULT = { dry: 1.0, mixed: 1.012, wet: 1.045, unknown: 1.005 };
const PIT_STOP_DURATION = 22; // seconds (stationary + in/out lap loss)
const RISK_DELTA = { conservative: +1.2, moderate: 0, aggressive: -0.8 };
const SC_DELTA = { pit: -15, stay: +8, none: 0 }; // safety car timing impact

function fmt(totalSecs) {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = Math.floor(totalSecs % 60);
  const ms = Math.round((totalSecs % 1) * 10);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`
    : `${m}:${String(s).padStart(2, '0')}.${ms}`;
}

function fmtLap(secs) {
  const m = Math.floor(secs / 60);
  const s = (secs % 60).toFixed(3);
  return `${m}:${s.padStart(6, '0')}`;
}

// ── Core simulation ────────────────────────────────────────────────────────
export function simulate({ strategy, race, driver, weather }) {
  const totalLaps = race?.laps ?? 50;
  const pitLoss = race?.pit_lane_time_loss ?? PIT_STOP_DURATION;
  const wxDeg = WEATHER_DEG_MULT[weather] ?? 1;
  const wxBase = WEATHER_BASE_MULT[weather] ?? 1;
  const tireMgmt = driver?.tire_management ?? 5;
  const driverMod = 1 - (tireMgmt - 5) * 0.004; // better mgmt = less deg
  const riskDelta = RISK_DELTA[strategy.risk_level] ?? 0;

  const pits = [
    { lap: strategy.pit_stop_1_lap, tire: strategy.pit_stop_1_tire },
    { lap: strategy.pit_stop_2_lap, tire: strategy.pit_stop_2_tire },
    { lap: strategy.pit_stop_3_lap, tire: strategy.pit_stop_3_tire },
  ].filter(p => p.lap && p.tire).sort((a, b) => a.lap - b.lap);

  // Build stints
  const stints = [];
  let start = 1;
  let tire = strategy.starting_tire;
  for (const p of pits) {
    stints.push({ start, end: p.lap - 1, tire });
    start = p.lap;
    tire = p.tire;
  }
  stints.push({ start, end: totalLaps, tire });

  // Simulate lap by lap
  let totalTime = 0;
  const lapTimes = [];
  let fastestLap = Infinity;
  let slowestLap = 0;

  for (const stint of stints) {
    const baseLap = (BASE_LAP[stint.tire] ?? 91) * wxBase;
    const degRate = (DEG_PER_LAP[stint.tire] ?? 0.04) * wxDeg * driverMod;

    for (let lap = stint.start; lap <= stint.end; lap++) {
      const age = lap - stint.start;
      const lapTime = baseLap + age * degRate + riskDelta;
      totalTime += lapTime;
      lapTimes.push({ lap, time: lapTime, tire: stint.tire, stint: stints.indexOf(stint) });
      if (lapTime < fastestLap) fastestLap = lapTime;
      if (lapTime > slowestLap) slowestLap = lapTime;
    }
  }

  // Add pit stop time
  const pitTime = pits.length * pitLoss;
  totalTime += pitTime;

  // Safety car adjustment
  const scAdj = SC_DELTA[strategy.safety_car_response] ?? 0;
  totalTime += scAdj;

  // Efficiency score (0–100)
  const maxPossibleTime = totalLaps * (BASE_LAP['hard'] * wxBase + totalLaps * DEG_PER_LAP['hard'] * wxDeg);
  const minPossibleTime = totalLaps * BASE_LAP['soft'] * wxBase;
  const efficiency = Math.max(0, Math.min(100, Math.round(
    100 - ((totalTime - minPossibleTime) / (maxPossibleTime - minPossibleTime)) * 100
  )));

  // Stint summaries
  const stintSummaries = stints.map((s, i) => {
    const laps = lapTimes.filter(l => l.stint === i);
    const avg = laps.reduce((a, l) => a + l.time, 0) / laps.length;
    return { ...s, laps: s.end - s.start + 1, avgLap: avg };
  });

  return {
    totalTime,
    pitTime,
    pitCount: pits.length,
    fastestLap,
    slowestLap,
    avgLap: (totalTime - pitTime - scAdj) / totalLaps,
    efficiency,
    stintSummaries,
    lapTimes,
    scAdj,
  };
}

// ── UI Component ───────────────────────────────────────────────────────────
const TIRE_COLORS = { soft: '#e10600', medium: '#ffd700', hard: '#cccccc' };

export default function RaceSimulation({ strategy, race, driver, weather = 'dry' }) {
  const result = useMemo(() =>
    simulate({ strategy, race, driver, weather }),
    [strategy, race, driver, weather]
  );

  const effColor = result.efficiency >= 75 ? '#4ade80' : result.efficiency >= 50 ? '#ffd700' : '#f87171';

  return (
    <div className="bg-[#0d0d0d] border border-[#e10600]/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a0000] to-[#0d0d0d] px-4 py-3 border-b border-[#1a1a1a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-[#e10600]" />
          <span className="text-xs font-black text-white tracking-widest uppercase">Race Simulation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#e10600] animate-pulse" />
          <span className="text-[10px] text-[#e10600] font-black tracking-widest">LIVE</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Estimated finish time — hero stat */}
        <div className="text-center py-3 border border-[#1a1a1a] rounded-xl bg-black/40">
          <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase mb-1">Estimated Finish Time</p>
          <p className="text-4xl font-black text-white tabular-nums" style={{ textShadow: '0 0 30px rgba(225,6,0,0.4)' }}>
            {fmt(result.totalTime)}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">{race?.laps ?? 50} laps · {result.pitCount} pit stop{result.pitCount !== 1 ? 's' : ''}</p>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Avg Lap',    value: fmtLap(result.avgLap),         icon: Timer,        color: '#60a5fa' },
            { label: 'Fastest',    value: fmtLap(result.fastestLap),      icon: TrendingUp,   color: '#4ade80' },
            { label: 'Pit Loss',   value: `+${result.pitTime}s`,          icon: Flag,         color: '#ffd700' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-3 text-center">
              <Icon className="w-3 h-3 mx-auto mb-1" style={{ color }} />
              <p className="text-xs font-black text-white tabular-nums">{value}</p>
              <p className="text-[9px] text-gray-500 font-bold tracking-widest mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Strategy efficiency bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Strategy Efficiency</span>
            <span className="text-sm font-black" style={{ color: effColor }}>{result.efficiency}%</span>
          </div>
          <div className="h-2.5 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${result.efficiency}%`, background: `linear-gradient(90deg, #e10600, ${effColor})` }} />
          </div>
          <p className="text-[9px] text-gray-600 mt-1">
            {result.efficiency >= 75 ? '✅ Optimal strategy' : result.efficiency >= 50 ? '⚠️ Room for improvement' : '❌ Suboptimal — reconsider tire choice or pit timing'}
          </p>
        </div>

        {/* Stint breakdown */}
        <div>
          <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase mb-2">Stint Breakdown</p>
          <div className="space-y-2">
            {result.stintSummaries.map((s, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#111] border border-[#1a1a1a] rounded-xl px-3 py-2.5">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: TIRE_COLORS[s.tire] ?? '#888' }} />
                <div className="flex-1">
                  <span className="text-xs font-black text-white capitalize">{s.tire}</span>
                  <span className="text-[10px] text-gray-500 ml-2">Laps {s.start}–{s.end} ({s.laps} laps)</span>
                </div>
                <span className="text-xs font-black text-gray-300 tabular-nums">{fmtLap(s.avgLap)} avg</span>
              </div>
            ))}
          </div>
        </div>

        {/* Adjustments */}
        {(result.scAdj !== 0) && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${
            result.scAdj < 0
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <AlertTriangle className="w-3 h-3 shrink-0" />
            Safety car response: {result.scAdj < 0 ? `${Math.abs(result.scAdj)}s saved` : `+${result.scAdj}s lost`}
          </div>
        )}
      </div>
    </div>
  );
}
