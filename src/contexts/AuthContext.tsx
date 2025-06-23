
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { clearAllCookies } from '@/utils/deviceFingerprint';

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
  // Ensure React is properly initialized before using hooks
  if (!React.useState) {
    console.error('React hooks not available - React may not be properly initialized');
    return <div>Loading...</div>;
  }

  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
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

  // Create session when user signs in
  const createUserSession = async (userId: string) => {
    try {
      const deviceFingerprint = btoa(navigator.userAgent + screen.width + screen.height).substring(0, 32);
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`
      };
      
      const sessionToken = crypto.randomUUID() + '-' + Date.now();

      // Check for existing sessions from other devices
      const { data: existingSessions } = await supabase
        .from('user_device_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (existingSessions && existingSessions.length > 0) {
        const differentDevices = existingSessions.filter(
          session => session.device_fingerprint !== deviceFingerprint
        );

        if (differentDevices.length > 0) {
          // Create alert for multiple device login
          await supabase.rpc('create_login_alert', {
            p_user_id: userId,
            p_alert_type: 'multiple_sessions',
            p_device_info: deviceInfo,
            p_message: `Login detected from new device: ${navigator.platform}`
          });
        }
      }

      // Create new session record
      await supabase
        .from('user_device_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          device_fingerprint: deviceFingerprint,
          device_info: deviceInfo,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });

      // Store session token locally
      localStorage.setItem('session_token', sessionToken);
      localStorage.setItem('device_fingerprint', deviceFingerprint);
      
    } catch (error) {
      console.error('Error creating session:', error);
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
          await fetchProfile(session.user.id);
          if (event === 'SIGNED_IN') {
            await createUserSession(session.user.id);
          }
        } else if (!session) {
          setProfile(null);
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state');
          setProfile(null);
          setUser(null);
          setSession(null);
          clearAllCookies();
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session check:', session?.user?.email || 'No session');
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
      
      // Terminate current session
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken && user) {
        await supabase
          .from('user_device_sessions')
          .update({ is_active: false })
          .eq('session_token', sessionToken)
          .eq('user_id', user.id);
      }
      
      setUser(null);
      setProfile(null);
      setSession(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
      }
      
      // Clear all cookies and storage
      clearAllCookies();
      
      console.log('User signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      setUser(null);
      setProfile(null);
      setSession(null);
      clearAllCookies();
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
