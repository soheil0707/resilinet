'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole =
  | 'SUPPLY_CHAIN_MANAGER'
  | 'ADMIN'
  | 'ANALYST'
  | 'PROCUREMENT_MANAGER'
  | 'PRODUCTION_PLANNER'
  | 'LOGISTICS_MANAGER'
  | 'FINANCE_MANAGER';

export const SUPPORTED_ROLES: UserRole[] = [
  'SUPPLY_CHAIN_MANAGER',
  'ADMIN',
  'ANALYST',
  'PROCUREMENT_MANAGER',
  'PRODUCTION_PLANNER',
  'LOGISTICS_MANAGER',
  'FINANCE_MANAGER',
];

export interface AuthProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone_number?: string | null;
  department?: string;
  company?: string;
  updated_at?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    role?: UserRole;
    phone_number?: string | null;
    department?: string;
    company?: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  profile: AuthProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    profileData: {
      fullName: string;
      role: UserRole;
      phoneNumber?: string;
      department?: string;
      company?: string;
    }
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isConfigured: true,
  activeRole: 'SUPPLY_CHAIN_MANAGER',
  setActiveRole: () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole>('SUPPLY_CHAIN_MANAGER');

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const u = data.user;
          const mappedRole = (SUPPORTED_ROLES.includes(u.role as UserRole)
            ? (u.role as UserRole)
            : 'SUPPLY_CHAIN_MANAGER');

          const userObj: AuthUser = {
            id: u.userId,
            email: u.email,
            user_metadata: {
              full_name: u.fullName,
              role: mappedRole,
              phone_number: u.phoneNumber,
              department: 'Global Supply Chain & Logistics',
              company: 'Astra Motors Manufacturing',
            },
          };

          const profileObj: AuthProfile = {
            id: u.userId,
            full_name: u.fullName,
            email: u.email,
            role: mappedRole,
            phone_number: u.phoneNumber,
            department: 'Global Supply Chain & Logistics',
            company: 'Astra Motors Manufacturing',
            updated_at: new Date().toISOString(),
          };

          setUser(userObj);
          setProfile(profileObj);
          setActiveRole(mappedRole);
          return;
        }
      }
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.warn('Session verification caught error:', err);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      return { error: new Error('Please enter both corporate email and password.') };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        return {
          error: new Error(data.error || 'Authentication failed. Please verify your credentials.'),
        };
      }

      const u = data.user;
      const mappedRole = (SUPPORTED_ROLES.includes(u.role as UserRole)
        ? (u.role as UserRole)
        : 'SUPPLY_CHAIN_MANAGER');

      const userObj: AuthUser = {
        id: u.userId,
        email: u.email,
        user_metadata: {
          full_name: u.fullName,
          role: mappedRole,
          phone_number: u.phoneNumber,
          department: 'Global Supply Chain & Logistics',
          company: 'Astra Motors Manufacturing',
        },
      };

      const profileObj: AuthProfile = {
        id: u.userId,
        full_name: u.fullName,
        email: u.email,
        role: mappedRole,
        phone_number: u.phoneNumber,
        department: 'Global Supply Chain & Logistics',
        company: 'Astra Motors Manufacturing',
        updated_at: new Date().toISOString(),
      };

      setUser(userObj);
      setProfile(profileObj);
      setActiveRole(mappedRole);

      // Clean stale navigation/workflow state so user always starts fresh at Executive Dashboard
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('resilinet_last_route');
        } catch {
          // ignore
        }
      }

      return { error: null };
    } catch (err) {
      return {
        error: new Error(
          err instanceof Error ? err.message : 'Unable to reach SAP HANA Cloud authentication service'
        ),
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    profileData: {
      fullName: string;
      role: UserRole;
      phoneNumber?: string;
      department?: string;
      company?: string;
    }
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profileData.fullName,
          email: email.trim(),
          phoneNumber: profileData.phoneNumber,
          password,
          role: profileData.role,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        return {
          error: new Error(data.error || 'Registration failed in SAP HANA Cloud'),
        };
      }

      const u = data.user;
      const mappedRole = (SUPPORTED_ROLES.includes(u.role as UserRole)
        ? (u.role as UserRole)
        : 'SUPPLY_CHAIN_MANAGER');

      const userObj: AuthUser = {
        id: u.userId,
        email: u.email,
        user_metadata: {
          full_name: u.fullName,
          role: mappedRole,
          phone_number: u.phoneNumber,
          department: profileData.department || 'Global Supply Chain & Logistics',
          company: profileData.company || 'Astra Motors Manufacturing',
        },
      };

      const profileObj: AuthProfile = {
        id: u.userId,
        full_name: u.fullName,
        email: u.email,
        role: mappedRole,
        phone_number: u.phoneNumber,
        department: profileData.department || 'Global Supply Chain & Logistics',
        company: profileData.company || 'Astra Motors Manufacturing',
        updated_at: new Date().toISOString(),
      };

      setUser(userObj);
      setProfile(profileObj);
      setActiveRole(mappedRole);

      return { error: null };
    } catch (err) {
      return {
        error: new Error(
          err instanceof Error ? err.message : 'Failed to register account in SAP HANA Cloud'
        ),
      };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout error:', err);
    }
    setUser(null);
    setProfile(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('resilinet_last_route');
      } catch {
        // ignore
      }
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isConfigured: true,
        activeRole,
        setActiveRole,
        signIn,
        signUp,
        signOut,
        refreshUser: checkSession,
      }}
    >
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
