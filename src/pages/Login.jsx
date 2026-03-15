import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { register, login } from '@/lib/authStore';
import { Flag, Eye, EyeOff, Zap } from 'lucide-react';

export default function LoginPage() {
  const { refreshSession } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!form.username.trim()) throw new Error('Username is required.');
        if (!form.email.trim()) throw new Error('Email is required.');
        if (form.password.length < 6) throw new Error('Password must be at least 6 characters.');
        register({ username: form.username.trim(), email: form.email.trim(), password: form.password });
      } else {
        login({ email: form.email.trim(), password: form.password });
      }
      refreshSession();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(225,6,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(225,6,0,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Glow */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(225,6,0,0.12) 0%, transparent 70%)' }} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e10600] to-transparent" />

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full border-2 border-[#e10600] flex items-center justify-center"
          style={{ boxShadow: '0 0 20px rgba(225,6,0,0.4)' }}>
          <div className="w-4 h-4 rounded-full bg-[#e10600]" />
        </div>
        <div>
          <span className="text-xl font-black text-white tracking-widest">PITWALL </span>
          <span className="text-xl font-black text-[#e10600] tracking-widest">STRATEGIST</span>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm relative">
        <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 0 60px rgba(225,6,0,0.08)' }}>

          {/* Top stripe */}
          <div className="h-1 bg-gradient-to-r from-[#e10600] via-[#ff4400] to-[#e10600]" />

          <div className="p-6">
            {/* Tab switcher */}
            <div className="flex bg-[#0a0a0a] rounded-xl p-1 mb-6 border border-[#1a1a1a]">
              {['login', 'register'].map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${
                    mode === m
                      ? 'bg-[#e10600] text-white shadow-lg'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <div className="mb-5">
              <h2 className="text-xl font-black text-white">
                {mode === 'login' ? 'Welcome back, Engineer' : 'Join the Pitwall'}
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                {mode === 'login' ? 'Sign in to your account to continue.' : 'Create your account and start competing.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase block mb-1.5">Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={e => set('username', e.target.value)}
                    placeholder="e.g. FastLapFerro"
                    maxLength={20}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] focus:border-[#e10600]/60 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-600"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase block mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="engineer@pitwall.app"
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] focus:border-[#e10600]/60 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] focus:border-[#e10600]/60 text-white rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-colors placeholder:text-gray-600"
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-[#e10600]/10 border border-[#e10600]/30 rounded-xl px-4 py-3">
                  <p className="text-[#e10600] text-xs font-semibold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e10600] hover:bg-[#c10500] disabled:opacity-50 text-white rounded-xl py-3 font-black text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-2 mt-2"
                style={{ boxShadow: '0 4px 20px rgba(225,6,0,0.3)' }}
              >
                <Zap className="w-4 h-4" />
                {loading ? 'Loading...' : mode === 'login' ? 'Enter Pitwall' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-[#e10600] font-bold hover:underline">
            {mode === 'login' ? 'Register here' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
