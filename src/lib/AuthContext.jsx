import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { logout as storeLogout } from '@/lib/authStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session ? mapUser(session.user) : null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? mapUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session ? mapUser(session.user) : null);
  };

  const logout = async () => {
    await storeLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, refreshSession, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

function mapUser(supabaseUser) {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0],
    full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0],
    role: supabaseUser.user_metadata?.role || 'user',
  };
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
