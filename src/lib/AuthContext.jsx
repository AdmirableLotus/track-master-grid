import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const DEFAULT_USER = { id: 'guest', full_name: 'Guest Engineer', email: 'guest@pitwall.app', role: 'admin' };

export const AuthProvider = ({ children }) => {
  const [user] = useState(() => {
    const stored = localStorage.getItem('pitwall_user');
    if (!stored) {
      localStorage.setItem('pitwall_user', JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(stored);
  });

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: true, isLoadingAuth: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
