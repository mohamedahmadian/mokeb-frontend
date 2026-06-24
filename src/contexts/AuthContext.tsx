import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import api from '../lib/api';
import type { AuthResponse, User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (mobileNumber: string, password: string) => Promise<void>;
  setSession: (data: AuthResponse) => void;
  logout: () => void;
  updateStoredUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (mobileNumber: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      mobileNumber,
      password,
    });

    setSession(data);
  };

  const setSession = (data: AuthResponse) => {
    const canAccessPanel = data.user.roles.some(
      (role) => role === 'Admin' || role === 'MawkibOwner' || role === 'Pilgrim',
    );

    if (!canAccessPanel) {
      throw new Error('شما مجوز ورود به پنل را ندارید');
    }

    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateStoredUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, setSession, logout, updateStoredUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
