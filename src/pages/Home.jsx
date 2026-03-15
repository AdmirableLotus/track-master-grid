import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BarChart2, Map, Trophy, Flag, Users, ChevronRight, Zap } from 'lucide-react';
import { parseISO, isPast } from 'date-fns';

const TIRE_COLORS = { soft: '#e10600', medium: '#ffd700', hard: '#e0e0e0' };

/* ── Animated speed lines background ── */
function SpeedLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(18)].map((_, i) => (
        <div
          key={i}
          className="absolute h-px opacity-10"
          style={{
            top: `${5 + i * 5.2}%`,
            left: '-100%',
            width: `${40 + Math.random() * 60}%`,
            background: 'linear-gradient(90deg, transparent, #e10600, transparent)',
            animation: `speedline ${1.8 + (i % 5) * 0.4}s linear infinite`,
            animationDelay: `${(i * 0.3) % 2}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Live countdown ── */
function Countdown({ dateStr }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const race = parseISO(dateStr);
  if (isPast(race)) return <span className="text-green-400 font-black text-sm tracking-widest">RACE COMPLETE</span>;
  const diff = race - now;
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return (
    <div className="flex gap-2">
      {[['D', days], ['H', hrs], ['M', mins], ['S', secs]].map(([label, val]) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-black border border-[#e10600]/40 rounded-lg w-14 h-14 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#e10600]/10 to-transparent" />
            <span className="text-2xl font-black text-white tabular-nums z-10">{String(val).padStart(2, '0')}</span>
          </div>
          <span className="text-[9px] text-[#e10600] font-black tracking-widest mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Animated tachometer arc ── */
function Tachometer({ value = 78, max = 100 }) {
  const pct = value / max;
  const r = 36;
  const circ = Math.PI * r; // half circle
  const dash = circ * pct;
  return (
    <svg width="100" height="56" viewBox="0 0 100 56">
      <path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke="#1a1a1a" strokeWidth="8" strokeLinecap="round" />
      <path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke="#e10600" strokeWidth="8"
        strokeLinecap="round" strokeDasharray={`${dash * 1.32} 999`}
        style={{ filter: 'drop-shadow(0 0 6px #e10600)' }} />
      <text x="50" y="46" textAnchor="middle" fill="white" fontSize="13" fontWeight="900">{value}</text>
    </svg>
  );
}

const NAV_CARDS = [
  { to: '/StrategyBuilder', icon: BarChart2, label: 'Strategy Builder', sub: 'Plan your race approach', accent: true },
  { to: '/TrackInfo',       icon: Map,       label: 'Track Info',        sub: 'Explore circuits' },
  { to: '/Results',         icon: Flag,      label: 'Results',           sub: 'See how you scored' },
  { to: '/Leaderboard',     icon: Trophy,    label: 'Leaderboard',       sub: 'Global rankings' },
  { to: '/Leagues',         icon: Users,     label: 'Leagues',           sub: 'Compete with friends' },
];

export default function Home() {
  const { user } = useAuth();
  const [hoveredCard, setHoveredCard] = useState(null);

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list('-date', 30),
  });

  const upcoming = races
    .filter(r => !isPast(parseISO(r.date)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextRace = upcoming[0];
  const firstName = user?.full_name?.split(' ')[0] ?? 'Engineer';

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-x-hidden">
      <style>{`
        @keyframes speedline {
          0%   { transform: translateX(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(220%); opacity: 0; }
        }
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 0 0 0 rgba(225,6,0,0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(225,6,0,0); }
        }
        @keyframes scan {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes flicker {
          0%,100% { opacity:1; } 92% { opacity:1; } 93% { opacity:0.4; } 95% { opacity:1; } 97% { opacity:0.6; } 98% { opacity:1; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="relative min-h-[420px] flex flex-col justify-end overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(225,6,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(225,6,0,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Speed lines */}
        <SpeedLines />

        {/* Red glow orb */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(225,6,0,0.15) 0%, transparent 70%)' }} />

        {/* Scan line */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="w-full h-8 bg-gradient-to-b from-transparent via-[#e10600]/20 to-transparent"
            style={{ animation: 'scan 4s linear infinite' }} />
        </div>

        {/* Top red bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e10600] to-transparent" />

        <div className="relative z-10 px-5 pt-10 pb-8">
          {/* Greeting */}
          <div className="mb-6">
            <p className="text-[#e10600] text-xs font-black tracking-[0.3em] uppercase mb-1">
              ● PITWALL STRATEGIST
            </p>
            <h1 className="text-4xl font-black text-white leading-none tracking-tight"
              style={{ animation: 'flicker 8s infinite', textShadow: '0 0 40px rgba(225,6,0,0.3)' }}>
              WELCOME BACK,<br />
              <span className="text-[#e10600]">{firstName.toUpperCase()}</span>
            </h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">Race day intelligence at your fingertips.</p>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 mb-6">
            {[
              { label: 'RACES', value: races.length },
              { label: 'UPCOMING', value: upcoming.length },
              { label: 'CIRCUITS', value: races.length },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 bg-black/60 border border-[#222] rounded-xl p-3 text-center backdrop-blur">
                <p className="text-xl font-black text-white">{value}</p>
                <p className="text-[9px] text-gray-500 font-black tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-24 max-w-lg mx-auto">

        {/* ── NEXT RACE CARD ── */}
        {nextRace ? (
          <div className="relative rounded-2xl overflow-hidden mb-6 border border-[#e10600]/30"
            style={{ background: 'linear-gradient(135deg, #1a0000 0%, #0d0d0d 50%, #0a0a0a 100%)' }}>

            {/* Corner accent */}
            <div className="absolute top-0 left-0 w-24 h-24 opacity-20"
              style={{ background: 'radial-gradient(circle at 0 0, #e10600, transparent)' }} />
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10"
              style={{ background: 'radial-gradient(circle at 100% 100%, #e10600, transparent)' }} />

            {/* Top stripe */}
            <div className="h-1 w-full bg-gradient-to-r from-[#e10600] via-[#ff4400] to-[#e10600]" />

            <div className="p-5 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#e10600]" style={{ animation: 'pulse-red 2s infinite' }} />
                  <span className="text-[#e10600] text-[10px] font-black tracking-[0.25em] uppercase">Next Race</span>
                </div>
                <span className="text-2xl">{nextRace.flag_emoji}</span>
              </div>

              <h2 className="text-2xl font-black text-white leading-tight mb-1">{nextRace.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{nextRace.circuit} · {nextRace.country}</p>

              <Countdown dateStr={nextRace.date} />

              <div className="flex gap-2 mt-4 flex-wrap">
                {[
                  `${nextRace.laps} LAPS`,
                  `${nextRace.lap_length_km}KM`,
                  nextRace.drs_zones && `${nextRace.drs_zones} DRS`,
                ].filter(Boolean).map(tag => (
                  <span key={tag} className="text-[10px] font-black text-gray-400 bg-white/5 border border-white/10 px-2 py-1 rounded tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>

              {nextRace.available_compounds && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                  <span className="text-[9px] text-gray-500 font-black tracking-widest self-center">COMPOUNDS</span>
                  {nextRace.available_compounds.map(c => (
                    <div key={c} className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: TIRE_COLORS[c], background: TIRE_COLORS[c] + '30' }} />
                      <span className="text-[10px] font-black uppercase" style={{ color: TIRE_COLORS[c] }}>{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6 mb-6 text-center">
            <Flag className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No upcoming races. Check back soon.</p>
          </div>
        )}

        {/* ── QUICK ACTIONS ── */}
        <p className="text-[10px] font-black text-gray-500 tracking-[0.25em] uppercase mb-3">Quick Access</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {NAV_CARDS.map(({ to, icon: Icon, label, sub, accent }) => (
            <Link
              key={to}
              to={to}
              onMouseEnter={() => setHoveredCard(to)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`relative rounded-xl p-4 flex flex-col gap-2 overflow-hidden transition-all duration-200 border ${
                accent
                  ? 'bg-[#e10600] border-[#e10600] hover:bg-[#c10500]'
                  : 'bg-[#111] border-[#222] hover:border-[#e10600]/50'
              }`}
            >
              {!accent && hoveredCard === to && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#e10600]/5 to-transparent pointer-events-none" />
              )}
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${accent ? 'text-white' : 'text-[#e10600]'}`} />
                <ChevronRight className={`w-3 h-3 ${accent ? 'text-red-200' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className={`font-black text-sm ${accent ? 'text-white' : 'text-white'}`}>{label}</p>
                <p className={`text-xs ${accent ? 'text-red-200' : 'text-gray-500'}`}>{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── UPCOMING RACES LIST ── */}
        {upcoming.length > 1 && (
          <>
            <p className="text-[10px] font-black text-gray-500 tracking-[0.25em] uppercase mb-3">Race Calendar</p>
            <div className="space-y-2">
              {upcoming.slice(1, 6).map((race, i) => (
                <div key={race.id}
                  className="bg-[#111] border border-[#1e1e1e] hover:border-[#e10600]/30 rounded-xl p-3 flex items-center gap-3 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-gray-400">R{race.round}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white truncate">{race.name}</p>
                    <p className="text-xs text-gray-500">{race.circuit} · {new Date(race.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-lg">{race.flag_emoji}</span>
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
