import React, { createContext, useState, useContext } from 'react';
import { getSession, logout as storeLogout } from '@/lib/authStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getSession());

  const refreshSession = () => setUser(getSession());

  const logout = () => {
    storeLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, refreshSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
