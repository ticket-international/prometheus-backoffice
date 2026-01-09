'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, NormalizedPermissions } from '@/types/auth';
import { AuthService } from './authService';

interface AuthContextType {
  session: UserSession | null;
  isLoading: boolean;
  login: (username: string, apiKey: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permissionName: string, requireWrite?: boolean) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedSession = AuthService.loadSession();
    setSession(loadedSession);
    setIsLoading(false);
  }, []);

  const login = async (username: string, apiKey: string) => {
    const userSession = await AuthService.authenticate(username, apiKey);
    setSession(userSession);
    AuthService.saveSession(userSession);
  };

  const logout = () => {
    setSession(null);
    AuthService.clearSession();
  };

  const hasPermission = (permissionName: string, requireWrite: boolean = false): boolean => {
    if (!session) return false;
    return AuthService.hasPermission(session.permissions, permissionName, requireWrite);
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
