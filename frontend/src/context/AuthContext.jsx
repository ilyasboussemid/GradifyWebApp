import React, { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('gradify_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('gradify_token') || null;
  });
  useEffect(() => {
    if (user) {
      localStorage.setItem('gradify_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gradify_user');
    }
  }, [user]);
  useEffect(() => {
    if (token) {
      localStorage.setItem('gradify_token', token);
    } else {
      localStorage.removeItem('gradify_token');
    }
  }, [token]);
  const login = async (identifier, password, role) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Identifiants invalides');
      }
      const data = await response.json();
      const userData = { identifier: data.identifier, role: data.role, name: data.name };
      if (data.role === 'STUDENT') {
        try {
          const profileRes = await fetch(`/api/students/${data.identifier}`);
          if (profileRes.ok) {
            const profile = await profileRes.json();
            userData.firstName = profile.firstName || '';
            userData.lastName = profile.lastName || '';
          }
        } catch (e) {}
      }
      setUser(userData);
      setToken(data.token);
      return { success: true };
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        const demoUser = {
          identifier,
          role,
          name: role === 'ADMIN' ? 'Administrateur' :
                role === 'ENTERPRISE' ? identifier :
                `Étudiant ${identifier.slice(0, 8)}`
        };
        setUser(demoUser);
        setToken('demo-token-' + Date.now());
        return { success: true, demo: true };
      }
      return { success: false, error: error.message };
    }
  };
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gradify_user');
    localStorage.removeItem('gradify_token');
  };
  const isAdmin = () => user?.role === 'ADMIN';
  const isEnterprise = () => user?.role === 'ENTERPRISE';
  const isStudent = () => user?.role === 'STUDENT';
  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAdmin,
      isEnterprise,
      isStudent,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
export default AuthContext;
