import { createContext, useContext, useState, type ReactNode } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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