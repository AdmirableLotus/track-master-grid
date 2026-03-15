import { useState, useEffect } from 'react';
import { BarChart2, Map, Trophy, Users, Flag, Zap, ChevronRight, Timer } from 'lucide-react';

const FEATURES = [
  { icon: BarChart2, title: 'Strategy Builder', desc: 'Plan pit stops, tire compounds and risk levels like a real race engineer.' },
  { icon: Timer,     title: 'Live Countdown',   desc: 'Real-time countdown to every race on the 2025 F1 calendar.' },
  { icon: Map,       title: 'Circuit Intel',    desc: 'Deep circuit data — DRS zones, pit loss, typical strategies.' },
  { icon: Trophy,    title: 'Global Leaderboard', desc: 'Score points for predicting the winning strategy. Climb the ranks.' },
  { icon: Users,     title: 'Private Leagues',  desc: 'Create leagues and compete head-to-head with your friends.' },
  { icon: Zap,       title: 'Live Weather',     desc: 'Real race-day weather feeds into your tire degradation models.' },
];

const TAGLINES = [
  'THINK LIKE A RACE ENGINEER.',
  'PREDICT. STRATEGIZE. DOMINATE.',
  'YOUR PITWALL. YOUR CALL.',
  'EVERY LAP. EVERY DECISION.',
];

function SpeedLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute h-px"
          style={{
            top: `${3 + i * 4.8}%`,
            left: '-120%',
            width: `${30 + (i % 4) * 20}%`,
            background: `linear-gradient(90deg, transparent, ${i % 3 === 0 ? '#e10600' : '#ffffff'}18, transparent)`,
            animation: `speedline ${2 + (i % 6) * 0.35}s linear infinite`,
            animationDelay: `${(i * 0.25) % 3}s`,
          }}
        />
      ))}
    </div>
  );
}

function TireCompound({ color, label, delay }) {
  return (
    <div className="flex flex-col items-center gap-1"
      style={{ animation: `fadeUp 0.6s ease forwards`, animationDelay: delay, opacity: 0 }}>
      <div className="w-10 h-10 rounded-full border-4 flex items-center justify-center"
        style={{ borderColor: color, background: color + '20', boxShadow: `0 0 20px ${color}40` }}>
        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
      </div>
      <span className="text-[9px] font-black tracking-widest" style={{ color }}>{label}</span>
    </div>
  );
}

