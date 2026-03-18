import { Outlet, NavLink } from 'react-router-dom';
import { Home, Trophy, BarChart2, Users, LogOut, Swords, Zap, User } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  { to: '/Home',            icon: Home,     label: 'Home'       },
  { to: '/StrategyBuilder', icon: BarChart2, label: 'Strategy'   },
  { to: '/Leaderboard',     icon: Trophy,   label: 'Standings'  },
  { to: '/Leagues',         icon: Users,    label: 'Leagues'    },
  { to: '/Profile',         icon: User,     label: 'Profile'    },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Top bar */}
      <header className="bg-[#111] border-b border-[#e10600]/30 px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-[#e10600] flex items-center justify-center animate-spin-slow">
          <div className="w-3 h-3 rounded-full bg-[#e10600]" />
        </div>
        <span className="text-lg font-black tracking-widest text-white">PITWALL</span>
        <span className="text-lg font-black tracking-widest text-[#e10600]">STRATEGIST</span>
        <div className="ml-auto flex items-center gap-3">
          {user?.email === 'demo@pitwall.app' && (
            <span className="text-[9px] font-black tracking-widest px-2 py-1 rounded-full bg-[#e10600]/10 border border-[#e10600]/30 text-[#e10600]">DEMO</span>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#e10600]/20 border border-[#e10600]/40 flex items-center justify-center">
              <span className="text-[10px] font-black text-[#e10600]">{user?.username?.[0]?.toUpperCase() ?? 'U'}</span>
            </div>
            <span className="text-xs font-bold text-gray-300 hidden sm:block">{user?.username}</span>
          </div>
          <button onClick={logout} className="text-gray-500 hover:text-[#e10600] transition-colors" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
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