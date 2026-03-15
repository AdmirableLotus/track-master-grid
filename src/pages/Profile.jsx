import { useState, useEffect } from 'react';
import { db } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Trophy, Flag, Target, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const F1_TEAMS = [
  'Red Bull Racing','Ferrari','Mercedes','McLaren','Aston Martin',
  'Alpine','Williams','Haas','Kick Sauber','RB',
];

const TIRE_COLORS = { soft: '#e10600', medium: '#ffd700', hard: '#aaa' };

export default function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ favorite_team: '', bio: '' });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const all = await db.entities.Profile.filter({ user_id: user.id });
      return all[0] || null;
    },
    enabled: !!user,
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['my-strategies', user?.id],
    queryFn: () => db.entities.Strategy.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => db.entities.Race.list('round', 30),
  });

  useEffect(() => {
    if (profile) setForm({ favorite_team: profile.favorite_team || '', bio: profile.bio || '' });
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = { ...form, user_id: user.id, username: user.full_name || user.email };
      if (profile) return db.entities.Profile.update(profile.id, data);
      return db.entities.Profile.create(data);
    },
    onSuccess: () => {
      toast.success('Profile updated!');
      setEditing(false);
      qc.invalidateQueries(['profile', user?.id]);
    },
  });

  const submitted = strategies.filter(s => s.submitted);
  const scored = submitted.filter(s => s.score != null);
  const totalScore = scored.reduce((sum, s) => sum + (s.score || 0), 0);
  const avgScore = scored.length ? Math.round(totalScore / scored.length) : 0;
  const wins = scored.filter(s => s.score >= 50).length;
  const winRate = scored.length ? Math.round((wins / scored.length) * 100) : 0;

  const completedRaces = races.filter(r => r.actual_results?.race_completed);
  const participated = completedRaces.filter(r => strategies.find(s => s.race_id === r.id && s.submitted));

  if (!user) return null;

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Header card */}
      <div className="bg-gradient-to-br from-[#1a0000] to-[#111] border border-[#e10600]/30 rounded-2xl p-5 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#e10600]/20 border-2 border-[#e10600]/50 flex items-center justify-center">
              <span className="text-2xl font-black text-[#e10600]">
                {(user.full_name || user.email || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-black text-white">{user.full_name || user.email}</h1>
              <p className="text-xs text-gray-400">@{user.username || user.email?.split('@')[0]}</p>
              {profile?.favorite_team && (
                <span className="text-[10px] font-black text-[#e10600] tracking-widest">{profile.favorite_team}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setEditing(e => !e)}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            {editing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </button>
        </div>

        {profile?.bio && !editing && (
          <p className="text-sm text-gray-300 mb-3 italic">"{profile.bio}"</p>
        )}

        {editing && (
          <div className="space-y-3 mb-3">
            <div>
              <label className="text-[10px] text-gray-400 font-bold tracking-widest block mb-1">FAVOURITE TEAM</label>
              <select
                value={form.favorite_team}
                onChange={e => setForm(f => ({ ...f, favorite_team: e.target.value }))}
                className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-3 py-2 text-sm"
              >
                <option value="">Select team…</option>
                {F1_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold tracking-widest block mb-1">BIO</label>
              <input
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="e.g. Undercut specialist since 2010…"
                maxLength={80}
                className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full bg-[#e10600] text-white rounded-xl py-2 font-bold text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Save Profile
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { icon: Flag,   label: 'Races Entered',  value: submitted.length },
          { icon: Trophy, label: 'Total Points',    value: totalScore },
          { icon: Target, label: 'Avg Score',       value: `${avgScore} pts` },
          { icon: User,   label: 'Win Rate',        value: `${winRate}%` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <Icon className="w-4 h-4 text-[#e10600] mb-2" />
            <p className="text-xl font-black text-white">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Race history */}
      {participated.length > 0 && (
        <>
          <p className="text-[10px] font-black text-gray-500 tracking-widest mb-3">RACE HISTORY</p>
          <div className="space-y-2">
            {participated.map(race => {
              const strat = strategies.find(s => s.race_id === race.id && s.submitted);
              return (
                <div key={race.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 flex items-center gap-3">
                  <span className="text-xl">{race.flag_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{race.name}</p>
                    <p className="text-xs text-gray-500">
                      Start: <span style={{ color: TIRE_COLORS[strat?.starting_tire] }}>{strat?.starting_tire}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-[#e10600]">{strat?.score ?? '—'}</p>
                    <p className="text-[10px] text-gray-500">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {submitted.length === 0 && (
        <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center">
          <Flag className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No strategies submitted yet.</p>
          <p className="text-gray-600 text-sm mt-1">Submit your first strategy to build your profile.</p>
        </div>
      )}
    </div>
  );
}
