import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
import Login from '@/pages/Login';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

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
