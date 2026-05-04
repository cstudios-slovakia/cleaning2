import React, { createContext, useContext, useState, useEffect } from 'react';

import { fetchUsers } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('cleaner_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cleaner_user');
  };

  useEffect(() => {
    if (!user) return;
    
    const verifyUser = async () => {
      try {
        const users = await fetchUsers();
        const foundUser = users.find(u => u.id === user.id);
        if (!foundUser || foundUser.status === 'inactive') {
          logout();
        }
      } catch (err) {
        console.error('Failed to verify user status', err);
      }
    };

    verifyUser();
    const interval = setInterval(verifyUser, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('cleaner_user', JSON.stringify(userData));
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
