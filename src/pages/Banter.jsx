import { useState } from 'react';
import { db } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { isPast, parseISO, formatDistanceToNow } from 'date-fns';

const REACTIONS = ['🔥', '😂', '💀', '🏆', '🤌', '👀'];

export default function Banter() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [text, setText] = useState('');

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => db.entities.Race.list('round', 30),
  });

  const completedRaces = races.filter(r => isPast(parseISO(r.date)));

  const { data: posts = [] } = useQuery({
    queryKey: ['banter', selectedRaceId],
    queryFn: () => selectedRaceId
      ? db.entities.BanterPost.filter({ race_id: selectedRaceId })
      : db.entities.BanterPost.list('-created_date', 50),
    refetchInterval: 10000,
  });

  const sorted = [...posts].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const postMutation = useMutation({
    mutationFn: () => db.entities.BanterPost.create({
      race_id: selectedRaceId || null,
      user_id: user.id,
      username: user.full_name || user.email,
      text: text.trim(),
      reactions: {},
    }),
    onSuccess: () => {
      setText('');
      qc.invalidateQueries(['banter']);
    },
    onError: () => toast.error('Failed to post'),
  });

  const reactMutation = useMutation({
    mutationFn: ({ post, emoji }) => {
      const reactions = { ...(post.reactions || {}) };
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      return db.entities.BanterPost.update(post.id, { reactions });
    },
    onSuccess: () => qc.invalidateQueries(['banter']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.BanterPost.delete(id),
    onSuccess: () => qc.invalidateQueries(['banter']),
  });

  const raceName = (id) => races.find(r => r.id === id)?.name || '';

  if (!user) return null;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <MessageCircle className="w-6 h-6 text-[#e10600]" />
        <div>
          <h1 className="text-xl font-black text-white">Banter Feed</h1>
          <p className="text-gray-400 text-xs">Post-race reactions & trash talk</p>
        </div>
      </div>

      {/* Race filter */}
      <select
        value={selectedRaceId}
        onChange={e => setSelectedRaceId(e.target.value)}
        className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-xl px-4 py-3 text-sm mb-4"
      >
        <option value="">All Races</option>
        {completedRaces.map(r => (
          <option key={r.id} value={r.id}>{r.flag_emoji} {r.name}</option>
        ))}
      </select>

      {/* Compose */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 mb-5">
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-[#e10600]/20 border border-[#e10600]/40 flex items-center justify-center shrink-0">
            <span className="text-xs font-black text-[#e10600]">{(user.full_name || user.email || 'U')[0].toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="What did you think of that race? 🏎️"
              maxLength={200}
              rows={2}
              className="w-full bg-transparent text-white text-sm resize-none focus:outline-none placeholder-gray-600"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-600">{text.length}/200</span>
              <button
                onClick={() => text.trim() && postMutation.mutate()}
                disabled={!text.trim() || postMutation.isPending}
                className="bg-[#e10600] disabled:opacity-40 text-white rounded-xl px-4 py-1.5 text-xs font-bold flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {sorted.length === 0 && (
        <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center">
          <MessageCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No posts yet. Be the first!</p>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map(post => (
          <div key={post.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#e10600]/20 border border-[#e10600]/30 flex items-center justify-center">
                  <span className="text-[10px] font-black text-[#e10600]">{(post.username || 'U')[0].toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{post.username}</p>
                  {post.race_id && <p className="text-[10px] text-[#e10600]">{raceName(post.race_id)}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600">
                  {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : ''}
                </span>
                {post.user_id === user.id && (
                  <button onClick={() => deleteMutation.mutate(post.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-200 mb-3 leading-relaxed">{post.text}</p>

            <div className="flex gap-1 flex-wrap">
              {REACTIONS.map(emoji => {
                const count = post.reactions?.[emoji] || 0;
                return (
                  <button
                    key={emoji}
                    onClick={() => reactMutation.mutate({ post, emoji })}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors border ${
                      count > 0
                        ? 'bg-[#e10600]/10 border-[#e10600]/30 text-white'
                        : 'bg-[#111] border-[#2a2a2a] text-gray-500 hover:border-gray-500'
                    }`}
                  >
                    {emoji} {count > 0 && <span className="font-bold">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
