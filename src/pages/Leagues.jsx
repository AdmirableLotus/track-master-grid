import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Plus, Users, Copy, Check, LogIn, Crown, Star, ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const TIRE_COLORS = { soft: '#e10600', medium: '#ffd700', hard: '#aaa' };

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function MiniLeaderboard({ league, strategies }) {
  const scoremap = {};
  (strategies || []).forEach(s => {
    if (!s.username || !league.member_ids?.includes(s.user_id)) return;
    if (!scoremap[s.user_id]) scoremap[s.user_id] = { username: s.username, total: 0, races: 0 };
    scoremap[s.user_id].total += s.score || 0;
    scoremap[s.user_id].races += 1;
  });

  // Include members with 0 points too
  (league.member_ids || []).forEach((uid, i) => {
    if (!scoremap[uid]) scoremap[uid] = { username: league.member_usernames?.[i] || 'Unknown', total: 0, races: 0 };
  });

  const rankings = Object.values(scoremap).sort((a, b) => b.total - a.total);

  const icons = [Crown, Trophy, Star];

  return (
    <div className="space-y-2 mt-3">
      {rankings.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-3">No members yet.</p>
      )}
      {rankings.map(({ username, total, races }, i) => {
        const Icon = icons[i] || Star;
        const isTop = i < 3;
        const colors = ['text-yellow-400', 'text-gray-300', 'text-orange-400'];
        return (
          <div key={username} className="flex items-center gap-3 bg-[#111] rounded-xl px-3 py-2">
            <span className={`w-6 h-6 flex items-center justify-center text-xs font-black ${isTop ? colors[i] : 'text-gray-500'}`}>
              {isTop ? <Icon className="w-3.5 h-3.5" /> : i + 1}
            </span>
            <span className="flex-1 text-sm font-bold text-white truncate">{username}</span>
            <span className="text-xs text-gray-500">{races}R</span>
            <span className={`text-sm font-black ${isTop ? colors[i] : 'text-gray-400'}`}>{total} pts</span>
          </div>
        );
      })}
    </div>
  );
}

function LeagueCard({ league, currentUser, strategies, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const copyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(league.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Invite code copied!');
  };

  const isCreator = league.creator_id === currentUser?.id;

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-black text-white text-base">{league.name}</h3>
            <p className="text-xs text-gray-500">{league.member_ids?.length || 0} member{(league.member_ids?.length || 0) !== 1 ? 's' : ''} · created by {league.creator_username}</p>
          </div>
          <div className="flex items-center gap-2">
            {isCreator && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(league); }}
                className="text-gray-600 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-[10px] font-black tracking-widest px-2 py-1 rounded-lg bg-[#e10600]/10 text-[#e10600] border border-[#e10600]/20">
              {expanded ? '▲' : '▼'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#111] rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-gray-400 tracking-widest font-mono">Invite: <span className="text-white font-black">{league.invite_code}</span></span>
            <button onClick={copyCode} className="text-gray-400 hover:text-white transition-colors ml-2">
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#222] pt-3">
          <p className="text-[10px] text-gray-500 font-bold tracking-widest mb-1">LEADERBOARD</p>
          <MiniLeaderboard league={league} strategies={strategies} />
        </div>
      )}
    </div>
  );
}

