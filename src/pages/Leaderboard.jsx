import { useState } from 'react';
import { db } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Star, Crown } from 'lucide-react';

const RANK_STYLES = [
  { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', icon: Crown },
  { bg: 'bg-gray-400/20', border: 'border-gray-400/40', text: 'text-gray-300', icon: Medal },
  { bg: 'bg-orange-600/20', border: 'border-orange-600/40', text: 'text-orange-400', icon: Medal },
];

export default function Leaderboard() {
  const [tab, setTab] = useState('global');

  const { data: strategies = [] } = useQuery({
    queryKey: ['all-strategies'],
    queryFn: () => db.entities.Strategy.filter({ submitted: true }),
  });

  // Aggregate scores per user
  const scoremap = {};
  strategies.forEach(s => {
    if (!s.username) return;
    if (!scoremap[s.user_id]) scoremap[s.user_id] = { username: s.username, total: 0, races: 0 };
    scoremap[s.user_id].total += s.score || 0;
    scoremap[s.user_id].races += 1;
  });

  const rankings = Object.values(scoremap)
    .sort((a, b) => b.total - a.total)
    .map((u, i) => ({ ...u, rank: i + 1 }));

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Trophy className="w-6 h-6 text-[#e10600]" />
        <div>
          <h1 className="text-xl font-black text-white">Leaderboard</h1>
          <p className="text-gray-400 text-xs">Who thinks like an F1 engineer?</p>
        </div>
      </div>

      {/* Top 3 podium */}
      {rankings.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-6 pt-4">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-400/20 border-2 border-gray-400/50 flex items-center justify-center">
              <span className="text-lg font-black text-gray-300">2</span>
            </div>
            <div className="bg-gray-400/10 border border-gray-400/30 rounded-xl px-3 py-4 h-20 flex flex-col justify-end items-center w-24">
              <p className="text-xs font-bold text-white text-center truncate w-full text-center">{rankings[1]?.username}</p>
              <p className="text-xs text-gray-400">{rankings[1]?.total} pts</p>
            </div>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <div className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500/60 flex items-center justify-center">
              <span className="text-xl font-black text-yellow-400">1</span>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl px-3 py-4 h-28 flex flex-col justify-end items-center w-28">
              <p className="text-xs font-bold text-white text-center truncate w-full text-center">{rankings[0]?.username}</p>
              <p className="text-xs text-yellow-400 font-bold">{rankings[0]?.total} pts</p>
            </div>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-orange-600/20 border-2 border-orange-600/40 flex items-center justify-center">
              <span className="text-lg font-black text-orange-400">3</span>
            </div>
            <div className="bg-orange-600/10 border border-orange-600/30 rounded-xl px-3 py-4 h-16 flex flex-col justify-end items-center w-24">
              <p className="text-xs font-bold text-white text-center truncate w-full text-center">{rankings[2]?.username}</p>
              <p className="text-xs text-orange-400">{rankings[2]?.total} pts</p>
            </div>
          </div>
        </div>
      )}

      {/* Full rankings */}
      <div className="space-y-2">
        {rankings.length === 0 && (
          <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center">
            <Trophy className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No strategies submitted yet.</p>
            <p className="text-gray-600 text-sm mt-1">Be the first to compete!</p>
          </div>
        )}
        {rankings.map(({ rank, username, total, races }) => {
          const style = RANK_STYLES[rank - 1] || { bg: 'bg-[#1a1a1a]', border: 'border-[#2a2a2a]', text: 'text-gray-400', icon: Star };
          const Icon = style.icon;
          return (
            <div key={username} className={`flex items-center gap-4 p-4 rounded-xl border ${style.bg} ${style.border}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${style.text}`}>
                {rank <= 3 ? <Icon className="w-4 h-4" /> : rank}
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{username}</p>
                <p className="text-xs text-gray-500">{races} race{races !== 1 ? 's' : ''} entered</p>
              </div>
              <div className="text-right">
                <p className={`font-black text-lg ${style.text}`}>{total}</p>
                <p className="text-xs text-gray-500">pts</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}