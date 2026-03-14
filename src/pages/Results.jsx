import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { isPast, parseISO } from 'date-fns';
import { Trophy, Flag, CheckCircle, XCircle, Minus } from 'lucide-react';

const TIRE_COLORS = { soft: '#e10600', medium: '#ffd700', hard: '#aaa' };
const TIRE_ICONS = { soft: '🔴', medium: '🟡', hard: '⚪' };

function ScoreBar({ label, earned, max, color = '#e10600' }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-xs text-gray-400 w-32 shrink-0">{label}</span>
      <div className="flex-1 bg-[#222] rounded-full h-2">
        <div className="h-2 rounded-full transition-all" style={{ width: `${(earned / max) * 100}%`, background: color }} />
      </div>
      <span className="text-xs font-bold text-white w-12 text-right">{earned}/{max}</span>
    </div>
  );
}

function calcScore(strategy, actual) {
  let score = 0;
  const breakdown = { pit_timing: 0, tire_strategy: 0, num_stops: 0, starting_compound: 0, safety_car: 0 };
  if (!actual) return { score, breakdown };

  // Starting compound
  if (strategy.starting_tire === actual.starting_tire) { breakdown.starting_compound = 10; score += 10; }

  // Number of pit stops
  const userStops = [strategy.pit_stop_1_lap, strategy.pit_stop_2_lap, strategy.pit_stop_3_lap].filter(Boolean).length;
  if (userStops === actual.total_pit_stops) { breakdown.num_stops = 10; score += 10; }

  // Pit timing (within 2 laps = full points, within 5 = half)
  const userLaps = [strategy.pit_stop_1_lap, strategy.pit_stop_2_lap, strategy.pit_stop_3_lap].filter(Boolean);
  let pitPoints = 0;
  (actual.pit_laps || []).forEach(actualLap => {
    const closest = Math.min(...userLaps.map(l => Math.abs(l - actualLap)));
    if (closest <= 2) pitPoints += 20;
    else if (closest <= 5) pitPoints += 10;
  });
  breakdown.pit_timing = Math.min(pitPoints, 20);
  score += breakdown.pit_timing;

  // Tire strategy
  const userTires = [strategy.pit_stop_1_tire, strategy.pit_stop_2_tire, strategy.pit_stop_3_tire].filter(Boolean);
  const actualTires = actual.tire_sequence || [];
  let tireMatches = 0;
  actualTires.forEach((t, i) => { if (userTires[i] === t) tireMatches++; });
  breakdown.tire_strategy = tireMatches > 0 ? Math.floor((tireMatches / Math.max(actualTires.length, 1)) * 15) : 0;
  score += breakdown.tire_strategy;

  // Safety car
  if (actual.had_safety_car !== undefined && strategy.safety_car_response !== 'none') {
    if (actual.had_safety_car && strategy.safety_car_response === 'pit') { breakdown.safety_car = 5; score += 5; }
    else if (!actual.had_safety_car && strategy.safety_car_response === 'stay') { breakdown.safety_car = 5; score += 5; }
  }

  return { score, breakdown };
}

export default function Results() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list('-date', 30),
  });

  const completedRaces = races.filter(r => r.actual_results?.race_completed);

  const { data: strategies = [] } = useQuery({
    queryKey: ['my-strategies', user?.id],
    queryFn: () => base44.entities.Strategy.filter({ user_id: user.id }),
    enabled: !!user,
  });

  if (!user) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-black text-white mb-1">Results</h1>
      <p className="text-gray-400 text-sm mb-5">See how your strategies performed.</p>

      {completedRaces.length === 0 && (
        <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center">
          <Flag className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No completed races yet.</p>
          <p className="text-gray-600 text-sm mt-1">Results will appear after race weekend.</p>
        </div>
      )}

      <div className="space-y-4">
        {completedRaces.map(race => {
          const myStrategy = strategies.find(s => s.race_id === race.id);
          const actual = race.actual_results;
          const { score, breakdown } = myStrategy ? calcScore(myStrategy, actual) : { score: 0, breakdown: {} };
          const maxScore = 60;

          return (
            <div key={race.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
              {/* Race header */}
              <div className="bg-gradient-to-r from-[#1a0000] to-[#1a1a1a] p-4 border-b border-[#2a2a2a]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-black text-white">{race.name}</h2>
                    <p className="text-xs text-gray-400">{race.circuit} · {new Date(race.date).toLocaleDateString()}</p>
                  </div>
                  {myStrategy ? (
                    <div className="text-right">
                      <div className="text-2xl font-black text-[#e10600]">{score}</div>
                      <div className="text-xs text-gray-400">/ {maxScore} pts</div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 bg-[#111] px-2 py-1 rounded">No entry</span>
                  )}
                </div>
              </div>

              <div className="p-4 grid grid-cols-2 gap-4">
                {/* Actual result */}
                <div>
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest mb-2">ACTUAL STRATEGY</p>
                  <p className="text-xs text-white font-semibold mb-1">{actual.winner} ({actual.team})</p>
                  <p className="text-xs text-gray-400">Start: <span style={{ color: TIRE_COLORS[actual.starting_tire] }}>{TIRE_ICONS[actual.starting_tire]} {actual.starting_tire}</span></p>
                  <p className="text-xs text-gray-400 mt-1">Pits: Laps {(actual.pit_laps || []).join(', ')}</p>
                  {actual.had_safety_car && <p className="text-xs text-yellow-400 mt-1">⚠️ Safety car deployed</p>}
                </div>

                {/* My strategy */}
                <div>
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest mb-2">YOUR STRATEGY</p>
                  {myStrategy ? (
                    <>
                      <p className="text-xs text-gray-400">Start: <span style={{ color: TIRE_COLORS[myStrategy.starting_tire] }}>{TIRE_ICONS[myStrategy.starting_tire]} {myStrategy.starting_tire}</span></p>
                      <p className="text-xs text-gray-400 mt-1">
                        Pits: {[myStrategy.pit_stop_1_lap, myStrategy.pit_stop_2_lap, myStrategy.pit_stop_3_lap].filter(Boolean).join(', ') || 'None'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">SC: {myStrategy.safety_car_response}</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No strategy submitted</p>
                  )}
                </div>
              </div>

              {myStrategy && (
                <div className="px-4 pb-4">
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest mb-2">SCORE BREAKDOWN</p>
                  <ScoreBar label="Starting Compound" earned={breakdown.starting_compound || 0} max={10} />
                  <ScoreBar label="Pit Timing" earned={breakdown.pit_timing || 0} max={20} />
                  <ScoreBar label="Tire Strategy" earned={breakdown.tire_strategy || 0} max={15} />
                  <ScoreBar label="Number of Stops" earned={breakdown.num_stops || 0} max={10} />
                  <ScoreBar label="Safety Car" earned={breakdown.safety_car || 0} max={5} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}