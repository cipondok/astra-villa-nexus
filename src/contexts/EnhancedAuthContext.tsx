
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';

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

const EnhancedAuthContext = createContext<AuthContextType | undefined>(undefined);

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [session, setSession] = React.useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = React.useState(false);
  
  const { showSuccess, showError, showWarning, showInfo } = useAlert();

  console.log('EnhancedAuth - user:', user?.email, 'loading:', loading, 'profile role:', profile?.role);

  // Enhanced session tracking - simplified to prevent blocking
  const trackUserSession = async (userId: string, action: 'login' | 'logout') => {
    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      if (action === 'login') {
        // Create device fingerprint for session tracking
        const fingerprint = btoa(JSON.stringify({
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform
        }));
        localStorage.setItem('device_fingerprint', fingerprint);

        // Check for existing active sessions - non-blocking
        try {
          const { data: existingSessions } = await supabase
            .from('user_device_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

          if (existingSessions && existingSessions.length > 0) {
            showWarning(
              "Multiple Login Detected",
              `You are already logged in on ${existingSessions.length} other device(s). For security, please log out from unused devices.`
            );
          }
        } catch (err) {
          console.error('Session check error:', err);
        }

        // Create new session record - non-blocking
        try {
          await supabase
            .from('user_device_sessions')
            .insert({
              user_id: userId,
              device_info: deviceInfo,
              device_fingerprint: fingerprint,
              session_token: crypto.randomUUID(),
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            });
        } catch (err) {
          console.error('Session create error:', err);
        }
      }
    } catch (error) {
      console.error('Session tracking error:', error);
    }
  };

  const fetchProfile = async (userId: string, showGreeting = false) => {
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
        
        if (showGreeting) {
          showSuccess(
            "Welcome back, Admin!",
            "Successfully logged in with administrator privileges."
          );
        }
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
        
        if (showGreeting) {
          showSuccess(
            "Welcome back, Vendor!",
            "Successfully logged in to your vendor dashboard."
          );
        }
        return;
      }
      
      // Fast query with timeout for regular users
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 3000)
      );

      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

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
          
          if (showGreeting) {
            showSuccess(
              "Welcome to AstraVilla!",
              "Your account has been created successfully. Complete your profile to get started."
            );
          }
          return;
        }
        
        console.error('Error fetching profile:', error);
        // Don't show error to user immediately, create default profile
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

      console.log('Profile fetched successfully:', data);
      setProfile(data as Profile);
      setLoading(false);
      
      if (showGreeting) {
        const greeting = getGreetingMessage(data.full_name || 'User');
        showSuccess(
          `${greeting}, ${data.full_name || 'User'}!`,
          "Successfully logged in to your account."
        );
      }
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      
      // Create fallback profile instead of showing error
      const { data: authUser } = await supabase.auth.getUser();
      const fallbackProfile: Profile = {
        id: userId,
        email: authUser.user?.email || '',
        full_name: authUser.user?.user_metadata?.full_name || 'User',
        role: 'general_user',
        verification_status: 'pending'
      };
      setProfile(fallbackProfile);
      setLoading(false);
    }
  };

  const getGreetingMessage = (name: string) => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
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
        showWarning(
          "Session Warning",
          "Your session will expire soon. Please save your work and refresh the page if needed."
        );
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
    
    console.log('Initializing enhanced auth state...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event !== 'TOKEN_REFRESHED') {
          setLoading(true);
          const showGreeting = event === 'SIGNED_IN';
          await fetchProfile(session.user.id, showGreeting);
          
          if (event === 'SIGNED_IN') {
            await trackUserSession(session.user.id, 'login');
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
          
          showInfo(
            "Logged Out",
            "You have been successfully logged out. Thank you for using AstraVilla!"
          );
        }
        
        setSessionChecked(true);
      }
    );

    // Get initial session
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
      setSessionChecked(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Enhanced auto-extend session with better error handling
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
          lastExtension = now;
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
      console.log('Attempting enhanced sign in for:', email);
      setLoading(true);
      
      if (!email || !password) {
        showError(
          "Missing Information",
          "Please enter both email and password to continue."
        );
        setLoading(false);
        return { error: new Error('Email and password are required'), success: false };
      }

      if (!email.includes('@')) {
        showError(
          "Invalid Email",
          "Please enter a valid email address."
        );
        setLoading(false);
        return { error: new Error('Invalid email format'), success: false };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        setLoading(false);
        
        let errorTitle = "Login Failed";
        let errorMessage = "Please check your credentials and try again.";
        
        if (error.message.includes('Invalid login credentials')) {
          errorTitle = "Invalid Credentials";
          errorMessage = "The email or password you entered is incorrect. Please double-check and try again.";
        } else if (error.message.includes('Email not confirmed')) {
          errorTitle = "Email Not Verified";
          errorMessage = "Please check your email and click the verification link before logging in.";
        } else if (error.message.includes('Too many requests')) {
          errorTitle = "Too Many Attempts";
          errorMessage = "Too many login attempts. Please wait a few minutes before trying again.";
        } else if (error.message.includes('network')) {
          errorTitle = "Connection Error";
          errorMessage = "Please check your internet connection and try again.";
        }
        
        showError(errorTitle, errorMessage);
        return { error, success: false };
      }

      console.log('Sign in successful for:', email);
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      setLoading(false);
      
      showError(
        "Unexpected Error",
        "An unexpected error occurred. Please try again or contact support if the problem persists."
      );
      return { error, success: false };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Attempting enhanced sign up for:', email);
      setLoading(true);
      
      if (!email || !password || !fullName) {
        showError(
          "Missing Information",
          "Please fill in all required fields to create your account."
        );
        setLoading(false);
        return { error: new Error('All fields are required'), success: false };
      }

      if (password.length < 6) {
        showError(
          "Weak Password",
          "Password must be at least 6 characters long for security."
        );
        setLoading(false);
        return { error: new Error('Password too short'), success: false };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim()
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        setLoading(false);
        
        let errorTitle = "Registration Failed";
        let errorMessage = "Please try again or contact support.";
        
        if (error.message.includes('already registered')) {
          errorTitle = "Account Exists";
          errorMessage = "An account with this email already exists. Please try logging in instead.";
        } else if (error.message.includes('rate limit exceeded')) {
          errorTitle = "Too Many Attempts";
          errorMessage = "Too many registration attempts. Please wait a few minutes before trying again.";
        } else if (error.message.includes('invalid email')) {
          errorTitle = "Invalid Email";
          errorMessage = "Please enter a valid email address.";
        }
        
        showError(errorTitle, errorMessage);
        return { error, success: false };
      }

      console.log('Sign up successful for:', email);
      
      showSuccess(
        "Account Created!",
        "Welcome to AstraVilla! Please check your email to verify your account."
      );
      
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      setLoading(false);
      
      showError(
        "Registration Error",
        "An unexpected error occurred during registration. Please try again."
      );
      return { error, success: false };
    }
  };

  const signOut = async () => {
    try {
      console.log('Enhanced logout initiated...');
      
      // Track logout
      if (user?.id) {
        await trackUserSession(user.id, 'logout');
      }
      
      // Clear state immediately for instant UI update
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      
      // Clear storage immediately
      localStorage.clear();
      sessionStorage.clear();
      
      // Supabase sign out in background
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Background sign out error:', error);
      }
      
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
      if (!user) {
        showError("Update Failed", "You must be logged in to update your profile.");
        return { error: new Error('No user found'), success: false };
      }

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
        showError(
          "Update Failed",
          "Failed to update your profile. Please try again."
        );
        return { error, success: false };
      }

      await fetchProfile(user.id);
      showSuccess(
        "Profile Updated",
        "Your profile has been successfully updated."
      );
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Update error:', error);
      showError(
        "Update Error",
        "An unexpected error occurred while updating your profile."
      );
      return { error, success: false };
    }
  };

  const isAuthenticated = !!user && !!session && sessionChecked;

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
    extendSession,
  };

  return (
    <EnhancedAuthContext.Provider value={value}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};
