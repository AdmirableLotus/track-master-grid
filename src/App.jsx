import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AppLayout from '@/components/pitwall/AppLayout';
import Home from '@/pages/Home';
import StrategyBuilder from '@/pages/StrategyBuilder';
import Results from '@/pages/Results';
import Leaderboard from '@/pages/Leaderboard';
import TrackInfo from '@/pages/TrackInfo';
import Admin from '@/pages/Admin';
import Leagues from '@/pages/Leagues';
import DriverComparison from '@/pages/DriverComparison';
import Challenges from '@/pages/Challenges';
import Duels from '@/pages/Duels';
import Profile from '@/pages/Profile';
import Login from '@/pages/Login';
import Landing from '@/pages/Landing';

import { loginAsGuest } from '@/lib/authStore';

function UnauthFlow() {
  const { refreshSession } = useAuth();
  const [screen, setScreen] = useState('landing');

  const handleGuest = () => {
    loginAsGuest();
    refreshSession();
  };

  if (screen === 'landing') {
    return <Landing onSignIn={() => setScreen('login')} onRegister={() => setScreen('register')} onGuest={handleGuest} />;
  }
  return <Login initialMode={screen === 'register' ? 'register' : 'login'} onBack={() => setScreen('landing')} />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <UnauthFlow />;
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Home" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/Home" element={<Home />} />
        <Route path="/StrategyBuilder" element={<StrategyBuilder />} />
        <Route path="/Results" element={<Results />} />
        <Route path="/Leaderboard" element={<Leaderboard />} />
        <Route path="/TrackInfo" element={<TrackInfo />} />
        <Route path="/Leagues" element={<Leagues />} />
        <Route path="/Compare" element={<DriverComparison />} />
        <Route path="/Challenges" element={<Challenges />} />
        <Route path="/Duels" element={<Duels />} />
        <Route path="/Profile" element={<Profile />} />
      </Route>
      <Route path="/Admin" element={<Admin />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
