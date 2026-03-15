import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a]">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-7xl font-black text-[#e10600]">404</h1>
        <div className="h-px w-16 bg-[#e10600]/40 mx-auto" />
        <h2 className="text-2xl font-black text-white">Page Not Found</h2>
        <p className="text-gray-400">
          The page <span className="text-white font-bold">"{pageName}"</span> doesn't exist.
        </p>
        {user?.role === 'admin' && (
          <div className="p-4 bg-[#1a1a1a] border border-orange-500/30 rounded-xl text-left">
            <p className="text-sm font-bold text-orange-400 mb-1">Admin Note</p>
            <p className="text-sm text-gray-400">This page hasn't been implemented yet.</p>
          </div>
        )}
        <button onClick={() => window.location.href = '/'}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#e10600] hover:bg-[#c10500] text-white font-black rounded-xl text-sm transition-colors">
          ← Go Home
        </button>
      </div>
    </div>
  );
}
