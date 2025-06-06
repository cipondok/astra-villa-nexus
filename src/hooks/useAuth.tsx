
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role: 'general_user' | 'property_owner' | 'agent' | 'vendor' | 'admin';
  company_name?: string;
  license_number?: string;
  verification_status: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrCreateProfile = async (userId: string, userEmail: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Try to fetch existing profile
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Profile not found, creating new profile for user:', userId);
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            role: 'general_user',
            verification_status: 'pending'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          return null;
        }
        
        console.log('Profile created successfully:', newProfile);
        return newProfile;
      } else if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        return null;
      }
      
      console.log('Profile fetched successfully:', profileData);
      return profileData;
    } catch (err) {
      console.error('Profile fetch/create error:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    console.log('Setting up auth state listener');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, !!session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchOrCreateProfile(session.user.id, session.user.email || '');
          if (mounted) {
            setProfile(profileData);
          }
        } else {
          if (mounted) {
            setProfile(null);
          }
        }
        
        // Always set loading to false after processing
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Get initial session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        console.log('Initial session:', !!session);
        // The onAuthStateChange will handle the session, but if no session, set loading false
        if (!session) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('=== SIGNUP ATTEMPT ===');
      console.log('Email:', email);
      console.log('UserData:', userData);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: String(userData.full_name || '').trim(),
            role: 'general_user'
          }
        }
      });

      console.log('Signup result:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Password must be at least 6 characters long.';
        }
        
        toast({
          title: "Sign up failed",
          description: errorMessage,
          variant: "destructive"
        });
      } else if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Sign up successful",
          description: "Please check your email to verify your account before signing in."
        });
      } else {
        toast({
          title: "Account created",
          description: "Your account has been created successfully!"
        });
      }

      return { error };
    } catch (err) {
      console.error('Unexpected signup error:', err);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting login with email:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        }
        
        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        console.log('Login successful');
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in."
        });
      }

      return { error };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated."
        });
      }

      return { error };
    } catch (err) {
      console.error('Profile update error:', err);
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile
    }}>
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
