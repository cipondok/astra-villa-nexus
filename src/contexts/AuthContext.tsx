
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
          console.log('Profile not found, creating profile');
          await createUserProfile(userId);
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

  const createUserProfile = async (userId: string) => {
    try {
      console.log('Creating user profile for:', userId);
      
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        console.error('No auth user found');
        return;
      }

      const profileData = {
        id: userId,
        email: authUser.user.email!,
        full_name: authUser.user.user_metadata?.full_name || 'New User',
        role: 'general_user' as UserRole,
        verification_status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return;
      }

      console.log('Profile created successfully:', data);
      setProfile(data as Profile);
    } catch (error) {
      console.error('Create profile error:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('Manually refreshing profile for user:', user.email);
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile after user is set
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email || 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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
        
        // Handle specific error types
        if (error.message?.includes('Invalid login credentials')) {
          return { error: { message: 'Invalid email or password. Please check your credentials.' }, success: false };
        } else if (error.message?.includes('Load failed') || error.name === 'AuthRetryableFetchError') {
          return { error: { message: 'Network connection failed. Please check your internet connection and try again.' }, success: false };
        } else {
          return { error: { message: error.message || 'Login failed. Please try again.' }, success: false };
        }
      }

      console.log('Sign in successful for:', email);
      toast.success('Login successful! Welcome back.');
      // Don't set loading to false here, let the auth state change handle it
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      setLoading(false);
      
      // Handle network errors
      if (error.name === 'AuthRetryableFetchError' || error.message?.includes('Load failed')) {
        return { error: { message: 'Network connection failed. Please check your internet connection and try again.' }, success: false };
      }
      
      return { error: { message: 'An unexpected error occurred. Please try again.' }, success: false };
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
        
        // Handle specific error types
        if (error.message?.includes('User already registered')) {
          return { error: { message: 'An account with this email already exists. Please try logging in instead.' }, success: false };
        } else if (error.message?.includes('Load failed') || error.name === 'AuthRetryableFetchError') {
          return { error: { message: 'Network connection failed. Please check your internet connection and try again.' }, success: false };
        } else {
          return { error: { message: error.message || 'Registration failed. Please try again.' }, success: false };
        }
      }

      console.log('Sign up successful for:', email);
      toast.success('Account created successfully! You can now log in.');
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Handle network errors
      if (error.name === 'AuthRetryableFetchError' || error.message?.includes('Load failed')) {
        return { error: { message: 'Network connection failed. Please check your internet connection and try again.' }, success: false };
      }
      
      return { error: { message: 'An unexpected error occurred. Please try again.' }, success: false };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setSession(null);
      toast.success('Logged out successfully.');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Error signing out. Please try again.');
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
