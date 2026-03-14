import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, CheckCircle } from 'lucide-react';

const TIRE_OPTS = ['soft', 'medium', 'hard'];

export default function AdminResults() {
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [results, setResults] = useState({
    winner: '', team: '', starting_tire: 'medium',
    pit_laps: '', tire_sequence: '',
    total_pit_stops: '', had_safety_car: false, race_completed: false,
  });
  const qc = useQueryClient();

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list('round', 50),
  });

  const selectedRace = races.find(r => r.id === selectedRaceId);

  // Pre-fill if results already exist
  const handleRaceSelect = (id) => {
    setSelectedRaceId(id);
    const race = races.find(r => r.id === id);
    if (race?.actual_results) {
      const ar = race.actual_results;
      setResults({
        winner: ar.winner || '',
        team: ar.team || '',
        starting_tire: ar.starting_tire || 'medium',
        pit_laps: (ar.pit_laps || []).join(', '),
        tire_sequence: (ar.tire_sequence || []).join(', '),
        total_pit_stops: ar.total_pit_stops ?? '',
        had_safety_car: ar.had_safety_car || false,
        race_completed: ar.race_completed || false,
      });
    } else {
      setResults({ winner: '', team: '', starting_tire: 'medium', pit_laps: '', tire_sequence: '', total_pit_stops: '', had_safety_car: false, race_completed: false });
    }
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const actual_results = {
        winner: results.winner,
        team: results.team,
        starting_tire: results.starting_tire,
        pit_laps: results.pit_laps.split(',').map(s => parseInt(s.trim())).filter(Boolean),
        tire_sequence: results.tire_sequence.split(',').map(s => s.trim()).filter(Boolean),
        total_pit_stops: parseInt(results.total_pit_stops) || 0,
        had_safety_car: results.had_safety_car,
        race_completed: results.race_completed,
      };
      return base44.entities.Race.update(selectedRaceId, { actual_results });
    },
    onSuccess: () => {
      toast.success('Results saved! Strategies will now be scored.');
      qc.invalidateQueries(['races']);
    },
  });

  const set = (k, v) => setResults(r => ({ ...r, [k]: v }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-black text-white mb-3">Enter Race Results</h2>
        <select
          className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-xl px-4 py-3 text-sm"
          value={selectedRaceId}
          onChange={e => handleRaceSelect(e.target.value)}
        >
          <option value="">Select a race...</option>
          {races.map(r => (
            <option key={r.id} value={r.id}>
              {r.name} {r.actual_results?.race_completed ? '✅' : ''}
            </option>
          ))}
        </select>
      </div>

      {selectedRaceId && (
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-[#e10600] tracking-widest">WINNING STRATEGY</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] text-gray-400 font-bold tracking-widest">RACE WINNER</label>
                <input className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={results.winner} onChange={e => set('winner', e.target.value)} placeholder="Max Verstappen" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold tracking-widest">TEAM</label>
                <input className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={results.team} onChange={e => set('team', e.target.value)} placeholder="Red Bull Racing" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold tracking-widest">STARTING TIRE</label>
                <select className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={results.starting_tire} onChange={e => set('starting_tire', e.target.value)}>
                  {TIRE_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold tracking-widest">PIT STOP LAPS (comma separated)</label>
                <input className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={results.pit_laps} onChange={e => set('pit_laps', e.target.value)} placeholder="18, 39" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold tracking-widest">TIRE SEQUENCE (comma separated)</label>
                <input className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={results.tire_sequence} onChange={e => set('tire_sequence', e.target.value)} placeholder="medium, hard" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold tracking-widest">TOTAL PIT STOPS</label>
                <input type="number" className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={results.total_pit_stops} onChange={e => set('total_pit_stops', e.target.value)} placeholder="2" />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={results.had_safety_car} onChange={e => set('had_safety_car', e.target.checked)} className="w-4 h-4 accent-[#e10600]" />
                <span className="text-sm text-gray-300">Safety Car deployed</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={results.race_completed} onChange={e => set('race_completed', e.target.checked)} className="w-4 h-4 accent-[#e10600]" />
                <span className="text-sm text-gray-300">Race completed</span>
              </label>
            </div>
          </div>

          {results.race_completed && (
            <div className="bg-[#0a1a00] border border-green-500/30 rounded-xl p-3">
              <p className="text-green-400 text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Marking as completed will trigger score calculation for all user strategies.
              </p>
            </div>
          )}

          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full bg-[#e10600] hover:bg-[#c10500] text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Results'}
          </button>
        </div>
      )}
    </div>
  );
}