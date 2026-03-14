import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AdminRaces from '@/components/admin/AdminRaces';
import AdminResults from '@/components/admin/AdminResults';
import { Shield, Flag, Trophy, ChevronRight } from 'lucide-react';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('races');

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="w-12 h-12 text-[#e10600] mx-auto mb-4" />
          <h1 className="text-xl font-black text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">Admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="bg-[#111] border-b border-[#e10600]/30 px-4 py-4 flex items-center gap-3">
        <Shield className="w-5 h-5 text-[#e10600]" />
        <span className="font-black text-white tracking-widest">ADMIN PANEL</span>
      </div>

      <div className="flex border-b border-[#222]">
        {[
          { key: 'races', label: 'Manage Races', icon: Flag },
          { key: 'results', label: 'Enter Results', icon: Trophy },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border-b-2 transition-colors ${
              tab === key ? 'border-[#e10600] text-[#e10600]' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {tab === 'races' && <AdminRaces />}
        {tab === 'results' && <AdminResults />}
      </div>
    </div>
  );
}