import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('emerald_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    // Fake login
    const newUser = {
      id: 1,
      name: userData.username || userData.email || 'Test User',
      role: userData.role || 'admin',
      email: userData.email || 'admin@emerald.sk'
    };
    setUser(newUser);
    localStorage.setItem('emerald_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('emerald_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
