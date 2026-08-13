import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    authApi.getMe()
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        // Clear invalid token
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { access_token, user: userObj } = res.data;
    localStorage.setItem('auth_token', access_token);
    setToken(access_token);
    setUser(userObj);
    return userObj;
  };

  const signup = async (email, password, full_name, role) => {
    const res = await authApi.signup({ email, password, full_name, role });
    const { access_token, user: userObj } = res.data;
    localStorage.setItem('auth_token', access_token);
    setToken(access_token);
    setUser(userObj);
    return userObj;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, signup, logout }}>
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
