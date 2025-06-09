
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from './AlertContext';

type UserRole = 'general_user' | 'property_owner' | 'agent' | 'vendor' | 'admin';

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
  const [initialized, setInitialized] = useState(false);
  const { showError, showSuccess } = useAlert();

  console.log('AuthProvider rendering, loading:', loading, 'user:', user?.email, 'profile role:', profile?.role, 'verification:', profile?.verification_status);

  const fetchProfile = async (userId: string, forceRefresh: boolean = false) => {
    try {
      console.log('Fetching profile for user:', userId, 'forceRefresh:', forceRefresh);
      
      // First check if profile exists
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('id', userId);

      console.log('Profile query result:', { data, error, count });

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating profile for super admin email');
          // If this is the super admin email, create the profile
          if (user?.email === 'mycode103@gmail.com') {
            await createSuperAdminProfile(userId, user.email);
            return;
          }
        }
        return;
      }

      if (data && data.length > 0) {
        console.log('Profile fetched successfully:', {
          email: data[0]?.email,
          role: data[0]?.role,
          verification_status: data[0]?.verification_status,
          updated_at: data[0]?.updated_at
        });
        setProfile(data[0]);
      } else {
        console.log('No profile found, creating for super admin email');
        if (user?.email === 'mycode103@gmail.com') {
          await createSuperAdminProfile(userId, user.email);
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const createSuperAdminProfile = async (userId: string, email: string) => {
    try {
      console.log('Creating super admin profile for:', email);
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          role: 'admin',
          verification_status: 'approved',
          full_name: 'Super Admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating super admin profile:', error);
        return;
      }

      console.log('Super admin profile created:', data);
      setProfile(data);
      showSuccess('Profile Created', 'Super admin profile has been created successfully.');
    } catch (error) {
      console.error('Create super admin profile error:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('Manually refreshing profile for user:', user.email);
      await fetchProfile(user.id, true);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (initialized) return;
      
      try {
        console.log('Initializing auth...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        console.log('Initial session:', session?.user?.email || 'No session');

        if (session?.user && mounted) {
          setUser(session.user);
          // Force fresh profile fetch on initialization
          await fetchProfile(session.user.id, true);
        }
        
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        
        if (!mounted || !initialized) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user);
            // Force fresh profile fetch on sign in
            await fetchProfile(session.user.id, true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

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
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          showError('Sign In Failed', 'Invalid email or password. Please check your credentials and try again.');
        } else {
          showError('Sign In Failed', error.message);
        }
        return { error, success: false };
      }

      console.log('Sign in successful for:', email);
      
      // Force profile refresh after successful sign in
      if (data.user) {
        setTimeout(async () => {
          await fetchProfile(data.user.id, true);
          setLoading(false);
          showSuccess('Welcome back!', 'You have been signed in successfully.');
        }, 500);
      }
      
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      setLoading(false);
      showError('Sign In Error', error.message);
      return { error, success: false };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Attempting sign up for:', email);
      
      // Disable email confirmation for testing - users can login immediately
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
        
        // Handle rate limit errors specifically
        if (error.message.includes('email rate limit exceeded')) {
          showError('Sign Up Failed', 'Too many signup attempts. Please wait a few minutes before trying again, or try logging in if you already have an account.');
        } else {
          showError('Sign Up Failed', error.message);
        }
        return { error, success: false };
      }

      console.log('Sign up successful for:', email);
      
      // Show success message without email verification requirement
      showSuccess('Account Created!', 'Your account has been created successfully. You can now sign in.');
      
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      showError('Sign Up Error', error.message);
      return { error, success: false };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      showSuccess('Signed Out', 'You have been signed out successfully.');
    } catch (error: any) {
      console.error('Sign out error:', error);
      showError('Sign Out Error', error.message);
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
        showError('Update Failed', error.message);
        return { error, success: false };
      }

      await fetchProfile(user.id, true);
      showSuccess('Profile Updated', 'Your profile has been updated successfully.');
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Update error:', error);
      showError('Update Error', error.message);
      return { error, success: false };
    }
  };

  // Check if user is authenticated (email verification disabled for testing)
  const isAuthenticated = !!user;

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

  console.log('AuthProvider providing value, loading:', loading, 'isAuthenticated:', isAuthenticated, 'role:', profile?.role, 'verification:', profile?.verification_status);

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