export default function LandingPage({ onSignIn, onRegister }) {
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroReady(true), 100);
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setTaglineIdx(i => (i + 1) % TAGLINES.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <style>{`
        @keyframes speedline {
          0%   { transform: translateX(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(240%); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes revealWidth {
          from { width: 0; } to { width: 100%; }
        }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 20px rgba(225,6,0,0.4); }
          50%      { box-shadow: 0 0 50px rgba(225,6,0,0.8); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .tagline-enter { animation: fadeIn 0.4s ease forwards; }
        .tagline-exit  { opacity: 0; transition: opacity 0.4s; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e10600] to-transparent z-20" />

      {/* ── NAV ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4"
        style={{ animation: 'slideDown 0.6s ease forwards' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#e10600] flex items-center justify-center"
            style={{ animation: 'rotateSlow 8s linear infinite', boxShadow: '0 0 15px rgba(225,6,0,0.5)' }}>
            <div className="w-3 h-3 rounded-full bg-[#e10600]" />
          </div>
          <span className="font-black text-white tracking-widest text-sm">PITWALL</span>
          <span className="font-black text-[#e10600] tracking-widest text-sm">STRATEGIST</span>
        </div>
        <div className="flex gap-3">
          <button onClick={onSignIn}
            className="text-xs font-black text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-[#2a2a2a] hover:border-[#444] transition-all tracking-widest">
            SIGN IN
          </button>
          <button onClick={onRegister}
            className="text-xs font-black text-white px-4 py-2 rounded-lg bg-[#e10600] hover:bg-[#c10500] transition-all tracking-widest"
            style={{ boxShadow: '0 0 20px rgba(225,6,0,0.4)' }}>
            REGISTER
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Grid bg */}
        <div className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(225,6,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(225,6,0,0.04) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        {/* Speed lines */}
        <SpeedLines />

        {/* Red glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(225,6,0,0.12) 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 0 100%, rgba(225,6,0,0.08) 0%, transparent 60%)' }} />

        {/* Tire compounds decoration */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-6 opacity-60">
          <TireCompound color="#e10600" label="SOFT" delay="0.8s" />
          <TireCompound color="#ffd700" label="MED" delay="1.0s" />
          <TireCompound color="#cccccc" label="HARD" delay="1.2s" />
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#e10600]/10 border border-[#e10600]/30 rounded-full px-4 py-1.5 mb-6"
            style={{ animation: heroReady ? 'fadeUp 0.6s ease forwards' : 'none', opacity: heroReady ? undefined : 0 }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#e10600] animate-pulse" />
            <span className="text-[10px] font-black text-[#e10600] tracking-[0.3em]">2025 F1 SEASON LIVE</span>
          </div>

          {/* Main title */}
          <h1 className="text-5xl sm:text-7xl font-black text-white leading-none tracking-tight mb-2"
            style={{ animation: heroReady ? 'fadeUp 0.7s ease 0.1s forwards' : 'none', opacity: 0,
              textShadow: '0 0 80px rgba(225,6,0,0.3)' }}>
            PITWALL
          </h1>
          <h1 className="text-5xl sm:text-7xl font-black leading-none tracking-tight mb-6"
            style={{ animation: heroReady ? 'fadeUp 0.7s ease 0.2s forwards' : 'none', opacity: 0,
              color: '#e10600', textShadow: '0 0 80px rgba(225,6,0,0.6)' }}>
            STRATEGIST
          </h1>

          {/* Animated tagline */}
          <div className="h-8 flex items-center justify-center mb-8">
            <p className={`text-sm sm:text-base font-black tracking-[0.2em] text-gray-300 transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}>
              {TAGLINES[taglineIdx]}
            </p>
          </div>

          {/* Red divider */}
          <div className="flex items-center justify-center gap-3 mb-8"
            style={{ animation: heroReady ? 'fadeUp 0.6s ease 0.4s forwards' : 'none', opacity: 0 }}>
            <div className="h-px bg-gradient-to-r from-transparent to-[#e10600] w-16" />
            <Flag className="w-4 h-4 text-[#e10600]" />
            <div className="h-px bg-gradient-to-l from-transparent to-[#e10600] w-16" />
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center"
            style={{ animation: heroReady ? 'fadeUp 0.6s ease 0.5s forwards' : 'none', opacity: 0 }}>
            <button onClick={onRegister}
              className="group flex items-center justify-center gap-2 bg-[#e10600] hover:bg-[#c10500] text-white font-black px-8 py-4 rounded-xl text-sm tracking-widest transition-all"
              style={{ animation: 'pulse-glow 3s ease infinite', boxShadow: '0 4px 30px rgba(225,6,0,0.4)' }}>
              <Zap className="w-4 h-4" />
              CREATE ACCOUNT
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={onSignIn}
              className="flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 text-white font-black px-8 py-4 rounded-xl text-sm tracking-widest border border-[#333] hover:border-[#555] transition-all">
              SIGN IN
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
          style={{ animation: 'fadeIn 1s ease 1.5s forwards', opacity: 0 }}>
          <span className="text-[9px] text-gray-500 font-black tracking-widest">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#e10600] to-transparent" />
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="px-4 py-16 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[10px] font-black text-[#e10600] tracking-[0.3em] mb-2">WHAT YOU GET</p>
          <h2 className="text-2xl font-black text-white">Race Intelligence. All in One Place.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div key={title}
              className="bg-[#111] border border-[#1e1e1e] hover:border-[#e10600]/30 rounded-xl p-5 transition-all group"
              style={{ animation: `fadeUp 0.5s ease ${0.1 + i * 0.08}s forwards`, opacity: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#e10600]/10 border border-[#e10600]/20 flex items-center justify-center group-hover:bg-[#e10600]/20 transition-colors">
                  <Icon className="w-4 h-4 text-[#e10600]" />
                </div>
                <p className="font-black text-white text-sm">{title}</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-br from-[#1a0000] to-[#0d0d0d] border border-[#e10600]/20 rounded-2xl p-8">
            <p className="text-[10px] font-black text-[#e10600] tracking-[0.3em] mb-3">FREE TO PLAY</p>
            <h3 className="text-2xl font-black text-white mb-2">Ready to Engineer Victory?</h3>
            <p className="text-gray-500 text-sm mb-6">Join the pitwall. Outsmart the competition.</p>
            <button onClick={onRegister}
              className="bg-[#e10600] hover:bg-[#c10500] text-white font-black px-10 py-4 rounded-xl text-sm tracking-widest transition-all inline-flex items-center gap-2"
              style={{ boxShadow: '0 4px 30px rgba(225,6,0,0.4)' }}>
              <Zap className="w-4 h-4" /> GET STARTED FREE
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1a1a1a] px-6 py-4 flex items-center justify-between">
        <span className="text-[10px] text-gray-600 font-black tracking-widest">PITWALL STRATEGIST © 2025</span>
        <span className="text-[10px] text-gray-600">Not affiliated with Formula 1®</span>
      </div>
    </div>
  );
}
