import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import AppLayout from '@/components/pitwall/AppLayout';
import Home from '@/pages/Home';
import StrategyBuilder from '@/pages/StrategyBuilder';
import Results from '@/pages/Results';
import Leaderboard from '@/pages/Leaderboard';
import TrackInfo from '@/pages/TrackInfo';
import Admin from '@/pages/Admin';
import Leagues from '@/pages/Leagues';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
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
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
