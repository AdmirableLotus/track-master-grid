import { useState } from 'react';
import { db } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Star, Crown, Flame, Zap, Shield, Target } from 'lucide-react';

// F1-style points system
const F1_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

const RANK_STYLES = [
  { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', icon: Crown },
  { bg: 'bg-gray-400/20',   border: 'border-gray-400/40',   text: 'text-gray-300',   icon: Medal },
  { bg: 'bg-orange-600/20', border: 'border-orange-600/40', text: 'text-orange-400', icon: Medal },
];

const STREAK_MEDALS = [
  { min: 10, icon: '🔥', label: 'Inferno',    color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30' },
  { min: 5,  icon: '⚡', label: 'Lightning',  color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  { min: 3,  icon: '🏅', label: 'Consistent', color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/30' },
  { min: 1,  icon: '✅', label: 'On Track',   color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30' },
];

function getMedal(streak) {
  return STREAK_MEDALS.find(m => streak >= m.min) || null;
}

function computeStreaks(strategies, races) {
  // Sort races by date
  const sortedRaces = [...races].sort((a, b) => new Date(a.date) - new Date(b.date));
  const userMap = {};

  strategies.forEach(s => {
    if (!s.username || !s.user_id) return;
    if (!userMap[s.user_id]) userMap[s.user_id] = { username: s.username, submittedRaceIds: new Set() };
    userMap[s.user_id].submittedRaceIds.add(s.race_id);
  });

  return Object.entries(userMap).map(([uid, { username, submittedRaceIds }]) => {
    // Compute current streak (consecutive from most recent race backwards)
    let streak = 0;
    for (let i = sortedRaces.length - 1; i >= 0; i--) {
      if (submittedRaceIds.has(sortedRaces[i].id)) streak++;
      else break;
    }
    // Max streak
    let maxStreak = 0, cur = 0;
    sortedRaces.forEach(r => {
      if (submittedRaceIds.has(r.id)) { cur++; maxStreak = Math.max(maxStreak, cur); }
      else cur = 0;
    });
    return { uid, username, streak, maxStreak, total: submittedRaceIds.size };
  }).sort((a, b) => b.streak - a.streak || b.maxStreak - a.maxStreak);
}

function computeChampionship(strategies) {
  // Group by race, rank users by score within each race, award F1 points
  const raceGroups = {};
  strategies.forEach(s => {
    if (!s.race_id || !s.user_id || !s.username) return;
    if (!raceGroups[s.race_id]) raceGroups[s.race_id] = [];
    raceGroups[s.race_id].push(s);
  });

  const champMap = {};
  Object.values(raceGroups).forEach(racers => {
    const sorted = [...racers].sort((a, b) => (b.score || 0) - (a.score || 0));
    sorted.forEach((s, i) => {
      if (!champMap[s.user_id]) champMap[s.user_id] = { username: s.username, points: 0, wins: 0, podiums: 0, races: 0 };
      const pts = F1_POINTS[i] || 0;
      champMap[s.user_id].points += pts;
      champMap[s.user_id].races += 1;
      if (i === 0) champMap[s.user_id].wins += 1;
      if (i < 3) champMap[s.user_id].podiums += 1;
    });
  });

  return Object.values(champMap).sort((a, b) => b.points - a.points || b.wins - a.wins);
}

function Podium({ rankings }) {
  if (rankings.length < 3) return null;
  return (
    <div className="flex items-end justify-center gap-3 mb-6 pt-4">
      {/* 2nd */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-gray-400/20 border-2 border-gray-400/50 flex items-center justify-center">
          <span className="text-lg font-black text-gray-300">2</span>
        </div>
        <div className="bg-gray-400/10 border border-gray-400/30 rounded-xl px-3 py-4 h-20 flex flex-col justify-end items-center w-24">
          <p className="text-xs font-bold text-white text-center truncate w-full">{rankings[1]?.username}</p>
          <p className="text-xs text-gray-400">{rankings[1]?.display} pts</p>
        </div>
      </div>
      {/* 1st */}
      <div className="flex flex-col items-center gap-2">
        <Crown className="w-5 h-5 text-yellow-400" />
        <div className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500/60 flex items-center justify-center">
          <span className="text-xl font-black text-yellow-400">1</span>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl px-3 py-4 h-28 flex flex-col justify-end items-center w-28">
          <p className="text-xs font-bold text-white text-center truncate w-full">{rankings[0]?.username}</p>
          <p className="text-xs text-yellow-400 font-bold">{rankings[0]?.display} pts</p>
        </div>
      </div>
      {/* 3rd */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-orange-600/20 border-2 border-orange-600/40 flex items-center justify-center">
          <span className="text-lg font-black text-orange-400">3</span>
        </div>
        <div className="bg-orange-600/10 border border-orange-600/30 rounded-xl px-3 py-4 h-16 flex flex-col justify-end items-center w-24">
          <p className="text-xs font-bold text-white text-center truncate w-full">{rankings[2]?.username}</p>
          <p className="text-xs text-orange-400">{rankings[2]?.display} pts</p>
        </div>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [tab, setTab] = useState('global');

  const { data: strategies = [] } = useQuery({
    queryKey: ['all-strategies'],
    queryFn: () => db.entities.Strategy.filter({ submitted: true }),
  });

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => db.entities.Race.list('date', 30),
  });

  // Global rankings (raw score sum)
  const scoremap = {};
  strategies.forEach(s => {
    if (!s.username) return;
    if (!scoremap[s.user_id]) scoremap[s.user_id] = { username: s.username, total: 0, races: 0 };
    scoremap[s.user_id].total += s.score || 0;
    scoremap[s.user_id].races += 1;
  });
  const globalRankings = Object.values(scoremap)
    .sort((a, b) => b.total - a.total)
    .map((u, i) => ({ ...u, rank: i + 1, display: u.total }));

  // Season championship (F1 points)
  const champRankings = computeChampionship(strategies).map((u, i) => ({ ...u, rank: i + 1, display: u.points }));

  // Streaks
  const streakRankings = computeStreaks(strategies, races);

  const TABS = [
    { key: 'global',  label: 'Global',    icon: Trophy },
    { key: 'season',  label: 'Season',    icon: Crown },
    { key: 'streaks', label: 'Streaks',   icon: Flame },
  ];

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Trophy className="w-6 h-6 text-[#e10600]" />
        <div>
          <h1 className="text-xl font-black text-white">Leaderboard</h1>
          <p className="text-gray-400 text-xs">Who thinks like an F1 engineer?</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#111] rounded-xl p-1 mb-5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              tab === key ? 'bg-[#e10600] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon className="w-3 h-3" /> {label}
          </button>
        ))}
      </div>

      {/* ── GLOBAL ── */}
      {tab === 'global' && (
        <>
          <Podium rankings={globalRankings} />
          <div className="space-y-2">
            {globalRankings.length === 0 && (
              <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center">
                <Trophy className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No strategies submitted yet.</p>
              </div>
            )}
            {globalRankings.map(({ rank, username, total, races: r }) => {
              const style = RANK_STYLES[rank - 1] || { bg: 'bg-[#1a1a1a]', border: 'border-[#2a2a2a]', text: 'text-gray-400', icon: Star };
              const Icon = style.icon;
              return (
                <div key={username} className={`flex items-center gap-4 p-4 rounded-xl border ${style.bg} ${style.border}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${style.text}`}>
                    {rank <= 3 ? <Icon className="w-4 h-4" /> : rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{username}</p>
                    <p className="text-xs text-gray-500">{r} race{r !== 1 ? 's' : ''} entered</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${style.text}`}>{total}</p>
                    <p className="text-xs text-gray-500">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── SEASON CHAMPIONSHIP ── */}
      {tab === 'season' && (
        <>
          <div className="bg-[#111] border border-[#222] rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-gray-400">F1-style points: 25-18-15-12-10-8-6-4-2-1 per race finish</p>
          </div>
          <Podium rankings={champRankings} />
          <div className="space-y-2">
            {champRankings.length === 0 && (
              <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center">
                <Crown className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No championship data yet.</p>
              </div>
            )}
            {champRankings.map(({ rank, username, points, wins, podiums, races: r }) => {
              const style = RANK_STYLES[rank - 1] || { bg: 'bg-[#1a1a1a]', border: 'border-[#2a2a2a]', text: 'text-gray-400', icon: Star };
              const Icon = style.icon;
              return (
                <div key={username} className={`flex items-center gap-3 p-4 rounded-xl border ${style.bg} ${style.border}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${style.text}`}>
                    {rank <= 3 ? <Icon className="w-4 h-4" /> : rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{username}</p>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-[10px] text-yellow-400 font-bold">{wins}W</span>
                      <span className="text-[10px] text-gray-500">{podiums} podiums</span>
                      <span className="text-[10px] text-gray-500">{r} races</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-black text-lg ${style.text}`}>{points}</p>
                    <p className="text-[10px] text-gray-500">PTS</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── STREAKS ── */}
      {tab === 'streaks' && (
        <>
          <div className="bg-[#111] border border-[#222] rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <p className="text-xs text-gray-400">Consecutive race submissions earn consistency medals</p>
          </div>

          {/* Medal legend */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {STREAK_MEDALS.map(m => (
              <div key={m.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${m.bg} ${m.border}`}>
                <span className="text-base">{m.icon}</span>
                <div>
                  <p className={`text-xs font-black ${m.color}`}>{m.label}</p>
                  <p className="text-[10px] text-gray-500">{m.min}+ races</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {streakRankings.length === 0 && (
              <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center">
                <Flame className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No streak data yet.</p>
              </div>
            )}
            {streakRankings.map(({ uid, username, streak, maxStreak, total }, i) => {
              const medal = getMedal(streak);
              return (
                <div key={uid} className={`flex items-center gap-3 p-4 rounded-xl border ${
                  medal ? `${medal.bg} ${medal.border}` : 'bg-[#1a1a1a] border-[#2a2a2a]'
                }`}>
                  <div className="w-8 h-8 rounded-full bg-[#111] border border-[#333] flex items-center justify-center font-black text-sm text-gray-400 shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm truncate">{username}</p>
                      {medal && <span className="text-base">{medal.icon}</span>}
                    </div>
                    <p className="text-[10px] text-gray-500">Best: {maxStreak} · Total: {total} races</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-black text-xl ${medal ? medal.color : 'text-gray-400'}`}>{streak}</p>
                    <p className="text-[10px] text-gray-500">streak</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
