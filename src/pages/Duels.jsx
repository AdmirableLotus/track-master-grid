import { useState } from 'react';
import { db } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Swords, Plus, CheckCircle, Clock, Trophy, XCircle } from 'lucide-react';
import { isPast, parseISO } from 'date-fns';
import { toast } from 'sonner';

const STATUS_STYLES = {
  pending:  { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', label: 'Pending' },
  accepted: { color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/30',   label: 'Active' },
  complete: { color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30',  label: 'Complete' },
  declined: { color: 'text-gray-500',   bg: 'bg-gray-500/10',   border: 'border-gray-500/30',   label: 'Declined' },
};

function DuelCard({ duel, currentUser, strategies, onAccept, onDecline }) {
  const isChallenger = duel.challenger_id === currentUser.id;
  const opponent = isChallenger ? duel.opponent_username : duel.challenger_username;
  const style = STATUS_STYLES[duel.status] || STATUS_STYLES.pending;

  // Find scores if complete
  const myStrategy = strategies.find(s =>
    s.race_id === duel.race_id && s.user_id === currentUser.id && s.submitted
  );
  const oppStrategy = strategies.find(s =>
    s.race_id === duel.race_id &&
    s.user_id === (isChallenger ? duel.opponent_id : duel.challenger_id) &&
    s.submitted
  );

  const myScore = myStrategy?.score ?? null;
  const oppScore = oppStrategy?.score ?? null;
  const iWin = myScore !== null && oppScore !== null && myScore > oppScore;

  return (
    <div className={`bg-[#1a1a1a] border ${style.border} rounded-2xl overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-[#e10600]" />
            <span className="text-xs font-black text-white">{duel.race_name}</span>
          </div>
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${style.bg} ${style.color} border ${style.border}`}>
            {style.label}
          </span>
        </div>

        {/* VS display */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 bg-[#111] rounded-xl p-3 text-center">
            <p className="text-[10px] text-gray-500 font-bold tracking-widest mb-1">YOU</p>
            <p className="font-black text-white text-sm truncate">{currentUser.username}</p>
            {myScore !== null && (
              <p className={`text-lg font-black mt-1 ${iWin ? 'text-green-400' : 'text-gray-400'}`}>{myScore} pts</p>
            )}
          </div>
          <div className="text-[#e10600] font-black text-lg">VS</div>
          <div className="flex-1 bg-[#111] rounded-xl p-3 text-center">
            <p className="text-[10px] text-gray-500 font-bold tracking-widest mb-1">OPPONENT</p>
            <p className="font-black text-white text-sm truncate">{opponent}</p>
            {oppScore !== null && (
              <p className={`text-lg font-black mt-1 ${!iWin ? 'text-green-400' : 'text-gray-400'}`}>{oppScore} pts</p>
            )}
          </div>
        </div>

        {/* Winner banner */}
        {duel.status === 'complete' && myScore !== null && oppScore !== null && (
          <div className={`rounded-xl p-2 text-center text-xs font-black ${
            iWin ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
            myScore === oppScore ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
            'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {iWin ? '🏆 You won this duel!' : myScore === oppScore ? '🤝 It\'s a tie!' : '💀 You lost this one'}
          </div>
        )}

        {/* Accept/Decline for incoming pending duels */}
        {!isChallenger && duel.status === 'pending' && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onDecline(duel)}
              className="flex-1 bg-[#111] border border-[#333] text-gray-400 rounded-xl py-2 text-xs font-bold hover:border-red-500/40 hover:text-red-400 transition-colors flex items-center justify-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" /> Decline
            </button>
            <button
              onClick={() => onAccept(duel)}
              className="flex-1 bg-[#e10600] hover:bg-[#c10500] text-white rounded-xl py-2 text-xs font-black transition-colors flex items-center justify-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Accept
            </button>
          </div>
        )}

        {isChallenger && duel.status === 'pending' && (
          <p className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" /> Waiting for {opponent} to accept
          </p>
        )}
      </div>
    </div>
  );
}

export default function Duels() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState('my');
  const [opponentUsername, setOpponentUsername] = useState('');
  const [selectedRaceId, setSelectedRaceId] = useState('');

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => db.entities.Race.list('date', 30),
  });

  const { data: allDuels = [] } = useQuery({
    queryKey: ['duels'],
    queryFn: () => db.entities.Duel.list('-created_date', 100),
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['all-strategies'],
    queryFn: () => db.entities.Strategy.filter({ submitted: true }),
  });

  const myDuels = allDuels.filter(d =>
    d.challenger_id === user?.id || d.opponent_id === user?.id
  );

  const upcoming = races
    .filter(r => !isPast(parseISO(r.date)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const displayRaces = upcoming.length > 0 ? upcoming : [...races].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get all users from strategies for opponent lookup
  const knownUsers = [...new Map(
    strategies.map(s => [s.user_id, { id: s.user_id, username: s.username }])
  ).values()].filter(u => u.id !== user?.id);

  const challengeMutation = useMutation({
    mutationFn: async () => {
      if (!opponentUsername.trim()) throw new Error('Enter an opponent username');
      if (!selectedRaceId) throw new Error('Select a race');
      const opponent = knownUsers.find(u => u.username.toLowerCase() === opponentUsername.trim().toLowerCase());
      if (!opponent) throw new Error('User not found. They must have submitted at least one strategy.');
      const race = races.find(r => r.id === selectedRaceId);
      // Check no existing duel
      const exists = allDuels.find(d =>
        d.race_id === selectedRaceId &&
        ((d.challenger_id === user.id && d.opponent_id === opponent.id) ||
         (d.challenger_id === opponent.id && d.opponent_id === user.id))
      );
      if (exists) throw new Error('A duel already exists for this race between you two.');
      return db.entities.Duel.create({
        race_id: race.id,
        race_name: race.name,
        challenger_id: user.id,
        challenger_username: user.username,
        opponent_id: opponent.id,
        opponent_username: opponent.username,
        status: 'pending',
      });
    },
    onSuccess: (duel) => {
      toast.success(`Duel sent to ${duel.opponent_username}! 🤺`);
      setOpponentUsername('');
      setSelectedRaceId('');
      setTab('my');
      qc.invalidateQueries(['duels']);
    },
    onError: (e) => toast.error(e.message),
  });

  const acceptMutation = useMutation({
    mutationFn: (duel) => db.entities.Duel.update(duel.id, { status: 'accepted' }),
    onSuccess: () => { toast.success('Duel accepted! May the best strategy win 🏁'); qc.invalidateQueries(['duels']); },
  });

  const declineMutation = useMutation({
    mutationFn: (duel) => db.entities.Duel.update(duel.id, { status: 'declined' }),
    onSuccess: () => { toast.success('Duel declined'); qc.invalidateQueries(['duels']); },
  });

  const pendingIncoming = myDuels.filter(d => d.opponent_id === user?.id && d.status === 'pending');

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Swords className="w-6 h-6 text-[#e10600]" />
        <div>
          <h1 className="text-xl font-black text-white">Head-to-Head Duels</h1>
          <p className="text-gray-400 text-xs">Challenge a friend to beat your strategy</p>
        </div>
        {pendingIncoming.length > 0 && (
          <div className="ml-auto bg-[#e10600] text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
            {pendingIncoming.length}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-[#111] rounded-xl p-1 mb-5">
        {[
          { key: 'my', label: 'My Duels' },
          { key: 'challenge', label: 'Challenge' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              tab === key ? 'bg-[#e10600] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}{key === 'my' && pendingIncoming.length > 0 ? ` (${pendingIncoming.length})` : ''}
          </button>
        ))}
      </div>

      {tab === 'my' && (
        <div className="space-y-3">
          {myDuels.length === 0 ? (
            <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center">
              <Swords className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-bold">No duels yet</p>
              <p className="text-gray-600 text-sm mt-1">Challenge a friend to prove your strategy skills</p>
              <button onClick={() => setTab('challenge')} className="mt-4 text-xs bg-[#e10600] text-white px-4 py-2 rounded-xl font-bold">
                Start a Duel
              </button>
            </div>
          ) : (
            myDuels.map(duel => (
              <DuelCard
                key={duel.id}
                duel={duel}
                currentUser={user}
                strategies={strategies}
                onAccept={acceptMutation.mutate}
                onDecline={declineMutation.mutate}
              />
            ))
          )}
        </div>
      )}

      {tab === 'challenge' && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 space-y-4">
          <h2 className="font-black text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#e10600]" /> New Duel
          </h2>

          <div>
            <label className="text-[10px] text-gray-400 font-bold tracking-widest block mb-2">OPPONENT USERNAME</label>
            <input
              type="text"
              value={opponentUsername}
              onChange={e => setOpponentUsername(e.target.value)}
              placeholder="Enter their exact username"
              className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e10600]/50"
            />
            {knownUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {knownUsers.slice(0, 6).map(u => (
                  <button
                    key={u.id}
                    onClick={() => setOpponentUsername(u.username)}
                    className="text-[10px] bg-[#111] border border-[#333] text-gray-400 hover:text-white hover:border-[#e10600]/40 px-2 py-1 rounded-lg transition-colors"
                  >
                    {u.username}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] text-gray-400 font-bold tracking-widest block mb-2">RACE</label>
            <select
              value={selectedRaceId}
              onChange={e => setSelectedRaceId(e.target.value)}
              className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-3 text-sm"
            >
              <option value="">Select a race…</option>
              {displayRaces.map(r => (
                <option key={r.id} value={r.id}>
                  {r.flag_emoji} {r.name} — {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => challengeMutation.mutate()}
            disabled={challengeMutation.isPending || !opponentUsername.trim() || !selectedRaceId}
            className="w-full bg-[#e10600] hover:bg-[#c10500] disabled:opacity-40 text-white rounded-xl py-3 font-black text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Swords className="w-4 h-4" />
            {challengeMutation.isPending ? 'Sending…' : 'Send Duel Challenge'}
          </button>
        </div>
      )}
    </div>
  );
}
