'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('xonda_token') : null;
    if (!token) return setIsLoading(false);
    api.get('/auth/me').then(({ data }) => setUser(data.user)).finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('xonda_token', data.token);
    setUser(data.user);
    window.location.href = '/dashboard';
  };

  const logout = () => {
    localStorage.removeItem('xonda_token');
    setUser(null);
    window.location.href = '/login';
  };

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
