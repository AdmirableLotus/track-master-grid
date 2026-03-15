import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Trophy, Map, BarChart2, Flag, Users } from 'lucide-react';

const navItems = [
  { to: '/Home', icon: Home, label: 'Home' },
  { to: '/StrategyBuilder', icon: BarChart2, label: 'Strategy' },
  { to: '/Results', icon: Flag, label: 'Results' },
  { to: '/Leaderboard', icon: Trophy, label: 'Global' },
  { to: '/Leagues', icon: Users, label: 'Leagues' },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Top bar */}
      <header className="bg-[#111] border-b border-[#e10600]/30 px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-[#e10600] flex items-center justify-center animate-spin-slow">
          <div className="w-3 h-3 rounded-full bg-[#e10600]" />
        </div>
        <span className="text-lg font-black tracking-widest text-white">PITWALL</span>
        <span className="text-lg font-black tracking-widest text-[#e10600]">STRATEGIST</span>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-[#333] flex z-50">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 gap-1 text-[11px] font-bold tracking-wider transition-colors ${
                isActive ? 'text-[#e10600]' : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}