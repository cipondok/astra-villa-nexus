import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Mail, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.object({
  newEmail: z.string().trim().email('Please enter a valid email address'),
});

export const EmailChange = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    const result = emailSchema.safeParse({ newEmail });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    if (newEmail === user?.email) {
      setError('New email must be different from current email');
      return;
    }

    setIsChanging(true);
    try {
      const redirectUrl = `${window.location.origin}/settings`;
      
      const { error: updateError } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: redirectUrl }
      );

      if (updateError) throw updateError;

      // Log the email change activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'email_change',
        activity_description: `Email change requested to ${newEmail}`,
        metadata: { new_email: newEmail, timestamp: new Date().toISOString() }
      });

      toast({
        title: "Verification Email Sent",
        description: "Please check both your old and new email addresses to confirm the change",
      });

      setNewEmail('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Card className="professional-card border-2 overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"></div>
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-base">Change Email</CardTitle>
            <CardDescription className="text-xs">Update your email address</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {/* Current Email Display */}
        <div className="mb-3 p-2.5 rounded-lg bg-muted/30 border border-border/50">
          <span className="text-xs font-medium text-muted-foreground">Current Email</span>
          <p className="text-sm font-semibold text-foreground mt-0.5 break-all">{user?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="newEmail" className="text-xs font-medium">New Email Address</Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                if (error) setError('');
              }}
              className={`h-9 text-sm ${error ? 'border-destructive' : ''}`}
              placeholder="Enter new email address"
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>

          {/* Info Notice */}
          <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-500/20">
            <div className="flex gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                You'll receive verification emails at both your current and new email addresses. 
                You must confirm the change from both emails.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isChanging || !newEmail}
            className="w-full h-9 text-sm"
          >
            {isChanging ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-background/30 border-t-background mr-2"></div>
                Sending...
              </>
            ) : (
              'Send Verification Email'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
