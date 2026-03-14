import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp, Save, X } from 'lucide-react';

const EMPTY_RACE = {
  name: '', circuit: '', country: '', flag_emoji: '', date: '',
  laps: '', lap_length_km: '', pit_lane_time_loss: '', round: '',
  drs_zones: '', weather_forecast: 'dry',
  available_compounds: ['soft', 'medium', 'hard'],
  track_description: '', typical_strategy: '',
};

function RaceForm({ initial = EMPTY_RACE, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-[10px] text-gray-400 font-bold tracking-widest">RACE NAME *</label>
          <input className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Monaco Grand Prix" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-bold tracking-widest">CIRCUIT *</label>
          <input className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={form.circuit} onChange={e => set('circuit', e.target.value)} placeholder="Circuit de Monaco" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-bold tracking-widest">COUNTRY</label>
          <input className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={form.country} onChange={e => set('country', e.target.value)} placeholder="Monaco" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-bold tracking-widest">FLAG EMOJI</label>
          <input className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={form.flag_emoji} onChange={e => set('flag_emoji', e.target.value)} placeholder="🇲🇨" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-bold tracking-widest">RACE DATE *</label>
          <input type="date" className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-bold tracking-widest">ROUND #</label>
          <input type="number" className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={form.round} onChange={e => set('round', e.target.value)} placeholder="1" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-bold tracking-widest">TOTAL LAPS *</label>
          <input type="number" className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={form.laps} onChange={e => set('laps', e.target.value)} placeholder="78" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-bold tracking-widest">LAP LENGTH (km)</label>
          <input type="number" step="0.001" className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={form.lap_length_km} onChange={e => set('lap_length_km', e.target.value)} placeholder="3.337" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-bold tracking-widest">PIT LOSS (sec)</label>
          <input type="number" className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={form.pit_lane_time_loss} onChange={e => set('pit_lane_time_loss', e.target.value)} placeholder="29" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-bold tracking-widest">DRS ZONES</label>
          <input type="number" className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={form.drs_zones} onChange={e => set('drs_zones', e.target.value)} placeholder="1" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-bold tracking-widest">WEATHER</label>
          <select className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1" value={form.weather_forecast} onChange={e => set('weather_forecast', e.target.value)}>
            <option value="dry">Dry</option>
            <option value="wet">Wet</option>
            <option value="mixed">Mixed</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-[10px] text-gray-400 font-bold tracking-widest">TRACK DESCRIPTION</label>
          <textarea className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1 h-20 resize-none" value={form.track_description} onChange={e => set('track_description', e.target.value)} placeholder="Brief circuit description..." />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] text-gray-400 font-bold tracking-widest">TYPICAL STRATEGY</label>
          <textarea className="w-full bg-[#111] border border-[#444] text-white rounded-lg px-3 py-2 text-sm mt-1 h-16 resize-none" value={form.typical_strategy} onChange={e => set('typical_strategy', e.target.value)} placeholder="e.g. One-stop. Medium to Hard most common." />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} className="flex-1 bg-[#111] border border-[#444] text-gray-400 rounded-xl py-2 text-sm font-bold hover:border-gray-500 flex items-center justify-center gap-2">
          <X className="w-4 h-4" /> Cancel
        </button>
        <button onClick={() => onSave(form)} disabled={loading} className="flex-1 bg-[#e10600] hover:bg-[#c10500] text-white rounded-xl py-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors">
          <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Race'}
        </button>
      </div>
    </div>
  );
}

export default function AdminRaces() {
  const [showForm, setShowForm] = useState(false);
  const [editingRace, setEditingRace] = useState(null);
  const qc = useQueryClient();

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list('round', 50),
  });

  const createMutation = useMutation({
    mutationFn: d => base44.entities.Race.create({ ...d, laps: Number(d.laps), lap_length_km: Number(d.lap_length_km), pit_lane_time_loss: Number(d.pit_lane_time_loss), round: Number(d.round), drs_zones: Number(d.drs_zones) }),
    onSuccess: () => { toast.success('Race added!'); setShowForm(false); qc.invalidateQueries(['races']); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Race.update(id, { ...data, laps: Number(data.laps), lap_length_km: Number(data.lap_length_km), pit_lane_time_loss: Number(data.pit_lane_time_loss), round: Number(data.round), drs_zones: Number(data.drs_zones) }),
    onSuccess: () => { toast.success('Race updated!'); setEditingRace(null); qc.invalidateQueries(['races']); },
  });

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.Race.delete(id),
    onSuccess: () => { toast.success('Race deleted'); qc.invalidateQueries(['races']); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-white">Race Calendar ({races.length})</h2>
        <button onClick={() => setShowForm(true)} className="bg-[#e10600] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#c10500]">
          <Plus className="w-4 h-4" /> Add Race
        </button>
      </div>

      {showForm && (
        <RaceForm onSave={d => createMutation.mutate(d)} onCancel={() => setShowForm(false)} loading={createMutation.isPending} />
      )}

      <div className="space-y-2">
        {races.map(race => (
          <div key={race.id}>
            {editingRace?.id === race.id ? (
              <RaceForm
                initial={race}
                onSave={d => updateMutation.mutate({ id: race.id, data: d })}
                onCancel={() => setEditingRace(null)}
                loading={updateMutation.isPending}
              />
            ) : (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">{race.name}</p>
                  <p className="text-xs text-gray-400">{race.circuit} · Rd {race.round} · {new Date(race.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingRace(race)} className="p-2 text-gray-400 hover:text-white">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if (confirm('Delete this race?')) deleteMutation.mutate(race.id); }} className="p-2 text-gray-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}