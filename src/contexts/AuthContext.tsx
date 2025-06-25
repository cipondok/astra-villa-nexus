
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
  extendSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(false); // Start false for better UX
  const [session, setSession] = React.useState<Session | null>(null);

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
        setLoading(false);
        return;
      }
      
      // Check for vendor@astravilla.com as vendor
      if (authUser.user?.email === 'vendor@astravilla.com') {
        const vendorProfile: Profile = {
          id: userId,
          email: authUser.user.email,
          full_name: authUser.user.user_metadata?.full_name || 'Vendor User',
          role: 'vendor',
          verification_status: 'approved',
          company_name: 'AstraVilla Services'
        };
        setProfile(vendorProfile);
        setLoading(false);
        return;
      }
      
      // Optimize query with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile');
          const defaultProfile: Profile = {
            id: userId,
            email: authUser.user?.email || '',
            full_name: authUser.user?.user_metadata?.full_name || 'User',
            role: 'general_user',
            verification_status: 'pending'
          };
          setProfile(defaultProfile);
          setLoading(false);
          return;
        }
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      console.log('Profile fetched successfully:', data);
      setProfile(data as Profile);
      setLoading(false);
    } catch (error) {
      console.error('Profile fetch error:', error);
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('Manually refreshing profile for user:', user.email);
      setLoading(true);
      await fetchProfile(user.id);
    }
  };

  const extendSession = async () => {
    try {
      console.log('Extending session...');
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
      } else {
        console.log('Session extended successfully');
        localStorage.setItem('last_activity', Date.now().toString());
      }
    } catch (error) {
      console.error('Error extending session:', error);
    }
  };

  React.useEffect(() => {
    let mounted = true;
    
    console.log('Initializing auth state...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event !== 'TOKEN_REFRESHED') {
          setLoading(true);
          await fetchProfile(session.user.id);
          if (event === 'SIGNED_IN') {
            localStorage.setItem('login_time', Date.now().toString());
            localStorage.setItem('last_activity', Date.now().toString());
          }
        } else if (!session) {
          setProfile(null);
          setLoading(false);
          localStorage.removeItem('login_time');
          localStorage.removeItem('last_activity');
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing all state');
          setProfile(null);
          setUser(null);
          setSession(null);
          setLoading(false);
          localStorage.clear();
          sessionStorage.clear();
        }
      }
    );

    // Get initial session with faster response
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session check:', session?.user?.email || 'No session');
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        setLoading(true);
        fetchProfile(session.user.id);
        if (!localStorage.getItem('last_activity')) {
          localStorage.setItem('last_activity', Date.now().toString());
        }
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auto-extend session on user activity
  React.useEffect(() => {
    if (!user || !session) return;

    let activityTimeout: NodeJS.Timeout;
    let lastExtension = Date.now();

    const handleActivity = () => {
      const now = Date.now();
      const lastActivity = localStorage.getItem('last_activity');
      const timeSinceLastActivity = lastActivity ? now - parseInt(lastActivity) : 0;
      const timeSinceLastExtension = now - lastExtension;

      localStorage.setItem('last_activity', now.toString());

      if (timeSinceLastExtension > 10 * 60 * 1000 && timeSinceLastActivity < 5 * 60 * 1000) {
        extendSession();
        lastExtension = now;
      }

      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        if (user && session) {
          extendSession();
          lastExtension = Date.now();
        }
      }, 15 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    handleActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearTimeout(activityTimeout);
    };
  }, [user, session]);

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
      // Don't set loading to false here, let the auth state change handler do it
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
      setLoading(true);
      
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
        setLoading(false);
        return { error, success: false };
      }

      console.log('Sign up successful for:', email);
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      setLoading(false);
      return { error, success: false };
    }
  };

  const signOut = async () => {
    try {
      console.log('Fast logout initiated...');
      
      // Clear state immediately for instant UI update
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      
      // Clear storage immediately
      localStorage.clear();
      sessionStorage.clear();
      
      // Supabase sign out in background - don't await this
      supabase.auth.signOut().catch(error => {
        console.error('Background sign out error:', error);
      });
      
      // Navigate immediately
      window.location.replace('/');
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Force cleanup on error
      setUser(null);
      setProfile(null);
      setSession(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/');
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
    isAuthenticated: !!user && !!session,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    extendSession,
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
