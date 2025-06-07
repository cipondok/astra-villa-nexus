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
  demoAgentLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { showError, showSuccess } = useAlert();

  console.log('AuthProvider rendering, loading:', loading, 'user:', user?.email);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (initialized) return;
      
      try {
        console.log('Initializing auth...');
        
        // Check for demo user first
        const demoUser = localStorage.getItem('demo_user');
        const demoAgent = localStorage.getItem('demo_agent');
        
        if (demoAgent) {
          console.log('Found demo agent, using demo mode');
          const mockUser = JSON.parse(demoAgent) as User;
          if (mounted) {
            setUser(mockUser);
            setProfile({
              id: mockUser.id,
              email: mockUser.email,
              full_name: mockUser.user_metadata?.full_name || 'Demo Agent',
              role: 'agent'
            });
            setLoading(false);
            setInitialized(true);
          }
          return;
        }
        
        if (demoUser) {
          console.log('Found demo user, using demo mode');
          const mockUser = JSON.parse(demoUser) as User;
          if (mounted) {
            setUser(mockUser);
            setProfile({
              id: mockUser.id,
              email: mockUser.email,
              full_name: mockUser.user_metadata?.full_name || 'Demo User',
              role: 'general_user'
            });
            setLoading(false);
            setInitialized(true);
          }
          return;
        }
        
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
          await fetchProfile(session.user.id);
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
            await fetchProfile(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          localStorage.removeItem('demo_user');
          localStorage.removeItem('demo_agent');
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          console.log('Profile not found, will be created on first update');
        }
        return;
      }

      console.log('Profile fetched:', data?.email);
      setProfile(data);
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const demoAgentLogin = () => {
    console.log('Demo agent login clicked');
    const mockAgent = {
      id: 'demo-agent-123',
      email: 'agent@astravilla.com',
      user_metadata: { full_name: 'Demo Agent' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      role: 'authenticated'
    };
    
    localStorage.setItem('demo_agent', JSON.stringify(mockAgent));
    localStorage.removeItem('demo_user'); // Remove regular demo user if exists
    
    setUser(mockAgent as User);
    setProfile({
      id: mockAgent.id,
      email: mockAgent.email,
      full_name: 'Demo Agent',
      role: 'agent'
    });
    
    showSuccess('Demo Agent Login', 'You are now logged in as a demo property agent.');
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        showError('Sign In Failed', error.message);
        return { error, success: false };
      }

      showSuccess('Welcome back!', 'You have been signed in successfully.');
      return { error: null, success: true };
    } catch (error: any) {
      showError('Sign In Error', error.message);
      return { error, success: false };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        showError('Sign Up Failed', error.message);
        return { error, success: false };
      }

      showSuccess('Account Created!', 'Please check your email to verify your account.');
      return { error: null, success: true };
    } catch (error: any) {
      showError('Sign Up Error', error.message);
      return { error, success: false };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('demo_user');
      localStorage.removeItem('demo_agent');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      showSuccess('Signed Out', 'You have been signed out successfully.');
    } catch (error: any) {
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
        showError('Update Failed', error.message);
        return { error, success: false };
      }

      await fetchProfile(user.id);
      showSuccess('Profile Updated', 'Your profile has been updated successfully.');
      return { error: null, success: true };
    } catch (error: any) {
      showError('Update Error', error.message);
      return { error, success: false };
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    demoAgentLogin,
  };

  console.log('AuthProvider providing value, loading:', loading, 'isAuthenticated:', !!user);

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
