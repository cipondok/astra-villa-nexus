import React, { useState, useEffect } from 'react';
import { AlertTriangle, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RESEND_COOLDOWN = 60; // seconds

export const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVerified, setIsVerified] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      setIsVerified(user.email_confirmed_at != null);
    }
  }, [user]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || !user?.email) return;
    setSending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });

      if (error) {
        toast({
          title: 'Failed to resend',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Verification email sent',
          description: 'Please check your inbox and spam folder.',
        });
        setResendCooldown(RESEND_COOLDOWN);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Unable to send verification email.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  if (isVerified || !user) return null;

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
      <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-destructive">
          Email not verified
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Please verify your email address to access all features. Check your inbox for a verification link.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={resendCooldown > 0 || sending}
        className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
      >
        {sending ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : (
          <Mail className="h-3.5 w-3.5 mr-1.5" />
        )}
        {resendCooldown > 0 ? `${resendCooldown}s` : 'Resend'}
      </Button>
    </div>
  );
};
