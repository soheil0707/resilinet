'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '../supabase/client';
import { Profile, UserRole } from '../supabase/types';

export const SUPPORTED_ROLES: UserRole[] = [
  'SUPPLY_CHAIN_MANAGER',
  'PROCUREMENT_MANAGER',
  'PRODUCTION_PLANNER',
  'LOGISTICS_MANAGER',
  'FINANCE_MANAGER',
  'ADMIN',
];

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

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isConfigured: false,
  activeRole: 'SUPPLY_CHAIN_MANAGER',
  setActiveRole: () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isConfigured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(isConfigured);
  const [activeRole, setActiveRole] = useState<UserRole>('SUPPLY_CHAIN_MANAGER');

  const fetchProfileAndValidate = async (
    userId: string,
    userMetadata?: Record<string, unknown>
  ): Promise<Profile | null> => {
    const supabase = createClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        const loadedProfile = data as Profile;
        if (SUPPORTED_ROLES.includes(loadedProfile.role)) {
          setProfile(loadedProfile);
          setActiveRole(loadedProfile.role);
          return loadedProfile;
        } else {
          console.warn('Profile has unsupported role:', loadedProfile.role);
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          return null;
        }
      }

      // If profile is not in the profiles table, check user_metadata
      const metaRole = userMetadata?.role as UserRole | undefined;
      if (metaRole && SUPPORTED_ROLES.includes(metaRole)) {
        const autoProfile: Profile = {
          id: userId,
          full_name: (userMetadata?.full_name as string) || 'Enterprise User',
          role: metaRole,
          department: (userMetadata?.department as string) || 'Global Supply Chain & Logistics',
          company: (userMetadata?.company as string) || 'Astra Motors Manufacturing',
          updated_at: new Date().toISOString(),
        };

        try {
          await supabase.from('profiles').upsert(autoProfile);
        } catch (upsertErr) {
          console.warn('Could not persist auto-profile:', upsertErr);
        }

        setProfile(autoProfile);
        setActiveRole(metaRole);
        return autoProfile;
      }
    } catch (err) {
      console.warn('Error validating user profile:', err);
    }
    return null;
  };

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      return;
    }

    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfileAndValidate(session.user.id, session.user.user_metadata);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfileAndValidate(session.user.id, session.user.user_metadata);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      return { error: new Error('Please enter both email and password.') };
    }

    if (!isConfigured) {
      return {
        error: new Error(
          'Supabase authentication is not configured in .env.local. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable authentication.'
        ),
      };
    }

    const supabase = createClient();
    if (!supabase) {
      return { error: new Error('Supabase client unavailable') };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return {
        error: new Error(
          error.message || 'Invalid email or password. Please verify your credentials.'
        ),
      };
    }

    if (!data.user) {
      return { error: new Error('Authentication succeeded but user record was not returned.') };
    }

    setUser(data.user);

    // Retrieve profile and validate role
    const profileRecord = await fetchProfileAndValidate(
      data.user.id,
      data.user.user_metadata
    );

    if (!profileRecord) {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      return {
        error: new Error(
          'Access Denied: No authorized ResiliNet enterprise role found for this account.'
        ),
      };
    }

    return { error: null };
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
    if (!SUPPORTED_ROLES.includes(profileData.role)) {
      return {
        error: new Error(
          `Invalid role. Supported roles are: ${SUPPORTED_ROLES.join(', ')}`
        ),
      };
    }

    if (!isConfigured) {
      return {
        error: new Error(
          'Supabase credentials are not configured in .env.local. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
        ),
      };
    }

    const supabase = createClient();
    if (!supabase) {
      return { error: new Error('Supabase client unavailable') };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: profileData.fullName,
          role: profileData.role,
          department: profileData.department,
          company: profileData.company,
        },
      },
    });

    if (error) return { error };

    if (data.user) {
      const newProfile: Profile = {
        id: data.user.id,
        full_name: profileData.fullName,
        role: profileData.role,
        department: profileData.department,
        company: profileData.company,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(newProfile);

      if (profileError) {
        console.error('Error writing profile to database:', profileError);
      }

      setUser(data.user);
      setProfile(newProfile);
      setActiveRole(profileData.role);
    }

    return { error: null };
  };

  const signOut = async () => {
    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.warn('Error signing out from Supabase:', err);
        }
      }
    }
    setUser(null);
    setProfile(null);
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
