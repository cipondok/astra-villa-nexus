import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check for recovery event from URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setIsRecovery(true);
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const validatePassword = (pw: string): boolean => {
    const hasLength = pw.length >= 10;
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]~`]/.test(pw);
    return hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('Password must be at least 10 characters with uppercase, lowercase, number, and symbol.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      
      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        toast({
          title: 'Password updated!',
          description: 'Your password has been reset successfully.',
        });
        setTimeout(() => navigate('/auth'), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
        <SEOHead title="Reset Password — Astra Villa" description="Reset your Astra Villa account password." noIndex />
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">Invalid or Expired Link</h2>
            <p className="text-sm text-muted-foreground">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <SEOHead title="Reset Password — Astra Villa" description="Set a new password for your account." noIndex />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          {success ? (
            <>
              <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-chart-1/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-chart-1" />
              </div>
              <CardTitle className="text-xl text-foreground">Password Reset Successful!</CardTitle>
              <CardDescription>Redirecting you to login...</CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground">Set New Password</CardTitle>
              <CardDescription>Choose a strong password for your Astra Villa account</CardDescription>
            </>
          )}
        </CardHeader>

        {!success && (
          <CardContent>
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 10 characters"
                  required
                  minLength={10}
                  className="h-11"
                />
                <PasswordStrengthBar password={newPassword} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="h-11"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                  <p className="text-xs text-chart-1">✓ Passwords match</p>
                )}
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;
