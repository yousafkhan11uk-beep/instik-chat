import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isSplashActive: boolean;
  setSplashDone: () => void;
  rememberMe: boolean;
  login: (loginInput: string, password: string, remember: boolean) => Promise<{ success: boolean; error?: string; redirectToAdmin?: boolean }>;
  signup: (data: any) => Promise<{ success: boolean; error?: string; suggestions?: string[] }>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    // Check local session
    const saved = localStorage.getItem('mok_session_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setCurrentUser(u);
      } catch (e) {
        console.error('Session restore error', e);
      }
    }
    setIsLoading(false);

    // Splash Screen Timer (2.5s)
    const timer = setTimeout(() => {
      setIsSplashActive(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const login = async (loginInput: string, password: string, remember: boolean) => {
    setIsLoading(true);
    try {
      const res = await api.login(loginInput, password);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setRememberMe(remember);
        if (remember) {
          localStorage.setItem('mok_session_user', JSON.stringify(res.user));
        } else {
          localStorage.removeItem('mok_session_user');
        }
        return { success: true, redirectToAdmin: res.redirectToAdmin };
      }
      return { success: false, error: res.error || 'Login failed' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error during login' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.signUp(data);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('mok_session_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: res.error, suggestions: res.suggestions };
    } catch (e: any) {
      return { success: false, error: e.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mok_session_user');
  };

  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
    if (localStorage.getItem('mok_session_user')) {
      localStorage.setItem('mok_session_user', JSON.stringify(user));
    }
  };

  const setSplashDone = () => setIsSplashActive(false);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isSplashActive,
        setSplashDone,
        rememberMe,
        login,
        signup,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