export default function Leagues() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('my');
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const qc = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: allLeagues = [] } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => base44.entities.League.list('-created_date', 200),
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['all-strategies'],
    queryFn: () => base44.entities.Strategy.filter({ submitted: true }),
  });

  const myLeagues = allLeagues.filter(l =>
    l.creator_id === user?.id || l.member_ids?.includes(user?.id)
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!newName.trim()) throw new Error('Enter a league name');
      const code = generateCode();
      return base44.entities.League.create({
        name: newName.trim(),
        invite_code: code,
        creator_id: user.id,
        creator_username: user.full_name || user.email,
        member_ids: [user.id],
        member_usernames: [user.full_name || user.email],
      });
    },
    onSuccess: (league) => {
      toast.success(`League "${league.name}" created! Code: ${league.invite_code}`);
      setNewName('');
      setTab('my');
      qc.invalidateQueries(['leagues']);
    },
    onError: (e) => toast.error(e.message),
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const code = joinCode.trim().toUpperCase();
      const league = allLeagues.find(l => l.invite_code === code);
      if (!league) throw new Error('League not found. Check the code and try again.');
      if (league.member_ids?.includes(user.id)) throw new Error('You\'re already in this league!');
      return base44.entities.League.update(league.id, {
        member_ids: [...(league.member_ids || []), user.id],
        member_usernames: [...(league.member_usernames || []), user.full_name || user.email],
      });
    },
    onSuccess: () => {
      toast.success('Joined league! 🏎️');
      setJoinCode('');
      setTab('my');
      qc.invalidateQueries(['leagues']);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (league) => base44.entities.League.delete(league.id),
    onSuccess: () => {
      toast.success('League deleted');
      qc.invalidateQueries(['leagues']);
    },
  });

  if (!user) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Users className="w-6 h-6 text-[#e10600]" />
        <div>
          <h1 className="text-xl font-black text-white">Private Leagues</h1>
          <p className="text-gray-400 text-xs">Compete with your inner circle</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#111] rounded-xl p-1 mb-5">
        {[
          { key: 'my', label: 'My Leagues' },
          { key: 'create', label: 'Create' },
          { key: 'join', label: 'Join' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              tab === key ? 'bg-[#e10600] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* My Leagues */}
      {tab === 'my' && (
        <div>
          {myLeagues.length === 0 ? (
            <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center">
              <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-bold">No leagues yet</p>
              <p className="text-gray-600 text-sm mt-1">Create one or join with an invite code</p>
              <div className="flex gap-3 justify-center mt-4">
                <button onClick={() => setTab('create')} className="text-xs bg-[#e10600] text-white px-4 py-2 rounded-xl font-bold">Create League</button>
                <button onClick={() => setTab('join')} className="text-xs bg-[#222] text-white px-4 py-2 rounded-xl font-bold border border-[#333]">Join League</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {myLeagues.map(league => (
                <LeagueCard
                  key={league.id}
                  league={league}
                  currentUser={user}
                  strategies={strategies}
                  onDelete={deleteMutation.mutate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create League */}
      {tab === 'create' && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
          <h2 className="font-black text-white mb-1 flex items-center gap-2"><Plus className="w-4 h-4 text-[#e10600]" /> New League</h2>
          <p className="text-gray-500 text-xs mb-4">A unique invite code is generated automatically.</p>
          <label className="text-[10px] text-gray-400 font-bold tracking-widest block mb-2">LEAGUE NAME</label>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createMutation.mutate()}
            placeholder="e.g. The Tifosi, Grid Warriors…"
            className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-[#e10600]/50"
            maxLength={40}
          />
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !newName.trim()}
            className="w-full bg-[#e10600] hover:bg-[#c10500] disabled:opacity-40 text-white rounded-xl py-3 font-black text-sm transition-colors"
          >
            {createMutation.isPending ? 'Creating…' : 'Create League'}
          </button>
        </div>
      )}

      {/* Join League */}
      {tab === 'join' && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
          <h2 className="font-black text-white mb-1 flex items-center gap-2"><LogIn className="w-4 h-4 text-[#e10600]" /> Join a League</h2>
          <p className="text-gray-500 text-xs mb-4">Enter the 6-character code shared by a friend.</p>
          <label className="text-[10px] text-gray-400 font-bold tracking-widest block mb-2">INVITE CODE</label>
          <input
            type="text"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && joinMutation.mutate()}
            placeholder="e.g. A1B2C3"
            className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-3 text-sm mb-4 font-mono tracking-widest text-center focus:outline-none focus:border-[#e10600]/50 uppercase"
            maxLength={6}
          />
          <button
            onClick={() => joinMutation.mutate()}
            disabled={joinMutation.isPending || joinCode.length < 6}
            className="w-full bg-[#e10600] hover:bg-[#c10500] disabled:opacity-40 text-white rounded-xl py-3 font-black text-sm transition-colors"
          >
            {joinMutation.isPending ? 'Joining…' : 'Join League'}
          </button>
        </div>
      )}
    </div>
  );
}