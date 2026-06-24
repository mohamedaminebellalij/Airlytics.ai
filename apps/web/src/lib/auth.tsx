'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  email: string;
  name: string;
  isAdmin: boolean;
  plan: 'free' | 'pro';
}

interface AuthContextType {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const ADMIN_EMAILS = ['admin@airlytics.ai', 'mohamedaminebellalij@gmail.com'];

const AuthContext = createContext<AuthContextType>({
  user: null,
  ready: false,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('airlytics-user');
      if (stored) setUser(JSON.parse(stored));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!email || password.length < 6) return false;
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    if (isAdmin && password !== 'airlytics@2026') return false;
    const u: AuthUser = {
      email,
      name: email.split('@')[0].replace(/[._]/g, ' '),
      isAdmin,
      plan: isAdmin ? 'pro' : 'free',
    };
    setUser(u);
    localStorage.setItem('airlytics-user', JSON.stringify(u));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('airlytics-user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
