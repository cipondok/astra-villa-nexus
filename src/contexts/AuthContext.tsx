
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'general_user' | 'property_owner' | 'agent' | 'vendor' | 'admin' | 'customer_service';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: UserRole;
  company_name?: string;
  license_number?: string;
  verification_status?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  availability_status?: 'online' | 'busy' | 'offline';
  last_seen_at?: string;
  is_admin?: boolean;
  wallet_verified?: boolean;
  wallet_address?: string;
  wallet_provider?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; success?: boolean }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any; success?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any; success?: boolean }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  console.log('AuthProvider - user:', user?.email, 'loading:', loading, 'profile role:', profile?.role);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Check if user is super admin by email
      const { data: authUser } = await supabase.auth.getUser();
      
      if (authUser.user?.email === 'mycode103@gmail.com') {
        const adminProfile: Profile = {
          id: userId,
          email: authUser.user.email,
          full_name: authUser.user.user_metadata?.full_name || 'Admin',
          role: 'admin',
          verification_status: 'approved',
          is_admin: true
        };
        setProfile(adminProfile);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Profile not found, user needs to create profile');
          // Don't auto-create profile, let user sign up properly
          return;
        }
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Profile fetched successfully:', data);
      setProfile(data as Profile);
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('Manually refreshing profile for user:', user.email);
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Only initialize once
    if (hasInitialized) return;
    
    console.log('Initializing auth state...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event !== 'TOKEN_REFRESHED') {
          // Only fetch profile on actual sign in, not token refresh
          await fetchProfile(session.user.id);
        } else if (!session) {
          setProfile(null);
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state');
          setProfile(null);
          setUser(null);
          setSession(null);
        }
        
        setLoading(false);
      }
    );

    // Only get initial session without auto-signing in
    // This prevents auto-login behavior
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email || 'No session');
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
      setHasInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [hasInitialized]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        setLoading(false);
        return { error, success: false };
      }

      console.log('Sign in successful for:', email);
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      setLoading(false);
      return { error, success: false };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Attempting sign up for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error, success: false };
      }

      console.log('Sign up successful for:', email);
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error, success: false };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      
      // Clear state immediately
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
      }
      
      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      console.log('User signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Force clear state even if there's an error
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      if (!user) return { error: new Error('No user found'), success: false };

      const updateData = {
        id: user.id,
        email: user.email!,
        ...data,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updateData);

      if (error) {
        console.error('Profile update error:', error);
        return { error, success: false };
      }

      await fetchProfile(user.id);
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Update error:', error);
      return { error, success: false };
    }
  };

  const isAuthenticated = !!user && !!session;

  const value = {
    user,
    profile,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
