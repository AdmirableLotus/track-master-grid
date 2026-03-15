import { useState } from 'react';
import { db } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Map, ChevronRight, Zap, Clock, RotateCcw, ArrowRight } from 'lucide-react';
import TrackSVG from '@/components/pitwall/TrackSVG';

export default function TrackInfo() {
  const [selectedId, setSelectedId] = useState(null);

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => db.entities.Race.list('round', 30),
  });

  const selected = races.find(r => r.id === selectedId);

  if (selected) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm">
          ← Back to Circuits
        </button>
        <h1 className="text-2xl font-black text-white">{selected.circuit}</h1>
        <p className="text-gray-400 text-sm mb-4">{selected.name} · {selected.country} {selected.flag_emoji}</p>

        {/* Track SVG */}
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a] mb-4">
          <TrackSVG trackKey={selected.track_key || selected.circuit} />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Race Laps', value: selected.laps, icon: RotateCcw },
            { label: 'Lap Length', value: selected.lap_length_km ? `${selected.lap_length_km} km` : '—', icon: ArrowRight },
            { label: 'DRS Zones', value: selected.drs_zones ?? '—', icon: Zap },
            { label: 'Pit Loss', value: selected.pit_lane_time_loss ? `${selected.pit_lane_time_loss}s` : '—', icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <Icon className="w-4 h-4 text-[#e10600] mb-2" />
              <p className="text-xl font-black text-white">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {selected.track_description && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-gray-400 tracking-widest mb-2">ABOUT THIS CIRCUIT</p>
            <p className="text-sm text-gray-300 leading-relaxed">{selected.track_description}</p>
          </div>
        )}

        {selected.typical_strategy && (
          <div className="bg-[#1a0000] border border-[#e10600]/30 rounded-xl p-4">
            <p className="text-xs font-bold text-[#e10600] tracking-widest mb-2">TYPICAL STRATEGY</p>
            <p className="text-sm text-gray-300 leading-relaxed">{selected.typical_strategy}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Map className="w-6 h-6 text-[#e10600]" />
        <div>
          <h1 className="text-xl font-black text-white">Circuits</h1>
          <p className="text-gray-400 text-xs">{races.length} tracks this season</p>
        </div>
      </div>

      {races.length === 0 && (
        <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center">
          <Map className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No circuits loaded yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {races.map(r => (
          <button
            key={r.id}
            onClick={() => setSelectedId(r.id)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#e10600]/40 rounded-xl p-4 flex items-center gap-4 text-left transition-colors"
          >
            <div className="w-8 text-center text-2xl shrink-0">{r.flag_emoji || '🏁'}</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate">{r.circuit}</p>
              <p className="text-xs text-gray-400 truncate">{r.name} · Rd {r.round}</p>
            </div>
            <div className="text-right shrink-0 w-16">
              <p className="text-xs text-gray-400">{r.laps ?? '—'} laps</p>
              <p className="text-xs text-[#e10600]">{r.drs_zones ?? '—'} DRS</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}