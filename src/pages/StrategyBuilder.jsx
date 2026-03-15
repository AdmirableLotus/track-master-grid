import { useState, useEffect } from 'react';
import { db } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isPast, parseISO } from 'date-fns';
import TireSelector from '@/components/pitwall/TireSelector';
import PitStopPlanner from '@/components/pitwall/PitStopPlanner';
import TireDegradationChart from '@/components/pitwall/TireDegradationChart';
import StrategyTimeline from '@/components/pitwall/StrategyTimeline';
import DriverSelector from '@/components/pitwall/DriverSelector';
import RaceTimeProjection from '@/components/pitwall/RaceTimeProjection';
import { CheckCircle, Lock } from 'lucide-react';
import RaceWeather from '@/components/pitwall/RaceWeather';
import { toast } from 'sonner';

export default function StrategyBuilder() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedRaceId, setSelectedRaceId] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [strategy, setStrategy] = useState({
    starting_tire: 'medium',
    pit_stop_1_lap: null, pit_stop_1_tire: 'hard',
    pit_stop_2_lap: null, pit_stop_2_tire: null,
    pit_stop_3_lap: null, pit_stop_3_tire: null,
    safety_car_response: 'none',
    risk_level: 'moderate',
  });

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => db.entities.Race.list('-date', 30),
  });

  const upcomingRaces = races
    .filter(r => !isPast(parseISO(r.date)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const displayRaces = upcomingRaces.length > 0
    ? upcomingRaces
    : [...races].sort((a, b) => new Date(b.date) - new Date(a.date));

  const selectedRace = races.find(r => r.id === selectedRaceId) || displayRaces[0];

  const { data: existingStrategy } = useQuery({
    queryKey: ['strategy', selectedRace?.id, user?.id],
    queryFn: () => db.entities.Strategy.filter({ race_id: selectedRace.id, user_id: user.id }),
    enabled: !!selectedRace && !!user,
    select: d => d[0],
  });

  useEffect(() => {
    if (existingStrategy) {
      setStrategy({
        starting_tire: existingStrategy.starting_tire || 'medium',
        pit_stop_1_lap: existingStrategy.pit_stop_1_lap || null,
        pit_stop_1_tire: existingStrategy.pit_stop_1_tire || 'hard',
        pit_stop_2_lap: existingStrategy.pit_stop_2_lap || null,
        pit_stop_2_tire: existingStrategy.pit_stop_2_tire || null,
        pit_stop_3_lap: existingStrategy.pit_stop_3_lap || null,
        pit_stop_3_tire: existingStrategy.pit_stop_3_tire || null,
        safety_car_response: existingStrategy.safety_car_response || 'none',
        risk_level: existingStrategy.risk_level || 'moderate',
      });
    }
  }, [existingStrategy]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const data = {
        ...strategy,
        race_id: selectedRace.id,
        user_id: user.id,
        username: user.full_name || user.email,
        submitted: true,
      };
      if (existingStrategy) return db.entities.Strategy.update(existingStrategy.id, data);
      return db.entities.Strategy.create(data);
    },
    onSuccess: () => {
      toast.success('Strategy submitted! 🏁');
      qc.invalidateQueries(['strategy']);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        ...strategy,
        race_id: selectedRace.id,
        user_id: user.id,
        username: user.full_name || user.email,
        submitted: false,
      };
      if (existingStrategy) return db.entities.Strategy.update(existingStrategy.id, data);
      return db.entities.Strategy.create(data);
    },
    onSuccess: () => {
      toast.success('Draft saved');
      qc.invalidateQueries(['strategy']);
    },
  });

  const isLocked = existingStrategy?.submitted;
  const [liveWeather, setLiveWeather] = useState(null);
  const effectiveWeather = liveWeather || selectedRace?.weather_forecast || 'dry';

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-black text-white mb-1">Strategy Builder</h1>
      <p className="text-gray-400 text-sm mb-4">Think like a race engineer.</p>

      <div className="mb-5">
        <label className="text-xs text-gray-400 font-bold tracking-widest uppercase block mb-2">Select Race</label>
        <select
          className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-xl px-4 py-3 text-sm"
          value={selectedRace?.id || ''}
          onChange={e => setSelectedRaceId(e.target.value)}
        >
          {displayRaces.map(r => (
            <option key={r.id} value={r.id}>{r.name} — {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</option>
          ))}
          {displayRaces.length === 0 && <option disabled>No races found — add races in Admin</option>}
        </select>
      </div>

      {selectedRace && (
        <>
          <RaceWeather race={selectedRace} onConditionResolved={setLiveWeather} />

          {isLocked && (
            <div className="bg-[#1a0a00] border border-orange-500/40 rounded-xl p-3 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 text-sm font-semibold">Strategy submitted — locked until race completes.</span>
            </div>
          )}

          <div className="mb-5">
            <label className="text-xs text-gray-400 font-bold tracking-widest uppercase block mb-3">Assign Driver</label>
            <DriverSelector value={selectedDriver} onChange={setSelectedDriver} />
          </div>

          <div className="mb-5">
            <label className="text-xs text-gray-400 font-bold tracking-widest uppercase block mb-3">Starting Compound</label>
            <TireSelector
              value={strategy.starting_tire}
              onChange={v => !isLocked && setStrategy(s => ({ ...s, starting_tire: v }))}
              compounds={selectedRace.available_compounds || ['soft', 'medium', 'hard']}
            />
          </div>

          <div className="mb-5">
            <label className="text-xs text-gray-400 font-bold tracking-widest uppercase block mb-3">Pit Stop Plan</label>
            <PitStopPlanner
              strategy={strategy}
              onChange={v => !isLocked && setStrategy(s => ({ ...s, ...v }))}
              totalLaps={selectedRace.laps}
              compounds={selectedRace.available_compounds || ['soft', 'medium', 'hard']}
              disabled={isLocked}
            />
          </div>

          <div className="mb-5">
            <StrategyTimeline strategy={strategy} totalLaps={selectedRace.laps} weather={effectiveWeather} />
          </div>

          <div className="mb-5">
            <label className="text-xs text-gray-400 font-bold tracking-widest uppercase block mb-3">Predicted Tire Life</label>
            <TireDegradationChart strategy={strategy} totalLaps={selectedRace.laps} weather={effectiveWeather} driver={selectedDriver} />
          </div>

          {selectedDriver && (
            <div className="mb-5">
              <label className="text-xs text-gray-400 font-bold tracking-widest uppercase block mb-3">Driver Impact Estimate</label>
              <RaceTimeProjection driver={selectedDriver} strategy={strategy} totalLaps={selectedRace.laps} weather={effectiveWeather} />
            </div>
          )}

          <div className="mb-5">
            <label className="text-xs text-gray-400 font-bold tracking-widest uppercase block mb-3">Safety Car Response</label>
            <div className="flex gap-2">
              {['pit', 'stay', 'none'].map(opt => (
                <button
                  key={opt}
                  disabled={isLocked}
                  onClick={() => setStrategy(s => ({ ...s, safety_car_response: opt }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize border transition-colors ${
                    strategy.safety_car_response === opt
                      ? 'bg-[#e10600] border-[#e10600] text-white'
                      : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {opt === 'pit' ? '🔧 Pit' : opt === 'stay' ? '🚀 Stay Out' : '❓ No Plan'}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs text-gray-400 font-bold tracking-widest uppercase block mb-3">Risk Level</label>
            <div className="flex gap-2">
              {['conservative', 'moderate', 'aggressive'].map(r => (
                <button
                  key={r}
                  disabled={isLocked}
                  onClick={() => setStrategy(s => ({ ...s, risk_level: r }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border transition-colors ${
                    strategy.risk_level === r
                      ? 'bg-[#e10600] border-[#e10600] text-white'
                      : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {r === 'conservative' ? '🛡️' : r === 'moderate' ? '⚖️' : '🔥'} {r}
                </button>
              ))}
            </div>
          </div>

          {!isLocked && (
            <div className="flex gap-3">
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="flex-1 bg-[#1a1a1a] border border-[#333] text-white rounded-xl py-3 font-bold text-sm hover:border-gray-500 transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                className="flex-1 bg-[#e10600] hover:bg-[#c10500] text-white rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Submit Strategy
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
