'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '../supabase/client';
import { Profile, UserRole } from '../supabase/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
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
      department: string;
      company: string;
    }
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const DEFAULT_PROFILE: Profile = {
  id: 'demo-user-001',
  full_name: 'Rajesh Sharma',
  role: 'SUPPLY_CHAIN_MANAGER',
  department: 'Global Supply Chain & Logistics',
  company: 'Astra Motors Manufacturing',
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: DEFAULT_PROFILE,
  isLoading: true,
  isConfigured: false,
  activeRole: 'SUPPLY_CHAIN_MANAGER',
  setActiveRole: () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole>('SUPPLY_CHAIN_MANAGER');
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setProfile(DEFAULT_PROFILE);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(DEFAULT_PROFILE);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const fetchProfile = async (userId: string) => {
    const supabase = createClient();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        const loadedProfile = data as Profile;
        setProfile(loadedProfile);
        setActiveRole(loadedProfile.role);
      }
    } catch (err) {
      console.warn('Failed to fetch profile from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      return {
        error: new Error(
          'Supabase credentials are not configured yet in .env.local. Operating in offline demo mode.'
        ),
      };
    }
    const supabase = createClient();
    if (!supabase) {
      return { error: new Error('Supabase client unavailable') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    profileData: {
      fullName: string;
      role: UserRole;
      department: string;
      company: string;
    }
  ) => {
    if (!isConfigured) {
      return {
        error: new Error(
          'Supabase credentials are not configured yet in .env.local. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable real user signup.'
        ),
      };
    }
    const supabase = createClient();
    if (!supabase) {
      return { error: new Error('Supabase client unavailable') };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { error };

    if (data.user) {
      // Create user profile in profiles table
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: profileData.fullName,
        role: profileData.role,
        department: profileData.department,
        company: profileData.company,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    setUser(null);
    setProfile(DEFAULT_PROFILE);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isConfigured,
        activeRole,
        setActiveRole,
        signIn,
        signUp,
        signOut,
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
