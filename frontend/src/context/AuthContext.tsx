import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '../api/client';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      setUser(user);
    } finally {
      setLoading(false);
    }
  }

  async function register(email: string, password: string, name?: string) {
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password, name });
      await login(email, password);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  useEffect(() => {
  async function restoreSession() {
    const token = localStorage.getItem('token');

    if (!token) {
      setInitializing(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setInitializing(false);
    }
  }

  restoreSession();
}, []);

  return (
  <AuthContext.Provider value={{ user, login, register, logout, loading, initializing }}>
    {children}
  </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}