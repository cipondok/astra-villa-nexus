
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

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Check if user is super admin by email
      if (userEmail === 'mycode103@gmail.com') {
        const adminProfile: Profile = {
          id: userId,
          email: userEmail,
          full_name: 'Admin',
          role: 'admin',
          verification_status: 'approved',
          is_admin: true
        };
        setProfile(adminProfile);
        return adminProfile;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found, create default profile
          console.log('Profile not found, creating default profile');
          const defaultProfile: Profile = {
            id: userId,
            email: userEmail || '',
            full_name: '',
            role: 'general_user',
            verification_status: 'pending'
          };
          
          // Try to insert the profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(defaultProfile);
            
          if (!insertError) {
            setProfile(defaultProfile);
            return defaultProfile;
          }
        }
        console.error('Error fetching profile:', error);
        return null;
      }

      console.log('Profile fetched successfully:', data);
      setProfile(data as Profile);
      return data as Profile;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('Manually refreshing profile for user:', user.email);
      await fetchProfile(user.id, user.email);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Get initial session first
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession && mounted) {
          console.log('Found initial session for:', initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id, initialSession.user.email);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email || 'No user');
        
        if (!mounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user && event !== 'TOKEN_REFRESHED') {
          await fetchProfile(currentSession.user.id, currentSession.user.email);
        } else if (!currentSession) {
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

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message || 'Login failed');
        return { error: error.message, success: false };
      }

      if (data.user) {
        console.log('Sign in successful for:', email);
        toast.success('Successfully logged in!');
        return { error: null, success: true };
      }

      return { error: 'Unknown error occurred', success: false };
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error('Login failed. Please try again.');
      return { error: error.message || 'An unexpected error occurred', success: false };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
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
        toast.error(error.message || 'Sign up failed');
        return { error: error.message, success: false };
      }

      console.log('Sign up successful for:', email);
      toast.success('Account created successfully!');
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error('Sign up failed. Please try again.');
      return { error: error.message || 'An unexpected error occurred', success: false };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
      }
      
      setUser(null);
      setProfile(null);
      setSession(null);
      
      toast.success('Successfully logged out');
      console.log('User signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      if (!user) return { error: 'No user found', success: false };

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
        return { error: error.message, success: false };
      }

      await fetchProfile(user.id, user.email);
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Update error:', error);
      return { error: error.message, success: false };
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
