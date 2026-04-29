import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Mocking an admin user for now, as requested.
  const [user] = useState({
    id: 1,
    name: 'Admin User',
    role: 'admin', // Roles: admin, owner, manager, cleaner
    email: 'admin@emerald.sk'
  });

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
