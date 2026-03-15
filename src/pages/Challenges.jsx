import { useState, useEffect } from 'react';
import { db } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, CheckCircle, Clock, Trophy, Lock } from 'lucide-react';
import { isPast, parseISO, differenceInHours } from 'date-fns';
import { toast } from 'sonner';

// Weekly challenges seeded per race
const CHALLENGE_TEMPLATES = [
  { key: 'exact_pit_lap', label: 'Pit Stop Prophet', desc: 'Predict the exact pit lap within ±2 laps', points: 50, icon: '🔧' },
  { key: 'correct_compound', label: 'Compound Caller', desc: 'Predict the starting compound correctly', points: 30, icon: '🏎️' },
  { key: 'one_stop', label: 'One-Stop Hero', desc: 'Correctly predict a one-stop strategy', points: 40, icon: '⚡' },
  { key: 'wet_weather', label: 'Rain Master', desc: 'Submit a wet-weather strategy for a mixed/wet race', points: 60, icon: '🌧️' },
  { key: 'podium_tire', label: 'Tire Whisperer', desc: 'Match the race winner\'s tire sequence', points: 75, icon: '🏆' },
];

function ChallengeCard({ challenge, raceDate, userEntry, onEnter, disabled }) {
  const locked = isPast(parseISO(raceDate));
  const completed = !!userEntry;
  const hoursLeft = differenceInHours(parseISO(raceDate), new Date());

  return (
    <div className={`bg-[#1a1a1a] border rounded-2xl p-4 transition-all ${
      completed ? 'border-green-500/40' : locked ? 'border-[#2a2a2a] opacity-60' : 'border-[#333] hover:border-[#e10600]/40'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{challenge.icon}</span>
          <div>
            <p className="font-black text-white text-sm">{challenge.label}</p>
            <p className="text-xs text-gray-500">{challenge.desc}</p>
          </div>
        </div>
        <div className="text-right shrink-0 ml-3">
          <p className="text-[#e10600] font-black text-lg">+{challenge.points}</p>
          <p className="text-[9px] text-gray-500 tracking-widest">BONUS PTS</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#222]">
        {completed ? (
          <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
            <CheckCircle className="w-4 h-4" /> Entered — awaiting race result
          </div>
        ) : locked ? (
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
            <Lock className="w-4 h-4" /> Race started — deadline passed
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{hoursLeft > 0 ? `${hoursLeft}h left` : 'Closing soon'}</span>
            </div>
            <button
              onClick={() => onEnter(challenge)}
              disabled={disabled}
              className="bg-[#e10600] hover:bg-[#c10500] disabled:opacity-40 text-white text-xs font-black px-4 py-2 rounded-xl transition-colors"
            >
              Accept Challenge
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CountdownBadge({ raceDate }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const race = parseISO(raceDate);
  if (isPast(race)) return <span className="text-xs text-gray-500 font-bold">Race started</span>;

  const diff = race - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const urgent = h < 24;
  return (
    <span className={`text-xs font-black tabular-nums ${urgent ? 'text-[#e10600]' : 'text-yellow-400'}`}>
      {h > 48 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
    </span>
  );
}

export default function Challenges() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedRaceId, setSelectedRaceId] = useState(null);

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => db.entities.Race.list('date', 30),
  });

  const upcoming = races
    .filter(r => !isPast(parseISO(r.date)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const displayRaces = upcoming.length > 0 ? upcoming : [...races].sort((a, b) => new Date(b.date) - new Date(a.date));
  const selectedRace = races.find(r => r.id === selectedRaceId) || displayRaces[0];

  const { data: myEntries = [] } = useQuery({
    queryKey: ['challenges', selectedRace?.id, user?.id],
    queryFn: () => db.entities.Challenge.filter({ race_id: selectedRace.id, user_id: user.id }),
    enabled: !!selectedRace && !!user,
  });

  const enterMutation = useMutation({
    mutationFn: (challenge) => db.entities.Challenge.create({
      race_id: selectedRace.id,
      user_id: user.id,
      username: user.username,
      challenge_key: challenge.key,
      challenge_label: challenge.label,
      bonus_points: challenge.points,
      status: 'pending',
    }),
    onSuccess: (_, challenge) => {
      toast.success(`Challenge accepted: ${challenge.label}! 🏁`);
      qc.invalidateQueries(['challenges']);
    },
    onError: () => toast.error('Failed to enter challenge'),
  });

  const enteredKeys = new Set(myEntries.map(e => e.challenge_key));

  // Pick challenges relevant to the race (wet challenge only for mixed/wet races)
  const relevantChallenges = CHALLENGE_TEMPLATES.filter(c => {
    if (c.key === 'wet_weather') return ['mixed', 'wet'].includes(selectedRace?.weather_forecast);
    return true;
  });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Zap className="w-6 h-6 text-[#e10600]" />
        <div>
          <h1 className="text-xl font-black text-white">Weekly Challenges</h1>
          <p className="text-gray-400 text-xs">Bonus points for bold predictions</p>
        </div>
      </div>

      {/* Race selector */}
      <div className="mb-5">
        <label className="text-[10px] text-gray-400 font-bold tracking-widest uppercase block mb-2">Select Race</label>
        <select
          className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-xl px-4 py-3 text-sm"
          value={selectedRace?.id || ''}
          onChange={e => setSelectedRaceId(e.target.value)}
        >
          {displayRaces.map(r => (
            <option key={r.id} value={r.id}>
              {r.flag_emoji} {r.name} — {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {selectedRace && (
        <>
          {/* Deadline banner */}
          <div className="bg-[#111] border border-[#222] rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#e10600]" />
              <span className="text-xs text-gray-400 font-bold">Submission deadline</span>
            </div>
            <CountdownBadge raceDate={selectedRace.date} />
          </div>

          {/* Progress */}
          <div className="bg-[#111] border border-[#222] rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400 font-bold">Challenges entered</span>
            </div>
            <span className="text-sm font-black text-white">{myEntries.length} / {relevantChallenges.length}</span>
          </div>

          <div className="space-y-3">
            {relevantChallenges.map(challenge => (
              <ChallengeCard
                key={challenge.key}
                challenge={challenge}
                raceDate={selectedRace.date}
                userEntry={enteredKeys.has(challenge.key) ? myEntries.find(e => e.challenge_key === challenge.key) : null}
                onEnter={enterMutation.mutate}
                disabled={enterMutation.isPending}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
