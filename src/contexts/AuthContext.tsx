
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
  business_address?: string;
  years_experience?: string;
  specializations?: string;
  bio?: string;
  profile_completion_percentage?: number;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; success?: boolean }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any; success?: boolean }>;
  signInWithGoogle: () => Promise<{ error: any; success?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any; success?: boolean }>;
  refreshProfile: () => Promise<void>;
  extendSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(false);
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
        console.log('Setting admin profile:', adminProfile);
        setProfile(adminProfile);
        setLoading(false);
        return;
      }
      
      // Check for hardcoded vendor emails for backwards compatibility
      const vendorEmails = ['vendor@astravilla.com', 'vendor@test.com'];
      if (vendorEmails.includes(authUser.user?.email || '')) {
        const vendorProfile: Profile = {
          id: userId,
          email: authUser.user.email!,
          full_name: authUser.user.user_metadata?.full_name || 'Vendor User',
          role: 'vendor',
          verification_status: 'approved',
          company_name: 'AstraVilla Services'
        };
        console.log('Setting hardcoded vendor profile:', vendorProfile);
        setProfile(vendorProfile);
        setLoading(false);
        return;
      }
      
      // Try to fetch profile with aggressive timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // Reduced to 1.5 seconds

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .abortSignal(controller.signal)
          .single();

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
          throw error;
        }

        console.log('Profile fetched successfully:', data);
        setProfile(data as Profile);
        setLoading(false);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.log('Profile fetch timed out, using default profile');
        } else {
          console.error('Profile fetch error:', fetchError);
        }
        
        // Create default profile on any error
        const defaultProfile: Profile = {
          id: userId,
          email: authUser.user?.email || '',
          full_name: authUser.user?.user_metadata?.full_name || 'User',
          role: 'general_user',
          verification_status: 'pending'
        };
        setProfile(defaultProfile);
        setLoading(false);
      }

    } catch (error) {
      console.error('Profile fetch error:', error);
      // Always clear loading state and provide default profile
      const { data: authUser } = await supabase.auth.getUser();
      const defaultProfile: Profile = {
        id: userId,
        email: authUser.user?.email || '',
        full_name: authUser.user?.user_metadata?.full_name || 'User',
        role: 'general_user',
        verification_status: 'pending'
      };
      setProfile(defaultProfile);
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
          // Fast profile fetch with timeout
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id);
            }
          }, 0);
          
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

    // Fast initial session check
    const initializeAuth = async () => {
      try {
        // Quick timeout for session check
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        clearTimeout(timeoutId);
        
        if (!mounted) return;
        
        if (error) {
          console.error('Initial session error:', error);
          setLoading(false);
          return;
        }
        
        console.log('Initial session check:', session?.user?.email || 'No session');
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          // Quick profile fetch
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id);
            }
          }, 0);
          
          if (!localStorage.getItem('last_activity')) {
            localStorage.setItem('last_activity', Date.now().toString());
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Simplified activity tracking - no aggressive session extension
  React.useEffect(() => {
    if (!user || !session) return;

    const handleActivity = () => {
      localStorage.setItem('last_activity', Date.now().toString());
    };

    // Only track activity, don't auto-extend sessions
    const events = ['click', 'keypress'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [user, session]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      setLoading(true);
      
      // Clear any existing auth state first
      await supabase.auth.signOut();
      
      // Simplified sign in - remove conflicting session checks
      
      // Add timeout to sign in
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setLoading(false);
      }, 8000); // 8 second timeout

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error('Sign in error:', error);
        setLoading(false);
        
        // Provide specific error messages
        if (error.message.includes('Invalid login credentials')) {
          return { 
            error: { 
              message: 'Invalid email or password. Please check your credentials and try again.' 
            }, 
            success: false 
          };
        }
        
        return { error, success: false };
      }

      console.log('Sign in successful for:', email);
      // Don't set loading to false here, let the auth state change handler do it
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      setLoading(false);
      
      // Handle specific network errors
      if (error.name === 'AbortError') {
        return { error: { message: 'Login timeout. Please check your connection and try again.' }, success: false };
      }
      
      return { error: { message: 'Network error. Please check your connection and try again.' }, success: false };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Attempting Google sign in...');
      setLoading(true);
      
      // Clear any existing auth state first
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        setLoading(false);
        return { error, success: false };
      }

      // OAuth redirects automatically, so we don't set loading to false here
      console.log('Google sign in initiated successfully');
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setLoading(false);
      return { error: { message: 'Google sign in failed. Please try again.' }, success: false };
    }
  };

  const signOut = async () => {
    try {
      console.log('Instant logout initiated...');
      
      // Clear state immediately for instant UI update
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      
      // Clear storage immediately
      localStorage.clear();
      sessionStorage.clear();
      
      // Use router instead of window.location for faster navigation
      window.history.replaceState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      
      // Supabase sign out in background - don't await this
      supabase.auth.signOut().catch(error => {
        console.error('Background sign out error:', error);
      });
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Force cleanup on error
      setUser(null);
      setProfile(null);
      setSession(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Attempting sign up for:', email);
      setLoading(true);
      
      // Add timeout to sign up
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setLoading(false);
      }, 10000); // 10 second timeout

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

      clearTimeout(timeoutId);

      if (error) {
        console.error('Sign up error:', error);
        setLoading(false);
        return { error, success: false };
      }

      console.log('Sign up successful for:', email);
      setLoading(false);
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      setLoading(false);
      
      // Handle specific network errors
      if (error.name === 'AbortError') {
        return { error: { message: 'Registration timeout. Please check your connection and try again.' }, success: false };
      }
      
      return { error: { message: 'Network error. Please check your connection and try again.' }, success: false };
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      if (!user) return { error: new Error('No user found'), success: false };

      console.log('Updating profile with data:', data);
      setLoading(true);

      // Format Indonesian phone number if provided
      const processedData = { ...data };
      if (processedData.phone) {
        try {
          // Format phone number using database function
          const { data: formattedPhone, error: phoneError } = await supabase
            .rpc('format_indonesian_phone', { input_phone: processedData.phone });
          
          if (!phoneError && formattedPhone) {
            processedData.phone = formattedPhone;
          }

          // Validate phone number
          const { data: isValid, error: validationError } = await supabase
            .rpc('is_valid_indonesian_phone', { phone_number: processedData.phone });
          
          if (!validationError && !isValid) {
            setLoading(false);
            return { 
              error: { message: 'Please enter a valid Indonesian mobile number (08xxx or +628xxx)' }, 
              success: false 
            };
          }
        } catch (phoneError) {
          console.error('Phone validation error:', phoneError);
          // Continue with unformatted phone if validation fails
        }
      }

      const updateData = {
        id: user.id,
        email: user.email!,
        ...processedData,
      };

      console.log('Upserting profile data:', updateData);
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .upsert(updateData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        setLoading(false);
        return { error, success: false };
      }

      console.log('Profile updated successfully:', updatedProfile);
      
      // Update local profile state immediately
      setProfile(updatedProfile as Profile);
      setLoading(false);
      
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Update error:', error);
      setLoading(false);
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
    signInWithGoogle,
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
